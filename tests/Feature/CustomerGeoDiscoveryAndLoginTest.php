<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Location;
use App\Models\Product;
use App\Models\ProductUomPrice;
use App\Models\SubCategory;
use App\Models\UnitOfMeasure;
use App\Models\User;
use App\Models\VendorProduct;
use App\Models\VendorProfile;
use Database\Seeders\ProductMasterSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class CustomerGeoDiscoveryAndLoginTest extends TestCase
{
    use RefreshDatabase;

    protected User $customerUser;
    protected User $vendorNearbyUser;
    protected VendorProfile $vendorNearbyProfile;
    protected User $vendorFarUser;
    protected VendorProfile $vendorFarProfile;
    protected Product $cementProduct;
    protected Product $steelProduct;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(ProductMasterSeeder::class);

        Role::firstOrCreate(['name' => 'customer', 'guard_name' => 'web']);
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

        // 1. Customer User (Lucknow coordinates: 26.8467, 80.9462)
        $this->customerUser = User::create([
            'name' => 'Amit Customer',
            'mobile' => '9876543210',
            'email' => 'amit@example.com',
            'role' => 'customer',
            'status' => 'approved',
            'password' => Hash::make('yourPassword123'),
            'state_id' => $state->id,
            'city_id' => $city->id,
        ]);
        $this->customerUser->assignRole('customer');

        // 2. Nearby Vendor (Distance ~ 4.5 km from customer: 26.8800, 80.9300, Radius: 15 km)
        $this->vendorNearbyUser = User::create([
            'name' => 'Gupta Vendor',
            'mobile' => '9111111111',
            'email' => 'gupta@example.com',
            'role' => 'vendor',
            'status' => 'approved',
            'password' => Hash::make('password123'),
            'state_id' => $state->id,
            'city_id' => $city->id,
        ]);
        $this->vendorNearbyProfile = VendorProfile::create([
            'user_id' => $this->vendorNearbyUser->id,
            'vendor_name' => 'Gupta Building Materials',
            'owner_name' => 'Ramesh Gupta',
            'address' => 'Shop 5, Hazratganj, Lucknow',
            'lat' => 26.8800,
            'long' => 80.9300,
            'supply_radius' => 15.00,
            'status' => 'approved',
        ]);

        // 3. Far Away Vendor (Kanpur ~ 80 km away: 26.4499, 80.3319, Radius: 20 km)
        $this->vendorFarUser = User::create([
            'name' => 'Kanpur Vendor',
            'mobile' => '9222222222',
            'email' => 'kanpur@example.com',
            'role' => 'vendor',
            'status' => 'approved',
            'password' => Hash::make('password123'),
            'state_id' => $state->id,
            'city_id' => $city->id,
        ]);
        $this->vendorFarProfile = VendorProfile::create([
            'user_id' => $this->vendorFarUser->id,
            'vendor_name' => 'Kanpur Steel Traders',
            'owner_name' => 'Suresh Kanpur',
            'address' => 'Mall Road, Kanpur',
            'lat' => 26.4499,
            'long' => 80.3319,
            'supply_radius' => 20.00,
            'status' => 'approved',
        ]);

        // Master Products
        $this->cementProduct = Product::where('name', 'like', '%Cement%')->first()
            ?? Product::first();

        // Nearby vendor stocks Cement
        VendorProduct::create([
            'vendor_id' => $this->vendorNearbyProfile->id,
            'product_id' => $this->cementProduct->id,
            'stock' => 1000.00,
            'amount' => 380.00,
            'is_available' => true,
        ]);

        // Far vendor stocks Steel Product
        $this->steelProduct = Product::where('id', '!=', $this->cementProduct->id)->first();
        if ($this->steelProduct) {
            VendorProduct::create([
                'vendor_id' => $this->vendorFarProfile->id,
                'product_id' => $this->steelProduct->id,
                'stock' => 50.00,
                'amount' => 550.00,
                'is_available' => true,
            ]);
        }
    }

    public function test_customer_can_login_with_lat_long_and_updates_location(): void
    {
        $response = $this->postJson('/api/customer/login', [
            'login' => '9876543210',
            'password' => 'yourPassword123',
            'lat' => 26.8467,
            'long' => 80.9462,
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('res', 'success')
            ->assertJsonPath('auth_status', true)
            ->assertJsonStructure([
                'data' => [
                    'token',
                    'user' => ['id', 'name', 'mobile', 'lat', 'long'],
                    'customer_location' => ['lat', 'long'],
                ],
            ]);

        // User profile lat/long should be updated
        $this->customerUser->refresh();
        $this->assertEquals(26.8467, (float) $this->customerUser->lat);
        $this->assertEquals(80.9462, (float) $this->customerUser->long);

        // Flutter dev manages items via dedicated catalog API call
        $catalogResponse = $this->getJson('/api/customer/catalog?lat=26.8467&long=80.9462');
        $catalogResponse->assertStatus(200);

        $items = $catalogResponse->json('data.items');
        $this->assertNotEmpty($items);
        $this->assertEquals($this->cementProduct->id, $items[0]['id']);
        $this->assertArrayHasKey('brand_name', $items[0]);
        $this->assertArrayHasKey('cover_image_url', $items[0]);
        $this->assertArrayHasKey('available_vendors_count', $items[0]);
        $this->assertEquals(1, $items[0]['available_vendors_count']);
        $this->assertEquals(380.00, $items[0]['starting_price']);

        // Far vendor's product should NOT be in nearby items
        if ($this->steelProduct) {
            $itemIds = array_column($items, 'id');
            $this->assertNotContains($this->steelProduct->id, $itemIds);
        }
    }

    public function test_customer_can_login_with_latlong_string_format(): void
    {
        $response = $this->postJson('/api/customer/login', [
            'login' => '9876543210',
            'password' => 'yourPassword123',
            'latlong' => '(26.8467,80.9462)',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('res', 'success')
            ->assertJsonPath('data.customer_location.lat', 26.8467)
            ->assertJsonPath('data.customer_location.long', 80.9462);
    }

    public function test_customer_can_login_without_lat_long_keeping_keys_optional(): void
    {
        $response = $this->postJson('/api/customer/login', [
            'login' => '9876543210',
            'password' => 'yourPassword123',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('res', 'success')
            ->assertJsonPath('auth_status', true);
    }

    public function test_customer_catalog_api_filters_items_by_lat_long(): void
    {
        $response = $this->getJson('/api/customer/catalog?lat=26.8467&long=80.9462');

        $response->assertStatus(200)
            ->assertJsonPath('res', 'success')
            ->assertJsonStructure([
                'data' => [
                    'customer_location',
                    'total_items',
                    'items' => [
                        '*' => [
                            'id',
                            'name',
                            'brand_name',
                            'cover_image_url',
                            'base_uom',
                            'available_vendors_count',
                            'starting_price',
                        ],
                    ],
                ],
            ]);

        $items = $response->json('data.items');
        $this->assertNotEmpty($items);
        $this->assertEquals($this->cementProduct->id, $items[0]['id']);
    }

    public function test_customer_product_details_shows_product_and_nearby_vendors_list(): void
    {
        $response = $this->getJson("/api/customer/products/{$this->cementProduct->id}?lat=26.8467&long=80.9462");

        $response->assertStatus(200)
            ->assertJsonPath('res', 'success')
            ->assertJsonStructure([
                'data' => [
                    'product' => [
                        'id',
                        'name',
                        'brand',
                        'cover_image_url',
                        'description',
                    ],
                    'nearby_vendors' => [
                        '*' => [
                            'vendor_id',
                            'vendor_name',
                            'distance_km',
                            'available_stock',
                            'starting_price',
                            'allows_loose_sale',
                        ],
                    ],
                ],
            ]);

        $nearbyVendors = $response->json('data.nearby_vendors');
        $this->assertNotEmpty($nearbyVendors);
        $this->assertEquals($this->vendorNearbyProfile->id, $nearbyVendors[0]['vendor_id']);
        $this->assertNotNull($nearbyVendors[0]['distance_km']);
        // Distance should be roughly 4-5 km
        $this->assertLessThan(15.0, $nearbyVendors[0]['distance_km']);
    }

    public function test_vendor_pricing_modal_opens_and_cart_addition_works(): void
    {
        // 1. Fetch vendor pricing drawer options
        $drawerResponse = $this->getJson("/api/customer/products/{$this->cementProduct->id}/pricing-modal?vendor_id={$this->vendorNearbyProfile->id}");

        $drawerResponse->assertStatus(200)
            ->assertJsonPath('res', 'success')
            ->assertJsonStructure([
                'data' => [
                    'product_id',
                    'vendor' => ['id', 'vendor_name'],
                    'options' => [
                        '*' => [
                            'type',
                            'label',
                            'uom_id',
                            'selling_price',
                        ],
                    ],
                ],
            ]);

        $options = $drawerResponse->json('data.options');
        $this->assertNotEmpty($options);
        $packageOption = $options[0];

        // 2. Add to cart as authenticated customer
        $cartResponse = $this->actingAs($this->customerUser, 'sanctum')
            ->postJson('/api/customer/cart/add', [
                'vendor_id' => $this->vendorNearbyProfile->id,
                'product_id' => $this->cementProduct->id,
                'uom_id' => $packageOption['uom_id'],
                'purchase_type' => $packageOption['type'],
                'quantity' => 1,
            ]);

        $cartResponse->assertStatus(201)
            ->assertJsonPath('res', 'success')
            ->assertJsonPath('data.quantity', 1);
    }
}
