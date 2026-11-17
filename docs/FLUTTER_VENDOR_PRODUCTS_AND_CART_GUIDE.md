# Flutter Integration Guide: Vendor Products, Stock Ledger & Customer Cart

Yeh document Flutter developers ke liye banaya gaya hai taaki naye **Vendor Product & Inventory Management**, **Stock Ledger Passbook**, aur **Customer Multi-UOM Add-to-Cart Modal** APIs ko Flutter application me bina kisi confusion ke implement kiya ja sake.

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

### B. Vendor Product Model
```dart
// lib/models/vendor_product_item.dart
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
  });

  factory VendorProductItem.fromJson(Map<String, dynamic> json) {
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
    );
  }
}
```

### C. Stock Ledger Passbook Model
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

### D. Customer Multi-UOM Pricing Modal Models
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
| **Master Catalog** | `GET` | `/vendor/products/catalog` | Admin ke added master products browse/search karna |
| **My Inventory** | `GET` | `/vendor/products/my-inventory` | Vendor ke apne active products, stock aur amount |
| **Add to Inventory** | `POST` | `/vendor/products/add-to-inventory` | Master product ko stock & price ke sath add karna |
| **Update Stock & Price** | `PUT` | `/vendor/products/{id}/update` | Price change aur physical audit stock adjust karna |
| **Quick Stock Arrival** | `POST` | `/vendor/products/{id}/add-stock` | New shipment/inward stock direct add karna |
| **Toggle Availability** | `PATCH` | `/vendor/products/{id}/toggle-status` | Product ko In-Stock / Out-of-Stock mark karna |
| **Stock Ledger Passbook**| `GET` | `/vendor/products/{id}/stock-ledger` | Har credit/debit transaction ka audit trail |

### 🛒 Customer Module
| Feature | Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Pricing Modal Config** | `GET` | `/customer/products/{id}/pricing-modal?vendor_id={vId}` | Public | Modal open hone par Full Pack vs Loose options |
| **Add to Cart** | `POST` | `/customer/cart/add` | Yes | Live vendor stock validation ke sath cart add |
| **Get Cart** | `GET` | `/customer/cart` | Yes | Active cart items aur total amount dekhna |
| **Delete from Cart** | `DELETE` | `/customer/cart/{id}` | Yes | Cart se item remove karna |

---

## 5. Vendor API Integration Details (Code Examples)

### A. Browse Master Catalog (`GET /vendor/products/catalog`)
Vendor ko Admin ke master products dikhata hai. Response me `is_already_added: true/false` flag aayega taaki UI me "Already in Inventory" badge dikha sakein.

* **Query Params:** `search`, `category_id`, `sub_category_id`, `brand_id`, `page`
* **Flutter Service Code:**
```dart
Future<ApiResponse<List<Map<String, dynamic>>>> getMasterCatalog({
  String? search,
  int? categoryId,
  int page = 1,
}) async {
  final queryParams = {
    if (search != null && search.isNotEmpty) 'search': search,
    if (categoryId != null) 'category_id': categoryId.toString(),
    'page': page.toString(),
  };

  final uri = Uri.parse('$baseUrl/vendor/products/catalog').replace(queryParameters: queryParams);
  final response = await http.get(uri, headers: authHeaders);
  final json = jsonDecode(response.body);

  return ApiResponse.fromJson(json, (data) {
    final list = data['data'] as List;
    return list.cast<Map<String, dynamic>>();
  });
}
```

---

### B. Add Product to Inventory (`POST /vendor/products/add-to-inventory`)
Master product select karke vendor apna stock aur amount set karega. Automatically **Opening Stock Ledger Entry** create ho jayegi.

* **Request Body:**
```json
{
  "product_id": 10,
  "stock": 50,
  "amount": 380.00,
  "mrp": 420.00,
  "min_order_qty": 1.0,
  "notes": "Opening lot from warehouse"
}
```

* **Flutter Service Code:**
```dart
Future<ApiResponse<dynamic>> addProductToInventory({
  required int productId,
  required double stock,
  required double amount,
  double? mrp,
  double minOrderQty = 1.0,
  String? notes,
}) async {
  final response = await http.post(
    Uri.parse('$baseUrl/vendor/products/add-to-inventory'),
    headers: authHeaders,
    body: jsonEncode({
      'product_id': productId,
      'stock': stock,
      'amount': amount,
      if (mrp != null) 'mrp': mrp,
      'min_order_qty': minOrderQty,
      if (notes != null) 'notes': notes,
    }),
  );

  return ApiResponse.fromJson(jsonDecode(response.body), (data) => data);
}
```

---

### C. Quick Stock Arrival (`POST /vendor/products/{id}/add-stock`)
Jab naya shipment ya truck godown me aaye, vendor quick inward quantity enter karega:

* **URL:** `/api/vendor/products/{vendor_product_id}/add-stock`
* **Request Body:**
```json
{
  "quantity_to_add": 100,
  "challan_or_invoice_no": "CH-2026-901",
  "notes": "Received 100 bags from UltraTech distributor"
}
```
* **Success Response:**
```json
{
  "auth_status": true,
  "res": "success",
  "msg": "Successfully added 100 stock to inventory.",
  "data": {
    "vendor_product_id": 4,
    "added_quantity": 100,
    "current_stock": 150,
    "is_available": true
  }
}
```

---

### D. Stock Ledger Passbook (`GET /vendor/products/{id}/stock-ledger`)
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
    "product_name": "UltraTech Super Cement 50kg",
    "current_stock": 150,
    "base_uom": "Bag (50 Kg)",
    "transactions": {
      "data": [
        {
          "id": 12,
          "transaction_type": "stock_inward",
          "flow": "inward",
          "quantity": 100,
          "balance_before": 50,
          "balance_after": 150,
          "reference_no": "CH-2026-901",
          "remarks": "Received from truck",
          "created_at": "2026-11-17T10:30:00Z"
        },
        {
          "id": 9,
          "transaction_type": "order_deduct",
          "flow": "outward",
          "quantity": 10,
          "balance_before": 60,
          "balance_after": 50,
          "reference_no": "ORD-8941",
          "remarks": "Customer Order Delivery",
          "created_at": "2026-11-16T14:20:00Z"
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
 • Option A: Full Package (e.g. 1 Bag = ₹380)
 • Option B: Loose Sale   (e.g. 1 Kg = ₹8.50) [Only if available]
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

### C. Live Stock Validation Error Handling
Agar customer vendor ke available stock se zyada quantity daalta hai, toh backend 400 error return karega:
```json
{
  "auth_status": true,
  "res": "error",
  "msg": "Insufficient stock! Vendor only has 10 quantity available in stock.",
  "data": {
    "available_stock": 10
  }
}
```
**Flutter Action:** SnackBar par direct `apiResponse.msg` show karein aur quantity selector ko max available stock par cap kar dein.

---

## 7. Flutter UI/UX Recommendations for Developers

1. **SnackBar Helper Function:**
   ```dart
   void showApiMessage(BuildContext context, ApiResponse response) {
     ScaffoldMessenger.of(context).showSnackBar(
       SnackBar(
         content: Text(response.msg),
         backgroundColor: response.isSuccess ? Colors.green : Colors.red,
       ),
     );
   }
   ```
2. **Dynamic Price Calculation on Client Side:**
   Modal open hone par user jaise hi `+` ya `-` kare, subtotal UI me instant update hona chahiye:
   ```dart
   double calculateSubtotal(PricingOption selectedOption, double quantity) {
     return selectedOption.sellingPrice * quantity;
   }
   ```
3. **Out of Stock Prevention:**
   Agar option ka `maxAvailableQty <= 0` ho, toh "Add to Cart" button ko disable kar dein aur label dikhayein: `"Out of Stock with this vendor"`.

---

## 8. Summary Checklist for Flutter Devs
- [ ] Add `api_response.dart`, `vendor_product_item.dart`, `stock_ledger_item.dart`, aur `pricing_modal_data.dart` to models.
- [ ] Implement `VendorProductService` for managing inventory and viewing stock ledger.
- [ ] Implement `CustomerCartService` for the dynamic package/loose modal and cart operations.
- [ ] Verify error handling: `response.msg` will always contain ready-to-display error messages.
