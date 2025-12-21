<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\API\BaseController;
use App\Models\UserPreference;
use App\Models\ProvinceCategory;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\DB;

class OnboardingController extends BaseController
{
    /**
     * Get questionnaire structure.
     *
     * @return JsonResponse
     */
    public function getQuestions(): JsonResponse
    {
        try {
            // Try to read from JSON file first
            $jsonPath = base_path('../SmartTourism/onboarding_questionnaire_structure.json');
            
            if (File::exists($jsonPath)) {
                $questionnaire = json_decode(File::get($jsonPath), true);
                
                // Load provinces dynamically for question 4
                $provinces = ProvinceCategory::select('province_categoryID as id', 'province_categoryName as label')
                    ->orderBy('province_categoryName')
                    ->get()
                    ->toArray();
                
                // Add provinces to question 4 options
                if (isset($questionnaire['question_4_location'])) {
                    $questionnaire['question_4_location']['options'] = array_merge(
                        [['id' => 'anywhere', 'label' => 'Anywhere', 'default' => true]],
                        $provinces
                    );
                }
                
                return $this->sendResponse($questionnaire, 'Questionnaire retrieved successfully.');
            }
            
            // Fallback: Return hardcoded structure if JSON file doesn't exist
            $questionnaire = $this->getDefaultQuestionnaire();
            return $this->sendResponse($questionnaire, 'Questionnaire retrieved successfully.');
            
        } catch (\Exception $e) {
            return $this->sendError('Error retrieving questionnaire', ['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Get current user's preferences.
     *
     * @return JsonResponse
     */
    public function show(): JsonResponse
    {
        try {
            $user = Auth::user();
            
            $preference = $user->preference;
            
            if (!$preference) {
                return $this->sendResponse(null, 'No preferences found. User has not completed onboarding.');
            }
            
            return $this->sendResponse($preference, 'Preferences retrieved successfully.');
            
        } catch (\Exception $e) {
            return $this->sendError('Error retrieving preferences', ['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Store user preferences.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            
            // Validation
            $validated = $request->validate([
                'subcategories' => 'required|array|min:1',
                'subcategories.*' => 'string|in:temples,museums,parks,monuments,palaces,markets,water_attractions,other_attractions',
                'min_rating' => 'required|numeric|min:0|max:5',
                'popularity_preference' => 'required|string|in:popular,hidden_gems,balanced',
                'province_ids' => 'nullable|array',
                'province_ids.*' => 'integer|exists:province_categories,province_categoryID',
            ]);
            
            // Convert province names to IDs if provided as names
            $provinceIds = null;
            if (isset($validated['province_ids']) && !empty($validated['province_ids'])) {
                // Check if array contains integers (IDs) or strings (names)
                $firstItem = $validated['province_ids'][0];
                if (is_string($firstItem)) {
                    // Convert province names to IDs
                    $provinceIds = ProvinceCategory::whereIn('province_categoryName', $validated['province_ids'])
                        ->pluck('province_categoryID')
                        ->toArray();
                } else {
                    $provinceIds = $validated['province_ids'];
                }
            }
            
            // Create or update preference
            $preference = UserPreference::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'subcategories' => $validated['subcategories'],
                    'min_rating' => $validated['min_rating'],
                    'popularity_preference' => $validated['popularity_preference'],
                    'province_ids' => $provinceIds,
                    'completed_at' => now(),
                ]
            );
            
            return response()->json([
                'success' => true,
                'data' => $preference,
                'message' => 'Preferences saved successfully.',
            ], 201);
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->sendError('Validation Error', $e->errors(), 422);
        } catch (\Exception $e) {
            return $this->sendError('Error saving preferences', ['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Update user preferences.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function update(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            
            $preference = $user->preference;
            
            if (!$preference) {
                return $this->sendError('Preferences not found. Please create preferences first.', [], 404);
            }
            
            // Validation
            $validated = $request->validate([
                'subcategories' => 'sometimes|array|min:1',
                'subcategories.*' => 'string|in:temples,museums,parks,monuments,palaces,markets,water_attractions,other_attractions',
                'min_rating' => 'sometimes|numeric|min:0|max:5',
                'popularity_preference' => 'sometimes|string|in:popular,hidden_gems,balanced',
                'province_ids' => 'nullable|array',
                'province_ids.*' => 'integer|exists:province_categories,province_categoryID',
            ]);
            
            // Convert province names to IDs if provided as names
            if (isset($validated['province_ids'])) {
                if (!empty($validated['province_ids'])) {
                    $firstItem = $validated['province_ids'][0];
                    if (is_string($firstItem)) {
                        $validated['province_ids'] = ProvinceCategory::whereIn('province_categoryName', $validated['province_ids'])
                            ->pluck('province_categoryID')
                            ->toArray();
                    }
                } else {
                    $validated['province_ids'] = null;
                }
            }
            
            $preference->update($validated);
            
            return $this->sendResponse($preference, 'Preferences updated successfully.');
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->sendError('Validation Error', $e->errors(), 422);
        } catch (\Exception $e) {
            return $this->sendError('Error updating preferences', ['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Delete user preferences (reset to defaults).
     *
     * @return JsonResponse
     */
    public function destroy(): JsonResponse
    {
        try {
            $user = Auth::user();
            
            $preference = $user->preference;
            
            if (!$preference) {
                return $this->sendError('Preferences not found.', [], 404);
            }
            
            $preference->delete();
            
            return $this->sendResponse(null, 'Preferences deleted successfully.');
            
        } catch (\Exception $e) {
            return $this->sendError('Error deleting preferences', ['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Get default questionnaire structure (fallback).
     *
     * @return array
     */
    private function getDefaultQuestionnaire(): array
    {
        $provinces = ProvinceCategory::select('province_categoryID as id', 'province_categoryName as label')
            ->orderBy('province_categoryName')
            ->get()
            ->toArray();
        
        return [
            'question_1_category' => [
                'question' => 'What types of tourist attractions are you interested in?',
                'type' => 'multi_select',
                'required' => true,
                'options' => [
                    ['id' => 'temples', 'label' => 'Temples', 'description' => 'Temples, Wat, Pagodas'],
                    ['id' => 'museums', 'label' => 'Museums', 'description' => 'Museums and cultural centers'],
                    ['id' => 'parks', 'label' => 'Parks', 'description' => 'Parks and gardens'],
                    ['id' => 'monuments', 'label' => 'Monuments & Statues', 'description' => 'Monuments, statues, memorials'],
                    ['id' => 'palaces', 'label' => 'Palaces', 'description' => 'Royal palaces and historic buildings'],
                    ['id' => 'markets', 'label' => 'Markets', 'description' => 'Markets and shopping areas'],
                    ['id' => 'water_attractions', 'label' => 'Water Attractions', 'description' => 'Water parks, waterfalls, beaches'],
                    ['id' => 'other_attractions', 'label' => 'Other Attractions', 'description' => 'Other tourist attractions'],
                ],
            ],
            'question_2_rating' => [
                'question' => 'What minimum rating do you prefer?',
                'type' => 'single_select',
                'required' => true,
                'options' => [
                    ['id' => 'any', 'label' => 'Any rating', 'value' => 0.0],
                    ['id' => '3.0', 'label' => '3.0+ (Average)', 'value' => 3.0],
                    ['id' => '3.5', 'label' => '3.5+ (Above average)', 'value' => 3.5],
                    ['id' => '4.0', 'label' => '4.0+ (Good)', 'value' => 4.0, 'default' => true],
                    ['id' => '4.5', 'label' => '4.5+ (Excellent)', 'value' => 4.5],
                ],
            ],
            'question_3_popularity' => [
                'question' => 'Do you prefer popular places or hidden gems?',
                'type' => 'single_select',
                'required' => true,
                'options' => [
                    ['id' => 'popular', 'label' => 'Popular places', 'description' => 'Highly reviewed places'],
                    ['id' => 'hidden_gems', 'label' => 'Hidden gems', 'description' => 'Less reviewed places'],
                    ['id' => 'balanced', 'label' => 'No preference', 'description' => 'Balanced approach', 'default' => true],
                ],
            ],
            'question_4_location' => [
                'question' => 'Which provinces are you interested in visiting?',
                'type' => 'multi_select',
                'required' => false,
                'options' => array_merge(
                    [['id' => 'anywhere', 'label' => 'Anywhere', 'default' => true]],
                    $provinces
                ),
            ],
        ];
    }
}

