<?php

namespace App\Http\Controllers\API\Place;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class RecommendationController extends Controller
{
	public function index(Request $request)
	{
		$request->validate([
			'province_id' => 'nullable|integer',
			'limit' => 'nullable|integer|min:1|max:20',
		]);

		$provinceId = $request->integer('province_id') ?: null;
		$limit = $request->integer('limit') ?: 10;

		$cacheKey = 'places:recommended:'.md5(json_encode([$provinceId, $limit]));
		return Cache::remember($cacheKey, 60, function () use ($provinceId, $limit) {
			$query = DB::table('places')
				->leftJoin('province_categories', 'places.province_id', '=', 'province_categories.province_categoryID')
				->select(
					'places.placeID as placeID',
					'places.name',
					'places.ratings',
					'places.province_id',
					DB::raw("JSON_UNQUOTE(JSON_EXTRACT(places.images_url, '$[0]')) as image_url"),
					DB::raw('province_categories.province_categoryName as location')
				);

			if ($provinceId) {
				$query->where('places.province_id', $provinceId);
			}

			return $query
				->orderByDesc('places.ratings')
				->orderByDesc('places.reviews_count')
				->limit($limit)
				->get();
		});
	}
}


