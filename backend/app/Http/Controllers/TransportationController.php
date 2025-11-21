<?php

namespace App\Http\Controllers;

use App\Models\Transportation;
use App\Models\Bus\Bus;
use App\Models\User;
use App\Models\Place;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TransportationController extends Controller
{
    /**
     * Display a listing of transportation companies for admin dashboard.
     */
    public function index(Request $request)
    {
        $query = Transportation::with([
            'place.category:placeCategoryID,category_name',
            'place.provinceCategory:province_categoryID,province_categoryName',
            'owner:id,name,email,phone_number',
            'buses:id,bus_name,bus_plate,seat_capacity,transportation_id'
        ]);

        // Apply search filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereHas('place', function ($placeQuery) use ($search) {
                    $placeQuery->where('name', 'like', "%{$search}%")
                               ->orWhere('description', 'like', "%{$search}%");
                })->orWhereHas('owner', function ($ownerQuery) use ($search) {
                    $ownerQuery->where('name', 'like', "%{$search}%")
                               ->orWhere('email', 'like', "%{$search}%");
                });
            });
        }

        // Filter by owner
        if ($request->filled('owner')) {
            $query->where('owner_user_id', $request->owner);
        }

        // Filter by bus availability (companies with available buses)
        if ($request->filled('has_buses')) {
            if ($request->has_buses === 'yes') {
                $query->has('buses');
            } elseif ($request->has_buses === 'no') {
                $query->doesntHave('buses');
            }
        }

        // Get per_page parameter or default to 10
        $perPage = $request->input('per_page', 10);
        $perPage = in_array($perPage, [10, 20, 30, 40, 50]) ? $perPage : 10;

        $transportations = $query->orderBy('created_at', 'desc')
                                 ->paginate($perPage)
                                 ->withQueryString();

        // Transform transportations for display
        $transportations->getCollection()->transform(function ($transportation) {
            $totalBuses = $transportation->buses->count();
            $totalCapacity = $transportation->buses->sum(function($bus) {
                return $bus->busProperty ? $bus->busProperty->seat_capacity : 0;
            });
            $activeRoutesCount = $transportation->buses()
                ->whereHas('schedules', function ($q) {
                    $q->where('status', 'scheduled');
                })
                ->distinct('id')
                ->count();
            
            return [
                'id' => $transportation->id,
                'placeID' => $transportation->placeID,
                'owner_user_id' => $transportation->owner_user_id,
                'place' => [
                    'placeID' => $transportation->place->placeID,
                    'name' => $transportation->place->name,
                    'description' => $transportation->place->description,
                    'images_url' => $transportation->place->images_url,
                    'category' => $transportation->place->category ? [
                        'placeCategoryName' => $transportation->place->category->category_name,
                    ] : null,
                    'provinceCategory' => $transportation->place->provinceCategory ? [
                        'province_categoryName' => $transportation->place->provinceCategory->province_categoryName,
                    ] : null,
                ],
                'owner' => [
                    'id' => $transportation->owner->id,
                    'name' => $transportation->owner->name,
                    'email' => $transportation->owner->email,
                ],
                'buses_count' => $totalBuses,
                'total_capacity' => $totalCapacity,
                'active_routes_count' => $activeRoutesCount,
                'created_at' => $transportation->created_at,
                'updated_at' => $transportation->updated_at,
            ];
        });

        return Inertia::render('transportations/index', [
            'transportations' => $transportations,
            'filters' => [
                'search' => $request->search,
            ],
        ]);
    }

    /**
     * Show the form for creating a new transportation company.
     */
    public function create()
    {
        // Get available places that are transportation-related (category_id = 8) and not already assigned to a transportation company
        $availablePlaces = Place::whereDoesntHave('transportations')
                                ->where('category_id', 8) // Filter for transportation category
                                ->with(['provinceCategory', 'category'])
                                ->orderBy('name')
                                ->get(['placeID', 'name', 'province_id', 'category_id']);

        // Get users with 'transportation owner' role who don't own any transportation companies yet
        $owners = User::role('transportation owner')
                     ->whereDoesntHave('ownedTransportations')
                     ->orderBy('name')
                     ->get(['id', 'name', 'email']);

        return Inertia::render('transportations/createEdit', [
            'availablePlaces' => $availablePlaces,
            'owners' => $owners,
        ]);
    }

    /**
     * Store a newly created transportation company in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'owner_user_id' => 'required|exists:users,id',
            'placeID' => 'required|exists:places,placeID|unique:transportations,placeID',
        ]);

        DB::beginTransaction();
        try {
            // Create the transportation company
            $transportation = Transportation::create([
                'owner_user_id' => $validated['owner_user_id'],
                'placeID' => $validated['placeID'],
            ]);

            DB::commit();

            return redirect()->route('transportations.index')
                           ->with('success', 'Transportation company created successfully! The transportation owner can now add buses and manage schedules.');

        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Failed to create transportation company', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);

            return back()->withErrors(['error' => 'Failed to create transportation company. Please try again.'])
                        ->withInput();
        }
    }

    /**
     * Display the specified transportation company.
     */
    public function show($id)
    {
        $transportation = Transportation::with([
            'place.provinceCategory:province_categoryID,province_categoryName',
            'owner:id,name,email,phone_number',
            'buses:id,bus_name,bus_plate,bus_property_id,transportation_id,created_at',
            'buses.busProperty:id,seat_capacity',
            'buses.schedules:id,bus_id,route_id,departure_time,arrival_time,price,status'
        ])->findOrFail($id);

        // Calculate statistics
        $totalBuses = $transportation->buses->count();
        $totalCapacity = $transportation->buses->sum(function($bus) {
            return $bus->busProperty ? $bus->busProperty->seat_capacity : 0;
        });
        $activeBuses = $transportation->buses->filter(function ($bus) {
            return $bus->schedules->where('status', 'scheduled')->count() > 0;
        })->count();

        // Get schedule statistics
        $totalSchedules = $transportation->buses->sum(function ($bus) {
            return $bus->schedules->count();
        });
        $activeSchedules = $transportation->buses->sum(function ($bus) {
            return $bus->schedules->where('status', 'scheduled')->count();
        });

        return Inertia::render('transportations/show', [
            'transportation' => [
                'id' => $transportation->id,
                'placeID' => $transportation->placeID,
                'owner_user_id' => $transportation->owner_user_id,
                'place' => [
                    'placeID' => $transportation->place->placeID,
                    'name' => $transportation->place->name,
                    'description' => $transportation->place->description,
                    'images_url' => $transportation->place->images_url,
                    'provinceCategory' => $transportation->place->provinceCategory ? [
                        'province_categoryName' => $transportation->place->provinceCategory->province_categoryName,
                    ] : null,
                ],
                'owner' => [
                    'id' => $transportation->owner->id,
                    'name' => $transportation->owner->name,
                    'email' => $transportation->owner->email,
                    'phone_number' => $transportation->owner->phone_number,
                ],
                'buses' => $transportation->buses->map(function ($bus) {
                    return [
                        'id' => $bus->id,
                        'bus_name' => $bus->bus_name,
                        'bus_plate' => $bus->bus_plate,
                        'seat_capacity' => $bus->seat_capacity,
                        'created_at' => $bus->created_at,
                    ];
                }),
                'created_at' => $transportation->created_at,
                'updated_at' => $transportation->updated_at,
            ],
            'stats' => [
                'total_buses' => $totalBuses,
                'active_buses' => $activeBuses,
                'total_capacity' => $totalCapacity,
                'total_schedules' => $totalSchedules,
                'active_schedules' => $activeSchedules,
            ],
        ]);
    }

    /**
     * Show the form for editing the specified transportation company.
     */
    public function edit($id)
    {
        $transportation = Transportation::with([
            'place.category',
            'owner',
        ])->findOrFail($id);

        // Get users who can own transportation companies (admin and superadmin roles)
        $owners = User::role(['admin', 'superadmin'])
                     ->orderBy('name')
                     ->get(['id', 'name', 'email']);

        return Inertia::render('transportations/createEdit', [
            'transportation' => [
                'id' => $transportation->id,
                'owner_user_id' => $transportation->owner_user_id,
                'placeID' => $transportation->placeID,
                'place' => $transportation->place,
                'owner' => $transportation->owner,
            ],
            'owners' => $owners,
        ]);
    }

    /**
     * Update the specified transportation company in storage.
     */
    public function update(Request $request, $id)
    {
        $transportation = Transportation::findOrFail($id);

        $validated = $request->validate([
            'owner_user_id' => 'required|exists:users,id',
        ]);

        DB::beginTransaction();
        try {
            // Update transportation company
            $transportation->update([
                'owner_user_id' => $validated['owner_user_id'],
            ]);

            DB::commit();

            return redirect()->route('transportations.index')
                           ->with('success', 'Transportation company updated successfully!');

        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Failed to update transportation company', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'transportation_id' => $id,
            ]);

            return back()->withErrors(['error' => 'Failed to update transportation company. Please try again.'])
                        ->withInput();
        }
    }

    /**
     * Remove the specified transportation company from storage.
     */
    public function destroy($id)
    {
        $transportation = Transportation::findOrFail($id);

        // Check if transportation has buses
        if ($transportation->buses()->count() > 0) {
            return back()->withErrors([
                'error' => 'Cannot delete transportation company with existing buses. Please delete all buses first.'
            ]);
        }

        DB::beginTransaction();
        try {
            $transportation->delete();

            DB::commit();

            return redirect()->route('transportations.index')
                           ->with('success', 'Transportation company deleted successfully!');

        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Failed to delete transportation company', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'transportation_id' => $id,
            ]);

            return back()->withErrors(['error' => 'Failed to delete transportation company. Please try again.']);
        }
    }
}
