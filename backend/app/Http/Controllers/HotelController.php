<?php

namespace App\Http\Controllers;

use App\Models\Hotel\Property;
use App\Models\Hotel\RoomProperty;
use App\Models\Hotel\Facility;
use App\Models\Hotel\Amenity;
use App\Models\Booking\Booking;
use App\Models\Booking\BookingItem;
use App\Models\Booking\BookingHotelDetail;
use App\Models\Payment\Payment;
use App\Models\Place;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class HotelController extends Controller
{
    /**
     * Display a listing of hotel properties for admin dashboard.
     */
    public function index(Request $request)
    {
        $query = Property::with([
            'place:placeID,name,description,ratings,reviews_count,images_url,province_id',
            'place.provinceCategory:province_categoryID,province_categoryName',
            'ownerUser:id,name,email',
            'roomProperties:room_properties_id,property_id,room_type,price_per_night',
            'roomProperties.rooms:room_id,room_properties_id,is_available',
            'facilities:facility_id,facility_name'
        ]);

        // Search functionality
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('place', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            })->orWhereHas('ownerUser', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filter by province
        if ($request->filled('province')) {
            $query->whereHas('place', function ($q) use ($request) {
                $q->where('province_id', $request->province);
            });
        }

        // Filter by rating
        if ($request->filled('rating')) {
            $query->whereHas('place', function ($q) use ($request) {
                $q->where('ratings', '>=', $request->rating);
            });
        }

        // Filter by availability (checking individual rooms)
        if ($request->filled('availability')) {
            if ($request->availability === 'available') {
                $query->whereHas('roomProperties.rooms', function ($q) {
                    $q->where('is_available', true);
                });
            } elseif ($request->availability === 'unavailable') {
                $query->whereDoesntHave('roomProperties.rooms', function ($q) {
                    $q->where('is_available', true);
                });
            }
        }

        // Get per_page parameter or default to 10
        $perPage = $request->input('per_page', 10);
        $perPage = in_array($perPage, [10, 20, 30, 40, 50]) ? $perPage : 10;

        $properties = $query->orderBy('created_at', 'desc')
                           ->paginate($perPage)
                           ->withQueryString();

        // Transform properties for display
        $properties->getCollection()->transform(function ($property) {
            // Count available individual rooms
            $availableRooms = $property->roomProperties->sum(function ($roomProperty) {
                return $roomProperty->rooms->where('is_available', true)->count();
            });
            $totalRooms = $property->roomProperties->sum(function ($roomProperty) {
                return $roomProperty->rooms->count();
            });
            $priceRange = $this->getPriceRange($property->roomProperties);
            
            return [
                'property_id' => $property->property_id,
                'place' => [
                    'placeID' => $property->place->placeID,
                    'name' => $property->place->name,
                    'description' => $property->place->description,
                    'ratings' => $property->place->ratings,
                    'reviews_count' => $property->place->reviews_count,
                    'images_url' => $property->place->images_url,
                    'province' => $property->place->provinceCategory->province_categoryName ?? 'N/A',
                ],
                'owner' => [
                    'id' => $property->ownerUser->id,
                    'name' => $property->ownerUser->name,
                    'email' => $property->ownerUser->email,
                ],
                'room_stats' => [
                    'available' => $availableRooms,
                    'total' => $totalRooms,
                    'price_range' => $priceRange,
                ],
                'facilities_count' => $property->facilities->count(),
                'created_at' => $property->created_at,
            ];
        });

        // Get filter options
        $provinces = Place::with('provinceCategory')
                          ->whereHas('properties')
                          ->get()
                          ->pluck('provinceCategory')
                          ->unique('province_categoryID')
                          ->values();

        return Inertia::render('hotels/index', [
            'properties' => $properties,
            'filters' => [
                'search' => $request->search,
                'province' => $request->province,
                'rating' => $request->rating,
                'availability' => $request->availability,
            ],
            'provinces' => $provinces,
        ]);
    }

    /**
     * Show the form for creating a new hotel property.
     */
    public function create()
    {
        // Get available places that are hotels (category_id = 3) and not already assigned to a property
        $availablePlaces = Place::whereDoesntHave('properties')
                                ->where('category_id', 3) // Filter for hotel category only
                                ->with('provinceCategory')
                                ->orderBy('name')
                                ->get(['placeID', 'name', 'province_id']);

        // Get users with 'hotel owner' role who don't own any properties yet
        $owners = User::role('hotel owner')
                     ->whereDoesntHave('ownedProperties')
                     ->orderBy('name')
                     ->get(['id', 'name', 'email']);

        // Get available facilities
        $facilities = Facility::orderBy('facility_name')->get(['facility_id', 'facility_name']);

        // Get available amenities
        $amenities = Amenity::orderBy('amenity_name')->get(['amenity_id', 'amenity_name']);

        return Inertia::render('hotels/createEdit', [
            'availablePlaces' => $availablePlaces,
            'owners' => $owners,
            'facilities' => $facilities,
            'amenities' => $amenities,
        ]);
    }

    /**
     * Store a newly created hotel property in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'owner_user_id' => 'required|exists:users,id',
            'place_id' => 'required|exists:places,placeID|unique:properties,place_id',
            'facilities' => 'nullable|array',
            'facilities.*' => 'exists:facilities,facility_id',
            'rooms' => 'nullable|array',
            'rooms.*.room_type' => 'required|string|max:255',
            'rooms.*.room_description' => 'nullable|string',
            'rooms.*.max_guests' => 'required|integer|min:1',
            'rooms.*.room_size' => 'nullable|numeric|min:0',
            'rooms.*.price_per_night' => 'required|numeric|min:0',
            'rooms.*.amenities' => 'array',
            'rooms.*.amenities.*' => 'exists:amenities,amenity_id',
        ]);

        DB::beginTransaction();
        try {
            // Create the property
            $property = Property::create([
                'owner_user_id' => $validated['owner_user_id'],
                'place_id' => $validated['place_id'],
            ]);

            // Attach facilities if provided
            if (!empty($validated['facilities'])) {
                $property->facilities()->attach($validated['facilities']);
            }

            // Create room properties if provided
            if (!empty($validated['rooms'])) {
                foreach ($validated['rooms'] as $roomData) {
                    $room = RoomProperty::create([
                        'property_id' => $property->property_id,
                        'room_type' => $roomData['room_type'],
                        'room_description' => $roomData['room_description'] ?? null,
                        'max_guests' => $roomData['max_guests'],
                        'room_size' => $roomData['room_size'] ?? null,
                        'price_per_night' => $roomData['price_per_night'],
                    ]);

                    // Attach amenities to room if provided
                    if (!empty($roomData['amenities'])) {
                        $room->amenities()->attach($roomData['amenities']);
                    }
                }
            }

            DB::commit();

            return redirect()->route('hotels.index')->with('success', 'Hotel property created successfully! The hotel owner can now add facilities and rooms.');

        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Failed to create hotel property', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);

            return back()->withErrors(['error' => 'Failed to create hotel property. Please try again.'])
                        ->withInput();
        }
    }

    /**
     * Display the specified hotel property.
     */
    public function show($id)
    {
        $property = Property::with([
            'place:placeID,name,description,google_maps_link,ratings,reviews_count,images_url,entry_free,operating_hours,latitude,longitude,province_id,category_id',
            'place.provinceCategory:province_categoryID,province_categoryName,category_description',
            'place.category:placeCategoryID,category_name,category_description',
            'ownerUser:id,name,email,phone_number',
            'facilities:facility_id,facility_name,image_url',
            'roomProperties:room_properties_id,property_id,room_type,room_description,max_guests,room_size,price_per_night,images_url',
            'roomProperties.amenities:amenity_id,amenity_name,image_url',
            'roomProperties.rooms:room_id,room_properties_id,is_available'
        ])->findOrFail($id);

        // Get booking statistics
        $bookingStats = $this->getBookingStats($id);

        return Inertia::render('hotels/show', [
            'property' => [
                'property_id' => $property->property_id,
                'place' => $property->place,
                'owner' => $property->ownerUser,
                'facilities' => $property->facilities,
                'rooms' => $property->roomProperties,
                'created_at' => $property->created_at,
                'updated_at' => $property->updated_at,
            ],
            'bookingStats' => $bookingStats,
        ]);
    }

    /**
     * Show the form for editing the specified hotel property.
     */
    public function edit($id)
    {
        $property = Property::with([
            'place',
            'ownerUser',
            'facilities',
            'roomProperties.amenities'
        ])->findOrFail($id);

        // Get users who can own properties (admin and superadmin roles)
        $owners = User::role(['admin', 'superadmin'])
                     ->orderBy('name')
                     ->get(['id', 'name', 'email']);

        // Get available facilities
        $facilities = Facility::orderBy('facility_name')->get(['facility_id', 'facility_name']);

        // Get available amenities
        $amenities = Amenity::orderBy('amenity_name')->get(['amenity_id', 'amenity_name']);

        return Inertia::render('hotels/createEdit', [
            'property' => [
                'property_id' => $property->property_id,
                'owner_user_id' => $property->owner_user_id,
                'place_id' => $property->place_id,
                'place' => $property->place,
                'owner' => $property->ownerUser,
                'facilities' => $property->facilities->pluck('facility_id')->toArray(),
                'rooms' => $property->roomProperties->map(function ($room) {
                    return [
                        'room_properties_id' => $room->room_properties_id,
                        'room_type' => $room->room_type,
                        'room_description' => $room->room_description,
                        'max_guests' => $room->max_guests,
                        'room_size' => $room->room_size,
                        'price_per_night' => $room->price_per_night,
                        'is_available' => $room->is_available,
                        'amenities' => $room->amenities->pluck('amenity_id')->toArray(),
                    ];
                }),
            ],
            'owners' => $owners,
            'facilities' => $facilities,
            'amenities' => $amenities,
        ]);
    }

    /**
     * Update the specified hotel property in storage.
     */
    public function update(Request $request, $id)
    {
        $property = Property::findOrFail($id);

        $validated = $request->validate([
            'owner_user_id' => 'required|exists:users,id',
            'facilities' => 'array',
            'facilities.*' => 'exists:facilities,facility_id',
            'rooms' => 'required|array|min:1',
            'rooms.*.room_properties_id' => 'nullable|exists:room_properties,room_properties_id',
            'rooms.*.room_type' => 'required|string|max:255',
            'rooms.*.room_description' => 'nullable|string',
            'rooms.*.max_guests' => 'required|integer|min:1',
            'rooms.*.room_size' => 'nullable|numeric|min:0',
            'rooms.*.price_per_night' => 'required|numeric|min:0',
            'rooms.*.amenities' => 'array',
            'rooms.*.amenities.*' => 'exists:amenities,amenity_id',
        ]);

        DB::beginTransaction();
        try {
            // Update property
            $property->update([
                'owner_user_id' => $validated['owner_user_id'],
            ]);

            // Sync facilities
            $property->facilities()->sync($validated['facilities'] ?? []);

            // Get existing room IDs
            $existingRoomIds = $property->roomProperties->pluck('room_properties_id')->toArray();
            $updatedRoomIds = [];

            // Update or create rooms
            foreach ($validated['rooms'] as $roomData) {
                if (!empty($roomData['room_properties_id'])) {
                    // Update existing room
                    $room = RoomProperty::findOrFail($roomData['room_properties_id']);
                    $room->update([
                        'room_type' => $roomData['room_type'],
                        'room_description' => $roomData['room_description'] ?? null,
                        'max_guests' => $roomData['max_guests'],
                        'room_size' => $roomData['room_size'] ?? null,
                        'price_per_night' => $roomData['price_per_night'],
                    ]);
                    $updatedRoomIds[] = $room->room_properties_id;
                } else {
                    // Create new room
                    $room = RoomProperty::create([
                        'property_id' => $property->property_id,
                        'room_type' => $roomData['room_type'],
                        'room_description' => $roomData['room_description'] ?? null,
                        'max_guests' => $roomData['max_guests'],
                        'room_size' => $roomData['room_size'] ?? null,
                        'price_per_night' => $roomData['price_per_night'],
                    ]);
                    $updatedRoomIds[] = $room->room_properties_id;
                }

                // Sync amenities for this room
                $room->amenities()->sync($roomData['amenities'] ?? []);
            }

            // Delete rooms that were removed
            $roomsToDelete = array_diff($existingRoomIds, $updatedRoomIds);
            if (!empty($roomsToDelete)) {
                RoomProperty::whereIn('room_properties_id', $roomsToDelete)->delete();
            }

            DB::commit();

            return redirect()->route('hotels.index')->with('success', 'Hotel property updated successfully!');

        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Failed to update hotel property', [
                'property_id' => $id,
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);

            return back()->withErrors(['error' => 'Failed to update hotel property. Please try again.'])
                        ->withInput();
        }
    }

    /**
     * Remove the specified hotel property from storage.
     */
    public function destroy($id)
    {
        $property = Property::findOrFail($id);

        DB::beginTransaction();
        try {
            // Check if there are any active bookings for this property's rooms
            $activeBookings = BookingItem::where('item_type', 'hotel_room')
                ->whereHas('roomProperty', function ($query) use ($property) {
                    $query->where('property_id', $property->property_id);
                })
                ->whereHas('booking', function ($query) {
                    $query->whereIn('status', ['pending', 'confirmed', 'processing']);
                })
                ->count();

            if ($activeBookings > 0) {
                return back()->withErrors(['error' => 'Cannot delete hotel property with active bookings.']);
            }

            // Delete related records (cascade deletes should handle most)
            $property->facilities()->detach();
            
            // Delete room amenities
            foreach ($property->roomProperties as $room) {
                $room->amenities()->detach();
            }
            
            // Delete room properties
            $property->roomProperties()->delete();
            
            // Delete property
            $property->delete();

            DB::commit();

            return redirect()->route('hotels.index')->with('success', 'Hotel property deleted successfully!');

        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Failed to delete hotel property', [
                'property_id' => $id,
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);

            return back()->withErrors(['error' => 'Failed to delete hotel property. Please try again.']);
        }
    }

    /**
     * Get dashboard statistics for hotels.
     */
    public function dashboard()
    {
        // Count hotel bookings (booking items with type 'hotel_room')
        $totalHotelBookings = BookingItem::where('item_type', 'hotel_room')->count();
        
        // Count confirmed bookings
        $confirmedBookings = BookingItem::where('item_type', 'hotel_room')
            ->whereHas('booking', function ($query) {
                $query->where('status', 'confirmed');
            })
            ->count();
        
        // Count pending bookings
        $pendingBookings = BookingItem::where('item_type', 'hotel_room')
            ->whereHas('booking', function ($query) {
                $query->where('status', 'pending');
            })
            ->count();
        
        // Calculate total revenue from successful hotel bookings
        $totalRevenue = BookingItem::where('item_type', 'hotel_room')
            ->whereHas('booking.payments', function ($query) {
                $query->where('status', 'success');
            })
            ->sum('total_price');
        
        $stats = [
            'total_properties' => Property::count(),
            'total_rooms' => \App\Models\Hotel\Room::count(),
            'available_rooms' => \App\Models\Hotel\Room::where('is_available', true)->count(),
            'total_bookings' => $totalHotelBookings,
            'confirmed_bookings' => $confirmedBookings,
            'pending_bookings' => $pendingBookings,
            'total_revenue' => $totalRevenue,
        ];

        // Recent properties
        $recentProperties = Property::with(['place:placeID,name', 'ownerUser:id,name'])
                                   ->orderBy('created_at', 'desc')
                                   ->limit(5)
                                   ->get();

        // Top properties by bookings
        $topProperties = Property::with(['place:placeID,name'])
                                ->withCount(['roomProperties as booking_count' => function ($query) {
                                    $query->join('booking_rooms', 'room_properties.room_properties_id', '=', 'booking_rooms.room_id')
                                          ->join('booking_details', 'booking_rooms.booking_id', '=', 'booking_details.booking_id')
                                          ->where('booking_details.status', 'paid');
                                }])
                                ->orderBy('booking_count', 'desc')
                                ->limit(5)
                                ->get();

        return Inertia::render('hotels/dashboard', [
            'stats' => $stats,
            'recentProperties' => $recentProperties,
            'topProperties' => $topProperties,
        ]);
    }

    /**
     * Helper method to get price range for room properties.
     */
    private function getPriceRange($roomProperties)
    {
        if ($roomProperties->isEmpty()) {
            return 'N/A';
        }

        $prices = $roomProperties->pluck('price_per_night');
        $min = $prices->min();
        $max = $prices->max();

        if ($min === $max) {
            return '$' . number_format($min, 2);
        }

        return '$' . number_format($min, 2) . ' - $' . number_format($max, 2);
    }

    /**
     * Helper method to get booking statistics for a property.
     */
    private function getBookingStats($propertyId)
    {
        $property = Property::findOrFail($propertyId);
        
        // Get all booking items for this property's rooms
        $totalBookings = BookingItem::where('item_type', 'hotel_room')
            ->whereHas('roomProperty', function ($query) use ($property) {
                $query->where('property_id', $property->property_id);
            })
            ->count();
        
        // Get confirmed bookings
        $confirmedBookings = BookingItem::where('item_type', 'hotel_room')
            ->whereHas('roomProperty', function ($query) use ($property) {
                $query->where('property_id', $property->property_id);
            })
            ->whereHas('booking', function ($query) {
                $query->where('status', 'confirmed');
            })
            ->count();
        
        // Get pending bookings
        $pendingBookings = BookingItem::where('item_type', 'hotel_room')
            ->whereHas('roomProperty', function ($query) use ($property) {
                $query->where('property_id', $property->property_id);
            })
            ->whereHas('booking', function ($query) {
                $query->where('status', 'pending');
            })
            ->count();
        
        // Calculate revenue from successful payments
        $totalRevenue = BookingItem::where('item_type', 'hotel_room')
            ->whereHas('roomProperty', function ($query) use ($property) {
                $query->where('property_id', $property->property_id);
            })
            ->whereHas('booking.payments', function ($query) {
                $query->where('status', 'success');
            })
            ->sum('total_price');
        
        return [
            'total_bookings' => $totalBookings,
            'confirmed_bookings' => $confirmedBookings,
            'pending_bookings' => $pendingBookings,
            'total_revenue' => $totalRevenue,
        ];
    }
}