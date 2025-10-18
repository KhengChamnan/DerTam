<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TripDay extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'trip_days';

    /**
     * The primary key associated with the table.
     *
     * @var string
     */
    protected $primaryKey = 'trip_day_id';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'trip_id',
        'date',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'date' => 'date',
    ];

    /**
     * Get the trip places for the trip day.
     *
     * @return HasMany
     */
    public function tripPlaces(): HasMany
    {
        return $this->hasMany(TripPlace::class, 'trip_day_id', 'trip_day_id');
    }
}
