<?php

use App\Http\Controllers\API\v1\AuthController;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/migrate', function () {
    Artisan::call('migrate');
    return 'Migration run successfully!';
});

Route::get('check-reset-password-link/{token}', [AuthController::class, 'checkResetPasswordLink']);
Route::get('email-verification/{id}', [AuthController::class, 'emailVerification']);