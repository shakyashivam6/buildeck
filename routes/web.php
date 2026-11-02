<?php

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

    Route::get('item', [ItemController::class, 'index'])->name('item');
});

require __DIR__.'/auth.php';
