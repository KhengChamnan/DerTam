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
        Schema::create('expenses_tables', function (Blueprint $table) {
            $table->id();
            $table->string('name'); 
            $table->decimal('amount', 10, 2);
            $table->foreignId('trip_id')->constrained('trips', 'trip_id')->onDelete('cascade');
            $table->date('date');
            $table->string('description')->nullable();
            $table->foreignId('category_id')->constrained('expense_categories', 'id')->onDelete('cascade');
            $table->timestamps();
        });
     
    }
    
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('expenses_tables');
        Schema::dropIfExists('expense_categories');
    }
};
