<?php

namespace App\Models\Bus;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Bus extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'bus_name',
        'bus_plate',
        'seat_capacity',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'seat_capacity' => 'integer',
    ];

    /**
     * Get all seats for this bus.
     */
    public function seats(): HasMany
    {
        return $this->hasMany(BusSeat::class);
    }

    /**
     * Get all schedules for this bus.
     */
    public function schedules(): HasMany
    {
        return $this->hasMany(BusSchedule::class);
    }
}
