<?php

namespace Database\Seeders;

use App\Models\CustomerProfile;
use App\Models\Location;
use App\Models\Product;
use App\Models\User;
use App\Models\VendorProduct;
use App\Models\VendorProductUom;
use App\Models\VendorProfile;
use App\Services\Inventory\VendorStockService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class DemoMarketplaceSeeder extends Seeder
{
    /**
     * Run the database seeds for Demo Vendor, Customer, Products Stock & UOM Rules.
     */
    public function run(): void
    {
        // 1. Roles
        $vendorRole = Role::firstOrCreate(['name' => 'vendor', 'guard_name' => 'web']);
        $customerRole = Role::firstOrCreate(['name' => 'customer', 'guard_name' => 'web']);

        // 2. State & City
        $state = Location::where('parent_id', 0)->first();
        $city = $state ? Location::where('parent_id', $state->id)->first() : null;
        if (! $city) {
            $city = Location::where('parent_id', '>', 0)->first();
        }

        $stateId = $state ? $state->id : 1;
        $cityId = $city ? $city->id : 1;

        // 3. Demo Vendor User
        $vendorUser = User::updateOrCreate(
            ['email' => 'vendor@buildeck.com'],
            [
                'name' => 'Gupta Building Materials',
                'mobile' => '9876543210',
                'role' => 'vendor',
                'status' => 'approved',
                'password' => Hash::make('vendor@123'),
                'email_verified_at' => now(),
            ]
        );

        if (! $vendorUser->hasRole('vendor')) {
            $vendorUser->assignRole($vendorRole);
        }

        // 4. Demo Vendor Profile
        $vendorProfile = VendorProfile::updateOrCreate(
            ['user_id' => $vendorUser->id],
            [
                'vendor_name' => 'Gupta Building Materials',
                'owner_name' => 'Ramesh Gupta',
                'email' => 'vendor@buildeck.com',
                'mobile' => '9876543210',
                'address' => 'Plot No. 45, Transport Nagar, Phase 2, Lucknow',
                'state_id' => $stateId,
                'city_id' => $cityId,
                'pincode' => '226012',
                'supply_radius' => 30,
                'status' => 'approved',
                'gst' => '09ABCDE1234F1Z5',
                'aadhaar' => '123456789012',
                'pan' => 'ABCDE1234F',
            ]
        );

        // 5. Demo Customer User
        $customerUser = User::updateOrCreate(
            ['email' => 'customer@buildeck.com'],
            [
                'name' => 'Rahul Sharma',
                'mobile' => '9123456789',
                'role' => 'customer',
                'status' => 'approved',
                'password' => Hash::make('customer@123'),
                'email_verified_at' => now(),
            ]
        );

        if (! $customerUser->hasRole('customer')) {
            $customerUser->assignRole($customerRole);
        }

        // 6. Demo Customer Profile
        CustomerProfile::updateOrCreate(
            ['user_id' => $customerUser->id]
        );

        // 7. Find Active Master Products to Add to Vendor Inventory
        $products = Product::with(['baseUom', 'uomPrices.uom'])
            ->where('is_active', true)
            ->take(2)
            ->get();

        $adminUser = User::where('role', 'admin')->first() ?? $vendorUser;

        foreach ($products as $index => $product) {
            $initialStock = $index === 0 ? 250.00 : 120.00;
            $defaultPrice = $index === 0 ? 385.00 : 920.00;
            $defaultMrp = $index === 0 ? 420.00 : 1050.00;

            $vendorProduct = VendorProduct::withTrashed()->updateOrCreate(
                [
                    'vendor_id' => $vendorProfile->id,
                    'product_id' => $product->id,
                ],
                [
                    'stock' => $initialStock,
                    'amount' => $defaultPrice,
                    'mrp' => $defaultMrp,
                    'min_order_qty' => 1.00,
                    'is_available' => true,
                    'deleted_at' => null,
                ]
            );

            // Populate Vendor Product UOMs with packaging & loose-sale rules
            $vendorProduct->uomPrices()->delete();

            if ($product->uomPrices->isNotEmpty()) {
                foreach ($product->uomPrices as $uIndex => $masterUom) {
                    $conv = (float) $masterUom->conversion_factor;
                    $sellingPrice = round($defaultPrice * $conv, 2);
                    if ($conv < 1 && $conv > 0) {
                        $sellingPrice = round($defaultPrice * $conv, 2);
                    }

                    // Configure: Full pack only on main packaging, loose allowed on base/retail unit
                    $allowLoose = (bool) $masterUom->allow_loose_sale;
                    // If first row is a bulk pack (e.g. Bag/Box), enforce full pack rule
                    if ($uIndex === 0 && $conv >= 1) {
                        $allowLoose = false; // No loose sale for complete bag/box
                    }

                    VendorProductUom::create([
                        'vendor_product_id' => $vendorProduct->id,
                        'uom_id' => $masterUom->uom_id,
                        'conversion_factor' => $conv,
                        'selling_price' => $masterUom->selling_price ?: $sellingPrice,
                        'mrp' => $masterUom->mrp ?: ($defaultMrp * $conv),
                        'allow_loose_sale' => $allowLoose,
                        'min_order_qty' => $masterUom->min_order_qty ?: 1.00,
                        'step_qty' => $masterUom->step_qty ?: 1.00,
                        'pack_contain_qty' => $masterUom->pack_contain_qty,
                        'is_default_selling_unit' => $masterUom->is_default_selling_unit,
                        'is_active' => true,
                    ]);
                }
            } else {
                VendorProductUom::create([
                    'vendor_product_id' => $vendorProduct->id,
                    'uom_id' => $product->base_uom_id,
                    'conversion_factor' => 1.0000,
                    'selling_price' => $defaultPrice,
                    'mrp' => $defaultMrp,
                    'allow_loose_sale' => true,
                    'min_order_qty' => 1.00,
                    'step_qty' => 1.00,
                    'is_default_selling_unit' => true,
                    'is_active' => true,
                ]);
            }

            // Record Opening Stock in Ledger if no ledger entry exists yet
            $hasLedger = $vendorProduct->stockLedgers()->where('transaction_type', 'opening_stock')->exists();
            if (! $hasLedger) {
                VendorStockService::initializeOpeningStock(
                    $vendorProduct,
                    $initialStock,
                    'Initial opening allotment seeded for demo vendor',
                    $adminUser->id
                );
            }
        }
    }
}
