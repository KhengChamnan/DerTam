<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserPreference extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'subcategories',
        'min_rating',
        'popularity_preference',
        'province_ids',
        'completed_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'subcategories' => 'array',
        'province_ids' => 'array',
        'min_rating' => 'decimal:1',
        'completed_at' => 'datetime',
    ];

    /**
     * Get the user that owns the preference.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Check if user has completed onboarding.
     *
     * @return bool
     */
    public function hasCompletedOnboarding(): bool
    {
        return !is_null($this->completed_at);
    }

    /**
     * Get default preferences.
     *
     * @return array
     */
    public static function getDefaultPreferences(): array
    {
        return [
            'subcategories' => ['temples', 'museums', 'parks', 'monuments', 'palaces', 'markets', 'water_attractions', 'other_attractions'],
            'min_rating' => 4.0,
            'popularity_preference' => 'balanced',
            'province_ids' => null,
        ];
    }
}

