<?php

namespace App\Http\Controllers\API\Hotel;

use App\Http\Controllers\Controller;
use App\Models\Hotel\RoomProperty;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class RoomController extends Controller
{
    /**
     * Get room details by room_properties_id
     * 
     * @param int $room_properties_id The ID of the room property
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($room_properties_id)
    {
        try {
            $room = RoomProperty::with([
                'property:property_id,place_id',
                'amenities:amenity_id,amenity_name,image_url,image_public_ids'
            ])->where('room_properties_id', $room_properties_id)->first();

            if (!$room) {
                return response()->json([
                    'message' => 'Room not found',
                ], 404);
            }

            // Add available_room count
            $availableCount = DB::table('rooms')
                ->where('room_properties_id', $room->room_properties_id)
                ->where('is_available', 1)
                ->count();
            
            $room->available_room = $availableCount;

            return response()->json([
                'message' => 'Room retrieved successfully',
                'data' => $room,
            ], 200);

        } catch (\Throwable $e) {
            Log::error('Failed to retrieve room details', [
                'room_properties_id' => $room_properties_id,
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'message' => 'Failed to retrieve room details',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
