<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Vendor Product Inventory & Pricing
 *
 * @property int $id
 * @property int $vendor_id
 * @property int $product_id
 * @property float $stock
 * @property float $amount
 * @property float|null $mrp
 * @property float $min_order_qty
 * @property bool $is_available
 */
class VendorProduct extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'vendor_products';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'vendor_id',
        'product_id',
        'stock',
        'amount',
        'mrp',
        'min_order_qty',
        'is_available',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'stock' => 'decimal:2',
            'amount' => 'decimal:2',
            'mrp' => 'decimal:2',
            'min_order_qty' => 'decimal:2',
            'is_available' => 'boolean',
        ];
    }

    /**
     * Vendor Profile relationship.
     */
    public function vendor(): BelongsTo
    {
        return $this->belongsTo(VendorProfile::class, 'vendor_id');
    }

    /**
     * Master Product relationship.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    /**
     * Stock ledger history for this vendor product.
     */
    public function stockLedgers(): HasMany
    {
        return $this->hasMany(VendorStockLedger::class, 'vendor_product_id');
    }

    /**
     * Vendor-specific selling UOMs and packaging/loose rules.
     */
    public function uomPrices(): HasMany
    {
        return $this->hasMany(VendorProductUom::class, 'vendor_product_id');
    }

    /**
     * Default primary selling unit for this vendor product.
     */
    public function defaultUomPrice(): HasOne
    {
        return $this->hasOne(VendorProductUom::class, 'vendor_product_id')->where('is_default_selling_unit', true);
    }
}
