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
            // Drop the existing foreign key constraint
            $table->dropForeign(['property_id']);
            
            // Rename the column from property_id to room_properties_id
            $table->renameColumn('property_id', 'room_properties_id');
            
            // Add new foreign key constraint to room_properties table
            $table->foreign('room_properties_id')->references('room_properties_id')->on('room_properties')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('amenities', function (Blueprint $table) {
            // Drop the new foreign key constraint
            $table->dropForeign(['room_properties_id']);
            
            // Rename the column back from room_properties_id to property_id
            $table->renameColumn('room_properties_id', 'property_id');
            
            // Add back the original foreign key constraint to properties table
            $table->foreign('property_id')->references('property_id')->on('properties')->onDelete('cascade');
        });
    }
};
