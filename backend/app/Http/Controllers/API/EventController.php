<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class EventController extends Controller
{
	public function upcoming(Request $request)
	{
		$request->validate([
			'province_id' => 'nullable|integer',
			'limit' => 'nullable|integer|min:1|max:20',
		]);

		$provinceId = $request->integer('province_id') ?: null;
		$limit = $request->integer('limit') ?: 10;

		$cacheKey = 'events:upcoming:'.md5(json_encode([$provinceId, $limit]));
		return Cache::remember($cacheKey, 60, function () use ($provinceId, $limit) {
			$query = DB::table('events')
				->leftJoin('places', 'events.place_id', '=', 'places.placeID')
				->select(
					'events.id',
					'events.title',
					'events.image_url',
					'events.start_at',
					'events.end_at',
					'events.place_id',
					DB::raw('places.name as place_name'),
					'events.province_id'
				)
				->where(function($w){
					$w->where('events.start_at', '>=', now())
						->orWhere('events.end_at', '>=', now());
				});

			if ($provinceId) {
				$query->where('events.province_id', $provinceId);
			}

			return $query->orderBy('events.start_at')->limit($limit)->get();
		});
	}
}


