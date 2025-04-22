<?php
use Illuminate\Support\Facades\Route;


Route::prefix('v1')->group(function () {
    Route::get('find/{type}', ['App\Http\Controllers\API\v1\FindController', 'handler']);
    Route::apiResource('country', 'App\Http\Controllers\API\v1\CountryController');
    Route::apiResource('state', 'App\Http\Controllers\API\v1\StateController');
    Route::apiResource('city', controller: 'App\Http\Controllers\API\v1\CityController');
    Route::apiResource('unit', controller: 'App\Http\Controllers\API\v1\UnitController');
    Route::apiResource('role', controller: 'App\Http\Controllers\API\v1\RoleController');
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

});