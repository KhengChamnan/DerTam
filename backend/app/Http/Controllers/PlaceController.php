<?php

namespace App\Http\Controllers;

use App\Models\Place;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\ValidationException;

class PlaceController extends Controller
{
    /**
     * Display a listing of places.
     */
    public function index(Request $request): Response
    {
        try {
            // Check if Place model and table exist
            if (!class_exists(Place::class)) {
                return Inertia::render('places/index', [
                    'places' => ['data' => [], 'total' => 0, 'per_page' => 15, 'current_page' => 1, 'last_page' => 1],
                    'categories' => [],
                    'provinces' => [],
                    'filters' => $request->only(['category_id', 'province_id', 'search']),
                    'error' => 'Place model not found',
                ]);
            }

            $query = Place::query();

            // Add relationships only if they exist
            try {
                $query->with(['category', 'province']);
            } catch (\Exception $e) {
                // If relationships fail, continue without them
            }

            // Filter by category if provided
            if ($request->has('category_id')) {
                $query->where('category_id', $request->category_id);
            }

            // Filter by province if provided
            if ($request->has('province_id')) {
                $query->where('province_id', $request->province_id);
            }

            // Search by name if provided
            if ($request->has('search')) {
                $query->where('name', 'like', '%' . $request->search . '%');
            }

            $places = $query->paginate($request->get('per_page', 15));
            
            // Transform places data to match frontend expectations
            $places->getCollection()->transform(function ($place) {
                return [
                    'placeID' => $place->placeID,
                    'name' => $place->name,
                    'description' => $place->description,
                    'category' => $place->category ? [
                        'placeCategoryID' => $place->category->placeCategoryID,
                        'name' => $place->category->category_name,
                    ] : null,
                    'province' => $place->province ? [
                        'province_categoryID' => $place->province->province_categoryID,
                        'name' => $place->province->province_categoryName,
                    ] : null,
                    'ratings' => $place->ratings,
                    'reviews_count' => $place->reviews_count,
                    'entry_free' => $place->entry_free,
                    'images_url' => $place->images_url,
                    'latitude' => $place->latitude,
                    'longitude' => $place->longitude,
                ];
            });

            // Get categories and provinces for filters
            $categories = [];
            $provinces = [];
            
            try {
                $categoriesRaw = \App\Models\PlaceCategory::all();
                $categories = $categoriesRaw->map(function ($category) {
                    return [
                        'placeCategoryID' => $category->placeCategoryID,
                        'name' => $category->category_name,
                    ];
                });
            } catch (\Exception $e) {
                // Categories not available
            }
            
            try {
                $provincesRaw = \App\Models\ProvinceCategory::all();
                $provinces = $provincesRaw->map(function ($province) {
                    return [
                        'province_categoryID' => $province->province_categoryID,
                        'name' => $province->province_categoryName,
                    ];
                });
            } catch (\Exception $e) {
                // Provinces not available
            }

            return Inertia::render('places/index', [
                'places' => $places,
                'categories' => $categories,
                'provinces' => $provinces,
                'filters' => $request->only(['category_id', 'province_id', 'search']),
            ]);
        } catch (\Exception $e) {
            return Inertia::render('places/index', [
                'places' => ['data' => [], 'total' => 0, 'per_page' => 15, 'current_page' => 1, 'last_page' => 1],
                'categories' => [],
                'provinces' => [],
                'filters' => $request->only(['category_id', 'province_id', 'search']),
                'error' => 'Database error: ' . $e->getMessage(),
            ]);
        }
    }

    /**
     * Show the form for creating a new place.
     */
    public function create(): Response
    {
        // Get categories and provinces for the form
        $categories = [];
        $provinces = [];
        
        try {
            $categoriesRaw = \App\Models\PlaceCategory::all();
            $categories = $categoriesRaw->map(function ($category) {
                return [
                    'placeCategoryID' => $category->placeCategoryID,
                    'name' => $category->category_name,
                ];
            });
        } catch (\Exception $e) {
            // Categories not available
        }
        
        try {
            $provincesRaw = \App\Models\ProvinceCategory::all();
            $provinces = $provincesRaw->map(function ($province) {
                return [
                    'province_categoryID' => $province->province_categoryID,
                    'name' => $province->province_categoryName,
                ];
            });
        } catch (\Exception $e) {
            // Provinces not available
        }

        return Inertia::render('places/edit', [
            'place' => null, // No place data for create mode
            'categories' => $categories,
            'provinces' => $provinces,
        ]);
    }

    /**
     * Store a newly created place.
     */
    public function store(Request $request): RedirectResponse
    {
        try {
            $validatedData = $request->validate([
                'name' => 'required|string|max:255',
                'description' => 'required|string',
                'category_id' => 'required|exists:place_categories,placeCategoryID',
                'google_maps_link' => 'nullable|url',
                'ratings' => 'nullable|numeric|between:0,5',
                'reviews_count' => 'nullable|integer|min:0',
                'images_url' => 'nullable|array',
                'images_url.*' => 'url',
                'entry_free' => 'boolean',
                'operating_hours' => 'nullable|array',
                'best_season_to_visit' => 'nullable|string',
                'province_id' => 'required|exists:province_categories,province_categoryID',
                'latitude' => 'nullable|numeric|between:-90,90',
                'longitude' => 'nullable|numeric|between:-180,180',
            ]);

            $place = Place::create($validatedData);
            $place->load(['category', 'province']);

            return redirect()->route('places.index')->with('success', 'Place created successfully');
        } catch (ValidationException $e) {
            return back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to create place: ' . $e->getMessage()])->withInput();
        }
    }

    /**
     * Display the specified place.
     */
    public function show(string $id): Response
    {
        try {
            $place = Place::with(['category', 'province'])->findOrFail($id);
            
            // Transform place data to match frontend expectations
            $transformedPlace = [
                'placeID' => $place->placeID,
                'name' => $place->name,
                'description' => $place->description,
                'category' => $place->category ? [
                    'placeCategoryID' => $place->category->placeCategoryID,
                    'name' => $place->category->category_name,
                ] : null,
                'province' => $place->province ? [
                    'province_categoryID' => $place->province->province_categoryID,
                    'name' => $place->province->province_categoryName,
                ] : null,
                'ratings' => $place->ratings,
                'reviews_count' => $place->reviews_count,
                'entry_free' => $place->entry_free,
                'images_url' => $place->images_url,
                'latitude' => $place->latitude,
                'longitude' => $place->longitude,
                'google_maps_link' => $place->google_maps_link,
                'operating_hours' => $place->operating_hours,
                'best_season_to_visit' => $place->best_season_to_visit,
            ];

            return Inertia::render('places/show', [
                'place' => $transformedPlace,
            ]);
        } catch (\Exception $e) {
            return Inertia::render('places/show', [
                'place' => null,
                'error' => 'Place not found',
            ]);
        }
    }

    /**
     * Show the form for editing the specified place.
     */
    public function edit(string $id): Response|RedirectResponse
    {
        try {
            $place = Place::with(['category', 'province'])->findOrFail($id);
            
            // Transform place data to match frontend expectations (keeping form-needed fields as-is)
            $transformedPlace = [
                'placeID' => $place->placeID,
                'name' => $place->name,
                'description' => $place->description,
                'category_id' => $place->category_id,
                'province_id' => $place->province_id,
                'ratings' => $place->ratings,
                'reviews_count' => $place->reviews_count,
                'entry_free' => $place->entry_free,
                'images_url' => $place->images_url,
                'latitude' => $place->latitude,
                'longitude' => $place->longitude,
                'google_maps_link' => $place->google_maps_link,
                'operating_hours' => $place->operating_hours,
                'best_season_to_visit' => $place->best_season_to_visit,
            ];

            // Get categories and provinces for the form
            $categories = [];
            $provinces = [];
            
            try {
                $categoriesRaw = \App\Models\PlaceCategory::all();
                $categories = $categoriesRaw->map(function ($category) {
                    return [
                        'placeCategoryID' => $category->placeCategoryID,
                        'name' => $category->category_name,
                    ];
                });
            } catch (\Exception $e) {
                // Categories not available
            }
            
            try {
                $provincesRaw = \App\Models\ProvinceCategory::all();
                $provinces = $provincesRaw->map(function ($province) {
                    return [
                        'province_categoryID' => $province->province_categoryID,
                        'name' => $province->province_categoryName,
                    ];
                });
            } catch (\Exception $e) {
                // Provinces not available
            }

            return Inertia::render('places/edit', [
                'place' => $transformedPlace,
                'categories' => $categories,
                'provinces' => $provinces,
            ]);
        } catch (\Exception $e) {
            return redirect()->route('places.index')->withErrors(['error' => 'Place not found']);
        }
    }

    /**
     * Update the specified place.
     */
    public function update(Request $request, string $id): RedirectResponse
    {
        try {
            $place = Place::findOrFail($id);

            $validatedData = $request->validate([
                'name' => 'sometimes|required|string|max:255',
                'description' => 'sometimes|required|string',
                'category_id' => 'sometimes|required|exists:place_categories,placeCategoryID',
                'google_maps_link' => 'nullable|url',
                'ratings' => 'nullable|numeric|between:0,5',
                'reviews_count' => 'nullable|integer|min:0',
                'images_url' => 'nullable|array',
                'images_url.*' => 'url',
                'entry_free' => 'boolean',
                'operating_hours' => 'nullable|array',
                'best_season_to_visit' => 'nullable|string',
                'province_id' => 'sometimes|required|exists:province_categories,province_categoryID',
                'latitude' => 'sometimes|nullable|numeric|between:-90,90',
                'longitude' => 'sometimes|nullable|numeric|between:-180,180',
            ]);

            $place->update($validatedData);
            $place->load(['category', 'province']);

            return redirect()->route('places.show', $place->id)->with('success', 'Place updated successfully');
        } catch (ValidationException $e) {
            return back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to update place: ' . $e->getMessage()])->withInput();
        }
    }

    /**
     * Remove the specified place.
     */
    public function destroy(string $id): RedirectResponse
    {
        try {
            $place = Place::findOrFail($id);
            $place->delete();

            return redirect()->route('places.index')->with('success', 'Place deleted successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to delete place: ' . $e->getMessage()]);
        }
    }

    /**
     * Get places by location (nearby places).
     */
    public function getByLocation(Request $request): Response
    {
        try {
            $request->validate([
                'latitude' => 'required|numeric|between:-90,90',
                'longitude' => 'required|numeric|between:-180,180',
                'radius' => 'nullable|numeric|min:0.1|max:100', // radius in km
            ]);

            $latitude = $request->latitude;
            $longitude = $request->longitude;
            $radius = $request->get('radius', 10); // default 10km

            $places = Place::with(['category', 'province'])
                ->selectRaw("*, 
                    (6371 * acos(cos(radians(?)) * cos(radians(latitude)) * 
                    cos(radians(longitude) - radians(?)) + sin(radians(?)) * 
                    sin(radians(latitude)))) AS distance", 
                    [$latitude, $longitude, $latitude])
                ->having('distance', '<', $radius)
                ->orderBy('distance')
                ->get();

            return Inertia::render('places/nearby', [
                'places' => $places,
                'location' => [
                    'latitude' => $latitude,
                    'longitude' => $longitude,
                    'radius' => $radius,
                ],
            ]);
        } catch (ValidationException $e) {
            return Inertia::render('places/nearby', [
                'places' => [],
                'location' => $request->only(['latitude', 'longitude', 'radius']),
                'errors' => $e->errors(),
            ]);
        } catch (\Exception $e) {
            return Inertia::render('places/nearby', [
                'places' => [],
                'location' => $request->only(['latitude', 'longitude', 'radius']),
                'error' => 'Failed to retrieve nearby places: ' . $e->getMessage(),
            ]);
        }
    }
}