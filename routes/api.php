<?php

use App\Http\Controllers\Api\ApiSupportController;
use App\Http\Controllers\Api\CustomerAuthController;
use App\Http\Controllers\Api\VendorAuthController;
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
    });
});

// Customer APIs
Route::prefix('customer')->group(function () {
    Route::post('register', [CustomerAuthController::class, 'register']);
    Route::post('login', [CustomerAuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('profile', [CustomerAuthController::class, 'profile']);
        Route::post('profile', [CustomerAuthController::class, 'updateProfile']);
        Route::post('logout', [CustomerAuthController::class, 'logout']);
    });
});