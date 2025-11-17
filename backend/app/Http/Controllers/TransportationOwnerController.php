<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Transportation;
use App\Models\Bus\Bus;
use App\Models\Bus\BusSchedule;
use App\Models\Bus\SeatBooking;
use Inertia\Inertia;
use Inertia\Response;

class TransportationOwnerController extends Controller
{
    /**
     * Transportation owner dashboard with enhanced stats
     */
    public function dashboard(): Response
    {
        $user = Auth::user();
        
        // Get user's transportation companies with relationships
        $companies = Transportation::where('owner_user_id', $user->id)
            ->with(['place', 'buses'])
            ->get();
        
        // Calculate enhanced statistics
        $totalBuses = Bus::whereHas('transportation', function($q) use ($user) {
            $q->where('owner_user_id', $user->id);
        })->count();
        
        $activeBuses = Bus::whereHas('transportation', function($q) use ($user) {
            $q->where('owner_user_id', $user->id);
        })->whereHas('activeSchedules')->count();
        
        $totalSchedules = BusSchedule::whereHas('bus.transportation', function($q) use ($user) {
            $q->where('owner_user_id', $user->id);
        })->where('status', 'scheduled')->count();
        
        $totalBookings = SeatBooking::whereHas('schedule.bus.transportation', function($q) use ($user) {
            $q->where('owner_user_id', $user->id);
        })->count();
        
        $totalRevenue = SeatBooking::whereHas('schedule.bus.transportation', function($q) use ($user) {
            $q->where('owner_user_id', $user->id);
        })->sum('price');
        
        // Recent bookings
        $recentBookings = SeatBooking::whereHas('schedule.bus.transportation', function($q) use ($user) {
            $q->where('owner_user_id', $user->id);
        })
        ->with(['schedule.route', 'schedule.bus', 'seat'])
        ->orderBy('created_at', 'desc')
        ->limit(5)
        ->get();
        
        // Utilization rate calculation
        $totalSeats = Bus::whereHas('transportation', function($q) use ($user) {
            $q->where('owner_user_id', $user->id);
        })->sum('seat_capacity');
        
        $bookedSeats = SeatBooking::whereHas('schedule.bus.transportation', function($q) use ($user) {
            $q->where('owner_user_id', $user->id);
        })
        ->whereHas('schedule', function($q) {
            $q->where('status', 'scheduled');
        })
        ->count();
        
        $utilizationRate = $totalSeats > 0 ? ($bookedSeats / ($totalSeats * $totalSchedules > 0 ? $totalSchedules : 1)) * 100 : 0;
        
        // Average ticket price
        $avgTicketPrice = $totalBookings > 0 ? $totalRevenue / $totalBookings : 0;
        
        // Recent revenue (last 7 days)
        $recentRevenue = SeatBooking::whereHas('schedule.bus.transportation', function($q) use ($user) {
            $q->where('owner_user_id', $user->id);
        })
        ->where('created_at', '>=', now()->subDays(7))
        ->sum('price');
        
        return Inertia::render('transportation-owner/dashboard', [
            'companies' => $companies,
            'stats' => [
                'total_companies' => $companies->count(),
                'total_buses' => $totalBuses,
                'active_buses' => $activeBuses,
                'total_schedules' => $totalSchedules,
                'total_bookings' => $totalBookings,
                'total_revenue' => $totalRevenue,
                'utilization_rate' => round($utilizationRate, 1),
                'avg_ticket_price' => round($avgTicketPrice, 2),
                'recent_revenue' => $recentRevenue,
            ],
            'recent_bookings' => $recentBookings,
        ]);
    }
    
    /**
     * Show the transportation company for the authenticated owner
     */
    public function index(): Response
    {
        $user = Auth::user();
        
        $company = Transportation::where('owner_user_id', $user->id)
            ->with([
                'place',
                'buses.schedules',
            ])
            ->first();
        
        return Inertia::render('transportation-owner/companies/index', [
            'company' => $company
        ]);
    }
    
    /**
     * Show a specific transportation company for the authenticated owner
     */
    public function show($id): Response
    {
        $user = Auth::user();
        
        $company = Transportation::where('owner_user_id', $user->id)
            ->where('id', $id)
            ->with([
                'place',
                'buses.schedules',
            ])
            ->firstOrFail();
        
        // Company analytics
        $busesCount = $company->buses->count();
        $schedulesCount = BusSchedule::whereHas('bus', function($q) use ($company) {
            $q->where('transportation_id', $company->id);
        })->where('status', 'scheduled')->count();
        
        $bookingsCount = SeatBooking::whereHas('schedule.bus', function($q) use ($company) {
            $q->where('transportation_id', $company->id);
        })->count();
        
        $revenue = SeatBooking::whereHas('schedule.bus', function($q) use ($company) {
            $q->where('transportation_id', $company->id);
        })->sum('price');
        
        return Inertia::render('transportation-owner/companies/show', [
            'company' => $company,
            'analytics' => [
                'buses_count' => $busesCount,
                'schedules_count' => $schedulesCount,
                'bookings_count' => $bookingsCount,
                'total_revenue' => $revenue,
            ]
        ]);
    }
    
    /**
     * Show all buses across all companies
     */
    public function buses(): Response
    {
        $user = Auth::user();
        
        $buses = Bus::whereHas('transportation', function($q) use ($user) {
            $q->where('owner_user_id', $user->id);
        })
        ->with([
            'transportation:id,placeID',
            'transportation.place:placeID,name',
            'schedules' => function($q) {
                $q->where('status', 'scheduled')->orderBy('departure_time', 'desc')->limit(5);
            }
        ])
        ->paginate(12);
        
        return Inertia::render('transportation-owner/buses/index', [
            'buses' => $buses
        ]);
    }
    
    /**
     * Show bookings for transportation owner's companies
     */
    public function bookings(): Response
    {
        $user = Auth::user();
        
        $bookings = SeatBooking::whereHas('schedule.bus.transportation', function($q) use ($user) {
            $q->where('owner_user_id', $user->id);
        })
        ->with([
            'schedule.route',
            'schedule.bus.transportation.place',
            'seat'
        ])
        ->orderBy('created_at', 'desc')
        ->paginate(15);
        
        return Inertia::render('transportation-owner/bookings/index', [
            'bookings' => $bookings
        ]);
    }
    
    /**
     * Show all schedules across all buses
     */
    public function schedules(): Response
    {
        $user = Auth::user();
        
        $schedules = BusSchedule::whereHas('bus.transportation', function($q) use ($user) {
            $q->where('owner_user_id', $user->id);
        })
        ->with([
            'bus:id,bus_name,bus_plate,transportation_id,seat_capacity',
            'bus.transportation:id,placeID',
            'bus.transportation.place:placeID,name',
            'route:id,from_location,to_location,distance_km,duration_hours',
            'bookings'
        ])
        ->orderBy('departure_time', 'desc')
        ->paginate(15);
        
        return Inertia::render('transportation-owner/schedules/index', [
            'schedules' => $schedules
        ]);
    }

    /**
     * Show the form for creating a new bus
     */
    public function createBus(): Response
    {
        return Inertia::render('transportation-owner/buses/createEdit');
    }

    /**
     * Store a newly created bus
     */
    public function storeBus(Request $request)
    {
        $user = Auth::user();
        
        // Get user's transportation company
        $transportation = Transportation::where('owner_user_id', $user->id)->first();
        
        if (!$transportation) {
            return back()->withErrors(['error' => 'No transportation company found for this user.']);
        }
        
        $validated = $request->validate([
            'bus_name' => 'required|string|max:255',
            'bus_plate' => 'required|string|max:255|unique:buses,bus_plate',
            'bus_type' => 'required|string|in:standard,luxury,sleeper,vip',
            'seat_capacity' => 'required|integer|min:1|max:100',
            'is_active' => 'boolean',
            'description' => 'nullable|string',
            'features' => 'nullable|string',
        ]);
        
        $bus = Bus::create([
            'bus_name' => $validated['bus_name'],
            'bus_plate' => $validated['bus_plate'],
            'bus_type' => $validated['bus_type'],
            'seat_capacity' => $validated['seat_capacity'],
            'is_active' => $validated['is_active'] ?? true,
            'transportation_id' => $transportation->id,
            'description' => $validated['description'] ?? null,
            'features' => $validated['features'] ?? null,
        ]);
        
        return redirect()->route('transportation-owner.buses.index')
            ->with('success', 'Bus created successfully.');
    }

    /**
     * Show the form for editing a bus
     */
    public function editBus($id): Response
    {
        $user = Auth::user();
        
        $bus = Bus::whereHas('transportation', function($q) use ($user) {
            $q->where('owner_user_id', $user->id);
        })
        ->findOrFail($id);
        
        return Inertia::render('transportation-owner/buses/createEdit', [
            'bus' => $bus
        ]);
    }

    /**
     * Update the specified bus
     */
    public function updateBus(Request $request, $id)
    {
        $user = Auth::user();
        
        $bus = Bus::whereHas('transportation', function($q) use ($user) {
            $q->where('owner_user_id', $user->id);
        })
        ->findOrFail($id);
        
        $validated = $request->validate([
            'bus_name' => 'required|string|max:255',
            'bus_plate' => 'required|string|max:255|unique:buses,bus_plate,' . $id,
            'bus_type' => 'required|string|in:standard,luxury,sleeper,vip',
            'seat_capacity' => 'required|integer|min:1|max:100',
            'is_active' => 'boolean',
            'description' => 'nullable|string',
            'features' => 'nullable|string',
        ]);
        
        $bus->update($validated);
        
        return redirect()->route('transportation-owner.buses.index')
            ->with('success', 'Bus updated successfully.');
    }

    /**
     * Show the form for creating a new schedule
     */
    public function createSchedule(): Response
    {
        $user = Auth::user();
        
        // Get user's buses
        $buses = Bus::whereHas('transportation', function($q) use ($user) {
            $q->where('owner_user_id', $user->id);
        })
        ->select('id', 'bus_name', 'bus_plate', 'seat_capacity')
        ->get();
        
        // Get all available routes
        $routes = \App\Models\Bus\Route::select('id', 'from_location as origin', 'to_location as destination', 'distance_km as distance', 'duration_hours as duration')
            ->get()
            ->map(function($route) {
                // Convert duration from hours to minutes for frontend
                $route->duration = $route->duration ? (int)($route->duration * 60) : null;
                return $route;
            });
        
        return Inertia::render('transportation-owner/schedules/createEdit', [
            'buses' => $buses,
            'routes' => $routes,
        ]);
    }

    /**
     * Store a newly created schedule
     */
    public function storeSchedule(Request $request)
    {
        $user = Auth::user();
        
        $validated = $request->validate([
            'bus_id' => 'required|exists:buses,id',
            'route_id' => 'required|exists:routes,id',
            'departure_time' => 'required|date|after:now',
            'arrival_time' => 'required|date|after:departure_time',
            'price' => 'required|numeric|min:0',
            'status' => 'required|string|in:scheduled,departed,arrived,cancelled',
            'notes' => 'nullable|string',
        ]);
        
        // Verify bus belongs to user
        $bus = Bus::whereHas('transportation', function($q) use ($user) {
            $q->where('owner_user_id', $user->id);
        })
        ->findOrFail($validated['bus_id']);
        
        $schedule = BusSchedule::create([
            'bus_id' => $validated['bus_id'],
            'route_id' => $validated['route_id'],
            'departure_time' => $validated['departure_time'],
            'arrival_time' => $validated['arrival_time'],
            'price' => $validated['price'],
            'status' => $validated['status'],
            'available_seats' => $bus->seat_capacity,
            'notes' => $validated['notes'] ?? null,
        ]);
        
        return redirect()->route('transportation-owner.schedules.index')
            ->with('success', 'Schedule created successfully.');
    }

    /**
     * Show the form for editing a schedule
     */
    public function editSchedule($id): Response
    {
        $user = Auth::user();
        
        $schedule = BusSchedule::whereHas('bus.transportation', function($q) use ($user) {
            $q->where('owner_user_id', $user->id);
        })
        ->findOrFail($id);
        
        // Get user's buses
        $buses = Bus::whereHas('transportation', function($q) use ($user) {
            $q->where('owner_user_id', $user->id);
        })
        ->select('id', 'bus_name', 'bus_plate', 'seat_capacity')
        ->get();
        
        // Get all available routes
        $routes = \App\Models\Bus\Route::select('id', 'from_location as origin', 'to_location as destination', 'distance_km as distance', 'duration_hours as duration')
            ->get()
            ->map(function($route) {
                // Convert duration from hours to minutes for frontend
                $route->duration = $route->duration ? (int)($route->duration * 60) : null;
                return $route;
            });
        
        return Inertia::render('transportation-owner/schedules/createEdit', [
            'schedule' => $schedule,
            'buses' => $buses,
            'routes' => $routes,
        ]);
    }

    /**
     * Update the specified schedule
     */
    public function updateSchedule(Request $request, $id)
    {
        $user = Auth::user();
        
        $schedule = BusSchedule::whereHas('bus.transportation', function($q) use ($user) {
            $q->where('owner_user_id', $user->id);
        })
        ->findOrFail($id);
        
        $validated = $request->validate([
            'bus_id' => 'required|exists:buses,id',
            'route_id' => 'required|exists:routes,id',
            'departure_time' => 'required|date',
            'arrival_time' => 'required|date|after:departure_time',
            'price' => 'required|numeric|min:0',
            'status' => 'required|string|in:scheduled,departed,arrived,cancelled',
            'notes' => 'nullable|string',
        ]);
        
        // Verify bus belongs to user
        Bus::whereHas('transportation', function($q) use ($user) {
            $q->where('owner_user_id', $user->id);
        })
        ->findOrFail($validated['bus_id']);
        
        $schedule->update($validated);
        
        return redirect()->route('transportation-owner.schedules.index')
            ->with('success', 'Schedule updated successfully.');
    }
}
