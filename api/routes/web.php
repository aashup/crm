<?php

use App\Http\Controllers\API\v1\AuthController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('check-reset-password-link/{token}', [AuthController::class, 'checkResetPasswordLink']);
Route::get('email-verification/{id}', [AuthController::class, 'emailVerification']);