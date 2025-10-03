<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Place extends Model
{
    use HasFactory;

    /**
     * The primary key associated with the table.
     *
     * @var string
     */
    protected $primaryKey = 'placeID';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'description',
        'category_id',
        'google_maps_link',
        'ratings',
        'reviews_count',
        'images_url',
        'entry_free',
        'operating_hours',
        'best_season_to_visit',
        'province_id',
        'latitude',
        'longitude',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'images_url' => 'array',
        'operating_hours' => 'array',
        'entry_free' => 'boolean',
        'ratings' => 'decimal:2',
        'reviews_count' => 'integer',
        'latitude' => 'decimal:7',
        'longitude' => 'decimal:7',
    ];

    /**
     * Get the category that owns the place.
     */
    public function category()
    {
        return $this->belongsTo(PlaceCategory::class, 'category_id', 'placeCategoryID');
    }

    /**
     * Get the province that owns the place.
     */
    public function province()
    {
        return $this->belongsTo(ProvinceCategory::class, 'province_id', 'province_categoryID');
    }
}