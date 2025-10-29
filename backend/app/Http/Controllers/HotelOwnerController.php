<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Hotel\Property;
use App\Models\Hotel\RoomProperty;
use App\Models\Hotel\BookingDetail;
use Inertia\Inertia;
use Inertia\Response;

class HotelOwnerController extends Controller
{
    /**
     * Hotel owner dashboard with enhanced stats
     */
    public function dashboard(): Response
    {
        $user = Auth::user();
        
        // Get user's properties with relationships
        $properties = Property::where('owner_user_id', $user->id)
            ->with(['place', 'roomProperties'])
            ->get();
        
        // Calculate enhanced statistics
        $totalRooms = RoomProperty::whereHas('property', function($q) use ($user) {
            $q->where('owner_user_id', $user->id);
        })->count();
        
        $availableRooms = RoomProperty::whereHas('property', function($q) use ($user) {
            $q->where('owner_user_id', $user->id);
        })->where('is_available', true)->count();
        
        $totalBookings = BookingDetail::whereHas('bookingRooms.roomProperty.property', function($q) use ($user) {
            $q->where('owner_user_id', $user->id);
        })->count();
        
        $totalRevenue = BookingDetail::whereHas('bookingRooms.roomProperty.property', function($q) use ($user) {
            $q->where('owner_user_id', $user->id);
        })->where('payment_status', 'paid')->sum('total_amount');
        
        // Recent bookings
        $recentBookings = BookingDetail::whereHas('bookingRooms.roomProperty.property', function($q) use ($user) {
            $q->where('owner_user_id', $user->id);
        })
        ->with(['bookingRooms.roomProperty.property.place'])
        ->orderBy('created_at', 'desc')
        ->limit(5)
        ->get();
        
        // Occupancy rate calculation (simplified)
        $occupancyRate = $totalRooms > 0 ? (($totalRooms - $availableRooms) / $totalRooms) * 100 : 0;
        
        // Average daily rate
        $avgDailyRate = $totalBookings > 0 ? $totalRevenue / $totalBookings : 0;
        
        // Recent revenue (last 7 days)
        $recentRevenue = BookingDetail::whereHas('bookingRooms.roomProperty.property', function($q) use ($user) {
            $q->where('owner_user_id', $user->id);
        })
        ->where('payment_status', 'paid')
        ->where('created_at', '>=', now()->subDays(7))
        ->sum('total_amount');
        
        return Inertia::render('hotel-owner/dashboard', [
            'properties' => $properties,
            'stats' => [
                'total_hotels' => $properties->count(),
                'total_rooms' => $totalRooms,
                'available_rooms' => $availableRooms,
                'total_bookings' => $totalBookings,
                'total_revenue' => $totalRevenue,
                'occupancy_rate' => round($occupancyRate, 1),
                'avg_daily_rate' => round($avgDailyRate, 2),
                'recent_revenue' => $recentRevenue,
            ],
            'recent_bookings' => $recentBookings,
        ]);
    }
    
    /**
     * List all properties for the authenticated hotel owner
     */
    public function index(): Response
    {
        $user = Auth::user();
        
        $properties = Property::where('owner_user_id', $user->id)
            ->with([
                'place:placeID,name,description,ratings,reviews_count,images_url',
                'roomProperties:property_id,room_properties_id,room_type,price_per_night,is_available',
                'facilities:facility_id,facility_name'
            ])
            ->paginate(10);
        
        return Inertia::render('hotel-owner/properties/index', [
            'properties' => $properties
        ]);
    }
    
    /**
     * Show a specific property for the authenticated hotel owner
     */
    public function show($id): Response
    {
        $user = Auth::user();
        
        $property = Property::where('owner_user_id', $user->id)
            ->where('property_id', $id)
            ->with([
                'place',
                'roomProperties.amenities',
                'facilities'
            ])
            ->firstOrFail();
        
        // Property analytics
        $roomsCount = $property->roomProperties->count();
        $bookingsCount = BookingDetail::whereHas('bookingRooms.roomProperty', function($q) use ($property) {
            $q->where('property_id', $property->property_id);
        })->count();
        
        $revenue = BookingDetail::whereHas('bookingRooms.roomProperty', function($q) use ($property) {
            $q->where('property_id', $property->property_id);
        })->where('payment_status', 'paid')->sum('total_amount');
        
        // Convert to array and explicitly include relationships for Inertia serialization
        $propertyData = $property->toArray();
        $propertyData['roomProperties'] = $property->roomProperties->toArray();
        $propertyData['facilities'] = $property->facilities->toArray();
        
        return Inertia::render('hotel-owner/properties/show', [
            'property' => $propertyData,
            'analytics' => [
                'rooms_count' => $roomsCount,
                'bookings_count' => $bookingsCount,
                'total_revenue' => $revenue,
            ]
        ]);
    }
    
    /**
     * Show room management for a specific property
     */
    public function rooms($property_id): Response
    {
        $user = Auth::user();
        
        $property = Property::where('owner_user_id', $user->id)
            ->where('property_id', $property_id)
            ->with(['place', 'roomProperties.amenities'])
            ->firstOrFail();
        
        // Convert to array and explicitly include roomProperties for Inertia serialization
        $propertyData = $property->toArray();
        $propertyData['roomProperties'] = $property->roomProperties->toArray();
        
        return Inertia::render('hotel-owner/rooms/index', [
            'property' => $propertyData
        ]);
    }
    
    /**
     * Show bookings for hotel owner's properties
     */
    public function bookings(): Response
    {
        $user = Auth::user();
        
        $bookings = BookingDetail::whereHas('bookingRooms.roomProperty.property', function($q) use ($user) {
            $q->where('owner_user_id', $user->id);
        })
        ->with([
            'bookingRooms.roomProperty.property.place',
            'user'
        ])
        ->orderBy('created_at', 'desc')
        ->paginate(15);
        
        return Inertia::render('hotel-owner/bookings/index', [
            'bookings' => $bookings
        ]);
    }
}