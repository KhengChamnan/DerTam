<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\PlaceController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\HotelController;
use App\Http\Controllers\HotelOwnerController;
use App\Http\Controllers\Hotel\RoomController;
use App\Http\Controllers\Hotel\RoomPropertyController;
use App\Http\Controllers\TransportationController;
use App\Http\Controllers\TransportationOwnerController;

Route::get('/', function () {
    //return response()->view('layouts.api-info');
    return redirect()->route('login');
});

// Route::get('/', function () {
//     return Inertia::render('welcome', [
//         'canLogin' => Route::has('login'),
//         'canRegister' => Route::has('register'),
//         'laravelVersion' => Application::VERSION,
//         'phpVersion' => PHP_VERSION,
//     ]);
// });

Route::middleware([
    'auth:sanctum',
    config('jetstream.auth_session'),
    'verified',
    'admin.portal',
    'redirect.hotel.owners',
    'redirect.transportation.owners',
])->group(function () {
    Route::middleware(['auth', 'verified'])->group(function () {
        Route::get('dashboard', function () {
            return Inertia::render('dashboard');
        })->name('dashboard');

        // ============================================
        //  PLACE CRUD
        // ============================================
        Route::prefix('places')->middleware('permission:view places')->group(function(){
            Route::get('/', [PlaceController::class, 'index'])->name('places.index');
            Route::get('/{id}', [PlaceController::class, 'show'])->where('id', '[0-9]+')->name('places.show');
            Route::get('/location/nearby', [PlaceController::class, 'getByLocation'])->name('places.nearby');
            
            Route::middleware(['permission:create places'])->group(function () {
                Route::get('/create', [PlaceController::class, 'create'])->name('places.create');
                Route::post('/', [PlaceController::class, 'store'])->name('places.store');
            });
            
            Route::middleware(['permission:edit places'])->group(function () {
                Route::get('/{id}/edit', [PlaceController::class, 'edit'])->where('id', '[0-9]+')->name('places.edit');
                Route::put('/{id}', [PlaceController::class, 'update'])->name('places.update');
            });
            
            Route::middleware(['permission:import places'])->group(function () {
                Route::post('/import', [PlaceController::class, 'import'])->name('places.import');
                Route::get('/import/template', [PlaceController::class, 'downloadTemplate'])->name('places.import.template');
            });
            
            Route::middleware(['permission:delete places'])->group(function () {
                Route::delete('/{id}', [PlaceController::class, 'destroy'])->where('id', '[0-9]+')->name('places.destroy');
            });
        });

        // ============================================
        //  HOTEL MANAGEMENT
        // ============================================
        Route::prefix('hotels')->name('hotels.')->group(function () {
            Route::get('/', [HotelController::class, 'index'])
                ->middleware('permission:view hotels')
                ->name('index');
            Route::get('/dashboard', [HotelController::class, 'dashboard'])
                ->middleware('permission:view hotel analytics')
                ->name('dashboard');
            Route::get('/create', [HotelController::class, 'create'])
                ->middleware('permission:create hotels')
                ->name('create');
            Route::post('/', [HotelController::class, 'store'])
                ->middleware('permission:create hotels')
                ->name('store');
            Route::get('/{id}', [HotelController::class, 'show'])
                ->where('id', '[0-9]+')
                ->middleware('permission:view hotels')
                ->name('show');
            Route::get('/{id}/edit', [HotelController::class, 'edit'])
                ->where('id', '[0-9]+')
                ->middleware('permission:edit hotels')
                ->name('edit');
            Route::put('/{id}', [HotelController::class, 'update'])
                ->where('id', '[0-9]+')
                ->middleware('permission:edit hotels')
                ->name('update');
            
            Route::delete('/{id}', [HotelController::class, 'destroy'])
                ->where('id', '[0-9]+')
                ->middleware('permission:delete hotels')
                ->name('destroy');
        });

        // ============================================
        //  TRANSPORTATION MANAGEMENT
        // ============================================
        Route::prefix('transportations')->name('transportations.')->group(function () {
            Route::get('/', [TransportationController::class, 'index'])
                ->middleware('permission:view transportations')
                ->name('index');
            Route::get('/create', [TransportationController::class, 'create'])
                ->middleware('permission:create transportations')
                ->name('create');
            Route::post('/', [TransportationController::class, 'store'])
                ->middleware('permission:create transportations')
                ->name('store');
            Route::get('/{id}', [TransportationController::class, 'show'])
                ->where('id', '[0-9]+')
                ->middleware('permission:view transportations')
                ->name('show');
            Route::get('/{id}/edit', [TransportationController::class, 'edit'])
                ->where('id', '[0-9]+')
                ->middleware('permission:edit transportations')
                ->name('edit');
            Route::put('/{id}', [TransportationController::class, 'update'])
                ->where('id', '[0-9]+')
                ->middleware('permission:edit transportations')
                ->name('update');
            Route::delete('/{id}', [TransportationController::class, 'destroy'])
                ->where('id', '[0-9]+')
                ->middleware('permission:delete transportations')
                ->name('destroy');
        });

        // ============================================
        //  USER MANAGEMENT
        // ============================================
        Route::prefix('users')->name('users.')->group(function () {
            Route::get('/', [UserController::class, 'index'])
                ->middleware('permission:view users')
                ->name('index');
            Route::get('/create', [UserController::class, 'create'])
                ->middleware('permission:create users')
                ->name('create');
            Route::post('/', [UserController::class, 'store'])
                ->middleware('permission:create users')
                ->name('store');
            Route::get('/{user}', [UserController::class, 'show'])
                ->middleware('permission:view users')
                ->name('show');
            Route::get('/{user}/edit', [UserController::class, 'edit'])
                ->middleware('permission:edit users')
                ->name('edit');
            Route::put('/{user}', [UserController::class, 'update'])
                ->middleware('permission:edit users')
                ->name('update');
            Route::delete('/{user}', [UserController::class, 'destroy'])
                ->middleware('permission:delete users')
                ->name('destroy');
        });
        Route::post('/users/{user}/assign-hotel', [UserController::class, 'assignHotelOwnership'])
            ->middleware('permission:assign hotel ownership')
            ->name('users.assign-hotel');
            
        // ============================================
        //  HOTEL OWNER MANAGEMENT
        // ============================================
        Route::prefix('hotel-owner')->name('hotel-owner.')->middleware('role:hotel owner')->group(function () {
            Route::get('/dashboard', [HotelOwnerController::class, 'dashboard'])->name('dashboard');
            Route::get('/properties', [HotelOwnerController::class, 'index'])->name('properties.index');
            Route::get('/properties/{id}', [HotelOwnerController::class, 'show'])
                ->middleware('hotel.owner')
                ->name('properties.show');
            Route::get('/rooms', [HotelOwnerController::class, 'allRooms'])->name('rooms.all');
            Route::get('/bookings', [HotelOwnerController::class, 'bookings'])->name('bookings.index');
            
            // Room Property (Room Types) Management
            Route::prefix('properties/{property_id}/room-properties')
                ->name('room-properties.')
                ->middleware('hotel.owner')
                ->group(function () {
                    Route::get('/create', [RoomPropertyController::class, 'create'])->name('create');
                    Route::post('/', [RoomPropertyController::class, 'store'])->name('store');
                    Route::get('/{room_property_id}/edit', [RoomPropertyController::class, 'edit'])->name('edit');
                    Route::put('/{room_property_id}', [RoomPropertyController::class, 'update'])->name('update');
                    Route::delete('/{room_property_id}', [RoomPropertyController::class, 'destroy'])->name('destroy');
                });
            
            // Individual Rooms Management
            Route::prefix('rooms')
                ->name('rooms.')
                ->group(function () {
                    Route::get('/create', [RoomController::class, 'create'])->name('create');
                    Route::post('/', [RoomController::class, 'store'])->name('store');
                    Route::get('/{room_id}/edit', [RoomController::class, 'edit'])->name('edit');
                    Route::put('/{room_id}', [RoomController::class, 'update'])->name('update');
                    Route::delete('/{room_id}', [RoomController::class, 'destroy'])->name('destroy');
                });
        });

        // ============================================
        //  TRANSPORTATION OWNER MANAGEMENT
        // ============================================
        Route::prefix('transportation-owner')->name('transportation-owner.')->middleware('role:transportation owner')->group(function () {
            Route::get('/dashboard', [TransportationOwnerController::class, 'dashboard'])->name('dashboard');
            Route::get('/companies', [TransportationOwnerController::class, 'index'])->name('companies.index');
            Route::get('/companies/{id}', [TransportationOwnerController::class, 'show'])
                ->middleware('transportation.owner')
                ->name('companies.show');
            Route::get('/buses', [TransportationOwnerController::class, 'buses'])->name('buses.index');
            Route::get('/schedules', [TransportationOwnerController::class, 'schedules'])->name('schedules.index');
            Route::get('/bookings', [TransportationOwnerController::class, 'bookings'])->name('bookings.index');
        });

        // ============================================
        //  ROLE MANAGEMENT
        // ============================================
        Route::prefix('roles')->name('roles.')->group(function () {
            Route::get('/', [RoleController::class, 'index'])
                ->middleware('permission:view roles')
                ->name('index');
            Route::get('/create', [RoleController::class, 'create'])
                ->middleware('permission:create roles')
                ->name('create');
            Route::post('/', [RoleController::class, 'store'])
                ->middleware('permission:create roles')
                ->name('store');
            Route::get('/{role}', [RoleController::class, 'show'])
                ->where('role', '[0-9]+')
                ->middleware('permission:view roles')
                ->name('show');
            Route::get('/{role}/edit', [RoleController::class, 'edit'])
                ->where('role', '[0-9]+')
                ->middleware('permission:edit roles')
                ->name('edit');
            Route::put('/{role}', [RoleController::class, 'update'])
                ->where('role', '[0-9]+')
                ->middleware('permission:edit roles')
                ->name('update');
            Route::delete('/{role}', [RoleController::class, 'destroy'])
                ->where('role', '[0-9]+')
                ->middleware('permission:delete roles')
                ->name('destroy');
        });
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';