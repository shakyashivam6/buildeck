# Step 2: Vendor Stock Ledger System (Audit Trail & Double-Entry Inventory)

## 1. Overview & Objective
Kisi bhi marketplace me stock ko direct overwrite (`UPDATE vendor_products SET stock = 100`) karna unsafe hota hai kyunki:
1. Vendor ya staff claim kar sakte hain ki stock system ne galat minus kiya.
2. Order cancel hone par ya customer return aane par stock movement trace nahi rehti.
3. Chori, breakage, ya physical audit difference ka record nahi milta.

Isliye hum har stock movement ke liye **Vendor Stock Ledger** implement karenge jo double-entry style me har credit (inward) aur debit (outward) ka complete audit trail store karega.

---

## 2. Database Schema: `vendor_stock_ledgers`

```php
Schema::create('vendor_stock_ledgers', function (Blueprint $table) {
    $table->id();
    $table->foreignId('vendor_id')->constrained('vendor_profiles')->cascadeOnDelete();
    $table->foreignId('vendor_product_id')->constrained('vendor_products')->cascadeOnDelete();
    $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
    
    // Transaction Category
    $table->enum('transaction_type', [
        'opening_stock',           // Initial inventory setup
        'stock_inward',            // Fresh shipment / purchase received
        'order_deduct',            // Customer placed order
        'order_cancelled_restock', // Order cancelled, stock returned
        'damage_loss',             // Broken/damaged items written off
        'manual_audit_adjustment'  // Stock verification correction
    ]);

    // Movement Flow
    $table->enum('flow', ['inward', 'outward']); // inward = stock increase (+), outward = stock decrease (-)

    // Quantities (Decimal to support Kg, Sq.ft, Tonne, Bags, etc.)
    $table->decimal('quantity', 12, 2);
    $table->decimal('balance_before', 12, 2);
    $table->decimal('balance_after', 12, 2);

    // Context & Audit Metadata
    $table->string('reference_no', 100)->nullable(); // Order #, Invoice #, Challan #
    $table->text('remarks')->nullable();
    $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
    
    $table->timestamps();

    // Index for fast reporting & history lookup
    $table->index(['vendor_id', 'vendor_product_id', 'created_at'], 'vsl_vendor_product_created_idx');
});
```

---

## 3. Eloquent Model: `App\Models\VendorStockLedger`

```php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VendorStockLedger extends Model
{
    use HasFactory;

    protected $table = 'vendor_stock_ledgers';

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

    protected function casts(): array
    {
        return [
            'quantity' => 'decimal:2',
            'balance_before' => 'decimal:2',
            'balance_after' => 'decimal:2',
        ];
    }

    public function vendorProduct(): BelongsTo
    {
        return $this->belongsTo(VendorProduct::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
```

---

## 4. Race Condition Protection & Atomic Movement Service

Jab simultaneous orders aate hain ya stock update hota hai, tab database locking zaroori hai:

### Service: `App\Services\Inventory\VendorStockService`
```php
namespace App\Services\Inventory;

use App\Models\VendorProduct;
use App\Models\VendorStockLedger;
use Exception;
use Illuminate\Support\Facades\DB;

class VendorStockService
{
    /**
     * Record stock movement with atomic DB transaction & pessimistic locking.
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
        return DB::transaction(function () use (
            $vendorProductId,
            $transactionType,
            $flow,
            $quantity,
            $referenceNo,
            $remarks,
            $userId
        ) {
            // Pessimistic Lock (Prevents simultaneous race condition)
            $vendorProduct = VendorProduct::where('id', $vendorProductId)
                ->lockForUpdate()
                ->firstOrFail();

            $balanceBefore = (float) $vendorProduct->stock;

            if ($flow === 'inward') {
                $balanceAfter = $balanceBefore + $quantity;
            } elseif ($flow === 'outward') {
                if ($balanceBefore < $quantity) {
                    throw new Exception("Insufficient stock available! Current stock: {$balanceBefore}, requested: {$quantity}");
                }
                $balanceAfter = $balanceBefore - $quantity;
            } else {
                throw new Exception("Invalid flow direction: {$flow}");
            }

            // 1. Update Current Stock in VendorProduct
            $vendorProduct->stock = $balanceAfter;
            if ($balanceAfter <= 0) {
                $vendorProduct->is_available = false; // Auto out-of-stock
            }
            $vendorProduct->save();

            // 2. Create Ledger Entry
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
}
```

---

## 5. Stock Ledger API Endpoint

Vendor app me kisi bhi product ki poori stock passbook / history dekhne ke liye:

`GET /api/vendor/products/{id}/stock-ledger`

* **Query Params:** `transaction_type`, `date_from`, `date_to`, `page`
* **Response Sample:**
```json
{
  "auth_status": true,
  "res": "success",
  "msg": "Stock ledger history fetched successfully.",
  "token_type": "Bearer",
  "data": {
    "product_name": "UltraTech Super Cement 50kg",
    "current_stock": 120.0,
    "transactions": [
      {
        "id": 14,
        "date": "2026-11-17 11:30:00",
        "type": "order_deduct",
        "flow": "outward",
        "quantity": 10.0,
        "balance_before": 130.0,
        "balance_after": 120.0,
        "reference_no": "ORD-2026-9041",
        "remarks": "Order dispatched for customer delivery"
      },
      {
        "id": 11,
        "date": "2026-11-16 09:15:00",
        "type": "stock_inward",
        "flow": "inward",
        "quantity": 50.0,
        "balance_before": 80.0,
        "balance_after": 130.0,
        "reference_no": "CH-10294",
        "remarks": "Distributor delivery received"
      }
    ]
  }
}
```
