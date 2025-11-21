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
        Schema::table('bus_seats', function (Blueprint $table) {
            // Add seat_type column
            if (!Schema::hasColumn('bus_seats', 'seat_type')) {
                $table->string('seat_type')->default('standard')->after('seat_number');
            }
            
            // Add level column for sleeper buses
            if (!Schema::hasColumn('bus_seats', 'level')) {
                $table->string('level')->nullable()->after('seat_type');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bus_seats', function (Blueprint $table) {
            if (Schema::hasColumn('bus_seats', 'seat_type')) {
                $table->dropColumn('seat_type');
            }
            
            if (Schema::hasColumn('bus_seats', 'level')) {
                $table->dropColumn('level');
            }
        });
    }
};
