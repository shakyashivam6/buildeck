<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductUomPrice;
use App\Models\SubCategory;
use App\Models\UnitOfMeasure;
use App\Services\UnitConversionService;
use Database\Seeders\ProductMasterSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductMasterMultiUomTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(ProductMasterSeeder::class);
    }

    /**
     * Test that all 17 sub-categories from the specification matrix are seeded.
     */
    public function test_all_17_sub_categories_are_seeded(): void
    {
        $expectedCodes = [
            'SUB_CEMENT',
            'SUB_TMT_STEEL',
            'SUB_BRICKS_BLOCKS',
            'SUB_AGGREGATES',
            'SUB_SAND_MORANG',
            'SUB_WALL_PUTTY',
            'SUB_PAINTS_PRIMERS',
            'SUB_TILE_ADHESIVES',
            'SUB_CERAMIC_TILES',
            'SUB_NATURAL_STONES',
            'SUB_PIPES_FITTINGS',
            'SUB_BATHROOM_FITTINGS',
            'SUB_SANITARYWARE',
            'SUB_WIRES_CABLES',
            'SUB_SWITCHES_SOCKETS',
            'SUB_CONDUITS_BOXES',
            'SUB_DOORS_PLYWOOD',
            'SUB_HARDWARE_LOCKS',
        ];

        foreach ($expectedCodes as $code) {
            $this->assertDatabaseHas('sub_categories', [
                'code' => $code,
            ]);
        }

        $this->assertGreaterThanOrEqual(6, Category::count());
        $this->assertGreaterThanOrEqual(18, SubCategory::count());
        $this->assertGreaterThanOrEqual(25, UnitOfMeasure::count());
        $this->assertGreaterThanOrEqual(30, Brand::count());
    }

    /**
     * Test cement multi-UOM: Bag vs Tonne and loose sale restriction.
     */
    public function test_cement_pricing_and_loose_sale_restriction(): void
    {
        /** @var Product $cement */
        $cement = Product::where('sku', 'ULT-PPC-50KG')->firstOrFail();

        $this->assertNotNull($cement);
        $this->assertEquals('KG', $cement->baseUom->code);

        /** @var ProductUomPrice $bagPrice */
        $bagPrice = $cement->uomPrices()->whereHas('uom', fn ($q) => $q->where('code', 'BAG_50KG'))->firstOrFail();
        $this->assertEquals(380.00, (float) $bagPrice->selling_price);
        $this->assertEquals(50.00, (float) $bagPrice->conversion_factor);
        $this->assertFalse($bagPrice->allow_loose_sale);

        // Validation: Attempting to order 1.5 bags should fail loose sale check and round to 2 bags
        $validation = $bagPrice->validateOrderQuantity(1.5);
        $this->assertFalse($validation['is_valid']);
        $this->assertEquals(2.0, $validation['rounded_qty']);
    }

    /**
     * Test steel bar multi-UOM: Piece (Rod), Kg, Tonne with loose piece allowed.
     */
    public function test_steel_rod_pricing_and_loose_sale_allowed(): void
    {
        /** @var Product $steel */
        $steel = Product::where('sku', 'TISCON-12MM-550D')->firstOrFail();

        /** @var ProductUomPrice $piecePrice */
        $piecePrice = $steel->uomPrices()->whereHas('uom', fn ($q) => $q->where('code', 'PIECE'))->firstOrFail();
        $this->assertTrue($piecePrice->allow_loose_sale);
        $this->assertEquals(725.00, (float) $piecePrice->selling_price);

        // Ordering 1 rod is completely valid
        $validation = $piecePrice->validateOrderQuantity(1.0);
        $this->assertTrue($validation['is_valid']);

        // Check ton pricing exists
        $tonnePrice = $steel->uomPrices()->whereHas('uom', fn ($q) => $q->where('code', 'TONNE'))->firstOrFail();
        $this->assertEquals(65000.00, (float) $tonnePrice->selling_price);
        $this->assertFalse($tonnePrice->allow_loose_sale);
    }

    /**
     * Test tile box coverage and rounding up to full box.
     */
    public function test_tiles_box_coverage_and_order_calculation(): void
    {
        /** @var Product $tiles */
        $tiles = Product::where('sku', 'KAJ-PVT-2X2-STATUARIO')->firstOrFail();
        $boxPrice = $tiles->uomPrices()->whereHas('uom', fn ($q) => $q->where('code', 'BOX'))->firstOrFail();

        $this->assertFalse($boxPrice->allow_loose_sale);
        $this->assertEquals(880.00, (float) $boxPrice->selling_price);

        $conversionService = new UnitConversionService();

        // If user wants 95 sq ft of tiles with 16 sq ft per box:
        // 95 + 5% buffer = 99.75 -> 99.75 / 16 = ~6.23 -> Ceil = 7 boxes (112 sq ft)
        $tileCalc = $conversionService->calculateTileBoxes(95.0, 16.0, 5.0);
        $this->assertEquals(7, $tileCalc['required_boxes']);
        $this->assertEquals(112.0, $tileCalc['actual_coverage_sqft']);

        // Order calculation for 7 boxes
        $order = $conversionService->calculateOrder($tiles, $boxPrice->uom_id, 7.0);
        $this->assertEquals(7.0, $order['final_qty']);
        $this->assertEquals(6160.00, $order['total_amount']); // 7 * 880
        $this->assertEquals(112.0, $order['base_uom_qty']);   // 7 * 16 sq ft
    }

    /**
     * Test wire coil vs loose meter cutting.
     */
    public function test_wire_coil_vs_loose_meter_pricing(): void
    {
        /** @var Product $wire */
        $wire = Product::where('sku', 'POLY-FR-2.5MM-RED')->firstOrFail();

        $coilPrice = $wire->uomPrices()->whereHas('uom', fn ($q) => $q->where('code', 'COIL_90M'))->firstOrFail();
        $meterPrice = $wire->uomPrices()->whereHas('uom', fn ($q) => $q->where('code', 'METER'))->firstOrFail();

        // 90m coil cannot be sold loose
        $this->assertFalse($coilPrice->allow_loose_sale);
        $this->assertEquals(2850.00, (float) $coilPrice->selling_price);

        // Meter cutting CAN be sold loose
        $this->assertTrue($meterPrice->allow_loose_sale);
        $this->assertEquals(35.00, (float) $meterPrice->selling_price);
        $this->assertEquals(5.00, (float) $meterPrice->min_order_qty);

        // Ordering 15 loose meters
        $conversionService = new UnitConversionService();
        $order = $conversionService->calculateOrder($wire, $meterPrice->uom_id, 15.0);
        $this->assertEquals(15.0, $order['final_qty']);
        $this->assertEquals(525.00, $order['total_amount']); // 15 * 35
    }

    /**
     * Test nominal TMT bar weight formula: (d^2 / 162) * 12.
     */
    public function test_tmt_rod_weight_formula(): void
    {
        $service = new UnitConversionService();

        // 8mm rod: (64 / 162) * 12 = 4.741 kg
        $weight8mm = $service->calculateTmtRodWeight(8.0, 12.0);
        $this->assertEquals(4.741, $weight8mm);

        // 12mm rod: (144 / 162) * 12 = 10.667 kg
        $weight12mm = $service->calculateTmtRodWeight(12.0, 12.0);
        $this->assertEquals(10.667, $weight12mm);

        // 16mm rod: (256 / 162) * 12 = 18.963 kg
        $weight16mm = $service->calculateTmtRodWeight(16.0, 12.0);
        $this->assertEquals(18.963, $weight16mm);
    }
}

