<?php

namespace App\Http\Controllers\API\Restaurant;

use App\Http\Controllers\Controller;
use App\Http\Controllers\MediaController;
use App\Models\Restaurant\MenuItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class MenuItemController extends Controller
{
    /**
     * Display a listing of menu items.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        try {
            $query = MenuItem::with(['category', 'restaurantProperty']);

            // Filter by restaurant property
            if ($request->has('restaurant_property_id')) {
                $query->where('restaurant_property_id', $request->restaurant_property_id);
            }

            // Filter by category
            if ($request->has('menu_category_id')) {
                $query->where('menu_category_id', $request->menu_category_id);
            }

            // Filter by availability
            if ($request->has('is_available')) {
                $query->where('is_available', $request->is_available);
            }

            // Search by name
            if ($request->has('search')) {
                $query->where('name', 'like', '%' . $request->search . '%');
            }

            $perPage = $request->get('per_page', 15);
            $menuItems = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'message' => 'Menu items retrieved successfully',
                'data' => $menuItems
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve menu items',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created menu item.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'restaurant_property_id' => 'required|exists:restaurant_properties,restaurant_property_id',
                'menu_category_id' => 'required|exists:menu_categories,menu_category_id',
                'name' => 'required|string|max:150',
                'price' => 'required|numeric|min:0',
                'description' => 'nullable|string',
                'is_available' => 'boolean',
                'images' => 'nullable|array',
                'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $data = $validator->validated();
            $imagesUrl = [];
            $imagePublicIds = [];

            // Handle image uploads
            if ($request->hasFile('images')) {
                $mediaController = new MediaController();
                $uploadResult = $mediaController->uploadMultipleFiles(
                    $request->file('images'),
                    'restaurant/menu_items'
                );
                $imagesUrl = $uploadResult['urls'];
                $imagePublicIds = $uploadResult['public_ids'];
            }

            $data['images_url'] = $imagesUrl;
            $data['image_public_ids'] = $imagePublicIds;
            $data['is_available'] = $request->get('is_available', true);

            $menuItem = MenuItem::create($data);
            $menuItem->load(['category', 'restaurantProperty']);

            return response()->json([
                'success' => true,
                'message' => 'Menu item created successfully',
                'data' => $menuItem
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create menu item',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified menu item.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        try {
            $menuItem = MenuItem::with(['category', 'restaurantProperty'])->find($id);

            if (!$menuItem) {
                return response()->json([
                    'success' => false,
                    'message' => 'Menu item not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Menu item retrieved successfully',
                'data' => $menuItem
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve menu item',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified menu item.
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        try {
            $menuItem = MenuItem::find($id);

            if (!$menuItem) {
                return response()->json([
                    'success' => false,
                    'message' => 'Menu item not found'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'restaurant_property_id' => 'sometimes|exists:restaurant_properties,restaurant_property_id',
                'menu_category_id' => 'sometimes|exists:menu_categories,menu_category_id',
                'name' => 'sometimes|string|max:150',
                'price' => 'sometimes|integer|min:0',
                'description' => 'nullable|string',
                'is_available' => 'boolean',
                'images' => 'nullable|array',
                'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048',
                'remove_images' => 'nullable|array',
                'remove_images.*' => 'integer'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $data = $validator->validated();

            // Handle image removal
            if ($request->has('remove_images')) {
                $imagesUrl = $menuItem->images_url ?? [];
                $imagePublicIds = $menuItem->image_public_ids ?? [];
                $mediaController = new MediaController();

                foreach ($request->remove_images as $index) {
                    if (isset($imagePublicIds[$index])) {
                        // Delete from Cloudinary
                        $mediaController->deleteFile($imagePublicIds[$index]);
                        
                        // Remove from arrays
                        unset($imagesUrl[$index]);
                        unset($imagePublicIds[$index]);
                    }
                }

                $data['images_url'] = array_values($imagesUrl);
                $data['image_public_ids'] = array_values($imagePublicIds);
            }

            // Handle new image uploads
            if ($request->hasFile('images')) {
                $imagesUrl = $menuItem->images_url ?? [];
                $imagePublicIds = $menuItem->image_public_ids ?? [];
                $mediaController = new MediaController();
                
                $uploadResult = $mediaController->uploadMultipleFiles(
                    $request->file('images'),
                    'restaurant/menu_items'
                );
                
                $imagesUrl = array_merge($imagesUrl, $uploadResult['urls']);
                $imagePublicIds = array_merge($imagePublicIds, $uploadResult['public_ids']);

                $data['images_url'] = $imagesUrl;
                $data['image_public_ids'] = $imagePublicIds;
            }

            $menuItem->update($data);
            $menuItem->load(['category', 'restaurantProperty']);

            return response()->json([
                'success' => true,
                'message' => 'Menu item updated successfully',
                'data' => $menuItem
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update menu item',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified menu item.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        try {
            $menuItem = MenuItem::find($id);

            if (!$menuItem) {
                return response()->json([
                    'success' => false,
                    'message' => 'Menu item not found'
                ], 404);
            }

            // Delete images from Cloudinary
            if (!empty($menuItem->image_public_ids)) {
                $mediaController = new MediaController();
                $mediaController->deleteMultipleFiles($menuItem->image_public_ids);
            }

            $menuItem->delete();

            return response()->json([
                'success' => true,
                'message' => 'Menu item deleted successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete menu item',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Toggle availability of a menu item.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function toggleAvailability($id)
    {
        try {
            $menuItem = MenuItem::find($id);

            if (!$menuItem) {
                return response()->json([
                    'success' => false,
                    'message' => 'Menu item not found'
                ], 404);
            }

            $menuItem->is_available = !$menuItem->is_available;
            $menuItem->save();

            return response()->json([
                'success' => true,
                'message' => 'Menu item availability updated successfully',
                'data' => $menuItem
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to toggle availability',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
