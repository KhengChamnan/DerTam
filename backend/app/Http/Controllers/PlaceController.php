<?php

namespace App\Http\Controllers;

use App\Models\Place;
use App\Imports\PlacesImport;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\ValidationException;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use App\Http\Controllers\MediaController;
use App\Services\PlaceCacheService;

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

            // Build query using optimized scopes
            $query = Place::query();

            // Eager load relationships with selected columns only for better performance
            $query->with([
                'category:placeCategoryID,category_name',
                'province:province_categoryID,province_categoryName'
            ]);

            // Apply search with full-text search (word order matters)
            if ($request->filled('search')) {
                $query->search($request->search);
            }

            // Apply category filter
            if ($request->filled('category_id') && $request->category_id !== 'all') {
                $query->byCategory($request->category_id);
            }

            // Apply province filter
            if ($request->filled('province_id') && $request->province_id !== 'all') {
                $query->byProvince($request->province_id);
            }

            // Order by name alphabetically if no search term (search has its own relevance ordering)
            if (!$request->filled('search')) {
                $query->orderBy('name', 'asc');
            }

            // Load all records for client-side pagination (default to 10000 if not specified)
            $places = $query->paginate($request->get('per_page', 10000));
            
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

            // Get categories and provinces for filters with caching (24 hours)
            $categories = PlaceCacheService::getCategories();
            $provinces = PlaceCacheService::getProvinces();

            return Inertia::render('places/index', [
                'places' => $places,
                'categories' => $categories,
                'provinces' => $provinces,
                'filters' => $request->only(['category_id', 'province_id', 'search']),
                'auth' => [
                    'user' => Auth::user() ? [
                        'id' => Auth::user()->id,
                        'name' => Auth::user()->name,
                        'email' => Auth::user()->email,
                        'roles' => Auth::user()->load('roles')->roles,
                        'permissions' => Auth::user()->load('permissions', 'roles.permissions')->getAllPermissions()->pluck('name')->toArray(),
                    ] : null,
                ],
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
        // Get categories and provinces for the form (use cached data)
        $categories = PlaceCacheService::getCategories();
        $provinces = PlaceCacheService::getProvinces();

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
                'images' => 'nullable|array',
                'images.*' => 'file|image|max:5120', // Max 5MB per image
                'entry_free' => 'boolean',
                'operating_hours' => 'nullable|array',
                'best_season_to_visit' => 'nullable|string',
                'province_id' => 'required|exists:province_categories,province_categoryID',
                'latitude' => 'nullable|numeric|between:-90,90',
                'longitude' => 'nullable|numeric|between:-180,180',
            ]);

            // Handle image uploads to Cloudinary
            $imageUrls = [];
            $publicIds = [];
            if ($request->hasFile('images')) {
                $mediaController = new MediaController();
                $uploadResult = $mediaController->uploadMultipleFiles(
                    $request->file('images'),
                    'places'
                );
                $imageUrls = $uploadResult['urls'];
                $publicIds = $uploadResult['public_ids'];
            }

            // Replace images field with uploaded URLs and public IDs
            $validatedData['images_url'] = $imageUrls;
            $validatedData['image_public_ids'] = $publicIds;
            unset($validatedData['images']);

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
                'image_public_ids' => $place->image_public_ids,
                'latitude' => $place->latitude,
                'longitude' => $place->longitude,
                'google_maps_link' => $place->google_maps_link,
                'operating_hours' => $place->operating_hours,
                'best_season_to_visit' => $place->best_season_to_visit,
            ];

            // Get categories and provinces for the form (use cached data)
            $categories = PlaceCacheService::getCategories();
            $provinces = PlaceCacheService::getProvinces();

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
                'images' => 'nullable|array',
                'images.*' => 'file|image|max:5120', // Max 5MB per image
                'existing_images' => 'nullable|array', // Keep existing image URLs
                'existing_images.*' => 'url',
                'existing_public_ids' => 'nullable|array', // Keep existing public IDs
                'existing_public_ids.*' => 'string',
                'entry_free' => 'boolean',
                'operating_hours' => 'nullable|array',
                'best_season_to_visit' => 'nullable|string',
                'province_id' => 'sometimes|required|exists:province_categories,province_categoryID',
                'latitude' => 'sometimes|nullable|numeric|between:-90,90',
                'longitude' => 'sometimes|nullable|numeric|between:-180,180',
            ]);

            // Start with existing images and public IDs
            $imageUrls = $request->input('existing_images', []);
            $publicIds = $request->input('existing_public_ids', []);

            // Handle new image uploads to Cloudinary
            if ($request->hasFile('images')) {
                $mediaController = new MediaController();
                $uploadResult = $mediaController->uploadMultipleFiles(
                    $request->file('images'),
                    'places'
                );
                $imageUrls = array_merge($imageUrls, $uploadResult['urls']);
                $publicIds = array_merge($publicIds, $uploadResult['public_ids']);
            }

            // Replace images field with combined URLs and public IDs
            $validatedData['images_url'] = $imageUrls;
            $validatedData['image_public_ids'] = $publicIds;
            unset($validatedData['images']);
            unset($validatedData['existing_images']);
            unset($validatedData['existing_public_ids']);

            $place->update($validatedData);
            $place->load(['category', 'province']);

            return redirect()->route('places.index')->with('success', 'Place updated successfully');
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

    /**
     * Import places from Excel/CSV file.
     */
    public function import(Request $request): RedirectResponse
    {
        try {
            $request->validate([
                'file' => 'required|file|mimes:xlsx,csv,xls|max:102400',
            ]);

            $file = $request->file('file');
            $import = new PlacesImport();
            
            Excel::import($import, $file);

            $stats = $import->getStats();
            
            if ($stats['errors'] > 0) {
                return back()->with([
                    'import_result' => [
                        'type' => 'warning',
                        'message' => "Import completed with warnings. Imported: {$stats['success']}, Errors: {$stats['errors']}",
                        'stats' => $stats,
                        'errors' => $import->getErrors()
                    ]
                ]);
            }

            return back()->with([
                'import_result' => [
                    'type' => 'success',
                    'message' => "Successfully imported {$stats['success']} places",
                    'stats' => $stats
                ]
            ]);

        } catch (ValidationException $e) {
            return back()->withErrors($e->errors());
        } catch (\Exception $e) {
            return back()->with([
                'import_result' => [
                    'type' => 'error',
                    'message' => 'Import failed: ' . $e->getMessage()
                ]
            ]);
        }
    }

    /**
     * Download template Excel file for places import.
     */
    public function downloadTemplate()
    {
        try {
            // Get available categories and provinces for reference
            $availableCategories = \App\Models\PlaceCategory::pluck('category_name')->toArray();
            $availableProvinces = \App\Models\ProvinceCategory::pluck('province_categoryName')->toArray();
            
            // Create a new Spreadsheet object
            $spreadsheet = new \PhpOffice\PhpSpreadsheet\Spreadsheet();
            $sheet = $spreadsheet->getActiveSheet();
            
            // Set sheet title
            $sheet->setTitle('Places Import');
            
            // Add instructions in first rows
            $sheet->setCellValue('A1', 'Instructions: Delete these instruction rows before importing');
            $sheet->setCellValue('A2', 'Available Categories: ' . implode(', ', array_slice($availableCategories, 0, 15)) . '...');
            $sheet->setCellValue('A3', 'Available Provinces: ' . implode(', ', array_slice($availableProvinces, 0, 10)) . '...');
            $sheet->setCellValue('A4', 'entry_free: 1 for free entry, 0 for paid entry');
            $sheet->setCellValue('A5', 'image_urls: Supports JSON array ["url1","url2"], pipe-separated url1|url2, or comma-separated url1,url2');
            $sheet->setCellValue('A6', 'Images must be publicly accessible URLs and will be uploaded to Cloudinary automatically');
            
            // Style instruction rows
            $instructionStyle = [
                'font' => ['italic' => true, 'color' => ['rgb' => '666666']],
                'fill' => ['fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID, 'startColor' => ['rgb' => 'FFF9E6']]
            ];
            for ($i = 1; $i <= 6; $i++) {
                $sheet->getStyle("A{$i}:J{$i}")->applyFromArray($instructionStyle);
            }
            
            // Add headers starting from row 8
            $headers = [
                'name',
                'description',
                'category_name',
                'province_name',
                'latitude',
                'longitude',
                'entry_free',
                'google_maps_link',
                'best_season_to_visit',
                'image_urls'
            ];
            
            $col = 'A';
            foreach ($headers as $header) {
                $sheet->setCellValue($col . '8', $header);
                $col++;
            }
            
            // Style header row
            $headerStyle = [
                'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
                'fill' => ['fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID, 'startColor' => ['rgb' => '4472C4']],
                'alignment' => ['horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER]
            ];
            $sheet->getStyle('A8:J8')->applyFromArray($headerStyle);
            
            // Add sample data rows
            $sampleData = [
                [
                    'Angkor Wat Temple',
                    'Ancient temple complex and UNESCO World Heritage Site',
                    'Tourist Attraction',
                    'Siem Reap',
                    '13.4125',
                    '103.8670',
                    '0',
                    'https://maps.google.com/example1',
                    'November to March',
                    '["https://example.com/image1.jpg","https://example.com/image2.jpg","https://example.com/image3.jpg"]'
                ],
                [
                    'Koh Rong Beach',
                    'Beautiful pristine beach with crystal clear water',
                    'Beach & Water Activities',
                    'Sihanoukville',
                    '10.7236',
                    '103.2906',
                    '1',
                    'https://maps.google.com/example2',
                    'December to April',
                    'https://example.com/beach1.jpg|https://example.com/beach2.jpg'
                ],
                [
                    'Bokor National Park',
                    'Mountain national park with cool climate and hiking trails',
                    'Nature & Parks',
                    'Kampot',
                    '10.6167',
                    '104.0167',
                    '1',
                    'https://maps.google.com/example3',
                    'Year round',
                    'https://example.com/park1.jpg,https://example.com/park2.jpg'
                ]
            ];
            
            $row = 9;
            foreach ($sampleData as $data) {
                $col = 'A';
                foreach ($data as $value) {
                    $sheet->setCellValue($col . $row, $value);
                    $col++;
                }
                $row++;
            }
            
            // Auto-size columns
            foreach (range('A', 'J') as $col) {
                $sheet->getColumnDimension($col)->setAutoSize(true);
            }
            
            // Create Excel file
            $writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($spreadsheet);
            
            // Set headers for download
            $filename = 'places_import_template.xlsx';
            
            // Create temporary file
            $tempFile = tempnam(sys_get_temp_dir(), 'places_template_');
            $writer->save($tempFile);
            
            return response()->download($tempFile, $filename, [
                'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Cache-Control' => 'no-cache, no-store, must-revalidate',
                'Pragma' => 'no-cache',
                'Expires' => '0'
            ])->deleteFileAfterSend(true);

        } catch (\Exception $e) {
            return back()->with([
                'error' => 'Failed to generate template: ' . $e->getMessage()
            ]);
        }
    }
}