<?php

namespace App\Models\Hotel;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RoomProperty extends Model
{
    use HasFactory;

    protected $table = 'room_properties';

    protected $primaryKey = 'room_properties_id';

    protected $fillable = [
        'property_id',
        'room_type',
        'room_description',
        'max_guests',
        'room_size',
        'price_per_night',
        'is_available',
        'images_url',
        'image_public_ids',
    ];

    protected $casts = [
        'max_guests' => 'integer',
        'price_per_night' => 'integer',
        'is_available' => 'boolean',
        'images_url' => 'array',
        'image_public_ids' => 'array',
    ];

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class, 'property_id', 'property_id');
    }

    public function amenities(): HasMany
    {
        return $this->hasMany(Amenity::class, 'room_properties_id', 'room_properties_id');
    }
}


