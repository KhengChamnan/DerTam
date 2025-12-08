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
        Schema::table('booking_items', function (Blueprint $table) {
            // Add room_id to assign specific room to hotel booking
            // item_id stores room_properties_id (room type), room_id stores actual room assignment
            $table->unsignedBigInteger('room_id')->nullable()->after('item_id');
            
            $table->foreign('room_id')
                  ->references('room_id')
                  ->on('rooms')
                  ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('booking_items', function (Blueprint $table) {
            $table->dropForeign(['room_id']);
            $table->dropColumn('room_id');
        });
    }
};
