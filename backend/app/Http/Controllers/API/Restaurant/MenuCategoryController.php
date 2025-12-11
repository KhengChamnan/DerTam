<?php

namespace App\Http\Controllers\API\Restaurant;

use App\Http\Controllers\Controller;
use App\Models\Restaurant\MenuCategory;
use Illuminate\Http\Request;

class MenuCategoryController extends Controller
{
    /**
     * Display a listing of menu categories.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        try {
            $query = MenuCategory::query();

            // Search by name
            if ($request->has('search')) {
                $query->where('name', 'like', '%' . $request->search . '%');
            }

            $categories = $query->get();

            return response()->json([
                'success' => true,
                'message' => 'Menu categories retrieved successfully',
                'data' => $categories
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve menu categories',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified menu category.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        try {
            $category = MenuCategory::find($id);

            if (!$category) {
                return response()->json([
                    'success' => false,
                    'message' => 'Menu category not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Menu category retrieved successfully',
                'data' => $category
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve menu category',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
