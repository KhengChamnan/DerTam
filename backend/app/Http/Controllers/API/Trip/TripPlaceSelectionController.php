<?php

namespace App\Http\Controllers\API\Trip;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class TripPlaceSelectionController extends Controller
{
    /**
     * Get all places for trip planning selection
     * Returns a simplified list of places that users can add to their trips
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = DB::table('places')
                ->leftJoin('place_categories', 'places.category_id', '=', 'place_categories.placeCategoryID')
                ->leftJoin('province_categories', 'places.province_id', '=', 'province_categories.province_categoryID')
                ->select(
                    'places.placeID',
                    'places.name',
                    'places.description',
                    'places.category_id',
                    'place_categories.category_name',
                    'places.google_maps_link',
                    'places.ratings',
                    'places.reviews_count',
                    'places.images_url',
                    'places.entry_free',
                    'places.province_id',
                    'province_categories.province_categoryName',
                    'places.latitude',
                    'places.longitude'
                );

            // Optional filters
            if ($request->has('category_id')) {
                $query->where('places.category_id', $request->category_id);
            }

            if ($request->has('province_id')) {
                $query->where('places.province_id', $request->province_id);
            }

            if ($request->has('search')) {
                $searchTerm = $request->search;
                $query->where(function($q) use ($searchTerm) {
                    $q->where('places.name', 'LIKE', "%{$searchTerm}%")
                      ->orWhere('places.description', 'LIKE', "%{$searchTerm}%");
                });
            }

            // Filter by minimum rating
            if ($request->has('min_rating')) {
                $query->where('places.ratings', '>=', $request->min_rating);
            }

            // Filter by entry type (free or paid)
            if ($request->has('entry_free')) {
                $query->where('places.entry_free', $request->entry_free);
            }

            // Pagination
            $perPage = $request->input('per_page', 20);
            $page = $request->input('page', 1);
            
            // Get total count
            $total = $query->count();
            
            // Get paginated results
            $places = $query
                ->orderBy('places.ratings', 'desc')
                ->orderBy('places.name', 'asc')
                ->offset(($page - 1) * $perPage)
                ->limit($perPage)
                ->get();

            return response()->json([
                'success' => true,
                'data' => $places,
                'pagination' => [
                    'total' => $total,
                    'per_page' => $perPage,
                    'current_page' => $page,
                    'last_page' => ceil($total / $perPage),
                    'from' => (($page - 1) * $perPage) + 1,
                    'to' => min($page * $perPage, $total)
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch places',
                'error' => $e->getMessage()
            ], 500);
        }
    }

   

   
}
