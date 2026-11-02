<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Product UOM Pricing and Loose-Sale Rules Matrix
 *
 * @property int $id
 * @property int $product_id
 * @property int $uom_id
 * @property float $conversion_factor
 * @property float $selling_price
 * @property float|null $mrp
 * @property float|null $bulk_discount_price
 * @property bool $allow_loose_sale
 * @property float $min_order_qty
 * @property float $step_qty
 * @property float|null $pack_contain_qty
 * @property bool $is_default_selling_unit
 */
class ProductUomPrice extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'product_uom_prices';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'product_id',
        'uom_id',
        'conversion_factor',
        'selling_price',
        'mrp',
        'bulk_discount_price',
        'allow_loose_sale',
        'min_order_qty',
        'step_qty',
        'pack_contain_qty',
        'is_default_selling_unit',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'conversion_factor' => 'decimal:4',
            'selling_price' => 'decimal:2',
            'mrp' => 'decimal:2',
            'bulk_discount_price' => 'decimal:2',
            'allow_loose_sale' => 'boolean',
            'min_order_qty' => 'decimal:2',
            'step_qty' => 'decimal:2',
            'pack_contain_qty' => 'decimal:2',
            'is_default_selling_unit' => 'boolean',
        ];
    }

    /**
     * Product.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Target Unit of Measure for this price tier.
     */
    public function uom(): BelongsTo
    {
        return $this->belongsTo(UnitOfMeasure::class, 'uom_id');
    }

    /**
     * Scope for units where loose sale is permitted.
     */
    public function scopeLooseAllowed(Builder $query): Builder
    {
        return $query->where('allow_loose_sale', true);
    }

    /**
     * Scope for primary/default selling unit.
     */
    public function scopeDefaultUnit(Builder $query): Builder
    {
        return $query->where('is_default_selling_unit', true);
    }

    /**
     * Validate whether a requested order quantity complies with MOQ and Loose sale / step rules.
     *
     * @param float $quantity
     * @return array{is_valid: bool, reason: string|null, rounded_qty: float}
     */
    public function validateOrderQuantity(float $quantity): array
    {
        $minQty = (float) $this->min_order_qty;
        $stepQty = (float) ($this->step_qty > 0 ? $this->step_qty : 1);

        if ($quantity < $minQty) {
            return [
                'is_valid' => false,
                'reason' => "Minimum order quantity for this unit is {$minQty}.",
                'rounded_qty' => $minQty,
            ];
        }

        if (! $this->allow_loose_sale) {
            $remainder = fmod($quantity, $stepQty);
            // Floating point tolerance check
            if ($remainder > 0.0001 && abs($remainder - $stepQty) > 0.0001) {
                $roundedUp = ceil($quantity / $stepQty) * $stepQty;

                return [
                    'is_valid' => false,
                    'reason' => "This unit cannot be sold loose. Please order in full packages/multiples of {$stepQty}.",
                    'rounded_qty' => (float) $roundedUp,
                ];
            }
        }

        return [
            'is_valid' => true,
            'reason' => null,
            'rounded_qty' => $quantity,
        ];
    }
}

