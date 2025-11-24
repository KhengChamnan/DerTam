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
        // Drop child tables first (with foreign keys)
        Schema::dropIfExists('booking_bus_seats');
        Schema::dropIfExists('booking_rooms');
        
        // Then drop parent bookings table
        Schema::dropIfExists('bookings');
        
        // Also drop booking_details if it exists
        Schema::dropIfExists('booking_details');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Recreate booking_details table
        Schema::create('booking_details', function (Blueprint $table) {
            $table->increments('booking_id');
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('property_id');
            $table->date('check_in');
            $table->date('check_out');
            $table->integer('total_guests');
            $table->decimal('total_price', 10, 2);
            $table->string('status', 50)->default('pending');
            $table->timestamps();
        });

        // Recreate booking_rooms table
        Schema::create('booking_rooms', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('booking_id');
            $table->unsignedBigInteger('room_id');
            
            $table->foreign('booking_id', 'fk_booking')
                  ->references('booking_id')
                  ->on('booking_details')
                  ->onDelete('cascade');
            
            $table->foreign('room_id', 'fk_room')
                  ->references('room_properties_id')
                  ->on('room_properties');
        });
    }
};
