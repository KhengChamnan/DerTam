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
        Schema::table('routes', function (Blueprint $table) {
            // Modify from_location to be a foreign key
            $table->unsignedBigInteger('from_location')->change();
            $table->foreign('from_location')
                ->references('province_categoryID')
                ->on('province_categories')
                ->onDelete('cascade');
            
            // Modify to_location to be a foreign key
            $table->unsignedBigInteger('to_location')->change();
            $table->foreign('to_location')
                ->references('province_categoryID')
                ->on('province_categories')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('routes', function (Blueprint $table) {
            // Drop foreign key constraints
            $table->dropForeign(['from_location']);
            $table->dropForeign(['to_location']);
            
            // Change back to string columns
            $table->string('from_location')->change();
            $table->string('to_location')->change();
        });
    }
};
