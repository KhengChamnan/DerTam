<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Hotel\Property;

class HotelOwnerMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        $user = Auth::user();
        
        // Super admin and admin can access everything
        if ($user->hasRole(['superadmin', 'admin'])) {
            return $next($request);
        }
        
        // Hotel owners can only access their own properties
        if ($user->hasRole('hotel owner')) {
            $propertyId = $request->route('property_id') 
                       ?? $request->route('id') 
                       ?? $request->route('property');
            
            if ($propertyId) {
                $property = Property::find($propertyId);
                
                if (!$property || $property->owner_user_id !== $user->id) {
                    abort(403, 'You can only access your own hotels.');
                }
            }
            
            // For room property routes, verify through room property -> property relationship
            $roomPropertyId = $request->route('room_property_id');
            if ($roomPropertyId) {
                $roomProperty = \App\Models\Hotel\RoomProperty::with('property')->find($roomPropertyId);
                
                if (!$roomProperty || !$roomProperty->property || $roomProperty->property->owner_user_id !== $user->id) {
                    abort(403, 'You can only access rooms from your own hotels.');
                }
            }
            
            return $next($request);
        }
        
        abort(403, 'Unauthorized access to hotel management.');
    }
}