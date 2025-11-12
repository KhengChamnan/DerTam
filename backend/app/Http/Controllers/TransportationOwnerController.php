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
     * List all companies for the authenticated transportation owner
     */
    public function index(): Response
    {
        $user = Auth::user();
        
        $companies = Transportation::where('owner_user_id', $user->id)
            ->with([
                'place',
                'buses.schedules',
            ])
            ->get();
        
        return Inertia::render('transportation-owner/companies/index', [
            'companies' => $companies
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
            'bus:id,bus_name,bus_plate,transportation_id',
            'bus.transportation:id,placeID',
            'bus.transportation.place:placeID,name',
            'route:id,origin,destination',
            'bookings'
        ])
        ->orderBy('departure_time', 'desc')
        ->paginate(15);
        
        return Inertia::render('transportation-owner/schedules/index', [
            'schedules' => $schedules
        ]);
    }
}
