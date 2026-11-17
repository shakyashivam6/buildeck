<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Customer Cart Line Item
 *
 * @property int $id
 * @property int $user_id
 * @property int $vendor_id
 * @property int $product_id
 * @property int $uom_id
 * @property string $purchase_type
 * @property float $quantity
 * @property float $conversion_factor
 * @property float $base_quantity
 * @property float $unit_price
 * @property float $total_price
 */
class CartItem extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'cart_items';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'vendor_id',
        'product_id',
        'uom_id',
        'purchase_type',
        'quantity',
        'conversion_factor',
        'base_quantity',
        'unit_price',
        'total_price',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'quantity' => 'decimal:2',
            'conversion_factor' => 'decimal:4',
            'base_quantity' => 'decimal:2',
            'unit_price' => 'decimal:2',
            'total_price' => 'decimal:2',
        ];
    }

    /**
     * Customer User relationship.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Vendor Profile relationship.
     */
    public function vendor(): BelongsTo
    {
        return $this->belongsTo(VendorProfile::class, 'vendor_id');
    }

    /**
     * Product relationship.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    /**
     * Unit of Measure relationship.
     */
    public function uom(): BelongsTo
    {
        return $this->belongsTo(UnitOfMeasure::class, 'uom_id');
    }
}
