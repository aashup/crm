<?php

use App\Http\Controllers\API\v1\AuthController;
use Illuminate\Support\Facades\Route;



Route::prefix('v1')->group(function () {

    Route::post('login', [AuthController::class, 'login']);
    Route::post('register', [AuthController::class, 'register']);
    Route::post('forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('reset-password', [AuthController::class, 'resetPassword']);

    Route::middleware('auth:api')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('find/{type}', ['App\Http\Controllers\API\v1\FindController', 'handler']);
        Route::apiResource('country', 'App\Http\Controllers\API\v1\CountryController');
        Route::apiResource('state', 'App\Http\Controllers\API\v1\StateController');
        Route::apiResource('city', controller: 'App\Http\Controllers\API\v1\CityController');
        Route::apiResource('unit', controller: 'App\Http\Controllers\API\v1\UnitController');
        Route::apiResource('unit-conversion', controller: 'App\Http\Controllers\API\v1\UnitConversionController');
        Route::apiResource('role', controller: 'App\Http\Controllers\API\v1\RoleController');
        Route::any('role/{role}/sync-permission', ['App\Http\Controllers\API\v1\RoleController', 'syncPermission'])->name('role.permission');
        Route::apiResource('permission', controller: 'App\Http\Controllers\API\v1\PermissionController');
        Route::apiResource('user', controller: 'App\Http\Controllers\API\v1\UserController');
        Route::apiResource('purchase', controller: 'App\Http\Controllers\API\v1\PurchaseController');
        Route::apiResource('sale', controller: 'App\Http\Controllers\API\v1\SaleController');
        Route::apiResource('payment', controller: 'App\Http\Controllers\API\v1\PaymentController');
        Route::apiResource('menu', controller: 'App\Http\Controllers\API\v1\MenuController');
        Route::apiResource('permission', controller: 'App\Http\Controllers\API\v1\PermissionController');
        Route::apiResource('product', controller: 'App\Http\Controllers\API\v1\ProductController');
        Route::apiResource('product/{product}/product-unit', controller: 'App\Http\Controllers\API\v1\ProductUnitController');
        Route::apiResource('contact', controller: 'App\Http\Controllers\API\v1\ContactController');
        Route::apiResource('address', controller: 'App\Http\Controllers\API\v1\AddressController');
        Route::apiResource('supplier', controller: 'App\Http\Controllers\API\v1\SupplierController');
        Route::apiResource('customer', controller: 'App\Http\Controllers\API\v1\CustomerController');
        Route::apiResource('inventory', controller: 'App\Http\Controllers\API\v1\InventoryController');
    });
});