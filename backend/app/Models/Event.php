<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
	use HasFactory;

	protected $fillable = [
		'title',
		'description',
		'image_url',
		'place_id',
		'province_id',
		'start_at',
		'end_at',
	];
}


