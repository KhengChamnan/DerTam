<?php

namespace App\Http\Controllers\API\Hotel;

use App\Http\Controllers\Controller;
use App\Models\Hotel\RoomProperty;
use App\Models\Booking\BookingItem;
use App\Models\Booking\BookingHotelDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class RoomSearchController extends Controller
{
    /**
     * Search for available room types based on check-in, check-out dates, and guest number
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function searchAvailableRooms(Request $request)
    {
        // Validate input
        $validator = Validator::make($request->all(), [
            'check_in' => 'required|date|after_or_equal:today',
            'check_out' => 'required|date|after:check_in',
            'guests' => 'required|integer|min:1|max:20',
            'property_id' => 'nullable|exists:properties,property_id',
            'place_id' => 'nullable|exists:places,placeID',
            'province_category_id' => 'nullable|exists:province_categories,province_categoryID',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $checkIn = Carbon::parse($request->check_in)->startOfDay();
        $checkOut = Carbon::parse($request->check_out)->startOfDay();
        $guests = $request->guests;
        $propertyId = $request->property_id;
        $placeId = $request->place_id;
        $provinceCategoryId = $request->province_category_id;

        // Calculate number of nights
        $nights = $checkIn->diffInDays($checkOut);

        try {
            // Build query for room properties
            $query = RoomProperty::with([
                'property.place:placeID,name,description,ratings,province_id,images_url',
                'property.place.provinceCategory:province_categoryID,province_categoryName',
                'property.facilities:facility_id,facility_name,image_url',
                'amenities:amenity_id,amenity_name,image_url',
                'rooms' => function($query) {
                    $query->where('is_available', true);
                }
            ])
            ->where('max_guests', '=', $guests);

            // Filter by property if specified
            if ($propertyId) {
                $query->where('property_id', $propertyId);
            }

            // Filter by place if specified
            if ($placeId) {
                $query->whereHas('property', function($q) use ($placeId) {
                    $q->where('place_id', $placeId);
                });
            }

            // Filter by province category if specified
            if ($provinceCategoryId) {
                $query->whereHas('property.place', function($q) use ($provinceCategoryId) {
                    $q->where('province_id', $provinceCategoryId);
                });
            }

            // Get all matching room types
            $roomProperties = $query->get();

            // Filter out rooms that are already booked during the requested dates
            $availableRooms = $roomProperties->filter(function($roomProperty) use ($checkIn, $checkOut) {
                return $this->hasAvailableRoomsForDates($roomProperty->room_properties_id, $checkIn, $checkOut);
            });

            // Transform the results
            $results = $availableRooms->map(function($roomProperty) use ($nights, $checkIn, $checkOut) {
                $availableCount = $this->getAvailableRoomCount($roomProperty->room_properties_id, $checkIn, $checkOut);
                $totalPrice = $roomProperty->price_per_night * $nights;

                return [
                    'room_properties_id' => $roomProperty->room_properties_id,
                    'property_id' => $roomProperty->property_id,
                    'room_type' => $roomProperty->room_type,
                    'room_description' => $roomProperty->room_description,
                    'max_guests' => $roomProperty->max_guests,
                    'room_size' => $roomProperty->room_size,
                    'price_per_night' => $roomProperty->price_per_night,
                    'total_price' => $totalPrice,
                    'number_of_bed' => $roomProperty->number_of_bed,
                    'images_url' => $roomProperty->images_url,
                    'available_rooms_count' => $availableCount,
                    'nights' => $nights,
                    'amenities' => $roomProperty->amenities->map(function($amenity) {
                        return [
                            'amenity_id' => $amenity->amenity_id,
                            'amenity_name' => $amenity->amenity_name,
                            'image_url' => $amenity->image_url,
                        ];
                    }),
                    'property' => [
                        'property_id' => $roomProperty->property->property_id,
                        'place' => [
                            'placeID' => $roomProperty->property->place->placeID,
                            'name' => $roomProperty->property->place->name,
                            'description' => $roomProperty->property->place->description,
                            'ratings' => $roomProperty->property->place->ratings,
                            'province' => $roomProperty->property->place->provinceCategory->province_categoryName ?? null,
                            'images_url' => $roomProperty->property->place->images_url,
                        ],
                        'facilities' => $roomProperty->property->facilities->map(function($facility) {
                            return [
                                'facility_id' => $facility->facility_id,
                                'facility_name' => $facility->facility_name,
                                'image_url' => $facility->image_url,
                            ];
                        }),
                    ],
                ];
            })->values();

            return response()->json([
                'success' => true,
                'message' => 'Available rooms retrieved successfully',
                'data' => [
                    'search_params' => [
                        'check_in' => $checkIn->toDateString(),
                        'check_out' => $checkOut->toDateString(),
                        'guests' => $guests,
                        'nights' => $nights,
                    ],
                    'total_results' => $results->count(),
                    'rooms' => $results,
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to search available rooms',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check if room type has available rooms for the given date range
     * 
     * @param int $roomPropertiesId
     * @param Carbon $checkIn
     * @param Carbon $checkOut
     * @return bool
     */
    private function hasAvailableRoomsForDates($roomPropertiesId, $checkIn, $checkOut)
    {
        return $this->getAvailableRoomCount($roomPropertiesId, $checkIn, $checkOut) > 0;
    }

    /**
     * Get count of available rooms for the given date range
     * 
     * @param int $roomPropertiesId
     * @param Carbon $checkIn
     * @param Carbon $checkOut
     * @return int
     */
    private function getAvailableRoomCount($roomPropertiesId, $checkIn, $checkOut)
    {
        // Get all room IDs for this room type
        $roomProperty = RoomProperty::with('rooms')->find($roomPropertiesId);
        if (!$roomProperty) {
            return 0;
        }

        $totalRoomIds = $roomProperty->rooms->pluck('room_id')->toArray();
        
        if (empty($totalRoomIds)) {
            return 0;
        }

        // Get booked room IDs during the date range
        // A room is considered booked if there's any overlap with the requested dates
        // Only count CONFIRMED bookings to avoid blocking rooms for failed/cancelled payments
        $bookedRoomIds = BookingItem::whereIn('item_id', $totalRoomIds)
            ->where('item_type', 'hotel_room')
            ->whereHas('hotelDetails', function($query) use ($checkIn, $checkOut) {
                $query->where(function($q) use ($checkIn, $checkOut) {
                    // Check for date overlap
                    $q->where(function($subq) use ($checkIn, $checkOut) {
                        $subq->where('check_in', '<', $checkOut)
                             ->where('check_out', '>', $checkIn);
                    });
                });
            })
            ->whereHas('booking', function($query) {
                // Only consider confirmed bookings (exclude pending, cancelled, refunded)
                $query->where('status', 'confirmed');
            })
            ->pluck('item_id')
            ->unique()
            ->toArray();

        // Calculate available rooms
        $availableCount = count($totalRoomIds) - count($bookedRoomIds);
        
        return max(0, $availableCount);
    }

    /**
     * Get detailed availability calendar for a specific room type
     * Shows availability for each day in a date range
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getRoomAvailabilityCalendar(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'room_properties_id' => 'required|exists:room_properties,room_properties_id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $roomPropertiesId = $request->room_properties_id;
        $startDate = Carbon::parse($request->start_date)->startOfDay();
        $endDate = Carbon::parse($request->end_date)->startOfDay();

        try {
            $roomProperty = RoomProperty::with([
                'property.place:placeID,name',
                'rooms'
            ])->findOrFail($roomPropertiesId);

            $calendar = [];
            $currentDate = $startDate->copy();

            while ($currentDate <= $endDate) {
                $nextDay = $currentDate->copy()->addDay();
                $availableCount = $this->getAvailableRoomCount(
                    $roomPropertiesId,
                    $currentDate,
                    $nextDay
                );

                $calendar[] = [
                    'date' => $currentDate->toDateString(),
                    'available_rooms' => $availableCount,
                    'total_rooms' => $roomProperty->rooms->count(),
                    'is_available' => $availableCount > 0,
                    'price_per_night' => $roomProperty->price_per_night,
                ];

                $currentDate->addDay();
            }

            return response()->json([
                'success' => true,
                'message' => 'Room availability calendar retrieved successfully',
                'data' => [
                    'room_type' => $roomProperty->room_type,
                    'property' => [
                        'property_id' => $roomProperty->property->property_id,
                        'place_name' => $roomProperty->property->place->name,
                    ],
                    'calendar' => $calendar,
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve availability calendar',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
