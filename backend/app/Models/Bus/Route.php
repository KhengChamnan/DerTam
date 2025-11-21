<?php

namespace App\Models\Bus;

use App\Models\ProvinceCategory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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
     * Get the starting province for this route.
     */
    public function fromLocation(): BelongsTo
    {
        return $this->belongsTo(ProvinceCategory::class, 'from_location', 'province_categoryID');
    }

    /**
     * Get the destination province for this route.
     */
    public function toLocation(): BelongsTo
    {
        return $this->belongsTo(ProvinceCategory::class, 'to_location', 'province_categoryID');
    }

    /**
     * Get all schedules for this route.
     */
    public function schedules(): HasMany
    {
        return $this->hasMany(BusSchedule::class);
    }

    /**
     * Get the from location (origin province).
     */
    public function fromProvince()
    {
        return $this->belongsTo(\App\Models\ProvinceCategory::class, 'from_location', 'province_categoryID');
    }

    /**
     * Get the to location (destination province).
     */
    public function toProvince()
    {
        return $this->belongsTo(\App\Models\ProvinceCategory::class, 'to_location', 'province_categoryID');
    }
}
