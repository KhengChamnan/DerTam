<?php

namespace App\Http\Controllers\API\Trip;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\TripShare;
use App\Models\Trip;
use Illuminate\Support\Str;

class TripShareController extends Controller
{
    /**
     * Generate a shareable deep link for a trip
     */
    public function generate($trip_id)
    {
        $trip = Trip::findOrFail($trip_id);

        // Create or reuse existing token
        $share = TripShare::firstOrCreate(
            ['trip_id' => $trip_id],
            ['token' => Str::random(16)]
        );

        // Example: https://myapp.com/share/trip/{token}
        $link = "https://myapp.com/share/trip/{$share->token}";

        return response()->json([
            'message' => 'Share link generated successfully',
            'share_link' => $link
        ]);
    }

    /**
     * Resolve shared trip via token
     * Flutter will call this API when the user opens the link
     */
    public function resolve($token)
    {
        $share = TripShare::where('token', $token)->first();

        if (!$share) {
            return response()->json(['message' => 'Invalid or expired link'], 404);
        }

        $trip = Trip::with(['tripDays.tripPlaces.place'])->find($share->trip_id);

        if (!$trip) {
            return response()->json(['message' => 'Trip not found'], 404);
        }

        return response()->json([
            'trip' => $trip,
            'message' => 'Trip loaded successfully'
        ]);
    }
}
