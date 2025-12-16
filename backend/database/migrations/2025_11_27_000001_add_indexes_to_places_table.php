<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('places', function (Blueprint $table) {
            // Add indexes for frequently queried columns
            $table->index('category_id', 'idx_places_category_id');
            $table->index('province_id', 'idx_places_province_id');
            $table->index(['category_id', 'province_id'], 'idx_places_category_province');
            $table->index('entry_free', 'idx_places_entry_free');
            $table->index('ratings', 'idx_places_ratings');
        });

        // Add full-text index for name and description (MySQL only)
        DB::statement('ALTER TABLE places ADD FULLTEXT INDEX idx_places_search (name, description)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('places', function (Blueprint $table) {
            // Drop regular indexes
            $table->dropIndex('idx_places_category_id');
            $table->dropIndex('idx_places_province_id');
            $table->dropIndex('idx_places_category_province');
            $table->dropIndex('idx_places_entry_free');
            $table->dropIndex('idx_places_ratings');
        });

        // Drop full-text index
        DB::statement('ALTER TABLE places DROP INDEX idx_places_search');
    }
};
