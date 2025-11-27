<?php

namespace App\Models\Bus;

use App\Models\Transportation as TransportationModel;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BusProperty extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'transportation_id',
        'bus_type',
        'bus_description',
        'seat_capacity',
        'has_multiple_levels',
        'level_configuration',
        'price_per_seat',
        'features',
        'amenities',
        'image_url',
        'image_public_ids',
        'seat_layout',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'seat_capacity' => 'integer',
        'transportation_id' => 'integer',
        'price_per_seat' => 'decimal:2',
        'has_multiple_levels' => 'boolean',
        'amenities' => 'array',
        'level_configuration' => 'array',
        'seat_layout' => 'array',
    ];

    /**
     * Get the transportation company this bus property belongs to.
     */
    public function transportation(): BelongsTo
    {
        return $this->belongsTo(TransportationModel::class, 'transportation_id', 'id');
    }

    /**
     * Get all buses of this type.
     */
    public function buses(): HasMany
    {
        return $this->hasMany(Bus::class, 'bus_property_id');
    }

    /**
     * Get available buses of this type.
     */
    public function availableBuses(): HasMany
    {
        return $this->buses()->where('is_available', true);
    }

    /**
     * Get total number of seats across all buses of this type.
     */
    public function getTotalSeatsAttribute(): int
    {
        return $this->buses()->count() * $this->seat_capacity;
    }

    /**
     * Recreate seats for ALL buses using this property.
     * (useful if you update the seat layout template)
     */
    public function recreateSeatsForAllBuses(): void
    {
        foreach ($this->buses as $bus) {
            $bus->recreateSeats();
        }
    }
}