<?php

namespace App\Models\Hotel;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Room extends Model
{
    use HasFactory;

    protected $table = 'rooms';
    
    protected $primaryKey = 'room_id';

    protected $fillable = [
        'room_properties_id',
        'room_number',
        'is_available',
        'status',
        'notes',
    ];

    protected $casts = [
        'is_available' => 'boolean',
    ];

    /**
     * Get the room type/property this room belongs to
     */
    public function roomProperty(): BelongsTo
    {
        return $this->belongsTo(RoomProperty::class, 'room_properties_id', 'room_properties_id');
    }
}
