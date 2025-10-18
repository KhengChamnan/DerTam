<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('trip_places', function (Blueprint $table) {
            $table->id('trip_place_id');
            $table->foreignId('trip_day_id')->constrained('trip_days', 'trip_day_id')->onDelete('cascade');
            $table->foreignId('place_id')->nullable()->constrained('places', 'placeID')->onDelete('set null');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('trip_places');
    }
};
