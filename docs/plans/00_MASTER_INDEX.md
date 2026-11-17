# Master Architecture Plan: Vendor Product Management & Multi-UOM Stock System

## 1. Executive Summary

Yeh document Buildeck marketplace ke Vendor Inventory & Stock Management module ka updated master blueprint hai:

> [!NOTE]
> **Product Name Retained:** Codebase me `Product` terminology hi continue rahegi. Kisi bhi table (`products`, `product_uom_prices`), model, ya controller ko rename nahi kiya jayega.

Is architecture ke 3 core modules hain:

1. **Vendor Products & Inventory Control (`VendorProductManagementController`):** Admin dwara create kiye gaye master products (`products`) ko vendor apni inventory me add karega, apna selling amount (price) aur stock manage karega via Sanctum APIs.
2. **Vendor Stock Ledger System:** Inventory ko direct overwrite karne ke bajaye ek **Double-Entry Style Stock Ledger** maintain karna (Opening Stock, Inward/Purchase, Order Deduction, Restock, Damage Adjustments) with audit trails aur race-condition locks.
3. **Customer Multi-UOM Cart Modal (Package vs Loose Sale):** Jab customer product add-to-cart karega, tab dynamic modal flash hoga jisme product ke packaging formats (Full Bag/Box vs Loose Sale) display honge, live vendor stock check hoga aur automatic dynamic price calculation ke saath cart me add hoga.

---

## 2. Modular Steps Breakdown

| Step File | Title | Scope & Description |
| :--- | :--- | :--- |
| **[Step 1: Vendor Products API Management](file:///e:/GIT/buildeck/docs/plans/01_STEP1_VENDOR_PRODUCTS_CONTROLLER_AND_API.md)** | `01_STEP1_VENDOR_PRODUCTS_CONTROLLER_AND_API.md` | `vendor_products` table, `VendorProductManagementController`, Master catalog listing, Adding products to vendor inventory, Stock & Price updates. |
| **[Step 2: Vendor Stock Ledger System](file:///e:/GIT/buildeck/docs/plans/02_STEP2_VENDOR_STOCK_LEDGER_SYSTEM.md)** | `02_STEP2_VENDOR_STOCK_LEDGER_SYSTEM.md` | `vendor_stock_ledgers` table, Audit trail of every single stock movement, FIFO / Transaction locking (`lockForUpdate`), Stock history APIs. |
| **[Step 3: Customer Cart & Dynamic UOM Modal](file:///e:/GIT/buildeck/docs/plans/03_STEP3_CUSTOMER_CART_UOM_MODAL.md)** | `03_STEP3_CUSTOMER_CART_UOM_MODAL.md` | Multi-UOM selection (Complete Package vs Loose sale), live vendor stock validation, cart data contract, and pricing engine. |

---

## 3. High-Level Architecture Workflow

```
[ ADMIN / BACKOFFICE ]
   │
   ▼
Creates Master Products (Name, SKU, Category, Brand, Base UOM, Images, Specs, Packaging Rules)
Stores in: `products` & `product_uom_prices`
   │
   ├───────────────────────────────────────────────────────┐
   ▼                                                       ▼
[ VENDOR APP / API ]                             [ CUSTOMER APP / API ]
   │                                                       │
   ├─ Browses Master Catalog (`GET /vendor/products/catalog`)
   ├─ Adds Product to Inventory:                           │
   │    • Sets Selling Amount (Price)                      │
   │    • Adds Inward Stock (e.g., 50 Bags)                │
   │    • Generates Stock Ledger Entry (Opening/Inward)    │
   │                                                       │
   ▼                                                       ▼
[ VENDOR INVENTORY & LEDGER ]                    [ BROWSE & ADD TO CART ]
`vendor_products` (Current Live Stock)                     │
`vendor_stock_ledgers` (Audit Records)                     ▼
   ▲                                             Customer taps "Add to Cart"
   │                                             Modal Flashes:
   │                                                • Option A: Full Package (Bag/Box)
   │                                                • Option B: Loose Sale (Kg/Pieces)
   │                                             Calculates Dynamic Price
   │                                                       │
   └────────── Order Placed: Deduct Stock ─────────────────┘
              (Ledger Entry: `order_deduct`)
```

---

## 4. Execution Roadmap

1. **Phase 1: Vendor Products & Controller Setup (Step 1)**
   - Create migration for `vendor_products`.
   - Create `VendorProduct` Eloquent model with relations to `Product` and `VendorProfile`.
   - Implement `App\Http\Controllers\Api\Vendor\VendorProductManagementController`.
   - Register secure Sanctum routes under `api/vendor/products/*`.
2. **Phase 2: Vendor Stock Ledger Backend (Step 2)**
   - Create migration for `vendor_stock_ledgers`.
   - Create `VendorStockLedger` model and atomic movement service (`VendorStockService`).
   - Integrate ledger triggers in `VendorProductManagementController` (on add product, stock update, inward addition).
   - Implement vendor stock history endpoint (`GET /api/vendor/products/{id}/stock-ledger`).
3. **Phase 3: Customer Cart Modal & Pricing Engine (Step 3)**
   - Create `cart_items` table with UOM and pricing type support.
   - Expose product pricing configuration API for modal (`GET /api/customer/products/{id}/pricing-modal`).
   - Implement stock-aware cart validations (`POST /api/customer/cart/add`).
