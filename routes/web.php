<?php

use App\Http\Controllers\Admin\Catalog\BrandController;
use App\Http\Controllers\Admin\Catalog\CategoryController;
use App\Http\Controllers\Admin\Catalog\ProductController;
use App\Http\Controllers\Admin\Catalog\UnitOfMeasureController;
use App\Http\Controllers\Admin\Onboard\CustomerController;
use App\Http\Controllers\Admin\Onboard\VendorController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\Item\ItemController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Support\SupportController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Route::get('/', function () {
//     return Inertia::render('Welcome', [
//         'canLogin' => Route::has('login'),
//         'canRegister' => Route::has('register'),
//         'laravelVersion' => Application::VERSION,
//         'phpVersion' => PHP_VERSION,
//     ]);
// });

Route::get('/dashboard', [AdminController::class, 'dashboard'])->middleware(['auth', 'verified'])->name('dashboard');

Route::get('/dashboard_01', function () {
    return Inertia::render('Admin/Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard_01');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::post('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::post('/profile/destroy', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::prefix('admin')->name('admin.')->middleware('auth')->group(function () {
    // Onboard Users
    Route::get('vendor-onbaord', [VendorController::class, 'index'])->name('onboard.vendor');
    Route::post('vendors', [VendorController::class, 'store'])->name('vendor.store');
    Route::post('vendors/{vendor}', [VendorController::class, 'update'])->name('vendor.update');
    Route::post('vendors/{vendor}/status', [VendorController::class, 'updateStatus'])->name('vendor.status');
    Route::post('vendors/{vendor}/generate-credentials', [VendorController::class, 'generateCredentials'])->name('vendor.credentials');
    Route::get('cities/{stateId}', [SupportController::class, 'getCities'])->name('cities.by-state');
    
    Route::get('customer-onbaord', [CustomerController::class, 'index'])->name('onboard.customer');
    Route::post('customers', [CustomerController::class, 'store'])->name('customer.store');
    Route::post('customers/{customer}', [CustomerController::class, 'update'])->name('customer.update');
    Route::post('customers/{customer}/status', [CustomerController::class, 'updateStatus'])->name('customer.status');
    Route::post('customers/{customer}/generate-credentials', [CustomerController::class, 'generateCredentials'])->name('customer.credentials');

    // Legacy / Generic Item Route
    Route::get('item', [ItemController::class, 'index'])->name('item');

    // ─── Product / Catalog Master ──────────────────────────────────────
    Route::prefix('catalog')->name('catalog.')->group(function () {
        // Categories & Sub-Categories
        Route::get('categories', [CategoryController::class, 'index'])->name('categories');
        Route::post('categories', [CategoryController::class, 'storeCategory'])->name('categories.store');
        Route::post('sub-categories', [CategoryController::class, 'storeSubCategory'])->name('sub-categories.store');

        // Units of Measure (UOM)
        Route::get('uoms', [UnitOfMeasureController::class, 'index'])->name('uoms');
        Route::post('uoms', [UnitOfMeasureController::class, 'store'])->name('uoms.store');
        Route::post('uoms/{uom}', [UnitOfMeasureController::class, 'update'])->name('uoms.update');

        // Brands Master
        Route::get('brands', [BrandController::class, 'index'])->name('brands');
        Route::post('brands', [BrandController::class, 'store'])->name('brands.store');
        Route::post('brands/{brand}', [BrandController::class, 'update'])->name('brands.update');

        // Products & Multi-UOM Matrix
        Route::get('products', [ProductController::class, 'index'])->name('products');
        Route::post('products', [ProductController::class, 'store'])->name('products.store');
        Route::post('products/{product}', [ProductController::class, 'update'])->name('products.update');
        Route::delete('products/{product}', [ProductController::class, 'destroy'])->name('products.destroy');
    });
});

require __DIR__.'/auth.php';
