<?php

namespace App\Http\Controllers\API\Place;

use App\Http\Controllers\Controller;
use App\Http\Controllers\MediaController;
use App\Models\Place;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class PlaceCreateController extends Controller
{
    protected $mediaController;

    public function __construct(MediaController $mediaController)
    {
        $this->mediaController = $mediaController;
    }

    /**
     * Create a new Place via API (Postman/mobile client).
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'description' => 'required|string',
                'category_id' => 'required|exists:place_categories,placeCategoryID',
                'province_id' => 'required|exists:province_categories,province_categoryID',
                'google_maps_link' => 'nullable|url',
                'ratings' => 'nullable|numeric|between:0,5',
                'reviews_count' => 'nullable|integer|min:0',
                'entry_free' => 'nullable|in:0,1,true,false',
                'operating_hours' => 'nullable|json',
                'best_season_to_visit' => 'nullable|string',
                'latitude' => 'nullable|numeric|between:-90,90',
                'longitude' => 'nullable|numeric|between:-180,180',
                // Accept either single image or multiple images[]
                'image' => 'nullable|file|image|mimes:jpg,jpeg,png,webp|max:5120',
                'images' => 'nullable',
                'images.*' => 'file|image|mimes:jpg,jpeg,png,webp|max:5120',
            ]);

            // Normalize files to an array of UploadedFile
            $files = [];
            if ($request->hasFile('images')) {
                // Handle multiple files - ensure it's an array
                $filesInput = $request->file('images');
                $files = is_array($filesInput) ? $filesInput : [$filesInput];
            } elseif ($request->hasFile('image')) {
                // Handle single file
                $files = [$request->file('image')];
            }

            if (empty($files)) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => ['image' => ['At least one image is required']],
                ], 422);
            }

            // Use MediaController to upload images
            $uploadResult = $this->mediaController->uploadMultipleFiles($files, 'places');
            
            // Check if upload result is valid
            if (!isset($uploadResult['urls']) || !isset($uploadResult['public_ids'])) {
                return response()->json([
                    'message' => 'Failed to create place',
                    'error' => 'Image upload failed - invalid response from media controller',
                ], 500);
            }
            
            $imageUrls = $uploadResult['urls'];
            $publicIds = $uploadResult['public_ids'];

            $payload = $validated;
            $payload['images_url'] = $imageUrls;
            $payload['image_public_ids'] = $publicIds;
            
            // Convert entry_free to boolean
            if (isset($payload['entry_free'])) {
                $payload['entry_free'] = filter_var($payload['entry_free'], FILTER_VALIDATE_BOOLEAN);
            }
            
            // Convert operating_hours from JSON string to array if needed
            if (isset($payload['operating_hours']) && is_string($payload['operating_hours'])) {
                $payload['operating_hours'] = json_decode($payload['operating_hours'], true);
            }

            $place = Place::create($payload);

            return response()->json([
                'message' => 'Place created successfully',
                'data' => [
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
                    'image_public_ids' => $place->image_public_ids,
                ],
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Throwable $e) {
            // Log the full error for debugging
            Log::error('Place creation failed', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([   
                'message' => 'Failed to create place',
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ], 500);
        }
    }
}


