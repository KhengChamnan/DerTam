<?php

namespace App\Models\Hotel;

use App\Models\User;
use App\Models\Place;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Property extends Model
{
    use HasFactory;

    protected $table = 'properties';

    protected $primaryKey = 'property_id';

    protected $fillable = [
        'owner_user_id',
        'place_id',
    ];

    protected $casts = [
        //
    ];

    public function ownerUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_user_id', 'id');
    }

    public function place(): BelongsTo
    {
        return $this->belongsTo(Place::class, 'place_id', 'placeID');
    }

    // Many-to-many relationship with facilities through pivot table
    public function facilities()
    {
        return $this->belongsToMany(
            Facility::class, 
            'property_facilities', // pivot table name
            'property_id', 
            'facility_id',
            'property_id',
            'facility_id'
        );
    }

    public function roomProperties(): HasMany
    {
        return $this->hasMany(RoomProperty::class, 'property_id', 'property_id');
    }

}


