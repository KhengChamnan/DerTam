<?php

namespace App\Http\Controllers\API\Place;

use App\Http\Controllers\Controller;
use App\Models\Place;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class PlaceDetailController extends Controller
{
    /**
     * Get detailed information about a specific place with nearby hotels and restaurants
     * Returns organized data: place details, images, nearby hotels, nearby restaurants
     *
     * @param int $placeId
     * @return JsonResponse
     */
    public function show(int $placeId): JsonResponse
    {
        try {
            // Get the main place details with relationships
            $place = Place::with(['category', 'province'])
                ->find($placeId);

            if (!$place) {
                return response()->json([
                    'success' => false,
                    'message' => 'Place not found'
                ], 404);
            }

            // Prepare place detail data
            $placeDetail = [
                'placeID' => $place->placeID,
                'name' => $place->name,
                'description' => $place->description,
                'category_name' => $place->category?->category_name,
                'category_description' => $place->category?->category_description,
                'google_maps_link' => $place->google_maps_link,
                'ratings' => $place->ratings,
                'reviews_count' => $place->reviews_count,
                'entry_free' => $place->entry_free,
                'operating_hours' => $place->operating_hours,
                'best_season_to_visit' => $place->best_season_to_visit,
                'province_categoryName' => $place->province?->province_categoryName,
                'province_description' => $place->province?->category_description,
                'latitude' => $place->latitude,
                'longitude' => $place->longitude,
                'created_at' => $place->created_at,
                'updated_at' => $place->updated_at
            ];

            // Get nearby places/attractions (category_id = 1)
            $nearbyPlaces = $this->getNearbyPlaces(
                $place,
                1, // Tourist Attraction category ID
                5, // Limit to 5 results
                10 // Within 10 km radius
            );

            // Get nearby restaurants (category_id = 2)
            $nearbyRestaurants = $this->getNearbyPlaces(
                $place,
                2, // Restaurant category ID
                5, // Limit to 5 results
                10 // Within 10 km radius
            );

            // Get nearby hotels (category_id = 3)
            $nearbyHotels = $this->getNearbyPlaces(
                $place,
                3, // Hotel category ID
                5, // Limit to 5 results
                10 // Within 10 km radius
            );

            return response()->json([
                'success' => true,
                'data' => [
                    'placeDetail' => $placeDetail,
                    'listOfImageUrl' => $place->images_url ?? [],
                    'nearbyPlace' => $nearbyPlaces,
                    'hotelNearby' => $nearbyHotels,
                    'restaurantNearby' => $nearbyRestaurants
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch place details',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get nearby places based on a place object using Haversine formula
     * Automatically excludes the current place from results
     *
     * @param Place $currentPlace The place to search around
     * @param int $categoryId Category of places to search for
     * @param int $limit Maximum number of results
     * @param float $radiusKm Search radius in kilometers
     * @return array
     */
    private function getNearbyPlaces(Place $currentPlace, int $categoryId, int $limit = 5, float $radiusKm = 10): array
    {
        // If coordinates are null, return empty array
        if ($currentPlace->latitude === null || $currentPlace->longitude === null) {
            return [];
        }

        $latitude = $currentPlace->latitude;
        $longitude = $currentPlace->longitude;

        // Haversine formula to calculate distance in kilometers
        $haversine = "
            (6371 * acos(
                cos(radians($latitude))
                * cos(radians(places.latitude))
                * cos(radians(places.longitude) - radians($longitude))
                + sin(radians($latitude))
                * sin(radians(places.latitude))
            ))
        ";

        $results = Place::with(['category', 'province'])
            ->select('places.*', DB::raw("$haversine AS distance"))
            ->where('category_id', $categoryId)
            ->where('placeID', '!=', $currentPlace->placeID) // Auto-exclude current place
            ->whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->havingRaw("distance <= ?", [$radiusKm])
            ->orderBy('distance', 'asc')
            ->orderBy('ratings', 'desc')
            ->limit($limit)
            ->get();

        // Convert distance to readable format
        return $results->map(function($place) {
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
                'distance' => round($place->distance, 2),
                'distance_text' => round($place->distance, 2) . ' km away',
            ];
        })->toArray();
    }


}