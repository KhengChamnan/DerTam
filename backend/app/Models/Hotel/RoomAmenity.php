<?php

namespace App\Models\Hotel;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RoomAmenity extends Model
{
    use HasFactory;

    protected $table = 'room_amenities';

    protected $primaryKey = null; // since it's a pivot table (composite key)
    public $incrementing = false; // disable auto-increment
    protected $keyType = 'string'; // not using numeric id

    protected $fillable = [
        'room_properties_id',
        'amenity_id',
        'created_at',
        'updated_at',
    ];

    /**
     * Each record belongs to a RoomProperty
     */
    public function roomProperty(): BelongsTo
    {
        return $this->belongsTo(RoomProperty::class, 'room_properties_id', 'room_properties_id');
    }

    /**
     * Each record belongs to an Amenity
     */
    public function amenity(): BelongsTo
    {
        return $this->belongsTo(Amenity::class, 'amenity_id', 'amenity_id');
    }
}
