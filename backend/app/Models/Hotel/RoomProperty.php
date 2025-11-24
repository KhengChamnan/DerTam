<?php

namespace App\Models\Hotel;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
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
        'images_url',
        'image_public_ids',
        'number_of_bed',
    ];

    protected $casts = [
        'max_guests' => 'integer',
        'price_per_night' => 'integer',
        'images_url' => 'array',
        'image_public_ids' => 'array',
    ];

    protected $appends = ['available_rooms_count', 'total_rooms_count'];

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class, 'property_id', 'property_id');
    }

    // Many-to-many relationship with amenities through pivot table
    public function amenities(): BelongsToMany
    {
        return $this->belongsToMany(
            Amenity::class,
            'room_amenities', // pivot table name
            'room_properties_id',
            'amenity_id',
            'room_properties_id',
            'amenity_id'
        );
    }

    /**
     * One room type can have many individual rooms
     */
    public function rooms(): HasMany
    {
        return $this->hasMany(Room::class, 'room_properties_id', 'room_properties_id');
    }

    /**
     * Get count of available rooms for this room type
     */
    public function availableRoomsCount(): int
    {
        return $this->rooms()->where('is_available', true)->count();
    }

    /**
     * Accessor for available rooms count (auto-appended to JSON)
     */
    public function getAvailableRoomsCountAttribute(): int
    {
        return $this->availableRoomsCount();
    }

    /**
     * Accessor for total rooms count (auto-appended to JSON)
     */
    public function getTotalRoomsCountAttribute(): int
    {
        return $this->rooms()->count();
    }

    /**
     * Check if this room type has any available rooms
     */
    public function hasAvailableRooms(): bool
    {
        return $this->availableRoomsCount() > 0;
    }

    /**
     * Get all available rooms for this room type
     */
    public function availableRooms()
    {
        return $this->rooms()->where('is_available', true);
    }
}


