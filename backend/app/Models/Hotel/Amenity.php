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

    // Inverse of the many-to-many relationship
    public function roomProperties()
    {
        return $this->belongsToMany(
            RoomProperty::class,
            'room_amenities', // pivot table name
            'amenity_id',
            'room_properties_id',
            'amenity_id',
            'room_properties_id'
        );
    }
}


