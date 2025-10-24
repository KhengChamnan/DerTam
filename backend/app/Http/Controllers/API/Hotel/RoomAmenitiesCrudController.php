<?php

namespace App\Http\Controllers\API\Hotel;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Hotel\RoomAmenity;
use Illuminate\Support\Facades\Validator;

class RoomAmenitiesCrudController extends Controller
{
    /**
     * Store new room amenities for a room property.
     */
    public function store(Request $request)
    {
        // Validate incoming request
        $validator = Validator::make($request->all(), [
            'room_properties_id' => 'required|integer',
            'amenities' => 'required|array',
            'amenities.*' => 'integer', // each element in the array must be an integer
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $roomId = $request->room_properties_id;
        $amenityIds = $request->amenities;

        // Loop through amenities and create entries in pivot table
        foreach ($amenityIds as $amenityId) {
            RoomAmenity::updateOrCreate(
                [
                    'room_properties_id' => $roomId,
                    'amenity_id' => $amenityId,
                ],
                [
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }

        return response()->json([
            'message' => 'Room amenities added successfully',
            'data' => [
                'room_properties_id' => $roomId,
                'amenities' => $amenityIds
            ]
        ], 201);
    }
}
