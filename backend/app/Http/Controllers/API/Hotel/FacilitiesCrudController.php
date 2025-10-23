<?php

namespace App\Http\Controllers\API\Hotel;

use App\Http\Controllers\Controller;
use App\Models\Hotel\Facility;
use Illuminate\Http\Request;

class FacilitiesCrudController extends Controller
{
    //Post facility
    public function store(Request $request)
    {
        $request->validate([
            'property_id' => 'required|integer|exists:properties,property_id',
            'facility_name' => 'required|string|max:255',
        ]);

        $facility = Facility::create([
            'property_id' => $request->input('property_id'),
            'facility_name' => $request->input('facility_name'),
        ]);

        return response()->json([
            'message' => 'Facility created successfully',
            'facility' => $facility,
        ], 201);
    }
}