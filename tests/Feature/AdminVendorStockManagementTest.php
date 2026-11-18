<?php

namespace Tests\Feature;

use App\Models\Location;
use App\Models\Product;
use App\Models\User;
use App\Models\VendorProfile;
use App\Models\VendorProduct;
use Database\Seeders\ProductMasterSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AdminVendorStockManagementTest extends TestCase
{
    use RefreshDatabase;

    protected User $adminUser;
    protected User $vendorUser;
    protected VendorProfile $vendorProfile;
    protected Product $product;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(ProductMasterSeeder::class);

        Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'vendor', 'guard_name' => 'web']);

        $state = Location::create([
            'name' => 'Uttar Pradesh',
            'parent_id' => 0,
            'status' => 'active',
        ]);
        $city = Location::create([
            'name' => 'Lucknow',
            'parent_id' => $state->id,
            'status' => 'active',
        ]);

        // Admin User
        $this->adminUser = User::factory()->create([
            'mobile' => '9999999999',
            'role' => 'admin',
            'status' => 'approved',
        ]);

        // Vendor User & Profile
        $this->vendorUser = User::factory()->create([
            'mobile' => '9876543210',
            'role' => 'vendor',
            'status' => 'approved',
        ]);
        $this->vendorProfile = VendorProfile::create([
            'user_id' => $this->vendorUser->id,
            'vendor_name' => 'Gupta Building Materials',
            'owner_name' => 'Ramesh Gupta',
            'email' => $this->vendorUser->email,
            'mobile' => '9876543210',
            'address' => 'Gomti Nagar, Lucknow',
            'state_id' => $state->id,
            'city_id' => $city->id,
            'status' => 'approved',
        ]);

        $this->product = Product::firstOrFail();
    }

    public function test_admin_can_view_vendor_stock_and_ledger_page(): void
    {
        $response = $this->actingAs($this->adminUser)
            ->get(route('admin.catalog.vendor-stocks'));

        $response->assertStatus(200);
    }

    public function test_admin_can_assign_product_to_vendor_with_opening_stock(): void
    {
        $response = $this->actingAs($this->adminUser)
            ->post(route('admin.catalog.vendor-stocks.store'), [
                'vendor_id' => $this->vendorProfile->id,
                'product_id' => $this->product->id,
                'stock' => 100,
                'amount' => 380.00,
                'mrp' => 410.00,
                'min_order_qty' => 1,
                'notes' => 'Assigned by admin',
            ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('vendor_products', [
            'vendor_id' => $this->vendorProfile->id,
            'product_id' => $this->product->id,
            'stock' => 100.0,
            'amount' => 380.00,
        ]);

        $this->assertDatabaseHas('vendor_stock_ledgers', [
            'vendor_id' => $this->vendorProfile->id,
            'transaction_type' => 'opening_stock',
            'flow' => 'inward',
            'quantity' => 100.0,
            'balance_after' => 100.0,
        ]);
    }

    public function test_admin_can_update_vendor_stock_and_price_with_audit_ledger(): void
    {
        $vendorProduct = VendorProduct::create([
            'vendor_id' => $this->vendorProfile->id,
            'product_id' => $this->product->id,
            'stock' => 100.0,
            'amount' => 380.00,
            'is_available' => true,
        ]);

        $response = $this->actingAs($this->adminUser)
            ->post(route('admin.catalog.vendor-stocks.update', $vendorProduct->id), [
                'amount' => 395.00,
                'stock' => 90.0, // Admin adjusted 10 units less
                'reason' => 'Warehouse audit count',
            ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('vendor_products', [
            'id' => $vendorProduct->id,
            'amount' => 395.00,
            'stock' => 90.0,
        ]);

        $this->assertDatabaseHas('vendor_stock_ledgers', [
            'vendor_product_id' => $vendorProduct->id,
            'transaction_type' => 'manual_audit_adjustment',
            'flow' => 'outward',
            'quantity' => 10.0,
            'balance_before' => 100.0,
            'balance_after' => 90.0,
        ]);
    }

    public function test_admin_can_quick_add_inward_stock_to_vendor(): void
    {
        $vendorProduct = VendorProduct::create([
            'vendor_id' => $this->vendorProfile->id,
            'product_id' => $this->product->id,
            'stock' => 50.0,
            'amount' => 380.00,
            'is_available' => true,
        ]);

        $response = $this->actingAs($this->adminUser)
            ->post(route('admin.catalog.vendor-stocks.add-stock', $vendorProduct->id), [
                'quantity_to_add' => 50.0,
                'challan_or_invoice_no' => 'INV-ADMIN-100',
                'notes' => 'Added from manufacturer delivery',
            ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('vendor_products', [
            'id' => $vendorProduct->id,
            'stock' => 100.0,
        ]);

        $this->assertDatabaseHas('vendor_stock_ledgers', [
            'vendor_product_id' => $vendorProduct->id,
            'transaction_type' => 'stock_inward',
            'flow' => 'inward',
            'quantity' => 50.0,
            'balance_after' => 100.0,
        ]);
    }

    public function test_admin_can_toggle_vendor_product_availability(): void
    {
        $vendorProduct = VendorProduct::create([
            'vendor_id' => $this->vendorProfile->id,
            'product_id' => $this->product->id,
            'stock' => 50.0,
            'amount' => 380.00,
            'is_available' => true,
        ]);

        $response = $this->actingAs($this->adminUser)
            ->post(route('admin.catalog.vendor-stocks.toggle-status', $vendorProduct->id));

        $response->assertRedirect();

        $this->assertDatabaseHas('vendor_products', [
            'id' => $vendorProduct->id,
            'is_available' => false,
        ]);
    }

    public function test_admin_can_assign_product_with_uom_pricing_matrix_and_loose_control(): void
    {
        $uoms = \App\Models\UnitOfMeasure::take(2)->get();
        $primaryUom = $uoms->first();
        $secondaryUom = $uoms->last();

        $pricingMatrix = [
            [
                'uom_id' => $primaryUom->id,
                'conversion_factor' => 1.0000,
                'selling_price' => 370.00,
                'mrp' => 400.00,
                'allow_loose_sale' => false, // Full pack only
                'min_order_qty' => 1.00,
                'step_qty' => 1.00,
                'is_default_selling_unit' => true,
            ],
            [
                'uom_id' => $secondaryUom->id,
                'conversion_factor' => 0.0200,
                'selling_price' => 8.50,
                'mrp' => 10.00,
                'allow_loose_sale' => true, // Loose sale allowed
                'min_order_qty' => 5.00,
                'step_qty' => 1.00,
                'is_default_selling_unit' => false,
            ],
        ];

        $response = $this->actingAs($this->adminUser)
            ->post(route('admin.catalog.vendor-stocks.store'), [
                'vendor_id' => $this->vendorProfile->id,
                'product_id' => $this->product->id,
                'stock' => 200,
                'stock_uom_id' => $primaryUom->id,
                'notes' => 'Bulk stocking with UOM matrix',
                'pricing_matrix' => $pricingMatrix,
            ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('vendor_products', [
            'vendor_id' => $this->vendorProfile->id,
            'product_id' => $this->product->id,
            'amount' => 370.00,
            'stock' => 200.0,
        ]);

        $this->assertDatabaseHas('vendor_product_uoms', [
            'uom_id' => $primaryUom->id,
            'selling_price' => 370.00,
            'allow_loose_sale' => false,
            'is_default_selling_unit' => true,
        ]);

        $this->assertDatabaseHas('vendor_product_uoms', [
            'uom_id' => $secondaryUom->id,
            'selling_price' => 8.50,
            'allow_loose_sale' => true,
            'is_default_selling_unit' => false,
        ]);
    }
}
