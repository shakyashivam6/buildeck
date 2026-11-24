# BuilDeck - Customer Mobile API & Flutter Implementation Guide

> **Base URL:** `https://your-domain.com/api` (Local: `http://10.0.2.2:8000/api` for Android Emulator or `http://127.0.0.1:8000/api` for iOS Simulator / Web)  
> **Default Headers:**
> ```http
> Accept: application/json
> Content-Type: application/json
> ```
> For Authenticated Requests:
> ```http
> Authorization: Bearer <SANCTUM_TOKEN>
> ```

---

## 📌 1. Architectural Overview & Flutter Flow

Building materials marketplace me customer experience ko high-speed, localized, aur transparent banane ke liye ye architecture follow hoti hai:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. LOCATION CAPTURE                                                         │
│ • Flutter app fetches GPS (lat, long) via Geolocator or Address Picker      │
│ • Sent optionally during Login or passed as query params in Catalog API     │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 2. CUSTOMER AUTHENTICATION (Login / Registration)                           │
│ • POST /api/customer/login (Accepts login, password, optional lat, long)    │
│ • Returns Sanctum Token & User profile (Items are fetched via Catalog API)  │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 3. HOME / GEO-CATALOG SCREEN (Dedicated API)                                │
│ • GET /api/customer/catalog?lat=26.38967&long=80.48587346                   │
│ • Backend filters: Haversine distance <= vendor.supply_radius               │
│ • Card UI: [ Item Image ] | [ Item Name ] | [ small text: Brand Name ]      │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ Customer taps an Item Card
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 4. ITEM DETAILS SCREEN & NEARBY VENDORS (Single Page Multi-Vendor View)     │
│ • GET /api/customer/products/{productId}?lat=26.38967&long=80.48587346      │
│ • Top: Image carousel, Specs, Description, Category, Base UOM               │
│ • Bottom Section: "Available Vendors in Your Area"                          │
│   • Vendor Shop Name, Exact Distance in KM (e.g. 2.3 km), In Stock status   │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ Customer taps on any Vendor Card
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 5. VENDOR PRICING BOTTOM DRAWER (ModalBottomSheet)                          │
│ • GET /api/customer/products/{productId}/pricing-modal?vendor_id={vendorId} │
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ 🏪 Gupta Building Materials (2.3 km away)                    [✖ Close] │ │
│ │ ─────────────────────────────────────────────────────────────────────── │ │
│ │ OPTION A: Complete Packet                                               │ │
│ │ • Full Bag (50 Kg) @ ₹380.00 / Bag                                      │ │
│ │ • Quantity Stepper: [ - ]  1  [ + ]                                     │ │
│ │ • [🛒 Add to Cart (₹380.00)]                                             │ │
│ │ ─────────────────────────────────────────────────────────────────────── │ │
│ │ OPTION B: Loose Sale (If vendor allows loose sale)                      │ │
│ │ • Rate: ₹8.00 / Kg (Min order: 5 Kg)                                    │ │
│ │ • Custom Numerical Input: [  15.5  ] Kg                                 │ │
│ │ • Dynamic Subtotal Calculation: 15.5 × ₹8 = ₹124.00                     │ │
│ │ • [🛒 Add to Cart (₹124.00)]                                             │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ Add to Cart / Compare Other Vendors
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 6. MULTI-VENDOR COMPARISON & CART MANAGEMENT                                │
│ • Customer can close drawer, tap Vendor B on same page, check their rate    │
│ • POST /api/customer/cart/add                                               │
│ • GET /api/customer/cart                                                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📌 2. Standard API Response Structure

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

- `auth_status` *(bool)*: `false` hone par token expired/invalid hai (User ko login screen par redirect karein).
- `res` *(string)*: `"success"` ya `"error"`.
- `msg` *(string)*: Clean human-readable message (Direct SnackBar / Toast / Alert dialog me display karein).
- `data` *(dynamic)*: Main response payload.

---

## 🗺️ 3. Location Support Dropdown APIs

### 3.1 Get All States
- **Method:** `GET`
- **URL:** `/locations/states`
- **Auth:** Not required

#### ✅ Success Response (200 OK)
```json
{
  "auth_status": false,
  "res": "success",
  "msg": "States fetched successfully.",
  "token_type": "Bearer",
  "data": [
    { "id": 10, "name": "Delhi" },
    { "id": 24, "name": "Maharashtra" },
    { "id": 33, "name": "Uttar Pradesh" }
  ]
}
```

### 3.2 Get Cities by State ID
- **Method:** `GET`
- **URL:** `/locations/cities/{stateId}` (e.g. `/locations/cities/33`)
- **Auth:** Not required

#### ✅ Success Response (200 OK)
```json
{
  "auth_status": false,
  "res": "success",
  "msg": "Cities fetched successfully.",
  "token_type": "Bearer",
  "data": [
    { "id": 101, "name": "Lucknow" },
    { "id": 102, "name": "Kanpur" },
    { "id": 103, "name": "Noida" }
  ]
}
```

---

## 👤 4. Customer Authentication APIs

### 4.1 Customer Registration
- **Method:** `POST`
- **URL:** `/customer/register`
- **Content-Type:** `multipart/form-data`
- **Auth:** Not required

#### 📥 Form-Data Parameters:
| Key | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | String | **Yes** | Full Name of Customer |
| `mobile` | String | **Yes** | 10-digit mobile number |
| `email` | String | No | Valid email address |
| `state_id` | Integer | **Yes** | State ID from `/locations/states` |
| `city_id` | Integer | **Yes** | City ID from `/locations/cities/{stateId}` |
| `address` | String | No | Street address |
| `zip` | String | No | 6-digit Pincode |
| `lat` | Double | No | Optional GPS Latitude |
| `long` | Double | No | Optional GPS Longitude |
| `password` | String | No | Optional password (min 6 chars) |
| `profile_pic`| File | No | Profile photo (`.jpg`, `.png`, max 5MB) |
| `aadhaar_doc`| File | No | Aadhaar document (`.pdf`, `.jpg`, max 5MB) |
| `pan_doc` | File | No | PAN card document (`.pdf`, `.jpg`, max 5MB) |

---

### 4.2 Customer Login
Customer login using Mobile (or Email) and Password.

- **Method:** `POST`
- **URL:** `/customer/login`
- **Content-Type:** `application/json`
- **Auth:** Not required

#### 📥 Request Body
```json
{
  "login": "9876543210",
  "password": "yourPassword123",
  "lat": 26.38967,
  "long": 80.48587346,
  "latlong": "(26.38967,80.48587346)"
}
```
> [!TIP]
> `lat`, `long`, aur `latlong` keys **completely optional** hain. Agar Flutter client se location bhejenge, toh backend user ke profile coordinates ko automatically update kar deta hai. Login ke baad items ki list alag dedicated Catalog API se fetch ki jati hai.

#### ✅ Success Response (200 OK)
```json
{
  "auth_status": true,
  "res": "success",
  "msg": "Login successful.",
  "token_type": "Bearer",
  "data": {
    "token": "1|qXyZ1234567890abcdef...",
    "user": {
      "id": 14,
      "name": "Amit Customer",
      "email": "amit@example.com",
      "mobile": "9876543210",
      "role": "customer",
      "status": "approved",
      "address": "Flat 402, Lotus Arena, Sector 150",
      "city": "Noida",
      "state": "Uttar Pradesh",
      "zip": "201301",
      "lat": 26.38967,
      "long": 80.48587346,
      "profile_pic": "https://domain.com/storage/customer_documents/photo123.jpg"
    },
    "customer_location": {
      "lat": 26.38967,
      "long": 80.48587346
    }
  }
}
```

---

## 🛍️ 5. Customer Geo-Catalog & Product Discovery APIs

### 5.1 Get Geo-Located Items Catalog (Home / Catalog Screen)
Customer ke GPS coordinates (`lat`, `long`) ke hisaab se unhi master products ko flash karta hai jo customer ke area me deliver karne wale active & approved vendors ke paas in-stock hain.

- **Method:** `GET`
- **URL:** `/customer/catalog`
- **Query Parameters:**
  - `lat` (optional float): e.g. `26.38967`
  - `long` (optional float): e.g. `80.48587346`
  - `latlong` (optional string): e.g. `"(26.38967,80.48587346)"`
  - `search` (optional string): Search by product name or brand
  - `category_id` (optional int): Category filter ID
- **Auth:** Optional (Agar user logged in hai aur query me coords nahi diye, toh saved profile coords use honge)

#### ✅ Success Response (200 OK)
```json
{
  "auth_status": true,
  "res": "success",
  "msg": "Nearby items fetched successfully.",
  "token_type": "Bearer",
  "data": {
    "customer_location": {
      "lat": 26.38967,
      "long": 80.48587346
    },
    "total_items": 12,
    "items": [
      {
        "id": 10,
        "name": "UltraTech Super Cement",
        "brand_name": "UltraTech",
        "cover_image_url": "https://domain.com/storage/products/ultratech-cement.jpg",
        "base_uom": "Kilogram",
        "base_uom_symbol": "kg",
        "available_vendors_count": 3,
        "starting_price": 380.00
      },
      {
        "id": 14,
        "name": "Kamdhenu TMT Steel Bar 12mm",
        "brand_name": "Kamdhenu",
        "cover_image_url": "https://domain.com/storage/products/kamdhenu-12mm.jpg",
        "base_uom": "Piece",
        "base_uom_symbol": "pcs",
        "available_vendors_count": 2,
        "starting_price": 540.00
      }
    ]
  }
}
```

> [!IMPORTANT]
> **Flutter Card Design Guidelines:**
> 1. Card ke top par **Item Image** (`cover_image_url`).
> 2. Neeche bold text me **Item Name** (`name`).
> 3. Item Name ke theek neeche small text me **Brand Name** (`brand_name` - e.g. `by UltraTech`).
> 4. Footer me starting price (e.g. `From ₹380.00`) aur `3 Vendors Nearby` pill badge.

---

### 5.2 Get Product Details & Available Vendors in Area
Jab customer catalog me kisi item par tap karta hai, tab ye endpoint full technical specifications aur customer ke area me supply karne wale **sabhi nearby vendors ki live list** laata hai.

- **Method:** `GET`
- **URL:** `/customer/products/{productId}`
- **Query Parameters:**
  - `lat` (optional float): Customer latitude
  - `long` (optional float): Customer longitude
- **Auth:** Optional

#### ✅ Success Response (200 OK)
```json
{
  "auth_status": true,
  "res": "success",
  "msg": "Product details and nearby vendors loaded.",
  "token_type": "Bearer",
  "data": {
    "product": {
      "id": 10,
      "name": "UltraTech Super Cement",
      "slug": "ultratech-super-cement",
      "sku": "CEM-ULT-001",
      "brand": {
        "id": 2,
        "name": "UltraTech",
        "logo_url": "https://domain.com/storage/brands/ultratech.png"
      },
      "category": {
        "id": 1,
        "name": "Cement & Concrete"
      },
      "sub_category": {
        "id": 3,
        "name": "PPC Cement"
      },
      "cover_image_url": "https://domain.com/storage/products/ultratech-cement.jpg",
      "gallery_image_urls": [
        "https://domain.com/storage/products/cement-1.jpg",
        "https://domain.com/storage/products/cement-2.jpg"
      ],
      "base_uom": "Kilogram",
      "base_uom_symbol": "kg",
      "description": "High grade Portland Pozzolana Cement for heavy construction.",
      "specifications": {
        "grade": "PPC 53 Equivalent",
        "color": "Grey"
      }
    },
    "nearby_vendors": [
      {
        "vendor_id": 4,
        "vendor_name": "Gupta Building Materials",
        "owner_name": "Ramesh Gupta",
        "address": "Shop 12, Sector 18 Market, Noida",
        "distance_km": 2.3,
        "available_stock": 250.0,
        "is_in_stock": true,
        "starting_price": 380.00,
        "allows_loose_sale": true,
        "rating": 4.8
      },
      {
        "vendor_id": 9,
        "vendor_name": "Sharma Building Mart",
        "owner_name": "Vipin Sharma",
        "address": "Plot 45, Industrial Area, Sector 62",
        "distance_km": 4.1,
        "available_stock": 500.0,
        "is_in_stock": true,
        "starting_price": 375.00,
        "allows_loose_sale": false,
        "rating": 4.6
      }
    ],
    "customer_location": {
      "lat": 26.38967,
      "long": 80.48587346
    }
  }
}
```

---

### 5.3 Vendor Pricing Drawer (BottomSheet Modal)
Jab customer product details screen par kisi vendor par click karta hai, tab bottom se ek modal drawer flash hota hai jo is specific vendor ke rate aur packaging formats lata hai.

- **Method:** `GET`
- **URL:** `/customer/products/{productId}/pricing-modal?vendor_id={vendorId}`
- **Auth:** Optional / Recommended Bearer Token

#### ✅ Success Response (200 OK)
```json
{
  "auth_status": true,
  "res": "success",
  "msg": "Product packaging & pricing options loaded.",
  "token_type": "Bearer",
  "data": {
    "product_id": 10,
    "product_name": "UltraTech Super Cement",
    "brand": "UltraTech",
    "cover_image_url": "https://domain.com/storage/products/ultratech-cement.jpg",
    "base_uom": "Kilogram",
    "vendor": {
      "id": 4,
      "vendor_name": "Gupta Building Materials",
      "available_stock": 250.0
    },
    "options": [
      {
        "type": "package",
        "label": "Full Package (50 kg)",
        "uom_id": 3,
        "uom_name": "Bag (50 Kg)",
        "unit_symbol": "bag",
        "conversion_factor": 50.0,
        "selling_price": 380.00,
        "mrp": 420.00,
        "min_qty": 1.0,
        "step_qty": 1.0,
        "is_default": true,
        "max_available_qty": 5.0
      },
      {
        "type": "loose",
        "label": "Loose / Retail Sale (By Kilogram)",
        "uom_id": 1,
        "uom_name": "Kilogram",
        "unit_symbol": "kg",
        "conversion_factor": 1.0,
        "selling_price": 8.00,
        "mrp": null,
        "min_qty": 5.0,
        "step_qty": 1.0,
        "is_default": false,
        "max_available_qty": 250.0
      }
    ]
  }
}
```

> [!IMPORTANT]
> **Drawer UI Behavior:**
> - **Case A: Complete Packet (`type: 'package'`):**
>   - Packet label (e.g. `Bag (50 Kg)`).
>   - Price flash: `₹380.00 / Bag`.
>   - Stepper: `[ - ]  1  [ + ]` (steps by `step_qty`).
>   - `Add to Cart` button with live total.
> - **Case B: Loose Sale (`type: 'loose'`):**
>   - Per-unit rate: `₹8.00 / Kg` (Min order: `5 Kg`).
>   - **Quantity Input Field:** Text box jisme user desired quantity type karta hai (e.g. `15.5`).
>   - Live Calculation: `15.5 kg × ₹8.00 = ₹124.00`.
>   - `Add to Cart` button.
> - Customer drawer band karke usi page par kisi doosre vendor par click karke unka price bhi check kar sakta hai!

---

### 5.4 Add to Cart
Drawer me "Add to Cart" tap karne par item customer ke cart me save hota hai.

- **Method:** `POST`
- **URL:** `/customer/cart/add`
- **Headers:** `Authorization: Bearer <TOKEN>`
- **Content-Type:** `application/json`

#### 📥 Request Body (Complete Package):
```json
{
  "vendor_id": 4,
  "product_id": 10,
  "uom_id": 3,
  "purchase_type": "package",
  "quantity": 2
}
```

#### 📥 Request Body (Loose Sale with Custom Quantity):
```json
{
  "vendor_id": 4,
  "product_id": 10,
  "uom_id": 1,
  "purchase_type": "loose",
  "quantity": 15.5
}
```

#### ✅ Success Response (201 Created)
```json
{
  "auth_status": true,
  "res": "success",
  "msg": "Item successfully added to cart.",
  "token_type": "Bearer",
  "data": {
    "cart_item_id": 28,
    "product_name": "UltraTech Super Cement",
    "vendor_name": "Gupta Building Materials",
    "uom": "Kilogram",
    "purchase_type": "loose",
    "quantity": 15.5,
    "unit_price": 8.00,
    "total_price": 124.00
  }
}
```

---

### 5.5 Get Customer Cart
- **Method:** `GET`
- **URL:** `/customer/cart`
- **Headers:** `Authorization: Bearer <TOKEN>`

#### ✅ Success Response (200 OK)
```json
{
  "auth_status": true,
  "res": "success",
  "msg": "Cart fetched successfully.",
  "token_type": "Bearer",
  "data": {
    "total_cart_amount": 884.00,
    "total_items_count": 2,
    "items": [
      {
        "id": 28,
        "product_id": 10,
        "product_name": "UltraTech Super Cement",
        "cover_image_url": "https://domain.com/storage/products/cement.jpg",
        "vendor_id": 4,
        "vendor_name": "Gupta Building Materials",
        "uom_id": 1,
        "uom_name": "Kilogram",
        "purchase_type": "loose",
        "quantity": 15.5,
        "unit_price": 8.00,
        "total_price": 124.00
      },
      {
        "id": 29,
        "product_id": 10,
        "product_name": "UltraTech Super Cement",
        "cover_image_url": "https://domain.com/storage/products/cement.jpg",
        "vendor_id": 4,
        "vendor_name": "Gupta Building Materials",
        "uom_id": 3,
        "uom_name": "Bag (50 Kg)",
        "purchase_type": "package",
        "quantity": 2.0,
        "unit_price": 380.00,
        "total_price": 760.00
      }
    ]
  }
}
```

---

### 5.6 Remove Item from Cart
- **Method:** `DELETE`
- **URL:** `/customer/cart/{cartItemId}` (e.g. `/customer/cart/28`)
- **Headers:** `Authorization: Bearer <TOKEN>`

---

## 🛠️ 6. Ready-to-Use Flutter Dart Models

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

### B. Catalog Item Model (Home Grid Screen)
```dart
// lib/models/catalog_item.dart
class CatalogItem {
  final int id;
  final String name;
  final String brandName;
  final String? coverImageUrl;
  final String baseUom;
  final String baseUomSymbol;
  final int availableVendorsCount;
  final double startingPrice;

  CatalogItem({
    required this.id,
    required this.name,
    required this.brandName,
    this.coverImageUrl,
    required this.baseUom,
    required this.baseUomSymbol,
    required this.availableVendorsCount,
    required this.startingPrice,
  });

  factory CatalogItem.fromJson(Map<String, dynamic> json) {
    return CatalogItem(
      id: json['id'],
      name: json['name'] ?? '',
      brandName: json['brand_name'] ?? '',
      coverImageUrl: json['cover_image_url'],
      baseUom: json['base_uom'] ?? '',
      baseUomSymbol: json['base_uom_symbol'] ?? '',
      availableVendorsCount: json['available_vendors_count'] ?? 0,
      startingPrice: (json['starting_price'] as num?)?.toDouble() ?? 0.0,
    );
  }
}
```

### C. Product Details & Nearby Vendor Models
```dart
// lib/models/product_details.dart
class ProductDetailsResponse {
  final ProductDetails product;
  final List<NearbyVendor> nearbyVendors;

  ProductDetailsResponse({
    required this.product,
    required this.nearbyVendors,
  });

  factory ProductDetailsResponse.fromJson(Map<String, dynamic> json) {
    return ProductDetailsResponse(
      product: ProductDetails.fromJson(json['product']),
      nearbyVendors: (json['nearby_vendors'] as List? ?? [])
          .map((v) => NearbyVendor.fromJson(v))
          .toList(),
    );
  }
}

class ProductDetails {
  final int id;
  final String name;
  final String? brandName;
  final String? coverImageUrl;
  final List<String> galleryImages;
  final String baseUom;
  final String? description;
  final Map<String, dynamic>? specifications;

  ProductDetails({
    required this.id,
    required this.name,
    this.brandName,
    this.coverImageUrl,
    required this.galleryImages,
    required this.baseUom,
    this.description,
    this.specifications,
  });

  factory ProductDetails.fromJson(Map<String, dynamic> json) {
    return ProductDetails(
      id: json['id'],
      name: json['name'] ?? '',
      brandName: json['brand']?['name'],
      coverImageUrl: json['cover_image_url'],
      galleryImages: (json['gallery_image_urls'] as List? ?? [])
          .map((e) => e.toString())
          .toList(),
      baseUom: json['base_uom'] ?? '',
      description: json['description'],
      specifications: json['specifications'],
    );
  }
}

class NearbyVendor {
  final int vendorId;
  final String vendorName;
  final String? ownerName;
  final String? address;
  final double? distanceKm;
  final double availableStock;
  final bool isInStock;
  final double startingPrice;
  final bool allowsLooseSale;
  final double rating;

  NearbyVendor({
    required this.vendorId,
    required this.vendorName,
    this.ownerName,
    this.address,
    this.distanceKm,
    required this.availableStock,
    required this.isInStock,
    required this.startingPrice,
    required this.allowsLooseSale,
    required this.rating,
  });

  factory NearbyVendor.fromJson(Map<String, dynamic> json) {
    return NearbyVendor(
      vendorId: json['vendor_id'],
      vendorName: json['vendor_name'] ?? '',
      ownerName: json['owner_name'],
      address: json['address'],
      distanceKm: (json['distance_km'] as num?)?.toDouble(),
      availableStock: (json['available_stock'] as num?)?.toDouble() ?? 0.0,
      isInStock: json['is_in_stock'] ?? false,
      startingPrice: (json['starting_price'] as num?)?.toDouble() ?? 0.0,
      allowsLooseSale: json['allows_loose_sale'] ?? false,
      rating: (json['rating'] as num?)?.toDouble() ?? 4.5,
    );
  }
}
```

### D. Vendor Pricing Modal Options Model
```dart
// lib/models/pricing_modal_option.dart
class PricingModalResponse {
  final int productId;
  final String productName;
  final String? brand;
  final String? coverImageUrl;
  final String baseUom;
  final VendorSummary vendor;
  final List<PricingOption> options;

  PricingModalResponse({
    required this.productId,
    required this.productName,
    this.brand,
    this.coverImageUrl,
    required this.baseUom,
    required this.vendor,
    required this.options,
  });

  factory PricingModalResponse.fromJson(Map<String, dynamic> json) {
    return PricingModalResponse(
      productId: json['product_id'],
      productName: json['product_name'] ?? '',
      brand: json['brand'],
      coverImageUrl: json['cover_image_url'],
      baseUom: json['base_uom'] ?? '',
      vendor: VendorSummary.fromJson(json['vendor']),
      options: (json['options'] as List? ?? [])
          .map((o) => PricingOption.fromJson(o))
          .toList(),
    );
  }
}

class VendorSummary {
  final int id;
  final String vendorName;
  final double availableStock;

  VendorSummary({
    required this.id,
    required this.vendorName,
    required this.availableStock,
  });

  factory VendorSummary.fromJson(Map<String, dynamic> json) {
    return VendorSummary(
      id: json['id'],
      vendorName: json['vendor_name'] ?? '',
      availableStock: (json['available_stock'] as num?)?.toDouble() ?? 0.0,
    );
  }
}

class PricingOption {
  final String type; // 'package' or 'loose'
  final String label;
  final int uomId;
  final String uomName;
  final String unitSymbol;
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
    required this.unitSymbol,
    required this.conversionFactor,
    required this.sellingPrice,
    this.mrp,
    required this.minQty,
    required this.stepQty,
    required this.isDefault,
    required this.maxAvailableQty,
  });

  bool get isLoose => type == 'loose';

  factory PricingOption.fromJson(Map<String, dynamic> json) {
    return PricingOption(
      type: json['type'] ?? 'package',
      label: json['label'] ?? '',
      uomId: json['uom_id'],
      uomName: json['uom_name'] ?? '',
      unitSymbol: json['unit_symbol'] ?? '',
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
```

---

## 🎨 7. Flutter UI Components & Integration Code

### 7.1 Clean Item Card Widget (Home / Catalog Grid)
Displaying Item Image, Item Name, and Brand Name in small text:

```dart
// lib/widgets/catalog_item_card.dart
import 'package:flutter/material.dart';
import '../models/catalog_item.dart';

class CatalogItemCard extends StatelessWidget {
  final CatalogItem item;
  final VoidCallback onTap;

  const CatalogItemCard({
    super.key,
    required this.item,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Card(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        elevation: 2,
        clipBehavior: Clip.antiAlias,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 1. Item Image
            Expanded(
              child: Container(
                color: Colors.grey[100],
                width: double.infinity,
                child: item.coverImageUrl != null
                    ? Image.network(
                        item.coverImageUrl!,
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => const Icon(Icons.image, size: 48, color: Colors.grey),
                      )
                    : const Icon(Icons.construction, size: 48, color: Colors.grey),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(10.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // 2. Item Name
                  Text(
                    item.name,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                  ),
                  const SizedBox(height: 2),
                  // 3. Small Text: Brand Name
                  if (item.brandName.isNotEmpty)
                    Text(
                      item.brandName,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(fontSize: 11, color: Colors.grey[600], fontWeight: FontWeight.w500),
                    ),
                  const SizedBox(height: 6),
                  // Price & Nearby vendors pill
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        '₹${item.startingPrice.toStringAsFixed(0)}',
                        style: const TextStyle(color: Colors.green, fontWeight: FontWeight.bold, fontSize: 13),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: Colors.blue[50],
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          '${item.availableVendorsCount} Nearby',
                          style: TextStyle(fontSize: 10, color: Colors.blue[800], fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
```

---

### 7.2 Vendor Pricing Drawer (BottomSheet with Packet & Loose Support)

```dart
// lib/widgets/vendor_pricing_bottom_sheet.dart
import 'package:flutter/material.dart';
import '../models/pricing_modal_option.dart';

class VendorPricingBottomSheet extends StatefulWidget {
  final PricingModalResponse modalData;
  final Function(PricingOption selectedOption, double quantity) onAddToCart;

  const VendorPricingBottomSheet({
    super.key,
    required this.modalData,
    required this.onAddToCart,
  });

  static Future<void> show(
    BuildContext context, {
    required PricingModalResponse modalData,
    required Function(PricingOption selectedOption, double quantity) onAddToCart,
  }) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => VendorPricingBottomSheet(
        modalData: modalData,
        onAddToCart: onAddToCart,
      ),
    );
  }

  @override
  State<VendorPricingBottomSheet> createState() => _VendorPricingBottomSheetState();
}

class _VendorPricingBottomSheetState extends State<VendorPricingBottomSheet> {
  late PricingOption _selectedOption;
  double _packetQty = 1.0;
  final TextEditingController _looseQtyController = TextEditingController();
  double _looseQty = 5.0;

  @override
  void initState() {
    super.initState();
    _selectedOption = widget.modalData.options.firstWhere(
      (opt) => opt.isDefault,
      orElse: () => widget.modalData.options.first,
    );
    _looseQty = _selectedOption.minQty;
    _looseQtyController.text = _looseQty.toString();
  }

  @override
  void dispose() {
    _looseQtyController.dispose();
    super.dispose();
  }

  double get _currentTotal {
    if (_selectedOption.isLoose) {
      return _looseQty * _selectedOption.sellingPrice;
    } else {
      return _packetQty * _selectedOption.sellingPrice;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom + 16,
        left: 16,
        right: 16,
        top: 16,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Drawer Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      widget.modalData.vendor.vendorName,
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                    ),
                    Text(
                      widget.modalData.productName,
                      style: TextStyle(color: Colors.grey[600], fontSize: 13),
                    ),
                  ],
                ),
              ),
              IconButton(
                icon: const Icon(Icons.close),
                onPressed: () => Navigator.pop(context),
              ),
            ],
          ),
          const Divider(),

          // Option Selector (Package vs Loose)
          if (widget.modalData.options.length > 1) ...[
            const Text('Choose Purchase Format:', style: TextStyle(fontWeight: FontWeight.w600)),
            const SizedBox(height: 8),
            Row(
              children: widget.modalData.options.map((option) {
                final isSelected = _selectedOption.uomId == option.uomId && _selectedOption.type == option.type;
                return Expanded(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 4.0),
                    child: ChoiceChip(
                      label: Text(option.isLoose ? 'Loose Sale' : 'Complete Pack'),
                      selected: isSelected,
                      onSelected: (selected) {
                        if (selected) {
                          setState(() {
                            _selectedOption = option;
                            if (option.isLoose) {
                              _looseQty = option.minQty;
                              _looseQtyController.text = _looseQty.toString();
                            }
                          });
                        }
                      },
                    ),
                  ),
                );
              }).toList(),
            ),
            const SizedBox(height: 12),
          ],

          // Option Price Display
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.green[50],
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      _selectedOption.label,
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                    Text(
                      'Rate: ₹${_selectedOption.sellingPrice.toStringAsFixed(2)} / ${_selectedOption.unitSymbol}',
                      style: const TextStyle(color: Colors.green, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
                Text(
                  'Total: ₹${_currentTotal.toStringAsFixed(2)}',
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.black87),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Quantity Input Form
          if (_selectedOption.isLoose) ...[
            // Loose Sale: Custom Decimal Quantity Input Field
            const Text('Enter Required Quantity:', style: TextStyle(fontWeight: FontWeight.w600)),
            const SizedBox(height: 6),
            TextField(
              controller: _looseQtyController,
              keyboardType: const TextInputType.numberWithOptions(decimal: true),
              decoration: InputDecoration(
                hintText: 'e.g. 15.5',
                suffixText: _selectedOption.unitSymbol,
                helperText: 'Minimum: ${_selectedOption.minQty} ${_selectedOption.unitSymbol}',
                border: const OutlineInputBorder(),
              ),
              onChanged: (val) {
                final parsed = double.tryParse(val) ?? 0.0;
                setState(() {
                  _looseQty = parsed;
                });
              },
            ),
          ] else ...[
            // Complete Packet: Quantity Stepper Counter
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Quantity (Packs):', style: TextStyle(fontWeight: FontWeight.w600)),
                Row(
                  children: [
                    IconButton(
                      icon: const Icon(Icons.remove_circle_outline),
                      onPressed: _packetQty > _selectedOption.minQty
                          ? () => setState(() => _packetQty -= _selectedOption.stepQty)
                          : null,
                    ),
                    Text(
                      _packetQty.toInt().toString(),
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                    ),
                    IconButton(
                      icon: const Icon(Icons.add_circle_outline),
                      onPressed: () => setState(() => _packetQty += _selectedOption.stepQty),
                    ),
                  ],
                ),
              ],
            ),
          ],
          const SizedBox(height: 16),

          // Add to Cart Button
          SizedBox(
            width: double.infinity,
            height: 48,
            child: ElevatedButton.icon(
              style: ElevatedButton.styleFrom(backgroundColor: Colors.blue[800]),
              icon: const Icon(Icons.shopping_cart, color: Colors.white),
              label: Text(
                'Add to Cart (₹${_currentTotal.toStringAsFixed(2)})',
                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
              ),
              onPressed: () {
                final qty = _selectedOption.isLoose ? _looseQty : _packetQty;
                if (qty <= 0) return;
                widget.onAddToCart(_selectedOption, qty);
                Navigator.pop(context);
              },
            ),
          ),
        ],
      ),
    );
  }
}
```

---

## ⚡ 8. Summary of API Endpoints for Quick Reference

| Action | HTTP Method | Endpoint URL | Auth Header | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Get States** | `GET` | `/locations/states` | No | Dropdown states list |
| **Get Cities** | `GET` | `/locations/cities/{stateId}` | No | Dropdown cities by state |
| **Register** | `POST` | `/customer/register` | No | New customer signup with KYC |
| **Login** | `POST` | `/customer/login` | No | Auth with optional `lat`, `long` |
| **Get Catalog** | `GET` | `/customer/catalog` | Optional | Nearby products with images, names, brand |
| **Product Details** | `GET` | `/customer/products/{id}` | Optional | Specs + nearby vendors list with distance |
| **Pricing Drawer** | `GET` | `/customer/products/{id}/pricing-modal` | Optional | Packet vs Loose rates for bottom sheet |
| **Add to Cart** | `POST` | `/customer/cart/add` | **Bearer** | Add packet or loose custom qty to cart |
| **Get Cart** | `GET` | `/customer/cart` | **Bearer** | View customer cart with subtotals |
| **Delete Cart Item**| `DELETE` | `/customer/cart/{id}` | **Bearer** | Remove product from cart |
