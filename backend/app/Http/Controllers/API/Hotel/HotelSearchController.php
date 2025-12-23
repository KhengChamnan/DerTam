<?php

namespace App\Http\Controllers\API\Hotel;

use App\Http\Controllers\Controller;
use App\Models\Place;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class HotelSearchController extends Controller
{
    /**
     * Search for hotels by province
     * Returns hotels in the specified province
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function searchHotels(Request $request)
    {
        // Validate input
        $validator = Validator::make($request->all(), [
            'province_id' => 'required|integer',
        ]);

        // Custom validation: if province_id is not 0, it must exist in province_categories
        if ($request->province_id != 0) {
            $validator->after(function ($validator) use ($request) {
                if (!DB::table('province_categories')->where('province_categoryID', $request->province_id)->exists()) {
                    $validator->errors()->add('province_id', 'The selected province_id is invalid.');
                }
            });
        }

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $provinceId = $request->province_id;

        try {
            // Get hotels (category_id = 3)
            $query = Place::with(['category', 'province'])
                ->where('category_id', 3); // Hotel category

            // Filter by province only if province_id is not 0
            if ($provinceId != 0) {
                $query->where('province_id', $provinceId);
            }

            $hotels = $query->orderBy('ratings', 'desc')->get();

            // Transform the results to match the expected format
            $results = $hotels->map(function($place) {
                return [
                    'placeID' => $place->placeID,
                    'name' => $place->name,
                    'description' => $place->description,
                    'category_name' => $place->category?->category_name,
                    'google_maps_link' => $place->google_maps_link,
                    'ratings' => $place->ratings,
                    'reviews_count' => $place->reviews_count,
                    'images_url' => $place->images_url ?? [],
                    'entry_free' => $place->entry_free,
                    'operating_hours' => $place->operating_hours,
                    'province_categoryName' => $place->province?->province_categoryName,
                    'latitude' => $place->latitude,
                    'longitude' => $place->longitude,
                ];
            })->values();

            return response()->json([
                'success' => true,
                'message' => 'Hotels retrieved successfully',
                'data' => [
                    'search_params' => [
                        'province_id' => $provinceId,
                        'province_name' => $provinceId == 0 ? 'All Provinces' : $hotels->first()?->province?->province_categoryName,
                    ],
                    'total_results' => $results->count(),
                    'hotels' => $results,
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to search hotels',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
