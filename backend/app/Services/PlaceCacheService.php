<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;

class PlaceCacheService
{
    /**
     * Cache key for place categories
     */
    const CATEGORIES_CACHE_KEY = 'place_categories';

    /**
     * Cache key for province categories
     */
    const PROVINCES_CACHE_KEY = 'province_categories';

    /**
     * Cache TTL in seconds (24 hours)
     */
    const CACHE_TTL = 86400;

    /**
     * Clear all place-related caches
     */
    public static function clearAll(): void
    {
        Cache::forget(self::CATEGORIES_CACHE_KEY);
        Cache::forget(self::PROVINCES_CACHE_KEY);
    }

    /**
     * Clear categories cache
     */
    public static function clearCategories(): void
    {
        Cache::forget(self::CATEGORIES_CACHE_KEY);
    }

    /**
     * Clear provinces cache
     */
    public static function clearProvinces(): void
    {
        Cache::forget(self::PROVINCES_CACHE_KEY);
    }

    /**
     * Get cached categories
     */
    public static function getCategories()
    {
        return Cache::remember(self::CATEGORIES_CACHE_KEY, self::CACHE_TTL, function () {
            try {
                $categoriesRaw = \App\Models\PlaceCategory::all(['placeCategoryID', 'category_name']);
                return $categoriesRaw->map(function ($category) {
                    return [
                        'placeCategoryID' => $category->placeCategoryID,
                        'name' => $category->category_name,
                    ];
                });
            } catch (\Exception $e) {
                return [];
            }
        });
    }

    /**
     * Get cached provinces
     */
    public static function getProvinces()
    {
        return Cache::remember(self::PROVINCES_CACHE_KEY, self::CACHE_TTL, function () {
            try {
                $provincesRaw = \App\Models\ProvinceCategory::all(['province_categoryID', 'province_categoryName']);
                return $provincesRaw->map(function ($province) {
                    return [
                        'province_categoryID' => $province->province_categoryID,
                        'name' => $province->province_categoryName,
                    ];
                });
            } catch (\Exception $e) {
                return [];
            }
        });
    }
}
