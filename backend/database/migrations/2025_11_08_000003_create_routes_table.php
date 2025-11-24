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
        Schema::create('routes', function (Blueprint $table) {
            $table->id();
            $table->string('from_location')->comment('Starting point');
            $table->string('to_location')->comment('Destination location');
            $table->decimal('distance_km', 8, 2)->nullable()->comment('Distance in kilometers');
            $table->decimal('duration_hours', 4, 2)->nullable()->comment('Estimated duration in hours');
            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('routes');
    }
};
