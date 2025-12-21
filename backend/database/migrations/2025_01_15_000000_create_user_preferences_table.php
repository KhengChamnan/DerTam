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
        Schema::create('user_preferences', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->unique();
            $table->json('subcategories')->nullable(); // Array of subcategory IDs: ["temples", "museums"]
            $table->decimal('min_rating', 3, 1)->default(0.0); // Minimum rating preference (0.0-5.0)
            $table->string('popularity_preference', 20)->default('balanced'); // 'popular', 'hidden_gems', or 'balanced'
            $table->json('province_ids')->nullable(); // Array of province IDs: [1, 2, 3]
            $table->timestamp('completed_at')->nullable(); // When onboarding was completed
            $table->timestamps();

            // Foreign key constraint
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            
            // Indexes
            $table->index(columns: 'completed_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_preferences');
    }
};

