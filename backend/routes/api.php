<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\RegisterController;
use App\Http\Controllers\API\ProductController;
use App\Http\Controllers\API\SocialAuthController;
use App\Http\Controllers\API\Place\PlaceBrowseController;
use App\Http\Controllers\API\Place\RecommendationController;
use App\Http\Controllers\API\Place\PlaceCategoryController;
use App\Http\Controllers\API\Place\PlaceCreateController;
use App\Http\Controllers\API\EventController as ApiEventController;
use App\Http\Controllers\MediaController;


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

// Public browse endpoints for mobile home
Route::controller(PlaceBrowseController::class)->group(function(){
    Route::get('places/search', 'search');
    Route::get('places/by-category', 'byCategory');
});
Route::get('place-categories', [PlaceCategoryController::class, 'index']);
Route::get('places/recommended', [RecommendationController::class, 'index']);
Route::get('events/upcoming', [ApiEventController::class, 'upcoming']);

// Protected create endpoint for places (requires Sanctum auth)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('places', [PlaceCreateController::class, 'store']);
});

Route::get('/upload', function () {
    return view('upload');
});
Route::post('/upload', [MediaController::class, 'upload']);
