# BuilDeck: End-to-End Catalog & Product Onboarding Guide
### Category Creation Se Lekar Product Onboard Karne Ka Step-by-Step Input Assistance Manual

---

## 📌 Index / Table of Contents
1. [System Architecture & Onboarding Lifecycle](#1-system-architecture--onboarding-lifecycle)
2. [Step 0: Prerequisites (UOM & Brand Masters)](#2-step-0-prerequisites-uom--brand-masters)
3. [Step 1: Main Category Form Assistance](#3-step-1-main-category-form-assistance)
4. [Step 2: Sub-Category Form Assistance](#4-step-2-sub-category-form-assistance)
5. [Step 3: Master Product Creation Form Assistance](#5-step-3-master-product-creation-form-assistance)
   - [Section 3.1: General Product Details](#section-31-general-product-details)
   - [Section 3.2: Media & Images (Cover & Gallery)](#section-32-media--images-cover--gallery)
   - [Section 3.3: Multi-UOM Pricing & Loose-Sale Control Matrix](#section-33-multi-uom-pricing--loose-sale-control-matrix)
6. [Step 4: Vendor Onboarding & Stock Assignment Form Assistance](#6-step-4-vendor-onboarding--stock-assignment-form-assistance)
   - [Section 4.1: Assign Product to Vendor](#section-41-assign-product-to-vendor)
   - [Section 4.2: Vendor Multi-UOM Custom Rates](#section-42-vendor-multi-uom-custom-rates)
   - [Section 4.3: Stock Inward & Ledger Adjustment](#section-43-stock-inward--ledger-adjustment)
7. [Deep Dive: Construction Specific Technical Fields](#7-deep-dive-construction-specific-technical-fields)
8. [Real-World Walkthrough Examples](#8-real-world-walkthrough-examples)
9. [Common Mistakes & Best Practices Checklist](#9-common-mistakes--best-practices-checklist)

---

## 1. System Architecture & Onboarding Lifecycle

BuilDeck construction marketplace me kisi bhi product ko live karne ke liye ek strict hierarchical structure follow kiya jata hai taaki multi-vendor inventory, multi-unit calculations (Multi-UOM), aur order fulfillment me kabhi mismatch na ho:

```
[Master UOMs & Brands] ───► [Main Category]
                                    │
                                    ▼
                          [Sub-Category] (Base UOM & Packing Rules)
                                    │
                                    ▼
                          [Master Product] (SKU, Photos & Multi-UOM Matrix)
                                    │
                                    ▼
                          [Vendor Stock Mapping] (Vendor Price & Opening Stock)
                                    │
                                    ▼
                          [Customer Storefront & Live Cart]
```

---

## 2. Step 0: Prerequisites (UOM & Brand Masters)

Product ya Category banane se pehle do master entities ka hona zaroori hai:
1. **Units of Measure (UOM):** Wo standard units jisme maal bikega ya store hoga (e.g., Kg, Tonne, Bag, Sq.Ft, Piece, Box).
2. **Approved Brands:** Certified manufacturers (e.g., UltraTech, Tata Tiscon, Kajaria, Asian Paints).

### A. Unit of Measure Form (`/admin/catalog/uoms`)

| Input Field Name | UI Label | Type | Required? | Kya Hoga (Functionality) | Kyu Liya Ja Raha Hai (Reason & Business Logic) | Example |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `name` | Unit Full Name | Text | **Yes** | Unit ka poora naam save karega. | Admin aur customer ko readability dene ke liye (e.g. Kilogram, Metric Tonne). | `Metric Tonne`, `Square Feet` |
| `code` | Unit Code | Text | **Yes** | Unique system uppercase code. | ERP, GST invoices aur code lookups me use hota hai. | `TONNE`, `SQFT`, `BAG`, `KG` |
| `symbol` | Unit Symbol | Text | **Yes** | UI me price ke aage display hoga. | Mobile screen par lambe naam ki jagah short tag dikhane ke liye (e.g. ₹380 / bag). | `t`, `sq.ft`, `bag`, `kg`, `pc` |
| `unit_category` | Category Group | Dropdown | **Yes** | Dimension type set karega (`mass`, `volume`, `area`, `length`, `discrete_pack`, `count`). | Incompatible conversions ko rokne ke liye (Jaise weight ko area se divide na kiya ja sake). | `mass` (Cement/Steel), `area` (Tiles) |
| `is_discrete` | Is Discrete Unit? | Checkbox | No | True/False flag set karta hai. | Batata hai ki unit continuous decimal ho sakti hai (0.75 kg) ya whole number packaging hai (1 bag, 2 box). | Bags = Checked, Kg = Unchecked |

---

### B. Brand Master Form (`/admin/catalog/brands`)

| Input Field Name | UI Label | Type | Required? | Kya Hoga (Functionality) | Kyu Liya Ja Raha Hai (Reason & Business Logic) | Example |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `name` | Brand Name | Text | **Yes** | Brand ka certified naam store karta hai. | Customer brand filter laga sake aur verified products dhoondh sake. | `UltraTech`, `Tata Tiscon`, `Kajaria` |
| `is_approved_master` | Approved Master Brand | Checkbox | No | Brand ko verified badge deta hai. | Duplicate/fake local vendor brands se bachaane ke liye platform verification mark hai. | `true` |
| `sub_category_ids` | Mapped Sub-Categories | Multi-select | No | Brand ko specific sub-categories me lock karta hai. | Jab user "Cement" select kare toh sirf cement brands dikhein, tiles brands nahi. | Cement, Ready-Mix Concrete |

---

## 3. Step 1: Main Category Form Assistance

**Screen URL:** `/admin/catalog/categories`  
**Modal:** `Add New Category` / `Edit Category`

Category customer-facing storefront ka top-level classification hota hai (Jaise Building Materials, Steel, Flooring, Plumbing).

| Input Field Name | UI Label | Type | Required? | Kya Hoga (Functionality) | Kyu Liya Ja Raha Hai (Reason & Business Logic) | Example & Tips |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `name` | **Category Name** | Text | **Yes** | Main category ka official display name set karta hai. | Customer web/mobile app ke home page aur navigation drawer me isi naam se browse karta hai. | `Building Materials`, `Steel & Structural`, `Flooring & Tiles` |
| `code` | **Category Code** | Text | **Yes** | Unique alphanumeric identifier generate karta hai. | Internal API routes, slug routing, aur analytics tracking me identification ke liye. | `BLD_MAT`, `STEEL_IRON`, `TILES` *(Spaces mat use karein, uppercase aur underscore use karein)* |
| `display_order` | **Display Order** | Number | No (Default: 1) | Menu aur homepage par iska sequence number tay karega. | High-demand categories ko app ke top par dikhane ke liye (e.g. 1 par Cement & Steel, 5 par Paints). | `1`, `2`, `3` |
| `is_active` | **Active Status** | Switch / Checkbox | No (Default: true) | Category ko live/offline toggle karta hai. | Agar kisi season me koi category band karni ho ya under-maintenance ho, toh bina delete kiye chupayi ja sakti hai. | `true` (Active) / `false` (Hidden) |

---

## 4. Step 2: Sub-Category Form Assistance

**Screen URL:** `/admin/catalog/categories` (Right-Hand Pane)  
**Modal:** `Add Sub-Category`

Sub-category catalog ki sabse critical entity hai kyunki **yehi decide karti hai ki iske andar aane wale products ka base inventory unit kya hoga aur packaging rules kya honge.**

| Input Field Name | UI Label | Type | Required? | Kya Hoga (Functionality) | Kyu Liya Ja Raha Hai (Reason & Business Logic) | Example & Tips |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `category_id` | **Parent Category** | Hidden / Select | **Yes** | Subcategory ko uske main parent category se baandhta hai. | Navigation hierarchy maintain karne ke liye taaki "Cement" Building Materials ke under hi aaye. | Auto-selected by active category |
| `name` | **Sub-Category Name** | Text | **Yes** | Subcategory ka specific trade name. | Customer jab category par tap karega toh usko specific product lines dikhane ke liye. | `Cement`, `TMT Rebars`, `Vitrified Tiles`, `River Sand` |
| `code` | **Sub-Category Code** | Text | **Yes** | Unique identifier for system. | Automated SKU generation aur API filter queries ke liye. | `CEMENT_PPC`, `TMT_REBAR`, `VIT_TILES` |
| `default_base_uom_id` | **Default Base UOM** | Searchable Select | **Yes** | Subcategory ke sabhi products ke liye standardized internal inventory unit set karega. | **Super Critical:** Sabhi internal stock ledger deductions, vendor reconciliations aur unit conversions isi base unit me calculate hote hain. | **Cement:** `Kg`<br>**Steel:** `Kg`<br>**Tiles:** `Sq.Ft`<br>**Sand:** `Cft`<br>**Bricks:** `Piece` |
| `packing_rule_desc` | **Default Packing Rule** | Text | No | Default delivery aur packaging specification set karega. | Transporter, vendor aur customer ko batata hai ki factory se material kis packaging form me niklega. | `Standard 50 Kg Moisture-Proof Bag`<br>`1 Box = 16 Sq. Ft. (4 Tiles)`<br>`12 Metre Straight Bundle` |
| `allows_loose_by_default` | **Allow Loose by Default?** | Switch | No | Subcategory ke sabhi naye products me loose sale toggle ka default value decide karega. | Human error se bachata hai. Cement me factory bag tod kar khula bechna prohibited hai, jabki steel ya sand me khula becha jata hai. | **Cement:** `False` (Full bag only)<br>**Tiles:** `False` (Full box only)<br>**Sand/Aggregates:** `True` (Loose allowed) |
| `display_order` | **Display Order** | Number | No | Subcategory grid me iska sorting sequence. | Popular items ko category page ke top par lane ke liye. | `1`, `2`, `3` |
| `is_active` | **Active Status** | Switch | No | Subcategory ko live ya draft banata hai. | Catalog complete hone tak subcategory ko app me hide rakhne ke liye. | `true` |

---

## 5. Step 3: Master Product Creation Form Assistance

**Screen URL:** `/admin/catalog/products`  
**Tab:** `Add Product with Multi-UOM & Images`

Product form 3 sections me divided hai:
1. **General Product Details**
2. **Product Images (Cover & Gallery)**
3. **Multi-UOM Pricing & Loose-Sale Control Matrix**

---

### Section 3.1: General Product Details

| Input Field Name | UI Label | Type | Required? | Kya Hoga (Functionality) | Kyu Liya Ja Raha Hai (Reason & Business Logic) | Example & Guidance |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `name` | **Product Name** | Text | **Yes** | Product ka poora commercial title set karta hai. | Customer isi title se search karega. Title me Brand, Type aur Grade hona zaroori hai. | `UltraTech Super PPC Cement (50 Kg Bag)`<br>`Tata Tiscon 550D 12mm TMT Rebar`<br>`Kajaria Vitrified Floor Tile 600x600mm` |
| `sku` | **SKU / Unique Code** | Text | **Yes** | Unique Stock Keeping Unit code set karta hai. | Warehouse barcode scanning, vendor stock matching aur duplicate products ko rokne ke liye. | `ULT-PPC-50KG`, `TISCON-12MM-550D`, `KAJ-600X600-MARBLE` |
| `sub_category_id` | **Sub-Category** | Searchable Select | **Yes** | Product ko uski subcategory me assign karta hai. | Subcategory select karte hi **Base UOM** aur **Packing Rule** auto-populate ho jate hain, jisse data entry time 70% bach jata hai. | Select `Cement` ya `TMT Rebars` |
| `brand_id` | **Approved Master Brand** | Searchable Select | No | Product ko certified brand se associate karta hai. | Customer brand-wise filter laga kar buy kar sake. Unbranded maal ke liye "Generic" select karein. | Select `UltraTech Cement Ltd` |
| `base_uom_id` | **Inventory Base UOM** | Searchable Select | **Yes** | Is specific product ka core stock measurement unit. | Stock warehouse me isi unit me measure hoga. Chahe customer Tonne khareede ya Bag, stock isi unit me se ghatega. | `Kg` (Cement/Steel ke liye), `Sq.Ft` (Tiles ke liye) |
| `packing_rule_desc` | **Packing / Sizing Rule** | Text | No | Product card aur checkout bill par packaging instruction dikhata hai. | Site engineer aur labor ko pata chale ki unloading ke waqt material kis shape/weight me aane wala hai. | `Standard 50 Kg Moisture-Proof Bag`<br>`1 Box contains 4 Tiles (16 Sq. Ft Coverage)` |
| `description` | **Product Description** | Textarea | No | Technical specifications aur application guide dikhata hai. | IS certifications (e.g., IS 1489 Part 1), compressive strength, curing time batane ke liye taaki builder confidently order kare. | `High early strength, corrosion-resistant flyash-based PPC cement ideal for RCC slab casting.` |

---

### Section 3.2: Media & Images (Cover & Gallery)

| Input Field Name | UI Label | Type | Required? | Kya Hoga (Functionality) | Kyu Liya Ja Raha Hai (Reason & Business Logic) | Example & Specifications |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `cover_image` | **Main Cover Image** | File Upload (Image) | No | Product card, catalog grid aur cart modal ka primary thumbnail banta hai. | Visual validation ke liye. Customer app me bina photo ke product conversion rate 80% gir jata hai. | Recommended: **800x800px (1:1 Ratio)**, Max 5MB (JPG, PNG, WebP). Clean white background. |
| `gallery_images` | **Product Gallery Photos (Multiple)** | File Upload (Multiple Images) | No | Product detail screen par swipeable carousel image gallery banata hai. | Construction products me ISI mark stamp, expiry date label, packaging packaging quality aur application pictures dikhane ke liye. | 3-5 photos: Front bag, Manufacturer stamp, Cross-section view, Site application. |

---

### Section 3.3: Multi-UOM Pricing & Loose-Sale Control Matrix

Yeh BuilDeck catalog ka **sabse powerful engine** hai. Yahan aap decide karte hain ki customer ko yeh product kin-kin units me bikega.

#### Matrix Inputs (Row-by-Row):

| Column Name | UI Label | Type | Required? | Kya Hoga (Functionality) | Kyu Liya Ja Raha Hai (Reason & Business Logic) | Real Construction Formula & Example |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `uom_id` | **Selling Unit (UOM)** | Searchable Select | **Yes** | Wo unit jisme customer product khareed sakta hai. | Construction me client kabhi Rod khareedta hai, kabhi Tonne, kabhi Bag. Har unit ka rate alag hota hai. | Row 1: `Bag`<br>Row 2: `Metric Tonne`<br>Row 3: `Kg` |
| `selling_price` | **Selling Price (₹)** | Number (0.01 step) | **Yes** | Is specific selling unit ka platform default price. | Customer checkout par is rate ke hisaab se payment karega. | Bag: `₹380.00`<br>Tonne: `₹7400.00` |
| `mrp` | **MRP (₹)** | Number | No | Printed Maximum Retail Price. | Discount percentage badge (`Save 8%`) calculate karne ke liye. | Bag MRP: `₹410.00` |
| `conversion_factor` | **Factor to Base** | Number (0.0001 step) | **Yes** | **1 Selling Unit = Kitne Base Units.** Multiplier formula. | Jab customer 1 Bag khareede, toh stock me se 50 Kg minus ho. Jab 1 Tonne khareede toh 1000 Kg minus ho. | **Agar Base Unit Kg hai:**<br>• Selling Unit `Bag` -> Factor = `50.0000`<br>• Selling Unit `Tonne` -> Factor = `1000.0000`<br>• Selling Unit `12mm Rod` -> Factor = `10.6600` |
| `allow_loose_sale` | **Sell as Loose?** | Switch (Yes/No) | **Yes** | Decimal quantity allow hogi ya strict integer full pack. | **Quality & Breakage Protection:** Agar customer 1.5 Bag cement ya 1.3 Box tiles maange, toh system mana kar dega kyunki khula cement kharab ho jata hai aur tile box khulne se toot jaati hain. | **Cement Bag:** `No (Full Pack)`<br>**Tiles Box:** `No (Full Pack)`<br>**Sand (Cft):** `Yes (Loose)`<br>**Steel (Kg):** `Yes (Loose)` |
| `min_order_qty` | **MOQ (Min Order Qty)** | Number | **Yes** | Is unit me customer minimum kitna order kar sakta hai. | Chhote non-viable delivery orders ko rokne ke liye. (E.g. Bricks kam se kam 1000 mangani padengi). | Bag MOQ: `1`<br>Tonne MOQ: `1`<br>Sand Cft MOQ: `50` |
| `step_qty` | **Step / Multiplier** | Number | **Yes** | Cart me `+` aur `-` dabane par quantity kitni badhegi/ghategi. | Fractional odd counts ko rokne ke liye taaki delivery standard lots me ho. | Bricks: `500` (1000, 1500, 2000...)<br>Tiles: `1` (1 box, 2 box...) |
| `pack_contain_qty` | **Pack Contains** | Number | No | 1 pack ke andar kitna raw weight ya area coverage hai. | Customer calculation modal me tile area calculator aur cement bag calculator ko support karta hai. | Tile Box: `16` (Sq.Ft)<br>Cement Bag: `50` (Kg)<br>Wire Coil: `90` (Metre) |
| `is_default_selling_unit` | **Default Unit** | Radio | **Yes** | Master card par initial display price unit. | App open hone par customer ko sabse common retail unit pehle dikhane ke liye. | Cement me `Bag` par Radio button select karein. |

---

## 6. Step 4: Vendor Onboarding & Stock Assignment Form Assistance

**Screen URL:** `/admin/catalog/vendor-stocks`  
**Tab:** `Vendor Stock & Pricing` -> Button: `Assign Product to Vendor`

Master product banne ke baad wo tab tak customer app me live nahi hoga jab tak kisi local **Vendor/Store** ke paas uska stock aur local pricing map na ho.

---

### Section 4.1: Assign Product to Vendor

| Input Field Name | UI Label | Type | Required? | Kya Hoga (Functionality) | Kyu Liya Ja Raha Hai (Reason & Business Logic) | Example |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `vendor_id` | **Select Approved Vendor** | Searchable Select | **Yes** | Product ko specific dukaandar/distributor se baandhta hai. | Customer ke delivery pincode/location ke according usi vendor ka product dikhta hai jo dispatch karega. | `M/s Sharma Building Materials (Jaipur)` |
| `product_id` | **Master Product** | Searchable Select | **Yes** | Master catalog me se product select karta hai. | Master specifications, photos aur SKU ko inherit karta hai. | `UltraTech Super PPC Cement (50 Kg Bag)` |
| `stock` | **Opening Stock** | Number | **Yes** | Vendor ke warehouse me maujood current initial inventory. | App me `In Stock` ya `Out of Stock` status decide karta hai. Yeh value **Base UOM** me dali jati hai. | `10000` (Agat base unit Kg hai aur 200 bags hain -> 200 x 50 = 10000 Kg) |
| `low_stock_alert` | **Low Stock Alert Limit** | Number | No | Stock threshold trigger set karta hai. | Stock khatam hone se pehle vendor aur admin ko restock reminder bhejne ke liye. | `1000` Kg (20 bags bachte hi alert trigger hoga) |
| `selling_price` | **Base Selling Price (₹)** | Number | **Yes** | Vendor ka base unit selling rate. | Default backup price agar specific tier map na ho. | `₹7.60` per Kg |
| `mrp` | **Base MRP (₹)** | Number | No | Vendor ka printed base MRP. | Strike-through rate dikhane ke liye. | `₹8.20` per Kg |
| `discount_percentage` | **Discount (%)** | Number | No | Promotional discount percentage. | Offer badge display karne ke liye. | `5`% |
| `is_available` | **Active / In Stock Toggle** | Switch | No (Default: true) | Product ko live storefront par dikhata ya chupata hai. | Agar dukaandar ke paas supply pause ho jaye toh turant hide karne ke liye. | `true` |
| `is_featured` | **Featured Product** | Switch | No | Vendor ke store page par product ko top pinning deta hai. | Vendor ke fast-moving products ko highlight karne ke liye. | `false` |

---

### Section 4.2: Vendor Multi-UOM Custom Rates

Har vendor ke transportation aur storage cost alag hoti hai, isliye vendor har selling unit ka apna custom rate de sakta hai:

| Field Name | UI Label | Type | Required? | Kya Hoga | Kyu Liya Ja Raha Hai | Example |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `selling_price` (Per UOM) | **Unit Selling Price (₹)** | Number | **Yes** | Us vendor ka unit rate override karta hai. | E.g. Master price ₹380 hai, lekin yeh vendor local competition ke chalte ₹370 me bechna chahta hai. | Bag: `₹370.00`<br>Tonne: `₹7200.00` |
| `mrp` (Per UOM) | **Unit MRP (₹)** | Number | No | Us vendor ke pack par printed MRP. | Local tax variations aur transparent billing ke liye. | Bag: `₹410.00` |
| `is_available` (Per UOM) | **Available in this unit?** | Switch | No | Vendor kisi specific unit ko disable kar sakta hai. | E.g. Vendor bag bechna chahta hai lekin 1 Tonne ka bulk order handle nahi kar sakta kyunki uske paas bada truck nahi hai. | Bag = `Active`<br>Tonne = `Disabled` |

---

### Section 4.3: Stock Inward & Ledger Adjustment (Stock Inward Modal)

**Modal:** `Add Stock Inward / Shipment`  
BuilDeck me physical stock bina audit trail ke add ya subtract nahi hota. Yeh **Bank Passbook (Stock Ledger)** ki tarah maintain hota hai.

| Input Field Name | UI Label | Type | Required? | Kya Hoga (Functionality) | Kyu Liya Ja Raha Hai (Reason & Business Logic) | Example |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `uom_id` | **Entry Unit (UOM)** | Searchable Select | **Yes** | Inward hone wale truck/shipment ka unit. | Dukaandar ko Kg me convert karne ki zaroorat nahi hai; wo direct "Bags" ya "Tonnes" select kar sakta hai. | `Bag` ya `Tonne` |
| `quantity` | **Received Quantity** | Number | **Yes** | Naye shipment me kitne units aaye. | System ise `conversion_factor` se multiply karke Base UOM me stock increase karega. | `200` Bags (Auto converts to +10,000 Kg in ledger) |
| `unit_cost_price` | **Purchase / Inward Cost (₹)** | Number | No | Vendor ka purchase landing cost record karta hai. | Vendor ka gross profit margin aur inventory valuation calculate karne ke liye. | `₹330.00` per bag |
| `reference_no` | **Invoice / PO / Challan No.** | Text | **Yes** | Factory ya transport delivery challan number. | Tax invoice matching aur physical warehouse audit me physical paper se match karne ke liye. | `CH-2026-8891`, `INV-UT-4412` |
| `notes` | **Remarks / Batch Details** | Text | No | Truck number, driver contact, ya batch code note karta hai. | Malfunction, setting issues ya audit queries ke waqt traceability ke liye. | `Truck RJ-14-GA-9912, Batch 44B, Manufacturing Nov 2026` |

---

## 7. Deep Dive: Construction Specific Technical Fields

### 1. Base UOM vs. Selling UOM
* **Base UOM:** Yeh backend inventory ki single source of truth hai. Ye hamesha continuous standard measurement unit honi chahiye (Jaise **Kg** for weight, **Sq.Ft** for area, **Piece** for discrete items).
* **Selling UOM:** Yeh customer-facing packaging units hoti hain (Jaise **Bag**, **Tonne**, **Box**, **Rod**).

### 2. Conversion Factor Calculation Formula
$$\text{Conversion Factor} = \frac{1 \text{ Selling Unit}}{\text{Base Unit}}$$

* **Scenario A (Cement):**
  * Base UOM = `Kg`
  * Selling Unit = `50 Kg Bag`
  * Formula: $1 \text{ Bag} = 50 \text{ Kg}$  
  * **Conversion Factor = 50.0000**
* **Scenario B (12mm Steel Rebar):**
  * Base UOM = `Kg`
  * Selling Unit = `12mm Rod (Standard 12 Metre Length)`
  * Formula: $1 \text{ Rod} = 10.66 \text{ Kg}$ (as per IS weight standard $d^2/162 \times 12$)  
  * **Conversion Factor = 10.6600**
* **Scenario C (Vitrified Tiles):**
  * Base UOM = `Sq. Ft.`
  * Selling Unit = `Box (Contains 4 tiles of 2ft x 2ft)`
  * Formula: $1 \text{ Box} = 4 \times (2 \times 2) = 16 \text{ Sq. Ft.}$  
  * **Conversion Factor = 16.0000**

### 3. Loose Sale Toggle (`allow_loose_sale`)
* Agar **`allow_loose_sale = false`**: Customer app me quantity sirf whole numbers me order hogi (`1, 2, 3, 4...`). Koi customer `1.5 Bag` cement ya `2.2 Box` tiles cart me add nahi kar sakta.
* Agar **`allow_loose_sale = true`**: Customer fractional order de sakta hai (Jaise `12.5 Cft` sand, ya `140.8 Kg` steel).

---

## 8. Real-World Walkthrough Examples

### Real Example 1: UltraTech PPC Cement

```
1. Category: Building Materials (Code: BLD_MAT)
2. Sub-Category: Cement (Code: CEMENT)
   - Default Base UOM: Kilogram (Kg)
   - Default Packing Rule: Standard 50 Kg Moisture-Proof Bag
   - Allow Loose by Default: False
3. Master Product:
   - Name: UltraTech Super PPC Cement (50 Kg Bag)
   - SKU: ULT-PPC-50KG
   - Brand: UltraTech
   - Base UOM: Kg
   - Multi-UOM Matrix:
     * Row 1 (Default): Unit = Bag | Price = ₹380 | Factor = 50 | Loose = NO | MOQ = 1 | Step = 1 | Pack Contains = 50
     * Row 2: Unit = Metric Tonne | Price = ₹7400 | Factor = 1000 | Loose = NO | MOQ = 1 | Step = 1 | Pack Contains = 1000
4. Vendor Stock:
   - Vendor: Sharma Traders
   - Inward: 400 Bags (Recorded as 20,000 Kg in Ledger)
   - Selling Price: ₹375 per bag
```

---

### Real Example 2: Tata Tiscon 12mm TMT Rebar

```
1. Category: Steel & Iron (Code: STEEL_IRON)
2. Sub-Category: TMT Rebars (Code: TMT_REBAR)
   - Default Base UOM: Kilogram (Kg)
   - Default Packing Rule: 12 Metre Length Bundle
   - Allow Loose by Default: True
3. Master Product:
   - Name: Tata Tiscon 550D 12mm TMT Steel Bar
   - SKU: TISCON-550D-12MM
   - Brand: Tata Tiscon
   - Base UOM: Kg
   - Multi-UOM Matrix:
     * Row 1 (Default): Unit = Piece (Rod) | Price = ₹720 | Factor = 10.66 | Loose = NO | MOQ = 1 | Step = 1 | Pack Contains = 10.66
     * Row 2: Unit = Kilogram | Price = ₹68.00 | Factor = 1.00 | Loose = YES | MOQ = 50 | Step = 10 | Pack Contains = 1
     * Row 3: Unit = Metric Tonne | Price = ₹66,500 | Factor = 1000 | Loose = NO | MOQ = 1 | Step = 1 | Pack Contains = 1000
4. Vendor Stock:
   - Vendor: Jaipur Steel Depot
   - Inward: 5 Tonnes (Recorded as 5,000 Kg in Ledger)
```

---

### Real Example 3: Kajaria 600x600mm Vitrified Floor Tiles

```
1. Category: Flooring & Tiles (Code: FLOORING)
2. Sub-Category: Vitrified Tiles (Code: VIT_TILES)
   - Default Base UOM: Square Feet (Sq.Ft)
   - Default Packing Rule: 1 Box = 4 Tiles (16 Sq. Ft. Coverage)
   - Allow Loose by Default: False
3. Master Product:
   - Name: Kajaria Royale Marfil Vitrified Floor Tile (600x600 mm)
   - SKU: KAJ-ROY-MAR-600
   - Brand: Kajaria
   - Base UOM: Sq.Ft
   - Multi-UOM Matrix:
     * Row 1 (Default): Unit = Box | Price = ₹720 | Factor = 16.00 | Loose = NO | MOQ = 2 | Step = 1 | Pack Contains = 16
     * Row 2: Unit = Sq.Ft | Price = ₹45.00 | Factor = 1.00 | Loose = NO | MOQ = 32 | Step = 16 | Pack Contains = 1
4. Vendor Stock:
   - Vendor: Rajasthan Ceramic Gallery
   - Inward: 250 Boxes (Recorded as 4,000 Sq.Ft in Ledger)
```

---

## 9. Common Mistakes & Best Practices Checklist

| # | Common Mistake | System Impact / Danger | Sahi Tarika (Best Practice) |
| :---: | :--- | :--- | :--- |
| ❌ 1 | **Base UOM me "Bag" ya "Box" select karna** | Jab customer Tonne ya loose order karega toh calculation fail ho jayegi. | Hamesha standardized base measurement choose karein (**Kg, Sq.Ft, Meter, Piece**). |
| ❌ 2 | **Conversion Factor ulta enter karna** (e.g. 50 ki jagah 0.02) | Stock deduct hone ki jagah crash ho jayega ya galat multiply hoga. | Yaad rakhein: **1 Selling Unit = Kitne Base Units.** (1 Bag = 50 Kg, toh factor = `50`). |
| ❌ 3 | **Cement ya Tiles me Loose Sale ON kar dena** | Customer 1.2 bag order kar dega aur dukaandar bag phod kar delivery nahi de payega. | Packaged sealed items me `allow_loose_sale` hamesha **OFF (No)** rakhein. |
| ❌ 4 | **SKU me space ya special character daalna** | Barcode generation aur URL routing fail ho sakti hai. | Hamesha uppercase alphanumeric aur hyphen use karein: `BRAND-CATEGORY-SIZE` (e.g. `ULT-PPC-50KG`). |
| ❌ 5 | **Bina Inward Entry ke vendor stock direct edit karna** | Audit mismatch aayega aur reconciliation me pata nahi chalega stock kahan se aaya. | Hamesha **`Add Stock Inward`** modal use karein aur valid challan number dalein. |

---

> [!TIP]
> **Summary Checklist Before Product Go-Live:**
> 1. ✅ Main Category & Subcategory created.
> 2. ✅ Subcategory has correct `default_base_uom_id` (e.g., Kg for Cement/Steel).
> 3. ✅ Master Product has clean Cover Photo (800x800px) and SKU.
> 4. ✅ Pricing Matrix has at least 1 Default Selling Unit with accurate Conversion Factor.
> 5. ✅ Vendor has assigned product with opening stock inward & challan reference.
> 6. ✅ Product is toggled `is_active: true` and vendor status is `in_stock`.
