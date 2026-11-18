import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';

/**
 * Pre-defined Training Data Dictionaries for each form in BuilDeck
 * Explaining: Kya Hoga, Kyu Liya Ja Raha Hai, Example & Pro-Tips in Hindi + English.
 */
export const FORM_TRAINING_PRESETS = {
    category: {
        title: "Main Category Form - Training & Input Guide",
        subtitle: "Storefront ke top-level catalog classification form ka complete input guide",
        overview: "Main Category customer-facing storefront ka top navigation level hota hai. Yahan basic catalog group create hota hai jiske andar Sub-Categories aati hain.",
        fields: [
            {
                name: "Category Name",
                key: "name",
                type: "Text",
                required: true,
                kyaHoga: "Storefront, Mobile App aur Admin navigation me Category ka primary display name set karega.",
                kyuLiya: "Customer isi title ke zariye app me browse karta hai (e.g. 'Building Materials' ya 'Flooring & Tiles').",
                example: "Building Materials, Steel & Structural, Flooring & Tiles, Electricals",
                proTip: "Naam simple, standard aur customer-friendly rakhein. Brand names yahan na daalein."
            },
            {
                name: "Category Code",
                key: "code",
                type: "Text (Uppercase)",
                required: true,
                kyaHoga: "System ke andar unique slug aur identifier create karega.",
                kyuLiya: "Backend API routing, analytics tracking aur internal ERP mapping me code se identification hoti hai.",
                example: "CAT_BUILDING_MAT, STEEL_IRON, TILES_FLOORING",
                proTip: "Hamesha uppercase aur underscore use karein. Spaces aur special symbols mat use karein."
            },
            {
                name: "Display Order",
                key: "display_order",
                type: "Number",
                required: false,
                kyaHoga: "Category list aur app home menu me iska sequence position decide karega.",
                kyuLiya: "Sabse zyada bikne wali aur high-priority categories ko app ke top par dikhane ke liye (e.g., 1 par Cement/Steel, 5 par Paints).",
                example: "1 (Sabse pehle dikhega), 2, 3...",
                proTip: "Agar blank chhodenge toh default sequence me save hoga."
            },
            {
                name: "Status (Active / Inactive)",
                key: "is_active",
                type: "Switch / Toggle",
                required: false,
                kyaHoga: "Category ko pure platform par live (visible) ya draft (hidden) banata hai.",
                kyuLiya: "Agar koi category under-construction ho ya seasonal off ho, toh use bina delete kiye app se chupaya ja sake.",
                example: "Active = Checked (Green) | Inactive = Unchecked (Gray)",
                proTip: "Category ko Inactive karne par uske andar ki sabhi subcategories bhi customer app me chup jayengi."
            }
        ]
    },

    subCategory: {
        title: "Sub-Category Form - Training & Input Guide",
        subtitle: "Base UOM, Packaging Rules aur Loose Sale control karne wale core form ka guide",
        overview: "Sub-Category BuilDeck ka sabse important catalog node hai. Yeh decide karti hai ki iske andar banne wale sabhi products ka Base Inventory Unit kya hoga aur factory packaging rule kya hoga.",
        fields: [
            {
                name: "Parent Category",
                key: "category_id",
                type: "Searchable Dropdown",
                required: true,
                kyaHoga: "Subcategory ko uske main parent category se jodta hai.",
                kyuLiya: "Catalog hierarchy maintain rakhne ke liye taaki 'Cement' Building Materials ke under hi dikhe, Paints ke under nahi.",
                example: "Building Materials, Flooring & Tiles",
                proTip: "Agar aapne left menu me category select ki hui hai toh yeh auto-select ho jata hai."
            },
            {
                name: "Sub-Category Name",
                key: "name",
                type: "Text",
                required: true,
                kyaHoga: "Specific trade classification name store karta hai.",
                kyuLiya: "Customer jab main category open karega toh usko specific product lines dikhane ke liye.",
                example: "Cement, TMT Rebars, Vitrified Tiles, River Sand, Red Bricks",
                proTip: "Trade-standard naam use karein jo local mistri aur contractors aam taur par bolte hain."
            },
            {
                name: "Sub-Category Code",
                key: "code",
                type: "Text (Uppercase)",
                required: true,
                kyaHoga: "Unique subcategory system code generate karta hai.",
                kyuLiya: "Automated SKU generation, filter APIs aur warehouse segregation ke liye.",
                example: "SUB_CEMENT, TMT_REBAR, VIT_TILES",
                proTip: "Short aur crisp code rakhein."
            },
            {
                name: "Default Base UOM",
                key: "default_base_uom_id",
                type: "Searchable Dropdown",
                required: true,
                kyaHoga: "Is subcategory ke sabhi products ke liye core inventory unit lock karta hai.",
                kyuLiya: "CRITICAL: Warehouse ka sara stock ledger, purchase record aur conversion calculations isi unit me hoga.",
                example: "Cement: Kg | Steel: Kg | Tiles: Sq.Ft | Sand: Cft | Bricks: Piece",
                proTip: "Kabhi bhi Base UOM me 'Bag' ya 'Box' na daalein. Hamesha continuous base measurement (Kg, Sq.Ft) daalein."
            },
            {
                name: "Packing / Sizing Rule Description",
                key: "packing_rule_desc",
                type: "Text",
                required: false,
                kyaHoga: "Naye product banate waqt default packaging guideline auto-fill karega.",
                kyuLiya: "Vendor aur customer ko pata chale ki factory packing form factor kya hai.",
                example: "Standard 50 Kg Moisture-Proof Bag | 1 Box = 16 Sq. Ft. (4 Tiles) | 12 Metre Straight Length",
                proTip: "Isme standard industrial packaging aur pieces/weight clear likhein."
            },
            {
                name: "Allow Loose Sale",
                key: "allows_loose_by_default",
                type: "Switch / Toggle",
                required: false,
                kyaHoga: "Subcategory ke sabhi products me loose sale ka default status set karega.",
                kyuLiya: "Packaged sealed goods (Cement bag, Tile box) ko khula bechne se rokne ke liye taaki breakage aur moisture damage na ho.",
                example: "Cement: False (Full bag only) | Tiles: False (Full box only) | Sand/Steel: True (Loose allowed)",
                proTip: "Cement me kabhi bhi Loose Sale allow na karein!"
            },
            {
                name: "Status (Active / Inactive)",
                key: "is_active",
                type: "Switch / Toggle",
                required: false,
                kyaHoga: "Subcategory ko active ya inactive toggle karta hai.",
                kyuLiya: "Under-process items ko catalog me ready hone tak hide rakhne ke liye.",
                example: "Active = Live on App | Inactive = Hidden",
                proTip: "Catalog verification ke baad hi Active karein."
            }
        ]
    },

    product: {
        title: "Master Product & Multi-UOM Form - Training & Input Guide",
        subtitle: "Product details, Cover/Gallery Photos aur Multi-UOM Pricing Matrix ka complete guide",
        overview: "Yeh BuilDeck ka main Product Onboarding form hai. Yahan General Details, Images, aur Construction Multi-UOM Pricing Matrix (Bag vs Tonne vs Rod vs Loose) configure hoti hai.",
        fields: [
            {
                name: "Product Name",
                key: "name",
                type: "Text",
                required: true,
                kyaHoga: "Product ka official full commercial title banega jo customer app me dikhega.",
                kyuLiya: "Customer isi exact title ko search karta hai. Title me Brand, Grade aur Packaging saaf honi chahiye.",
                example: "UltraTech Super PPC Cement (50 Kg Bag) | Tata Tiscon 550D 12mm Rebar",
                proTip: "Brand + Sub-Category + Specification/Grade + Size format follow karein."
            },
            {
                name: "SKU / Code",
                key: "sku",
                type: "Text (Unique)",
                required: true,
                kyaHoga: "Product ka unique stock code identifier banata hai.",
                kyuLiya: "Warehouse barcode scanning, multi-vendor stock linking aur duplicate entry rokne ke liye.",
                example: "ULT-PPC-50KG, TISCON-12MM-550D, KAJ-PVT-600X600",
                proTip: "SKU me spaces mat daalein. Hyphen (-) use karein. System me do product ka same SKU nahi ho sakta."
            },
            {
                name: "Sub-Category",
                key: "sub_category_id",
                type: "Searchable Dropdown",
                required: true,
                kyaHoga: "Product ko specific sub-category se jodta hai.",
                kyuLiya: "Isko select karte hi Base UOM, Packing Rule aur Pricing Matrix row auto-populate ho jate hain.",
                example: "Cement, TMT Rebars, Vitrified Tiles",
                proTip: "Hamesha sabse pehle Sub-Category select karein taaki baaki form auto-configure ho jaye."
            },
            {
                name: "Approved Master Brand",
                key: "brand_id",
                type: "Searchable Dropdown",
                required: false,
                kyaHoga: "Product ko platform-certified manufacturer brand se associate karta hai.",
                kyuLiya: "Customer brand filter laga kar genuine products dhoondh sake. Local unbranded maal ke liye 'Generic' rakhein.",
                example: "UltraTech, Tata Tiscon, Kajaria, Generic / No Specific Brand",
                proTip: "Agar brand list me na mile toh pehle Brands Master me brand create karein."
            },
            {
                name: "Inventory Base UOM",
                key: "base_uom_id",
                type: "Searchable Dropdown",
                required: true,
                kyaHoga: "Is specific product ka internal accounting measurement unit.",
                kyuLiya: "Customer chahe Tonne me khareede ya Bag me, backend warehouse se stock isi unit me deduct hoga.",
                example: "Cement ke liye: Kg | Steel ke liye: Kg | Tiles ke liye: Sq.Ft",
                proTip: "Yeh sub-category se auto-fill hota hai. Ise manual tabhi badlein agar koi exceptional packing ho."
            },
            {
                name: "Packing / Sizing Rule",
                key: "packing_rule_desc",
                type: "Text",
                required: false,
                kyaHoga: "Cart, Checkout bill aur Product card par physical packaging guideline display karega.",
                kyuLiya: "Site engineer, customer aur transporter ko delivery ke waqt package dimensions aur form pata chal sake.",
                example: "Standard 50 Kg Moisture-Proof Bag | 1 Box = 16 Sq. Ft. Coverage (4 Tiles)",
                proTip: "Clear aur accurate packaging rule likhein taaki delivery ke waqt dispute na ho."
            },
            {
                name: "Product Description",
                key: "description",
                type: "Textarea",
                required: false,
                kyaHoga: "Product detail screen par technical specifications aur applications dikhata hai.",
                kyuLiya: "IS certifications (IS 1489), compressive strength, curing period aur usage builder ko confidence deta hai.",
                example: "High early strength PPC cement suitable for RCC slab casting, plastering and foundation.",
                proTip: "Key features aur BIS certification code zaroor mention karein."
            },
            {
                name: "Main Cover Image",
                key: "cover_image",
                type: "File Upload (Image)",
                required: false,
                kyaHoga: "Product card, search list aur cart modal ka primary square photo banega.",
                kyuLiya: "Visual validation. E-commerce me bina clean photo ke 80% customer order nahi karte.",
                example: "800x800px (1:1 Ratio), Max 5MB (JPG, PNG, WebP). Clean white background.",
                proTip: "Product ka front angle aur brand logo clearly visible hona chahiye."
            },
            {
                name: "Product Gallery Photos",
                key: "gallery_images",
                type: "Multiple File Upload",
                required: false,
                kyaHoga: "Product details page par swipeable multi-photo carousel gallery banata hai.",
                kyuLiya: "Cement bag ka ISI mark stamp, expiry date, tile surface gloss reflection aur steel cross-section dikhane ke liye.",
                example: "3 to 5 photos: Front, Back packaging, ISI stamp, on-site application.",
                proTip: "Aap ek saath multiple photos select karke upload kar sakte hain."
            },
            {
                name: "Pricing Matrix: Selling Unit (UOM)",
                key: "pricing_matrix.uom_id",
                type: "Searchable Dropdown",
                required: true,
                kyaHoga: "Wo unit jisme customer product khareed sakega.",
                kyuLiya: "Construction me customer kabhi 1 Bag mangta hai, kabhi 1 Tonne. Har unit ka rate alag set hota hai.",
                example: "Bag, Metric Tonne, Piece (Rod), Square Feet, Kilogram",
                proTip: "Ek product me multiple units add kar sakte hain (e.g. Row 1: Bag, Row 2: Tonne)."
            },
            {
                name: "Pricing Matrix: Selling Price (₹)",
                key: "pricing_matrix.selling_price",
                type: "Number",
                required: true,
                kyaHoga: "Is specific selling unit ka standard selling rate set karega.",
                kyuLiya: "Cart me total bill calculate karne ke liye rate multiply hota hai.",
                example: "Bag rate: ₹380.00 | Tonne rate: ₹7400.00",
                proTip: "Tax inclusive standard catalog selling price dalein."
            },
            {
                name: "Pricing Matrix: Factor to Base (Conversion)",
                key: "pricing_matrix.conversion_factor",
                type: "Number (Decimal)",
                required: true,
                kyaHoga: "1 Selling Unit = Kitne Base Units. Automatic stock deduction multiplier.",
                kyuLiya: "CRITICAL: Jab customer 1 Bag khareede, toh stock se 50 Kg minus ho. Jab 1 Tonne khareede toh 1000 Kg minus ho.",
                example: "Base Kg hone par: Bag Factor = 50.0000 | Tonne Factor = 1000.0000 | 12mm Rod = 10.6600",
                proTip: "Formula: (1 Selling Unit me maujood Base Units). Kabhi ulta (0.02) mat dalein."
            },
            {
                name: "Pricing Matrix: Sell as Loose?",
                key: "pricing_matrix.allow_loose_sale",
                type: "Switch / Toggle",
                required: true,
                kyaHoga: "Decide karta hai ki kya customer decimal/khula quantity le sakta hai ya sirf full sealed pack.",
                kyuLiya: "Cement bag ya Tile box tod kar khula nahi bikta. Sand aur Steel loose bikte hain.",
                example: "Cement Bag = No (Full Pack) | Tile Box = No (Full Pack) | Sand Cft = Yes (Loose)",
                proTip: "Packaged goods me ise hamesha 'No (Full Pack)' rakhein taaki koi 1.5 bag order na kare."
            },
            {
                name: "Pricing Matrix: Minimum Order Qty (MOQ)",
                key: "pricing_matrix.min_order_qty",
                type: "Number",
                required: true,
                kyaHoga: "Customer is unit me kam se kam kitni quantity cart me add kar sakta hai.",
                kyuLiya: "Chhote non-viable delivery orders ko rokne ke liye.",
                example: "Bag MOQ = 1 | Tonne MOQ = 1 | Bricks MOQ = 1000 | Sand MOQ = 50",
                proTip: "Retail bags me MOQ 1 rakhein, bulk materials me minimum dispatch lot rakhein."
            },
            {
                name: "Pricing Matrix: Step / Multiplier",
                key: "pricing_matrix.step_qty",
                type: "Number",
                required: true,
                kyaHoga: "Cart me '+' ya '-' dabane par quantity kitne ke gap se badhegi/ghategi.",
                kyuLiya: "Fractional aur odd numbers rokne ke liye taaki delivery standard lot me ho.",
                example: "Bricks Step = 500 (Customer 1000, 1500, 2000 order karega) | Bag Step = 1",
                proTip: "Full pack me Step hamesha 1 rakhein."
            },
            {
                name: "Pricing Matrix: Pack Contains Quantity",
                key: "pricing_matrix.pack_contain_qty",
                type: "Number",
                required: false,
                kyaHoga: "1 pack ke andar ka raw coverage ya weight indicate karta hai.",
                kyuLiya: "App ke construction calculator (Tiles area calculator / Cement estimator) ko power karta hai.",
                example: "Tile box me 16 (Sq.Ft) | Cement bag me 50 (Kg) | Wire bundle me 90 (Metre)",
                proTip: "Customer ko samajhne me madad milti hai ki 1 box me kitne sq.ft coverage hoga."
            },
            {
                name: "Pricing Matrix: Default Selling Unit",
                key: "pricing_matrix.is_default_selling_unit",
                type: "Radio Selection",
                required: true,
                kyaHoga: "Storefront par product card par sabse pehle kaunsa unit aur rate display hoga.",
                kyuLiya: "Customer ko product list me sabse practical retail rate dikhana zaroori hota hai.",
                example: "Cement me 'Bag' ko default banayein, Steel me 'Rod' ya 'Kg' ko default banayein.",
                proTip: "Poore matrix me sirf ek unit Default ho sakti hai."
            }
        ]
    },

    assignVendorProduct: {
        title: "Vendor Product Assignment Form - Training Guide",
        subtitle: "Master Product ko kisi local Vendor/Dukaandar ke store aur inventory me map karne ka guide",
        overview: "Master catalog banne ke baad wo product customer ko tab tak nahi dikhta jab tak kisi local Vendor ke paas uska Stock aur Local Price map na ho.",
        fields: [
            {
                name: "Select Approved Vendor",
                key: "vendor_id",
                type: "Searchable Dropdown",
                required: true,
                kyaHoga: "Product ko us local dukaandar/distributor se baandhta hai jo delivery dispatch karega.",
                kyuLiya: "Customer ke delivery location/pincode ke mutabiq usi vendor ka stock dikhta hai jo service de sakta hai.",
                example: "M/s Sharma Building Materials (Jaipur)",
                proTip: "Vendor approved aur active hona chahiye."
            },
            {
                name: "Master Product",
                key: "product_id",
                type: "Searchable Dropdown",
                required: true,
                kyaHoga: "Master Catalog me se product select karta hai.",
                kyuLiya: "Master SKU, Photos, Specifications aur Base UOM inherit ho jaate hain.",
                example: "UltraTech Super PPC Cement (50 Kg Bag) [ULT-PPC-50KG]",
                proTip: "Product select karte hi uske sabhi UOM pricing tiers auto-load ho jayenge."
            },
            {
                name: "Opening Stock",
                key: "stock",
                type: "Number",
                required: true,
                kyaHoga: "Vendor ke warehouse me is product ka initial available stock register karega.",
                kyuLiya: "App me 'In Stock' ya 'Out of Stock' status isi number se calculate hota hai. Yeh Base UOM me hota hai.",
                example: "10000 (Agar Base Kg hai aur vendor ke paas 200 bags hain: 200 x 50 = 10000 Kg)",
                proTip: "CRITICAL: Stock hamesha Base UOM me hota hai (Kg, Sq.Ft, Piece)."
            },
            {
                name: "Low Stock Alert Limit",
                key: "low_stock_alert",
                type: "Number",
                required: false,
                kyaHoga: "Stock is limit se kam hone par vendor aur admin ko restock warning bhejega.",
                kyuLiya: "Inventory dry out hone se pehle procurement schedule karne ke liye.",
                example: "1000 Kg (20 bags bachte hi alert trigger hoga)",
                proTip: "Vendor ke lead time ke hisaab se 2-3 din ka buffer stock limit set karein."
            },
            {
                name: "Base Selling Price (₹)",
                key: "selling_price",
                type: "Number",
                required: true,
                kyaHoga: "Vendor ka base unit selling rate set karega.",
                kyuLiya: "Fallback price for inventory valuation and loose billing.",
                example: "₹7.60 per Kg",
                proTip: "Yeh base unit ka rate hai (e.g. per Kg). UOM rates table me bag-wise rate alag se set karein."
            },
            {
                name: "Vendor Multi-UOM Custom Rates Table",
                key: "uom_rates",
                type: "Table Inputs",
                required: true,
                kyaHoga: "Vendor har selling unit (Bag, Tonne, Piece) ka apna local selling price set kar sakta hai.",
                kyuLiya: "Har vendor ki local transport aur margin alag hoti hai. E.g. Master price ₹380 hai par vendor ₹375 me bechna chahta hai.",
                example: "Bag = ₹375.00 | Tonne = ₹7200.00",
                proTip: "Vendor kisi unit ko 'Inactive' bhi kar sakta hai agar wo bulk truck supply handle nahi karta."
            }
        ]
    },

    stockInward: {
        title: "Stock Inward / Shipment Modal - Training Guide",
        subtitle: "Vendor inventory me naya maal add karne aur Stock Ledger Passbook audit ka complete guide",
        overview: "BuilDeck me physical stock bina audit trail ke direct update nahi hota. Har entry Bank Passbook ki tarah Inward/Outward ledger me document hoti hai.",
        fields: [
            {
                name: "Entry Unit (UOM)",
                key: "uom_id",
                type: "Searchable Dropdown",
                required: true,
                kyaHoga: "Factory shipment truck jis unit me aaya hai wo select karta hai.",
                kyuLiya: "Dukaandar ko Kg me convert karne ki mehnat nahi karni padti. Wo direct 'Bag' ya 'Tonne' select kar sakta hai.",
                example: "Bag, Metric Tonne, Piece (Rod)",
                proTip: "System conversion factor laga kar apne aap Base UOM me stock ledger credit karega."
            },
            {
                name: "Received Quantity",
                key: "quantity",
                type: "Number",
                required: true,
                kyaHoga: "Shipment me physical kitne units deliver hue hain.",
                kyuLiya: "Current inventory me yeh quantity add ho jayegi (+).",
                example: "200 Bags (Auto converts to +10,000 Kg in ledger)",
                proTip: "Physical unloading count check karke accurate quantity daalein."
            },
            {
                name: "Purchase / Inward Cost (₹)",
                key: "unit_cost_price",
                type: "Number",
                required: false,
                kyaHoga: "Vendor ka factory se landing purchase rate record karega.",
                kyuLiya: "Vendor profit margin, gross margin analytics aur inventory valuation ke liye.",
                example: "₹330.00 per Bag",
                proTip: "Landing cost (Freight + GST milakar) enter karein."
            },
            {
                name: "Invoice / PO / Challan No.",
                key: "reference_no",
                type: "Text",
                required: true,
                kyaHoga: "Factory delivery challan ya tax invoice number ledger me attach karega.",
                kyuLiya: "Physical audit aur GST mismatch investigation me challan paper se match karne ke liye mandatory hai.",
                example: "CH-2026-8891, INV-UT-4412",
                proTip: "Bina valid challan number ke entry na karein taaki audit pass ho sake."
            },
            {
                name: "Remarks / Batch Details",
                key: "notes",
                type: "Text",
                required: false,
                kyaHoga: "Truck number, driver details, manufacturing batch code note karta hai.",
                kyuLiya: "Agar maal me koi setting defect ya damage nikle toh truck/batch trace ho sake.",
                example: "Truck RJ-14-GA-9912, Batch 44B, Manufacturing Nov 2026",
                proTip: "Truck number zaroor likhein taaki transporter verification aasan rahe."
            }
        ]
    },

    brand: {
        title: "Brand Master Form - Training Guide",
        subtitle: "Certified manufacturer brands onboard karne ka guide",
        overview: "Certified brands se customer ko genuine products pehchanne me madad milti hai aur duplicate local brands filter ho jate hain.",
        fields: [
            {
                name: "Brand Name",
                key: "name",
                type: "Text",
                required: true,
                kyaHoga: "Brand ka official registered brand name set karta hai.",
                kyuLiya: "Customer brand filter laga sake aur verified products dhoondh sake.",
                example: "UltraTech Cement, Tata Tiscon, Kajaria Ceramics, Asian Paints",
                proTip: "Official company trade name use karein."
            },
            {
                name: "Approved Master Brand",
                key: "is_approved_master",
                type: "Switch / Checkbox",
                required: false,
                kyaHoga: "Brand ko platform-verified certified badge deta hai.",
                kyuLiya: "Fake aur duplicate local brand entry ko rokne ke liye.",
                example: "Checked = Verified National/Regional Brand",
                proTip: "Verified manufacturers ke liye ise hamesha Checked rakhein."
            },
            {
                name: "Mapped Sub-Categories",
                key: "sub_category_ids",
                type: "Multi-Select Checkboxes",
                required: false,
                kyaHoga: "Brand ko un subcategories me restrict karta hai jisme wo operate karta hai.",
                kyuLiya: "Jab user 'Cement' select kare toh sirf cement brands dikhein, tiles ke brands na dikhein.",
                example: "UltraTech -> Cement, RMC | Kajaria -> Vitrified Tiles, Ceramic Tiles",
                proTip: "Relevant subcategories ko tick karein taaki product dropdown clean rahe."
            }
        ]
    },

    uom: {
        title: "Unit of Measure (UOM) Form - Training Guide",
        subtitle: "Standardized physical units register karne ka complete guide",
        overview: "Units of Measure BuilDeck ke inventory aur multi-unit engine ki buniyad hain.",
        fields: [
            {
                name: "Unit Full Name",
                key: "name",
                type: "Text",
                required: true,
                kyaHoga: "Unit ka poora commercial naam store karega.",
                kyuLiya: "Customer aur admin readability ke liye.",
                example: "Metric Tonne, Kilogram, Square Feet, 50 Kg Bag, Piece",
                proTip: "Title case me likhein (e.g. Metric Tonne)."
            },
            {
                name: "Unit Code",
                key: "code",
                type: "Text (Uppercase)",
                required: true,
                kyaHoga: "Standard uppercase identifier code generate karega.",
                kyuLiya: "GST E-way bills, ERP lookups aur API payloads ke liye.",
                example: "TONNE, KG, SQFT, BAG, PCS",
                proTip: "Government GST UOM code standard se match karein."
            },
            {
                name: "Unit Symbol",
                key: "symbol",
                type: "Text",
                required: true,
                kyaHoga: "UI aur price tags ke aage display hoga.",
                kyuLiya: "Mobile screen par space bachane ke liye (e.g. ₹380 / bag, ₹68 / kg).",
                example: "t, kg, sq.ft, bag, pc, box",
                proTip: "Standard lower-case short symbol use karein."
            },
            {
                name: "Category Group",
                key: "unit_category",
                type: "Dropdown",
                required: true,
                kyaHoga: "Dimension type define karta hai (Mass, Volume, Area, Length, Discrete Pack, Count).",
                kyuLiya: "Incompatible unit conversions ko rokne ke liye (Jaise weight ko area se divide na kiya ja sake).",
                example: "Mass / Weight (Kg, Tonne) | Area (Sq.Ft) | Discrete Pack (Bag, Box)",
                proTip: "Correct physical dimension group hi chunein."
            },
            {
                name: "Is Discrete Unit?",
                key: "is_discrete",
                type: "Checkbox",
                required: false,
                kyaHoga: "Pack / Count unit hai ya continuous decimal measurement.",
                kyuLiya: "Decimal validation enforce karne ke liye.",
                example: "Bags / Boxes = Discrete (True) | Kg / Litre = Continuous (False)",
                proTip: "Jo unit aadhi nahi todi ja sakti use Discrete mark karein."
            }
        ]
    }
};

/**
 * Reusable Form Training Button
 */
export function FormTrainingButton({
    onClick,
    label = "Form Training & Field Guide",
    className = "btn btn-outline-info btn-sm d-inline-flex align-items-center gap-1 shadow-sm",
}) {
    return (
        <button
            type="button"
            className={className}
            onClick={onClick}
            title="Is form ke har input field ka matlab, use-case aur example dekhein"
        >
            <i className="ri-graduation-cap-line fs-14"></i>
            <span className="fw-medium">{label}</span>
        </button>
    );
}

/**
 * Reusable Form Training Modal Component
 */
export default function FormTrainingModal({
    isOpen,
    onClose,
    formKey,
    customData = null,
}) {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRequiredOnly, setFilterRequiredOnly] = useState(false);

    const config = useMemo(() => {
        if (customData) return customData;
        return FORM_TRAINING_PRESETS[formKey] || null;
    }, [formKey, customData]);

    const filteredFields = useMemo(() => {
        if (!config || !config.fields) return [];
        return config.fields.filter(field => {
            const matchesSearch =
                field.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                field.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
                field.kyaHoga.toLowerCase().includes(searchQuery.toLowerCase()) ||
                field.kyuLiya.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (field.example && field.example.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchesRequired = filterRequiredOnly ? field.required : true;

            return matchesSearch && matchesRequired;
        });
    }, [config, searchQuery, filterRequiredOnly]);

    if (!isOpen || !config) return null;

    return createPortal(
        <div
            className="modal fade show d-block"
            tabIndex="-1"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.65)', zIndex: 1060 }}
            onClick={onClose}
        >
            <div
                className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable my-3"
                style={{ maxWidth: '850px' }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                    {/* Modal Header */}
                    <div className="modal-header bg-primary text-white py-3 px-4">
                        <div className="d-flex align-items-center gap-2">
                            <div
                                className="bg-white text-primary rounded-circle d-flex align-items-center justify-content-center"
                                style={{ width: '36px', height: '36px', fontSize: '18px' }}
                            >
                                <i className="ri-graduation-cap-fill"></i>
                            </div>
                            <div>
                                <h5 className="modal-title fw-bold text-white mb-0 fs-16">
                                    {config.title}
                                </h5>
                                <div className="text-white-50 fs-12">
                                    {config.subtitle}
                                </div>
                            </div>
                        </div>
                        <button
                            type="button"
                            className="btn-close btn-close-white"
                            onClick={onClose}
                            aria-label="Close"
                        ></button>
                    </div>

                    {/* Overview & Search Bar */}
                    <div className="bg-light p-3 border-bottom">
                        {config.overview && (
                            <div className="alert alert-info py-2 px-3 mb-3 fs-13 d-flex align-items-start gap-2 border-0 bg-info-subtle text-info-emphasis">
                                <i className="ri-information-fill fs-16 mt-0"></i>
                                <div>
                                    <strong>Form Overview: </strong>{config.overview}
                                </div>
                            </div>
                        )}

                        <div className="row g-2 align-items-center">
                            <div className="col-md-8">
                                <div className="input-group input-group-sm">
                                    <span className="input-group-text bg-white border-end-0">
                                        <i className="ri-search-line text-muted"></i>
                                    </span>
                                    <input
                                        type="text"
                                        className="form-control border-start-0"
                                        placeholder="Search any input name, keyword or example (e.g. sku, price, uom)..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        autoFocus
                                    />
                                    {searchQuery && (
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary border-start-0"
                                            onClick={() => setSearchQuery('')}
                                        >
                                            <i className="ri-close-line"></i>
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="col-md-4 text-md-end">
                                <div className="form-check form-check-inline mb-0 fs-12">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="mandatoryOnly"
                                        checked={filterRequiredOnly}
                                        onChange={(e) => setFilterRequiredOnly(e.target.checked)}
                                    />
                                    <label className="form-check-label text-muted" htmlFor="mandatoryOnly">
                                        Mandatory (*) Only
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Modal Body: Cards of Fields */}
                    <div className="modal-body p-4" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                        {filteredFields.length === 0 ? (
                            <div className="text-center py-5 text-muted">
                                <i className="ri-file-search-line fs-32 d-block mb-2 text-secondary"></i>
                                <div className="fs-14">Koi field match nahi hua query se: "{searchQuery}"</div>
                                <small>Kripya dusra keyword try karein.</small>
                            </div>
                        ) : (
                            <div className="d-flex flex-column gap-3">
                                {filteredFields.map((field, idx) => (
                                    <div
                                        key={idx}
                                        className="card border shadow-none"
                                        style={{ borderRadius: '10px', overflow: 'hidden' }}
                                    >
                                        <div className="card-header bg-body-secondary py-2 px-3 d-flex justify-content-between align-items-center">
                                            <div className="d-flex align-items-center gap-2">
                                                <span className="badge bg-secondary-subtle text-secondary border fs-11 font-monospace">
                                                    #{idx + 1}
                                                </span>
                                                <h6 className="mb-0 fw-bold text-dark fs-14">
                                                    {field.name}
                                                    {field.required && (
                                                        <span className="text-danger ms-1" title="Mandatory Field">*</span>
                                                    )}
                                                </h6>
                                                <span className="badge bg-light text-muted border fs-11 font-monospace">
                                                    key: {field.key}
                                                </span>
                                            </div>
                                            <div className="d-flex align-items-center gap-1">
                                                <span className="badge bg-info-subtle text-info border fs-11">
                                                    {field.type}
                                                </span>
                                                {field.required ? (
                                                    <span className="badge bg-danger-subtle text-danger border fs-11">
                                                        Mandatory
                                                    </span>
                                                ) : (
                                                    <span className="badge bg-secondary-subtle text-secondary border fs-11">
                                                        Optional
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="card-body p-3 fs-13">
                                            {/* Kya Hoga */}
                                            <div className="row g-2 mb-2">
                                                <div className="col-md-6">
                                                    <div className="p-2 rounded bg-light border-start border-3 border-primary h-100">
                                                        <div className="fw-semibold text-primary fs-12 mb-1 d-flex align-items-center gap-1">
                                                            <i className="ri-function-line"></i>
                                                            <span>Kya Hoga? (Functionality)</span>
                                                        </div>
                                                        <div className="text-secondary">{field.kyaHoga}</div>
                                                    </div>
                                                </div>

                                                {/* Kyu Liya Ja Raha Hai */}
                                                <div className="col-md-6">
                                                    <div className="p-2 rounded bg-light border-start border-3 border-success h-100">
                                                        <div className="fw-semibold text-success fs-12 mb-1 d-flex align-items-center gap-1">
                                                            <i className="ri-question-line"></i>
                                                            <span>Kyu Liya Ja Raha Hai? (Business Logic)</span>
                                                        </div>
                                                        <div className="text-secondary">{field.kyuLiya}</div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Example */}
                                            {field.example && (
                                                <div className="p-2 rounded bg-warning-subtle text-warning-emphasis border border-warning-subtle mb-2 fs-12 d-flex align-items-start gap-2">
                                                    <i className="ri-lightbulb-fill text-warning fs-15 mt-0"></i>
                                                    <div>
                                                        <strong>Real Example / Value: </strong>
                                                        <span className="font-monospace text-dark fw-medium">
                                                            {field.example}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Pro Tip / Alert */}
                                            {field.proTip && (
                                                <div className="fs-12 text-muted d-flex align-items-center gap-1">
                                                    <i className="ri-checkbox-circle-fill text-success fs-13"></i>
                                                    <span><strong>Pro-Tip:</strong> {field.proTip}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Modal Footer */}
                    <div className="modal-footer bg-light py-2 px-4 d-flex justify-content-between align-items-center">
                        <span className="text-muted fs-12">
                            Showing {filteredFields.length} of {config.fields?.length || 0} fields
                        </span>
                        <button type="button" className="btn btn-secondary btn-sm px-3" onClick={onClose}>
                            Close Guide
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
