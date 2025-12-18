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
        // Try to drop the old unique constraint (it might have different names)
        try {
            DB::statement('ALTER TABLE rooms DROP INDEX room_number');
        } catch (\Exception $e) {
            // Index doesn't exist or has different name
        }
        
        try {
            DB::statement('ALTER TABLE rooms DROP INDEX rooms_room_number_unique');
        } catch (\Exception $e) {
            // Index doesn't exist or has different name
        }
        
        Schema::table('rooms', function (Blueprint $table) {
            // Add a composite unique constraint on room_number and room_properties_id
            // This ensures room numbers are only unique within the same room type/property
            $table->unique(['room_properties_id', 'room_number'], 'rooms_room_properties_room_number_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rooms', function (Blueprint $table) {
            // Drop the composite unique constraint
            $table->dropUnique('rooms_room_properties_room_number_unique');
            
            // Re-add the old unique constraint on room_number only
            $table->unique('room_number');
        });
    }
};
