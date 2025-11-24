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
        Schema::table('buses', function (Blueprint $table) {
            // Add bus_property_id foreign key if it doesn't exist
            if (!Schema::hasColumn('buses', 'bus_property_id')) {
                $table->foreignId('bus_property_id')
                    ->after('id')
                    ->constrained('bus_properties')
                    ->onDelete('cascade');
            }

            // Add description field
            if (!Schema::hasColumn('buses', 'description')) {
                $table->text('description')->nullable()->after('bus_plate');
            }

            // Add is_available field if it doesn't exist
            if (!Schema::hasColumn('buses', 'is_available')) {
                $table->boolean('is_available')->default(true)->after('description');
            }

            // Add status field if it doesn't exist
            if (!Schema::hasColumn('buses', 'status')) {
                $table->string('status')->default('active')->after('is_available');
            }

            // Remove seat_capacity if it exists (moved to bus_property)
            if (Schema::hasColumn('buses', 'seat_capacity')) {
                $table->dropColumn('seat_capacity');
            }

            // Make bus_plate unique
            if (!Schema::hasColumn('buses', 'bus_plate')) {
                $table->string('bus_plate')->unique()->after('bus_name');
            } else {
                // Update existing column to be unique
                $table->string('bus_plate')->unique()->change();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('buses', function (Blueprint $table) {
            if (Schema::hasColumn('buses', 'bus_property_id')) {
                $table->dropForeign(['bus_property_id']);
                $table->dropColumn('bus_property_id');
            }
            
            if (Schema::hasColumn('buses', 'description')) {
                $table->dropColumn('description');
            }
            
            if (Schema::hasColumn('buses', 'is_available')) {
                $table->dropColumn('is_available');
            }
            
            if (Schema::hasColumn('buses', 'status')) {
                $table->dropColumn('status');
            }
            
            // Restore seat_capacity
            $table->integer('seat_capacity')->after('bus_plate');
        });
    }
};
