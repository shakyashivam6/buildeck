# Buildeck Architecture Plan: Vendor Product Management & Multi-UOM Stock System

Yeh updated master blueprint document hai Vendor Inventory, Stock Control, Ledger System aur Customer Multi-UOM Cart Modal ke liye:

> [!NOTE]
> **Product Naming Retained:** Admin Catalog aur pure codebase me `Product` terminology hi use ho rahi hai. Kisi table ya model ko rename karne ki zaroorat nahi hai.

Plan ko modular aur step-by-step format me `docs/plans/` folder me organize kiya gaya hai:

---

## 📑 Plan Directory & Quick Links

1. **[00_MASTER_INDEX.md](file:///e:/GIT/buildeck/docs/plans/00_MASTER_INDEX.md)**:
   * Executive summary, workflow diagram, aur phase-wise execution roadmap.
2. **[Step 1: Vendor Products API Management (`VendorProductManagementController`)](file:///e:/GIT/buildeck/docs/plans/01_STEP1_VENDOR_PRODUCTS_CONTROLLER_AND_API.md)**:
   * `vendor_products` database table schema.
   * Controller: `App\Http\Controllers\Api\Vendor\VendorProductManagementController`.
   * Master catalog listing, Adding products to inventory, Stock & Selling amount (price) update APIs.
3. **[Step 2: Vendor Stock Ledger System](file:///e:/GIT/buildeck/docs/plans/02_STEP2_VENDOR_STOCK_LEDGER_SYSTEM.md)**:
   * `vendor_stock_ledgers` table for double-entry style audit trail.
   * Transaction types: Inward, Outward (Order deduction), Restock, Damage/Loss.
   * Atomic locking (`lockForUpdate`) race-condition prevention.
   * Vendor Stock Ledger history API.
4. **[Step 3: Customer Multi-UOM Add-to-Cart Modal](file:///e:/GIT/buildeck/docs/plans/03_STEP3_CUSTOMER_CART_UOM_MODAL.md)**:
   * Customer app modal when tapping "Add to Cart".
   * Complete Package (Full Box / Full Bag) vs Loose (Retail / Kg / Pieces) selection.
   * Live vendor stock validation & dynamic price calculation.
   * `cart_items` table schema and API specifications.

---

> [!TIP]
> Detail dekhne ke liye upar diye gaye links par click karein ya `docs/plans/` folder ko browse karein.
