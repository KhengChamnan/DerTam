<?php

namespace App\Http\Controllers\Hotel;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Hotel\Property;
use App\Models\Hotel\RoomProperty;
use App\Models\Hotel\Amenity;
use Inertia\Inertia;
use Inertia\Response;

class RoomPropertyController extends Controller
{
    /**
     * Show the form for creating a new room type
     */
    public function create($property_id): Response
    {
        $user = Auth::user();
        
        $property = Property::where('owner_user_id', $user->id)
            ->where('property_id', $property_id)
            ->with('place')
            ->firstOrFail();
        
        $amenities = Amenity::all();
        
        return Inertia::render('hotel-owner/room-properties/createEdit', [
            'property' => $property,
            'amenities' => $amenities,
            'roomProperty' => null,
        ]);
    }
    
    /**
     * Store a newly created room type
     */
    public function store(Request $request, $property_id)
    {
        $user = Auth::user();
        
        // Verify property ownership
        $property = Property::where('owner_user_id', $user->id)
            ->where('property_id', $property_id)
            ->firstOrFail();
        
        $validated = $request->validate([
            'room_type' => 'required|string|max:255',
            'room_description' => 'nullable|string',
            'max_guests' => 'required|integer|min:1',
            'room_size' => 'nullable|string|max:50',
            'price_per_night' => 'required|numeric|min:0',
            'images_url' => 'nullable|array',
            'images_url.*' => 'string|url',
            'amenity_ids' => 'nullable|array',
            'amenity_ids.*' => 'exists:amenities,amenity_id',
        ]);
        
        $roomProperty = RoomProperty::create([
            'property_id' => $property_id,
            'room_type' => $validated['room_type'],
            'room_description' => $validated['room_description'] ?? null,
            'max_guests' => $validated['max_guests'],
            'room_size' => $validated['room_size'] ?? null,
            'price_per_night' => $validated['price_per_night'],
            'images_url' => $validated['images_url'] ?? null,
        ]);
        
        // Attach amenities if provided
        if (!empty($validated['amenity_ids'])) {
            $roomProperty->amenities()->attach($validated['amenity_ids']);
        }
        
        return redirect()->route('hotel-owner.properties.index')
            ->with('success', 'Room type created successfully!');
    }
    
    /**
     * Show the form for editing a room type
     */
    public function edit($property_id, $room_property_id): Response
    {
        $user = Auth::user();
        
        $property = Property::where('owner_user_id', $user->id)
            ->where('property_id', $property_id)
            ->with('place')
            ->firstOrFail();
        
        $roomProperty = RoomProperty::where('property_id', $property_id)
            ->where('room_properties_id', $room_property_id)
            ->with('amenities')
            ->firstOrFail();
        
        $amenities = Amenity::all();
        
        return Inertia::render('hotel-owner/room-properties/createEdit', [
            'property' => $property,
            'amenities' => $amenities,
            'roomProperty' => $roomProperty,
        ]);
    }
    
    /**
     * Update a room type
     */
    public function update(Request $request, $property_id, $room_property_id)
    {
        $user = Auth::user();
        
        // Verify property ownership
        $property = Property::where('owner_user_id', $user->id)
            ->where('property_id', $property_id)
            ->firstOrFail();
        
        $roomProperty = RoomProperty::where('property_id', $property_id)
            ->where('room_properties_id', $room_property_id)
            ->firstOrFail();
        
        $validated = $request->validate([
            'room_type' => 'required|string|max:255',
            'room_description' => 'nullable|string',
            'max_guests' => 'required|integer|min:1',
            'room_size' => 'nullable|string|max:50',
            'price_per_night' => 'required|numeric|min:0',
            'images_url' => 'nullable|array',
            'images_url.*' => 'string|url',
            'amenity_ids' => 'nullable|array',
            'amenity_ids.*' => 'exists:amenities,amenity_id',
        ]);
        
        $roomProperty->update([
            'room_type' => $validated['room_type'],
            'room_description' => $validated['room_description'] ?? null,
            'max_guests' => $validated['max_guests'],
            'room_size' => $validated['room_size'] ?? null,
            'price_per_night' => $validated['price_per_night'],
            'images_url' => $validated['images_url'] ?? null,
        ]);
        
        // Sync amenities
        if (isset($validated['amenity_ids'])) {
            $roomProperty->amenities()->sync($validated['amenity_ids']);
        }
        
        return redirect()->route('hotel-owner.properties.index')
            ->with('success', 'Room type updated successfully!');
    }
    
    /**
     * Delete a room type
     */
    public function destroy($property_id, $room_property_id)
    {
        $user = Auth::user();
        
        // Verify property ownership
        $property = Property::where('owner_user_id', $user->id)
            ->where('property_id', $property_id)
            ->firstOrFail();
        
        $roomProperty = RoomProperty::where('property_id', $property_id)
            ->where('room_properties_id', $room_property_id)
            ->firstOrFail();
        
        // Delete associated rooms first
        $roomProperty->rooms()->delete();
        
        // Detach amenities
        $roomProperty->amenities()->detach();
        
        // Delete room property
        $roomProperty->delete();
        
        return redirect()->route('hotel-owner.properties.index')
            ->with('success', 'Room type deleted successfully!');
    }
}
