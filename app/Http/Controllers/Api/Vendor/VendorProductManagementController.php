<?php

namespace App\Http\Controllers\Api\Vendor;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Vendor\AddStockRequest;
use App\Http\Requests\Api\Vendor\AddToInventoryRequest;
use App\Http\Requests\Api\Vendor\UpdateVendorProductRequest;
use App\Models\Product;
use App\Models\VendorProduct;
use App\Models\VendorProductUom;
use App\Models\VendorProfile;
use App\Models\VendorStockLedger;
use App\Services\Inventory\VendorStockService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VendorProductManagementController extends Controller
{
    /**
     * Get the authenticated user's approved vendor profile.
     */
    protected function getVendorProfile(Request $request): ?VendorProfile
    {
        $user = $request->user();
        if (! $user) {
            return null;
        }

        $vendorProfile = $user->vendorProfile;
        if (! $vendorProfile || $vendorProfile->status !== 'approved') {
            return null;
        }

        return $vendorProfile;
    }

    /**
     * Standard JSON error response helper.
     */
    protected function errorResponse(string $message, int $statusCode = 422, mixed $data = []): JsonResponse
    {
        return response()->json([
            'auth_status' => true,
            'res' => 'error',
            'msg' => $message,
            'token_type' => 'Bearer',
            'data' => $data,
        ], $statusCode);
    }

    /**
     * Standard JSON success response helper.
     */
    protected function successResponse(string $message, mixed $data = [], int $statusCode = 200): JsonResponse
    {
        return response()->json([
            'auth_status' => true,
            'res' => 'success',
            'msg' => $message,
            'token_type' => 'Bearer',
            'data' => $data,
        ], $statusCode);
    }

    /**
     * Browse Master Catalog (Products added by Admin).
     *
     * GET /api/vendor/products/catalog
     */
    public function catalog(Request $request): JsonResponse
    {
        $vendor = $this->getVendorProfile($request);
        if (! $vendor) {
            return $this->errorResponse('Unauthorized vendor account or account pending approval.', 403);
        }

        $query = Product::with([
            'subCategory.category',
            'brand',
            'baseUom',
            'defaultUomPrice.uom',
            'uomPrices.uom',
        ])->where('is_active', true);

        // Filter by Sub-Category
        if ($request->filled('sub_category_id')) {
            $query->where('sub_category_id', $request->integer('sub_category_id'));
        }

        // Filter by Category
        if ($request->filled('category_id')) {
            $categoryId = $request->integer('category_id');
            $query->whereHas('subCategory', function ($q) use ($categoryId) {
                $q->where('category_id', $categoryId);
            });
        }

        // Filter by Brand
        if ($request->filled('brand_id')) {
            $query->where('brand_id', $request->integer('brand_id'));
        }

        // Search by Name or SKU
        if ($request->filled('search')) {
            $search = $request->string('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        $perPage = min(max($request->integer('per_page', 15), 1), 100);
        $products = $query->latest()->paginate($perPage);

        // Get IDs of products already added by this vendor
        $addedProductIds = VendorProduct::where('vendor_id', $vendor->id)
            ->pluck('product_id')
            ->toArray();

        $transformedData = $products->getCollection()->map(function (Product $product) use ($addedProductIds) {
            return [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'sku' => $product->sku,
                'category' => $product->subCategory?->category?->name,
                'sub_category' => $product->subCategory?->name,
                'brand' => $product->brand?->name,
                'base_uom' => [
                    'id' => $product->baseUom?->id,
                    'name' => $product->baseUom?->name,
                    'code' => $product->baseUom?->code,
                    'symbol' => $product->baseUom?->symbol,
                ],
                'cover_image_url' => $product->cover_image_url,
                'gallery_image_urls' => $product->gallery_image_urls,
                'description' => $product->description,
                'specifications' => $product->specifications,
                'packing_rule_desc' => $product->packing_rule_desc,
                'admin_default_price' => $product->defaultUomPrice ? [
                    'selling_price' => (float) $product->defaultUomPrice->selling_price,
                    'mrp' => (float) $product->defaultUomPrice->mrp,
                    'uom' => $product->defaultUomPrice->uom?->name,
                ] : null,
                'is_already_added' => in_array($product->id, $addedProductIds, true),
            ];
        });

        $products->setCollection($transformedData);

        return $this->successResponse('Master catalog fetched successfully.', $products);
    }

    /**
     * View Vendor's Own Inventory (With live stock and selling amount).
     *
     * GET /api/vendor/products/my-inventory
     */
    public function myInventory(Request $request): JsonResponse
    {
        $vendor = $this->getVendorProfile($request);
        if (! $vendor) {
            return $this->errorResponse('Unauthorized vendor account or account pending approval.', 403);
        }

        $query = VendorProduct::with([
            'product.subCategory.category',
            'product.brand',
            'product.baseUom',
            'product.defaultUomPrice.uom',
            'product.uomPrices.uom',
            'uomPrices.uom',
        ])->where('vendor_id', $vendor->id);

        // Search by Product Name or SKU
        if ($request->filled('search')) {
            $search = $request->string('search');
            $query->whereHas('product', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        // Availability filter
        if ($request->filled('is_available')) {
            $query->where('is_available', $request->boolean('is_available'));
        }

        // Stock status filter
        if ($request->filled('stock_status')) {
            if ($request->string('stock_status') === 'in_stock') {
                $query->where('stock', '>', 0);
            } elseif ($request->string('stock_status') === 'out_of_stock') {
                $query->where('stock', '<=', 0);
            }
        }

        $perPage = min(max($request->integer('per_page', 15), 1), 100);
        $vendorProducts = $query->latest()->paginate($perPage);

        $transformedData = $vendorProducts->getCollection()->map(function (VendorProduct $vp) {
            $product = $vp->product;

            return [
                'vendor_product_id' => $vp->id,
                'product_id' => $vp->product_id,
                'name' => $product?->name,
                'sku' => $product?->sku,
                'category' => $product?->subCategory?->category?->name,
                'sub_category' => $product?->subCategory?->name,
                'brand' => $product?->brand?->name,
                'base_uom' => $product?->baseUom?->name,
                'base_uom_symbol' => $product?->baseUom?->symbol,
                'cover_image_url' => $product?->cover_image_url,
                'stock' => (float) $vp->stock,
                'amount' => (float) $vp->amount,
                'mrp' => (float) $vp->mrp,
                'min_order_qty' => (float) $vp->min_order_qty,
                'is_available' => (bool) $vp->is_available,
                'uom_prices' => $vp->uomPrices->map(fn ($up) => [
                    'id' => $up->id,
                    'uom_id' => $up->uom_id,
                    'uom_name' => $up->uom?->name,
                    'uom_symbol' => $up->uom?->symbol,
                    'conversion_factor' => (float) $up->conversion_factor,
                    'selling_price' => (float) $up->selling_price,
                    'mrp' => $up->mrp ? (float) $up->mrp : null,
                    'allow_loose_sale' => (bool) $up->allow_loose_sale,
                    'min_order_qty' => (float) $up->min_order_qty,
                    'step_qty' => (float) $up->step_qty,
                    'pack_contain_qty' => $up->pack_contain_qty ? (float) $up->pack_contain_qty : null,
                    'is_default_selling_unit' => (bool) $up->is_default_selling_unit,
                ]),
                'updated_at' => $vp->updated_at?->toIso8601String(),
            ];
        });

        $vendorProducts->setCollection($transformedData);

        return $this->successResponse('Vendor inventory fetched successfully.', $vendorProducts);
    }

    /**
     * Add a master product to vendor's inventory.
     *
     * POST /api/vendor/products/add-to-inventory
     */
    public function addToInventory(AddToInventoryRequest $request): JsonResponse
    {
        $vendor = $this->getVendorProfile($request);
        if (! $vendor) {
            return $this->errorResponse('Unauthorized vendor account or account pending approval.', 403);
        }

        $productId = $request->integer('product_id');

        // Check if already in inventory (including soft deleted)
        $existing = VendorProduct::withTrashed()
            ->where('vendor_id', $vendor->id)
            ->where('product_id', $productId)
            ->first();

        if ($existing && ! $existing->trashed()) {
            return $this->errorResponse('This product is already in your inventory. You can update its stock or price.', 409);
        }

        $stock = (float) $request->input('stock', 0);
        $amount = (float) $request->input('amount');
        $mrp = $request->filled('mrp') ? (float) $request->input('mrp') : null;
        $minOrderQty = $request->filled('min_order_qty') ? (float) $request->input('min_order_qty') : 1.00;

        if ($existing && $existing->trashed()) {
            $existing->restore();
            $existing->update([
                'stock' => $stock,
                'amount' => $amount,
                'mrp' => $mrp,
                'min_order_qty' => $minOrderQty,
                'is_available' => $stock > 0,
            ]);
            $vendorProduct = $existing;
        } else {
            $vendorProduct = VendorProduct::create([
                'vendor_id' => $vendor->id,
                'product_id' => $productId,
                'stock' => $stock,
                'amount' => $amount,
                'mrp' => $mrp,
                'min_order_qty' => $minOrderQty,
                'is_available' => $stock > 0,
            ]);
        }

        // Save Vendor UOM Prices if passed, or create default
        $pricingMatrix = $request->input('pricing_matrix', $request->input('uom_prices', []));
        if (! empty($pricingMatrix) && is_array($pricingMatrix)) {
            $vendorProduct->uomPrices()->delete();
            foreach ($pricingMatrix as $pRow) {
                VendorProductUom::create([
                    'vendor_product_id' => $vendorProduct->id,
                    'uom_id' => $pRow['uom_id'],
                    'conversion_factor' => $pRow['conversion_factor'] ?? 1.0000,
                    'selling_price' => $pRow['selling_price'],
                    'mrp' => ! empty($pRow['mrp']) ? $pRow['mrp'] : null,
                    'allow_loose_sale' => ! empty($pRow['allow_loose_sale']),
                    'min_order_qty' => $pRow['min_order_qty'] ?? 1.00,
                    'step_qty' => $pRow['step_qty'] ?? 1.00,
                    'pack_contain_qty' => ! empty($pRow['pack_contain_qty']) ? $pRow['pack_contain_qty'] : null,
                    'is_default_selling_unit' => ! empty($pRow['is_default_selling_unit']),
                    'is_active' => true,
                ]);
            }
        } else {
            $product = Product::find($productId);
            if ($product) {
                VendorProductUom::updateOrCreate(
                    [
                        'vendor_product_id' => $vendorProduct->id,
                        'uom_id' => $product->base_uom_id,
                    ],
                    [
                        'conversion_factor' => 1.0000,
                        'selling_price' => $amount,
                        'mrp' => $mrp,
                        'allow_loose_sale' => true,
                        'min_order_qty' => $minOrderQty,
                        'step_qty' => 1.00,
                        'is_default_selling_unit' => true,
                        'is_active' => true,
                    ]
                );
            }
        }

        // Record Initial Opening Stock Ledger Entry
        if ($stock > 0) {
            VendorStockService::initializeOpeningStock(
                $vendorProduct,
                $stock,
                $request->string('notes') ?: 'Initial opening stock',
                $request->user()->id
            );
        }

        $vendorProduct->load('product.baseUom');

        return $this->successResponse('Product successfully added to your inventory.', [
            'vendor_product_id' => $vendorProduct->id,
            'product_id' => $vendorProduct->product_id,
            'product_name' => $vendorProduct->product?->name,
            'stock' => (float) $vendorProduct->stock,
            'amount' => (float) $vendorProduct->amount,
            'mrp' => (float) $vendorProduct->mrp,
            'base_uom' => $vendorProduct->product?->baseUom?->name,
            'is_available' => (bool) $vendorProduct->is_available,
        ], 201);
    }

    /**
     * Update stock and amount for a vendor product.
     *
     * PUT /api/vendor/products/{id}/update
     */
    public function updateStockAndAmount(UpdateVendorProductRequest $request, int $id): JsonResponse
    {
        $vendor = $this->getVendorProfile($request);
        if (! $vendor) {
            return $this->errorResponse('Unauthorized vendor account or account pending approval.', 403);
        }

        $vendorProduct = VendorProduct::where('vendor_id', $vendor->id)->find($id);
        if (! $vendorProduct) {
            return $this->errorResponse('Vendor product not found in your inventory.', 404);
        }

        $vendorProduct->amount = (float) $request->input('amount');
        if ($request->filled('mrp')) {
            $vendorProduct->mrp = (float) $request->input('mrp');
        }
        if ($request->filled('min_order_qty')) {
            $vendorProduct->min_order_qty = (float) $request->input('min_order_qty');
        }

        // Sync Vendor UOM Pricing Matrix if provided
        $pricingMatrix = $request->input('pricing_matrix', $request->input('uom_prices'));
        if (! empty($pricingMatrix) && is_array($pricingMatrix)) {
            $defaultRow = collect($pricingMatrix)->firstWhere('is_default_selling_unit', true) ?? $pricingMatrix[0];
            $vendorProduct->amount = (float) $defaultRow['selling_price'];
            if (! empty($defaultRow['mrp'])) {
                $vendorProduct->mrp = (float) $defaultRow['mrp'];
            }
            if (! empty($defaultRow['min_order_qty'])) {
                $vendorProduct->min_order_qty = (float) $defaultRow['min_order_qty'];
            }

            $vendorProduct->uomPrices()->delete();
            foreach ($pricingMatrix as $pRow) {
                VendorProductUom::create([
                    'vendor_product_id' => $vendorProduct->id,
                    'uom_id' => $pRow['uom_id'],
                    'conversion_factor' => $pRow['conversion_factor'] ?? 1.0000,
                    'selling_price' => $pRow['selling_price'],
                    'mrp' => ! empty($pRow['mrp']) ? $pRow['mrp'] : null,
                    'allow_loose_sale' => ! empty($pRow['allow_loose_sale']),
                    'min_order_qty' => $pRow['min_order_qty'] ?? 1.00,
                    'step_qty' => $pRow['step_qty'] ?? 1.00,
                    'pack_contain_qty' => ! empty($pRow['pack_contain_qty']) ? $pRow['pack_contain_qty'] : null,
                    'is_default_selling_unit' => ! empty($pRow['is_default_selling_unit']),
                    'is_active' => true,
                ]);
            }
        }

        $vendorProduct->save();

        // If target stock is explicitly provided and different from current stock, perform audit adjustment
        if ($request->filled('stock')) {
            $targetStock = (float) $request->input('stock');
            if (round($targetStock, 2) !== round((float) $vendorProduct->stock, 2)) {
                try {
                    $vendorProduct = VendorStockService::adjustToTargetStock(
                        $vendorProduct->id,
                        $targetStock,
                        $request->string('reason') ?: 'Manual stock adjustment by vendor',
                        $request->user()->id
                    );
                } catch (Exception $e) {
                    return $this->errorResponse($e->getMessage(), 400);
                }
            }
        }

        return $this->successResponse('Product stock and amount updated successfully.', [
            'vendor_product_id' => $vendorProduct->id,
            'product_id' => $vendorProduct->product_id,
            'stock' => (float) $vendorProduct->stock,
            'amount' => (float) $vendorProduct->amount,
            'mrp' => (float) $vendorProduct->mrp,
            'is_available' => (bool) $vendorProduct->is_available,
        ]);
    }

    /**
     * Quick stock arrival / inward addition.
     *
     * POST /api/vendor/products/{id}/add-stock
     */
    public function addStock(AddStockRequest $request, int $id): JsonResponse
    {
        $vendor = $this->getVendorProfile($request);
        if (! $vendor) {
            return $this->errorResponse('Unauthorized vendor account or account pending approval.', 403);
        }

        $vendorProduct = VendorProduct::where('vendor_id', $vendor->id)->find($id);
        if (! $vendorProduct) {
            return $this->errorResponse('Vendor product not found in your inventory.', 404);
        }

        $quantity = (float) $request->input('quantity_to_add');
        $reference = $request->string('challan_or_invoice_no') ?: 'INWARD';
        $notes = $request->string('notes') ?: 'Shipment/purchase stock inward';

        try {
            $updatedProduct = VendorStockService::recordMovement(
                $vendorProduct->id,
                'stock_inward',
                'inward',
                $quantity,
                $reference,
                $notes,
                $request->user()->id
            );
        } catch (Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }

        return $this->successResponse("Successfully added {$quantity} stock to inventory.", [
            'vendor_product_id' => $updatedProduct->id,
            'added_quantity' => $quantity,
            'current_stock' => (float) $updatedProduct->stock,
            'is_available' => (bool) $updatedProduct->is_available,
        ]);
    }

    /**
     * Toggle product availability (in-stock / out-of-stock).
     *
     * PATCH /api/vendor/products/{id}/toggle-status
     */
    public function toggleStatus(Request $request, int $id): JsonResponse
    {
        $vendor = $this->getVendorProfile($request);
        if (! $vendor) {
            return $this->errorResponse('Unauthorized vendor account or account pending approval.', 403);
        }

        $vendorProduct = VendorProduct::where('vendor_id', $vendor->id)->find($id);
        if (! $vendorProduct) {
            return $this->errorResponse('Vendor product not found in your inventory.', 404);
        }

        $vendorProduct->is_available = ! $vendorProduct->is_available;
        $vendorProduct->save();

        $statusText = $vendorProduct->is_available ? 'Available / In-Stock' : 'Hidden / Out-of-Stock';

        return $this->successResponse("Product status changed to {$statusText}.", [
            'vendor_product_id' => $vendorProduct->id,
            'is_available' => (bool) $vendorProduct->is_available,
        ]);
    }

    /**
     * View stock movement history / ledger for a product.
     *
     * GET /api/vendor/products/{id}/stock-ledger
     */
    public function stockLedger(Request $request, int $id): JsonResponse
    {
        $vendor = $this->getVendorProfile($request);
        if (! $vendor) {
            return $this->errorResponse('Unauthorized vendor account or account pending approval.', 403);
        }

        $vendorProduct = VendorProduct::with('product.baseUom')
            ->where('vendor_id', $vendor->id)
            ->find($id);

        if (! $vendorProduct) {
            return $this->errorResponse('Vendor product not found in your inventory.', 404);
        }

        $query = VendorStockLedger::with('createdBy:id,name')
            ->where('vendor_product_id', $vendorProduct->id);

        if ($request->filled('transaction_type')) {
            $query->where('transaction_type', $request->string('transaction_type'));
        }

        if ($request->filled('flow')) {
            $query->where('flow', $request->string('flow'));
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date('date_from'));
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date('date_to'));
        }

        $perPage = min(max($request->integer('per_page', 20), 1), 100);
        $ledgers = $query->latest()->paginate($perPage);

        $transformedData = $ledgers->getCollection()->map(function (VendorStockLedger $ledger) {
            return [
                'id' => $ledger->id,
                'transaction_type' => $ledger->transaction_type,
                'flow' => $ledger->flow,
                'quantity' => (float) $ledger->quantity,
                'balance_before' => (float) $ledger->balance_before,
                'balance_after' => (float) $ledger->balance_after,
                'reference_no' => $ledger->reference_no,
                'remarks' => $ledger->remarks,
                'created_by' => $ledger->createdBy?->name,
                'created_at' => $ledger->created_at?->toIso8601String(),
            ];
        });

        $ledgers->setCollection($transformedData);

        return $this->successResponse('Stock ledger fetched successfully.', [
            'vendor_product_id' => $vendorProduct->id,
            'product_name' => $vendorProduct->product?->name,
            'current_stock' => (float) $vendorProduct->stock,
            'base_uom' => $vendorProduct->product?->baseUom?->name,
            'transactions' => $ledgers,
        ]);
    }
}
