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
        // Create transportations table (companies)
        Schema::create('transportations', function (Blueprint $table) {
            $table->id();
            $table->string('company_name', 255);
            $table->text('company_description')->nullable();
            $table->string('company_logo')->nullable();
            $table->string('contact_phone', 50)->nullable();
            $table->string('contact_email', 255)->nullable();
            $table->foreignId('owner_user_id')->constrained('users', 'id')->onDelete('cascade');
            $table->timestamps();
        });

        // Add transportation_id to buses table
        Schema::table('buses', function (Blueprint $table) {
            $table->foreignId('transportation_id')
                ->after('seat_capacity')
                ->nullable()
                ->constrained('transportations', 'id')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('buses', function (Blueprint $table) {
            $table->dropForeign(['transportation_id']);
            $table->dropColumn('transportation_id');
        });

        Schema::dropIfExists('transportations');
    }
};
