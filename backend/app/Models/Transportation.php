<?php

namespace App\Models;

use App\Models\Bus\Bus;
use App\Models\User;
use App\Models\Place;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Transportation extends Model
{
    use HasFactory;

    protected $table = 'transportations';

    protected $primaryKey = 'id';

    protected $fillable = [
        'owner_user_id',
        'placeID',
    ];

    protected $casts = [
        'owner_user_id' => 'integer',
        'place_id' => 'integer',
    ];

    /**
     * Get the owner of this transportation company.
     */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_user_id', 'id');
    }

    /**
     * Get the place associated with this transportation company.
     */
    public function place(): BelongsTo
    {
        return $this->belongsTo(Place::class, 'placeID', 'placeID');
    }

    /**
     * Get all buses owned by this transportation company.
     */
    public function buses(): HasMany
    {
        return $this->hasMany(Bus::class, 'transportation_id', 'id');
    }

    /**
     * Get active buses (buses with at least one scheduled trip).
     */
    public function activeBuses(): HasMany
    {
        return $this->hasMany(Bus::class, 'transportation_id', 'id')
            ->whereHas('schedules', function ($query) {
                $query->where('status', 'scheduled');
            });
    }
}
