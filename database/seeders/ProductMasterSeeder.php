<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductUomPrice;
use App\Models\SubCategory;
use App\Models\UnitOfMeasure;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductMasterSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Units of Measure Master
        $uomData = [
            // Mass
            ['name' => 'Kilogram', 'code' => 'KG', 'symbol' => 'kg', 'unit_category' => 'mass', 'is_discrete' => false],
            ['name' => 'Metric Tonne', 'code' => 'TONNE', 'symbol' => 'MT', 'unit_category' => 'mass', 'is_discrete' => false],
            ['name' => 'Bag (50 Kg)', 'code' => 'BAG_50KG', 'symbol' => 'bag', 'unit_category' => 'discrete_pack', 'is_discrete' => true],
            ['name' => 'Bag (40 Kg)', 'code' => 'BAG_40KG', 'symbol' => 'bag', 'unit_category' => 'discrete_pack', 'is_discrete' => true],
            ['name' => 'Bag (20 Kg)', 'code' => 'BAG_20KG', 'symbol' => 'bag', 'unit_category' => 'discrete_pack', 'is_discrete' => true],
            ['name' => 'Bag (5 Kg)', 'code' => 'BAG_5KG', 'symbol' => 'bag', 'unit_category' => 'discrete_pack', 'is_discrete' => true],
            ['name' => 'Pouch (1 Kg)', 'code' => 'POUCH_1KG', 'symbol' => 'pouch', 'unit_category' => 'discrete_pack', 'is_discrete' => true],

            // Volume
            ['name' => 'Cubic Feet', 'code' => 'CFT', 'symbol' => 'cft', 'unit_category' => 'volume', 'is_discrete' => false],
            ['name' => 'Brass (100 Cft)', 'code' => 'BRASS', 'symbol' => 'brass', 'unit_category' => 'volume', 'is_discrete' => false],
            ['name' => 'Litre', 'code' => 'LITRE', 'symbol' => 'L', 'unit_category' => 'volume', 'is_discrete' => false],
            ['name' => 'Bucket (20L)', 'code' => 'BUCKET_20L', 'symbol' => 'bucket', 'unit_category' => 'discrete_pack', 'is_discrete' => true],
            ['name' => 'Bucket (10L)', 'code' => 'BUCKET_10L', 'symbol' => 'bucket', 'unit_category' => 'discrete_pack', 'is_discrete' => true],
            ['name' => 'Can (4L)', 'code' => 'CAN_4L', 'symbol' => 'can', 'unit_category' => 'discrete_pack', 'is_discrete' => true],
            ['name' => 'Can (1L)', 'code' => 'CAN_1L', 'symbol' => 'can', 'unit_category' => 'discrete_pack', 'is_discrete' => true],

            // Area
            ['name' => 'Square Feet', 'code' => 'SQFT', 'symbol' => 'sq.ft', 'unit_category' => 'area', 'is_discrete' => false],
            ['name' => 'Box (Tile Coverage)', 'code' => 'BOX', 'symbol' => 'box', 'unit_category' => 'discrete_pack', 'is_discrete' => true],
            ['name' => 'Sheet (8x4 ft)', 'code' => 'SHEET_8X4', 'symbol' => 'sheet', 'unit_category' => 'discrete_pack', 'is_discrete' => true],

            // Length
            ['name' => 'Meter', 'code' => 'METER', 'symbol' => 'm', 'unit_category' => 'length', 'is_discrete' => false],
            ['name' => 'Coil (90m)', 'code' => 'COIL_90M', 'symbol' => 'coil', 'unit_category' => 'discrete_pack', 'is_discrete' => true],
            ['name' => 'Pipe (10ft)', 'code' => 'PIPE_10FT', 'symbol' => 'piece', 'unit_category' => 'discrete_pack', 'is_discrete' => true],

            // Count / Discrete
            ['name' => 'Piece', 'code' => 'PIECE', 'symbol' => 'pc', 'unit_category' => 'count', 'is_discrete' => true],
            ['name' => 'Pair', 'code' => 'PAIR', 'symbol' => 'pair', 'unit_category' => 'count', 'is_discrete' => true],
            ['name' => 'Pack of 10', 'code' => 'PACK_10', 'symbol' => 'pack', 'unit_category' => 'discrete_pack', 'is_discrete' => true],
            ['name' => 'Bundle (25 pcs)', 'code' => 'BUNDLE_25', 'symbol' => 'bundle', 'unit_category' => 'discrete_pack', 'is_discrete' => true],
            ['name' => 'Truckload (3000 pcs)', 'code' => 'TRUCKLOAD_3000', 'symbol' => 'truckload', 'unit_category' => 'discrete_pack', 'is_discrete' => true],
        ];

        $uoms = [];
        foreach ($uomData as $data) {
            $uoms[$data['code']] = UnitOfMeasure::updateOrCreate(['code' => $data['code']], $data);
        }

        // 2. Categories Master
        $categoriesData = [
            ['code' => 'CAT_STRUCTURAL', 'name' => 'Structural & Masonry Materials', 'display_order' => 1],
            ['code' => 'CAT_FINISHES', 'name' => 'Finishes, Paints & Adhesives', 'display_order' => 2],
            ['code' => 'CAT_SURFACES', 'name' => 'Flooring & Surface Finishes', 'display_order' => 3],
            ['code' => 'CAT_PLUMBING', 'name' => 'Plumbing, Pipes & Sanitaryware', 'display_order' => 4],
            ['code' => 'CAT_ELECTRICAL', 'name' => 'Electricals, Cables & Conduits', 'display_order' => 5],
            ['code' => 'CAT_WOOD_HARDWARE', 'name' => 'Doors, Plywood & Hardware', 'display_order' => 6],
        ];

        $categories = [];
        foreach ($categoriesData as $cData) {
            $categories[$cData['code']] = Category::updateOrCreate(
                ['code' => $cData['code']],
                [
                    'name' => $cData['name'],
                    'slug' => Str::slug($cData['name']),
                    'display_order' => $cData['display_order'],
                    'is_active' => true,
                ]
            );
        }

        // 3. Approved Master Brands
        $brandNames = [
            // Cement
            'UltraTech', 'Ambuja', 'ACC', 'Shree', 'Dalmia', 'JK Lakshmi', 'JSW',
            // Steel
            'Tata Tiscon', 'Jindal Panther', 'JSW Neosteel', 'SAIL', 'Kamdhenu',
            // Bricks / Blocks
            'Biltech', 'Ecolite', 'Local Kilns / Manufacturers',
            // Aggregates / Sand
            'Generic Mining Quarry', 'Regional Riverbed Sand',
            // Putty
            'Birla White', 'JK WallMaxx',
            // Paints
            'Asian Paints', 'Berger', 'Nerolac', 'Dulux', 'Indigo',
            // Tile Adhesives
            'Roff (Pidilite)', 'Laticrete', 'MYK Arment', 'Weber',
            // Tiles
            'Kajaria', 'Somany', 'Nitco', 'Orientbell', 'Simpolo',
            // Natural Stones
            'Regional Processing Units',
            // Pipes
            'Astral', 'Ashirvad', 'Supreme', 'Finolex', 'Prince',
            // Bath & Sanitary
            'Jaquar', 'Hindware', 'Cera', 'Kohler', 'Parryware', 'Carysil',
            // Wires
            'Polycab', 'Havells', 'RR Kabel', 'KEI',
            // Switches
            'Anchor Roma', 'Havells Crabtree', 'Legrand', 'Schneider',
            // Conduits
            'AKG',
            // Plywood
            'CenturyPly', 'Greenply', 'Kitply', 'Archidply', 'Action Tesa',
            // Hardware
            'Godrej Locks', 'Harrison', 'Link', 'Dorset', 'Ozone',
        ];

        $brands = [];
        foreach ($brandNames as $bName) {
            $brands[$bName] = Brand::updateOrCreate(
                ['slug' => Str::slug($bName)],
                ['name' => $bName, 'is_approved_master' => true]
            );
        }

        // 4. Sub-Categories (All 17 from matrix)
        $subCategoriesConfig = [
            '1.1' => [
                'category_code' => 'CAT_STRUCTURAL',
                'name' => 'Cement',
                'code' => 'SUB_CEMENT',
                'base_uom' => 'KG',
                'spec_template' => [
                    'grade' => ['OPC 43', 'OPC 53', 'PPC', 'PSC'],
                    'packaging_type' => ['HDPE Moisture-Proof Bag', 'Paper Bag'],
                ],
                'packing_rule_desc' => 'Standard 50 Kg Moisture-Proof Bag',
                'allows_loose_by_default' => false,
                'brands' => ['UltraTech', 'Ambuja', 'ACC', 'Shree', 'Dalmia', 'JK Lakshmi', 'JSW'],
            ],
            '1.2' => [
                'category_code' => 'CAT_STRUCTURAL',
                'name' => 'TMT Steel Bars',
                'code' => 'SUB_TMT_STEEL',
                'base_uom' => 'KG',
                'spec_template' => [
                    'dia_mm' => [8, 10, 12, 16, 20, 25],
                    'grade' => ['Fe 500D', 'Fe 550D', 'Fe 600'],
                    'standard_rod_length_meters' => 12,
                ],
                'packing_rule_desc' => 'Standard 12m (40 ft) Bend Rods or Bundles',
                'allows_loose_by_default' => true,
                'brands' => ['Tata Tiscon', 'Jindal Panther', 'JSW Neosteel', 'SAIL', 'Kamdhenu'],
            ],
            '1.3' => [
                'category_code' => 'CAT_STRUCTURAL',
                'name' => 'Bricks & Blocks',
                'code' => 'SUB_BRICKS_BLOCKS',
                'base_uom' => 'PIECE',
                'spec_template' => [
                    'type' => ['Red Clay Brick', 'Fly Ash Brick', 'AAC Blocks', 'Concrete Blocks'],
                    'size' => ['9x4x3 inch', '600x200x150 mm', '600x200x200 mm'],
                ],
                'packing_rule_desc' => 'Truckload / Pallet Batch Count (MOQ: 1000)',
                'allows_loose_by_default' => false,
                'brands' => ['Biltech', 'Ecolite', 'Local Kilns / Manufacturers'],
            ],
            '1.4' => [
                'category_code' => 'CAT_STRUCTURAL',
                'name' => 'Aggregates (Gitti)',
                'code' => 'SUB_AGGREGATES',
                'base_uom' => 'CFT',
                'spec_template' => [
                    'size' => ['10mm', '20mm', '40mm coarse aggregate'],
                    'source_type' => ['Blue Metal Granite', 'Black Trap'],
                ],
                'packing_rule_desc' => 'Bulk Dumper / Tipper Volume (1 Brass = 100 Cft)',
                'allows_loose_by_default' => true,
                'brands' => ['Generic Mining Quarry'],
            ],
            '1.5' => [
                'category_code' => 'CAT_STRUCTURAL',
                'name' => 'Sand & Morang',
                'code' => 'SUB_SAND_MORANG',
                'base_uom' => 'CFT',
                'spec_template' => [
                    'type' => ['River Sand', 'M-Sand (Manufactured)', 'Plastering Sand', 'Morang'],
                    'zone' => ['Zone II', 'Zone III', 'Coarse'],
                ],
                'packing_rule_desc' => 'Bulk Dumper / Brass Volume (1 Brass = 100 Cft)',
                'allows_loose_by_default' => true,
                'brands' => ['Regional Riverbed Sand'],
            ],
            '2.1' => [
                'category_code' => 'CAT_FINISHES',
                'name' => 'Wall Putty',
                'code' => 'SUB_WALL_PUTTY',
                'base_uom' => 'KG',
                'spec_template' => [
                    'base' => ['White Cement Base', 'Acrylic Polymer Base'],
                    'coverage_sqft_per_kg' => '10-15 sq.ft in 2 coats',
                ],
                'packing_rule_desc' => '1 Kg, 5 Kg, 20 Kg, 40 Kg Moisture-Resistant Bags',
                'allows_loose_by_default' => false,
                'brands' => ['Birla White', 'JK WallMaxx', 'Asian Paints', 'Berger'],
            ],
            '2.2' => [
                'category_code' => 'CAT_FINISHES',
                'name' => 'Paints & Primers',
                'code' => 'SUB_PAINTS_PRIMERS',
                'base_uom' => 'LITRE',
                'spec_template' => [
                    'type' => ['Interior Emulsion', 'Exterior Emulsion', 'Distemper', 'Waterproof Primer'],
                    'finish' => ['Matt', 'Sheen', 'Glossy'],
                ],
                'packing_rule_desc' => '1L, 4L, 10L, 20L Buckets',
                'allows_loose_by_default' => false,
                'brands' => ['Asian Paints', 'Berger', 'Nerolac', 'Dulux', 'Indigo'],
            ],
            '2.3' => [
                'category_code' => 'CAT_FINISHES',
                'name' => 'Tile Adhesives',
                'code' => 'SUB_TILE_ADHESIVES',
                'base_uom' => 'KG',
                'spec_template' => [
                    'type' => ['Type 1 Floor', 'Type 2 Wall High-Tack', 'Type 3 Vitrified/Glass', 'Waterproof Epoxy'],
                ],
                'packing_rule_desc' => '20 Kg / 50 Kg Bags, 1Kg Grout Pouch',
                'allows_loose_by_default' => false,
                'brands' => ['Roff (Pidilite)', 'Laticrete', 'MYK Arment', 'Weber'],
            ],
            '3.1' => [
                'category_code' => 'CAT_SURFACES',
                'name' => 'Ceramic Tiles',
                'code' => 'SUB_CERAMIC_TILES',
                'base_uom' => 'SQFT',
                'spec_template' => [
                    'size_ft' => ['2x2 ft', '2x4 ft', '1x1 ft', '1x2 ft'],
                    'finish' => ['Glossy', 'Matt', 'Rustic', 'Sugar Finish'],
                    'coverage_sqft_per_box' => 16.0,
                ],
                'packing_rule_desc' => 'Coverage Box (e.g. 1 Box = 16 Sq. Ft., 4 Tiles)',
                'allows_loose_by_default' => false,
                'brands' => ['Kajaria', 'Somany', 'Nitco', 'Orientbell', 'Simpolo', 'Cera'],
            ],
            '3.2' => [
                'category_code' => 'CAT_SURFACES',
                'name' => 'Natural Stones',
                'code' => 'SUB_NATURAL_STONES',
                'base_uom' => 'SQFT',
                'spec_template' => [
                    'stone_type' => ['Makrana Marble', 'Black Galaxy Granite', 'Tan Brown Granite', 'Kota Stone'],
                    'thickness_mm' => [15, 18, 20],
                ],
                'packing_rule_desc' => 'Slab / Block measurement per Square Feet',
                'allows_loose_by_default' => true,
                'brands' => ['Regional Processing Units'],
            ],
            '4.1' => [
                'category_code' => 'CAT_PLUMBING',
                'name' => 'Pipes & Fittings',
                'code' => 'SUB_PIPES_FITTINGS',
                'base_uom' => 'METER',
                'spec_template' => [
                    'material' => ['CPVC', 'UPVC', 'PVC', 'SWR'],
                    'dia_inch' => ['0.5 inch', '0.75 inch', '1.0 inch', '1.25 inch', '1.5 inch', '2.0 inch'],
                    'standard_length_feet' => [10, 20],
                ],
                'packing_rule_desc' => 'Lengths: 10ft / 20ft; Piece for elbows/tees',
                'allows_loose_by_default' => true,
                'brands' => ['Astral', 'Ashirvad', 'Supreme', 'Finolex', 'Prince'],
            ],
            '4.2' => [
                'category_code' => 'CAT_PLUMBING',
                'name' => 'Bathroom Fittings',
                'code' => 'SUB_BATHROOM_FITTINGS',
                'base_uom' => 'PIECE',
                'spec_template' => [
                    'item_type' => ['Basin Mixer', 'Pillar Cock', 'Overhead Shower', 'Bib Cock', 'Concealed Diverter'],
                    'finish' => ['Chrome', 'Matte Black', 'Brushed Gold'],
                ],
                'packing_rule_desc' => 'Individual Foam-Protected Box Unit',
                'allows_loose_by_default' => false,
                'brands' => ['Jaquar', 'Hindware', 'Cera', 'Kohler', 'Parryware'],
            ],
            '4.3' => [
                'category_code' => 'CAT_PLUMBING',
                'name' => 'Sanitaryware',
                'code' => 'SUB_SANITARYWARE',
                'base_uom' => 'PIECE',
                'spec_template' => [
                    'item_type' => ['Wall Hung Toilet', 'Floor Mounted One-Piece', 'Table Top Basin', 'Quartz Kitchen Sink'],
                    'color' => ['White', 'Ivory', 'Matte Grey'],
                ],
                'packing_rule_desc' => 'Heavy Corrugated Packaging Unit',
                'allows_loose_by_default' => false,
                'brands' => ['Cera', 'Hindware', 'Parryware', 'Jaquar', 'Carysil'],
            ],
            '5.1' => [
                'category_code' => 'CAT_ELECTRICAL',
                'name' => 'Wires & Cables',
                'code' => 'SUB_WIRES_CABLES',
                'base_uom' => 'METER',
                'spec_template' => [
                    'gauge_sq_mm' => ['1.0 sq mm', '1.5 sq mm', '2.5 sq mm', '4.0 sq mm', '6.0 sq mm'],
                    'core_type' => ['Single Core FR-LSH', 'Multicore Shielded'],
                    'coil_standard_meters' => 90,
                ],
                'packing_rule_desc' => 'Standard 90 Metre Coil Box',
                'allows_loose_by_default' => false,
                'brands' => ['Polycab', 'Finolex', 'Havells', 'RR Kabel', 'KEI'],
            ],
            '5.2' => [
                'category_code' => 'CAT_ELECTRICAL',
                'name' => 'Switches & Sockets',
                'code' => 'SUB_SWITCHES_SOCKETS',
                'base_uom' => 'PIECE',
                'spec_template' => [
                    'type' => ['1-Way 6A Switch', '2-Way 16A Switch', '6A/16A Combined Socket', '8-Module Plate'],
                    'color' => ['White', 'Anthracite', 'Silver'],
                ],
                'packing_rule_desc' => 'Modular Box Pack of 10 or Individual Piece',
                'allows_loose_by_default' => true,
                'brands' => ['Anchor Roma', 'Havells Crabtree', 'Legrand', 'Schneider'],
            ],
            '5.3' => [
                'category_code' => 'CAT_ELECTRICAL',
                'name' => 'Conduits & Boxes',
                'code' => 'SUB_CONDUITS_BOXES',
                'base_uom' => 'PIECE',
                'spec_template' => [
                    'size' => ['20mm', '25mm', '32mm'],
                    'type' => ['Medium Duty PVC Conduit (3m)', 'Heavy Duty Metal Concealed Box (2M to 12M)'],
                ],
                'packing_rule_desc' => 'Bundle of 25 pipes or piece box',
                'allows_loose_by_default' => true,
                'brands' => ['AKG', 'Supreme', 'Polycab', 'Havells'],
            ],
            '6.1' => [
                'category_code' => 'CAT_WOOD_HARDWARE',
                'name' => 'Doors & Plywood',
                'code' => 'SUB_DOORS_PLYWOOD',
                'base_uom' => 'SHEET_8X4',
                'spec_template' => [
                    'type' => ['Commercial MR Grade', 'Marine BWP Grade', 'Boiling Water Resistant (BWR)', 'Flush Door'],
                    'thickness_mm' => [6, 9, 12, 16, 19, 25],
                    'dimensions' => '8x4 ft (2.44m x 1.22m)',
                ],
                'packing_rule_desc' => 'Standard 8x4 Sheet (Thickness 6-30mm)',
                'allows_loose_by_default' => false,
                'brands' => ['CenturyPly', 'Greenply', 'Kitply', 'Archidply', 'Action Tesa'],
            ],
            '6.2' => [
                'category_code' => 'CAT_WOOD_HARDWARE',
                'name' => 'Hardware & Locks',
                'code' => 'SUB_HARDWARE_LOCKS',
                'base_uom' => 'PIECE',
                'spec_template' => [
                    'type' => ['Mortise Door Lock Set', 'Butt Hinge 4 inch Stainless Steel', 'Tower Bolt 8 inch', 'Drawer Slide Telescopic'],
                    'finish' => ['Stainless Steel Satin', 'Antique Brass', 'Matt Black'],
                ],
                'packing_rule_desc' => 'Blister Pack / Set with mounting screws',
                'allows_loose_by_default' => false,
                'brands' => ['Godrej Locks', 'Harrison', 'Link', 'Dorset', 'Ozone'],
            ],
        ];

        $subCategories = [];
        $order = 1;
        foreach ($subCategoriesConfig as $sub) {
            $cat = $categories[$sub['category_code']];
            $baseUom = $uoms[$sub['base_uom']];

            $subCategory = SubCategory::updateOrCreate(
                ['code' => $sub['code']],
                [
                    'category_id' => $cat->id,
                    'default_base_uom_id' => $baseUom->id,
                    'name' => $sub['name'],
                    'slug' => Str::slug($sub['name']),
                    'spec_template' => $sub['spec_template'],
                    'packing_rule_desc' => $sub['packing_rule_desc'],
                    'allows_loose_by_default' => $sub['allows_loose_by_default'],
                    'display_order' => $order++,
                    'is_active' => true,
                ]
            );

            // Attach approved brands to sub-category
            $brandIds = [];
            foreach ($sub['brands'] as $brandName) {
                if (isset($brands[$brandName])) {
                    $brandIds[] = $brands[$brandName]->id;
                }
            }
            $subCategory->approvedBrands()->sync($brandIds);

            $subCategories[$sub['code']] = $subCategory;
        }

        // 5. Seed Real-world Sample Products demonstrating Multi-UOM & Loose Sale matrix
        $sampleProducts = [
            // 1.1 Cement: UltraTech Super Cement PPC
            [
                'sub_category_code' => 'SUB_CEMENT',
                'brand_name' => 'UltraTech',
                'name' => 'UltraTech Super PPC Cement (50 Kg Bag)',
                'sku' => 'ULT-PPC-50KG',
                'base_uom' => 'KG',
                'specifications' => ['grade' => 'PPC', 'type' => 'Portland Pozzolana Cement', 'packaging' => 'Tamper-proof HDPE'],
                'packing_rule_desc' => 'Standard 50 Kg Moisture-Proof Bag. Sealed pack only.',
                'pricing_units' => [
                    [
                        'uom' => 'BAG_50KG',
                        'conversion_factor' => 50.0000,
                        'selling_price' => 380.00,
                        'mrp' => 420.00,
                        'bulk_discount_price' => 365.00,
                        'allow_loose_sale' => false, // Cannot tear open 50kg bag
                        'min_order_qty' => 1.00,
                        'step_qty' => 1.00,
                        'pack_contain_qty' => 50.00,
                        'is_default_selling_unit' => true,
                    ],
                    [
                        'uom' => 'TONNE',
                        'conversion_factor' => 1000.0000,
                        'selling_price' => 7400.00,
                        'mrp' => 8400.00,
                        'bulk_discount_price' => 7200.00,
                        'allow_loose_sale' => false,
                        'min_order_qty' => 1.00,
                        'step_qty' => 1.00, // 1 Tonne = 20 bags
                        'pack_contain_qty' => 20.00,
                        'is_default_selling_unit' => false,
                    ],
                ],
            ],

            // 1.2 TMT Steel: Tata Tiscon 12mm Fe 550D
            [
                'sub_category_code' => 'SUB_TMT_STEEL',
                'brand_name' => 'Tata Tiscon',
                'name' => 'Tata Tiscon 550D High Strength 12mm TMT Rebar',
                'sku' => 'TISCON-12MM-550D',
                'base_uom' => 'KG',
                'specifications' => ['dia_mm' => 12, 'grade' => 'Fe 550D', 'length_meters' => 12, 'weight_per_rod_kg' => 10.66],
                'packing_rule_desc' => 'Standard 12m (40 ft) Bend Rods or Bundles of 8 rods',
                'pricing_units' => [
                    [
                        'uom' => 'PIECE', // Rod
                        'conversion_factor' => 10.6600, // 12mm 12m rod = ~10.66 kg
                        'selling_price' => 725.00,
                        'mrp' => 790.00,
                        'bulk_discount_price' => 690.00,
                        'allow_loose_sale' => true, // Customer can buy single loose rod
                        'min_order_qty' => 1.00,
                        'step_qty' => 1.00,
                        'pack_contain_qty' => 1.00,
                        'is_default_selling_unit' => true,
                    ],
                    [
                        'uom' => 'KG',
                        'conversion_factor' => 1.0000,
                        'selling_price' => 68.00,
                        'mrp' => 74.00,
                        'bulk_discount_price' => 65.00,
                        'allow_loose_sale' => true,
                        'min_order_qty' => 20.00,
                        'step_qty' => 1.00,
                        'pack_contain_qty' => null,
                        'is_default_selling_unit' => false,
                    ],
                    [
                        'uom' => 'TONNE',
                        'conversion_factor' => 1000.0000,
                        'selling_price' => 65000.00,
                        'mrp' => 70000.00,
                        'bulk_discount_price' => 63500.00,
                        'allow_loose_sale' => false,
                        'min_order_qty' => 1.00,
                        'step_qty' => 1.00,
                        'pack_contain_qty' => null,
                        'is_default_selling_unit' => false,
                    ],
                ],
            ],

            // 1.3 Bricks: Premium Red Clay Bricks
            [
                'sub_category_code' => 'SUB_BRICKS_BLOCKS',
                'brand_name' => 'Local Kilns / Manufacturers',
                'name' => 'First-Class Kiln Burned Red Clay Bricks',
                'sku' => 'RED-BRICK-FC',
                'base_uom' => 'PIECE',
                'specifications' => ['type' => 'Red Clay Brick', 'size' => '9x4x3 inch', 'compressive_strength' => '10.5 N/mm2'],
                'packing_rule_desc' => 'Truckload / Pallet Batch Count (MOQ: 1000 pcs)',
                'pricing_units' => [
                    [
                        'uom' => 'PIECE',
                        'conversion_factor' => 1.0000,
                        'selling_price' => 9.50,
                        'mrp' => 11.00,
                        'bulk_discount_price' => 8.80,
                        'allow_loose_sale' => false, // No loose retail 5-10 brick sales
                        'min_order_qty' => 1000.00,
                        'step_qty' => 500.00, // Multiples of 500
                        'pack_contain_qty' => null,
                        'is_default_selling_unit' => true,
                    ],
                    [
                        'uom' => 'TRUCKLOAD_3000',
                        'conversion_factor' => 3000.0000,
                        'selling_price' => 26500.00,
                        'mrp' => 31000.00,
                        'bulk_discount_price' => 25500.00,
                        'allow_loose_sale' => false,
                        'min_order_qty' => 1.00,
                        'step_qty' => 1.00,
                        'pack_contain_qty' => 3000.00,
                        'is_default_selling_unit' => false,
                    ],
                ],
            ],

            // 1.4 Aggregates (Gitti)
            [
                'sub_category_code' => 'SUB_AGGREGATES',
                'brand_name' => 'Generic Mining Quarry',
                'name' => '20mm Crushed Blue Granite Coarse Aggregate',
                'sku' => 'AGG-20MM-BLUE',
                'base_uom' => 'CFT',
                'specifications' => ['size' => '20mm', 'source_type' => 'Blue Metal Granite', 'shape' => 'Angular'],
                'packing_rule_desc' => 'Bulk Tipper Dumper / Volume (1 Brass = 100 Cft)',
                'pricing_units' => [
                    [
                        'uom' => 'BRASS',
                        'conversion_factor' => 100.0000,
                        'selling_price' => 4300.00,
                        'mrp' => 4800.00,
                        'bulk_discount_price' => 4100.00,
                        'allow_loose_sale' => true,
                        'min_order_qty' => 1.00,
                        'step_qty' => 0.50, // Half brass step
                        'pack_contain_qty' => 100.00,
                        'is_default_selling_unit' => true,
                    ],
                    [
                        'uom' => 'CFT',
                        'conversion_factor' => 1.0000,
                        'selling_price' => 46.00,
                        'mrp' => 52.00,
                        'bulk_discount_price' => 43.00,
                        'allow_loose_sale' => true,
                        'min_order_qty' => 20.00,
                        'step_qty' => 5.00,
                        'pack_contain_qty' => null,
                        'is_default_selling_unit' => false,
                    ],
                ],
            ],

            // 1.5 Sand: River Sand
            [
                'sub_category_code' => 'SUB_SAND_MORANG',
                'brand_name' => 'Regional Riverbed Sand',
                'name' => 'Zone II Washed Coarse River Sand',
                'sku' => 'SAND-RIVER-Z2',
                'base_uom' => 'CFT',
                'specifications' => ['type' => 'River Sand', 'zone' => 'Zone II Coarse', 'silt_content' => '< 3%'],
                'packing_rule_desc' => 'Bulk Dumper / Brass Volume (1 Brass = 100 Cft)',
                'pricing_units' => [
                    [
                        'uom' => 'BRASS',
                        'conversion_factor' => 100.0000,
                        'selling_price' => 5100.00,
                        'mrp' => 5600.00,
                        'bulk_discount_price' => 4850.00,
                        'allow_loose_sale' => true,
                        'min_order_qty' => 1.00,
                        'step_qty' => 0.50,
                        'pack_contain_qty' => 100.00,
                        'is_default_selling_unit' => true,
                    ],
                    [
                        'uom' => 'CFT',
                        'conversion_factor' => 1.0000,
                        'selling_price' => 54.00,
                        'mrp' => 60.00,
                        'bulk_discount_price' => 50.00,
                        'allow_loose_sale' => true,
                        'min_order_qty' => 20.00,
                        'step_qty' => 5.00,
                        'pack_contain_qty' => null,
                        'is_default_selling_unit' => false,
                    ],
                ],
            ],

            // 2.1 Wall Putty: Birla White
            [
                'sub_category_code' => 'SUB_WALL_PUTTY',
                'brand_name' => 'Birla White',
                'name' => 'Birla White WallCare Water Resistant White Cement Putty',
                'sku' => 'BIRLA-PUTTY-40KG',
                'base_uom' => 'KG',
                'specifications' => ['base' => 'White Cement Base', 'whiteness' => '90%+', 'pack_weight' => '40 Kg'],
                'packing_rule_desc' => '40 Kg Moisture-Proof Sealed Bag',
                'pricing_units' => [
                    [
                        'uom' => 'BAG_40KG',
                        'conversion_factor' => 40.0000,
                        'selling_price' => 930.00,
                        'mrp' => 1050.00,
                        'bulk_discount_price' => 890.00,
                        'allow_loose_sale' => false,
                        'min_order_qty' => 1.00,
                        'step_qty' => 1.00,
                        'pack_contain_qty' => 40.00,
                        'is_default_selling_unit' => true,
                    ],
                    [
                        'uom' => 'BAG_20KG',
                        'conversion_factor' => 20.0000,
                        'selling_price' => 495.00,
                        'mrp' => 560.00,
                        'bulk_discount_price' => 475.00,
                        'allow_loose_sale' => false,
                        'min_order_qty' => 1.00,
                        'step_qty' => 1.00,
                        'pack_contain_qty' => 20.00,
                        'is_default_selling_unit' => false,
                    ],
                    [
                        'uom' => 'BAG_5KG',
                        'conversion_factor' => 5.0000,
                        'selling_price' => 160.00,
                        'mrp' => 190.00,
                        'bulk_discount_price' => null,
                        'allow_loose_sale' => false,
                        'min_order_qty' => 1.00,
                        'step_qty' => 1.00,
                        'pack_contain_qty' => 5.00,
                        'is_default_selling_unit' => false,
                    ],
                ],
            ],

            // 2.2 Paints: Asian Paints Apex
            [
                'sub_category_code' => 'SUB_PAINTS_PRIMERS',
                'brand_name' => 'Asian Paints',
                'name' => 'Asian Paints Apex Weatherproof Exterior Emulsion',
                'sku' => 'AP-APEX-WHITE',
                'base_uom' => 'LITRE',
                'specifications' => ['type' => 'Exterior Emulsion', 'finish' => 'Matt/Sheen', 'shade' => 'Classic White'],
                'packing_rule_desc' => '1L, 4L, 10L, 20L Factory Sealed Plastic Buckets',
                'pricing_units' => [
                    [
                        'uom' => 'BUCKET_20L',
                        'conversion_factor' => 20.0000,
                        'selling_price' => 5800.00,
                        'mrp' => 6450.00,
                        'bulk_discount_price' => 5500.00,
                        'allow_loose_sale' => false,
                        'min_order_qty' => 1.00,
                        'step_qty' => 1.00,
                        'pack_contain_qty' => 20.00,
                        'is_default_selling_unit' => true,
                    ],
                    [
                        'uom' => 'BUCKET_10L',
                        'conversion_factor' => 10.0000,
                        'selling_price' => 3050.00,
                        'mrp' => 3400.00,
                        'bulk_discount_price' => 2900.00,
                        'allow_loose_sale' => false,
                        'min_order_qty' => 1.00,
                        'step_qty' => 1.00,
                        'pack_contain_qty' => 10.00,
                        'is_default_selling_unit' => false,
                    ],
                    [
                        'uom' => 'CAN_4L',
                        'conversion_factor' => 4.0000,
                        'selling_price' => 1320.00,
                        'mrp' => 1480.00,
                        'bulk_discount_price' => null,
                        'allow_loose_sale' => false,
                        'min_order_qty' => 1.00,
                        'step_qty' => 1.00,
                        'pack_contain_qty' => 4.00,
                        'is_default_selling_unit' => false,
                    ],
                    [
                        'uom' => 'CAN_1L',
                        'conversion_factor' => 1.0000,
                        'selling_price' => 370.00,
                        'mrp' => 410.00,
                        'bulk_discount_price' => null,
                        'allow_loose_sale' => false,
                        'min_order_qty' => 1.00,
                        'step_qty' => 1.00,
                        'pack_contain_qty' => 1.00,
                        'is_default_selling_unit' => false,
                    ],
                ],
            ],

            // 2.3 Tile Adhesives: Roff New Construction Tile Adhesive
            [
                'sub_category_code' => 'SUB_TILE_ADHESIVES',
                'brand_name' => 'Roff (Pidilite)',
                'name' => 'Roff New Construction Tile Adhesive (NCA)',
                'sku' => 'ROFF-NCA-20KG',
                'base_uom' => 'KG',
                'specifications' => ['type' => 'Type 1 Floor/Wall', 'poly_modified' => true, 'pot_life_hours' => 2],
                'packing_rule_desc' => '20 Kg Moisture-Proof Bag',
                'pricing_units' => [
                    [
                        'uom' => 'BAG_20KG',
                        'conversion_factor' => 20.0000,
                        'selling_price' => 460.00,
                        'mrp' => 520.00,
                        'bulk_discount_price' => 435.00,
                        'allow_loose_sale' => false,
                        'min_order_qty' => 1.00,
                        'step_qty' => 1.00,
                        'pack_contain_qty' => 20.00,
                        'is_default_selling_unit' => true,
                    ],
                ],
            ],

            // 3.1 Ceramic Tiles: Kajaria 2x2 ft Vitrified
            [
                'sub_category_code' => 'SUB_CERAMIC_TILES',
                'brand_name' => 'Kajaria',
                'name' => 'Kajaria 2x2 ft Polished Vitrified Floor Tiles (Box = 16 Sq. Ft.)',
                'sku' => 'KAJ-PVT-2X2-STATUARIO',
                'base_uom' => 'SQFT',
                'specifications' => ['size_ft' => '2x2 ft (600x600 mm)', 'finish' => 'Glossy Statuario Marble Look', 'pieces_per_box' => 4],
                'packing_rule_desc' => '1 Box = 4 Tiles = 16 Sq. Ft. Coverage. Sold in full boxes only.',
                'pricing_units' => [
                    [
                        'uom' => 'BOX',
                        'conversion_factor' => 16.0000,
                        'selling_price' => 880.00,
                        'mrp' => 1040.00,
                        'bulk_discount_price' => 830.00,
                        'allow_loose_sale' => false, // CANNOT sell broken tile pieces from box
                        'min_order_qty' => 1.00,
                        'step_qty' => 1.00,
                        'pack_contain_qty' => 16.00,
                        'is_default_selling_unit' => true,
                    ],
                    [
                        'uom' => 'SQFT',
                        'conversion_factor' => 1.0000,
                        'selling_price' => 55.00,
                        'mrp' => 65.00,
                        'bulk_discount_price' => 52.00,
                        'allow_loose_sale' => false, // Must be ordered in multiples of 16 sq ft (1 box)
                        'min_order_qty' => 16.00,
                        'step_qty' => 16.00,
                        'pack_contain_qty' => null,
                        'is_default_selling_unit' => false,
                    ],
                ],
            ],

            // 3.2 Natural Stones: Black Galaxy Granite
            [
                'sub_category_code' => 'SUB_NATURAL_STONES',
                'brand_name' => 'Regional Processing Units',
                'name' => 'Premium Black Galaxy Granite Slab (18mm)',
                'sku' => 'GRANITE-BLACK-GALAXY',
                'base_uom' => 'SQFT',
                'specifications' => ['stone_type' => 'Black Galaxy Granite', 'thickness_mm' => 18, 'origin' => 'Andhra Pradesh'],
                'packing_rule_desc' => 'Individual Full Gangsaw / Cutter Slab (Measurement in Sq. Ft.)',
                'pricing_units' => [
                    [
                        'uom' => 'SQFT',
                        'conversion_factor' => 1.0000,
                        'selling_price' => 195.00,
                        'mrp' => 230.00,
                        'bulk_discount_price' => 180.00,
                        'allow_loose_sale' => true,
                        'min_order_qty' => 30.00, // Minimum slab size ~30 sq ft
                        'step_qty' => 1.00,
                        'pack_contain_qty' => null,
                        'is_default_selling_unit' => true,
                    ],
                ],
            ],

            // 4.1 Pipes & Fittings: Astral CPVC Pipe
            [
                'sub_category_code' => 'SUB_PIPES_FITTINGS',
                'brand_name' => 'Astral',
                'name' => 'Astral CPVC Pro 1 inch SDR 11 Hot & Cold Water Pipe',
                'sku' => 'ASTRAL-CPVC-1INCH-10FT',
                'base_uom' => 'METER',
                'specifications' => ['material' => 'CPVC', 'dia_inch' => '1.0 inch', 'pressure_rating' => 'SDR 11 (Class 1)'],
                'packing_rule_desc' => 'Lengths: 10ft (3.048m) / 20ft',
                'pricing_units' => [
                    [
                        'uom' => 'PIPE_10FT',
                        'conversion_factor' => 3.0480,
                        'selling_price' => 320.00,
                        'mrp' => 365.00,
                        'bulk_discount_price' => 295.00,
                        'allow_loose_sale' => true,
                        'min_order_qty' => 1.00,
                        'step_qty' => 1.00,
                        'pack_contain_qty' => 3.0480,
                        'is_default_selling_unit' => true,
                    ],
                    [
                        'uom' => 'METER',
                        'conversion_factor' => 1.0000,
                        'selling_price' => 105.00,
                        'mrp' => 120.00,
                        'bulk_discount_price' => null,
                        'allow_loose_sale' => true,
                        'min_order_qty' => 1.00,
                        'step_qty' => 0.50,
                        'pack_contain_qty' => null,
                        'is_default_selling_unit' => false,
                    ],
                ],
            ],

            // 4.2 Bathroom Fittings: Jaquar Basin Mixer
            [
                'sub_category_code' => 'SUB_BATHROOM_FITTINGS',
                'brand_name' => 'Jaquar',
                'name' => 'Jaquar Alive Single Lever Basin Mixer with Pop-up Waste',
                'sku' => 'JAQ-ALI-001',
                'base_uom' => 'PIECE',
                'specifications' => ['item_type' => 'Basin Mixer', 'cartridge_size' => '35mm', 'finish' => 'Chrome'],
                'packing_rule_desc' => 'Individual Foam-Cushioned Box Unit',
                'pricing_units' => [
                    [
                        'uom' => 'PIECE',
                        'conversion_factor' => 1.0000,
                        'selling_price' => 3450.00,
                        'mrp' => 3950.00,
                        'bulk_discount_price' => 3200.00,
                        'allow_loose_sale' => false,
                        'min_order_qty' => 1.00,
                        'step_qty' => 1.00,
                        'pack_contain_qty' => 1.00,
                        'is_default_selling_unit' => true,
                    ],
                ],
            ],

            // 4.3 Sanitaryware: Cera Wall Hung Toilet
            [
                'sub_category_code' => 'SUB_SANITARYWARE',
                'brand_name' => 'Cera',
                'name' => 'Cera Rimless Wall Hung Western Commode with Soft Close Seat',
                'sku' => 'CERA-WH-RIMLESS',
                'base_uom' => 'PIECE',
                'specifications' => ['item_type' => 'Wall Hung Toilet', 'flush_type' => 'Tornado Dual Flush 3/4.5L', 'color' => 'Snow White'],
                'packing_rule_desc' => 'Heavy 7-Ply Corrugated Box with wooden reinforcement',
                'pricing_units' => [
                    [
                        'uom' => 'PIECE',
                        'conversion_factor' => 1.0000,
                        'selling_price' => 6900.00,
                        'mrp' => 8400.00,
                        'bulk_discount_price' => 6400.00,
                        'allow_loose_sale' => false,
                        'min_order_qty' => 1.00,
                        'step_qty' => 1.00,
                        'pack_contain_qty' => 1.00,
                        'is_default_selling_unit' => true,
                    ],
                ],
            ],

            // 5.1 Wires & Cables: Polycab 2.5 sq mm
            [
                'sub_category_code' => 'SUB_WIRES_CABLES',
                'brand_name' => 'Polycab',
                'name' => 'Polycab 2.5 sq mm Flame Retardant (FR) Copper Single Core Wire (90m Coil)',
                'sku' => 'POLY-FR-2.5MM-RED',
                'base_uom' => 'METER',
                'specifications' => ['gauge_sq_mm' => '2.5 sq mm', 'conductor' => 'Electrolytic Grade Copper', 'voltage_grade' => '1100V'],
                'packing_rule_desc' => 'Standard 90 Metre Coil Box. Counter loose cut also available.',
                'pricing_units' => [
                    [
                        'uom' => 'COIL_90M',
                        'conversion_factor' => 90.0000,
                        'selling_price' => 2850.00,
                        'mrp' => 3350.00,
                        'bulk_discount_price' => 2700.00,
                        'allow_loose_sale' => false, // Full sealed coil box
                        'min_order_qty' => 1.00,
                        'step_qty' => 1.00,
                        'pack_contain_qty' => 90.00,
                        'is_default_selling_unit' => true,
                    ],
                    [
                        'uom' => 'METER',
                        'conversion_factor' => 1.0000,
                        'selling_price' => 35.00, // Loose counter cutting rate
                        'mrp' => 40.00,
                        'bulk_discount_price' => null,
                        'allow_loose_sale' => true, // Can cut 15m, 20m, etc.
                        'min_order_qty' => 5.00,
                        'step_qty' => 1.00,
                        'pack_contain_qty' => null,
                        'is_default_selling_unit' => false,
                    ],
                ],
            ],

            // 5.2 Switches: Anchor Roma 6A Switch
            [
                'sub_category_code' => 'SUB_SWITCHES_SOCKETS',
                'brand_name' => 'Anchor Roma',
                'name' => 'Anchor Roma Classic 1-Way 6A Modular Switch',
                'sku' => 'ROMA-6A-1W-WH',
                'base_uom' => 'PIECE',
                'specifications' => ['type' => '1-Way 6A Switch', 'voltage' => '240V AC', 'color' => 'Classic White'],
                'packing_rule_desc' => 'Box of 10 Switches or Individual loose piece',
                'pricing_units' => [
                    [
                        'uom' => 'PIECE',
                        'conversion_factor' => 1.0000,
                        'selling_price' => 38.00,
                        'mrp' => 45.00,
                        'bulk_discount_price' => null,
                        'allow_loose_sale' => true, // Can buy single switch
                        'min_order_qty' => 1.00,
                        'step_qty' => 1.00,
                        'pack_contain_qty' => 1.00,
                        'is_default_selling_unit' => true,
                    ],
                    [
                        'uom' => 'PACK_10',
                        'conversion_factor' => 10.0000,
                        'selling_price' => 340.00,
                        'mrp' => 450.00,
                        'bulk_discount_price' => 320.00,
                        'allow_loose_sale' => false,
                        'min_order_qty' => 1.00,
                        'step_qty' => 1.00,
                        'pack_contain_qty' => 10.00,
                        'is_default_selling_unit' => false,
                    ],
                ],
            ],

            // 5.3 Conduits: AKG 25mm PVC Conduit
            [
                'sub_category_code' => 'SUB_CONDUITS_BOXES',
                'brand_name' => 'AKG',
                'name' => 'AKG 25mm Heavy Duty Electrical PVC Conduit Pipe (3m Length)',
                'sku' => 'AKG-PVC-25MM-3M',
                'base_uom' => 'PIECE',
                'specifications' => ['size' => '25mm outer dia', 'duty' => 'Heavy Mechanical Stress', 'length_meters' => 3],
                'packing_rule_desc' => 'Bundle of 25 pipes or piece sale',
                'pricing_units' => [
                    [
                        'uom' => 'PIECE',
                        'conversion_factor' => 1.0000,
                        'selling_price' => 95.00,
                        'mrp' => 115.00,
                        'bulk_discount_price' => null,
                        'allow_loose_sale' => true,
                        'min_order_qty' => 1.00,
                        'step_qty' => 1.00,
                        'pack_contain_qty' => 1.00,
                        'is_default_selling_unit' => true,
                    ],
                    [
                        'uom' => 'BUNDLE_25',
                        'conversion_factor' => 25.0000,
                        'selling_price' => 2125.00, // ₹85/pipe
                        'mrp' => 2875.00,
                        'bulk_discount_price' => 2000.00,
                        'allow_loose_sale' => false,
                        'min_order_qty' => 1.00,
                        'step_qty' => 1.00,
                        'pack_contain_qty' => 25.00,
                        'is_default_selling_unit' => false,
                    ],
                ],
            ],

            // 6.1 Doors & Plywood: CenturyPly Club Prime
            [
                'sub_category_code' => 'SUB_DOORS_PLYWOOD',
                'brand_name' => 'CenturyPly',
                'name' => 'CenturyPly Club Prime 19mm Boiling Water Proof (BWP) Plywood',
                'sku' => 'CENTURY-CP-19MM-8X4',
                'base_uom' => 'SHEET_8X4',
                'specifications' => ['type' => 'Marine BWP Grade', 'thickness_mm' => 19, 'dimensions' => '8x4 ft (32 Sq. Ft.)'],
                'packing_rule_desc' => 'Full 8x4 Sheet. Cut piece sale not allowed.',
                'pricing_units' => [
                    [
                        'uom' => 'SHEET_8X4',
                        'conversion_factor' => 1.0000,
                        'selling_price' => 4320.00, // ₹135 / sq.ft * 32
                        'mrp' => 4800.00,
                        'bulk_discount_price' => 4150.00,
                        'allow_loose_sale' => false,
                        'min_order_qty' => 1.00,
                        'step_qty' => 1.00,
                        'pack_contain_qty' => 1.00,
                        'is_default_selling_unit' => true,
                    ],
                    [
                        'uom' => 'SQFT',
                        'conversion_factor' => 0.03125, // 1 sqft = 1/32 sheet
                        'selling_price' => 135.00,
                        'mrp' => 150.00,
                        'bulk_discount_price' => 130.00,
                        'allow_loose_sale' => false, // Must buy 32 sqft sheet
                        'min_order_qty' => 32.00,
                        'step_qty' => 32.00,
                        'pack_contain_qty' => null,
                        'is_default_selling_unit' => false,
                    ],
                ],
            ],

            // 6.2 Hardware: Godrej Mortise Lock
            [
                'sub_category_code' => 'SUB_HARDWARE_LOCKS',
                'brand_name' => 'Godrej Locks',
                'name' => 'Godrej Classic Brass Mortise Door Lock with Handle Set',
                'sku' => 'GODREJ-MORTISE-BRASS',
                'base_uom' => 'PIECE',
                'specifications' => ['type' => 'Mortise Door Lock Set', 'finish' => 'Satin Antique Brass', 'keys' => '3 Brass Keys Included'],
                'packing_rule_desc' => 'Full Blister Pack Box with mortise sashlock and pair of handles',
                'pricing_units' => [
                    [
                        'uom' => 'PIECE',
                        'conversion_factor' => 1.0000,
                        'selling_price' => 1890.00,
                        'mrp' => 2250.00,
                        'bulk_discount_price' => 1750.00,
                        'allow_loose_sale' => false,
                        'min_order_qty' => 1.00,
                        'step_qty' => 1.00,
                        'pack_contain_qty' => 1.00,
                        'is_default_selling_unit' => true,
                    ],
                ],
            ],
        ];

        foreach ($sampleProducts as $pData) {
            $subCategory = $subCategories[$pData['sub_category_code']];
            $brand = $brands[$pData['brand_name']];
            $baseUom = $uoms[$pData['base_uom']];

            $product = Product::updateOrCreate(
                ['sku' => $pData['sku']],
                [
                    'sub_category_id' => $subCategory->id,
                    'brand_id' => $brand->id,
                    'base_uom_id' => $baseUom->id,
                    'name' => $pData['name'],
                    'slug' => Str::slug($pData['name']),
                    'specifications' => $pData['specifications'],
                    'packing_rule_desc' => $pData['packing_rule_desc'],
                    'is_active' => true,
                ]
            );

            foreach ($pData['pricing_units'] as $priceData) {
                $pricingUom = $uoms[$priceData['uom']];

                ProductUomPrice::updateOrCreate(
                    [
                        'product_id' => $product->id,
                        'uom_id' => $pricingUom->id,
                    ],
                    [
                        'conversion_factor' => $priceData['conversion_factor'],
                        'selling_price' => $priceData['selling_price'],
                        'mrp' => $priceData['mrp'],
                        'bulk_discount_price' => $priceData['bulk_discount_price'],
                        'allow_loose_sale' => $priceData['allow_loose_sale'],
                        'min_order_qty' => $priceData['min_order_qty'],
                        'step_qty' => $priceData['step_qty'],
                        'pack_contain_qty' => $priceData['pack_contain_qty'],
                        'is_default_selling_unit' => $priceData['is_default_selling_unit'],
                    ]
                );
            }
        }
    }
}

