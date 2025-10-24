<?php

namespace App\Models\Hotel;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Amenity extends Model
{
    use HasFactory;

    protected $table = 'amenities';

    protected $primaryKey = 'amenity_id';

    protected $fillable = [
        'amenity_name',
        'image_url',
        'image_public_ids',
    ];

    protected $casts = [
        // No casts needed for now
    ];

    // Removed roomProperty relationship since amenities is now a master list
    // If you need to relate amenities to rooms, create a pivot table like room_amenities
}


