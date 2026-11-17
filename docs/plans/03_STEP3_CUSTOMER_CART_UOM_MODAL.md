# Step 3: Customer Add-to-Cart Modal (Complete Package vs Loose Sale & Dynamic Pricing)

## 1. Overview & Objective
Building materials me customers do tarah se purchase karte hain:
1. **Complete Package (Bulk/Full Pack):** E.g., Pure sealed 50 Kg Cement Bag, Tile ki 1 Full Box (8 pieces), Steel ka 1 Full Bundle (25 pieces), Wire ka 1 Full Coil (90m).
2. **Loose Sale (Retail/Fractional Quantity):** E.g., Chhota repair kaam ke liye 5 Kg loose cement, 3 loose tiles, 2 pieces steel rod.

Jab customer application me kisi product par **"Add to Cart"** click karega, tab direct add hone ke bajaye ek **Smart Multi-UOM Modal** open hoga. Yeh modal packaging formats, minimum quantity rules, vendor ka live stock aur dynamic price calculate karke cart me add karega.

---

## 2. Modal UI / UX Flow Architecture

```
[ Customer clicks "Add to Cart" on Product Card ]
                      │
                      ▼
        ┌─────────────────────────────┐
        │   MODAL OPENS:              │
        │   Product: UltraTech Cement │
        │   Vendor: Gupta Hardware    │
        └──────────────┬──────────────┘
                       │
       ┌───────────────┴───────────────┐
       ▼                               ▼
[ Option 1: Complete Package ]   [ Option 2: Loose Sale ]
 • Unit: Bag (50 Kg)              • Unit: Kilogram (Kg)
 • Price: ₹380.00 / Bag           • Price: ₹8.50 / Kg
 • Pack Size: 50 Kg               • Min Order: 5 Kg (Step: 1 Kg)
 • Qty Selector: [ - 2 + ]        • Qty Selector: [ - 10 + ]
       │                               │
       └───────────────┬───────────────┘
                       │
                       ▼
         [ Live Vendor Stock Check ]
   (e.g., 2 Bags = 100 Kg <= Vendor Stock 500 Kg? OK)
                       │
                       ▼
       [ Dynamic Price Calculation ]
       Subtotal = Quantity × Unit Price (₹760.00)
                       │
                       ▼
      [ "Confirm & Add to Cart (₹760)" ]
```

---

## 3. Data Flow & Configuration Matrix

Admin Master Catalog me har product ke sath `product_uom_prices` linked hota hai. Modal yahi settings fetch karega:

| Field in `product_uom_prices` | Description for Customer Modal | Example (Cement) |
| :--- | :--- | :--- |
| `uom_id` / `uom.name` | Display name of the unit | `Bag (50 Kg)` ya `Kilogram` |
| `conversion_factor` | Base unit me conversion ratio | `50.0000` (1 Bag = 50 Kg) |
| `allow_loose_sale` | Agar `false`, toh modal me Loose option hide rahega | `true` |
| `min_order_qty` | Loose sale me minimum purchase limit | `5.00` Kg |
| `step_qty` | Quantity increment step | `1.00` Kg (5, 6, 7...) |
| `selling_price` / Vendor Amount | Per unit base price | Vendor selling rate |

---

## 4. API Specification for Customer Modal & Cart

### A. Fetch Product Packaging & Pricing for Modal
`GET /api/customer/products/{productId}/pricing-modal?vendor_id={vendorId}`

* **Response Payload:**
```json
{
  "auth_status": true,
  "res": "success",
  "msg": "Product pricing options loaded.",
  "data": {
    "product_id": 10,
    "product_name": "UltraTech Super Cement",
    "brand": "UltraTech",
    "cover_image_url": "https://domain.com/storage/products/covers/cement.jpg",
    "vendor": {
      "id": 4,
      "vendor_name": "Gupta Building Materials",
      "available_stock": 250.0,
      "base_uom": "Kg"
    },
    "options": [
      {
        "type": "package",
        "label": "Complete Package / Full Bag",
        "uom_id": 3,
        "uom_name": "Bag (50 Kg)",
        "unit_symbol": "bag",
        "conversion_factor": 50.0,
        "selling_price": 380.00,
        "mrp": 420.00,
        "min_qty": 1,
        "step_qty": 1,
        "is_default": true
      },
      {
        "type": "loose",
        "label": "Loose Quantity (By Kg)",
        "uom_id": 1,
        "uom_name": "Kilogram",
        "unit_symbol": "kg",
        "conversion_factor": 1.0,
        "selling_price": 8.50,
        "mrp": 10.00,
        "min_qty": 5.0,
        "step_qty": 1.0,
        "is_default": false
      }
    ]
  }
}
```

---

### B. Add to Cart with Selected Packaging
`POST /api/customer/cart/add`

* **Request Payload:**
```json
{
  "vendor_id": 4,
  "product_id": 10,
  "uom_id": 3,
  "purchase_type": "package",
  "quantity": 2
}
```

* **Backend Validation Logic:**
1. Check vendor has this product in `vendor_products`.
2. Calculate total base quantity needed: `base_qty_needed = quantity * conversion_factor` (e.g. 2 bags * 50 = 100 kg).
3. Verify against live stock: `if ($vendorProduct->stock < $base_qty_needed) => return error: "Only {$vendorProduct->stock} kg stock available"`.
4. Calculate final line item price: `total_price = quantity * unit_price` (2 * ₹380 = ₹760).
5. Store in `cart_items` table.

---

## 5. Cart Table Schema: `cart_items`

```php
Schema::create('cart_items', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
    $table->foreignId('vendor_id')->constrained('vendor_profiles')->cascadeOnDelete();
    $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
    $table->foreignId('uom_id')->constrained('units_of_measure');
    
    $table->enum('purchase_type', ['package', 'loose'])->default('package');
    $table->decimal('quantity', 10, 2);
    $table->decimal('conversion_factor', 14, 4)->default(1.0000);
    $table->decimal('base_quantity', 12, 2); // quantity * conversion_factor
    $table->decimal('unit_price', 12, 2);
    $table->decimal('total_price', 12, 2);   // quantity * unit_price

    $table->timestamps();
});
```

---

## 6. Frontend / Flutter Client Integration Tips
1. **Quantity Controls:**
   - Package mode me integer steps (+1, -1) chalenge.
   - Loose mode me `step_qty` (e.g. +1 kg ya +5 kg) chalega aur input field direct manual typing allow karega.
2. **Instant Price Update:**
   - UI me customer jaise hi quantity change kare, total price client-side instantly update ho taaki UX smooth aur fast lage.
3. **Out-of-Stock Feedback:**
   - Agar vendor ke paas 80 kg stock bacha hai aur customer 2 Bags (100 kg) choose karta hai, toh selector disable hoke tooltip ya banner me likha aayega: *"Only 1 Bag (50kg) or up to 80kg Loose available"*.
