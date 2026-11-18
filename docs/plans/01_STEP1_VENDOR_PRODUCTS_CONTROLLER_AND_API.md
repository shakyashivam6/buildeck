# Step 1: Vendor Products API Management (`VendorProductManagementController`)

## 1. Overview & Objective
Admin dwara create kiye gaye Master Products (`products`) ko Vendor browse karega aur apni inventory me add karega. Basic product details (Name, SKU, Brand, Category, Images, Specifications, Base UOM) admin catalog se hi aayenge.

Vendor sirf do main values control karega:
1. **Stock:** Vendor ke paas available quantity (in Base UOM, e.g., Bags, Kg, Pieces).
2. **Amount (Selling Price):** Vendor ka selling price for that product.

Iska implementation `VendorProductManagementController` me hoga jo Sanctum authenticated vendor APIs provide karega.

---

## 2. Database Schema: `vendor_products`

Har vendor ka inventory alag record hoga taaki ek vendor ka price/stock doosre vendor ko affect na kare:

```php
Schema::create('vendor_products', function (Blueprint $table) {
    $table->id();
    $table->foreignId('vendor_id')->constrained('vendor_profiles')->cascadeOnDelete();
    $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
    $table->decimal('stock', 12, 2)->default(0.00);      // Live available stock in Base UOM
    $table->decimal('amount', 12, 2);                    // Vendor's default selling price
    $table->decimal('mrp', 12, 2)->nullable();            // Optional MRP
    $table->decimal('min_order_qty', 10, 2)->default(1.00); // Vendor minimum order rule
    $table->boolean('is_available')->default(true);       // In-stock/Active toggle
    $table->timestamps();
    $table->softDeletes();

    $table->unique(['vendor_id', 'product_id']); // Unique composite key
});

// Multi-UOM & Loose vs Package Control Table
Schema::create('vendor_product_uoms', function (Blueprint $table) {
    $table->id();
    $table->foreignId('vendor_product_id')->constrained('vendor_products')->cascadeOnDelete();
    $table->foreignId('uom_id')->constrained('units_of_measure')->cascadeOnDelete();
    $table->decimal('conversion_factor', 14, 4)->default(1.0000);
    $table->decimal('selling_price', 12, 2);
    $table->decimal('mrp', 12, 2)->nullable();
    $table->boolean('allow_loose_sale')->default(false); // Vendor control: loose vs full pack
    $table->decimal('min_order_qty', 10, 2)->default(1.00);
    $table->decimal('step_qty', 10, 2)->default(1.00);
    $table->decimal('pack_contain_qty', 10, 2)->nullable();
    $table->boolean('is_default_selling_unit')->default(false);
    $table->boolean('is_active')->default(true);
    $table->timestamps();

    $table->unique(['vendor_product_id', 'uom_id']);
});
```

---

## 3. Eloquent Model: `App\Models\VendorProduct`

```php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class VendorProduct extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'vendor_products';

    protected $fillable = [
        'vendor_id',
        'product_id',
        'stock',
        'amount',
        'mrp',
        'min_order_qty',
        'is_available',
    ];

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

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(VendorProfile::class, 'vendor_id');
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    public function stockLedgers(): HasMany
    {
        return $this->hasMany(VendorStockLedger::class, 'vendor_product_id');
    }
}
```

---

## 4. Controller Structure: `VendorProductManagementController`

**Path:** `app/Http/Controllers/Api/Vendor/VendorProductManagementController.php`

### Methods:
1. `catalog(Request $request)`: Master products list (with search, category filter, pagination) jo vendor browse karke apni inventory me add kar sakta hai.
2. `myInventory(Request $request)`: Vendor ke currently added products with live stock, amount, and product details.
3. `addToInventory(Request $request)`: Product ko inventory me add karna (validates `product_id`, `stock`, `amount`).
4. `updateStockAndAmount(Request $request, $id)`: Specific vendor product ka stock aur amount update karna.
5. `addStock(Request $request, $id)`: Quick stock addition (new shipment / purchase arrival).
6. `toggleStatus(Request $request, $id)`: Product out-of-stock ya inactive mark karne ke liye.

---

## 5. API Endpoints Specification

Sabhi routes `routes/api.php` ke andar `prefix('vendor')->middleware('auth:sanctum')` me rahenge:

```php
Route::prefix('vendor/products')->middleware(['auth:sanctum'])->group(function () {
    Route::get('catalog', [VendorProductManagementController::class, 'catalog']);
    Route::get('my-inventory', [VendorProductManagementController::class, 'myInventory']);
    Route::post('add-to-inventory', [VendorProductManagementController::class, 'addToInventory']);
    Route::put('{id}/update', [VendorProductManagementController::class, 'updateStockAndAmount']);
    Route::post('{id}/add-stock', [VendorProductManagementController::class, 'addStock']);
    Route::patch('{id}/toggle-status', [VendorProductManagementController::class, 'toggleStatus']);
});
```

### A. Master Catalog (`GET /api/vendor/products/catalog`)
* **Query Params:** `search`, `category_id`, `sub_category_id`, `page`
* **Response Sample:**
```json
{
  "auth_status": true,
  "res": "success",
  "msg": "Master catalog fetched successfully.",
  "token_type": "Bearer",
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 10,
        "name": "UltraTech Super Cement 50kg",
        "sku": "CEM-ULT-001",
        "sub_category": "Cement & Binders",
        "brand": "UltraTech",
        "base_uom": "Bag (50 Kg)",
        "cover_image_url": "https://domain.com/storage/products/covers/cement.jpg",
        "specifications": { "grade": "PPC", "setting_time": "30 mins" },
        "is_already_added": false
      }
    ]
  }
}
```

### B. Add Product to Inventory (`POST /api/vendor/products/add-to-inventory`)
* **Request Payload:**
```json
{
  "product_id": 10,
  "stock": 100,
  "amount": 385.00,
  "mrp": 420.00,
  "notes": "Opening stock from warehouse A"
}
```
* **Response Sample:**
```json
{
  "auth_status": true,
  "res": "success",
  "msg": "Product successfully added to your inventory.",
  "token_type": "Bearer",
  "data": {
    "vendor_product_id": 1,
    "product_id": 10,
    "product_name": "UltraTech Super Cement 50kg",
    "stock": 100.0,
    "amount": 385.0,
    "is_available": true
  }
}
```

### C. Update Stock & Amount (`PUT /api/vendor/products/{id}/update`)
* **Request Payload:**
```json
{
  "stock": 150,
  "amount": 390.00,
  "reason": "Price revision and physical stock audit adjustment"
}
```

### D. Quick Add Stock (`POST /api/vendor/products/{id}/add-stock`)
* **Request Payload:**
```json
{
  "quantity_to_add": 50,
  "challan_or_invoice_no": "INV-2026-881",
  "notes": "Fresh lot received from distributor"
}
```
* **Logic:** Current stock me 50 add hoga, aur Step 2 ke mutabiq automatic **Stock Inward Ledger Entry** create hogi!
