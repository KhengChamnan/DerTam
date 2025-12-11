<?php

namespace App\Http\Controllers\API\Restaurant;

use App\Http\Controllers\Controller;
use App\Models\Restaurant\RestaurantProperty;
use Illuminate\Http\Request;

class RestaurantPropertyController extends Controller
{
    /**
     * Display the specified restaurant property with menu items.
     *
     * @param int $placeId
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($placeId)
    {
        try {
            $restaurant = RestaurantProperty::with([
                'place',
                'owner',
                'menuItems' => function ($query) {
                    $query->where('is_available', true)
                          ->with('category')
                          ->orderBy('menu_category_id')
                          ->orderBy('name');
                }
            ])->where('place_id', $placeId)->first();

            if (!$restaurant) {
                return response()->json([
                    'success' => false,
                    'message' => 'Restaurant property not found for this place'
                ], 404);
            }

            // Return menu items as a flat list with category included in each item
            $response = [
                'menu_items' => $restaurant->menuItems,
            ];

            return response()->json([
                'success' => true,
                'message' => 'Restaurant details retrieved successfully',
                'data' => $response
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve restaurant details',
                'error' => $e->getMessage()
            ], 500);
        }
    }

   
}
