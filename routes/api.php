<?php

use App\Http\Controllers\Api\VendorAuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('locations/states', [ApiSupportController::class, 'getStates']);
Route::get('locations/cities/{stateId}', [ApiSupportController::class, 'getCities']);

Route::prefix('vendor')->group(function () {
    Route::post('register', [VendorAuthController::class, 'register']);

    Route::post('login', [VendorAuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('profile', [VendorAuthController::class, 'profile']);
        Route::post('logout', [VendorAuthController::class, 'logout']);
    });
});
