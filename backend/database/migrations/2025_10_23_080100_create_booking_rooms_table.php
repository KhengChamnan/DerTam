<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('booking_rooms', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('booking_id');
            $table->unsignedBigInteger('room_id');
            // Foreign key constraints
            $table->foreign('booking_id', 'fk_booking')
                  ->references('booking_id')
                  ->on('booking_details')
                  ->onDelete('cascade');

            $table->foreign('room_id', 'fk_room')
                  ->references('room_properties_id')
                  ->on('room_properties');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('booking_rooms');
    }
};
