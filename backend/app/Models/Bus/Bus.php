<?php

namespace App\Models\Bus;

use App\Models\Transportation;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
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
        'bus_type',
        'seat_capacity',
        'is_active',
        'transportation_id',
        'description',
        'features',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'seat_capacity' => 'integer',
        'transportation_id' => 'integer',
        'is_active' => 'boolean',
    ];

    /**
     * Get the transportation company this bus belongs to.
     */
    public function transportation(): BelongsTo
    {
        return $this->belongsTo(Transportation::class, 'transportation_id', 'id');
    }

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

    /**
     * Get active schedules (scheduled status only).
     */
    public function activeSchedules(): HasMany
    {
        return $this->hasMany(BusSchedule::class)->where('status', 'scheduled');
    }
}
