<?php

namespace App\Http\Controllers\API\Hotel;

use App\Http\Controllers\Controller;
use App\Models\Hotel\Amenity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AmenitiesCrudController extends Controller
{
    /**
     * Store a newly created amenity in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'room_properties_id' => 'required|exists:room_properties,room_properties_id',
            'amenity_name' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $amenity = Amenity::create([
                'room_properties_id' => $request->room_properties_id,
                'amenity_name' => $request->amenity_name,
                'is_available' => $request->is_available ?? true,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Amenity created successfully',
                'data' => $amenity
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create amenity',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified amenity from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        try {
            $amenity = Amenity::find($id);

            if (!$amenity) {
                return response()->json([
                    'success' => false,
                    'message' => 'Amenity not found'
                ], 404);
            }

            $amenity->delete();

            return response()->json([
                'success' => true,
                'message' => 'Amenity deleted successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete amenity',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
