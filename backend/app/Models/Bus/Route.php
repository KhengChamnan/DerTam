<?php

namespace App\Models\Bus;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Route extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'from_location',
        'to_location',
        'distance_km',
        'duration_hours',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'distance_km' => 'decimal:2',
        'duration_hours' => 'decimal:2',
    ];

    /**
     * Get all schedules for this route.
     */
    public function schedules(): HasMany
    {
        return $this->hasMany(BusSchedule::class);
    }
}
