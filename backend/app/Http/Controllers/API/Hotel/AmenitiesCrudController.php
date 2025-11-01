<?php

namespace App\Http\Controllers\API\Hotel;

use App\Http\Controllers\Controller;
use App\Http\Controllers\MediaController;
use App\Models\Hotel\Amenity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AmenitiesCrudController extends Controller
{
    /**
     * Store a newly created amenity in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'amenity_name' => 'required|string|max:255',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $imageUrl = null;
            $imagePublicId = null;

            // Handle image upload if present
            if ($request->hasFile('image')) {
                $mediaController = new MediaController();
                $uploadResult = $mediaController->uploadFile(
                    $request->file('image'),
                    'amenities'
                );
                $imageUrl = $uploadResult['url'];
                $imagePublicId = $uploadResult['public_id'];
            }

            $amenity = Amenity::create([
                'amenity_name' => $request->amenity_name,
                'is_available' => $request->is_available ?? true,
                'image_url' => $imageUrl,
                'image_public_ids' => $imagePublicId,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Amenity created successfully',
                'data' => $amenity
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create amenity',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified amenity from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        try {
            $amenity = Amenity::find($id);

            if (!$amenity) {
                return response()->json([
                    'success' => false,
                    'message' => 'Amenity not found'
                ], 404);
            }

            // Delete image from Cloudinary if exists
            if ($amenity->image_public_ids) {
                $mediaController = new MediaController();
                $mediaController->deleteFile($amenity->image_public_ids);
            }

            $amenity->delete();

            return response()->json([
                'success' => true,
                'message' => 'Amenity deleted successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete amenity',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
