# BuilDeck Architecture Plan: Customer Geo-Discovery, Item Catalog & Vendor Pricing Drawer

## 1. Executive Summary & Problem Context

Building materials marketplace me customer experience ko frictionless aur transparent banane ke liye ye plan design kiya gaya hai:

1. **Location-First Approach (Geo-Fencing & Service Radius):** Customer ke current GPS Coordinates (`lat, long`) ke hisaab se sirf wahi master items flash honge jo uske delivery radius me available active & approved vendors supply kar sakte hain.
2. **Minimalist First Impression (Item Catalog):** Home / Browse screen par customer ko simple, clean item card dikhega jisme **Item Image**, **Item Name**, aur **Brand Name (small text)** highlight honge.
3. **Item Details + Multi-Vendor Discovery (Same Page):** Item par tap karne par ek full details page open hoga jisme item ke technical specs ke saath-saath customer ke area me supply karne wale **sabhi nearby vendors ki live list** dikhegi (with distance, shop name, aur stock availability).
4. **Interactive Vendor Pricing Bottom Drawer:** Kisi bhi vendor par click karte hi bottom se ek modal sheet / drawer flash hoga:
   - **Complete Packet:** Package unit (e.g. 50 Kg Bag, 1 Box) ka fixed price flash hoga + counter & **Add to Cart** icon.
   - **Loose Sale:** Agar vendor loose sell allow karta hai, toh ek **interactive quantity input field** open hogi jisme customer apni marzi ki quantity (e.g., 7.5 Kg, 12 pieces) enter karke live calculated price ke sath **Add to Cart** kar sakega.
5. **Seamless Vendor Comparison:** Customer bina page switch kiye alag-alag vendors par tap karke unke rates compare kar sakta hai aur best deal direct drawer se cart me add kar sakta hai.

---

## 2. Complete End-to-End User Journey

```
┌────────────────────────────────────────────────────────────────────────┐
│ 1. CUSTOMER LOCATION ACQUISITION                                      │
│ • Flutter app fetches GPS (lat, long) via Geolocator or Address Picker│
│ • Stored in App State / Session: (latitude: 28.6139, longitude: 77.20)│
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ 2. NEARBY CATALOG FLASH (Home / Items Screen)                         │
│ • GET /api/customer/catalog?lat=28.6139&long=77.2090                   │
│ • Backend filters: Haversine distance <= vendor.supply_radius          │
│ • Card UI: [ Item Image ] | [ Item Name ] | [ small text: Brand Name ] │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ Customer taps an Item Card
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ 3. ITEM VIEW DETAILS & NEARBY VENDOR LIST (New Page)                  │
│ • GET /api/customer/products/{id}?lat=28.6139&long=77.2090            │
│ • Top: Image carousel, Specs, Description, Category, Base UOM          │
│ • Bottom Section: "Vendors Providing This Item in Your Area"          │
│   ┌──────────────────────────────────────────────────────────────┐     │
│   │ [🏪 Gupta Hardware]       • 2.3 km away  • In Stock (250 Kg) │     │
│   │ [🏪 Sharma Building Mart] • 4.1 km away  • In Stock (500 Kg) │     │
│   │ [🏪 Ultra Build Supplies] • 5.8 km away  • In Stock (120 Kg) │     │
│   └──────────────────────────────────────────────────────────────┘     │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ Customer clicks on any Vendor
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ 4. BOTTOM PRICING DRAWER FLASHES UP (BottomSheet Modal)                │
│ • Calls GET /api/customer/products/{id}/pricing-modal?vendor_id={vId}  │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ 🏪 Gupta Hardware (2.3 km)                   [✖ Close]           │  │
│  │ ──────────────────────────────────────────────────────────────── │  │
│  │  OPTION A: Complete Packet                                       │  │
│  │  • Full Bag (50 Kg) @ ₹380.00 / Bag                              │  │
│  │  • Quantity: [ - ]  1  [ + ]                                     │  │
│  │  • [🛒 Add to Cart (₹380.00)]                                     │  │
│  │ ──────────────────────────────────────────────────────────────── │  │
│  │  OPTION B: Loose / Retail Sale (If Allowed)                     │  │
│  │  • Loose Rate: ₹8.00 / Kg (Min: 5 Kg)                            │  │
│  │  • Enter Quantity: [  15.5  ] Kg                                 │  │
│  │  • Calculated Total: ₹124.00                                     │  │
│  │  • [🛒 Add to Cart (₹124.00)]                                     │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ Taps "Add to Cart"
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ 5. CART UPDATED & CONTINUED COMPARISON                                 │
│ • POST /api/customer/cart/add                                          │
│ • Drawer closes / Shows success Toast                                  │
│ • Customer can immediately tap another vendor to check their pricing!  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Database & Spatial Query Mechanics

### 3.1 Existing Tables Used
1. `vendor_profiles`:
   - `lat` (decimal 10,8), `long` (decimal 11,8)
   - `supply_radius` (decimal 8,2 in KM)
   - `status` (`approved`)
2. `vendor_products`:
   - `vendor_id`, `product_id`, `amount`, `stock`, `is_available`
3. `products`:
   - `id`, `name`, `brand_id`, `category_id`, `base_uom_id`, `cover_image_url`, `description`, `specifications`
4. `brands`:
   - `id`, `name`, `logo_url`
5. `vendor_product_uoms` / `product_uom_prices`:
   - `uom_id`, `conversion_factor`, `selling_price`, `allow_loose_sale`, `min_order_qty`, `step_qty`

### 3.2 High-Performance Haversine SQL Query
Customer coordinates `($cLat, $cLong)` ke hisaab se serviceable vendors filter karne ke liye standard Great-Circle Haversine formula use hoga:

$$\text{distance} = 6371 \times \arccos\left(\sin(\text{lat}_1)\sin(\text{lat}_2) + \cos(\text{lat}_1)\cos(\text{lat}_2)\cos(\text{long}_2 - \text{long}_1)\right)$$

```sql
SELECT 
    vp.id AS vendor_id,
    vp.vendor_name,
    vp.address,
    vp.lat,
    vp.long,
    vp.supply_radius,
    (6371 * acos(
        cos(radians(?)) * cos(radians(vp.lat)) * cos(radians(vp.long) - radians(?)) 
        + sin(radians(?)) * sin(radians(vp.lat))
    )) AS distance_km
FROM vendor_profiles vp
WHERE vp.status = 'approved'
  AND vp.lat IS NOT NULL 
  AND vp.long IS NOT NULL
HAVING distance_km <= COALESCE(vp.supply_radius, 25.0)
ORDER BY distance_km ASC;
```

---

## 4. API Endpoints Specification

### 4.1 Endpoint 1: Geo-Catalog Listing (First Screen)
Customer ke location ke according nearby available items fetch karne ke liye.

- **Method:** `GET`
- **URL:** `/api/customer/catalog`
- **Query Parameters:**
  - `lat` (required, float): Customer latitude (e.g. `28.6139`)
  - `long` (required, float): Customer longitude (e.g. `77.2090`)
  - `search` (optional, string): Search by product name or brand
  - `category_id` (optional, int): Filter by category
  - `page` (optional, int): Pagination

#### Response Payload (200 OK)
```json
{
  "auth_status": true,
  "res": "success",
  "msg": "Nearby items fetched successfully.",
  "data": {
    "current_page": 1,
    "total_items": 42,
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

---

### 4.2 Endpoint 2: Item Details & Nearby Area Vendors
Item par click hone par detailed view + is item ko supply karne wale sabhi nearby vendors.

- **Method:** `GET`
- **URL:** `/api/customer/products/{productId}`
- **Query Parameters:**
  - `lat` (required, float): e.g. `28.6139`
  - `long` (required, float): e.g. `77.2090`

#### Response Payload (200 OK)
```json
{
  "auth_status": true,
  "res": "success",
  "msg": "Item details and nearby vendors loaded.",
  "data": {
    "product": {
      "id": 10,
      "name": "UltraTech Super Cement",
      "brand": {
        "id": 2,
        "name": "UltraTech",
        "logo_url": "https://domain.com/storage/brands/ultratech.png"
      },
      "category": {
        "id": 1,
        "name": "Cement & Concrete"
      },
      "cover_image_url": "https://domain.com/storage/products/ultratech-cement.jpg",
      "gallery_images": [
        "https://domain.com/storage/products/cement-1.jpg",
        "https://domain.com/storage/products/cement-2.jpg"
      ],
      "base_uom": "Kilogram",
      "base_uom_symbol": "kg",
      "description": "High performance Portland Pozzolana Cement (PPC) suitable for all structural works.",
      "specifications": {
        "grade": "PPC 53 equivalent",
        "setting_time": "30 mins initial",
        "color": "Grey"
      }
    },
    "nearby_vendors": [
      {
        "vendor_id": 4,
        "vendor_name": "Gupta Hardware & Sanitary",
        "owner_name": "Ramesh Gupta",
        "address": "Shop 12, Sector 18 Market",
        "distance_km": 2.3,
        "available_stock": 250.0,
        "is_in_stock": true,
        "starting_price": 380.00,
        "allows_loose_sale": true,
        "rating": 4.8
      },
      {
        "vendor_id": 9,
        "vendor_name": "Sharma Building Materials",
        "owner_name": "Vipin Sharma",
        "address": "Plot 45, Industrial Area Phase 1",
        "distance_km": 4.1,
        "available_stock": 500.0,
        "is_in_stock": true,
        "starting_price": 375.00,
        "allows_loose_sale": false,
        "rating": 4.6
      }
    ]
  }
}
```

---

### 4.3 Endpoint 3: Vendor Price Drawer & Packaging Options
Vendor card par tap karte hi bottom drawer open karne ke liye (Already built in `CustomerCartController@pricingModal`).

- **Method:** `GET`
- **URL:** `/api/customer/products/{productId}/pricing-modal?vendor_id={vendorId}`

#### Response Payload (200 OK)
```json
{
  "auth_status": true,
  "res": "success",
  "msg": "Product packaging & pricing options loaded.",
  "data": {
    "product_id": 10,
    "product_name": "UltraTech Super Cement",
    "brand": "UltraTech",
    "cover_image_url": "https://domain.com/storage/products/ultratech-cement.jpg",
    "base_uom": "Kilogram",
    "vendor": {
      "id": 4,
      "vendor_name": "Gupta Hardware & Sanitary",
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

---

### 4.4 Endpoint 4: Add to Cart Execution
Drawer me button tap hone par cart me add karne ke liye (Already built in `CustomerCartController@addToCart`).

- **Method:** `POST`
- **URL:** `/api/customer/cart/add`
- **Body:**
```json
{
  "vendor_id": 4,
  "product_id": 10,
  "uom_id": 1,
  "purchase_type": "loose",
  "quantity": 15.5
}
```
*(Ya Complete package ke case me: `uom_id: 3`, `purchase_type: "package"`, `quantity: 2`)*

---

## 5. Flutter Client-Side UI / UX Architecture

### 5.1 Screen 1: Home / Catalog View (`CatalogScreen`)
- **Top Bar:** Location Bar showing selected delivery location / Address with GPS auto-detect icon (`📍 Sector 18, Noida [Change]`).
- **Item Grid / List:** 2-column clean grid:
  - **Item Image:** 1:1 Aspect ratio, cached network image with rounded corners.
  - **Item Name:** Max 2 lines, bold title (e.g. `UltraTech Super Cement`).
  - **Brand Name:** Small subtitle text with subtle grey color (e.g. `by UltraTech`).
  - **Bottom Meta:** Pill showing `3 Vendors Nearby` and `From ₹380`.
- **On Tap:** `Navigator.push(context, MaterialPageRoute(builder: (_) => ProductDetailsScreen(productId: item.id)));`

### 5.2 Screen 2: Item Details Screen (`ProductDetailsScreen`)
- **Top Section:**
  - Product Image Carousel.
  - Product Title & Brand Badge.
  - Category breadcrumb & Base Unit indicator.
  - Technical Specifications table / collapsible description.
- **Middle / Bottom Section ("Available Vendors in Your Area"):**
  - Section Header: `Available from 3 Vendors near you` (with distance indicator).
  - List of `VendorCard` widgets:
    - Vendor Shop Name (bold)
    - Distance pill (e.g., `2.3 km`)
    - Stock status (`In Stock: 250 kg`)
    - Starting price hint
    - Action CTA: `Check Rates / Buy →`
- **Vendor Card Tap Event:** Opens `VendorPricingDrawer` modal bottom sheet.

### 5.3 Bottom Drawer: `VendorPricingDrawer` (BottomSheet)
Bottom se slide up hoga aur do clean tabs ya segmented options display karega:

#### A. Complete Packet Section
- Package details: e.g. `Bag (50 Kg)`.
- Big Price: `₹380.00` per bag.
- Quantity Stepper: `[ - ]  1  [ + ]` (increments by step_qty).
- Live Price: `Total: ₹380.00`.
- `Add to Cart` Button with cart icon.

#### B. Loose Sale Section (If `allow_loose_sale` is enabled by vendor)
- Loose details: `Per Kg Rate: ₹8.00/kg (Min: 5 kg)`.
- Input Field: Number input field with unit suffix (e.g. `[ 15.5 ] kg`).
- Real-time Subtotal calculation: `15.5 kg × ₹8.00 = ₹124.00`.
- Stock boundary validation: Agar customer vendor ke available stock se zyada enter kare, live warning message display hoga.
- `Add to Cart` Button.

---

## 6. Implementation Checklist

- [ ] **Backend Service:** Create `App\Services\CustomerCatalogService` to encapsulate Haversine spatial queries and vendor product aggregation.
- [ ] **Backend Controller:** Create `App\Http\Controllers\Api\CustomerProductCatalogController`:
  - `catalog(Request $request)`: Filter master products by customer `lat` & `long`.
  - `productDetails(Request $request, int $productId)`: Return product info + nearby vendor list with distance calculation.
- [ ] **Routes:** Register in `routes/api.php` under `customer` prefix.
- [ ] **Feature Tests:** Write automated Pest/PHPUnit tests verifying:
  - Vendors outside supply radius do not appear.
  - Products from unapproved vendors do not appear.
  - Vendor distance is accurately calculated.
  - Drawer pricing modal returns both packet and loose options.
- [ ] **Flutter Guide:** Create Flutter UI reference code snippets for `ItemCard`, `VendorCard`, and `VendorPricingDrawer`.
