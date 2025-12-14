<?php

namespace App\Http\Controllers;

use App\Models\Restaurant\RestaurantProperty;
use App\Models\Restaurant\MenuCategory;
use App\Models\Restaurant\MenuItem;
use App\Models\Place;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use App\Http\Controllers\MediaController;

class RestaurantController extends Controller
{
    /**
     * Display a listing of restaurant properties for admin dashboard.
     */
    public function index(Request $request)
    {
        $query = RestaurantProperty::with([
            'place:placeID,name,description,ratings,reviews_count,images_url,province_id',
            'place.provinceCategory:province_categoryID,province_categoryName',
            'owner:id,name,email',
            'menuItems:menu_item_id,restaurant_property_id,menu_category_id,name,price,is_available',
            'menuItems.category:menu_category_id,name'
        ]);

        // Search functionality
        if ($request->filled('search')) {
            $escapedTerm = str_replace(['%', '_'], ['\\%', '\\_'], trim($request->search));
            $query->where(function ($mainQuery) use ($escapedTerm) {
                $mainQuery->whereHas('place', function ($q) use ($escapedTerm) {
                    $q->where('name', 'LIKE', $escapedTerm . '%')
                      ->orWhere('name', 'LIKE', '% ' . $escapedTerm . '%')
                      ->orWhere('description', 'LIKE', $escapedTerm . '%');
                })->orWhereHas('owner', function ($q) use ($escapedTerm) {
                    $q->where('name', 'LIKE', $escapedTerm . '%')
                      ->orWhere('email', 'LIKE', $escapedTerm . '%');
                });
            });
        }

        // Filter by province
        if ($request->filled('province')) {
            $query->whereHas('place', function ($q) use ($request) {
                $q->where('province_id', $request->province);
            });
        }

        // Filter by rating
        if ($request->filled('rating')) {
            $query->whereHas('place', function ($q) use ($request) {
                $q->where('ratings', '>=', $request->rating);
            });
        }

        // Get per_page parameter or default to 10
        $perPage = $request->input('per_page', 10);
        $perPage = in_array($perPage, [10, 20, 30, 40, 50]) ? $perPage : 10;

        $properties = $query->orderBy('created_at', 'desc')
                           ->paginate($perPage)
                           ->withQueryString();

        // Transform properties for display
        $properties->getCollection()->transform(function ($property) {
            // Count menu items and categories
            $availableMenuItems = $property->menuItems->where('is_available', true)->count();
            $totalMenuItems = $property->menuItems->count();
            $categoriesCount = $property->menuItems->pluck('menu_category_id')->unique()->count();

            // Get price range
            $prices = $property->menuItems->pluck('price')->filter();
            $priceRange = $prices->isEmpty() 
                ? 'N/A' 
                : '$' . number_format($prices->min(), 2) . ' - $' . number_format($prices->max(), 2);

            return [
                'restaurant_property_id' => $property->restaurant_property_id,
                'place' => [
                    'placeID' => $property->place->placeID,
                    'name' => $property->place->name,
                    'description' => $property->place->description,
                    'ratings' => $property->place->ratings,
                    'reviews_count' => $property->place->reviews_count,
                    'images_url' => $property->place->images_url,
                    'province' => $property->place->provinceCategory->province_categoryName ?? 'Unknown',
                ],
                'owner' => [
                    'id' => $property->owner->id ?? null,
                    'name' => $property->owner->name ?? 'Unassigned',
                    'email' => $property->owner->email ?? '',
                ],
                'menu_stats' => [
                    'available' => $availableMenuItems,
                    'total' => $totalMenuItems,
                    'price_range' => $priceRange,
                    'categories_count' => $categoriesCount,
                ],
                'created_at' => $property->created_at->format('Y-m-d'),
            ];
        });

        // Get provinces for filter
        $provinces = \App\Models\ProvinceCategory::select('province_categoryID', 'province_categoryName')
            ->orderBy('province_categoryName')
            ->get();

        // Get all users for assignment
        $users = User::select('id', 'name', 'email')
            ->orderBy('name')
            ->get();

        // Get all menu categories
        $menuCategories = MenuCategory::select('menu_category_id', 'name', 'description')
            ->orderBy('name')
            ->get();

        return Inertia::render('restaurants/index', [
            'properties' => $properties,
            'filters' => $request->only(['search', 'province', 'rating']),
            'provinces' => $provinces,
            'users' => $users,
            'menuCategories' => $menuCategories,
        ]);
    }

    /**
     * Display the specified restaurant property.
     */
    public function show($id)
    {
        $property = RestaurantProperty::with([
            'place.provinceCategory',
            'owner',
            'menuItems.category'
        ])->findOrFail($id);

        // Transform the data for the frontend
        $propertyData = [
            'restaurant_property_id' => $property->restaurant_property_id,
            'place_id' => $property->place_id,
            'owner_user_id' => $property->owner_user_id,
            'place' => [
                'placeID' => $property->place->placeID,
                'name' => $property->place->name,
                'description' => $property->place->description,
                'ratings' => $property->place->ratings,
                'reviews_count' => $property->place->reviews_count,
                'images_url' => $property->place->images_url,
                'provinceCategory' => $property->place->provinceCategory ? [
                    'province_categoryName' => $property->place->provinceCategory->province_categoryName,
                ] : null,
            ],
            'owner' => [
                'id' => $property->owner->id,
                'name' => $property->owner->name,
                'email' => $property->owner->email,
                'phone_number' => $property->owner->phone_number ?? null,
            ],
            'menuItems' => $property->menuItems->map(function ($item) {
                return [
                    'menu_item_id' => $item->menu_item_id,
                    'name' => $item->name,
                    'description' => $item->description,
                    'price' => (float) $item->price,
                    'is_available' => (bool) $item->is_available,
                    'images_url' => $item->images_url,
                    'category' => [
                        'menu_category_id' => $item->category->menu_category_id,
                        'name' => $item->category->name,
                        'description' => $item->category->description,
                    ],
                    'created_at' => $item->created_at->toISOString(),
                ];
            })->values()->all(),
            'created_at' => $property->created_at->toISOString(),
            'updated_at' => $property->updated_at->toISOString(),
        ];

        return Inertia::render('restaurants/show', [
            'property' => $propertyData,
        ]);
    }

    /**
     * Show the form for creating a new restaurant property.
     */
    public function create()
    {
        // Get places with category "Restaurant" that don't have a restaurant property yet
        $availablePlaces = Place::whereNotExists(function ($query) {
            $query->select(DB::raw(1))
                  ->from('restaurant_properties')
                  ->whereColumn('places.placeID', 'restaurant_properties.place_id');
        })
        ->whereHas('category', function ($query) {
            $query->where('category_name', 'Restaurant');
        })
        ->select('placeID', 'name', 'province_id')
        ->orderBy('name')
        ->get();

        // Get all users for owner assignment
        $owners = User::select('id', 'name', 'email')
            ->orderBy('name')
            ->get();

        // Get menu categories
        $menuCategories = MenuCategory::select('menu_category_id', 'name', 'description')
            ->orderBy('name')
            ->get();

        return Inertia::render('restaurants/createEdit', [
            'availablePlaces' => $availablePlaces,
            'owners' => $owners,
            'menuCategories' => $menuCategories,
        ]);
    }

    /**
     * Store a newly created restaurant property.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'place_id' => 'required|exists:places,placeID|unique:restaurant_properties,place_id',
            'owner_user_id' => 'required|exists:users,id',
            'menuItems' => 'nullable|array',
            'menuItems.*.name' => 'required|string|max:255',
            'menuItems.*.menu_category_id' => 'required|exists:menu_categories,menu_category_id',
            'menuItems.*.price' => 'required|numeric|min:0',
            'menuItems.*.description' => 'nullable|string',
            'menuItems.*.is_available' => 'boolean',
            'menuItems.*.image_file' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
        ]);

        // Create the restaurant property
        $property = RestaurantProperty::create([
            'place_id' => $validated['place_id'],
            'owner_user_id' => $validated['owner_user_id'],
        ]);

        // Create menu items if provided
        if (!empty($validated['menuItems'])) {
            $mediaController = new MediaController();

            foreach ($validated['menuItems'] as $index => $menuItem) {
                $imageUrl = null;

                // Handle image upload if present
                if ($request->hasFile("menuItems.{$index}.image_file")) {
                    try {
                        $imageFile = $request->file("menuItems.{$index}.image_file");
                        $uploadResult = $mediaController->uploadFile($imageFile, 'restaurant_menu_items');
                        $imageUrl = $uploadResult['url'];
                    } catch (\Exception $e) {
                        Log::error('Failed to upload menu item image: ' . $e->getMessage());
                    }
                }

                $property->menuItems()->create([
                    'name' => $menuItem['name'],
                    'menu_category_id' => $menuItem['menu_category_id'],
                    'price' => $menuItem['price'],
                    'description' => $menuItem['description'] ?? null,
                    'is_available' => $menuItem['is_available'] ?? true,
                    'images_url' => $imageUrl,
                ]);
            }
        }

        // Assign restaurant owner role if not already assigned
        $user = User::find($validated['owner_user_id']);
        if ($user && !$user->hasRole('restaurant owner')) {
            $user->assignRole('restaurant owner');
        }

        return redirect()->route('restaurants.index')
            ->with('success', 'Restaurant property created successfully.');
    }

    /**
     * Show the form for editing the specified restaurant property.
     */
    public function edit($id)
    {
        $property = RestaurantProperty::with(['place', 'owner', 'menuItems.category'])->findOrFail($id);

        // Get all users for owner assignment
        $owners = User::select('id', 'name', 'email')
            ->orderBy('name')
            ->get();

        // Get menu categories
        $menuCategories = MenuCategory::select('menu_category_id', 'name', 'description')
            ->orderBy('name')
            ->get();

        return Inertia::render('restaurants/createEdit', [
            'property' => [
                'restaurant_property_id' => $property->restaurant_property_id,
                'owner_user_id' => $property->owner_user_id,
                'place_id' => $property->place_id,
                'place' => [
                    'placeID' => $property->place->placeID,
                    'name' => $property->place->name,
                    'province_id' => $property->place->province_id,
                ],
                'owner' => [
                    'id' => $property->owner->id,
                    'name' => $property->owner->name,
                    'email' => $property->owner->email,
                ],
                'menuItems' => $property->menuItems->map(function ($item) {
                    return [
                        'menu_item_id' => $item->menu_item_id,
                        'name' => $item->name,
                        'menu_category_id' => $item->menu_category_id,
                        'price' => $item->price,
                        'description' => $item->description,
                        'is_available' => $item->is_available,
                        'image' => $item->images_url,
                    ];
                }),
            ],
            'owners' => $owners,
            'menuCategories' => $menuCategories,
        ]);
    }

    /**
     * Update the specified restaurant property.
     */
    public function update(Request $request, $id)
    {
        $property = RestaurantProperty::findOrFail($id);

        $validated = $request->validate([
            'owner_user_id' => 'required|exists:users,id',
            'menuItems' => 'nullable|array',
            'menuItems.*.menu_item_id' => 'nullable|exists:menu_items,menu_item_id',
            'menuItems.*.name' => 'required|string|max:255',
            'menuItems.*.menu_category_id' => 'required|exists:menu_categories,menu_category_id',
            'menuItems.*.price' => 'required|numeric|min:0',
            'menuItems.*.description' => 'nullable|string',
            'menuItems.*.is_available' => 'boolean',
            'menuItems.*.image_file' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
        ]);

        $property->update([
            'owner_user_id' => $validated['owner_user_id'],
        ]);

        // Handle menu items
        if (isset($validated['menuItems'])) {
            $existingItemIds = [];
            $mediaController = new MediaController();

            foreach ($validated['menuItems'] as $index => $menuItem) {
                $imageUrl = null;

                // Handle image upload if present
                if ($request->hasFile("menuItems.{$index}.image_file")) {
                    try {
                        $imageFile = $request->file("menuItems.{$index}.image_file");
                        $uploadResult = $mediaController->uploadFile($imageFile, 'restaurant_menu_items');
                        $imageUrl = $uploadResult['url'];
                    } catch (\Exception $e) {
                        Log::error('Failed to upload menu item image: ' . $e->getMessage());
                    }
                }

                if (isset($menuItem['menu_item_id']) && $menuItem['menu_item_id']) {
                    // Update existing menu item
                    $item = $property->menuItems()->find($menuItem['menu_item_id']);
                    if ($item) {
                        $updateData = [
                            'name' => $menuItem['name'],
                            'menu_category_id' => $menuItem['menu_category_id'],
                            'price' => $menuItem['price'],
                            'description' => $menuItem['description'] ?? null,
                            'is_available' => $menuItem['is_available'] ?? true,
                        ];

                        // Only update image if a new one was uploaded
                        if ($imageUrl) {
                            $updateData['images_url'] = $imageUrl;
                        }

                        $item->update($updateData);
                        $existingItemIds[] = $menuItem['menu_item_id'];
                    }
                } else {
                    // Create new menu item
                    $newItem = $property->menuItems()->create([
                        'name' => $menuItem['name'],
                        'menu_category_id' => $menuItem['menu_category_id'],
                        'price' => $menuItem['price'],
                        'description' => $menuItem['description'] ?? null,
                        'is_available' => $menuItem['is_available'] ?? true,
                        'images_url' => $imageUrl,
                    ]);
                    $existingItemIds[] = $newItem->menu_item_id;
                }
            }

            // Delete menu items that were removed
            $property->menuItems()->whereNotIn('menu_item_id', $existingItemIds)->delete();
        }

        // Assign restaurant owner role if not already assigned
        $user = User::find($validated['owner_user_id']);
        if ($user && !$user->hasRole('restaurant owner')) {
            $user->assignRole('restaurant owner');
        }

        return redirect()->route('restaurants.index')
            ->with('success', 'Restaurant property updated successfully.');
    }

    /**
     * Remove the specified restaurant property.
     */
    public function destroy($id)
    {
        $property = RestaurantProperty::findOrFail($id);
        $property->delete();

        return redirect()->route('restaurants.index')
            ->with('success', 'Restaurant property deleted successfully.');
    }
}
