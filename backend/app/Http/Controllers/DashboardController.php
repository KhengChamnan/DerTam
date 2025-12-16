<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Booking\Booking;
use App\Models\Hotel\Property;
use App\Models\Place\Place;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        // Get current month and previous month for comparison
        $currentMonth = Carbon::now()->startOfMonth();
        $previousMonth = Carbon::now()->subMonth()->startOfMonth();
        
        // Total Users Statistics
        $totalUsers = User::count();
        $usersThisMonth = User::where('created_at', '>=', $currentMonth)->count();
        $usersPreviousMonth = User::whereBetween('created_at', [$previousMonth, $currentMonth])->count();
        $usersChange = $usersPreviousMonth > 0 
            ? round((($usersThisMonth - $usersPreviousMonth) / $usersPreviousMonth) * 100, 1)
            : 0;
        
        // Total Bookings Statistics
        $totalBookings = Booking::whereIn('status', ['pending', 'confirmed', 'completed'])->count();
        $bookingsThisMonth = Booking::where('created_at', '>=', $currentMonth)
            ->whereIn('status', ['pending', 'confirmed', 'completed'])
            ->count();
        $bookingsPreviousMonth = Booking::whereBetween('created_at', [$previousMonth, $currentMonth])
            ->whereIn('status', ['pending', 'confirmed', 'completed'])
            ->count();
        $bookingsChange = $bookingsPreviousMonth > 0
            ? round((($bookingsThisMonth - $bookingsPreviousMonth) / $bookingsPreviousMonth) * 100, 1)
            : 0;
        
        // Revenue Statistics
        $revenueThisMonth = Booking::where('created_at', '>=', $currentMonth)
            ->whereIn('status', ['confirmed', 'completed'])
            ->sum('total_amount');
        $revenuePreviousMonth = Booking::whereBetween('created_at', [$previousMonth, $currentMonth])
            ->whereIn('status', ['confirmed', 'completed'])
            ->sum('total_amount');
        $revenueChange = $revenuePreviousMonth > 0
            ? round((($revenueThisMonth - $revenuePreviousMonth) / $revenuePreviousMonth) * 100, 1)
            : 0;
        
        // Total Properties
        $activeProperties = Property::count();
        $propertiesThisMonth = Property::where('created_at', '>=', $currentMonth)->count();
        $propertiesPreviousMonth = Property::whereBetween('created_at', [$previousMonth, $currentMonth])->count();
        $propertiesChange = $propertiesPreviousMonth > 0
            ? round((($propertiesThisMonth - $propertiesPreviousMonth) / $propertiesPreviousMonth) * 100, 1)
            : 0;
        
        // Monthly Revenue and Bookings (Last 6 months)
        $revenueData = [];
        for ($i = 5; $i >= 0; $i--) {
            $monthStart = Carbon::now()->subMonths($i)->startOfMonth();
            $monthEnd = Carbon::now()->subMonths($i)->endOfMonth();
            
            $revenue = Booking::whereBetween('created_at', [$monthStart, $monthEnd])
                ->whereIn('status', ['confirmed', 'completed'])
                ->sum('total_amount');
            
            $bookings = Booking::whereBetween('created_at', [$monthStart, $monthEnd])
                ->whereIn('status', ['pending', 'confirmed', 'completed'])
                ->count();
            
            $revenueData[] = [
                'month' => $monthStart->format('M'),
                'revenue' => (float) $revenue,
                'bookings' => $bookings,
            ];
        }
        
        // Booking Status Distribution
        $bookingStatusData = [
            [
                'status' => 'Confirmed',
                'value' => Booking::where('status', 'confirmed')->count(),
                'fill' => 'hsl(var(--chart-1))',
            ],
            [
                'status' => 'Pending',
                'value' => Booking::where('status', 'pending')->count(),
                'fill' => 'hsl(var(--chart-2))',
            ],
            [
                'status' => 'Cancelled',
                'value' => Booking::where('status', 'cancelled')->count(),
                'fill' => 'hsl(var(--chart-3))',
            ],
            [
                'status' => 'Completed',
                'value' => Booking::where('status', 'completed')->count(),
                'fill' => 'hsl(var(--chart-4))',
            ],
        ];
        
        // Top Destinations (Places with most bookings)
        $topDestinations = DB::table('bookings')
            ->join('booking_items', 'bookings.id', '=', 'booking_items.booking_id')
            ->join('room_properties', 'booking_items.item_id', '=', 'room_properties.room_properties_id')
            ->join('properties', 'room_properties.property_id', '=', 'properties.property_id')
            ->join('places', 'properties.place_id', '=', 'places.placeID')
            ->select('places.name as destination', DB::raw('COUNT(bookings.id) as bookings'))
            ->where('booking_items.item_type', 'hotel_room')
            ->whereIn('bookings.status', ['confirmed', 'completed'])
            ->groupBy('places.placeID', 'places.name')
            ->orderByDesc('bookings')
            ->limit(5)
            ->get()
            ->map(function ($item) {
                return [
                    'destination' => $item->destination,
                    'bookings' => (int) $item->bookings,
                ];
            });
        
        // User Growth (Last 6 months)
        $userGrowthData = [];
        for ($i = 5; $i >= 0; $i--) {
            $monthStart = Carbon::now()->subMonths($i)->startOfMonth();
            $monthEnd = Carbon::now()->subMonths($i)->endOfMonth();
            
            $users = User::where('created_at', '<=', $monthEnd)->count();
            
            $userGrowthData[] = [
                'month' => $monthStart->format('M'),
                'users' => $users,
            ];
        }
        
        return Inertia::render('dashboard', [
            'stats' => [
                'totalUsers' => $totalUsers,
                'usersChange' => $usersChange,
                'totalBookings' => $totalBookings,
                'bookingsChange' => $bookingsChange,
                'revenue' => $revenueThisMonth,
                'revenueChange' => $revenueChange,
                'activeProperties' => $activeProperties,
                'propertiesChange' => $propertiesChange,
            ],
            'revenueData' => $revenueData,
            'bookingStatusData' => $bookingStatusData,
            'topDestinations' => $topDestinations,
            'userGrowthData' => $userGrowthData,
        ]);
    }
}
