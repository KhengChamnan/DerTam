<?php

namespace App\Http\Controllers\API\Bus;

use App\Http\Controllers\Controller;
use App\Models\Bus\BusSchedule;
use App\Models\Bus\Route;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class BusScheduleController extends Controller
{
  
    /**
     * Search bus schedules for booking UI (simplified)
     * GET /api/bus/search
     */
    public function searchBusSchedules(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'from_location' => 'required|integer|exists:province_categories,province_categoryID',
            'to_location' => 'required|integer|exists:province_categories,province_categoryID',
            'date_filter' => 'nullable|in:today,tomorrow,other',
            'specific_date' => 'nullable|date|after_or_equal:today|required_if:date_filter,other',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            // Step 1: Find routes matching the province IDs
            $routes = Route::where('from_location', $request->from_location)
                ->where('to_location', $request->to_location)
                ->pluck('id');

            if ($routes->isEmpty()) {
                return response()->json([
                    'success' => true,
                    'data' => [
                        'schedules' => [],
                        'total' => 0,
                        'search_params' => [
                            'from' => $request->from_location,
                            'to' => $request->to_location,
                            'date_filter' => $request->date_filter ?? 'today',
                        ],
                    ],
                    'message' => 'No routes found for the selected provinces',
                ]);
            }

            // Step 2: Build schedule query based on found routes
            $query = BusSchedule::query()
                ->with(['bus.transportation', 'route.fromLocation', 'route.toLocation'])
                ->whereIn('route_id', $routes)
                ->where('status', 'scheduled')
                ->where('available_seats', '>', 0)
                ->where('departure_time', '>=', now()); // Show schedules from now onwards

            // Step 3: Handle date filtering
            $dateFilter = $request->date_filter;
            
            if ($dateFilter) {
                switch ($dateFilter) {
                    case 'today':
                        $query->whereDate('departure_time', today());
                        break;
                    case 'tomorrow':
                        $query->whereDate('departure_time', today()->addDay());
                        break;
                    case 'other':
                        if ($request->has('specific_date')) {
                            $query->whereDate('departure_time', $request->specific_date);
                        }
                        break;
                }
            }

            // Order by departure time
            $query->orderBy('departure_time', 'asc');

            // Step 4: Get schedules and format response
            $schedules = $query->get()->map(function($schedule) {
                return [
                    'id' => $schedule->id,
                    'bus_name' => $schedule->bus->bus_name,
                    'transportation_company' => $schedule->bus->transportation->name ?? 'N/A',
                    'from_location' => $schedule->route->fromLocation->province_categoryName ?? 'N/A',
                    'from_location_id' => $schedule->route->from_location,
                    'to_location' => $schedule->route->toLocation->province_categoryName ?? 'N/A',
                    'to_location_id' => $schedule->route->to_location,
                    'departure_time' => $schedule->departure_time->format('g A, D'),
                    'departure_date' => $schedule->departure_time->format('Y.m.d'),
                    'departure_datetime' => $schedule->departure_time,
                    'arrival_time' => $schedule->arrival_time,
                    'price' => $schedule->price,
                    'available_seats' => $schedule->available_seats,
                    'duration_hours' => $schedule->route->duration_hours,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'schedules' => $schedules,
                    'total' => $schedules->count(),
                    'search_params' => [
                        'from' => $request->from_location,
                        'to' => $request->to_location,
                        'date_filter' => $dateFilter ?? 'all',
                    ],
                ],
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to search bus schedules', [
                'error' => $e->getMessage(),
                'request' => $request->all(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to search bus schedules',
            ], 500);
        }
    }

    /**
     * Get upcoming bus journeys (public - shows all available upcoming schedules)
     * GET /api/bus/upcoming-journeys
     */
    public function getUpcomingJourneys(Request $request)
    {
        try {
            $limit = $request->limit ?? 10;

            // Get upcoming scheduled buses
            $upcomingJourneys = BusSchedule::query()
                ->with(['bus.transportation', 'route'])
                ->where('status', 'scheduled')
                ->where('available_seats', '>', 0)
                ->where('departure_time', '>', now())
                ->orderBy('departure_time', 'asc')
                ->limit($limit)
                ->get()
                ->map(function($schedule, $index) {
                    return [
                        'id' => $schedule->id,
                        'number' => $index + 1,
                        'terminal_name' => $schedule->bus->transportation->name ?? "Bus terminal " . ($index + 1),
                        'bus_name' => $schedule->bus->bus_name,
                        'from_location' => $schedule->route->from_location,
                        'to_location' => $schedule->route->to_location,
                        'departure_time' => $schedule->departure_time->format('g A, D'),
                        'departure_date' => $schedule->departure_time->format('Y.m.d'),
                        'departure_datetime' => $schedule->departure_time,
                        'arrival_time' => $schedule->arrival_time,
                        'price' => $schedule->price,
                        'available_seats' => $schedule->available_seats,
                        'duration_hours' => $schedule->route->duration_hours,
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => [
                    'journeys' => $upcomingJourneys,
                    'total' => $upcomingJourneys->count(),
                ],
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to fetch upcoming journeys', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch upcoming journeys',
            ], 500);
        }
    }
}
