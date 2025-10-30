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
        Schema::create('rooms', function (Blueprint $table) {
            $table->id('room_id');
            $table->unsignedBigInteger('room_properties_id');
            $table->string('room_number')->unique(); // e.g., "101", "102", "A-203"
            $table->boolean('is_available')->default(true);
            $table->enum('status', ['available', 'occupied', 'maintenance', 'cleaning'])->default('available');
            $table->text('notes')->nullable(); // Special notes for this specific room
            $table->timestamps();

            $table->foreign('room_properties_id')
                  ->references('room_properties_id')
                  ->on('room_properties')
                  ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rooms');
    }
};
