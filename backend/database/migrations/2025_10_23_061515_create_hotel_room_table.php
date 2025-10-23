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
        Schema::create('room_properties', function (Blueprint $table) {
            $table->id('room_properties_id');
            $table->foreignId('property_id')->constrained('properties', 'property_id')->onDelete('cascade');
            $table->string('room_type', 100);
            $table->string('room_description', 255)->nullable();
            $table->integer('max_guests')->default(2);
            $table->string('room_size', 50)->nullable();
            $table->integer('price_per_night')->default(0);
            $table->boolean('is_available')->default(true)->nullable();
            $table->json('images_url')->nullable();
            $table->json('image_public_ids')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('room_properties');
    }
};
