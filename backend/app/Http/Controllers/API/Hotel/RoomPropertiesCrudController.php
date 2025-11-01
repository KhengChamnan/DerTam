<?php

namespace App\Http\Controllers\API\Hotel;

use App\Http\Controllers\Controller;
use App\Http\Controllers\MediaController;
use App\Models\Hotel\RoomProperty;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class RoomPropertiesCrudController extends Controller
{
    protected $mediaController;

    public function __construct(MediaController $mediaController)
    {
        $this->mediaController = $mediaController;
    }

    /**
     * Create a new Room Property via API (Postman/mobile client).
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'property_id' => 'required|exists:properties,property_id',
                'room_type' => 'required|string|max:2000',
                'room_description' => 'nullable|string',
                'max_guests' => 'required|integer|min:1',
                'room_size' => 'nullable|numeric|min:0',
                'price_per_night' => 'required|integer|min:0',
                'is_available' => 'nullable|boolean',
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
            $uploadResult = $this->mediaController->uploadMultipleFiles($files, 'room_properties');
            
            // Check if upload result is valid
            if (!isset($uploadResult['urls']) || !isset($uploadResult['public_ids'])) {
                return response()->json([
                    'message' => 'Failed to create room property',
                    'error' => 'Image upload failed - invalid response from media controller',
                ], 500);
            }
            
            $imageUrls = $uploadResult['urls'];
            $publicIds = $uploadResult['public_ids'];

            $payload = $validated;
            $payload['images_url'] = $imageUrls;
            $payload['image_public_ids'] = $publicIds;
            
            // Set default is_available if not provided
            if (!isset($payload['is_available'])) {
                $payload['is_available'] = true;
            }

            $roomProperty = RoomProperty::create($payload);

            return response()->json([
                'message' => 'Room property created successfully',
                'data' => [
                    'room_properties_id' => $roomProperty->room_properties_id,
                    'property_id' => $roomProperty->property_id,
                    'room_type' => $roomProperty->room_type,
                    'room_description' => $roomProperty->room_description,
                    'max_guests' => $roomProperty->max_guests,
                    'room_size' => $roomProperty->room_size,
                    'price_per_night' => $roomProperty->price_per_night,
                    'is_available' => $roomProperty->is_available,
                    'images_url' => $roomProperty->images_url,
                    'image_public_ids' => $roomProperty->image_public_ids,
                ],
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Throwable $e) {
            // Log the full error for debugging
            Log::error('Room property creation failed', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([   
                'message' => 'Failed to create room property',
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ], 500);
        }
    }

    /**
     * Delete a Room Property and its associated images from Cloudinary.
     */
    public function destroy($room_properties_id)
    {
        try {
            // Find the room property
            $roomProperty = RoomProperty::find($room_properties_id);

            if (!$roomProperty) {
                return response()->json([
                    'message' => 'Room property not found',
                ], 404);
            }

            // Delete images from Cloudinary if they exist
            if ($roomProperty->image_public_ids && is_array($roomProperty->image_public_ids)) {
                foreach ($roomProperty->image_public_ids as $publicId) {
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

            // Delete the room property (cascade will handle related records)
            $roomProperty->delete();

            return response()->json([
                'message' => 'Room property deleted successfully',
            ], 200);

        } catch (\Throwable $e) {
            Log::error('Room property deletion failed', [
                'room_properties_id' => $room_properties_id,
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'message' => 'Failed to delete room property',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
