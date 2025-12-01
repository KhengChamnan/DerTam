<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Event extends Model
{
	use HasFactory;

	protected $fillable = [
		'title',
		'description',
		'image_url',
		'image_public_id',
		'place_id',
		'province_id',
		'start_at',
		'end_at',
	];

	protected $casts = [
		'start_at' => 'datetime',
		'end_at' => 'datetime',
	];

	/**
	 * Get the place associated with the event.
	 */
	public function place(): BelongsTo
	{
		return $this->belongsTo(Place::class, 'place_id', 'placeID');
	}

	/**
	 * Get the province associated with the event.
	 */
	public function province(): BelongsTo
	{
		return $this->belongsTo(ProvinceCategory::class, 'province_id', 'province_categoryID');
	}
}


