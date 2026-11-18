<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Customer\AddToCartRequest;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\ProductUomPrice;
use App\Models\VendorProduct;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerCartController extends Controller
{
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
     * Get dynamic pricing and UOM packaging options for customer Add-To-Cart modal.
     *
     * GET /api/customer/products/{productId}/pricing-modal?vendor_id={vendorId}
     */
    public function pricingModal(Request $request, int $productId): JsonResponse
    {
        $vendorId = $request->integer('vendor_id');
        if (! $vendorId) {
            return $this->errorResponse('vendor_id is required to fetch pricing options.', 422);
        }

        $vendorProduct = VendorProduct::with(['vendor', 'product.baseUom', 'product.brand', 'product.uomPrices.uom', 'uomPrices.uom'])
            ->where('vendor_id', $vendorId)
            ->where('product_id', $productId)
            ->where('is_available', true)
            ->first();

        if (! $vendorProduct) {
            return $this->errorResponse('This product is currently not available from the selected vendor.', 404);
        }

        $product = $vendorProduct->product;
        $vendorBasePrice = (float) $vendorProduct->amount;
        $vendorStock = (float) $vendorProduct->stock;

        $options = [];
        $uomTiers = $vendorProduct->uomPrices->isNotEmpty() ? $vendorProduct->uomPrices : $product->uomPrices;

        // Traverse configured UOM prices (Vendor-specific if available, fallback to Master)
        foreach ($uomTiers as $uomPrice) {
            $conversionFactor = (float) $uomPrice->conversion_factor;
            // Unit selling price: vendor direct price or derived from base price
            $sellingPrice = isset($uomPrice->selling_price)
                ? (float) $uomPrice->selling_price
                : round($vendorBasePrice * $conversionFactor, 2);

            $mrp = $uomPrice->mrp ? round((float) $uomPrice->mrp, 2) : null;

            // 1. Complete Package Option (e.g. Bag, Box, Drum, etc.)
            $options[] = [
                'type' => 'package',
                'label' => $uomPrice->pack_contain_qty
                    ? "Full Package ({$uomPrice->pack_contain_qty} {$product->baseUom?->symbol})"
                    : "Complete {$uomPrice->uom?->name}",
                'uom_id' => $uomPrice->uom_id,
                'uom_name' => $uomPrice->uom?->name,
                'unit_symbol' => $uomPrice->uom?->symbol,
                'conversion_factor' => $conversionFactor,
                'selling_price' => $sellingPrice,
                'mrp' => $mrp,
                'min_qty' => (float) ($uomPrice->min_order_qty ?: 1.00),
                'step_qty' => (float) ($uomPrice->step_qty ?: 1.00),
                'is_default' => (bool) $uomPrice->is_default_selling_unit,
                'max_available_qty' => $conversionFactor > 0 ? floor($vendorStock / $conversionFactor) : 0,
            ];

            // 2. Loose Sale Option (If allowed for this vendor & UOM tier)
            if ($uomPrice->allow_loose_sale) {
                // Per base unit loose rate (e.g., per Kg)
                $looseRate = $conversionFactor > 0 ? round($sellingPrice / $conversionFactor, 2) : $sellingPrice;
                $options[] = [
                    'type' => 'loose',
                    'label' => "Loose / Retail Sale (By {$product->baseUom?->name})",
                    'uom_id' => $product->base_uom_id,
                    'uom_name' => $product->baseUom?->name,
                    'unit_symbol' => $product->baseUom?->symbol,
                    'conversion_factor' => 1.0000,
                    'selling_price' => $looseRate,
                    'mrp' => null,
                    'min_qty' => (float) ($uomPrice->min_order_qty ?: 1.00),
                    'step_qty' => (float) ($uomPrice->step_qty ?: 1.00),
                    'is_default' => false,
                    'max_available_qty' => $vendorStock,
                ];
            }
        }

        return $this->successResponse('Product packaging & pricing options loaded.', [
            'product_id' => $product->id,
            'product_name' => $product->name,
            'brand' => $product->brand?->name,
            'cover_image_url' => $product->cover_image_url,
            'base_uom' => $product->baseUom?->name,
            'vendor' => [
                'id' => $vendorProduct->vendor_id,
                'vendor_name' => $vendorProduct->vendor?->vendor_name,
                'available_stock' => $vendorStock,
            ],
            'options' => $options,
        ]);
    }

    /**
     * Add an item to customer's cart with selected UOM & packaging type.
     *
     * POST /api/customer/cart/add
     */
    public function addToCart(AddToCartRequest $request): JsonResponse
    {
        $user = $request->user();
        $vendorId = $request->integer('vendor_id');
        $productId = $request->integer('product_id');
        $uomId = $request->integer('uom_id');
        $purchaseType = $request->string('purchase_type');
        $quantity = (float) $request->input('quantity');

        // Check Vendor Product Inventory
        $vendorProduct = VendorProduct::with('uomPrices')
            ->where('vendor_id', $vendorId)
            ->where('product_id', $productId)
            ->where('is_available', true)
            ->first();

        if (! $vendorProduct) {
            return $this->errorResponse('This product is not currently available from the selected vendor.', 404);
        }

        $vendorUom = $vendorProduct->uomPrices->firstWhere('uom_id', $uomId);
        $masterUom = ProductUomPrice::where('product_id', $productId)
            ->where('uom_id', $uomId)
            ->first();

        // Validate loose sale permission
        if ($purchaseType === 'loose') {
            $isLooseAllowed = $vendorUom
                ? (bool) $vendorUom->allow_loose_sale
                : ($masterUom ? (bool) $masterUom->allow_loose_sale : false);

            if (! $isLooseAllowed) {
                return $this->errorResponse('This vendor does not allow loose sale for this item. Please select full package.', 422);
            }
        }

        // Determine conversion factor and unit price
        $conversionFactor = 1.0000;
        if ($purchaseType !== 'loose') {
            $conversionFactor = $vendorUom
                ? (float) $vendorUom->conversion_factor
                : ($masterUom ? (float) $masterUom->conversion_factor : 1.0000);
        }

        $baseQuantityNeeded = round($quantity * $conversionFactor, 2);

        // Live Stock Validation
        if ($baseQuantityNeeded > (float) $vendorProduct->stock) {
            return $this->errorResponse(
                "Insufficient stock! Vendor only has {$vendorProduct->stock} quantity available in stock.",
                400,
                ['available_stock' => (float) $vendorProduct->stock]
            );
        }

        // Calculate unit price and total
        if ($vendorUom && $purchaseType !== 'loose') {
            $unitPrice = (float) $vendorUom->selling_price;
        } elseif ($vendorUom && $purchaseType === 'loose') {
            $unitPrice = (float) $vendorUom->conversion_factor > 0
                ? round((float) $vendorUom->selling_price / (float) $vendorUom->conversion_factor, 2)
                : (float) $vendorUom->selling_price;
        } else {
            $unitPrice = round((float) $vendorProduct->amount * $conversionFactor, 2);
        }

        $totalPrice = round($unitPrice * $quantity, 2);

        // Store or update in cart_items
        $cartItem = CartItem::updateOrCreate(
            [
                'user_id' => $user->id,
                'vendor_id' => $vendorId,
                'product_id' => $productId,
                'uom_id' => $uomId,
                'purchase_type' => $purchaseType,
            ],
            [
                'quantity' => $quantity,
                'conversion_factor' => $conversionFactor,
                'base_quantity' => $baseQuantityNeeded,
                'unit_price' => $unitPrice,
                'total_price' => $totalPrice,
            ]
        );

        $cartItem->load(['product', 'vendor', 'uom']);

        return $this->successResponse('Item successfully added to cart.', [
            'cart_item_id' => $cartItem->id,
            'product_name' => $cartItem->product?->name,
            'vendor_name' => $cartItem->vendor?->vendor_name,
            'uom' => $cartItem->uom?->name,
            'purchase_type' => $cartItem->purchase_type,
            'quantity' => (float) $cartItem->quantity,
            'unit_price' => (float) $cartItem->unit_price,
            'total_price' => (float) $cartItem->total_price,
        ], 201);
    }

    /**
     * Get logged-in customer's cart.
     *
     * GET /api/customer/cart
     */
    public function getCart(Request $request): JsonResponse
    {
        $user = $request->user();

        $cartItems = CartItem::with(['product.baseUom', 'vendor', 'uom'])
            ->where('user_id', $user->id)
            ->latest()
            ->get();

        $totalCartAmount = $cartItems->sum('total_price');

        $items = $cartItems->map(function (CartItem $item) {
            return [
                'id' => $item->id,
                'product_id' => $item->product_id,
                'product_name' => $item->product?->name,
                'cover_image_url' => $item->product?->cover_image_url,
                'vendor_id' => $item->vendor_id,
                'vendor_name' => $item->vendor?->vendor_name,
                'uom_id' => $item->uom_id,
                'uom_name' => $item->uom?->name,
                'purchase_type' => $item->purchase_type,
                'quantity' => (float) $item->quantity,
                'unit_price' => (float) $item->unit_price,
                'total_price' => (float) $item->total_price,
            ];
        });

        return $this->successResponse('Cart items fetched successfully.', [
            'items' => $items,
            'total_items_count' => $cartItems->count(),
            'total_cart_amount' => round((float) $totalCartAmount, 2),
        ]);
    }

    /**
     * Remove an item from cart.
     *
     * DELETE /api/customer/cart/{id}
     */
    public function removeFromCart(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        $cartItem = CartItem::where('user_id', $user->id)->find($id);
        if (! $cartItem) {
            return $this->errorResponse('Cart item not found.', 404);
        }

        $cartItem->delete();

        return $this->successResponse('Item removed from cart.');
    }
}
