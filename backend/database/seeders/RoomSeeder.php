<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Hotel\Room;
use App\Models\Hotel\RoomProperty;

class RoomSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all room properties
        $roomProperties = RoomProperty::all();

        if ($roomProperties->isEmpty()) {
            $this->command->warn('No room properties found. Please seed room properties first.');
            return;
        }

        $statuses = ['available', 'occupied', 'maintenance', 'cleaning'];
        $globalRoomCounter = 100; // Start from 100 to avoid conflicts

        foreach ($roomProperties as $index => $roomProperty) {
            // Create 5-10 rooms per room property
            $roomCount = rand(5, 10);
            
            // Use property index to create unique room numbers
            $propertyPrefix = chr(65 + ($index % 26)); // A, B, C, etc.
            
            for ($i = 1; $i <= $roomCount; $i++) {
                // Create unique room number: A-101, A-102, B-101, B-102, etc.
                $roomNumber = $propertyPrefix . '-' . $globalRoomCounter++;
                
                $status = $statuses[array_rand($statuses)];
                $isAvailable = $status === 'available' && rand(0, 1) === 1;

                Room::create([
                    'room_properties_id' => $roomProperty->room_properties_id,
                    'room_number' => $roomNumber,
                    'is_available' => $isAvailable,
                    'status' => $status,
                    'notes' => rand(0, 3) === 0 ? 'Special room with ' . ['ocean view', 'garden view', 'city view', 'mountain view'][array_rand(['ocean view', 'garden view', 'city view', 'mountain view'])] : null,
                ]);
            }
        }

        $this->command->info('Rooms seeded successfully!');
    }
}
