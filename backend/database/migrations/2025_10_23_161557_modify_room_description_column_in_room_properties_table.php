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
        Schema::table('room_properties', function (Blueprint $table) {
            // Change room_description from VARCHAR(255) to TEXT to allow longer descriptions
            $table->text('room_description')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('room_properties', function (Blueprint $table) {
            // Revert back to VARCHAR(255)
            $table->string('room_description', 255)->nullable()->change();
        });
    }
};
