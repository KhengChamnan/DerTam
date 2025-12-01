<?php

namespace App\Http\Controllers\API\Hotel;

use App\Http\Controllers\Controller;
use App\Models\Place;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
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
            'province_id' => 'required|exists:province_categories,province_categoryID',
            'check_in' => 'required|date|after_or_equal:today',
            'check_out' => 'required|date|after:check_in',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $provinceId = $request->province_id;
        $checkIn = Carbon::parse($request->check_in)->startOfDay();
        $checkOut = Carbon::parse($request->check_out)->startOfDay();
        $nights = $checkIn->diffInDays($checkOut);

        try {
            // Get hotels (category_id = 3) in the specified province
            $hotels = Place::with(['category', 'province'])
                ->where('category_id', 3) // Hotel category
                ->where('province_id', $provinceId)
                ->orderBy('ratings', 'desc')
                ->get();

            // Transform the results to match the expected format
            $results = $hotels->map(function($place) use ($nights) {
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
                        'province_name' => $hotels->first()?->province?->province_categoryName,
                        'check_in' => $checkIn->toDateString(),
                        'check_out' => $checkOut->toDateString(),
                        'nights' => $nights,
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
