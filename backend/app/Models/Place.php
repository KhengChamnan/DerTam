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
        'image_public_ids',
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
        'image_public_ids' => 'array',
        'operating_hours' => 'array',
        'entry_free' => 'boolean',
        'ratings' => 'float',
        'reviews_count' => 'integer',
        'latitude' => 'float',
        'longitude' => 'float',
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

    /**
     * Alias for province relationship (for compatibility).
     */
    public function provinceCategory()
    {
        return $this->belongsTo(ProvinceCategory::class, 'province_id', 'province_categoryID');
    }

    /**
     * Get the hotel properties for this place.
     */
    public function properties()
    {
        return $this->hasMany(\App\Models\Hotel\Property::class, 'place_id', 'placeID');
    }

    /**
     * Get the transportation companies for this place.
     */
    public function transportations()
    {
        return $this->hasMany(\App\Models\Transportation::class, 'placeID', 'placeID');
    }

    /**
     * Scope a query to search places by name and description with word order.
     * Uses full-text search for better performance.
     * Search is case-insensitive (MySQL full-text search default behavior).
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string $searchTerm
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeSearch($query, $searchTerm)
    {
        if (empty($searchTerm)) {
            return $query;
        }

        // Trim and sanitize search term
        $searchTerm = trim($searchTerm);
        
        // Use full-text search with boolean mode for word order relevance
        // Words in order get higher relevance score
        // Full-text search is case-insensitive by default in MySQL
        return $query->selectRaw('places.*, MATCH(name, description) AGAINST(? IN BOOLEAN MODE) as relevance', [$searchTerm])
            ->whereRaw('MATCH(name, description) AGAINST(? IN BOOLEAN MODE)', [$searchTerm])
            ->orderByDesc('relevance');
    }

    /**
     * Scope a query to filter by category.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param int|null $categoryId
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeByCategory($query, $categoryId)
    {
        if (empty($categoryId)) {
            return $query;
        }

        return $query->where('category_id', $categoryId);
    }

    /**
     * Scope a query to filter by province.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param int|null $provinceId
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeByProvince($query, $provinceId)
    {
        if (empty($provinceId)) {
            return $query;
        }

        return $query->where('province_id', $provinceId);
    }

    /**
     * Scope a query to filter by entry fee status.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param bool|null $isFree
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeByEntryFee($query, $isFree)
    {
        if (is_null($isFree)) {
            return $query;
        }

        return $query->where('entry_free', $isFree);
    }

    /**
     * Scope a query to filter by minimum rating.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param float|null $minRating
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeByMinRating($query, $minRating)
    {
        if (empty($minRating)) {
            return $query;
        }

        return $query->where('ratings', '>=', $minRating);
    }
}