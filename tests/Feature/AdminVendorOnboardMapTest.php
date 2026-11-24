<?php

namespace Tests\Feature;

use App\Models\Location;
use App\Models\User;
use App\Models\VendorProfile;
use App\Services\GoogleMapsService;
use Database\Seeders\ProductMasterSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AdminVendorOnboardMapTest extends TestCase
{
    use RefreshDatabase;

    protected User $adminUser;
    protected Location $state;
    protected Location $city;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(ProductMasterSeeder::class);

        Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);

        $this->state = Location::create([
            'name' => 'Maharashtra',
            'parent_id' => 0,
            'status' => 'active',
        ]);

        $this->city = Location::create([
            'name' => 'Mumbai',
            'parent_id' => $this->state->id,
            'status' => 'active',
        ]);

        $this->adminUser = User::factory()->create([
            'mobile' => '9888888888',
            'role' => 'admin',
            'status' => 'approved',
        ]);
        $this->adminUser->assignRole('admin');
    }

    public function test_admin_vendor_onboard_page_loads_with_google_maps_key_from_service_container(): void
    {
        $response = $this->actingAs($this->adminUser)
            ->get(route('admin.onboard.vendor'));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Onboard/Vendor/index')
            ->has('googleMapsApiKey')
            ->where('googleMapsApiKey', app(GoogleMapsService::class)->getApiKey())
            ->has('states')
            ->has('vendors')
        );
    }

    public function test_admin_can_store_vendor_with_latitude_and_longitude_selected_from_map(): void
    {
        $vendorData = [
            'vendor_name' => 'Super Hardware Supplies',
            'owner_name' => 'Amit Sharma',
            'email' => 'amit.hardware@example.com',
            'mobile' => '9876543210',
            'address' => 'Shop 14, Ring Road, Bandra',
            'state_id' => $this->state->id,
            'city_id' => $this->city->id,
            'pincode' => '400050',
            'lat' => 19.0596,
            'long' => 72.8295,
            'supply_radius' => 15.5,
            'gst' => '27ABCDE1234F1Z5',
            'pan' => 'ABCDE1234F',
            'aadhaar' => '123456789012',
        ];

        $response = $this->actingAs($this->adminUser)
            ->post(route('admin.vendor.store'), $vendorData);

        $response->assertSessionHas('success');

        $this->assertDatabaseHas('vendor_profiles', [
            'vendor_name' => 'Super Hardware Supplies',
            'email' => 'amit.hardware@example.com',
            'lat' => 19.0596,
            'long' => 72.8295,
            'supply_radius' => 15.5,
        ]);
    }
}
