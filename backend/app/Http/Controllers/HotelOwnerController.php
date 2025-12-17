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
        
        // Revenue Trend Data (last 6 months)
        $revenueTrendData = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $monthRevenue = BookingItem::where('item_type', 'hotel_room')
                ->whereHas('roomProperty.property', function($q) use ($user) {
                    $q->where('owner_user_id', $user->id);
                })
                ->whereHas('booking.payments', function($q) {
                    $q->where('status', 'success');
                })
                ->whereYear('created_at', $date->year)
                ->whereMonth('created_at', $date->month)
                ->sum('total_price');
            
            $monthBookings = BookingItem::where('item_type', 'hotel_room')
                ->whereHas('roomProperty.property', function($q) use ($user) {
                    $q->where('owner_user_id', $user->id);
                })
                ->whereYear('created_at', $date->year)
                ->whereMonth('created_at', $date->month)
                ->count();
            
            $revenueTrendData[] = [
                'month' => $date->format('M'),
                'revenue' => round($monthRevenue, 2),
                'bookings' => $monthBookings
            ];
        }
        
        // Room Type Occupancy Data
        $roomTypeData = RoomProperty::whereHas('property', function($q) use ($user) {
                $q->where('owner_user_id', $user->id);
            })
            ->with('rooms')
            ->get()
            ->map(function($roomProperty) {
                $totalRooms = $roomProperty->rooms->count();
                $occupiedRooms = $roomProperty->rooms->where('is_available', false)->count();
                $occupancyRate = $totalRooms > 0 ? round(($occupiedRooms / $totalRooms) * 100, 1) : 0;
                
                return [
                    'type' => $roomProperty->room_type,
                    'occupancy' => $occupancyRate
                ];
            })
            ->values()
            ->toArray();
        
        // Booking Sources Data (mock for now, can be extended with actual data)
        $totalBookingItems = BookingItem::where('item_type', 'hotel_room')
            ->whereHas('roomProperty.property', function($q) use ($user) {
                $q->where('owner_user_id', $user->id);
            })
            ->count();
        
        $bookingSourceData = [
            ['source' => 'Direct', 'bookings' => round($totalBookingItems * 0.24)],
            ['source' => 'Online', 'bookings' => round($totalBookingItems * 0.43)],
            ['source' => 'Agency', 'bookings' => round($totalBookingItems * 0.20)],
            ['source' => 'Corporate', 'bookings' => round($totalBookingItems * 0.13)],
        ];
        
        // Daily Occupancy Rate (last 7 days)
        $dailyOccupancyData = [];
        $daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i);
            $dayOfWeek = $daysOfWeek[$date->dayOfWeek];
            
            $totalRoomsForDay = Room::whereHas('roomProperty.property', function($q) use ($user) {
                $q->where('owner_user_id', $user->id);
            })->count();
            
            $occupiedRoomsForDay = Room::whereHas('roomProperty.property', function($q) use ($user) {
                $q->where('owner_user_id', $user->id);
            })->where('is_available', false)->count();
            
            $rate = $totalRoomsForDay > 0 ? round(($occupiedRoomsForDay / $totalRoomsForDay) * 100, 1) : 0;
            
            $dailyOccupancyData[] = [
                'day' => $dayOfWeek,
                'rate' => $rate
            ];
        }
        
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
            'revenue_trend_data' => $revenueTrendData,
            'room_type_data' => $roomTypeData,
            'booking_source_data' => $bookingSourceData,
            'daily_occupancy_data' => $dailyOccupancyData,
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
                'roomProperties',
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
                'hotelDetails',
                'assignedRoom'
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
                'assigned_room' => $item->assignedRoom,
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
     * Show a specific booking detail
     */
    public function showBooking($id): Response
    {
        $user = Auth::user();
        
        $bookingItem = BookingItem::where('id', $id)
            ->where('item_type', 'hotel_room')
            ->whereHas('roomProperty.property', function($q) use ($user) {
                $q->where('owner_user_id', $user->id);
            })
            ->with([
                'booking.user',
                'booking.payments',
                'roomProperty.property.place',
                'roomProperty.amenities',
                'hotelDetails',
                'assignedRoom'
            ])
            ->firstOrFail();
        
        // Get available rooms for this room type
        $availableRooms = Room::where('room_properties_id', $bookingItem->item_id)
            ->where('is_available', true)
            ->where('status', 'available')
            ->orderBy('room_number')
            ->get();
        
        return Inertia::render('hotel-owner/bookings/show', [
            'bookingItem' => $bookingItem,
            'availableRooms' => $availableRooms
        ]);
    }

    /**
     * Show edit form for a specific booking
     */
    public function editBooking($id): Response
    {
        $user = Auth::user();
        
        $bookingItem = BookingItem::where('id', $id)
            ->where('item_type', 'hotel_room')
            ->whereHas('roomProperty.property', function($q) use ($user) {
                $q->where('owner_user_id', $user->id);
            })
            ->with([
                'booking.user',
                'booking.payments',
                'roomProperty.property.place',
                'roomProperty.amenities',
                'hotelDetails'
            ])
            ->firstOrFail();
        
        return Inertia::render('hotel-owner/bookings/createEdit', [
            'bookingItem' => $bookingItem
        ]);
    }

    /**
     * Update booking details
     */
    public function updateBooking(Request $request, $id)
    {
        $user = Auth::user();
        
        $bookingItem = BookingItem::where('id', $id)
            ->where('item_type', 'hotel_room')
            ->whereHas('roomProperty.property', function($q) use ($user) {
                $q->where('owner_user_id', $user->id);
            })
            ->with(['hotelDetails'])
            ->firstOrFail();
        
        $validated = $request->validate([
            'status' => 'required|in:pending,confirmed,cancelled,completed',
            'check_in' => 'nullable|date',
            'check_out' => 'nullable|date|after:check_in',
            'quantity' => 'nullable|integer|min:1',
            'notes' => 'nullable|string|max:1000',
            'room_id' => 'nullable|exists:rooms,room_id'
        ]);
        
        // Update booking status
        $bookingItem->booking->update([
            'status' => $validated['status']
        ]);
        
        // Update hotel details if provided
        if (isset($validated['check_in']) || isset($validated['check_out'])) {
            $checkIn = $validated['check_in'] ?? $bookingItem->hotelDetails->check_in;
            $checkOut = $validated['check_out'] ?? $bookingItem->hotelDetails->check_out;
            
            // Calculate nights
            $nights = max(1, (strtotime($checkOut) - strtotime($checkIn)) / 86400);
            
            $bookingItem->hotelDetails->update([
                'check_in' => $checkIn,
                'check_out' => $checkOut,
                'nights' => $nights,
            ]);
        }
        
        // Update quantity if provided
        if (isset($validated['quantity'])) {
            $bookingItem->update([
                'quantity' => $validated['quantity'],
                'total_price' => $bookingItem->unit_price * $bookingItem->hotelDetails->nights * $validated['quantity']
            ]);
            
            // Update booking total
            $bookingItem->booking->update([
                'total_amount' => $bookingItem->total_price
            ]);
        }
        
        // Handle room assignment
        if (isset($validated['room_id'])) {
            // Validate that the room belongs to the correct room type
            $room = Room::where('room_id', $validated['room_id'])
                ->where('room_properties_id', $bookingItem->item_id)
                ->firstOrFail();
            
            // Update the assigned room
            $bookingItem->update([
                'room_id' => $validated['room_id']
            ]);
        }
        
        return redirect()->route('hotel-owner.bookings.show', $id)
            ->with('success', 'Booking updated successfully.');
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
        ->get();
        
        return Inertia::render('hotel-owner/rooms/allRooms', [
            'rooms' => [
                'data' => $rooms,
                'total' => $rooms->count()
            ]
        ]);
    }
}