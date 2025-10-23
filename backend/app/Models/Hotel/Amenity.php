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
        'room_properties_id',
        'amenity_name',
        'is_available',
    ];

    protected $casts = [
        'is_available' => 'boolean',
    ];

    public function roomProperty(): BelongsTo
    {
        return $this->belongsTo(RoomProperty::class, 'room_properties_id', 'room_properties_id');
    }
}


