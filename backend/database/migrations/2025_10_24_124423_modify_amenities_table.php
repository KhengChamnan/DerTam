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
        Schema::table('amenities', function (Blueprint $table) {
            // Drop foreign key and room_properties_id column (amenities is now a master list)
            $table->dropForeign(['room_properties_id']);
            $table->dropColumn('room_properties_id');
            // Drop is_available column
            $table->dropColumn('is_available');
            
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('amenities', function (Blueprint $table) {
            // Restore property_id and foreign key
            $table->foreignId('property_id')->after('amenity_id')->constrained('properties', 'property_id')->onDelete('cascade');
            
            // Restore is_available column
            $table->boolean('is_available')->default(true)->nullable()->after('amenity_name');

        });
    }
};
