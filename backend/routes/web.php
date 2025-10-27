<?php

use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\PlaceController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\RoleController;

Route::get('/', function () {
    return response()->view('layouts.api-info');
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
    'admin.portal', // Restrict admin portal access to admin/superadmin only
])->group(function () {
    Route::middleware(['auth', 'verified'])->group(function () {
        Route::get('dashboard', function () {
            return Inertia::render('dashboard');
        })->name('dashboard');

        // ============================================
        //  PLACE CRUD
        // ============================================
        Route::prefix('places')->group(function(){
            Route::get('/', [PlaceController::class, 'index'])->name('places.index');
            Route::get('/{id}', [PlaceController::class, 'show'])->where('id', '[0-9]+')->name('places.show');
            Route::get('/location/nearby', [PlaceController::class, 'getByLocation'])->name('places.nearby');
            
            Route::middleware(['role:admin|superadmin'])->group(function () {
                Route::get('/create', [PlaceController::class, 'create'])->name('places.create');
                Route::post('/', [PlaceController::class, 'store'])->name('places.store');
                Route::get('/{id}/edit', [PlaceController::class, 'edit'])->where('id', '[0-9]+')->name('places.edit');
                Route::put('/{id}', [PlaceController::class, 'update'])->name('places.update');
                Route::post('/import', [PlaceController::class, 'import'])->name('places.import');
                Route::get('/import/template', [PlaceController::class, 'downloadTemplate'])->name('places.import.template');
            });
            
            Route::middleware(['role:superadmin'])->group(function () {
                Route::delete('/{id}', [PlaceController::class, 'destroy'])->where('id', '[0-9]+')->name('places.destroy');
            });
        });

        // ============================================
        //  USER MANAGEMENT (Admin and SuperAdmin only)
        // ============================================
        Route::middleware(['role:admin|superadmin'])->group(function () {
            Route::resource('users', UserController::class);
            
            // Role management routes with permission checks
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
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';