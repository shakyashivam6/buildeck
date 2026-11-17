<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Vendor Stock Movement Ledger
 *
 * @property int $id
 * @property int $vendor_id
 * @property int $vendor_product_id
 * @property int $product_id
 * @property string $transaction_type
 * @property string $flow
 * @property float $quantity
 * @property float $balance_before
 * @property float $balance_after
 * @property string|null $reference_no
 * @property string|null $remarks
 * @property int|null $created_by
 */
class VendorStockLedger extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'vendor_stock_ledgers';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'vendor_id',
        'vendor_product_id',
        'product_id',
        'transaction_type',
        'flow',
        'quantity',
        'balance_before',
        'balance_after',
        'reference_no',
        'remarks',
        'created_by',
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
            'balance_before' => 'decimal:2',
            'balance_after' => 'decimal:2',
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
     * Vendor Product relationship.
     */
    public function vendorProduct(): BelongsTo
    {
        return $this->belongsTo(VendorProduct::class, 'vendor_product_id');
    }

    /**
     * Product relationship.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    /**
     * User who initiated or created this transaction.
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
