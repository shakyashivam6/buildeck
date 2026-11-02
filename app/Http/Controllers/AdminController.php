<?php

namespace App\Http\Controllers;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductUomPrice;
use App\Models\SubCategory;
use App\Models\UnitOfMeasure;
use App\Models\User;
use App\Models\VendorProfile;
use Inertia\Inertia;
use Inertia\Response;

class AdminController extends Controller
{
    /**
     * Display the dynamic BuilDeck Admin Dashboard.
     */
    public function dashboard(): Response
    {
        $totalProducts = Product::count();
        $activeProducts = Product::where('is_active', true)->count();
        $totalCategories = Category::count();
        $totalSubCategories = SubCategory::count();
        $totalBrands = Brand::count();
        $totalUoms = UnitOfMeasure::count();
        $totalVendors = VendorProfile::count() ?: User::where('role', 'vendor')->count();
        $totalCustomers = User::where('role', 'customer')->count();
        $totalUsers = User::count();

        // Loose sale & pricing matrix counts
        $looseSaleProducts = ProductUomPrice::where('allow_loose_sale', true)->distinct('product_id')->count();
        $totalPricingTiers = ProductUomPrice::count();

        // Categories breakdown for chart
        $categoriesWithCounts = Category::withCount('products')
            ->orderByDesc('products_count')
            ->get();

        $categoryChartLabels = $categoriesWithCounts->pluck('name')->all();
        $categoryChartSeries = $categoriesWithCounts->pluck('products_count')->all();

        // Top Brands with product count
        $topBrands = Brand::withCount('products')
            ->orderByDesc('products_count')
            ->take(6)
            ->get()
            ->map(fn(Brand $b) => [
                'id' => $b->id,
                'name' => $b->name,
                'count' => $b->products_count,
                'is_approved_master' => (bool) $b->is_approved_master,
            ]);

        // Recent Products Added
        $recentProducts = Product::with([
            'subCategory.category',
            'brand',
            'baseUom',
            'uomPrices.uom',
        ])
            ->latest()
            ->take(6)
            ->get()
            ->map(function (Product $p) {
                $basePriceRecord = $p->uomPrices->firstWhere('uom_id', $p->base_uom_id)
                    ?? $p->uomPrices->first();

                return [
                    'id' => $p->id,
                    'name' => $p->name,
                    'sku' => $p->sku,
                    'category' => $p->subCategory?->category?->name ?? 'General',
                    'sub_category' => $p->subCategory?->name ?? 'N/A',
                    'brand' => $p->brand?->name ?? 'Generic',
                    'base_uom_code' => $p->baseUom?->code ?? '',
                    'base_uom_name' => $p->baseUom?->name ?? '',
                    'base_price' => $basePriceRecord ? (float) $basePriceRecord->selling_price : null,
                    'allow_loose' => $basePriceRecord ? (bool) $basePriceRecord->allow_loose_sale : false,
                    'cover_image_url' => $p->cover_image_url,
                    'is_active' => (bool) $p->is_active,
                    'created_at' => $p->created_at?->format('d M Y') ?? 'N/A',
                ];
            });

        // Recent System Users & Onboarded Accounts
        $recentUsers = User::latest()
            ->take(6)
            ->get()
            ->map(fn(User $u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'mobile' => $u->mobile,
                'role' => $u->role ?? 'admin',
                'status' => $u->status ?? 'active',
                'created_at' => $u->created_at?->format('d M Y') ?? 'N/A',
            ]);

        // UOM categories breakdown
        $uomTypes = UnitOfMeasure::selectRaw('unit_category, count(*) as count')
            ->groupBy('unit_category')
            ->pluck('count', 'unit_category')
            ->all();

        $stats = [
            'total_products' => $totalProducts,
            'active_products' => $activeProducts,
            'total_categories' => $totalCategories,
            'total_sub_categories' => $totalSubCategories,
            'total_brands' => $totalBrands,
            'total_uoms' => $totalUoms,
            'total_vendors' => $totalVendors,
            'total_customers' => $totalCustomers,
            'total_users' => $totalUsers,
            'loose_sale_products' => $looseSaleProducts,
            'total_pricing_tiers' => $totalPricingTiers,
            'category_chart' => [
                'labels' => $categoryChartLabels,
                'series' => $categoryChartSeries,
            ],
            'top_brands' => $topBrands,
            'recent_products' => $recentProducts,
            'recent_users' => $recentUsers,
            'uom_types' => $uomTypes,
        ];

        return Inertia::render('Admin/Dashboard', [
            'stats' => $stats,
        ]);
    }
}
