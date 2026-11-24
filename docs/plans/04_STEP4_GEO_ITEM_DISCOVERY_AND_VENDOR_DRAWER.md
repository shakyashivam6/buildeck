# Step 4: Customer Geo-Location Discovery & Vendor Pricing Drawer

## 1. Overview & Objective

Building materials marketplace me customer location ke base par real-time inventory aur pricing serve karna core requirement hai.
Is module ke do primary goals hain:

1. **Geo-Location Based Catalog Flash:** Customer ke GPS Coordinates (`lat, long`) ke hisaab se sirf wahi master products flash karna jo customer ke area me delivery provide karne wale active & approved vendors ke paas available hain.
   - Screen 1 par customer ko har item ka **Image**, **Name**, aur **small text me Brand Name** flash hoga.
2. **Item Details Screen me Nearby Vendors Discovery:** Jab customer item par click karega, ek complete details page open hoga jisme customer ke area me supply karne wale **Vendors ki list** flash hogi.
3. **Vendor Click -> Bottom Pricing Drawer:**
   - Vendor par tap karte hi bottom sheet drawer flash hoga jisme vendor ne jo price set kar rakhi hai wo show hogi.
   - **Complete Packet:** Package unit (e.g. 50 Kg Bag) ka fixed price flash hoga + Add to Cart icon/button.
   - **Loose Sale:** Agar vendor loose sell allow kar raha hai, drawer me dynamic numerical input field rahegi jisme customer desired quantity (e.g. 15.5 Kg) fill karke add to cart kar sakega.
   - Customer usi page par alag-alag vendor par tap karke instant price compare aur add-to-cart kar sakta hai.

---

## 2. Architecture & Data Flow

```
[ Customer App ]
      │
      ├─ 1. Sends GPS Lat & Long: GET /api/customer/catalog?lat=...&long=...
      ▼
[ Backend: Geo-Location Filter ]
      │
      ├─ Calculates Distance using Haversine formula
      ├─ Filters: distance <= vendor_profiles.supply_radius AND status = 'approved'
      ├─ Aggregates distinct products available in nearby vendors
      ▼
[ Screen 1: Item Catalog Flash ]
      │ • Image, Name, Brand Name (small text)
      │ • On Tap: Navigates to Product Details Screen
      ▼
[ Screen 2: Item Details & Nearby Vendors ]
      │ • GET /api/customer/products/{id}?lat=...&long=...
      │ • Complete Product specs, description, images
      │ • List of nearby vendors: [Vendor A (2.3 km)], [Vendor B (4.1 km)]
      ▼
[ Customer taps on a Vendor ]
      │
      ▼
[ Screen 3: Bottom Pricing Drawer (BottomSheet) ]
      │ • GET /api/customer/products/{id}/pricing-modal?vendor_id={vendorId}
      │
      ├─ Case A: Complete Packet -> Shows ₹380 / Bag + Qty Stepper + Add to Cart
      └─ Case B: Loose Sale -> Shows ₹8 / Kg + Quantity Input Box [ 15.5 ] + Add to Cart
```

---

## 3. Database & Spatial Query Mechanics

### Spatial Filtering Logic
Vendor profiles table me `lat`, `long`, aur `supply_radius` (in KM) store hota hai:
```sql
SELECT 
    vp.id AS vendor_id,
    vp.vendor_name,
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

## 4. API Specification

### 4.1 Catalog Listing by Customer Lat/Long
`GET /api/customer/catalog?lat={lat}&long={long}&category_id={cat}&search={keyword}`

- **Item Card Payload:**
  - `id`: Product ID
  - `name`: Product Name
  - `brand_name`: Brand Name (displayed in small text below name)
  - `cover_image_url`: Product image URL
  - `base_uom`: Base Unit of Measure (e.g. Kg, Pcs)
  - `available_vendors_count`: Total nearby vendors selling this item
  - `starting_price`: Lowest starting price among nearby vendors

### 4.2 Product Details & Nearby Vendors
`GET /api/customer/products/{id}?lat={lat}&long={long}`

- **Payload:**
  - `product`: Full specs, description, gallery images, brand, category, base UOM.
  - `nearby_vendors`: List of vendors in customer's area providing this item:
    - `vendor_id`: ID of vendor
    - `vendor_name`: Shop / Business name
    - `distance_km`: Exact distance in KM (e.g. `2.3 km away`)
    - `available_stock`: Current available stock
    - `starting_price`: Vendor's base price for this item
    - `allows_loose_sale`: Boolean (`true` / `false`)

### 4.3 Vendor Pricing Drawer (Existing Endpoint)
`GET /api/customer/products/{id}/pricing-modal?vendor_id={vendorId}`

- **Payload:**
  - `options`:
    - `type: "package"`: Full Bag/Box rate, standard unit, step increment.
    - `type: "loose"`: Loose sale per-unit rate, min quantity, step increment.

### 4.4 Add to Cart (Existing Endpoint)
`POST /api/customer/cart/add`
```json
{
  "vendor_id": 4,
  "product_id": 10,
  "uom_id": 1,
  "purchase_type": "loose",
  "quantity": 15.5
}
```

---

## 5. UI/UX Flow on Item Details Screen

1. **Vendor List Cards:** Customer ko item details page ke bottom section me vendors ki cards dikhengi:
   - Example Card: `🏪 Gupta Hardware (2.3 km away) • In Stock • Check Rates →`
2. **Drawer Pop-up:** Card click par bottom sheet smoothly slide-up hoti hai.
3. **Price Flash & Options:**
   - Agar packet item hai (e.g. 50 kg Bag): Price `₹380.00` flash hoti hai, quantity selector `[ - 1 + ]` aur `Add to Cart` button.
   - Agar loose sale allowed hai: Input field show hoti hai, customer quantity enter karta hai (e.g. `15.5 kg`), dynamic total `₹124.00` update hota hai aur `Add to Cart` button tap karta hai.
4. **Quick Comparison:** Customer drawer close karke doosre vendor par tap karke uska rate dekh sakta hai aur wahi se cart me add kar sakta hai.
