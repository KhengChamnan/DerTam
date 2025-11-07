<?php

namespace App\Imports;

use App\Models\Place;
use App\Models\PlaceCategory;
use App\Models\ProvinceCategory;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;

class PlacesImport implements ToCollection, WithHeadingRow
{
    protected $errors = [];
    protected $successCount = 0;
    protected $skipCount = 0;

    public function collection(Collection $rows)
    {
        foreach ($rows as $index => $row) {
            try {
                $this->processRow($row, $index + 2); // +2 because of heading row and 0-based index
            } catch (\Exception $e) {
                $this->errors[] = [
                    'row' => $index + 2,
                    'message' => $e->getMessage(),
                    'data' => $row->toArray()
                ];
                $this->skipCount++;
                
                // Log the error for debugging
                Log::error('Place import error on row ' . ($index + 2), [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                    'data' => $row->toArray()
                ]);
            }
        }
    }

    protected function processRow(Collection $row, int $rowNumber)
    {
        // Validate the row data
        $validator = Validator::make($row->toArray(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category_name' => 'required|string|exists:place_categories,category_name',
            'province_name' => 'required|string|exists:province_categories,province_categoryName',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'entry_free' => 'nullable|boolean',
            'google_maps_link' => 'nullable|url',
            'best_season_to_visit' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            throw new \Exception('Validation failed: ' . implode(', ', $validator->errors()->all()));
        }

        // Find category and province
        $category = PlaceCategory::where('category_name', $row['category_name'])->first();
        $province = ProvinceCategory::where('province_categoryName', $row['province_name'])->first();

        if (!$category) {
            throw new \Exception('Category "' . $row['category_name'] . '" not found');
        }
        
        if (!$province) {
            throw new \Exception('Province "' . $row['province_name'] . '" not found');
        }

        // Check if place already exists
        $existingPlace = Place::where('name', $row['name'])
            ->where('category_id', $category->placeCategoryID)
            ->first();

        if ($existingPlace) {
            throw new \Exception('Place with this name already exists in the same category');
        }

        // Process operating hours if provided
        $operatingHours = null;
        if (!empty($row['operating_hours'])) {
            try {
                $operatingHours = json_decode($row['operating_hours'], true);
            } catch (\Exception $e) {
                $operatingHours = null;
            }
        }

        // Create the place
        Place::create([
            'name' => $row['name'],
            'description' => $row['description'] ?? '',
            'category_id' => $category->placeCategoryID,
            'province_id' => $province->province_categoryID,
            'latitude' => $row['latitude'] ?? null,
            'longitude' => $row['longitude'] ?? null,
            'entry_free' => filter_var($row['entry_free'] ?? true, FILTER_VALIDATE_BOOLEAN),
            'google_maps_link' => $row['google_maps_link'] ?? null,
            'operating_hours' => $operatingHours,
            'best_season_to_visit' => $row['best_season_to_visit'] ?? null,
            'ratings' => $row['ratings'] ?? 0,
            'reviews_count' => $row['reviews_count'] ?? 0,
            'images_url' => [], // Empty array for now, images can be added later
            'image_public_ids' => [],
        ]);

        $this->successCount++;
    }

    public function getErrors()
    {
        return $this->errors;
    }

    public function getSuccessCount()
    {
        return $this->successCount;
    }

    public function getSkipCount()
    {
        return $this->skipCount;
    }

    public function getStats()
    {
        return [
            'success' => $this->successCount,
            'errors' => count($this->errors),
            'duplicates' => $this->skipCount
        ];
    }
}