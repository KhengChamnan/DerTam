<?php

namespace App\Http\Controllers\API\Hotel;

use App\Http\Controllers\Controller;
use App\Http\Controllers\MediaController;
use App\Models\Hotel\Property;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class HotelCrudController extends Controller
{
    protected $mediaController;

    public function __construct(MediaController $mediaController)
    {
        $this->mediaController = $mediaController;
    }

    /**
     * Create a new Property (Hotel) via API (Postman/mobile client).
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:200',
                'google_map_link' => 'nullable|url|max:255',
                'latitude' => 'nullable|numeric|between:-90,90',
                'longitude' => 'nullable|numeric|between:-180,180',
                'owner_user_id' => 'required|exists:users,id',
                'province_category_id' => 'nullable|exists:province_categories,province_categoryID',
                'description' => 'nullable|string',
                'rating' => 'nullable|numeric|between:0,9.9',
                'reviews_count' => 'nullable|integer|min:0',
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
            $uploadResult = $this->mediaController->uploadMultipleFiles($files, 'hotels');
            
            // Check if upload result is valid
            if (!isset($uploadResult['urls']) || !isset($uploadResult['public_ids'])) {
                return response()->json([
                    'message' => 'Failed to create property',
                    'error' => 'Image upload failed - invalid response from media controller',
                ], 500);
            }
            
            $imageUrls = $uploadResult['urls'];
            $publicIds = $uploadResult['public_ids'];

            $payload = $validated;
            $payload['image_url'] = $imageUrls;
            $payload['image_public_id'] = $publicIds;
            
            // Set default rating if not provided
            if (!isset($payload['rating'])) {
                $payload['rating'] = 0.0;
            }
            
            // Set default reviews_count if not provided
            if (!isset($payload['reviews_count'])) {
                $payload['reviews_count'] = 0;
            }

            $property = Property::create($payload);

            return response()->json([
                'message' => 'Property created successfully',
                'data' => [
                    'property_id' => $property->property_id,
                    'name' => $property->name,
                    'google_map_link' => $property->google_map_link,
                    'latitude' => $property->latitude,
                    'longitude' => $property->longitude,
                    'owner_user_id' => $property->owner_user_id,
                    'province_category_id' => $property->province_category_id,
                    'description' => $property->description,
                    'rating' => $property->rating,
                    'reviews_count' => $property->reviews_count,
                    'image_url' => $property->image_url,
                    'image_public_id' => $property->image_public_id,
                ],
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Throwable $e) {
            // Log the full error for debugging
            Log::error('Property creation failed', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([   
                'message' => 'Failed to create property',
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ], 500);
        }
    }

    /**
     * Delete a Property (Hotel) and its associated images from Cloudinary.
     */
    public function destroy($property_id)
    {
        try {
            // Find the property
            $property = Property::find($property_id);

            if (!$property) {
                return response()->json([
                    'message' => 'Property not found',
                ], 404);
            }

            // Delete images from Cloudinary if they exist
            if ($property->image_public_id && is_array($property->image_public_id)) {
                foreach ($property->image_public_id as $publicId) {
                    try {
                        $this->mediaController->deleteFile($publicId);
                    } catch (\Exception $e) {
                        Log::warning('Failed to delete image from Cloudinary', [
                            'public_id' => $publicId,
                            'error' => $e->getMessage()
                        ]);
                    }
                }
            }

            // Delete the property (cascade will handle related records)
            $property->delete();

            return response()->json([
                'message' => 'Property deleted successfully',
            ], 200);

        } catch (\Throwable $e) {
            Log::error('Property deletion failed', [
                'property_id' => $property_id,
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'message' => 'Failed to delete property',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
