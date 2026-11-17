<?php

namespace Tests\Feature;

use App\Models\CartItem;
use App\Models\Location;
use App\Models\Product;
use App\Models\UnitOfMeasure;
use App\Models\User;
use App\Models\VendorProfile;
use App\Models\VendorProduct;
use App\Models\VendorStockLedger;
use Database\Seeders\ProductMasterSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class VendorProductStockManagementTest extends TestCase
{
    use RefreshDatabase;

    protected User $vendorUser;
    protected VendorProfile $vendorProfile;
    protected User $customerUser;
    protected Product $product;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(ProductMasterSeeder::class);

        Role::firstOrCreate(['name' => 'vendor', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'customer', 'guard_name' => 'web']);

        // Create locations
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

        // Create Vendor User & Approved Vendor Profile
        $this->vendorUser = User::factory()->create([
            'mobile' => '9876543210',
            'role' => 'vendor',
            'status' => 'approved',
        ]);
        $this->vendorProfile = VendorProfile::create([
            'user_id' => $this->vendorUser->id,
            'vendor_name' => 'Shree Ram Building Materials',
            'owner_name' => 'Ram Kumar',
            'email' => $this->vendorUser->email,
            'mobile' => '9876543210',
            'address' => 'Gomti Nagar, Lucknow',
            'state_id' => $state->id,
            'city_id' => $city->id,
            'status' => 'approved',
        ]);

        // Create Customer User
        $this->customerUser = User::factory()->create([
            'mobile' => '9876543211',
            'role' => 'customer',
            'status' => 'approved',
        ]);

        // Get an existing seeded Product (e.g. UltraTech Super Cement)
        $this->product = Product::firstOrFail();
    }

    public function test_vendor_can_browse_master_catalog(): void
    {
        Sanctum::actingAs($this->vendorUser);

        $response = $this->getJson('/api/vendor/products/catalog');

        $response->assertStatus(200)
            ->assertJsonPath('res', 'success')
            ->assertJsonStructure([
                'auth_status',
                'res',
                'msg',
                'data' => [
                    'data' => [
                        '*' => [
                            'id',
                            'name',
                            'sku',
                            'category',
                            'sub_category',
                            'base_uom',
                            'is_already_added',
                        ],
                    ],
                ],
            ]);
    }

    public function test_vendor_can_add_product_to_inventory_with_opening_stock_and_ledger(): void
    {
        Sanctum::actingAs($this->vendorUser);

        $response = $this->postJson('/api/vendor/products/add-to-inventory', [
            'product_id' => $this->product->id,
            'stock' => 50.0,
            'amount' => 380.00,
            'mrp' => 410.00,
            'min_order_qty' => 1.0,
            'notes' => 'Opening stock for Diwali season',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('res', 'success')
            ->assertJsonPath('data.stock', 50)
            ->assertJsonPath('data.amount', 380);

        // Verify VendorProduct in DB
        $this->assertDatabaseHas('vendor_products', [
            'vendor_id' => $this->vendorProfile->id,
            'product_id' => $this->product->id,
            'stock' => 50.0,
            'amount' => 380.00,
            'is_available' => true,
        ]);

        // Verify Stock Ledger opening entry
        $this->assertDatabaseHas('vendor_stock_ledgers', [
            'vendor_id' => $this->vendorProfile->id,
            'product_id' => $this->product->id,
            'transaction_type' => 'opening_stock',
            'flow' => 'inward',
            'quantity' => 50.0,
            'balance_before' => 0.0,
            'balance_after' => 50.0,
        ]);
    }

    public function test_vendor_can_update_amount_and_perform_audit_stock_adjustment(): void
    {
        Sanctum::actingAs($this->vendorUser);

        // Add product first
        $vendorProduct = VendorProduct::create([
            'vendor_id' => $this->vendorProfile->id,
            'product_id' => $this->product->id,
            'stock' => 50.0,
            'amount' => 380.00,
            'is_available' => true,
        ]);

        $response = $this->putJson("/api/vendor/products/{$vendorProduct->id}/update", [
            'amount' => 395.00,
            'stock' => 45.0, // Reduced by 5 due to audit
            'reason' => 'Physical count adjustment',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('res', 'success')
            ->assertJsonPath('data.amount', 395)
            ->assertJsonPath('data.stock', 45);

        // Verify ledger recorded manual_audit_adjustment
        $this->assertDatabaseHas('vendor_stock_ledgers', [
            'vendor_product_id' => $vendorProduct->id,
            'transaction_type' => 'manual_audit_adjustment',
            'flow' => 'outward',
            'quantity' => 5.0,
            'balance_before' => 50.0,
            'balance_after' => 45.0,
        ]);
    }

    public function test_vendor_can_add_quick_inward_stock(): void
    {
        Sanctum::actingAs($this->vendorUser);

        $vendorProduct = VendorProduct::create([
            'vendor_id' => $this->vendorProfile->id,
            'product_id' => $this->product->id,
            'stock' => 20.0,
            'amount' => 380.00,
            'is_available' => true,
        ]);

        $response = $this->postJson("/api/vendor/products/{$vendorProduct->id}/add-stock", [
            'quantity_to_add' => 80.0,
            'challan_or_invoice_no' => 'CHALLAN-991',
            'notes' => 'Received from manufacturer truck',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('res', 'success')
            ->assertJsonPath('data.added_quantity', 80)
            ->assertJsonPath('data.current_stock', 100);

        $this->assertDatabaseHas('vendor_products', [
            'id' => $vendorProduct->id,
            'stock' => 100.0,
        ]);

        $this->assertDatabaseHas('vendor_stock_ledgers', [
            'vendor_product_id' => $vendorProduct->id,
            'transaction_type' => 'stock_inward',
            'flow' => 'inward',
            'quantity' => 80.0,
            'balance_before' => 20.0,
            'balance_after' => 100.0,
            'reference_no' => 'CHALLAN-991',
        ]);
    }

    public function test_vendor_can_view_stock_ledger_passbook(): void
    {
        Sanctum::actingAs($this->vendorUser);

        $vendorProduct = VendorProduct::create([
            'vendor_id' => $this->vendorProfile->id,
            'product_id' => $this->product->id,
            'stock' => 100.0,
            'amount' => 380.00,
            'is_available' => true,
        ]);

        VendorStockLedger::create([
            'vendor_id' => $this->vendorProfile->id,
            'vendor_product_id' => $vendorProduct->id,
            'product_id' => $this->product->id,
            'transaction_type' => 'opening_stock',
            'flow' => 'inward',
            'quantity' => 100.0,
            'balance_before' => 0.0,
            'balance_after' => 100.0,
            'reference_no' => 'OPENING',
            'remarks' => 'Initial',
        ]);

        $response = $this->getJson("/api/vendor/products/{$vendorProduct->id}/stock-ledger");

        $response->assertStatus(200)
            ->assertJsonPath('res', 'success')
            ->assertJsonPath('data.current_stock', 100)
            ->assertJsonCount(1, 'data.transactions.data');
    }

    public function test_customer_can_fetch_multi_uom_pricing_modal_options(): void
    {
        // Vendor adds product with 50 Bags stock (50 * 50kg = 2500 kg base stock if base is kg, or 50 bags)
        $vendorProduct = VendorProduct::create([
            'vendor_id' => $this->vendorProfile->id,
            'product_id' => $this->product->id,
            'stock' => 50.0,
            'amount' => 380.00,
            'is_available' => true,
        ]);

        $response = $this->getJson("/api/customer/products/{$this->product->id}/pricing-modal?vendor_id={$this->vendorProfile->id}");

        $response->assertStatus(200)
            ->assertJsonPath('res', 'success')
            ->assertJsonPath('data.vendor.id', $this->vendorProfile->id)
            ->assertJsonStructure([
                'data' => [
                    'product_id',
                    'product_name',
                    'vendor' => ['id', 'vendor_name', 'available_stock'],
                    'options' => [
                        '*' => [
                            'type',
                            'label',
                            'uom_id',
                            'uom_name',
                            'conversion_factor',
                            'selling_price',
                        ],
                    ],
                ],
            ]);
    }

    public function test_customer_can_add_item_to_cart_with_stock_validation(): void
    {
        Sanctum::actingAs($this->customerUser);

        // Vendor has 10 units in stock
        VendorProduct::create([
            'vendor_id' => $this->vendorProfile->id,
            'product_id' => $this->product->id,
            'stock' => 10.0,
            'amount' => 380.00,
            'is_available' => true,
        ]);

        $uom = $this->product->baseUom;

        // 1. Successful add to cart (2 units <= 10 units)
        $response = $this->postJson('/api/customer/cart/add', [
            'vendor_id' => $this->vendorProfile->id,
            'product_id' => $this->product->id,
            'uom_id' => $uom->id,
            'purchase_type' => 'package',
            'quantity' => 2.0,
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('res', 'success')
            ->assertJsonPath('data.quantity', 2)
            ->assertJsonPath('data.unit_price', 380)
            ->assertJsonPath('data.total_price', 760);

        $this->assertDatabaseHas('cart_items', [
            'user_id' => $this->customerUser->id,
            'vendor_id' => $this->vendorProfile->id,
            'product_id' => $this->product->id,
            'quantity' => 2.0,
            'total_price' => 760.00,
        ]);

        // 2. Insufficient stock failure (requesting 50 units when vendor only has 10)
        $failResponse = $this->postJson('/api/customer/cart/add', [
            'vendor_id' => $this->vendorProfile->id,
            'product_id' => $this->product->id,
            'uom_id' => $uom->id,
            'purchase_type' => 'package',
            'quantity' => 50.0,
        ]);

        $failResponse->assertStatus(400)
            ->assertJsonPath('res', 'error')
            ->assertJsonPath('data.available_stock', 10);
    }

    public function test_customer_can_view_and_delete_cart_items(): void
    {
        Sanctum::actingAs($this->customerUser);

        $uom = $this->product->baseUom;

        $cartItem = CartItem::create([
            'user_id' => $this->customerUser->id,
            'vendor_id' => $this->vendorProfile->id,
            'product_id' => $this->product->id,
            'uom_id' => $uom->id,
            'purchase_type' => 'package',
            'quantity' => 3.0,
            'conversion_factor' => 1.0,
            'base_quantity' => 3.0,
            'unit_price' => 380.00,
            'total_price' => 1140.00,
        ]);

        // Fetch Cart
        $getResponse = $this->getJson('/api/customer/cart');
        $getResponse->assertStatus(200)
            ->assertJsonPath('data.total_items_count', 1)
            ->assertJsonPath('data.total_cart_amount', 1140);

        // Delete from cart
        $deleteResponse = $this->deleteJson("/api/customer/cart/{$cartItem->id}");
        $deleteResponse->assertStatus(200)
            ->assertJsonPath('res', 'success');

        $this->assertDatabaseMissing('cart_items', [
            'id' => $cartItem->id,
        ]);
    }

    public function test_unauthenticated_api_request_always_returns_json_401_even_with_html_accept_header(): void
    {
        // Calling protected endpoint with Accept: text/html header
        $response = $this->withHeaders(['Accept' => 'text/html'])
            ->get('/api/vendor/products/my-inventory');

        $response->assertStatus(401)
            ->assertHeader('Content-Type', 'application/json')
            ->assertJsonPath('auth_status', false)
            ->assertJsonPath('res', 'error')
            ->assertJsonPath('msg', 'Unauthenticated or session expired. Please login again.');
    }

    public function test_non_existent_api_endpoint_always_returns_json_404_even_with_html_accept_header(): void
    {
        $response = $this->withHeaders(['Accept' => 'text/html'])
            ->get('/api/vendor/unknown-endpoint-slug');

        $response->assertStatus(404)
            ->assertHeader('Content-Type', 'application/json')
            ->assertJsonPath('auth_status', true)
            ->assertJsonPath('res', 'error')
            ->assertJsonPath('msg', 'The requested API endpoint or resource was not found.');
    }

    public function test_post_request_validation_error_returns_clean_422_json_via_form_request(): void
    {
        Sanctum::actingAs($this->vendorUser);

        // Send invalid data without Accept header
        $response = $this->withHeaders(['Accept' => '*/*'])
            ->post('/api/vendor/products/add-to-inventory', [
                // Missing product_id, stock, amount
            ]);

        $response->assertStatus(422)
            ->assertHeader('Content-Type', 'application/json')
            ->assertJsonPath('auth_status', true)
            ->assertJsonPath('res', 'error')
            ->assertJsonStructure([
                'auth_status',
                'res',
                'msg',
                'token_type',
                'data' => ['product_id', 'stock', 'amount'],
            ]);
    }
}
