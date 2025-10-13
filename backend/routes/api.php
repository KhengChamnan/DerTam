<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\RegisterController;
use App\Http\Controllers\API\ProductController;
use App\Http\Controllers\API\SocialAuthController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


Route::controller(RegisterController::class)->group(function(){
    Route::post('register', 'register');
    Route::post('login', 'login');
});

// Google OAuth routes for mobile apps
Route::controller(SocialAuthController::class)->group(function(){
    Route::post('auth/google', 'googleAuth');
});
         
Route::middleware('auth:sanctum')->group( function () {
    Route::resource('products', ProductController::class);
    
    // Protected social auth routes
    Route::controller(SocialAuthController::class)->group(function(){
        Route::post('auth/logout', 'logout');
    });
});

Route::post(
    '/forgot-password', 
    [App\Http\Controllers\API\ForgotPasswordController::class, 'forgotPassword']
);
Route::post(
    '/verify/pin', 
    [App\Http\Controllers\API\ForgotPasswordController::class, 'verifyPin']
);
Route::post(
    '/reset-password', 
    [App\Http\Controllers\API\ResetPasswordController::class, 'resetPassword']
);