<?php

use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\PlaceController;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::middleware([
    'auth:sanctum',
    config('jetstream.auth_session'),
    'verified',
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
            Route::get('/create', [PlaceController::class, 'create'])->name('places.create');
            Route::post('/', [PlaceController::class, 'store'])->name('places.store');
            Route::get('/{id}', [PlaceController::class, 'show'])->name('places.show');
            Route::get('/{id}/edit', [PlaceController::class, 'edit'])->name('places.edit');
            Route::put('/{id}', [PlaceController::class, 'update'])->name('places.update');
            Route::delete('/{id}', [PlaceController::class, 'destroy'])->name('places.destroy');
            Route::get('/location/nearby', [PlaceController::class, 'getByLocation'])->name('places.nearby');
        });
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';