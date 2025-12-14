<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Transportation;
use App\Models\Bus\Bus;
use App\Models\Bus\BusProperty;
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
        ->with([
            'schedule.route.fromProvince:province_categoryID,province_categoryName',
            'schedule.route.toProvince:province_categoryID,province_categoryName',
            'schedule.bus:id,bus_name',
            'seat:id,seat_number'
        ])
        ->orderBy('created_at', 'desc')
        ->limit(5)
        ->get();
        
        // Transform route data for recent bookings
        $recentBookings->transform(function($booking) {
            if ($booking->schedule && $booking->schedule->route) {
                $booking->schedule->route->origin = $booking->schedule->route->fromProvince->province_categoryName ?? 'N/A';
                $booking->schedule->route->destination = $booking->schedule->route->toProvince->province_categoryName ?? 'N/A';
                unset($booking->schedule->route->fromProvince);
                unset($booking->schedule->route->toProvince);
            }
            return $booking;
        });
        
        // Utilization rate calculation
        $totalSeats = Bus::with('busProperty')
            ->whereHas('transportation', function($q) use ($user) {
                $q->where('owner_user_id', $user->id);
            })
            ->get()
            ->sum(function($bus) {
                return $bus->busProperty ? $bus->busProperty->seat_capacity : 0;
            });
        
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
                'busProperties.buses.schedules',
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
     * Show all bus properties (types)
     */
    public function busProperties()
    {
        // Redirect to companies index where bus types are displayed
        return redirect()->route('transportation-owner.companies.index');
    }

    /**
     * Show the form for creating a new bus property
     */
    public function createBusProperty(): Response
    {
        return Inertia::render('transportation-owner/bus-properties/createEdit');
    }

    /**
     * Store a newly created bus property
     */
    public function storeBusProperty(Request $request)
    {
        $user = Auth::user();
        
        $transportation = Transportation::where('owner_user_id', $user->id)->first();
        
        if (!$transportation) {
            return back()->withErrors(['error' => 'No transportation company found for this user.']);
        }
        
        $validated = $request->validate([
            'bus_type' => 'required|string|max:255',
            'bus_description' => 'nullable|string',
            'seat_capacity' => 'required|integer|min:1|max:100',
            'price_per_seat' => 'nullable|numeric|min:0',
            'features' => 'nullable|string',
            'amenities' => 'nullable|string',
            'images_url' => 'nullable|array',
            'images' => 'nullable|array',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:5120',
            'seat_layout' => 'nullable|string',
        ]);
        
        $allImageUrls = [];
        
        // Handle existing image URLs
        if (!empty($validated['images_url'])) {
            $allImageUrls = array_filter($validated['images_url'], function($url) {
                return filter_var($url, FILTER_VALIDATE_URL);
            });
        }
        
        // Handle file uploads
        if ($request->hasFile('images')) {
            $mediaController = new \App\Http\Controllers\MediaController();
            try {
                $uploadResult = $mediaController->uploadMultipleFiles(
                    $request->file('images'),
                    'bus_properties'
                );
                $allImageUrls = array_merge($allImageUrls, $uploadResult['urls']);
            } catch (\Exception $e) {
                return back()->withErrors(['images' => 'Failed to upload images: ' . $e->getMessage()]);
            }
        }
        
        $busProperty = BusProperty::create([
            'transportation_id' => $transportation->id,
            'bus_type' => $validated['bus_type'],
            'bus_description' => $validated['bus_description'] ?? null,
            'seat_capacity' => $validated['seat_capacity'],
            'price_per_seat' => $validated['price_per_seat'],
            'features' => $validated['features'] ?? null,
            'amenities' => $validated['amenities'] ?? null,
            'image_url' => !empty($allImageUrls) ? json_encode($allImageUrls) : null,
            'seat_layout' => $validated['seat_layout'] ?? null,
        ]);
        
        return redirect()->route('transportation-owner.bus-properties.index')
            ->with('success', 'Bus type created successfully.');
    }

    /**
     * Show the form for editing a bus property
     */
    public function editBusProperty($id): Response
    {
        $user = Auth::user();
        
        $busProperty = BusProperty::whereHas('transportation', function($q) use ($user) {
            $q->where('owner_user_id', $user->id);
        })
        ->findOrFail($id);
        
        return Inertia::render('transportation-owner/bus-properties/createEdit', [
            'busProperty' => $busProperty
        ]);
    }

    /**
     * Update the specified bus property
     */
    public function updateBusProperty(Request $request, $id)
    {
        $user = Auth::user();
        
        $busProperty = BusProperty::whereHas('transportation', function($q) use ($user) {
            $q->where('owner_user_id', $user->id);
        })
        ->findOrFail($id);
        
        $validated = $request->validate([
            'bus_type' => 'required|string|max:255',
            'bus_description' => 'nullable|string',
            'seat_capacity' => 'required|integer|min:1|max:100',
            'price_per_seat' => 'required|numeric|min:0',
            'features' => 'nullable|string',
            'amenities' => 'nullable|string',
            'images_url' => 'nullable|array',
            'images' => 'nullable|array',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:5120',
            'seat_layout' => 'nullable|string',
        ]);
        
        $allImageUrls = [];
        
        // Handle existing image URLs
        if (!empty($validated['images_url'])) {
            $allImageUrls = array_filter($validated['images_url'], function($url) {
                return filter_var($url, FILTER_VALIDATE_URL);
            });
        }
        
        // Handle file uploads
        if ($request->hasFile('images')) {
            $mediaController = new \App\Http\Controllers\MediaController();
            try {
                $uploadResult = $mediaController->uploadMultipleFiles(
                    $request->file('images'),
                    'bus_properties'
                );
                $allImageUrls = array_merge($allImageUrls, $uploadResult['urls']);
            } catch (\Exception $e) {
                return back()->withErrors(['images' => 'Failed to upload images: ' . $e->getMessage()]);
            }
        }
        
        $validated['image_url'] = !empty($allImageUrls) ? json_encode($allImageUrls) : null;
        unset($validated['images_url']);
        unset($validated['images']);
        
        $busProperty->update($validated);
        
        return redirect()->route('transportation-owner.bus-properties.index')
            ->with('success', 'Bus type updated successfully.');
    }

    /**
     * Show all buses across all companies
     */
    public function buses(): Response
    {
        $user = Auth::user();
        
        $transportation = Transportation::where('owner_user_id', $user->id)->first();
        
        if (!$transportation) {
            return Inertia::render('transportation-owner/buses/index', [
                'buses' => [],
                'busProperties' => []
            ]);
        }
        
        $buses = Bus::whereHas('busProperty.transportation', function($q) use ($user) {
            $q->where('owner_user_id', $user->id);
        })
        ->with([
            'busProperty',
            'busProperty.transportation',
            'busProperty.transportation.place',
            'schedules' => function($q) {
                $q->where('status', 'scheduled')->orderBy('departure_time', 'desc')->limit(5);
            }
        ])
        ->paginate(12);
        
        // Ensure relationships are loaded on paginated items
        $buses->getCollection()->load([
            'busProperty',
            'busProperty.transportation',
            'busProperty.transportation.place'
        ]);
        
        $busProperties = BusProperty::where('transportation_id', $transportation->id)
            ->select('id', 'bus_type')
            ->get();
        
        return Inertia::render('transportation-owner/buses/index', [
            'buses' => $buses,
            'busProperties' => $busProperties
        ]);
    }
    
    /**
     * Show bookings for transportation owner's companies
     */
    public function bookings(): Response
    {
        $user = Auth::user();
        
        $bookings = SeatBooking::whereHas('schedule.bus.busProperty.transportation', function($q) use ($user) {
            $q->where('owner_user_id', $user->id);
        })
        ->with([
            'booking.user:id,name,email,phone_number',
            'booking.payments:id,booking_id,status',
            'schedule.route.fromProvince:province_categoryID,province_categoryName',
            'schedule.route.toProvince:province_categoryID,province_categoryName',
            'schedule.bus:id,bus_name,bus_plate,bus_property_id',
            'schedule.bus.busProperty.transportation.place',
            'seat:id,seat_number'
        ])
        ->orderBy('created_at', 'desc')
        ->paginate(15);
        
        // Transform data to match frontend expectations
        $bookings->getCollection()->transform(function($seatBooking) {
            // Map passenger information from booking.user
            $seatBooking->passenger_name = $seatBooking->booking?->user?->name ?? 'Unknown Passenger';
            $seatBooking->passenger_email = $seatBooking->booking?->user?->email ?? null;
            $seatBooking->passenger_phone = $seatBooking->booking?->user?->phone_number ?? null;
            
            // Map booking status
            $seatBooking->booking_status = $seatBooking->booking?->status ?? 'pending';
            $seatBooking->payment_status = $seatBooking->booking?->payments?->first()?->status ?? 'pending';
            
            // Map route origin/destination from province names
            if ($seatBooking->schedule && $seatBooking->schedule->route) {
                $seatBooking->schedule->route->origin = $seatBooking->schedule->route->fromProvince?->province_categoryName ?? 'N/A';
                $seatBooking->schedule->route->destination = $seatBooking->schedule->route->toProvince?->province_categoryName ?? 'N/A';
                
                // Clean up unnecessary relationships
                unset($seatBooking->schedule->route->fromProvince);
                unset($seatBooking->schedule->route->toProvince);
            }
            
            // Clean up the booking relationship to avoid sending unnecessary data
            unset($seatBooking->booking);
            
            return $seatBooking;
        });
        
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
        
        $schedules = BusSchedule::whereHas('bus.busProperty.transportation', function($q) use ($user) {
            $q->where('owner_user_id', $user->id);
        })
        ->with([
            'bus:id,bus_name,bus_plate,bus_property_id',
            'bus.busProperty:id,seat_capacity,transportation_id',
            'bus.busProperty.transportation:id,placeID',
            'bus.busProperty.transportation.place:placeID,name',
            'route:id,from_location,to_location,distance_km,duration_hours',
            'route.fromProvince:province_categoryID,province_categoryName',
            'route.toProvince:province_categoryID,province_categoryName',
            'bookings'
        ])
        ->orderBy('departure_time', 'desc')
        ->paginate(15);
        
        // Map route province names
        $schedules->getCollection()->transform(function($schedule) {
            if ($schedule->route) {
                $schedule->route->from_location = $schedule->route->fromProvince->province_categoryName ?? $schedule->route->from_location;
                $schedule->route->to_location = $schedule->route->toProvince->province_categoryName ?? $schedule->route->to_location;
                unset($schedule->route->fromProvince);
                unset($schedule->route->toProvince);
            }
            return $schedule;
        });
        
        return Inertia::render('transportation-owner/schedules/index', [
            'schedules' => $schedules
        ]);
    }

    /**
     * Show schedule details
     */
    public function showSchedule($id): Response
    {
        $user = Auth::user();
        
        $schedule = BusSchedule::whereHas('bus.busProperty.transportation', function($q) use ($user) {
            $q->where('owner_user_id', $user->id);
        })
        ->with([
            'bus:id,bus_name,bus_plate,bus_property_id,description,is_available,status',
            'bus.busProperty:id,bus_type,seat_capacity,image_url,amenities,features,price_per_seat,transportation_id,seat_layout',
            'bus.busProperty.transportation:id,placeID',
            'bus.busProperty.transportation.place:placeID,name',
            'route:id,from_location,to_location,distance_km,duration_hours',
            'route.fromProvince:province_categoryID,province_categoryName',
            'route.toProvince:province_categoryID,province_categoryName',
            'bookings' => function($query) {
                $query->whereHas('booking', function($q) {
                    $q->whereIn('status', ['pending', 'confirmed', 'completed']);
                });
            },
            'bookings.booking:id,user_id,status',
            'bookings.booking.user:id,name,email,phone_number',
            'bookings.seat:id,seat_number',
        ])
        ->findOrFail($id);
        
        // Map route province names
        if ($schedule->route) {
            $schedule->route->from_location = $schedule->route->fromProvince?->province_categoryName ?? $schedule->route->from_location;
            $schedule->route->to_location = $schedule->route->toProvince?->province_categoryName ?? $schedule->route->to_location;
            unset($schedule->route->fromProvince);
            unset($schedule->route->toProvince);
        }
        
        // Transform bookings to add booking_status at the top level
        if ($schedule->bookings) {
            $schedule->bookings->transform(function($seatBooking) {
                $seatBooking->booking_status = $seatBooking->booking?->status ?? 'pending';
                return $seatBooking;
            });
        }
        
        return Inertia::render('transportation-owner/schedules/show', [
            'schedule' => $schedule
        ]);
    }

    /**
     * Show the form for creating a new bus
     */
    public function createBus(): Response
    {
        $user = Auth::user();
        
        $transportation = Transportation::where('owner_user_id', $user->id)->first();
        
        $busProperties = $transportation 
            ? BusProperty::where('transportation_id', $transportation->id)
                ->select('id', 'bus_type', 'seat_capacity', 'price_per_seat')
                ->get()
            : collect([]);
        
        return Inertia::render('transportation-owner/buses/createEdit', [
            'busProperties' => $busProperties
        ]);
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
            'bus_property_id' => 'required|exists:bus_properties,id',
            'bus_name' => 'required|string|max:255',
            'bus_plate' => 'required|string|max:255|unique:buses,bus_plate',
            'description' => 'nullable|string',
            'is_available' => 'boolean',
            'status' => 'string|in:active,maintenance,retired',
        ]);
        
        // Verify bus property belongs to user's company
        $busProperty = BusProperty::where('id', $validated['bus_property_id'])
            ->where('transportation_id', $transportation->id)
            ->firstOrFail();
        
        $bus = Bus::create([
            'bus_property_id' => $validated['bus_property_id'],
            'bus_name' => $validated['bus_name'],
            'bus_plate' => $validated['bus_plate'],
            'description' => $validated['description'] ?? null,
            'is_available' => $validated['is_available'] ?? true,
            'status' => $validated['status'] ?? 'active',
        ]);
        
        // Seats are automatically created via Bus model boot method
        
        return redirect()->route('transportation-owner.buses.index')
            ->with('success', 'Bus created successfully with ' . $bus->seat_count . ' seats!');
    }

    /**
     * Show a specific bus details
     */
    public function showBus($id): Response
    {
        $user = Auth::user();
        
        $bus = Bus::whereHas('busProperty.transportation', function($q) use ($user) {
            $q->where('owner_user_id', $user->id);
        })
        ->with([
            'busProperty',
            'busProperty.transportation',
            'busProperty.transportation.place',
            'seats' => function($q) {
                $q->orderBy('seat_number');
            },
            'schedules' => function($q) {
                $q->orderBy('departure_time', 'desc')->limit(10);
            },
            'schedules.route',
            'schedules.route.fromProvince:province_categoryID,province_categoryName',
            'schedules.route.toProvince:province_categoryID,province_categoryName',
            'schedules.bookings'
        ])
        ->findOrFail($id);
        
        // Ensure all relationships are loaded
        $bus->load([
            'busProperty',
            'busProperty.transportation',
            'busProperty.transportation.place'
        ]);
        
        // Transform schedules to explicitly map province names
        if ($bus->schedules) {
            $bus->schedules->transform(function($schedule) {
                if ($schedule->route) {
                    // Explicitly set province names as attributes
                    $schedule->route->fromProvinceName = $schedule->route->fromProvince?->province_categoryName ?? $schedule->route->from_location;
                    $schedule->route->toProvinceName = $schedule->route->toProvince?->province_categoryName ?? $schedule->route->to_location;
                }
                return $schedule;
            });
        }
        
        return Inertia::render('transportation-owner/buses/show', [
            'bus' => $bus
        ]);
    }

    /**
     * Show the form for editing a bus
     */
    public function editBus($id): Response
    {
        $user = Auth::user();
        
        $transportation = Transportation::where('owner_user_id', $user->id)->first();
        
        $bus = Bus::whereHas('busProperty.transportation', function($q) use ($user) {
            $q->where('owner_user_id', $user->id);
        })
        ->with('busProperty')
        ->findOrFail($id);
        
        $busProperties = BusProperty::where('transportation_id', $transportation->id)
            ->select('id', 'bus_type', 'seat_capacity', 'price_per_seat')
            ->get();
        
        return Inertia::render('transportation-owner/buses/createEdit', [
            'bus' => $bus,
            'busProperties' => $busProperties
        ]);
    }

    /**
     * Update the specified bus
     */
    public function updateBus(Request $request, $id)
    {
        $user = Auth::user();
        
        $transportation = Transportation::where('owner_user_id', $user->id)->first();
        
        $bus = Bus::whereHas('busProperty.transportation', function($q) use ($user) {
            $q->where('owner_user_id', $user->id);
        })
        ->findOrFail($id);
        
        $validated = $request->validate([
            'bus_property_id' => 'required|exists:bus_properties,id',
            'bus_name' => 'required|string|max:255',
            'bus_plate' => 'required|string|max:255|unique:buses,bus_plate,' . $id,
            'description' => 'nullable|string',
            'is_available' => 'boolean',
            'status' => 'string|in:active,maintenance,retired',
        ]);
        
        // Verify bus property belongs to user's company
        BusProperty::where('id', $validated['bus_property_id'])
            ->where('transportation_id', $transportation->id)
            ->firstOrFail();
        
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
        $buses = Bus::whereHas('busProperty.transportation', function($q) use ($user) {
            $q->where('owner_user_id', $user->id);
        })
        ->with('busProperty:id,seat_capacity')
        ->select('id', 'bus_name', 'bus_plate', 'bus_property_id')
        ->get()
        ->map(function($bus) {
            $bus->seat_capacity = $bus->busProperty?->seat_capacity ?? 0;
            unset($bus->busProperty);
            return $bus;
        });
        
        // Get all available routes
        $routes = \App\Models\Bus\Route::with(['fromProvince:province_categoryID,province_categoryName', 'toProvince:province_categoryID,province_categoryName'])
            ->get()
            ->map(function($route) {
                // Convert duration from hours to minutes for frontend
                $duration = $route->duration_hours ? (int)($route->duration_hours * 60) : null;
                return [
                    'id' => $route->id,
                    'origin' => $route->fromProvince->province_categoryName ?? 'Unknown',
                    'destination' => $route->toProvince->province_categoryName ?? 'Unknown',
                    'distance' => $route->distance_km,
                    'duration' => $duration,
                ];
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
            'status' => 'required|string|in:scheduled,departed,completed,cancelled',
        ]);
        
        // Verify bus belongs to user and get seat capacity
        $bus = Bus::whereHas('busProperty.transportation', function($q) use ($user) {
            $q->where('owner_user_id', $user->id);
        })
        ->with('busProperty:id,seat_capacity')
        ->findOrFail($validated['bus_id']);
        
        // Check for overlapping schedules
        $overlappingSchedule = BusSchedule::where('bus_id', $validated['bus_id'])
            ->where(function($query) use ($validated) {
                $query->whereBetween('departure_time', [$validated['departure_time'], $validated['arrival_time']])
                    ->orWhereBetween('arrival_time', [$validated['departure_time'], $validated['arrival_time']])
                    ->orWhere(function($q) use ($validated) {
                        $q->where('departure_time', '<=', $validated['departure_time'])
                          ->where('arrival_time', '>=', $validated['arrival_time']);
                    });
            })
            ->whereIn('status', ['scheduled', 'departed'])
            ->first();
        
        if ($overlappingSchedule) {
            return back()->withErrors([
                'bus_id' => 'This bus already has a schedule during the selected time period. Please choose a different time or bus.'
            ])->withInput();
        }
        
        $schedule = BusSchedule::create([
            'bus_id' => $validated['bus_id'],
            'route_id' => $validated['route_id'],
            'departure_time' => $validated['departure_time'],
            'arrival_time' => $validated['arrival_time'],
            'price' => $validated['price'],
            'status' => $validated['status'],
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
        $buses = Bus::whereHas('busProperty.transportation', function($q) use ($user) {
            $q->where('owner_user_id', $user->id);
        })
        ->with('busProperty:id,seat_capacity')
        ->select('id', 'bus_name', 'bus_plate', 'bus_property_id')
        ->get()
        ->map(function($bus) {
            $bus->seat_capacity = $bus->busProperty?->seat_capacity ?? 0;
            unset($bus->busProperty);
            return $bus;
        });
        
        // Get all available routes
        $routes = \App\Models\Bus\Route::with(['fromProvince:province_categoryID,province_categoryName', 'toProvince:province_categoryID,province_categoryName'])
            ->get()
            ->map(function($route) {
                // Convert duration from hours to minutes for frontend
                $duration = $route->duration_hours ? (int)($route->duration_hours * 60) : null;
                return [
                    'id' => $route->id,
                    'origin' => $route->fromProvince->province_categoryName ?? 'Unknown',
                    'destination' => $route->toProvince->province_categoryName ?? 'Unknown',
                    'distance' => $route->distance_km,
                    'duration' => $duration,
                ];
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
        
        // Check if this is a status-only update (for quick status changes from index page)
        if ($request->has('status') && count($request->all()) === 1) {
            $validated = $request->validate([
                'status' => 'required|string|in:scheduled,departed,arrived,cancelled',
            ]);
            
            $schedule->update([
                'status' => $validated['status'],
            ]);
            
            return back()->with('success', 'Schedule status updated successfully.');
        }
        
        // Full schedule update
        $validated = $request->validate([
            'bus_id' => 'required|exists:buses,id',
            'route_id' => 'required|exists:routes,id',
            'departure_time' => 'required|date',
            'arrival_time' => 'required|date|after:departure_time',
            'price' => 'required|numeric|min:0',
            'status' => 'required|string|in:scheduled,departed,arrived,cancelled',
        ]);
        
        // Verify bus belongs to user
        Bus::whereHas('busProperty.transportation', function($q) use ($user) {
            $q->where('owner_user_id', $user->id);
        })
        ->findOrFail($validated['bus_id']);
        
        // Check for overlapping schedules (exclude current schedule)
        $overlappingSchedule = BusSchedule::where('bus_id', $validated['bus_id'])
            ->where('id', '!=', $schedule->id)
            ->where(function($query) use ($validated) {
                $query->whereBetween('departure_time', [$validated['departure_time'], $validated['arrival_time']])
                    ->orWhereBetween('arrival_time', [$validated['departure_time'], $validated['arrival_time']])
                    ->orWhere(function($q) use ($validated) {
                        $q->where('departure_time', '<=', $validated['departure_time'])
                          ->where('arrival_time', '>=', $validated['arrival_time']);
                    });
            })
            ->whereIn('status', ['scheduled', 'departed'])
            ->first();
        
        if ($overlappingSchedule) {
            return back()->withErrors([
                'bus_id' => 'This bus already has a schedule during the selected time period. Please choose a different time or bus.'
            ])->withInput();
        }
        
        $schedule->update([
            'bus_id' => $validated['bus_id'],
            'route_id' => $validated['route_id'],
            'departure_time' => $validated['departure_time'],
            'arrival_time' => $validated['arrival_time'],
            'price' => $validated['price'],
            'status' => $validated['status'],
        ]);
        
        return redirect()->route('transportation-owner.schedules.index')
            ->with('success', 'Schedule updated successfully.');
    }

    /**
     * Delete a schedule
     */
    public function destroySchedule($id)
    {
        $user = Auth::user();
        
        $schedule = BusSchedule::whereHas('bus.busProperty.transportation', function($q) use ($user) {
            $q->where('owner_user_id', $user->id);
        })
        ->findOrFail($id);
        
        // Check if schedule has any bookings
        if ($schedule->bookings && $schedule->bookings->count() > 0) {
            return redirect()->route('transportation-owner.schedules.index')
                ->with('error', 'Cannot delete schedule with existing bookings. Please cancel or complete all bookings first.');
        }
        
        $schedule->delete();
        
        return redirect()->route('transportation-owner.schedules.index')
            ->with('success', 'Schedule deleted successfully.');
    }
}
