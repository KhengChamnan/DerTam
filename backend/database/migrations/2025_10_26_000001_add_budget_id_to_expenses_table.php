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
        Schema::table('expenses_tables', function (Blueprint $table) {
            $table->foreignId('budget_id')->nullable()->constrained('budgets', 'id')->onDelete('cascade')->after('trip_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('expenses_tables', function (Blueprint $table) {
            $table->dropForeignKeyConstraints();
            $table->dropColumn('budget_id');
        });
    }
};
