<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Controllers\MediaController;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class EventController extends Controller
{
	/**
	 * Get all events with pagination
	 * GET /api/events
	 */
	public function index(Request $request)
	{
		$request->validate([
			'province_id' => 'nullable|integer',
			'per_page' => 'nullable|integer|min:1|max:50',
		]);

		$provinceId = $request->integer('province_id') ?: null;
		$perPage = $request->integer('per_page') ?: 15;

		$query = Event::with(['place:placeID,name', 'province:province_categoryID,province_categoryName'])
			->orderBy('start_at', 'desc');

		if ($provinceId) {
			$query->where('province_id', $provinceId);
		}

		$events = $query->paginate($perPage);

		return response()->json([
			'success' => true,
			'message' => 'Events retrieved successfully',
			'data' => $events,
		]);
	}

	/**
	 * Get upcoming events
	 * GET /api/events/upcoming
	 */
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

	/**
	 * Get a single event
	 * GET /api/events/{id}
	 */
	public function show($id)
	{
		$event = Event::with(['place:placeID,name,images_url,latitude,longitude', 'province:province_categoryID,province_categoryName'])
			->find($id);

		if (!$event) {
			return response()->json([
				'success' => false,
				'message' => 'Event not found',
			], 404);
		}

		return response()->json([
			'success' => true,
			'message' => 'Event retrieved successfully',
			'data' => $event,
		]);
	}

	/**
	 * Create a new event
	 * POST /api/events
	 */
	public function store(Request $request)
	{
		$validator = Validator::make($request->all(), [
			'title' => 'required|string|max:255',
			'description' => 'nullable|string',
			'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
			'place_id' => 'nullable|exists:places,placeID',
			'province_id' => 'nullable|exists:province_categories,province_categoryID',
			'start_at' => 'required|date',
			'end_at' => 'nullable|date|after_or_equal:start_at',
		]);

		if ($validator->fails()) {
			return response()->json([
				'success' => false,
				'message' => 'Validation error',
				'errors' => $validator->errors(),
			], 422);
		}

		try {
			$imageUrl = null;
			$imagePublicId = null;

			// Handle image upload if present
			if ($request->hasFile('image')) {
				$mediaController = new MediaController();
				$uploadResult = $mediaController->uploadFile(
					$request->file('image'),
					'events'
				);
				$imageUrl = $uploadResult['url'];
				$imagePublicId = $uploadResult['public_id'];
			}

			$event = Event::create([
				'title' => $request->input('title'),
				'description' => $request->input('description'),
				'image_url' => $imageUrl,
				'image_public_id' => $imagePublicId,
				'place_id' => $request->input('place_id'),
				'province_id' => $request->input('province_id'),
				'start_at' => $request->input('start_at'),
				'end_at' => $request->input('end_at'),
			]);

			// Clear cache
			$this->clearEventCache();

			return response()->json([
				'success' => true,
				'message' => 'Event created successfully',
				'data' => $event,
			], 201);
		} catch (\Exception $e) {
			return response()->json([
				'success' => false,
				'message' => 'Failed to create event',
				'error' => $e->getMessage(),
			], 500);
		}
	}

	/**
	 * Update an event
	 * PUT /api/events/{id}
	 */
	public function update(Request $request, $id)
	{
		$event = Event::find($id);

		if (!$event) {
			return response()->json([
				'success' => false,
				'message' => 'Event not found',
			], 404);
		}

		$validator = Validator::make($request->all(), [
			'title' => 'sometimes|required|string|max:255',
			'description' => 'nullable|string',
			'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
			'place_id' => 'nullable|exists:places,placeID',
			'province_id' => 'nullable|exists:province_categories,province_categoryID',
			'start_at' => 'sometimes|required|date',
			'end_at' => 'nullable|date|after_or_equal:start_at',
		]);

		if ($validator->fails()) {
			return response()->json([
				'success' => false,
				'message' => 'Validation error',
				'errors' => $validator->errors(),
			], 422);
		}

		try {
			$updateData = $request->only([
				'title',
				'description',
				'place_id',
				'province_id',
				'start_at',
				'end_at',
			]);

			// Handle image upload if present
			if ($request->hasFile('image')) {
				$mediaController = new MediaController();

				// Delete old image from Cloudinary if exists
				if ($event->image_public_id) {
					$mediaController->deleteFile($event->image_public_id);
				}

				// Upload new image
				$uploadResult = $mediaController->uploadFile(
					$request->file('image'),
					'events'
				);
				$updateData['image_url'] = $uploadResult['url'];
				$updateData['image_public_id'] = $uploadResult['public_id'];
			}

			$event->update($updateData);

			// Clear cache
			$this->clearEventCache();

			return response()->json([
				'success' => true,
				'message' => 'Event updated successfully',
				'data' => $event->fresh(),
			]);
		} catch (\Exception $e) {
			return response()->json([
				'success' => false,
				'message' => 'Failed to update event',
				'error' => $e->getMessage(),
			], 500);
		}
	}

	/**
	 * Delete an event
	 * DELETE /api/events/{id}
	 */
	public function destroy($id)
	{
		$event = Event::find($id);

		if (!$event) {
			return response()->json([
				'success' => false,
				'message' => 'Event not found',
			], 404);
		}

		try {
			// Delete image from Cloudinary if exists
			if ($event->image_public_id) {
				$mediaController = new MediaController();
				$mediaController->deleteFile($event->image_public_id);
			}

			$event->delete();

			// Clear cache
			$this->clearEventCache();

			return response()->json([
				'success' => true,
				'message' => 'Event deleted successfully',
			]);
		} catch (\Exception $e) {
			return response()->json([
				'success' => false,
				'message' => 'Failed to delete event',
				'error' => $e->getMessage(),
			], 500);
		}
	}

	/**
	 * Clear event-related cache
	 */
	private function clearEventCache()
	{
		// Clear all event cache keys (simplified approach)
		Cache::forget('events:upcoming:'.md5(json_encode([null, 10])));
	}
}


