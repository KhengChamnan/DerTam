<?php

namespace App\Http\Controllers\API\Hotel;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Hotel\PropertyFacility;
use Illuminate\Support\Facades\Validator;

class PropertyFacilitiesCrudController extends Controller
{
    /**
     * Store new facilities for a property.
     */
    public function store(Request $request)
    {
        // Validate incoming request
        $validator = Validator::make($request->all(), [
            'property_id' => 'required|integer',
            'facilities' => 'required|array',
            'facilities.*' => 'integer', // each element in the array must be an integer
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $propertyId = $request->property_id;
        $facilityIds = $request->facilities;

        // Loop through facilities and create entries in pivot table
        foreach ($facilityIds as $facilityId) {
            PropertyFacility::updateOrCreate(
                [
                    'property_id' => $propertyId,
                    'facility_id' => $facilityId,
                ],
                [
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }

        return response()->json([
            'message' => 'Property facilities added successfully',
            'data' => [
                'property_id' => $propertyId,
                'facilities' => $facilityIds
            ]
        ], 201);
    }
}
