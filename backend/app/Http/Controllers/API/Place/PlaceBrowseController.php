<?php

namespace App\Http\Controllers\API\Place;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class PlaceBrowseController extends Controller
{
	public function search(Request $request)
	{
		$request->validate([
			'q' => 'required|string|min:1',
			'province_id' => 'nullable|integer',
			'limit' => 'nullable|integer|min:1|max:50',
		]);

		$q = $request->string('q');
		$provinceId = $request->integer('province_id') ?: null;
		$limit = $request->integer('limit') ?: 20;

		$cacheKey = 'places:search:'.md5(json_encode([$q, $provinceId, $limit]));
		return Cache::remember($cacheKey, 60, function () use ($q, $provinceId, $limit) {
			$query = DB::table('places')
				->leftJoin('province_categories', 'places.province_id', '=', 'province_categories.province_categoryID')
				->select(
					'places.placeID as placeID',
					'places.name',
					'places.ratings',
					'places.province_id',
					DB::raw("JSON_UNQUOTE(JSON_EXTRACT(places.images_url, '$[0]')) as image_url"),
					DB::raw('province_categories.province_categoryName as location')
				)
				->where(function($sub) use ($q) {
					$sub->where('places.name', 'like', "%{$q}%")
						->orWhere('places.description', 'like', "%{$q}%");
				})
				->whereNotIn('places.category_id', [2, 3]); // Exclude restaurants (2) and hotels (3)

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

	public function byCategory(Request $request)
	{
		$request->validate([
			'category' => 'nullable|string|in:popular',
			'category_id' => 'nullable|integer',
			'province_id' => 'nullable|integer',
			'page' => 'nullable|integer|min:1',
			'per_page' => 'nullable|integer|min:1|max:20',
		]);

		$category = $request->input('category');
		$categoryId = $request->has('category_id') ? $request->integer('category_id') : null;
		$provinceId = $request->integer('province_id') ?: null;
		$page = max(1, (int)($request->integer('page') ?: 1));
		$perPage = (int)($request->integer('per_page') ?: 10);
		$offset = ($page - 1) * $perPage;

		$cacheKey = 'places:byCategory:'.md5(json_encode([$category, $categoryId, $provinceId, $page, $perPage]));
		return Cache::remember($cacheKey, 60, function () use ($category, $categoryId, $provinceId, $offset, $perPage) {
			$query = DB::table('places')
				->leftJoin('province_categories', 'places.province_id', '=', 'province_categories.province_categoryID')
				->leftJoin('place_categories', 'places.category_id', '=', 'place_categories.placeCategoryID')
				->select(
					'places.placeID as placeID',
					'places.name',
					'places.ratings',
					'places.province_id',
					DB::raw("JSON_UNQUOTE(JSON_EXTRACT(places.images_url, '$[0]')) as image_url"),
					DB::raw('province_categories.province_categoryName as location')
				);

			// If category_id is 0, return all places (don't exclude restaurants and hotels)
			if ($categoryId !== 0 && $categoryId !== null) {
				$query->whereNotIn('places.category_id', [2, 3]); // Exclude restaurants (2) and hotels (3)
			}

			if ($category === 'popular') {
				$query->orderByDesc('places.ratings')->orderByDesc('places.reviews_count');
			} elseif ($categoryId !== null && $categoryId !== 0) {
				$query->where('places.category_id', $categoryId)
					->orderByDesc('places.ratings');
			} else {
				// When category_id is 0 or null, just order by ratings
				$query->orderByDesc('places.ratings')->orderByDesc('places.reviews_count');
			}

			if ($provinceId) {
				$query->where('places.province_id', $provinceId);
			}

			return $query->offset($offset)->limit($perPage)->get();
		});
	}
}


