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
            $table->string('column_label', 10)->nullable()->after('seat_number');
            $table->integer('row')->nullable()->after('column_label');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bus_seats', function (Blueprint $table) {
            $table->dropColumn(['column_label', 'row']);
        });
    }
};
