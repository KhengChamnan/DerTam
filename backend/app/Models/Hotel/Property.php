<?php

namespace App\Models\Hotel;

use App\Models\User;
use App\Models\ProvinceCategory;
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
        'image_url',
        'image_public_id',
        'province_category_id',
    ];

    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
        'rating' => 'float',
        'reviews_count' => 'integer',
        'image_url' => 'array',
        'image_public_id' => 'array',
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

  public function provinceCategory(): BelongsTo
{
    return $this->belongsTo(ProvinceCategory::class, 'province_category_id', 'province_categoryID');
}

}


