<?php

namespace App\Models\Hotel;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Facility extends Model
{
    use HasFactory;

    protected $table = 'facilities';

    protected $primaryKey = 'facility_id';

    protected $fillable = [
        'facility_name',
        'image_url',
        'image_public_ids',
    ];

    // Removed property relationship since facilities is now a master list
    // If you need to relate facilities to properties, use the property_facilities pivot table
}


