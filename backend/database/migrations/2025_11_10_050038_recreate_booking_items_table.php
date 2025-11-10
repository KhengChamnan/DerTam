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
        // Drop dependent tables first (foreign key constraints)
        Schema::dropIfExists('booking_hotel_details');
        Schema::dropIfExists('booking_items');
        
        // Recreate booking_items table
        Schema::create('booking_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained('bookings')->onDelete('cascade');
            $table->enum('item_type', ['hotel_room', 'bus_seat', 'tour', 'restaurant']);
            $table->unsignedBigInteger('item_id'); // References room_id, bus_seat_id, etc.
            $table->integer('quantity')->default(1);
            $table->decimal('unit_price', 10, 2);
            $table->decimal('total_price', 10, 2);
            $table->timestamps();
        });
        
        // Recreate booking_hotel_details table
        Schema::create('booking_hotel_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_item_id')->constrained('booking_items')->onDelete('cascade');
            $table->date('check_in');
            $table->date('check_out');
            $table->integer('nights');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop in reverse order
        Schema::dropIfExists('booking_hotel_details');
        Schema::dropIfExists('booking_items');
        
        // Recreate original tables
        Schema::create('booking_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained('bookings')->onDelete('cascade');
            $table->enum('item_type', ['hotel_room', 'bus_seat', 'tour', 'restaurant']);
            $table->unsignedBigInteger('item_id');
            $table->integer('quantity')->default(1);
            $table->decimal('unit_price', 10, 2);
            $table->decimal('total_price', 10, 2);
            $table->timestamps();
        });
        
        Schema::create('booking_hotel_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_item_id')->constrained('booking_items')->onDelete('cascade');
            $table->date('check_in');
            $table->date('check_out');
            $table->integer('nights');
            $table->timestamps();
        });
    }
};
