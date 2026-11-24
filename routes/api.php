<?php

use App\Http\Controllers\Api\ApiSupportController;
use App\Http\Controllers\Api\CustomerAuthController;
use App\Http\Controllers\Api\CustomerCartController;
use App\Http\Controllers\Api\CustomerProductCatalogController;
use App\Http\Controllers\Api\VendorAuthController;
use App\Http\Controllers\Api\Vendor\VendorProductManagementController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('locations/states', [ApiSupportController::class, 'getStates']);
Route::get('locations/cities/{stateId}', [ApiSupportController::class, 'getCities']);

// Vendor APIs
Route::prefix('vendor')->group(function () {
    Route::post('register', [VendorAuthController::class, 'register']);
    Route::post('login', [VendorAuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('profile', [VendorAuthController::class, 'profile']);
        Route::post('logout', [VendorAuthController::class, 'logout']);

        // Vendor Product & Stock Management
        Route::prefix('products')->group(function () {
            Route::get('catalog', [VendorProductManagementController::class, 'catalog']);
            Route::get('my-inventory', [VendorProductManagementController::class, 'myInventory']);
            Route::post('add-to-inventory', [VendorProductManagementController::class, 'addToInventory']);
            Route::put('{id}/update', [VendorProductManagementController::class, 'updateStockAndAmount']);
            Route::post('{id}/add-stock', [VendorProductManagementController::class, 'addStock']);
            Route::patch('{id}/toggle-status', [VendorProductManagementController::class, 'toggleStatus']);
            Route::get('{id}/stock-ledger', [VendorProductManagementController::class, 'stockLedger']);
        });
    });
});

// Customer APIs
Route::prefix('customer')->group(function () {
    Route::post('register', [CustomerAuthController::class, 'register']);
    Route::post('login', [CustomerAuthController::class, 'login']);

    // Geo-Location Catalog & Product Details with Nearby Vendors
    Route::get('catalog', [CustomerProductCatalogController::class, 'catalog']);
    Route::get('products/{productId}', [CustomerProductCatalogController::class, 'productDetails']);

    // Dynamic Multi-UOM Pricing Modal for Add-To-Cart
    Route::get('products/{productId}/pricing-modal', [CustomerCartController::class, 'pricingModal']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('profile', [CustomerAuthController::class, 'profile']);
        Route::post('profile', [CustomerAuthController::class, 'updateProfile']);
        Route::post('logout', [CustomerAuthController::class, 'logout']);

        // Cart Management
        Route::get('cart', [CustomerCartController::class, 'getCart']);
        Route::post('cart/add', [CustomerCartController::class, 'addToCart']);
        Route::delete('cart/{id}', [CustomerCartController::class, 'removeFromCart']);
    });
});
