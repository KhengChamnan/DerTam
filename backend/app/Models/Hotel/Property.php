<?php

namespace App\Models\Hotel;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Property extends Model
{
    use HasFactory;

    protected $table = 'properties';

    protected $primaryKey = 'property_id';

    protected $fillable = [
        'name',
        'google_map_link',
        'latitude',
        'longitude',
        'owner_user_id',
        'description',
        'rating',
        'reviews_count',
    ];

    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
        'rating' => 'float',
        'reviews_count' => 'integer',
    ];

    public function ownerUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_user_id', 'id');
    }

    public function facilities(): HasMany
    {
        return $this->hasMany(Facility::class, 'property_id', 'property_id');
    }

    public function roomProperties(): HasMany
    {
        return $this->hasMany(RoomProperty::class, 'property_id', 'property_id');
    }
}


