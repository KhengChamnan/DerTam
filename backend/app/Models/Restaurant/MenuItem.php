<?php

namespace App\Models\Restaurant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MenuItem extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'menu_items';

    /**
     * The primary key associated with the table.
     *
     * @var string
     */
    protected $primaryKey = 'menu_item_id';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'menu_category_id',
        'restaurant_property_id',
        'name',
        'price',
        'description',
        'images_url',
        'image_public_ids',
        'is_available',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'images_url' => 'array',
        'image_public_ids' => 'array',
        'is_available' => 'boolean',
        'price' => 'float',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'image_public_ids',
        'created_at',
        'updated_at',
        'is_available',
        'restaurant_property_id',
        'category',
    ];

    /**
     * Get the attributes that should be appended.
     *
     * @var array
     */
    protected $appends = ['menu_category_name'];

    /**
     * Get the first image URL as a string.
     *
     * @return string|null
     */
    public function getImageUrlAttribute()
    {
        $urls = $this->images_url;
        return !empty($urls) && is_array($urls) ? $urls[0] : null;
    }

    /**
     * Get the menu category name.
     *
     * @return string|null
     */
    public function getMenuCategoryNameAttribute()
    {
        return $this->category ? $this->category->name : null;
    }

    /**
     * Get the category that owns the menu item.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function category()
    {
        return $this->belongsTo(MenuCategory::class, 'menu_category_id', 'menu_category_id');
    }

    /**
     * Get the restaurant property that owns the menu item.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function restaurantProperty()
    {
        return $this->belongsTo(RestaurantProperty::class, 'restaurant_property_id', 'restaurant_property_id');
    }
}
