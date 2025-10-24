<?php

namespace App\Http\Controllers\API\Place;

use App\Http\Controllers\Controller;
use App\Models\Hotel\Property;
use App\Models\Place;
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
            // Get the main place details using Eloquent
            $place = Place::with(['category', 'province'])
                ->where('placeID', $placeId)
                ->first();

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

            // Check if this place is a hotel (category_id = 3)
            // If it is, get the property details instead
            $hotelProperty = null;
            if ($place->category_id == 3) {
                $property = Property::with([
                    'place.province:province_categoryID,province_categoryName',
                    'facilities:facility_id,property_id,facility_name',
                    'roomProperties:room_properties_id,property_id,room_type,room_description,max_guests,room_size,price_per_night,is_available,images_url',
                    'roomProperties.amenities:amenity_id,room_properties_id,amenity_name,is_available'
                ])->where('place_id', $placeId)->first();

                if ($property) {
                    $hotelProperty = [
                        'property_id' => $property->property_id,
                        'name' => $place->name, // Get from Place model
                        'google_map_link' => $place->google_maps_link, // Get from Place model
                        'latitude' => $place->latitude, // Get from Place model
                        'longitude' => $place->longitude, // Get from Place model
                        'owner_user_id' => $property->owner_user_id,
                        'province_category_id' => $property->place && $property->place->province ? $property->place->province->province_categoryID : null,
                        'description' => $place->description, // Get from Place model
                        'rating' => $place->ratings, // Get from Place model
                        'reviews_count' => $place->reviews_count, // Get from Place model
                        'image_url' => $place->images_url ?? [], // Get from Place model
                        'image_public_id' => json_decode($property->image_public_id) ?? [],
                        'created_at' => $property->created_at,
                        'updated_at' => $property->updated_at,
                        'province_category' => $property->place && $property->place->province ? [
                            'province_categoryID' => $property->place->province->province_categoryID,
                            'province_categoryName' => $property->place->province->province_categoryName,
                        ] : null,
                        'facilities' => $property->facilities->map(function($facility) {
                            return [
                                'facility_id' => $facility->facility_id,
                                'property_id' => $facility->property_id,
                                'facility_name' => $facility->facility_name,
                            ];
                        })->toArray(),
                        'room_properties' => $property->roomProperties->map(function($room) {
                            return [
                                'room_properties_id' => $room->room_properties_id,
                                'property_id' => $room->property_id,
                                'room_type' => $room->room_type,
                                'max_guests' => $room->max_guests,
                                'room_size' => $room->room_size,
                                'price_per_night' => $room->price_per_night,
                                'is_available' => $room->is_available,
                                'images_url' => $room->images_url ?? [],
                                'amenities' => $room->amenities->map(function($amenity) {
                                    return [
                                        'amenity_id' => $amenity->amenity_id,
                                        'room_properties_id' => $amenity->room_properties_id,
                                        'amenity_name' => $amenity->amenity_name,
                                        'is_available' => $amenity->is_available,
                                    ];
                                })->toArray(),
                            ];
                        })->toArray(),
                    ];
                }
            }

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

            // If this is a hotel (category_id = 3), return hotel property data only (no place details)
            if ($place->category_id == 3) {
                if ($hotelProperty) {
                    return response()->json([
                        'success' => true,
                        'data' => [
                            'hotelProperty' => $hotelProperty,
                            'nearbyPlace' => $nearbyPlaces,
                            'hotelNearby' => $nearbyHotels,
                            'restaurantNearby' => $nearbyRestaurants
                        ]
                    ], 200);
                } else {
                    // Hotel place exists but no property details found
                    return response()->json([
                        'success' => false,
                        'message' => 'Hotel property details not found'
                    ], 404);
                }
            }

            // For non-hotel places, return the full structure with place details
            return response()->json([
                'success' => true,
                'data' => [
                    'placeDetail' => $placeDetail,
                    'listOfImageUrl' => $place->images_url ?? [],
                    'hotelProperty' => null,
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

        // Convert distance to readable format
        return $results->map(function($item) {
            $item->distance = round($item->distance, 2);
            $item->distance_text = $item->distance . ' km away';
            
            // Decode JSON fields (since we're using DB query, not Eloquent model with casts)
            $item->images_url = json_decode($item->images_url) ?? [];
            $item->operating_hours = json_decode($item->operating_hours) ?? null;
            
            return $item;
        })->toArray();
    }


}
