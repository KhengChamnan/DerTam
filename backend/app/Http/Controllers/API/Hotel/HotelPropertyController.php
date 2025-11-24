<?php

namespace App\Http\Controllers\API\Hotel;

use App\Http\Controllers\Controller;
use App\Models\Hotel\Property;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class HotelPropertyController extends Controller
{
    /**
     * Get all properties with optional filters.
     * 
     * Query Parameters:
     * - province_category_id: Filter by province (through place relationship)
     * - max_guests: Filter by minimum max_guests in room properties
     * - min_price: Filter by minimum price_per_night
     * - max_price: Filter by maximum price_per_night
     * - rating: Filter by minimum rating (from place ratings)
     * - page: Page number for pagination
     * - per_page: Number of items per page (default: 15)
     */
    public function index(Request $request)
    {
        try {
            $query = Property::with([
                'place:placeID,name,description,google_maps_link,ratings,reviews_count,images_url,entry_free,operating_hours,latitude,longitude,province_id',
                'place.provinceCategory:province_categoryID,province_categoryName,category_description',
                'facilities:facility_id,facility_name,image_url,image_public_ids',
                'roomProperties:room_properties_id,property_id,room_type,room_description,max_guests,room_size,price_per_night,images_url,image_public_ids',
                'roomProperties.amenities:amenity_id,amenity_name,image_url,image_public_ids'
            ]);

            // Filter by province (through place relationship)
            if ($request->has('province_category_id')) {
                $query->whereHas('place', function ($q) use ($request) {
                    $q->where('province_id', $request->province_category_id);
                });
            }

            // Filter by max_guests (properties that have at least one room with max_guests >= requested value)
            if ($request->has('max_guests')) {
                $query->whereHas('roomProperties', function ($q) use ($request) {
                    $q->where('max_guests', '>=', $request->max_guests)
                      ->where('is_available', true);
                });
            }

            // Filter by minimum price
            if ($request->has('min_price')) {
                $query->whereHas('roomProperties', function ($q) use ($request) {
                    $q->where('price_per_night', '>=', $request->min_price)
                      ->where('is_available', true);
                });
            }

            // Filter by maximum price
            if ($request->has('max_price')) {
                $query->whereHas('roomProperties', function ($q) use ($request) {
                    $q->where('price_per_night', '<=', $request->max_price)
                      ->where('is_available', true);
                });
            }

            // Filter by minimum rating (from place ratings)
            if ($request->has('rating')) {
                $query->whereHas('place', function ($q) use ($request) {
                    $q->where('ratings', '>=', $request->rating);
                });
            }

            // Pagination
            $perPage = $request->get('per_page', 15);
            $properties = $query->orderByDesc('created_at')
                                ->paginate($perPage);

            // Sort by place rating if available
            if (!$request->has('rating')) {
                $properties->getCollection()->transform(function ($property) {
                    return $property;
                })->sortByDesc(function ($property) {
                    return $property->place->ratings ?? 0;
                });
            }

            return response()->json([
                'message' => 'Properties retrieved successfully',
                'data' => $properties->items(),
                'pagination' => [
                    'current_page' => $properties->currentPage(),
                    'last_page' => $properties->lastPage(),
                    'per_page' => $properties->perPage(),
                    'total' => $properties->total(),
                    'from' => $properties->firstItem(),
                    'to' => $properties->lastItem(),
                ],
            ], 200);

        } catch (\Throwable $e) {
            Log::error('Failed to retrieve properties', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'message' => 'Failed to retrieve properties',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get a single property by place ID with all related data.
     */
    public function show($place_id)
    {
        try {
            $property = Property::with([
                'ownerUser:id,name,email',
                'place:placeID,name,description,google_maps_link,ratings,reviews_count,images_url,entry_free,operating_hours,latitude,longitude,province_id,category_id',
                'place.provinceCategory:province_categoryID,province_categoryName,category_description',
                'place.category:placeCategoryID,category_name,category_description',
                'facilities:facility_id,facility_name,image_url,image_public_ids',
                'roomProperties:room_properties_id,property_id,room_type,room_description,max_guests,room_size,price_per_night,images_url,image_public_ids',
                'roomProperties.amenities:amenity_id,amenity_name,image_url,image_public_ids'
            ])->where('place_id', $place_id)->first();

            if (!$property) {
                return response()->json([
                    'message' => 'Property not found',
                ], 404);
            }

            // Add available_room count for each room property
            if ($property->roomProperties) {
                foreach ($property->roomProperties as $roomProperty) {
                    $availableCount = DB::table('rooms')
                        ->where('room_properties_id', $roomProperty->room_properties_id)
                        ->where('is_available', 1)
                        ->count();
                    
                    $roomProperty->available_room = $availableCount;
                }
            }

            return response()->json([
                'message' => 'Property retrieved successfully',
                'data' => $property,
            ], 200);

        } catch (\Throwable $e) {
            Log::error('Failed to retrieve property', [
                'place_id' => $place_id,
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'message' => 'Failed to retrieve property',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
