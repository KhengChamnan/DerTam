<?php

namespace App\Http\Controllers\API\Place;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
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
            // Get the main place details
            $place = DB::table('places')
                ->leftJoin('place_categories', 'places.category_id', '=', 'place_categories.placeCategoryID')
                ->leftJoin('province_categories', 'places.province_id', '=', 'province_categories.province_categoryID')
                ->where('places.placeID', $placeId)
                ->select(
                    'places.*',
                    'place_categories.category_name',
                    'place_categories.category_description as category_description',
                    'province_categories.province_categoryName',
                    'province_categories.category_description as province_description'
                )
                ->first();

            if (!$place) {
                return response()->json([
                    'success' => false,
                    'message' => 'Place not found'
                ], 404);
            }

            // Decode JSON fields
            $imagesUrl = json_decode($place->images_url) ?? [];
            $imagePublicIds = json_decode($place->image_public_ids) ?? [];
            $operatingHours = json_decode($place->operating_hours) ?? null;

            // Prepare place detail data
            $placeDetail = [
                'placeID' => $place->placeID,
                'name' => $place->name,
                'description' => $place->description,
                'category_name' => $place->category_name,
                'category_description' => $place->category_description,
                'google_maps_link' => $place->google_maps_link,
                'ratings' => $place->ratings,
                'reviews_count' => $place->reviews_count,
                'entry_free' => $place->entry_free,
                'operating_hours' => $operatingHours,
                'best_season_to_visit' => $place->best_season_to_visit,
                'province_categoryName' => $place->province_categoryName,
                'province_description' => $place->province_description,
                'latitude' => $place->latitude,
                'longitude' => $place->longitude,
                'created_at' => $place->created_at,
                'updated_at' => $place->updated_at
            ];

            // Get nearby places/attractions (category_id = 1)
            $nearbyPlaces = $this->getNearbyPlaces(
                $place->latitude,
                $place->longitude,
                1, // Tourist Attraction category ID
                5, // Limit to 5 results
                10 // Within 10 km radius
            );

            // Get nearby restaurants (category_id = 2)
            $nearbyRestaurants = $this->getNearbyPlaces(
                $place->latitude,
                $place->longitude,
                2, // Restaurant category ID
                5, // Limit to 5 results
                10 // Within 10 km radius
            );

            // Get nearby hotels (category_id = 3)
            $nearbyHotels = $this->getNearbyPlaces(
                $place->latitude,
                $place->longitude,
                3, // Hotel category ID
                5, // Limit to 5 results
                10 // Within 10 km radius
            );

            return response()->json([
                'success' => true,
                'data' => [
                    'placeDetail' => $placeDetail,
                    'listOfImageUrl' => $imagesUrl,
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
     * Get nearby places based on latitude and longitude using Haversine formula
     *
     * @param float|null $latitude
     * @param float|null $longitude
     * @param int $categoryId
     * @param int $limit
     * @param float $radiusKm
     * @return array
     */
    private function getNearbyPlaces($latitude, $longitude, int $categoryId, int $limit = 5, float $radiusKm = 10): array
    {
        // If coordinates are null, return empty array
        if ($latitude === null || $longitude === null) {
            return [];
        }

        // Haversine formula to calculate distance
        // Distance in kilometers
        $haversine = "
            (6371 * acos(
                cos(radians($latitude))
                * cos(radians(places.latitude))
                * cos(radians(places.longitude) - radians($longitude))
                + sin(radians($latitude))
                * sin(radians(places.latitude))
            ))
        ";

        $results = DB::table('places')
            ->leftJoin('place_categories', 'places.category_id', '=', 'place_categories.placeCategoryID')
            ->leftJoin('province_categories', 'places.province_id', '=', 'province_categories.province_categoryID')
            ->select(
                'places.placeID',
                'places.name',
                'places.description',
                'place_categories.category_name',
                'places.google_maps_link',
                'places.ratings',
                'places.reviews_count',
                'places.images_url',
                'places.entry_free',
                'places.operating_hours',
                'province_categories.province_categoryName',
                'places.latitude',
                'places.longitude',
                DB::raw("$haversine AS distance")
            )
            ->where('places.category_id', $categoryId)
            ->whereNotNull('places.latitude')
            ->whereNotNull('places.longitude')
            ->havingRaw("distance <= ?", [$radiusKm])
            ->orderBy('distance', 'asc')
            ->orderBy('places.ratings', 'desc')
            ->limit($limit)
            ->get();

        // Convert distance to readable format and decode JSON fields
        return $results->map(function($item) {
            $item->distance = round($item->distance, 2);
            $item->distance_text = $item->distance . ' km away';
            
            // Decode JSON fields
            $item->images_url = json_decode($item->images_url) ?? [];
            $item->operating_hours = json_decode($item->operating_hours) ?? null;
            
            return $item;
        })->toArray();
    }


}
