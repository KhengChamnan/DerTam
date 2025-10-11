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
        Schema::create('places', function (Blueprint $table) {
            $table->id('placeID');
            $table->string('name', 255)->nullable();
            $table->text('description')->nullable();
            $table->unsignedBigInteger('category_id')->nullable();
            $table->string('google_maps_link', 500)->nullable(); // Google Maps link
            $table->decimal('ratings', 3, 2)->nullable();
            $table->integer('reviews_count')->nullable();
            $table->json('images_url')->nullable();
            $table->boolean('entry_free')->nullable();
            $table->json('operating_hours')->nullable();
            $table->enum('best_season_to_visit', ['Winter', 'Spring', 'Summer', 'Autumn'])->nullable();
            $table->unsignedBigInteger('province_id')->nullable();
            $table->timestamps();
            // Foreign key constraints
            $table->foreign('category_id')->references('placeCategoryID')->on('place_categories')->onDelete('set null');
            $table->foreign('province_id')->references('province_categoryID')->on('province_categories')->onDelete('set null');
            
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('places');
    }
};
