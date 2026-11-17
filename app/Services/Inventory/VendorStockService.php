<?php

namespace App\Services\Inventory;

use App\Models\VendorProduct;
use App\Models\VendorStockLedger;
use Exception;
use Illuminate\Support\Facades\DB;

class VendorStockService
{
    /**
     * Record a stock movement with atomic DB transaction & pessimistic locking.
     *
     * @param int $vendorProductId
     * @param string $transactionType ('opening_stock', 'stock_inward', 'order_deduct', 'order_cancelled_restock', 'damage_loss', 'manual_audit_adjustment')
     * @param string $flow ('inward' or 'outward')
     * @param float $quantity
     * @param string|null $referenceNo
     * @param string|null $remarks
     * @param int|null $userId
     * @return VendorProduct
     * @throws Exception
     */
    public static function recordMovement(
        int $vendorProductId,
        string $transactionType,
        string $flow,
        float $quantity,
        ?string $referenceNo = null,
        ?string $remarks = null,
        ?int $userId = null
    ): VendorProduct {
        if ($quantity < 0) {
            throw new Exception('Stock movement quantity must be positive.');
        }

        return DB::transaction(function () use (
            $vendorProductId,
            $transactionType,
            $flow,
            $quantity,
            $referenceNo,
            $remarks,
            $userId
        ) {
            /** @var VendorProduct $vendorProduct */
            $vendorProduct = VendorProduct::where('id', $vendorProductId)
                ->lockForUpdate()
                ->firstOrFail();

            $balanceBefore = (float) $vendorProduct->stock;

            if ($flow === 'inward') {
                $balanceAfter = round($balanceBefore + $quantity, 2);
            } elseif ($flow === 'outward') {
                if ($balanceBefore < $quantity) {
                    throw new Exception("Insufficient stock available! Current stock: {$balanceBefore}, requested: {$quantity}");
                }
                $balanceAfter = round($balanceBefore - $quantity, 2);
            } else {
                throw new Exception("Invalid flow direction: {$flow}");
            }

            // Update Current Stock in VendorProduct
            $vendorProduct->stock = $balanceAfter;
            if ($balanceAfter <= 0) {
                $vendorProduct->is_available = false;
            } elseif (! $vendorProduct->is_available && $balanceAfter > 0) {
                $vendorProduct->is_available = true;
            }
            $vendorProduct->save();

            // Create Stock Ledger Entry
            VendorStockLedger::create([
                'vendor_id' => $vendorProduct->vendor_id,
                'vendor_product_id' => $vendorProduct->id,
                'product_id' => $vendorProduct->product_id,
                'transaction_type' => $transactionType,
                'flow' => $flow,
                'quantity' => $quantity,
                'balance_before' => $balanceBefore,
                'balance_after' => $balanceAfter,
                'reference_no' => $referenceNo,
                'remarks' => $remarks,
                'created_by' => $userId,
            ]);

            return $vendorProduct;
        });
    }

    /**
     * Set initial opening stock when product is added to vendor inventory.
     *
     * @param VendorProduct $vendorProduct
     * @param float $stock
     * @param string|null $notes
     * @param int|null $userId
     * @return void
     */
    public static function initializeOpeningStock(
        VendorProduct $vendorProduct,
        float $stock,
        ?string $notes = null,
        ?int $userId = null
    ): void {
        if ($stock <= 0) {
            return;
        }

        VendorStockLedger::create([
            'vendor_id' => $vendorProduct->vendor_id,
            'vendor_product_id' => $vendorProduct->id,
            'product_id' => $vendorProduct->product_id,
            'transaction_type' => 'opening_stock',
            'flow' => 'inward',
            'quantity' => $stock,
            'balance_before' => 0.00,
            'balance_after' => $stock,
            'reference_no' => 'OPENING',
            'remarks' => $notes ?? 'Initial opening stock',
            'created_by' => $userId,
        ]);
    }

    /**
     * Adjust stock to a target absolute value (Physical audit adjustment).
     *
     * @param int $vendorProductId
     * @param float $targetStock
     * @param string|null $reason
     * @param int|null $userId
     * @return VendorProduct
     * @throws Exception
     */
    public static function adjustToTargetStock(
        int $vendorProductId,
        float $targetStock,
        ?string $reason = null,
        ?int $userId = null
    ): VendorProduct {
        if ($targetStock < 0) {
            throw new Exception('Target stock cannot be negative.');
        }

        return DB::transaction(function () use ($vendorProductId, $targetStock, $reason, $userId) {
            /** @var VendorProduct $vendorProduct */
            $vendorProduct = VendorProduct::where('id', $vendorProductId)
                ->lockForUpdate()
                ->firstOrFail();

            $currentStock = (float) $vendorProduct->stock;
            $diff = round($targetStock - $currentStock, 2);

            if ($diff == 0) {
                return $vendorProduct;
            }

            $flow = $diff > 0 ? 'inward' : 'outward';
            $quantity = abs($diff);

            return self::recordMovement(
                $vendorProductId,
                'manual_audit_adjustment',
                $flow,
                $quantity,
                'AUDIT',
                $reason ?? "Stock audit adjustment from {$currentStock} to {$targetStock}",
                $userId
            );
        });
    }
}
