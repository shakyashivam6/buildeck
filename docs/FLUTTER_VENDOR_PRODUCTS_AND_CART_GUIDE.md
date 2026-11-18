# Flutter Integration Guide: Vendor Products, Multi-UOM & Customer Cart

Yeh document Flutter developers ke liye complete guide hai taaki naye **Vendor Product & Multi-UOM Packaging System**, **Loose vs Full Pack Control**, **Stock Ledger Passbook**, aur **Customer Multi-UOM Cart Modal** APIs ko Flutter application me seamlessly integrate kiya ja sake.

---

## 1. General Configuration

- **Base URL:**
  - **Android Emulator:** `http://10.0.2.2:8000/api`
  - **iOS Simulator / Local Web:** `http://127.0.0.1:8000/api`
  - **Physical Device:** `http://YOUR_LOCAL_WIFI_IP:8000/api`
  - **Production:** `https://your-domain.com/api`

- **Standard Headers:**
  ```http
  Accept: application/json
  Content-Type: application/json
  ```

- **Authenticated Headers (Protected Routes):**
  ```http
  Accept: application/json
  Content-Type: application/json
  Authorization: Bearer <SANCTUM_TOKEN>
  ```

> [!NOTE]
> Backend par `ForceJsonResponse` middleware enabled hai, iska matlab agar client se `Accept` header miss bhi ho jata hai, tab bhi **hamesha 100% JSON response** aayega (Kabhi bhi 302 login redirect ya HTML error page nahi aayega).

---

## 2. Standard API Response Structure

Backend ka har response is standard contract me return hota hai:

```json
{
  "auth_status": true,
  "res": "success",
  "msg": "Action completed successfully.",
  "token_type": "Bearer",
  "data": { ... }
}
```

* `auth_status` *(bool)*: `false` hone par token expired/invalid hai (User ko login screen par bhej dein).
* `res` *(string)*: `'success'` ya `'error'`.
* `msg` *(string)*: Clean user-facing text (Isko direct SnackBar / Toast / Alert dialog me display karein).
* `data` *(dynamic)*: Main response payload ya field-wise validation errors.

---

## 3. Ready-to-Use Dart Models

In models ko apne Flutter project ke `lib/models/` folder me copy-paste kar sakte hain:

### A. Base API Response Model
```dart
// lib/models/api_response.dart
class ApiResponse<T> {
  final bool authStatus;
  final String res;
  final String msg;
  final String tokenType;
  final T? data;

  ApiResponse({
    required this.authStatus,
    required this.res,
    required this.msg,
    required this.tokenType,
    this.data,
  });

  bool get isSuccess => res == 'success';

  factory ApiResponse.fromJson(
    Map<String, dynamic> json,
    T Function(dynamic json)? fromJsonT,
  ) {
    return ApiResponse<T>(
      authStatus: json['auth_status'] ?? false,
      res: json['res'] ?? 'error',
      msg: json['msg'] ?? '',
      tokenType: json['token_type'] ?? 'Bearer',
      data: json['data'] != null && fromJsonT != null
          ? fromJsonT(json['data'])
          : json['data'],
    );
  }
}
```

### B. Vendor UOM Pricing & Packaging Rule Model
```dart
// lib/models/vendor_uom_price.dart
class VendorUomPrice {
  final int? id;
  final int uomId;
  final String? uomName;
  final String? uomSymbol;
  final double conversionFactor;
  final double sellingPrice;
  final double? mrp;
  final bool allowLooseSale; // true = Loose allowed, false = Full Pack only
  final double minOrderQty;
  final double stepQty;
  final double? packContainQty;
  final bool isDefaultSellingUnit;

  VendorUomPrice({
    this.id,
    required this.uomId,
    this.uomName,
    this.uomSymbol,
    required this.conversionFactor,
    required this.sellingPrice,
    this.mrp,
    this.allowLooseSale = false,
    this.minOrderQty = 1.0,
    this.stepQty = 1.0,
    this.packContainQty,
    this.isDefaultSellingUnit = false,
  });

  factory VendorUomPrice.fromJson(Map<String, dynamic> json) {
    return VendorUomPrice(
      id: json['id'],
      uomId: json['uom_id'] ?? 0,
      uomName: json['uom_name'] ?? json['uom']?['name'],
      uomSymbol: json['uom_symbol'] ?? json['uom']?['symbol'],
      conversionFactor: (json['conversion_factor'] as num?)?.toDouble() ?? 1.0,
      sellingPrice: (json['selling_price'] as num?)?.toDouble() ?? 0.0,
      mrp: (json['mrp'] as num?)?.toDouble(),
      allowLooseSale: json['allow_loose_sale'] == true || json['allow_loose_sale'] == 1,
      minOrderQty: (json['min_order_qty'] as num?)?.toDouble() ?? 1.0,
      stepQty: (json['step_qty'] as num?)?.toDouble() ?? 1.0,
      packContainQty: (json['pack_contain_qty'] as num?)?.toDouble(),
      isDefaultSellingUnit: json['is_default_selling_unit'] == true || json['is_default_selling_unit'] == 1,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'uom_id': uomId,
      'conversion_factor': conversionFactor,
      'selling_price': sellingPrice,
      if (mrp != null) 'mrp': mrp,
      'allow_loose_sale': allowLooseSale,
      'min_order_qty': minOrderQty,
      'step_qty': stepQty,
      if (packContainQty != null) 'pack_contain_qty': packContainQty,
      'is_default_selling_unit': isDefaultSellingUnit,
    };
  }
}
```

### C. Vendor Product Inventory Item Model
```dart
// lib/models/vendor_product_item.dart
import 'vendor_uom_price.dart';

class VendorProductItem {
  final int vendorProductId;
  final int productId;
  final String name;
  final String? sku;
  final String? category;
  final String? subCategory;
  final String? brand;
  final String? baseUom;
  final String? baseUomSymbol;
  final String? coverImageUrl;
  final double stock;
  final double amount;
  final double? mrp;
  final double minOrderQty;
  final bool isAvailable;
  final List<VendorUomPrice> uomPrices;

  VendorProductItem({
    required this.vendorProductId,
    required this.productId,
    required this.name,
    this.sku,
    this.category,
    this.subCategory,
    this.brand,
    this.baseUom,
    this.baseUomSymbol,
    this.coverImageUrl,
    required this.stock,
    required this.amount,
    this.mrp,
    required this.minOrderQty,
    required this.isAvailable,
    this.uomPrices = const [],
  });

  factory VendorProductItem.fromJson(Map<String, dynamic> json) {
    final uomList = (json['uom_prices'] as List?) ?? [];
    return VendorProductItem(
      vendorProductId: json['vendor_product_id'] ?? 0,
      productId: json['product_id'] ?? 0,
      name: json['name'] ?? '',
      sku: json['sku'],
      category: json['category'],
      subCategory: json['sub_category'],
      brand: json['brand'],
      baseUom: json['base_uom'],
      baseUomSymbol: json['base_uom_symbol'],
      coverImageUrl: json['cover_image_url'],
      stock: (json['stock'] as num?)?.toDouble() ?? 0.0,
      amount: (json['amount'] as num?)?.toDouble() ?? 0.0,
      mrp: (json['mrp'] as num?)?.toDouble(),
      minOrderQty: (json['min_order_qty'] as num?)?.toDouble() ?? 1.0,
      isAvailable: json['is_available'] ?? true,
      uomPrices: uomList.map((e) => VendorUomPrice.fromJson(e)).toList(),
    );
  }
}
```

### D. Stock Ledger Passbook Model
```dart
// lib/models/stock_ledger_item.dart
class StockLedgerItem {
  final int id;
  final String transactionType;
  final String flow; // 'inward' or 'outward'
  final double quantity;
  final double balanceBefore;
  final double balanceAfter;
  final String? referenceNo;
  final String? remarks;
  final String? createdBy;
  final String? createdAt;

  StockLedgerItem({
    required this.id,
    required this.transactionType,
    required this.flow,
    required this.quantity,
    required this.balanceBefore,
    required this.balanceAfter,
    this.referenceNo,
    this.remarks,
    this.createdBy,
    this.createdAt,
  });

  bool get isInward => flow == 'inward';

  factory StockLedgerItem.fromJson(Map<String, dynamic> json) {
    return StockLedgerItem(
      id: json['id'] ?? 0,
      transactionType: json['transaction_type'] ?? '',
      flow: json['flow'] ?? 'inward',
      quantity: (json['quantity'] as num?)?.toDouble() ?? 0.0,
      balanceBefore: (json['balance_before'] as num?)?.toDouble() ?? 0.0,
      balanceAfter: (json['balance_after'] as num?)?.toDouble() ?? 0.0,
      referenceNo: json['reference_no'],
      remarks: json['remarks'],
      createdBy: json['created_by'],
      createdAt: json['created_at'],
    );
  }
}
```

### E. Customer Multi-UOM Pricing Modal Models
```dart
// lib/models/pricing_modal_data.dart
class PricingOption {
  final String type; // 'package' or 'loose'
  final String label;
  final int uomId;
  final String uomName;
  final String? unitSymbol;
  final double conversionFactor;
  final double sellingPrice;
  final double? mrp;
  final double minQty;
  final double stepQty;
  final bool isDefault;
  final double maxAvailableQty;

  PricingOption({
    required this.type,
    required this.label,
    required this.uomId,
    required this.uomName,
    this.unitSymbol,
    required this.conversionFactor,
    required this.sellingPrice,
    this.mrp,
    required this.minQty,
    required this.stepQty,
    required this.isDefault,
    required this.maxAvailableQty,
  });

  factory PricingOption.fromJson(Map<String, dynamic> json) {
    return PricingOption(
      type: json['type'] ?? 'package',
      label: json['label'] ?? '',
      uomId: json['uom_id'] ?? 0,
      uomName: json['uom_name'] ?? '',
      unitSymbol: json['unit_symbol'],
      conversionFactor: (json['conversion_factor'] as num?)?.toDouble() ?? 1.0,
      sellingPrice: (json['selling_price'] as num?)?.toDouble() ?? 0.0,
      mrp: (json['mrp'] as num?)?.toDouble(),
      minQty: (json['min_qty'] as num?)?.toDouble() ?? 1.0,
      stepQty: (json['step_qty'] as num?)?.toDouble() ?? 1.0,
      isDefault: json['is_default'] ?? false,
      maxAvailableQty: (json['max_available_qty'] as num?)?.toDouble() ?? 0.0,
    );
  }
}

class PricingModalData {
  final int productId;
  final String productName;
  final String? brand;
  final String? coverImageUrl;
  final String? baseUom;
  final int vendorId;
  final String vendorName;
  final double availableStock;
  final List<PricingOption> options;

  PricingModalData({
    required this.productId,
    required this.productName,
    this.brand,
    this.coverImageUrl,
    this.baseUom,
    required this.vendorId,
    required this.vendorName,
    required this.availableStock,
    required this.options,
  });

  factory PricingModalData.fromJson(Map<String, dynamic> json) {
    final vendor = json['vendor'] ?? {};
    final list = (json['options'] as List?) ?? [];
    return PricingModalData(
      productId: json['product_id'] ?? 0,
      productName: json['product_name'] ?? '',
      brand: json['brand'],
      coverImageUrl: json['cover_image_url'],
      baseUom: json['base_uom'],
      vendorId: vendor['id'] ?? 0,
      vendorName: vendor['vendor_name'] ?? '',
      availableStock: (vendor['available_stock'] as num?)?.toDouble() ?? 0.0,
      options: list.map((e) => PricingOption.fromJson(e)).toList(),
    );
  }
}
```

---

## 4. Endpoints Overview Table

### 🏢 Vendor Module (Protected: `auth:sanctum`)
| Feature | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Master Catalog** | `GET` | `/vendor/products/catalog` | Master products browse karna (Includes recommended `uom_prices`) |
| **My Inventory** | `GET` | `/vendor/products/my-inventory` | Active inventory, current stock aur vendor ke `uom_prices` |
| **Add to Inventory** | `POST` | `/vendor/products/add-to-inventory` | Add product with Multi-UOM, prices & Loose vs Pack rules |
| **Update Stock & Price** | `PUT` | `/vendor/products/{id}/update` | Update prices, loose toggles, ya physical count audit |
| **Quick Stock Arrival** | `POST` | `/vendor/products/{id}/add-stock` | Inward shipment/stock arrival direct add karna |
| **Toggle Availability** | `PATCH` | `/vendor/products/{id}/toggle-status` | Product ko In-Stock / Out-of-Stock mark karna |
| **Stock Ledger Passbook**| `GET` | `/vendor/products/{id}/stock-ledger` | Har credit/debit transaction ka audit trail |

### 🛒 Customer Module
| Feature | Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Pricing Modal Config** | `GET` | `/customer/products/{id}/pricing-modal?vendor_id={vId}` | Public | Vendor ke loose vs package options fetch karna |
| **Add to Cart** | `POST` | `/customer/cart/add` | Yes | Live vendor stock & loose rule validation |
| **Get Cart** | `GET` | `/customer/cart` | Yes | Active cart items dekhna |
| **Delete from Cart** | `DELETE` | `/customer/cart/{id}` | Yes | Cart item remove karna |

---

## 5. Vendor API Integration Details (Code Examples)

### A. Browse Master Catalog (`GET /vendor/products/catalog`)
Vendor ko Admin ke master products dikhata hai. Har product ke andar `uom_prices` list hoti hai jo recommended units aur loose defaults batati hai.

* **Response Payload Snippet:**
```json
{
  "auth_status": true,
  "res": "success",
  "data": {
    "data": [
      {
        "id": 1,
        "name": "UltraTech Super PPC Cement",
        "sku": "CEMENT-UT-50",
        "base_uom": { "id": 1, "name": "Kilogram", "symbol": "kg" },
        "is_already_added": false,
        "uom_prices": [
          {
            "uom_id": 2,
            "uom": { "name": "Bag (50 Kg)", "symbol": "bag" },
            "conversion_factor": "50.0000",
            "selling_price": "385.00",
            "mrp": "420.00",
            "allow_loose_sale": false,
            "pack_contain_qty": "50.00",
            "is_default_selling_unit": true
          },
          {
            "uom_id": 1,
            "uom": { "name": "Kilogram", "symbol": "kg" },
            "conversion_factor": "1.0000",
            "selling_price": "8.50",
            "mrp": "10.00",
            "allow_loose_sale": true,
            "is_default_selling_unit": false
          }
        ]
      }
    ]
  }
}
```

---

### B. Add Product to Inventory with Multi-UOM & Loose Control (`POST /vendor/products/add-to-inventory`)

Jab vendor master product add karta hai, to wo har unit ke liye apna price aur **`allow_loose_sale`** toggle specify karta hai:

#### 1. Full Package vs Loose Sale Concept:
* `allow_loose_sale: false` ➔ **Full Pack Only.** Customer ko pura sealed pack (e.g., 50 Kg Bag / 16 Sq. Ft Box) hi buy karna hoga.
* `allow_loose_sale: true` ➔ **Loose Allowed.** Customer khula retail (e.g., 5 Kg Cement ya 2 Loose Tiles) buy kar sakta hai.

#### 2. Request Body Payload:
```json
{
  "product_id": 1,
  "stock": 200,
  "notes": "Opening stock from warehouse",
  "pricing_matrix": [
    {
      "uom_id": 2,
      "conversion_factor": 50.0000,
      "selling_price": 385.00,
      "mrp": 420.00,
      "allow_loose_sale": false,
      "min_order_qty": 1.0,
      "step_qty": 1.0,
      "pack_contain_qty": 50.0,
      "is_default_selling_unit": true
    },
    {
      "uom_id": 1,
      "conversion_factor": 1.0000,
      "selling_price": 8.50,
      "mrp": 10.00,
      "allow_loose_sale": true,
      "min_order_qty": 5.0,
      "step_qty": 1.0,
      "is_default_selling_unit": false
    }
  ]
}
```

> [!TIP]
> **Backward Compatibility:** Agar purana client sirf `"amount": 385.00` aur `"stock": 200` bhejta hai, toh backend automatically default base UOM ke sath single pricing tier create kar dega.

#### 3. Flutter Service Method:
```dart
Future<ApiResponse<dynamic>> addProductToInventory({
  required int productId,
  required double stock,
  required List<VendorUomPrice> pricingMatrix,
  String? notes,
}) async {
  final defaultRow = pricingMatrix.firstWhere(
    (e) => e.isDefaultSellingUnit,
    orElse: () => pricingMatrix.first,
  );

  final body = {
    'product_id': productId,
    'stock': stock,
    'amount': defaultRow.sellingPrice,
    'mrp': defaultRow.mrp,
    'min_order_qty': defaultRow.minOrderQty,
    if (notes != null) 'notes': notes,
    'pricing_matrix': pricingMatrix.map((e) => e.toJson()).toList(),
  };

  final response = await http.post(
    Uri.parse('$baseUrl/vendor/products/add-to-inventory'),
    headers: authHeaders,
    body: jsonEncode(body),
  );

  return ApiResponse.fromJson(jsonDecode(response.body), (data) => data);
}
```

---

### C. Update Vendor Product Stock & UOM Rules (`PUT /vendor/products/{id}/update`)

Vendor kisi bhi waqt apna price, physical stock count, ya loose sale permission update kar sakta hai:

* **URL:** `/api/vendor/products/{vendor_product_id}/update`
* **Request Body Payload:**
```json
{
  "stock": 190,
  "reason": "Physical godown count verification",
  "pricing_matrix": [
    {
      "uom_id": 2,
      "conversion_factor": 50.0000,
      "selling_price": 390.00,
      "mrp": 420.00,
      "allow_loose_sale": false,
      "min_order_qty": 1.0,
      "step_qty": 1.0,
      "is_default_selling_unit": true
    },
    {
      "uom_id": 1,
      "conversion_factor": 1.0000,
      "selling_price": 9.00,
      "mrp": 10.00,
      "allow_loose_sale": true,
      "min_order_qty": 5.0,
      "step_qty": 1.0,
      "is_default_selling_unit": false
    }
  ]
}
```

---

### D. Quick Stock Arrival (`POST /vendor/products/{id}/add-stock`)
Jab naya shipment/truck godown me aaye, vendor quick inward quantity enter karega:

* **URL:** `/api/vendor/products/{vendor_product_id}/add-stock`
* **Request Body:**
```json
{
  "quantity_to_add": 100,
  "challan_or_invoice_no": "CH-2026-901",
  "notes": "Received 100 bags from distributor"
}
```

---

### E. Stock Ledger Passbook (`GET /vendor/products/{id}/stock-ledger`)
Har product ki complete passbook (Kis date ko kitna stock aaya, kis order me kitna minus hua, audit adjustment kya hua).

* **URL:** `/api/vendor/products/{vendor_product_id}/stock-ledger`
* **Response Sample:**
```json
{
  "auth_status": true,
  "res": "success",
  "msg": "Stock ledger fetched successfully.",
  "data": {
    "vendor_product_id": 4,
    "product_name": "UltraTech Super PPC Cement",
    "current_stock": 250,
    "base_uom": "Kilogram (kg)",
    "transactions": {
      "data": [
        {
          "id": 12,
          "transaction_type": "opening_stock",
          "flow": "inward",
          "quantity": 250,
          "balance_before": 0,
          "balance_after": 250,
          "reference_no": null,
          "remarks": "Initial opening stock allotment",
          "created_at": "2026-11-18T10:30:00Z"
        }
      ]
    }
  }
}
```

---

## 6. Customer Add-to-Cart Modal Flow & Integration

Jab customer item card par **"Add to Cart"** tap karega:

```
[ Step 1: Call Pricing Modal API ]
GET /api/customer/products/{productId}/pricing-modal?vendor_id={vendorId}
                 │
                 ▼
[ Step 2: Open Flutter BottomSheet / Dialog ]
 • Option A: Complete Package (e.g. 1 Bag = ₹385)
 • Option B: Loose Sale       (e.g. 1 Kg = ₹8.50) [Only if vendor enabled allow_loose_sale!]
 • Quantity Selector (+ / -)
 • Real-time Calculation: Subtotal = Quantity × Unit Price
                 │
                 ▼
[ Step 3: Call Add to Cart API ]
POST /api/customer/cart/add
```

### A. Load Modal Data
```dart
Future<PricingModalData?> loadModalData({
  required int productId,
  required int vendorId,
}) async {
  final uri = Uri.parse('$baseUrl/customer/products/$productId/pricing-modal?vendor_id=$vendorId');
  final response = await http.get(uri, headers: {'Accept': 'application/json'});
  final json = jsonDecode(response.body);

  if (json['res'] == 'success') {
    return PricingModalData.fromJson(json['data']);
  }
  return null;
}
```

### B. Add to Cart Call
```dart
Future<ApiResponse<dynamic>> addToCart({
  required int vendorId,
  required int productId,
  required int uomId,
  required String purchaseType, // 'package' or 'loose'
  required double quantity,
}) async {
  final response = await http.post(
    Uri.parse('$baseUrl/customer/cart/add'),
    headers: authHeaders,
    body: jsonEncode({
      'vendor_id': vendorId,
      'product_id': productId,
      'uom_id': uomId,
      'purchase_type': purchaseType,
      'quantity': quantity,
    }),
  );

  return ApiResponse.fromJson(jsonDecode(response.body), (data) => data);
}
```

### C. Loose Sale Protection & Error Handling
Agar customer aisi item par loose select karta hai jisko vendor ne **Full Pack Only (`allow_loose_sale: false`)** kiya hua hai, to backend `422` error return karta hai:

```json
{
  "auth_status": true,
  "res": "error",
  "msg": "This vendor does not allow loose sale for this item. Please select full package.",
  "data": null
}
```

---

## 7. Flutter UI/UX Widget Example: Loose vs Package Switch

Vendor application me product add karte waqt har UOM ke card par SwitchListTile dikhayein:

```dart
Widget buildUomPriceRow(VendorUomPrice item, void Function(VendorUomPrice updated) onChanged) {
  return Card(
    margin: const EdgeInsets.symmetric(vertical: 8),
    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
    child: Padding(
      padding: const EdgeInsets.all(12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.between,
            children: [
              Text(
                item.uomName ?? 'Selling Unit',
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
              ),
              if (item.isDefaultSellingUnit)
                const Chip(
                  label: Text('Default Unit', style: TextStyle(fontSize: 10, color: Colors.white)),
                  backgroundColor: Colors.blue,
                  visualDensity: VisualDensity.compact,
                ),
            ],
          ),
          const SizedBox(height: 8),
          TextFormField(
            initialValue: item.sellingPrice.toString(),
            keyboardType: const TextInputType.numberWithOptions(decimal: true),
            decoration: const InputDecoration(
              labelText: 'Selling Price (₹) *',
              border: OutlineInputBorder(),
              isDense: true,
            ),
            onChanged: (val) {
              final p = double.tryParse(val) ?? item.sellingPrice;
              onChanged(VendorUomPrice(
                uomId: item.uomId,
                uomName: item.uomName,
                uomSymbol: item.uomSymbol,
                conversionFactor: item.conversionFactor,
                sellingPrice: p,
                mrp: item.mrp,
                allowLooseSale: item.allowLooseSale,
                minOrderQty: item.minOrderQty,
                stepQty: item.stepQty,
                packContainQty: item.packContainQty,
                isDefaultSellingUnit: item.isDefaultSellingUnit,
              ));
            },
          ),
          const SizedBox(height: 8),
          SwitchListTile(
            contentPadding: EdgeInsets.zero,
            title: const Text('Sell as Loose? (Khula bechna allow karein?)', style: TextStyle(fontSize: 14)),
            subtitle: Text(
              item.allowLooseSale ? 'Yes - Loose Retail Allowed' : 'No - Full Pack Only',
              style: TextStyle(
                fontSize: 12,
                color: item.allowLooseSale ? Colors.green : Colors.red,
                fontWeight: FontWeight.w600,
              ),
            ),
            value: item.allowLooseSale,
            onChanged: (bool newVal) {
              onChanged(VendorUomPrice(
                uomId: item.uomId,
                uomName: item.uomName,
                uomSymbol: item.uomSymbol,
                conversionFactor: item.conversionFactor,
                sellingPrice: item.sellingPrice,
                mrp: item.mrp,
                allowLooseSale: newVal,
                minOrderQty: item.minOrderQty,
                stepQty: item.stepQty,
                packContainQty: item.packContainQty,
                isDefaultSellingUnit: item.isDefaultSellingUnit,
              ));
            },
          ),
        ],
      ),
    ),
  );
}
```

---

## 8. Summary Checklist for Flutter Devs
- [ ] Add `VendorUomPrice` model to `lib/models/vendor_uom_price.dart`.
- [ ] Update `VendorProductItem` model with `List<VendorUomPrice> uomPrices`.
- [ ] In `POST /vendor/products/add-to-inventory`, pass `pricing_matrix` with `allow_loose_sale` booleans.
- [ ] In `GET /vendor/products/my-inventory`, display `Loose Allowed` / `Full Pack Only` badges using `uom_prices`.
- [ ] In Customer App `GET /customer/products/{id}/pricing-modal`, verify that if vendor has `allow_loose_sale: false`, the loose radio option is hidden or disabled.
