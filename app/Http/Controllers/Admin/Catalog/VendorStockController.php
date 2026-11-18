<?php

namespace App\Http\Controllers\Admin\Catalog;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\UnitOfMeasure;
use App\Models\VendorProduct;
use App\Models\VendorProductUom;
use App\Models\VendorProfile;
use App\Models\VendorStockLedger;
use App\Services\Inventory\VendorStockService;
use Exception;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class VendorStockController extends Controller
{
    /**
     * Display a listing of vendor products and stock ledgers.
     */
    public function index(Request $request): Response
    {
        // 1. Vendor Products Query
        $productsQuery = VendorProduct::with([
            'vendor',
            'product.baseUom',
            'product.brand',
            'product.subCategory.category',
            'product.uomPrices.uom',
            'uomPrices.uom',
        ]);

        if ($request->filled('vendor_id')) {
            $productsQuery->where('vendor_id', $request->integer('vendor_id'));
        }

        if ($request->filled('search')) {
            $search = $request->string('search');
            $productsQuery->whereHas('product', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%");
            })->orWhereHas('vendor', function ($q) use ($search) {
                $q->where('vendor_name', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            if ($request->string('status') === 'in_stock') {
                $productsQuery->where('stock', '>', 0);
            } elseif ($request->string('status') === 'out_of_stock') {
                $productsQuery->where('stock', '<=', 0);
            } elseif ($request->string('status') === 'hidden') {
                $productsQuery->where('is_available', false);
            }
        }

        $vendorProducts = $productsQuery->latest()->paginate(15)->withQueryString();

        // 2. Stock Ledgers Query (For Ledger Audit Tab)
        $ledgerQuery = VendorStockLedger::with([
            'vendor',
            'product.baseUom',
            'createdBy:id,name',
        ]);

        if ($request->filled('ledger_vendor_id')) {
            $ledgerQuery->where('vendor_id', $request->integer('ledger_vendor_id'));
        }

        if ($request->filled('ledger_type')) {
            $ledgerQuery->where('transaction_type', $request->string('ledger_type'));
        }

        if ($request->filled('ledger_flow')) {
            $ledgerQuery->where('flow', $request->string('ledger_flow'));
        }

        $ledgers = $ledgerQuery->latest()->paginate(20, ['*'], 'ledger_page')->withQueryString();

        // 3. Dropdowns
        $vendors = VendorProfile::where('status', 'approved')
            ->orderBy('vendor_name')
            ->get(['id', 'vendor_name', 'owner_name', 'mobile']);

        $masterProducts = Product::where('is_active', true)
            ->with(['baseUom', 'uomPrices.uom'])
            ->orderBy('name')
            ->get(['id', 'name', 'sku', 'base_uom_id']);

        $unitsOfMeasure = UnitOfMeasure::orderBy('name')
            ->get(['id', 'name', 'symbol', 'unit_category']);

        return Inertia::render('Admin/Catalog/VendorStocks/index', [
            'vendorProducts' => $vendorProducts,
            'ledgers' => $ledgers,
            'vendors' => $vendors,
            'masterProducts' => $masterProducts,
            'unitsOfMeasure' => $unitsOfMeasure,
            'filters' => $request->only([
                'vendor_id',
                'search',
                'status',
                'tab',
                'ledger_vendor_id',
                'ledger_type',
                'ledger_flow',
            ]),
        ]);
    }

    /**
     * Assign / Add product to a vendor with initial stock and price.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'vendor_id' => ['required', 'exists:vendor_profiles,id'],
            'product_id' => ['required', 'exists:products,id'],
            'stock' => ['required', 'numeric', 'min:0'],
            'stock_uom_id' => ['nullable', 'exists:units_of_measure,id'],
            'amount' => ['nullable', 'numeric', 'min:0.01'],
            'mrp' => ['nullable', 'numeric', 'min:0'],
            'min_order_qty' => ['nullable', 'numeric', 'min:0.01'],
            'notes' => ['nullable', 'string', 'max:255'],
            'pricing_matrix' => ['nullable', 'array'],
            'pricing_matrix.*.uom_id' => ['required_with:pricing_matrix', 'exists:units_of_measure,id'],
            'pricing_matrix.*.conversion_factor' => ['required_with:pricing_matrix', 'numeric', 'min:0.0001'],
            'pricing_matrix.*.selling_price' => ['required_with:pricing_matrix', 'numeric', 'min:0.01'],
            'pricing_matrix.*.mrp' => ['nullable', 'numeric', 'min:0'],
            'pricing_matrix.*.allow_loose_sale' => ['nullable', 'boolean'],
            'pricing_matrix.*.min_order_qty' => ['nullable', 'numeric', 'min:0.01'],
            'pricing_matrix.*.step_qty' => ['nullable', 'numeric', 'min:0.01'],
            'pricing_matrix.*.pack_contain_qty' => ['nullable', 'numeric', 'min:0.01'],
            'pricing_matrix.*.is_default_selling_unit' => ['nullable', 'boolean'],
        ]);

        $existing = VendorProduct::withTrashed()
            ->where('vendor_id', $validated['vendor_id'])
            ->where('product_id', $validated['product_id'])
            ->first();

        if ($existing && ! $existing->trashed()) {
            return back()->with('error', 'This product is already assigned to this vendor. Please update its stock or price.');
        }

        $product = Product::with(['baseUom', 'uomPrices'])->findOrFail($validated['product_id']);
        $rawStock = (float) $validated['stock'];
        $baseStock = $rawStock;

        // If initial stock was entered in a non-base UOM, convert it to base UOM
        if (! empty($validated['stock_uom_id']) && (int) $validated['stock_uom_id'] !== (int) $product->base_uom_id) {
            $conversionFactor = 1.0000;
            if (! empty($validated['pricing_matrix'])) {
                foreach ($validated['pricing_matrix'] as $row) {
                    if ((int) $row['uom_id'] === (int) $validated['stock_uom_id']) {
                        $conversionFactor = (float) $row['conversion_factor'];
                        break;
                    }
                }
            } else {
                $masterPrice = $product->uomPrices->firstWhere('uom_id', $validated['stock_uom_id']);
                if ($masterPrice) {
                    $conversionFactor = (float) $masterPrice->conversion_factor;
                }
            }
            $baseStock = round($rawStock * $conversionFactor, 4);
        }

        // Determine default selling amount and MRP
        $pricingMatrix = $validated['pricing_matrix'] ?? [];
        if (! empty($pricingMatrix)) {
            $defaultRow = collect($pricingMatrix)->firstWhere('is_default_selling_unit', true) ?? $pricingMatrix[0];
            $amount = (float) $defaultRow['selling_price'];
            $mrp = ! empty($defaultRow['mrp']) ? (float) $defaultRow['mrp'] : null;
            $minOrderQty = ! empty($defaultRow['min_order_qty']) ? (float) $defaultRow['min_order_qty'] : 1.00;
        } else {
            $amount = (float) ($validated['amount'] ?? 0);
            $mrp = ! empty($validated['mrp']) ? (float) $validated['mrp'] : null;
            $minOrderQty = ! empty($validated['min_order_qty']) ? (float) $validated['min_order_qty'] : 1.00;
        }

        DB::transaction(function () use (
            $existing,
            $validated,
            $baseStock,
            $amount,
            $mrp,
            $minOrderQty,
            $pricingMatrix,
            $product,
            $request
        ) {
            if ($existing && $existing->trashed()) {
                $existing->restore();
                $existing->update([
                    'stock' => $baseStock,
                    'amount' => $amount,
                    'mrp' => $mrp,
                    'min_order_qty' => $minOrderQty,
                    'is_available' => $baseStock > 0,
                ]);
                $vendorProduct = $existing;
            } else {
                $vendorProduct = VendorProduct::create([
                    'vendor_id' => $validated['vendor_id'],
                    'product_id' => $validated['product_id'],
                    'stock' => $baseStock,
                    'amount' => $amount,
                    'mrp' => $mrp,
                    'min_order_qty' => $minOrderQty,
                    'is_available' => $baseStock > 0,
                ]);
            }

            // Sync Vendor Product UOMs
            if (! empty($pricingMatrix)) {
                $vendorProduct->uomPrices()->delete();
                foreach ($pricingMatrix as $pRow) {
                    VendorProductUom::create([
                        'vendor_product_id' => $vendorProduct->id,
                        'uom_id' => $pRow['uom_id'],
                        'conversion_factor' => $pRow['conversion_factor'],
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

            if ($baseStock > 0) {
                VendorStockService::initializeOpeningStock(
                    $vendorProduct,
                    $baseStock,
                    $validated['notes'] ?? 'Assigned by Admin with initial stock',
                    $request->user()->id
                );
            }
        });

        return back()->with('success', 'Product assigned to vendor with packaging & UOM pricing matrix successfully.');
    }

    /**
     * Update vendor product price and perform audit stock adjustment.
     */
    public function update(Request $request, VendorProduct $vendorProduct): RedirectResponse
    {
        $validated = $request->validate([
            'amount' => ['required_without:pricing_matrix', 'nullable', 'numeric', 'min:0.01'],
            'mrp' => ['nullable', 'numeric', 'min:0'],
            'stock' => ['nullable', 'numeric', 'min:0'],
            'min_order_qty' => ['nullable', 'numeric', 'min:0.01'],
            'reason' => ['nullable', 'string', 'max:255'],
            'pricing_matrix' => ['nullable', 'array'],
            'pricing_matrix.*.uom_id' => ['required_with:pricing_matrix', 'exists:units_of_measure,id'],
            'pricing_matrix.*.conversion_factor' => ['required_with:pricing_matrix', 'numeric', 'min:0.0001'],
            'pricing_matrix.*.selling_price' => ['required_with:pricing_matrix', 'numeric', 'min:0.01'],
            'pricing_matrix.*.mrp' => ['nullable', 'numeric', 'min:0'],
            'pricing_matrix.*.allow_loose_sale' => ['nullable', 'boolean'],
            'pricing_matrix.*.min_order_qty' => ['nullable', 'numeric', 'min:0.01'],
            'pricing_matrix.*.step_qty' => ['nullable', 'numeric', 'min:0.01'],
            'pricing_matrix.*.pack_contain_qty' => ['nullable', 'numeric', 'min:0.01'],
            'pricing_matrix.*.is_default_selling_unit' => ['nullable', 'boolean'],
        ]);

        try {
            DB::transaction(function () use ($validated, $vendorProduct, $request) {
                $pricingMatrix = $validated['pricing_matrix'] ?? null;
                if (! empty($pricingMatrix)) {
                    $defaultRow = collect($pricingMatrix)->firstWhere('is_default_selling_unit', true) ?? $pricingMatrix[0];
                    $vendorProduct->amount = (float) $defaultRow['selling_price'];
                    $vendorProduct->mrp = ! empty($defaultRow['mrp']) ? (float) $defaultRow['mrp'] : null;
                    $vendorProduct->min_order_qty = ! empty($defaultRow['min_order_qty']) ? (float) $defaultRow['min_order_qty'] : 1.00;

                    // Sync UOMs
                    $vendorProduct->uomPrices()->delete();
                    foreach ($pricingMatrix as $pRow) {
                        VendorProductUom::create([
                            'vendor_product_id' => $vendorProduct->id,
                            'uom_id' => $pRow['uom_id'],
                            'conversion_factor' => $pRow['conversion_factor'],
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
                    if (isset($validated['amount'])) {
                        $vendorProduct->amount = (float) $validated['amount'];
                    }
                    if (isset($validated['mrp'])) {
                        $vendorProduct->mrp = (float) $validated['mrp'];
                    }
                    if (isset($validated['min_order_qty'])) {
                        $vendorProduct->min_order_qty = (float) $validated['min_order_qty'];
                    }
                }

                $vendorProduct->save();

                if (isset($validated['stock'])) {
                    $targetStock = (float) $validated['stock'];
                    if (round($targetStock, 2) !== round((float) $vendorProduct->stock, 2)) {
                        VendorStockService::adjustToTargetStock(
                            $vendorProduct->id,
                            $targetStock,
                            $validated['reason'] ?? 'Stock adjusted by Admin',
                            $request->user()->id
                        );
                    }
                }
            });
        } catch (Exception $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', 'Vendor stock and price updated successfully.');
    }

    /**
     * Quick Inward Stock Arrival added by Admin.
     */
    public function addStock(Request $request, VendorProduct $vendorProduct): RedirectResponse
    {
        $validated = $request->validate([
            'quantity_to_add' => ['required', 'numeric', 'min:0.01'],
            'challan_or_invoice_no' => ['nullable', 'string', 'max:100'],
            'notes' => ['nullable', 'string', 'max:255'],
        ]);

        try {
            VendorStockService::recordMovement(
                $vendorProduct->id,
                'stock_inward',
                'inward',
                (float) $validated['quantity_to_add'],
                $validated['challan_or_invoice_no'] ?? 'ADMIN-INWARD',
                $validated['notes'] ?? 'Stock added by Admin',
                $request->user()->id
            );
        } catch (Exception $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', "Successfully added {$validated['quantity_to_add']} stock to vendor inventory.");
    }

    /**
     * Toggle vendor product availability.
     */
    public function toggleStatus(VendorProduct $vendorProduct): RedirectResponse
    {
        $vendorProduct->is_available = ! $vendorProduct->is_available;
        $vendorProduct->save();

        $status = $vendorProduct->is_available ? 'active/available' : 'hidden/out-of-stock';
        return back()->with('success', "Vendor product is now {$status}.");
    }
}
