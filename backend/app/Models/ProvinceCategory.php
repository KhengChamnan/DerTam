<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProvinceCategory extends Model
{
    use HasFactory;

    /**
     * The primary key associated with the table.
     *
     * @var string
     */
    protected $primaryKey = 'province_categoryID';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'province_categoryName',
        'category_description',
    ];

    /**
     * Get the places for this province.
     */
    public function places()
    {
        return $this->hasMany(Place::class, 'province_id', 'province_categoryID');
    }
}