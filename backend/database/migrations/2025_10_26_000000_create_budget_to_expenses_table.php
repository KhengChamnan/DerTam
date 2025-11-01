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

        if(!Schema::hasTable('budgets')) {  
        Schema::create('budgets', function (Blueprint $table) {
            $table->id();
            $table->decimal('total_budget', 10, 2);
            $table->foreignId('trip_id')->constrained('trips', 'trip_id')->onDelete('cascade');
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('budgets');
    }
};
