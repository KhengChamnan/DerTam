<?php

namespace App\Http\Controllers\API\Bus;

use App\Http\Controllers\Controller;
use App\Models\Bus\BusSchedule;
use App\Models\Bus\BusSeat;
use App\Models\Bus\Route;
use App\Models\Bus\SeatBooking;
use App\Models\ProvinceCategory;
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
                    'available_seats' => $schedule->getAvailableSeatsCount(),
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
                ->where('departure_time', '>', value: now())
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
                        'available_seats' => $schedule->getAvailableSeatsCount(),
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

    /**
     * Get all province categories
     * GET /api/bus/provinces
     */
    public function getProvinces()
    {
        try {
            $provinces = ProvinceCategory::all(['province_categoryID as id', 'province_categoryName as name'])
                ->map(function($province) {
                    return [
                        'id' => $province->id,
                        'name' => $province->name,
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => [
                    'provinces' => $provinces,
                    'total' => $provinces->count(),
                ],
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to fetch provinces', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch provinces',
            ], 500);
        }
    }

    /**
     * Get schedule detail with seat layout
     * GET /api/bus/schedule/{id}
     */
    public function getScheduleDetail($id)
    {
        try {
            $schedule = BusSchedule::with(['bus.seats', 'bus.transportation', 'route.fromLocation', 'route.toLocation'])
                ->find($id);

            if (!$schedule) {
                return response()->json([
                    'success' => false,
                    'message' => 'Schedule not found',
                ], 404);
            }

            // Get all seats for the bus
            $seats = $schedule->bus->seats;
            
            // Get seat availability for this schedule
            $seatAvailability = BusSeat::getSeatAvailability($id);
            
            // Get current user's booked seats for this schedule (if authenticated)
            $userBookedSeatIds = [];
            if (auth()->check()) {
                $userBookedSeatIds = SeatBooking::where('schedule_id', $id)
                    ->whereHas('booking', function($query) {
                        $query->where('user_id', auth()->id())
                              ->whereIn('status', ['pending', 'confirmed']);
                    })
                    ->pluck('seat_id')
                    ->toArray();
            }

            // Organize seats into layout structure
            $columns = ['A', 'B', 'C', 'D'];
            $lowerDeckSeats = [];
            $upperDeckSeats = [];

            foreach ($seats as $seat) {
                $seatNumber = $seat->column_label . $seat->row;
                
                // Determine seat status based on availability
                if (in_array($seat->id, $userBookedSeatIds)) {
                    $status = 'your_seat';
                } elseif (isset($seatAvailability[$seat->id]) && $seatAvailability[$seat->id]) {
                    $status = 'available';
                } else {
                    $status = 'booked';
                }

                $seatData = [
                    'id' => $seat->id,
                    'seat_no' => $seatNumber,
                    'status' => $status, // TODO: Check bookings to set 'booked' or 'your_seat'
                    'column' => $seat->column_label,
                    'row' => $seat->row,
                ];

                // Determine if seat belongs to lower or upper deck based on level field
                if ($seat->level === 'lower' || $seat->level === 'Lower') {
                    $lowerDeckSeats[] = $seatData;
                } elseif ($seat->level === 'upper' || $seat->level === 'Upper') {
                    $upperDeckSeats[] = $seatData;
                } else {
                    // Default: put in lower deck if level is not specified
                    $lowerDeckSeats[] = $seatData;
                }
            }

            // Sort seats by column (A, B, C, D) then by row (1, 2, 3, ...)
            usort($lowerDeckSeats, function($a, $b) {
                if ($a['column'] === $b['column']) {
                    return $a['row'] <=> $b['row'];
                }
                return $a['column'] <=> $b['column'];
            });

            usort($upperDeckSeats, function($a, $b) {
                if ($a['column'] === $b['column']) {
                    return $a['row'] <=> $b['row'];
                }
                return $a['column'] <=> $b['column'];
            });

            // Remove temporary sorting fields
            $lowerDeckSeats = array_map(function($seat) {
                unset($seat['column'], $seat['row']);
                return $seat;
            }, $lowerDeckSeats);

            $upperDeckSeats = array_map(function($seat) {
                unset($seat['column'], $seat['row']);
                return $seat;
            }, $upperDeckSeats);

            $seatLayout = [
                'lower_deck' => [
                    'columns' => $columns,
                    'seats' => $lowerDeckSeats,
                ],
                'upper_deck' => [
                    'columns' => $columns,
                    'seats' => $upperDeckSeats,
                ],
            ];

            // Schedule information
            $scheduleData = [
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
                'available_seats' => $schedule->getAvailableSeatsCount(),
                'duration_hours' => $schedule->route->duration_hours,
                'status' => $schedule->status,
            ];

            return response()->json([
                'success' => true,
                'data' => [
                    'schedule' => $scheduleData,
                    'seat_layout' => $seatLayout,
                ],
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to fetch schedule detail', [
                'error' => $e->getMessage(),
                'schedule_id' => $id,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch schedule detail',
            ], 500);
        }
    }
}
