<?php

namespace App\Http\Controllers\API\Hotel;

use App\Http\Controllers\Controller;
use App\Models\Hotel\Property;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class HotelPropertyController extends Controller
{
    /**
     * Get all properties with optional filters.
     * 
     * Query Parameters:
     * - province_category_id: Filter by province
     * - max_guests: Filter by minimum max_guests in room properties
     * - min_price: Filter by minimum price_per_night
     * - max_price: Filter by maximum price_per_night
     * - rating: Filter by minimum rating
     * - page: Page number for pagination
     * - per_page: Number of items per page (default: 15)
     */
    public function index(Request $request)
    {
        try {
            $query = Property::with([
                'provinceCategory:province_categoryID,province_categoryName',
                'facilities:facility_id,property_id,facility_name',
                'roomProperties:room_properties_id,property_id,room_type,max_guests,room_size,price_per_night,is_available,images_url',
                'roomProperties.amenities:amenity_id,room_properties_id,amenity_name,is_available'
            ]);

            // Filter by province
            if ($request->has('province_category_id')) {
                $query->where('province_category_id', $request->province_category_id);
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

            // Filter by minimum rating
            if ($request->has('rating')) {
                $query->where('rating', '>=', $request->rating);
            }

            // Pagination
            $perPage = $request->get('per_page', 15);
            $properties = $query->orderBy('rating', 'desc')
                                ->orderBy('created_at', 'desc')
                                ->paginate($perPage);

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
     * Get a single property by ID with all related data.
     */
    public function show($property_id)
    {
        try {
            $property = Property::with([
                'ownerUser:id,name,email',
                'provinceCategory:province_categoryID,province_categoryName',
                'facilities:facility_id,property_id,facility_name',
                'roomProperties:room_properties_id,property_id,room_type,room_description,max_guests,room_size,price_per_night,is_available,images_url',
                'roomProperties.amenities:amenity_id,room_properties_id,amenity_name,is_available'
            ])->find($property_id);

            if (!$property) {
                return response()->json([
                    'message' => 'Property not found',
                ], 404);
            }

            return response()->json([
                'message' => 'Property retrieved successfully',
                'data' => $property,
            ], 200);

        } catch (\Throwable $e) {
            Log::error('Failed to retrieve property', [
                'property_id' => $property_id,
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
