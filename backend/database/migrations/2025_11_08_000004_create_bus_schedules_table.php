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
        Schema::create('bus_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bus_id')->constrained('buses')->onDelete('cascade');
            $table->foreignId('route_id')->constrained('routes')->onDelete('cascade');
            $table->dateTime('departure_time')->comment('When the bus leaves');
            $table->dateTime('arrival_time')->nullable()->comment('Estimated arrival time');
            $table->decimal('price', 10, 2)->comment('Ticket price');
            $table->integer('available_seats')->nullable()->comment('Cached count for performance');
            $table->enum('status', ['scheduled', 'departed', 'cancelled', 'completed'])
                ->default('scheduled')
                ->comment('Schedule status');
            $table->timestamps();

  
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bus_schedules');
    }
};
