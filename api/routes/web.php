<?php

use App\Http\Controllers\API\v1\AuthController;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/migrate-fresh', function () {
    Artisan::call('migrate:fresh --seed');
    return 'Migration run successfully!';
});

Route::get('/migrate', function () {
    Artisan::call('migrate');
    return 'Migration run successfully!';
});

Route::get('/dump-autoload', function () {
    Artisan::call('dump-autoload');
    return 'Autoload run successfully!';
});

Route::get('check-reset-password-link/{token}', [AuthController::class, 'checkResetPasswordLink']);
Route::get('email-verification/{id}', [AuthController::class, 'emailVerification']);