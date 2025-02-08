<?php

use App\Http\Controllers\API\v1\PermissionController;
use App\Http\Controllers\API\v1\PurchaseController;
use App\Http\Controllers\API\v1\RoleController;
use App\Http\Controllers\API\v1\SaleController;
use App\Http\Controllers\API\v1\UnitController;
use App\Http\Controllers\API\v1\UserController;
use App\Http\Controllers\CityController;
use App\Http\Controllers\CountryController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\StateController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});


Route::middleware('api')->prefix('api/v1')->group(function () {
    Route::apiResource('country', CountryController::class);
    Route::apiResource('state', StateController::class);
    Route::apiResource('city', controller: CityController::class);
    Route::apiResource('unit', controller: UnitController::class);
    Route::apiResource('role', controller: RoleController::class);
    Route::apiResource('permission', controller: PermissionController::class);
    Route::apiResource('user', controller: UserController::class);
    Route::apiResource('purchase', controller: PurchaseController::class);
    Route::apiResource('sale', controller: SaleController::class);
    Route::apiResource('payment', controller: PaymentController::class);
});
