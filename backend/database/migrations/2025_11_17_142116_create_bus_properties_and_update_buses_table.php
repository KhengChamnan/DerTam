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
        // Create bus_properties table (similar to room_properties)
        Schema::create('bus_properties', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transportation_id')->constrained('transportations')->onDelete('cascade');
            $table->string('bus_type'); // e.g., VIP, Standard, Sleeper, Luxury
            $table->text('bus_description')->nullable();
            $table->integer('seat_capacity');
            $table->decimal('price_per_seat', 10, 2)->nullable();
            $table->text('features')->nullable(); // JSON or text for amenities/features
            $table->timestamps();
        });

        // Update buses table to reference bus_properties
        Schema::table('buses', function (Blueprint $table) {
            // Add new columns
            $table->foreignId('bus_property_id')->nullable()->after('id')->constrained('bus_properties')->onDelete('cascade');
            $table->boolean('is_available')->default(true)->after('bus_plate');
            $table->string('status')->default('active')->after('is_available'); // active, maintenance, retired
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('buses', function (Blueprint $table) {
            $table->dropForeign(['bus_property_id']);
            $table->dropColumn(['bus_property_id', 'is_available', 'status']);
        });

        Schema::dropIfExists('bus_properties');
    }
};
