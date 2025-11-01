<?php

namespace App\Http\Controllers\API\Place;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class PlaceCategoryController extends Controller
{
	public function index()
	{
		return Cache::remember('place_categories:index', 600, function () {
			return DB::table('place_categories')
				->select(
					'place_categories.placeCategoryID as id',
					'place_categories.category_name as name'
				)
				->whereNotIn('place_categories.placeCategoryID', [2, 3]) // Exclude restaurants (2) and hotels (3)
				->orderBy('place_categories.category_name')
				->get();
		});
	}
}


