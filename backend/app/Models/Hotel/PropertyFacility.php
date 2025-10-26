<?php

namespace App\Models\Hotel;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PropertyFacility extends Model
{
    use HasFactory;

    protected $table = 'property_facilities';

    protected $primaryKey = null; // since it's a pivot table (composite key)
    public $incrementing = false; // disable auto-increment
    protected $keyType = 'string'; // not using numeric id

    protected $fillable = [
        'property_id',
        'facility_id',
        'created_at',
        'updated_at',
    ];

    /**
     * Each record belongs to a Property
     */
    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class, 'property_id', 'property_id');
    }

    /**
     * Each record belongs to a Facility
     */
    public function facility(): BelongsTo
    {
        return $this->belongsTo(Facility::class, 'facility_id', 'facility_id');
    }
}
