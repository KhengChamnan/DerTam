<?php

namespace App\Http\Controllers\API\Trip;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

use App\Models\TripShare;
use App\Models\Trip;
use App\Models\TripShareAccess;
use App\Models\TripViewer;
use Illuminate\Support\Str;

class TripShareController extends Controller
{
    /**
     * Generate a shareable deep link for a trip
     *
     * @param int $trip_id
     * @return JsonResponse
     */
    public function generate(int $trip_id): JsonResponse
    {
        try {
            $userId = Auth::id();

            if (!$userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }

            // Verify user owns the trip
            $trip = Trip::where('trip_id', $trip_id)
                ->where('user_id', $userId)
                ->first();

            if (!$trip) {
                return response()->json([
                    'success' => false,
                    'message' => 'Trip not found or unauthorized'
                ], 404);
            }

            // Create or update existing share with expiration (default 30 days)
            $expiresAt = Carbon::now()->addDays(30);
            
            $share = TripShare::updateOrCreate(
                ['trip_id' => $trip_id],
                [
                    'token' => Str::random(32),
                    'expires_at' => $expiresAt,
                    'is_active' => true,
                ]
            );

            // Generate share link
            $link = "https://g9-capstone-project-ll.onrender.com/share/trip/{$share->token}";

            return response()->json([
                'success' => true,
                'message' => 'Share link generated successfully',
                'data' => [
                    'share_link' => $link,
                    'token' => $share->token,
                    'expires_at' => $share->expires_at->toISOString(),
                    'created_at' => $share->created_at->toISOString(),
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate share link',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Resolve shared trip via token
     * Flutter will call this API when the user opens the link
     * Requires authentication - friends must have an account
     *
     * @param string $token
     * @return JsonResponse
     */
    public function resolve(string $token): JsonResponse
    {
        try {
            // Get authenticated user - middleware ensures they're authenticated
            $userId = Auth::id();
            
            if (!$userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Authentication required. Please log in to view shared trip.'
                ], 401);
            }

            // Find valid share (not expired and active)
            $share = TripShare::where('token', $token)
                ->valid()
                ->first();

            if (!$share) {
                // Check if it exists but is expired
                $expiredShare = TripShare::where('token', $token)->first();
                
                if ($expiredShare) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Share link has expired'
                    ], 410); // 410 Gone - for expired resources
                }

                return response()->json([
                    'success' => false,
                    'message' => 'Invalid or expired link'
                ], 404);
            }

            // Get trip with days and places
            $trip = DB::table('trips')
                ->where('trip_id', $share->trip_id)
                ->first();

            if (!$trip) {
                return response()->json([
                    'success' => false,
                    'message' => 'Trip not found'
                ], 404);
            }

            // Get trip days
            $days = DB::table('trip_days')
                ->where('trip_id', $share->trip_id)
                ->orderBy('date', 'asc')
                ->get();

            // Get places for each day
            foreach ($days as $day) {
                $places = DB::table('trip_places')
                    ->join('places', 'trip_places.place_id', '=', 'places.placeID')
                    ->leftJoin('place_categories', 'places.category_id', '=', 'place_categories.placeCategoryID')
                    ->leftJoin('province_categories', 'places.province_id', '=', 'province_categories.province_categoryID')
                    ->where('trip_places.trip_day_id', $day->trip_day_id)
                    ->select(
                        'trip_places.trip_place_id',
                        'trip_places.trip_day_id',
                        'trip_places.place_id',
                        'trip_places.notes',
                        'trip_places.created_at as added_at',
                        'places.name as place_name',
                        'places.description as place_description',
                        'places.category_id',
                        'place_categories.category_name',
                        'places.google_maps_link',
                        'places.ratings',
                        'places.reviews_count',
                        'places.images_url',
                        'places.entry_free',
                        'places.operating_hours',
                        'places.province_id',
                        'province_categories.province_categoryName',
                        'places.latitude',
                        'places.longitude'
                    )
                    ->orderBy('trip_places.created_at', 'asc')
                    ->get();

                $day->places = $places;
            }

            // Track access (create if doesn't exist)
            TripShareAccess::firstOrCreate(
                [
                    'trip_share_id' => $share->id,
                    'user_id' => $userId,
                ],
                [
                    'accessed_at' => now(),
                ]
            );

            // Add user as a viewer of this trip (so it appears in their trip list)
            TripViewer::firstOrCreate(
                [
                    'trip_id' => $share->trip_id,
                    'user_id' => $userId,
                ]
            );

            return response()->json([
                'success' => true,
                'message' => 'Trip accessed successfully',
                'data' => [
                    'trip' => $trip,
                    'days' => $days,
                    'access_type' => 'view_only',
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to resolve shared trip',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get list of users who accessed the shared trip
     * Only trip owner can see this
     *
     * @param int $trip_id
     * @return JsonResponse
     */
    public function getAccessList(int $trip_id): JsonResponse
    {
        try {
            $userId = Auth::id();

            if (!$userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }

            // Verify user owns the trip
            $trip = Trip::where('trip_id', $trip_id)
                ->where('user_id', $userId)
                ->first();

            if (!$trip) {
                return response()->json([
                    'success' => false,
                    'message' => 'Trip not found or unauthorized'
                ], 404);
            }

            // Get the share for this trip
            $share = TripShare::where('trip_id', $trip_id)->first();

            if (!$share) {
                return response()->json([
                    'success' => false,
                    'message' => 'No share link exists for this trip'
                ], 404);
            }

            // Get all accesses with user information
            $accesses = DB::table('trip_share_accesses')
                ->join('users', 'trip_share_accesses.user_id', '=', 'users.id')
                ->where('trip_share_accesses.trip_share_id', $share->id)
                ->select(
                    'trip_share_accesses.user_id',
                    'users.name as user_name',
                    'users.email as user_email',
                    'users.avatar',
                    'trip_share_accesses.accessed_at'
                )
                ->orderBy('trip_share_accesses.accessed_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'accesses' => $accesses,
                    'total_accesses' => count($accesses)
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch access list',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Deactivate share link for a trip
     * Only trip owner can do this
     *
     * @param int $trip_id
     * @return JsonResponse
     */
    public function deactivateShare(int $trip_id): JsonResponse
    {
        try {
            $userId = Auth::id();

            if (!$userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }

            // Verify user owns the trip
            $trip = Trip::where('trip_id', $trip_id)
                ->where('user_id', $userId)
                ->first();

            if (!$trip) {
                return response()->json([
                    'success' => false,
                    'message' => 'Trip not found or unauthorized'
                ], 404);
            }

            // Find and deactivate the share
            $share = TripShare::where('trip_id', $trip_id)->first();

            if (!$share) {
                return response()->json([
                    'success' => false,
                    'message' => 'No share link exists for this trip'
                ], 404);
            }

            $share->update(['is_active' => false]);

            return response()->json([
                'success' => true,
                'message' => 'Share link deactivated successfully'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to deactivate share link',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
