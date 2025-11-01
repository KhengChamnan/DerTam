<?php

namespace App\Http\Controllers\API\Hotel;

use App\Http\Controllers\Controller;
use App\Http\Controllers\MediaController;
use App\Models\Hotel\Facility;
use Illuminate\Http\Request;

class FacilitiesCrudController extends Controller
{
    //Post facility
    public function store(Request $request)
    {
        $request->validate([
            'facility_name' => 'required|string|max:255',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        try {
            $imageUrl = null;
            $imagePublicId = null;

            // Handle image upload if present
            if ($request->hasFile('image')) {
                $mediaController = new MediaController();
                $uploadResult = $mediaController->uploadFile(
                    $request->file('image'),
                    'facilities'
                );
                $imageUrl = $uploadResult['url'];
                $imagePublicId = $uploadResult['public_id'];
            }

            $facility = Facility::create([
                'facility_name' => $request->input('facility_name'),
                'image_url' => $imageUrl,
                'image_public_ids' => $imagePublicId,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Facility created successfully',
                'data' => $facility,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create facility',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified facility from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        try {
            $facility = Facility::find($id);

            if (!$facility) {
                return response()->json([
                    'success' => false,
                    'message' => 'Facility not found'
                ], 404);
            }

            // Delete image from Cloudinary if exists
            if ($facility->image_public_ids) {
                $mediaController = new MediaController();
                $mediaController->deleteFile($facility->image_public_ids);
            }

            $facility->delete();

            return response()->json([
                'success' => true,
                'message' => 'Facility deleted successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete facility',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}