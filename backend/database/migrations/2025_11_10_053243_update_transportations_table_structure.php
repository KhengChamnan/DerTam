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
        Schema::table('transportations', function (Blueprint $table) {
            // Add placeID column to link to places table
            $table->unsignedBigInteger('placeID')->after('owner_user_id');
            $table->foreign('placeID')->references('placeID')->on('places')->onDelete('cascade');
            $table->unique('placeID'); // Each place can only have one transportation company
            
            // Drop the old columns that are now stored in the Place model
            $table->dropColumn([
                'company_name',
                'company_description',
                'company_logo',
                'contact_phone',
                'contact_email',
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transportations', function (Blueprint $table) {
            // Re-add the columns
            $table->string('company_name');
            $table->text('company_description')->nullable();
            $table->string('company_logo')->nullable();
            $table->string('contact_phone', 20);
            $table->string('contact_email');
            
            // Drop placeID
            $table->dropForeign(['placeID']);
            $table->dropUnique(['placeID']);
            $table->dropColumn('placeID');
        });
    }
};
