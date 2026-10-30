<?php

use App\Http\Controllers\Admin\VendorController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
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
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::prefix('admin')->name('admin.')->middleware('auth')->group(function () {
    Route::get('vendor-onbaord', [VendorController::class, 'index'])->name('onboard.vendor');
    Route::post('vendors', [VendorController::class, 'store'])->name('vendor.store');
    Route::post('vendors/{vendor}', [VendorController::class, 'update'])->name('vendor.update');
    Route::patch('vendors/{vendor}/status', [VendorController::class, 'updateStatus'])->name('vendor.status');
    Route::post('vendors/{vendor}/generate-credentials', [VendorController::class, 'generateCredentials'])->name('vendor.credentials');
    Route::get('cities/{stateId}', [VendorController::class, 'getCities'])->name('cities.by-state');
});

require __DIR__.'/auth.php';
