<?php

namespace App\Http\Controllers\API\Trip;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

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
            $userId = auth()->id();
            
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
            $userId = auth()->id();
            
            if (!$userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }

            $trips = DB::table('trips')
                ->where('user_id', $userId)
                ->orderBy('created_at', 'desc')
                ->get();

            // Get trip days count for each trip
            foreach ($trips as $trip) {
                $trip->days_count = DB::table('trip_days')
                    ->where('trip_id', $trip->trip_id)
                    ->count();
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
            $userId = auth()->id();
            
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
            $days = DB::table('trip_days')
                ->where('trip_id', $tripId)
                ->orderBy('date', 'asc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'trip' => $trip,
                    'days' => $days
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
     * Get all places for a specific trip day
     *
     * @param int $tripDayId
     * @return JsonResponse
     */
    public function getTripDayPlaces(int $tripDayId): JsonResponse
    {
        try {
            $userId = auth()->id();
            
            if (!$userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }

            // Verify that the trip day exists and belongs to the user
            $tripDay = DB::table('trip_days')
                ->join('trips', 'trip_days.trip_id', '=', 'trips.trip_id')
                ->where('trip_days.trip_day_id', $tripDayId)
                ->where('trips.user_id', $userId)
                ->select('trip_days.*', 'trips.trip_name')
                ->first();

            if (!$tripDay) {
                return response()->json([
                    'success' => false,
                    'message' => 'Trip day not found or unauthorized'
                ], 404);
            }

            // Get all places for this trip day
            $places = DB::table('trip_places')
                ->join('places', 'trip_places.place_id', '=', 'places.placeID')
                ->leftJoin('place_categories', 'places.category_id', '=', 'place_categories.placeCategoryID')
                ->leftJoin('province_categories', 'places.province_id', '=', 'province_categories.province_categoryID')
                ->where('trip_places.trip_day_id', $tripDayId)
                ->select(
                    'trip_places.trip_place_id',
                    'trip_places.trip_day_id',
                    'trip_places.place_id',
                    'trip_places.notes',
                    'trip_places.created_at as added_at',
                    'places.name as place_name',
                    'places.description as place_description',
                    'places.category_id',
                    'place_categories.category_name',
                    'places.google_maps_link',
                    'places.ratings',
                    'places.reviews_count',
                    'places.images_url',
                    'places.entry_free',
                    'places.operating_hours',
                    'places.province_id',
                    'province_categories.province_categoryName',
                    'places.latitude',
                    'places.longitude'
                )
                ->orderBy('trip_places.created_at', 'asc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'trip_day' => [
                        'trip_day_id' => $tripDay->trip_day_id,
                        'trip_id' => $tripDay->trip_id,
                        'trip_name' => $tripDay->trip_name,
                        'date' => $tripDay->date,
                        'day_number' => $tripDay->day_number
                    ],
                    'places' => $places,
                    'total_places' => count($places)
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch trip day places',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Add places to a specific trip day
     *
     * @param Request $request
     * @param int $tripDayId
     * @return JsonResponse
     */
    public function addPlacesToDay(Request $request, int $tripDayId): JsonResponse
    {
        // Validate the request
        $validator = Validator::make($request->all(), [
            'place_ids' => 'required|array|min:1',
            'place_ids.*' => 'required|integer|exists:places,placeID',
            'notes' => 'nullable|array',
            'notes.*' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $userId = auth()->id();
            
            if (!$userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }

            // Verify that the trip day exists and belongs to the user
            $tripDay = DB::table('trip_days')
                ->join('trips', 'trip_days.trip_id', '=', 'trips.trip_id')
                ->where('trip_days.trip_day_id', $tripDayId)
                ->where('trips.user_id', $userId)
                ->select('trip_days.*')
                ->first();

            if (!$tripDay) {
                return response()->json([
                    'success' => false,
                    'message' => 'Trip day not found or unauthorized'
                ], 404);
            }

            // Prepare trip places data
            $tripPlaces = [];
            $notes = $request->input('notes', []);
            
            foreach ($request->place_ids as $index => $placeId) {
                $tripPlaces[] = [
                    'trip_day_id' => $tripDayId,
                    'place_id' => $placeId,
                    'notes' => $notes[$index] ?? null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }

            // Insert trip places
            DB::table('trip_places')->insert($tripPlaces);

            // Fetch the added places with details
            $addedPlaces = DB::table('trip_places')
                ->join('places', 'trip_places.place_id', '=', 'places.placeID')
                ->where('trip_places.trip_day_id', $tripDayId)
                ->select(
                    'trip_places.trip_place_id',
                    'trip_places.trip_day_id',
                    'trip_places.place_id',
                    'trip_places.notes',
                    'places.name as place_name',
                    'places.description as place_description',
                    'places.google_maps_link',
                    'places.ratings',
                    'places.images_url',
                    'trip_places.created_at'
                )
                ->orderBy('trip_places.created_at', 'desc')
                ->limit(count($request->place_ids))
                ->get();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Places added to trip day successfully',
                'data' => [
                    'trip_day_id' => $tripDayId,
                    'places' => $addedPlaces,
                    'total_places_added' => count($addedPlaces)
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Failed to add places to trip day',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
