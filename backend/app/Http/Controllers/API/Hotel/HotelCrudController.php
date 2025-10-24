<?php

namespace App\Http\Controllers\API\Hotel;

use App\Http\Controllers\Controller;
use App\Models\Hotel\Property;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class HotelCrudController extends Controller
{
    /**
     * Create a new Property (Hotel) via API (Postman/mobile client).
     * Links a hotel to an existing place.
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'owner_user_id' => 'required|exists:users,id',
                'place_id' => 'required|exists:places,placeID',
            ]);

            // Create the property with just the owner and place link
            $property = Property::create($validated);

            // Load the place relationship to return complete data
            $property->load('place');

            return response()->json([
                'message' => 'Property created successfully',
                'data' => [
                    'property_id' => $property->property_id,
                    'owner_user_id' => $property->owner_user_id,
                    'place_id' => $property->place_id,
                    'place' => $property->place ? [
                        'placeID' => $property->place->placeID,
                        'name' => $property->place->name,
                        'google_maps_link' => $property->place->google_maps_link,
                        'latitude' => $property->place->latitude,
                        'longitude' => $property->place->longitude,
                        'province_id' => $property->place->province_id,
                        'description' => $property->place->description,
                        'ratings' => $property->place->ratings,
                        'reviews_count' => $property->place->reviews_count,
                        'images_url' => $property->place->images_url,
                        'category_id' => $property->place->category_id,
                        'entry_free' => $property->place->entry_free,
                        'operating_hours' => $property->place->operating_hours,
                        'best_season_to_visit' => $property->place->best_season_to_visit,
                    ] : null,
                ],
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Throwable $e) {
            // Log the full error for debugging
            Log::error('Property creation failed', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([   
                'message' => 'Failed to create property',
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ], 500);
        }
    }

    /**
     * Delete a Property (Hotel).
     * Note: Images are associated with the Place, not the Property, so they are not deleted here.
     */
    public function destroy($property_id)
    {
        try {
            // Find the property
            $property = Property::find($property_id);

            if (!$property) {
                return response()->json([
                    'message' => 'Property not found',
                ], 404);
            }

            // Delete the property (cascade will handle related records like facilities, rooms, etc.)
            $property->delete();

            return response()->json([
                'message' => 'Property deleted successfully',
            ], 200);

        } catch (\Throwable $e) {
            Log::error('Property deletion failed', [
                'property_id' => $property_id,
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'message' => 'Failed to delete property',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
