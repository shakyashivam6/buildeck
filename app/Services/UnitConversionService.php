<?php

namespace App\Services;

use App\Models\Product;
use App\Models\ProductUomPrice;
use InvalidArgumentException;

/**
 * Service to calculate Multi-UOM conversions, pricing, and loose-sale validations.
 */
class UnitConversionService
{
    /**
     * Calculate price and validate loose-sale packaging rules for a requested product purchase.
     *
     * @param Product $product
     * @param int $uomId
     * @param float $requestedQuantity
     * @param bool $autoRoundLoose Whether to automatically adjust to next valid pack when loose is disallowed
     * @return array{
     *     uom_name: string,
     *     uom_symbol: string,
     *     requested_qty: float,
     *     final_qty: float,
     *     allow_loose_sale: bool,
     *     unit_price: float,
     *     total_amount: float,
     *     base_uom_qty: float,
     *     base_uom_symbol: string,
     *     was_rounded: bool,
     *     note: string|null
     * }
     */
    public function calculateOrder(
        Product $product,
        int $uomId,
        float $requestedQuantity,
        bool $autoRoundLoose = true
    ): array {
        /** @var ProductUomPrice|null $pricing */
        $pricing = $product->uomPrices()->where('uom_id', $uomId)->first();

        if ($pricing === null) {
            throw new InvalidArgumentException("UOM ID {$uomId} is not configured for product: {$product->name}");
        }

        $validation = $pricing->validateOrderQuantity($requestedQuantity);
        $finalQty = $requestedQuantity;
        $wasRounded = false;
        $note = null;

        if (! $validation['is_valid']) {
            if ($autoRoundLoose) {
                $finalQty = $validation['rounded_qty'];
                $wasRounded = true;
                $note = "Quantity adjusted from {$requestedQuantity} to {$finalQty} {$pricing->uom->symbol} ({$validation['reason']})";
            } else {
                throw new InvalidArgumentException($validation['reason'] ?? 'Invalid order quantity.');
            }
        }

        $unitPrice = (float) $pricing->selling_price;
        $totalAmount = round($finalQty * $unitPrice, 2);
        $baseUomQty = round($finalQty * (float) $pricing->conversion_factor, 4);

        return [
            'uom_name' => $pricing->uom->name,
            'uom_symbol' => $pricing->uom->symbol,
            'requested_qty' => $requestedQuantity,
            'final_qty' => $finalQty,
            'allow_loose_sale' => (bool) $pricing->allow_loose_sale,
            'unit_price' => $unitPrice,
            'total_amount' => $totalAmount,
            'base_uom_qty' => $baseUomQty,
            'base_uom_symbol' => $product->baseUom->symbol,
            'was_rounded' => $wasRounded,
            'note' => $note,
        ];
    }

    /**
     * Calculate nominal standard weight of a TMT steel bar in kg.
     * Formula: (d^2 / 162) * length_in_meters
     *
     * @param float $diaInMm Diameter in millimeters
     * @param float $lengthInMeters Standard rod length (usually 12m)
     * @return float Weight in Kg
     */
    public function calculateTmtRodWeight(float $diaInMm, float $lengthInMeters = 12.0): float
    {
        return round((($diaInMm * $diaInMm) / 162.0) * $lengthInMeters, 3);
    }

    /**
     * Calculate required tile boxes for a target coverage area in square feet.
     *
     * @param float $targetSqFt Required room/floor area
     * @param float $sqFtPerBox Coverage per box
     * @param float $wastagePercentage Recommended buffer (usually 5% - 10%)
     * @return array{
     *     net_sqft: float,
     *     gross_sqft: float,
     *     required_boxes: int,
     *     actual_coverage_sqft: float
     * }
     */
    public function calculateTileBoxes(
        float $targetSqFt,
        float $sqFtPerBox,
        float $wastagePercentage = 5.0
    ): array {
        $grossSqFt = $targetSqFt * (1 + ($wastagePercentage / 100.0));
        $boxes = (int) ceil($grossSqFt / $sqFtPerBox);
        $actualCoverage = $boxes * $sqFtPerBox;

        return [
            'net_sqft' => $targetSqFt,
            'gross_sqft' => round($grossSqFt, 2),
            'required_boxes' => $boxes,
            'actual_coverage_sqft' => round($actualCoverage, 2),
        ];
    }
}

