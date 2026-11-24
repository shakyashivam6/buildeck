<?php

namespace App\Services;

use App\Models\Product;
use App\Models\VendorProfile;
use App\Models\VendorProduct;
use Illuminate\Support\Collection;

class CustomerCatalogService
{
    /**
     * Parse coordinates from separate lat/long or combined latlong string.
     * Example latlong: "(26.38967,80.48587346)" or "26.38967,80.48587346"
     *
     * @return array{lat: float, long: float}|null
     */
    public static function parseCoordinates(mixed $lat, mixed $long, ?string $latlong = null): ?array
    {
        if ($lat !== null && $long !== null && is_numeric($lat) && is_numeric($long)) {
            return [
                'lat' => (float) $lat,
                'long' => (float) $long,
            ];
        }

        if (! empty($latlong)) {
            $cleaned = trim($latlong, "() \t\n\r\0\x0B");
            $parts = explode(',', $cleaned);
            if (count($parts) === 2 && is_numeric(trim($parts[0])) && is_numeric(trim($parts[1]))) {
                return [
                    'lat' => (float) trim($parts[0]),
                    'long' => (float) trim($parts[1]),
                ];
            }
        }

        return null;
    }

    /**
     * Calculate Great-Circle distance between two coordinates in kilometers using Haversine formula.
     */
    public static function haversineDistance(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $earthRadius = 6371.0; // Earth's mean radius in kilometers
        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);

        $a = sin($dLat / 2) * sin($dLat / 2) +
            cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
            sin($dLon / 2) * sin($dLon / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return round($earthRadius * $c, 2);
    }

    /**
     * Get active & approved vendors serving the customer's location.
     *
     * @return Collection<int, VendorProfile>
     */
    public function getNearbyVendors(?float $customerLat, ?float $customerLong, float $defaultRadius = 25.0): Collection
    {
        $query = VendorProfile::where('status', 'approved')
            ->whereNotNull('lat')
            ->whereNotNull('long');

        if ($customerLat === null || $customerLong === null) {
            // If coordinates are not provided, return all approved vendors with distance as null
            return $query->get()->map(function ($vendor) {
                $vendor->distance_km = null;
                return $vendor;
            });
        }

        // Bounding box pre-filter for performance
        $maxRadius = 100.0;
        $latDelta = $maxRadius / 111.0;
        $cosLat = cos(deg2rad($customerLat));
        $longDelta = $maxRadius / (111.0 * ($cosLat != 0 ? abs($cosLat) : 1));

        $vendors = $query->whereBetween('lat', [$customerLat - abs($latDelta), $customerLat + abs($latDelta)])
            ->whereBetween('long', [$customerLong - abs($longDelta), $customerLong + abs($longDelta)])
            ->get();

        return $vendors->filter(function ($vendor) use ($customerLat, $customerLong, $defaultRadius) {
            $distance = self::haversineDistance($customerLat, $customerLong, (float) $vendor->lat, (float) $vendor->long);
            $vendor->distance_km = $distance;

            $allowedRadius = (float) ($vendor->supply_radius && (float) $vendor->supply_radius > 0
                ? $vendor->supply_radius
                : $defaultRadius);

            return $distance <= $allowedRadius;
        })->sortBy('distance_km')->values();
    }

    /**
     * Get distinct master products available across nearby vendors.
     * Returns minimal card format: id, name, brand_name, cover_image_url, base_uom, available_vendors_count, starting_price.
     *
     * @return array<int, array<string, mixed>>
     */
    public function getNearbyItems(
        ?float $customerLat,
        ?float $customerLong,
        ?int $categoryId = null,
        ?string $search = null
    ): array {
        $vendors = $this->getNearbyVendors($customerLat, $customerLong);
        $vendorIds = $vendors->pluck('id')->all();

        if (empty($vendorIds)) {
            return [];
        }

        // Fetch vendor products that are marked available and have positive stock
        $vendorProducts = VendorProduct::with(['product.brand', 'product.baseUom', 'product.subCategory'])
            ->whereIn('vendor_id', $vendorIds)
            ->where('is_available', true)
            ->where('stock', '>', 0)
            ->when($search, function ($query, $term) {
                $query->whereHas('product', function ($pQuery) use ($term) {
                    $pQuery->where('name', 'like', "%{$term}%")
                        ->orWhereHas('brand', function ($bQuery) use ($term) {
                            $bQuery->where('name', 'like', "%{$term}%");
                        });
                });
            })
            ->when($categoryId, function ($query, $catId) {
                $query->whereHas('product.subCategory', function ($scQuery) use ($catId) {
                    $scQuery->where('category_id', $catId);
                });
            })
            ->get();

        $grouped = $vendorProducts->groupBy('product_id');
        $items = [];

        foreach ($grouped as $productId => $vpGroup) {
            $firstVp = $vpGroup->first();
            $product = $firstVp->product;

            if (! $product || ! $product->is_active) {
                continue;
            }

            $availableVendorsCount = $vpGroup->pluck('vendor_id')->unique()->count();
            $startingPrice = (float) $vpGroup->min('amount');

            $items[] = [
                'id' => $product->id,
                'name' => $product->name,
                'brand_name' => $product->brand?->name ?? '',
                'cover_image_url' => $product->cover_image_url,
                'base_uom' => $product->baseUom?->name ?? '',
                'base_uom_symbol' => $product->baseUom?->symbol ?? '',
                'available_vendors_count' => $availableVendorsCount,
                'starting_price' => round($startingPrice, 2),
            ];
        }

        return $items;
    }

    /**
     * Get complete product details with all nearby vendors supplying this product in customer's area.
     *
     * @return array<string, mixed>|null
     */
    public function getItemDetailsWithNearbyVendors(int $productId, ?float $customerLat, ?float $customerLong): ?array
    {
        $product = Product::with(['brand', 'baseUom', 'subCategory.category', 'uomPrices.uom'])
            ->where('is_active', true)
            ->find($productId);

        if (! $product) {
            return null;
        }

        $vendors = $this->getNearbyVendors($customerLat, $customerLong);
        $vendorMap = $vendors->keyBy('id');
        $vendorIds = $vendors->pluck('id')->all();

        $vendorProducts = VendorProduct::with(['vendor', 'uomPrices'])
            ->where('product_id', $productId)
            ->whereIn('vendor_id', $vendorIds)
            ->where('is_available', true)
            ->get();

        $nearbyVendors = [];
        foreach ($vendorProducts as $vp) {
            $vendor = $vendorMap->get($vp->vendor_id) ?? $vp->vendor;
            if (! $vendor) {
                continue;
            }

            // Check if loose sale is allowed in vendor UOM overrides or master UOM rules
            $allowsLooseSale = $vp->uomPrices->contains('allow_loose_sale', true)
                || $product->uomPrices->contains('allow_loose_sale', true);

            $nearbyVendors[] = [
                'vendor_id' => $vendor->id,
                'vendor_name' => $vendor->vendor_name,
                'owner_name' => $vendor->owner_name,
                'address' => $vendor->address,
                'distance_km' => $vendor->distance_km ?? null,
                'available_stock' => (float) $vp->stock,
                'is_in_stock' => (float) $vp->stock > 0,
                'starting_price' => round((float) $vp->amount, 2),
                'allows_loose_sale' => (bool) $allowsLooseSale,
                'rating' => 4.5,
            ];
        }

        // Sort vendors: nearest first
        usort($nearbyVendors, function ($a, $b) {
            if ($a['distance_km'] === null) {
                return 1;
            }
            if ($b['distance_km'] === null) {
                return -1;
            }
            return $a['distance_km'] <=> $b['distance_km'];
        });

        return [
            'product' => [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'sku' => $product->sku,
                'brand' => $product->brand ? [
                    'id' => $product->brand->id,
                    'name' => $product->brand->name,
                    'logo_url' => $product->brand->logo_url,
                ] : null,
                'category' => $product->subCategory?->category ? [
                    'id' => $product->subCategory->category->id,
                    'name' => $product->subCategory->category->name,
                ] : null,
                'sub_category' => $product->subCategory ? [
                    'id' => $product->subCategory->id,
                    'name' => $product->subCategory->name,
                ] : null,
                'cover_image_url' => $product->cover_image_url,
                'gallery_image_urls' => $product->gallery_image_urls,
                'base_uom' => $product->baseUom?->name,
                'base_uom_symbol' => $product->baseUom?->symbol,
                'description' => $product->description,
                'specifications' => $product->specifications,
            ],
            'nearby_vendors' => $nearbyVendors,
        ];
    }
}
