<?php

namespace App\Models\Restaurant;

use App\Models\Place;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RestaurantProperty extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'restaurant_properties';

    /**
     * The primary key associated with the table.
     *
     * @var string
     */
    protected $primaryKey = 'restaurant_property_id';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'owner_user_id',
        'place_id',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the owner of the restaurant property.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_user_id', 'id');
    }

    /**
     * Get the place associated with the restaurant property.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function place()
    {
        return $this->belongsTo(Place::class, 'place_id', 'placeID');
    }

    /**
     * Get the menu items for this restaurant property.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function menuItems()
    {
        return $this->hasMany(MenuItem::class, 'restaurant_property_id', 'restaurant_property_id');
    }
}
