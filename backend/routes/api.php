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
use App\Http\Controllers\API\Place\PlaceDetailController;
use App\Http\Controllers\API\EventController as ApiEventController;
use App\Http\Controllers\MediaController;
use App\Http\Controllers\API\Trip\TripController;
use App\Http\Controllers\API\Trip\TripPlaceSelectionController;
use App\Http\Controllers\API\Expense\ExpenseController;
use App\Http\Controllers\API\Hotel\HotelCrudController;
use App\Http\Controllers\API\Hotel\HotelPropertyController;
use App\Http\Controllers\API\Hotel\FacilitiesCrudController;   
use App\Http\Controllers\API\Hotel\PropertyFacilitiesCrudController;
use App\Http\Controllers\API\Hotel\RoomPropertiesCrudController;
use App\Http\Controllers\API\Hotel\AmenitiesCrudController;
use App\Http\Controllers\API\Hotel\RoomAmenitiesCrudController;
use App\Http\Controllers\API\Hotel\RoomController;
use App\Http\Controllers\API\Hotel\RoomSearchController;
use App\Http\Controllers\API\Trip\TripShareController;
use App\Http\Controllers\API\Profile\ProfileController;
use App\Http\Controllers\API\Booking\BookingController;
use App\Http\Controllers\API\Booking\PaymentCallbackController;



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

// Place detail routes (public)
Route::get('places/{placeId}/details', [PlaceDetailController::class, 'show']);  // Get place details with nearby hotels & restaurants

// Public hotel property GET routes
Route::get('hotels/properties', [HotelPropertyController::class, 'index']); // Get all properties with filters
Route::get('hotel-details/{place_id}', [HotelPropertyController::class, 'show']); // Get single property

// room 
Route::get('/rooms/{room_properties_id}', [RoomController::class, 'show']);

// Room search routes (public - no auth required)
Route::post('rooms/search', [RoomSearchController::class, 'searchAvailableRooms']); // Search available rooms
Route::post('rooms/availability-calendar', [RoomSearchController::class, 'getRoomAvailabilityCalendar']); // Get availability calendar


// ABA PayWay payment return/callback routes (must be public - no auth)
Route::prefix('payments/aba')->group(function () {
    Route::post('/return', [PaymentCallbackController::class, 'handleCallback']);
    Route::post('/cancel', [PaymentCallbackController::class, 'handleCancel']);
});

// Protected create endpoint for places (requires Sanctum auth)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('places', [PlaceCreateController::class, 'store']);
    
    // Profile management routes
    Route::controller(ProfileController::class)->group(function() {
        Route::get('profile', 'index');                        // Get authenticated user's profile
        Route::post('profile', 'update');                      // Update authenticated user's profile
        Route::delete('profile', 'destroy');                   // Delete authenticated user's account
        Route::post('profile/change-password', 'changePassword'); // Change password
        Route::post('profile/update-image', 'updateProfileImage'); // Update profile image
        Route::delete('profile/delete-image', 'deleteProfileImage'); // Delete profile image
        Route::get('profile/{id}', 'show');                    // Get specific user's profile by ID
    });
    
   

    // Trip management routes
    Route::controller(TripController::class)->group(function() {
        Route::post('trips', 'store');           // Create a new trip
        Route::get('trips', 'index');            // Get all user trips
        Route::get('trips/{tripId}', 'show');    // Get specific trip with days
        Route::get('trip-days/{tripDayId}/places', 'getTripDayPlaces'); // Get all places for a trip day
        Route::post('trip-days/{tripDayId}/places', 'addPlacesToDay'); // Add places to a trip day
    });

    // Trip place selection routes (for adding places to trips)
    Route::controller(TripPlaceSelectionController::class)->group(function() {
        Route::get('trip-planning/places', 'index');              // Get all places for selection with filters
        Route::get('trip-planning/places/{placeId}', 'show');     // Get specific place details
        Route::post('trip-planning/places/batch', 'getByIds');    // Get multiple places by IDs
        Route::get('trip-planning/places/popular/list', 'popular'); // Get popular places
    });

    // Trip share routes (protected - owner only)
    Route::controller(TripShareController::class)->group(function() {
        Route::get('/trip/share/{token}', 'resolve');                // Resolve share link (view shared trip)
        Route::get('/trip/{trip_id}/share', 'generate');           // Generate share link
        Route::get('/trip/{trip_id}/share/accesses', 'getAccessList'); // Get access list
        Route::delete('/trip/{trip_id}/share', 'deactivateShare');  // Deactivate share link
    });

    // Expense management routes
    Route::controller(ExpenseController::class)->group(function() {
        Route::post('budgets', 'createBudget');                   // Create a new budget for a trip
        Route::get('trips/{tripId}/budget', 'getBudgetDetails');  // Get budget details with expenses
        Route::post('budgets/{budgetId}/expenses', 'addExpense');  // Add expense to budget
        Route::patch('budgets/{budgetId}', 'updateBudget');       // Update budget
        Route::patch('expenses/{expenseId}', 'updateExpense');    // Update expense
        Route::delete('expenses/{expenseId}', 'deleteExpense');   // Delete expense
    });

    // Booking management routes (protected)
    Route::prefix('booking')->group(function () {
        // Create hotel booking with payment
        Route::post('/create', [BookingController::class, 'createHotelBooking']);
        
        // Get user's bookings
        Route::get('/my-bookings', [BookingController::class, 'getMyBookings']);
        
        // Get specific booking details
        Route::get('/{id}', [BookingController::class, 'getBookingDetails']);
        
        // Cancel a booking
        Route::post('/{id}/cancel', [BookingController::class, 'cancelBooking']);
        
        // Get upcoming hotel bookings
        Route::get('/upcoming-hotels', [BookingController::class, 'getUpcomingHotels']);
        
        // Get booking statistics
        Route::get('/statistics', [BookingController::class, 'getStatistics']);
        
        // Payment operations
        Route::get('/payment/status/{transactionId}', [PaymentCallbackController::class, 'checkPaymentStatus']);
        Route::post('/{bookingId}/retry-payment', [PaymentCallbackController::class, 'retryPayment']);
    });
});

Route::get('/upload', function () {
    return view('upload');
});
Route::post('/upload', [MediaController::class, 'upload']);

