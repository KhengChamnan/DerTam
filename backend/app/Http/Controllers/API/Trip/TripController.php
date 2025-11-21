<?php

namespace App\Http\Controllers\API\Trip;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;


class TripController extends Controller
{
    /**
     * Create a new trip with date range and generate trip days
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        // Validate the request
        $validator = Validator::make($request->all(), [
            'trip_name' => 'required|string|max:255',
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Start database transaction
            DB::beginTransaction();

            // Get authenticated user ID
            $userId = Auth::id();
            
            if (!$userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }

            // Insert trip into database
            $tripId = DB::table('trips')->insertGetId([
                'user_id' => $userId,
                'trip_name' => $request->trip_name,
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Generate list of dates between start_date and end_date
            $startDate = Carbon::parse($request->start_date);
            $endDate = Carbon::parse($request->end_date);
            
            $tripDays = [];
            $currentDate = $startDate->copy();
            $dayNumber = 1;
            
            while ($currentDate->lte($endDate)) {
                $tripDays[] = [
                    'trip_id' => $tripId,
                    'date' => $currentDate->format('Y-m-d'),
                    'day_number' => $dayNumber,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
                $currentDate->addDay();
                $dayNumber++;
            }

            // Insert all trip days at once
            if (!empty($tripDays)) {
                DB::table('trip_days')->insert($tripDays);
            }

            // Fetch the created trip with its days
            $trip = DB::table('trips')
                ->where('trip_id', $tripId)
                ->first();

            $days = DB::table('trip_days')
                ->where('trip_id', $tripId)
                ->orderBy('date', 'asc')
                ->get();

            // Commit transaction
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Trip created successfully',
                'data' => [
                    'trip' => $trip,
                    'days' => $days,
                    'total_days' => count($days)
                ]
            ], 201);

        } catch (\Exception $e) {
            // Rollback transaction on error
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Failed to create trip',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all trips for the authenticated user
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        try {
            $userId = Auth::id();
            
            if (!$userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }

            // Get owned trips
            $ownedTrips = DB::table('trips')
                ->where('user_id', $userId)
                ->select('trips.*')
                ->addSelect(DB::raw("'owned' as trip_access_type"))
                ->get();

            // Get shared trips (trips the user has viewed)
            $sharedTrips = DB::table('trip_viewers')
                ->join('trips', 'trip_viewers.trip_id', '=', 'trips.trip_id')
                ->where('trip_viewers.user_id', $userId)
                ->select('trips.*')
                ->addSelect(DB::raw("'shared' as trip_access_type"))
                ->get();

            // Combine both lists
            $trips = $ownedTrips->merge($sharedTrips)->sortByDesc('created_at')->values();

            // Get trip days count and a random place image for each trip
            foreach ($trips as $trip) {
                $trip->days_count = DB::table('trip_days')
                    ->where('trip_id', $trip->trip_id)
                    ->count();

                // Get a random place image from the trip
                $randomPlace = DB::table('trip_places')
                    ->join('trip_days', 'trip_places.trip_day_id', '=', 'trip_days.trip_day_id')
                    ->join('places', 'trip_places.place_id', '=', 'places.placeID')
                    ->where('trip_days.trip_id', $trip->trip_id)
                    ->whereNotNull('places.images_url')
                    ->select(DB::raw("JSON_UNQUOTE(JSON_EXTRACT(places.images_url, '$[0]')) as image_url"))
                    ->inRandomOrder()
                    ->first();

                $trip->image_url = $randomPlace ? $randomPlace->image_url : null;
            }

            return response()->json([
                'success' => true,
                'data' => $trips
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch trips',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get a specific trip with its days
     *
     * @param int $tripId
     * @return JsonResponse
     */
    public function show(int $tripId): JsonResponse
    {
        try {
            $userId = Auth::id();
            
            if (!$userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }

            // Get trip
            $trip = DB::table('trips')
                ->where('trip_id', $tripId)
                ->where('user_id', $userId)
                ->first();

            if (!$trip) {
                return response()->json([
                    'success' => false,
                    'message' => 'Trip not found'
                ], 404);
            }

            // Get trip days
            $tripDays = DB::table('trip_days')
                ->where('trip_id', $tripId)
                ->orderBy('day_number', 'asc')
                ->get();

            // Build the days array with places
            $days = [];
            $totalPlaces = 0;

            foreach ($tripDays as $tripDay) {
                // Get places for this day
                $places = DB::table('trip_places')
                    ->join('places', 'trip_places.place_id', '=', 'places.placeID')
                    ->where('trip_places.trip_day_id', $tripDay->trip_day_id)
                    ->select(
                        'trip_places.trip_place_id',
                        'trip_places.place_id',
                        'places.name',
                        'places.description',
                        'places.google_maps_link',
                        'places.ratings',
                        DB::raw("JSON_UNQUOTE(JSON_EXTRACT(places.images_url, '$[0]')) as image_url")
                    )
                    ->orderBy('trip_places.created_at', 'asc')
                    ->get();

                $dayKey = 'day' . $tripDay->day_number;
                $days[$dayKey] = [
                    'day_number' => $tripDay->day_number,
                    'trip_day_id' => $tripDay->trip_day_id,
                    'date' => $tripDay->date,
                    'places' => $places,
                    'places_count' => $places->count()
                ];

                $totalPlaces += $places->count();
            }

            return response()->json([
                'success' => true,
                'message' => 'Trip details retrieved successfully',
                'data' => [
                    'trip_id' => $trip->trip_id,
                    'trip_name' => $trip->trip_name,
                    'start_date' => $trip->start_date,
                    'end_date' => $trip->end_date,
                    'days' => $days,
                    'total_places' => $totalPlaces
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch trip',
                'error' => $e->getMessage()
            ], 500);
        }
    }



    /**
     * Add places to multiple trip days at once
     * POST /api/add-places/{trip_id}
     *
     * @param Request $request
     * @param int $tripId
     * @return JsonResponse
     */
    public function addPlaces(Request $request, int $tripId): JsonResponse
    {
        try {
            $userId = Auth::id();
            
            if (!$userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }

            // Verify trip ownership
            $trip = DB::table('trips')
                ->where('trip_id', $tripId)
                ->where('user_id', $userId)
                ->first();

            if (!$trip) {
                return response()->json([
                    'success' => false,
                    'message' => 'Trip not found or you do not have permission to modify it'
                ], 404);
            }

            // Validate the request structure
            $validator = Validator::make($request->all(), [
                'day*' => 'array',
                'day*.place_ids' => 'required|array',
                'day*.place_ids.*' => 'integer|exists:places,placeID',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            $results = [];
            $totalPlacesAdded = 0;

            // Process each day
            foreach ($request->all() as $dayKey => $dayData) {
                // Extract day number from key (e.g., "day1" -> 1)
                if (!preg_match('/^day(\d+)$/', $dayKey, $matches)) {
                    continue;
                }

                $dayNumber = (int)$matches[1];

                // Find the trip day by day_number
                $tripDay = DB::table('trip_days')
                    ->where('trip_id', $tripId)
                    ->where('day_number', $dayNumber)
                    ->first();

                if (!$tripDay) {
                    DB::rollBack();
                    return response()->json([
                        'success' => false,
                        'message' => "Day {$dayNumber} does not exist for this trip"
                    ], 404);
                }

                // Skip if place_ids is empty
                if (empty($dayData['place_ids'])) {
                    // Get existing places for this day
                    $existingPlaces = DB::table('trip_places')
                        ->join('places', 'trip_places.place_id', '=', 'places.placeID')
                        ->where('trip_places.trip_day_id', $tripDay->trip_day_id)
                        ->select(
                            'trip_places.trip_place_id',
                            'trip_places.place_id',
                            'places.name',
                            'places.description',
                            'places.google_maps_link',
                            'places.ratings',
                            'places.images_url'
                        )
                        ->get();

                    $results[$dayKey] = [
                        'day_number' => $dayNumber,
                        'trip_day_id' => $tripDay->trip_day_id,
                        'date' => $tripDay->date,
                        'places' => $existingPlaces,
                        'places_count' => $existingPlaces->count()
                    ];
                    continue;
                }

                // Prepare trip places to insert
                $tripPlaces = [];
                foreach ($dayData['place_ids'] as $placeId) {
                    // Check if place already exists for this day
                    $exists = DB::table('trip_places')
                        ->where('trip_day_id', $tripDay->trip_day_id)
                        ->where('place_id', $placeId)
                        ->exists();

                    if (!$exists) {
                        $tripPlaces[] = [
                            'trip_day_id' => $tripDay->trip_day_id,
                            'place_id' => $placeId,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ];
                    }
                }

                // Insert trip places
                if (!empty($tripPlaces)) {
                    DB::table('trip_places')->insert($tripPlaces);
                    $totalPlacesAdded += count($tripPlaces);
                }

                // Get the added places with details
                $addedPlaces = DB::table('trip_places')
                    ->join('places', 'trip_places.place_id', '=', 'places.placeID')
                    ->where('trip_places.trip_day_id', $tripDay->trip_day_id)
                    ->select(
                        'trip_places.trip_place_id',
                        'trip_places.place_id',
                        'places.name',
                        'places.description',
                        'places.google_maps_link',
                        'places.ratings',
                        'places.images_url'
                    )
                    ->get();

                $results[$dayKey] = [
                    'day_number' => $dayNumber,
                    'trip_day_id' => $tripDay->trip_day_id,
                    'date' => $tripDay->date,
                    'places' => $addedPlaces,
                    'places_count' => $addedPlaces->count()
                ];
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Places added successfully',
                'data' => [
                    'trip_id' => $tripId,
                    'days' => $results,
                    'total_places_added' => $totalPlacesAdded
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Failed to add places to trip',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
