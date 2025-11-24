<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Hotel\Property;
use App\Models\Hotel\RoomProperty;
use App\Models\Hotel\Room;
use App\Models\Booking\Booking;
use App\Models\Booking\BookingItem;
use App\Models\Booking\BookingHotelDetail;
use App\Models\Payment\Payment;
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
        $totalRooms = Room::whereHas('roomProperty.property', function($q) use ($user) {
            $q->where('owner_user_id', $user->id);
        })->count();
        
        $availableRooms = Room::whereHas('roomProperty.property', function($q) use ($user) {
            $q->where('owner_user_id', $user->id);
        })->where('is_available', true)->count();
        
        // Count total bookings for this owner's properties
        $totalBookings = BookingItem::where('item_type', 'hotel_room')
            ->whereHas('roomProperty.property', function($q) use ($user) {
                $q->where('owner_user_id', $user->id);
            })
            ->count();
        
        // Calculate total revenue from successful payments
        $totalRevenue = BookingItem::where('item_type', 'hotel_room')
            ->whereHas('roomProperty.property', function($q) use ($user) {
                $q->where('owner_user_id', $user->id);
            })
            ->whereHas('booking.payments', function($q) {
                $q->where('status', 'success');
            })
            ->sum('total_price');
        
        // Recent bookings with booking details
        $recentBookings = BookingItem::where('item_type', 'hotel_room')
            ->whereHas('roomProperty.property', function($q) use ($user) {
                $q->where('owner_user_id', $user->id);
            })
            ->with([
                'booking.user',
                'roomProperty.property.place',
                'hotelDetails'
            ])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();
        
        // Occupancy rate calculation (simplified)
        $occupancyRate = $totalRooms > 0 ? (($totalRooms - $availableRooms) / $totalRooms) * 100 : 0;
        
        // Average daily rate
        $avgDailyRate = $totalBookings > 0 ? $totalRevenue / $totalBookings : 0;
        
        // Recent revenue (last 7 days)
        $recentRevenue = BookingItem::where('item_type', 'hotel_room')
            ->whereHas('roomProperty.property', function($q) use ($user) {
                $q->where('owner_user_id', $user->id);
            })
            ->whereHas('booking.payments', function($q) {
                $q->where('status', 'success');
            })
            ->where('created_at', '>=', now()->subDays(7))
            ->sum('total_price');
        
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
     * Since hotel owner manages only 1 property, show it directly
     */
    public function index(): Response
    {
        $user = Auth::user();
        
        $property = Property::where('owner_user_id', $user->id)
            ->with([
                'place',
                'roomProperties.rooms',
                'roomProperties.amenities',
                'facilities'
            ])
            ->first();
        
        return Inertia::render('hotel-owner/properties/index', [
            'property' => $property
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
        
        // Count bookings for this property
        $bookingsCount = BookingItem::where('item_type', 'hotel_room')
            ->whereHas('roomProperty', function($q) use ($property) {
                $q->where('property_id', $property->property_id);
            })
            ->count();
        
        // Calculate revenue from successful payments
        $revenue = BookingItem::where('item_type', 'hotel_room')
            ->whereHas('roomProperty', function($q) use ($property) {
                $q->where('property_id', $property->property_id);
            })
            ->whereHas('booking.payments', function($q) {
                $q->where('status', 'success');
            })
            ->sum('total_price');
        
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
     * Show bookings for hotel owner's properties
     */
    public function bookings(): Response
    {
        $user = Auth::user();
        
        // Get booking items for this owner's properties
        $bookingItems = BookingItem::where('item_type', 'hotel_room')
            ->whereHas('roomProperty.property', function($q) use ($user) {
                $q->where('owner_user_id', $user->id);
            })
            ->with([
                'booking.user',
                'booking.payments',
                'roomProperty.property.place',
                'hotelDetails'
            ])
            ->orderBy('created_at', 'desc')
            ->paginate(15);
        
        // Transform booking items to include relevant booking information
        $bookings = $bookingItems->through(function ($item) {
            return [
                'id' => $item->id,
                'booking_id' => $item->booking_id,
                'booking' => $item->booking,
                'room_property' => $item->roomProperty,
                'hotel_details' => $item->hotelDetails,
                'quantity' => $item->quantity,
                'unit_price' => $item->unit_price,
                'total_price' => $item->total_price,
                'created_at' => $item->created_at,
                'updated_at' => $item->updated_at,
            ];
        });
        
        return Inertia::render('hotel-owner/bookings/index', [
            'bookings' => $bookings
        ]);
    }

    /**
     * Show all individual rooms (not room types) across all properties
     */
    public function allRooms(): Response
    {
        $user = Auth::user();
        
        $rooms = Room::whereHas('roomProperty.property', function($q) use ($user) {
            $q->where('owner_user_id', $user->id);
        })
        ->with([
            'roomProperty:room_properties_id,property_id,room_type,price_per_night,max_guests,room_size,images_url',
            'roomProperty.property:property_id,place_id',
            'roomProperty.property.place:placeID,name',
            'roomProperty.amenities:amenity_id,amenity_name'
        ])
        ->orderBy('room_number')
        ->paginate(12);
        
        return Inertia::render('hotel-owner/rooms/allRooms', [
            'rooms' => $rooms
        ]);
    }
}