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
        Schema::create('booking_bus_seats', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('booking_id')->comment('Link to universal booking');
            $table->foreignId('schedule_id')->constrained('bus_schedules')->onDelete('cascade')->comment('Which bus trip');
            $table->foreignId('seat_id')->constrained('bus_seats')->onDelete('cascade')->comment('Which seat');
            $table->decimal('price', 10, 2)->nullable()->comment('Price at time of booking');
            $table->timestamps();

            // // Foreign key to booking_details table
            // $table->foreign('booking_id')
            //     ->references('booking_id')
            //     ->on('booking_details')
            //     ->onDelete('cascade');
            // Unique constraint: prevent double booking of the same seat on the same schedule
            $table->unique(['schedule_id', 'seat_id', 'booking_id'], 'unique_seat_booking');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('booking_bus_seats');
    }
};
