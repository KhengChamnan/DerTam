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
        Schema::table('places', function (Blueprint $table) {
            // Change best_season_to_visit from enum to string to allow flexible text input
            $table->string('best_season_to_visit', 255)->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('places', function (Blueprint $table) {
            // Revert back to enum
            $table->enum('best_season_to_visit', ['Winter', 'Spring', 'Summer', 'Autumn'])->nullable()->change();
        });
    }
};
