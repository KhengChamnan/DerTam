<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PlaceCategory extends Model
{
    use HasFactory;

    /**
     * The primary key associated with the table.
     *
     * @var string
     */
    protected $primaryKey = 'placeCategoryID';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'category_name',
        'category_description',
    ];

    /**
     * Get the places for this category.
     */
    public function places()
    {
        return $this->hasMany(Place::class, 'category_id', 'placeCategoryID');
    }
}