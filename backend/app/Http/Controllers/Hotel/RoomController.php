<?php

namespace App\Http\Controllers\Hotel;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Hotel\Room;
use App\Models\Hotel\RoomProperty;
use App\Models\Hotel\Property;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class RoomController extends Controller
{
    /**
     * Show the form for creating a new room
     */
    public function create(): Response
    {
        $user = Auth::user();
        
        // Get the property and all room types for dropdown
        $property = Property::where('owner_user_id', $user->id)
            ->with('place')
            ->first();
        
        $roomTypes = RoomProperty::whereHas('property', function($q) use ($user) {
            $q->where('owner_user_id', $user->id);
        })
        ->with('property.place')
        ->get();
        
        return Inertia::render('hotel-owner/rooms/createEdit', [
            'property' => $property,
            'roomTypes' => $roomTypes,
            'room' => null,
            'isEdit' => false,
        ]);
    }

    /**
     * Store a newly created room
     */
    public function store(Request $request): RedirectResponse
    {
        $user = Auth::user();
        
        $validated = $request->validate([
            'room_properties_id' => 'required|exists:room_properties,room_properties_id',
            'room_number' => 'required|string|max:255|unique:rooms,room_number',
            'is_available' => 'boolean',
            'status' => 'required|in:available,occupied,maintenance,cleaning',
            'notes' => 'nullable|string',
        ]);
        
        // Verify the room property belongs to the user
        $roomProperty = RoomProperty::where('room_properties_id', $validated['room_properties_id'])
            ->whereHas('property', function($q) use ($user) {
                $q->where('owner_user_id', $user->id);
            })
            ->firstOrFail();
        
        $validated['is_available'] = $request->boolean('is_available', true);
        
        Room::create($validated);
        
        return redirect()
            ->route('hotel-owner.rooms.all')
            ->with('success', 'Room created successfully!');
    }

    /**
     * Show the form for editing a room
     */
    public function edit($room_id): Response
    {
        $user = Auth::user();
        
        $room = Room::where('room_id', $room_id)
            ->whereHas('roomProperty.property', function($q) use ($user) {
                $q->where('owner_user_id', $user->id);
            })
            ->with('roomProperty')
            ->firstOrFail();
        
        $property = Property::where('owner_user_id', $user->id)
            ->with('place')
            ->first();
        
        $roomTypes = RoomProperty::whereHas('property', function($q) use ($user) {
            $q->where('owner_user_id', $user->id);
        })
        ->with('property.place')
        ->get();
        
        return Inertia::render('hotel-owner/rooms/createEdit', [
            'property' => $property,
            'roomTypes' => $roomTypes,
            'room' => $room,
            'isEdit' => true,
        ]);
    }

    /**
     * Update a room
     */
    public function update(Request $request, $room_id): RedirectResponse
    {
        $user = Auth::user();
        
        $room = Room::where('room_id', $room_id)
            ->whereHas('roomProperty.property', function($q) use ($user) {
                $q->where('owner_user_id', $user->id);
            })
            ->firstOrFail();
        
        $validated = $request->validate([
            'room_properties_id' => 'required|exists:room_properties,room_properties_id',
            'room_number' => 'required|string|max:255|unique:rooms,room_number,' . $room_id . ',room_id',
            'is_available' => 'boolean',
            'status' => 'required|in:available,occupied,maintenance,cleaning',
            'notes' => 'nullable|string',
        ]);
        
        // Verify the new room property belongs to the user
        $roomProperty = RoomProperty::where('room_properties_id', $validated['room_properties_id'])
            ->whereHas('property', function($q) use ($user) {
                $q->where('owner_user_id', $user->id);
            })
            ->firstOrFail();
        
        $validated['is_available'] = $request->boolean('is_available');
        
        $room->update($validated);
        
        return redirect()
            ->route('hotel-owner.rooms.all')
            ->with('success', 'Room updated successfully!');
    }

    /**
     * Remove a room
     */
    public function destroy($room_id): RedirectResponse
    {
        $user = Auth::user();
        
        $room = Room::where('room_id', $room_id)
            ->whereHas('roomProperty.property', function($q) use ($user) {
                $q->where('owner_user_id', $user->id);
            })
            ->firstOrFail();
        
        $room->delete();
        
        return redirect()
            ->route('hotel-owner.rooms.all')
            ->with('success', 'Room deleted successfully!');
    }
}
