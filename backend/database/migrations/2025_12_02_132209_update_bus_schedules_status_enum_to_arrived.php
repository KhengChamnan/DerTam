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
        // First, add 'arrived' to the enum while keeping 'completed'
        DB::statement("ALTER TABLE bus_schedules MODIFY COLUMN status ENUM('scheduled', 'departed', 'arrived', 'cancelled', 'completed') NOT NULL DEFAULT 'scheduled'");
        
        // Then update any existing 'completed' status to 'arrived'
        DB::statement("UPDATE bus_schedules SET status = 'arrived' WHERE status = 'completed'");
        
        // Finally, remove 'completed' from the enum
        DB::statement("ALTER TABLE bus_schedules MODIFY COLUMN status ENUM('scheduled', 'departed', 'arrived', 'cancelled') NOT NULL DEFAULT 'scheduled'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert 'arrived' back to 'completed'
        DB::statement("UPDATE bus_schedules SET status = 'completed' WHERE status = 'arrived'");
        
        // Restore the original enum
        DB::statement("ALTER TABLE bus_schedules MODIFY COLUMN status ENUM('scheduled', 'departed', 'cancelled', 'completed') NOT NULL DEFAULT 'scheduled'");
    }
};
