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
        Schema::table('booking_rooms', function (Blueprint $table) {
            $table->date('check_in')->after('room_id');
            $table->date('check_out')->after('check_in');
            $table->decimal('price_per_night', 10, 2)->after('check_out')->comment('Price per night at time of booking');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('booking_rooms', function (Blueprint $table) {
            $table->dropColumn(['check_in', 'check_out', 'price_per_night']);
        });
    }
};
