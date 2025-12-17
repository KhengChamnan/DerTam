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
    protected $mediaController;

    public function __construct()
    {
        $this->mediaController = new \App\Http\Controllers\MediaController();
    }

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
                Log::warning("Row {$rowNumber}: Invalid JSON for operating_hours", [
                    'error' => $e->getMessage()
                ]);
                $operatingHours = null;
            }
        }

        // Process image URLs - support multiple formats
        $imageUrls = [];
        $imagePublicIds = [];
        $urlList = [];
        
        // Method 1: Check for 'image_urls' column (single column with JSON array, pipe-separated, or comma-separated)
        if (!empty($row['image_urls'])) {
            $imageUrlsValue = trim($row['image_urls']);
            
            // Decode HTML entities (convert &amp; to &, etc.)
            $imageUrlsValue = html_entity_decode($imageUrlsValue, ENT_QUOTES | ENT_HTML5, 'UTF-8');
            
            // Try to parse as JSON array first
            if (str_starts_with($imageUrlsValue, '[') && str_ends_with($imageUrlsValue, ']')) {
                try {
                    $decoded = json_decode($imageUrlsValue, true);
                    if (is_array($decoded)) {
                        $urlList = $decoded;
                    }
                } catch (\Exception $e) {
                    Log::warning("Row {$rowNumber}: Failed to parse image_urls as JSON", [
                        'error' => $e->getMessage()
                    ]);
                }
            }
            
            // If not JSON, try pipe or comma separator
            if (empty($urlList)) {
                $separator = strpos($imageUrlsValue, '|') !== false ? '|' : ',';
                $urlList = array_map('trim', explode($separator, $imageUrlsValue));
            }
        }
        
        // Method 2: Check for individual columns (image_url_1, image_url_2, etc.) - fallback
        if (empty($urlList)) {
            for ($i = 1; $i <= 10; $i++) {
                $imageUrlKey = 'image_url_' . $i;
                if (!empty($row[$imageUrlKey])) {
                    $urlList[] = trim($row[$imageUrlKey]);
                }
            }
        }
        
        // Log how many URLs were found
        if (!empty($urlList)) {
            Log::info("Row {$rowNumber}: Found " . count($urlList) . " image URLs for place: " . $row['name']);
        }
        
        // Process all collected URLs
        foreach ($urlList as $index => $imageUrl) {
            // Decode HTML entities in each URL (handles &amp; -> &)
            $imageUrl = html_entity_decode(trim($imageUrl), ENT_QUOTES | ENT_HTML5, 'UTF-8');
            
            if (empty($imageUrl)) {
                Log::warning("Row {$rowNumber}: Image URL [" . ($index + 1) . "] is empty after processing");
                continue;
            }
            
            if (!filter_var($imageUrl, FILTER_VALIDATE_URL)) {
                Log::warning("Row {$rowNumber}: Image URL [" . ($index + 1) . "] failed validation", [
                    'url' => substr($imageUrl, 0, 200)
                ]);
                continue;
            }
            
            try {
                Log::info("Row {$rowNumber}: Attempting to download image [" . ($index + 1) . "]", [
                    'url_preview' => substr($imageUrl, 0, 100) . '...'
                ]);
                
                $result = $this->downloadAndUploadImage($imageUrl, $row['name']);
                
                if ($result) {
                    $imageUrls[] = $result['url'];
                    $imagePublicIds[] = $result['public_id'];
                    Log::info("Row {$rowNumber}: Successfully uploaded image [" . ($index + 1) . "] to Cloudinary");
                }
            } catch (\Exception $e) {
                Log::error("Row {$rowNumber}: Failed to download/upload image [" . ($index + 1) . "]", [
                    'place_name' => $row['name'],
                    'image_url' => substr($imageUrl, 0, 200) . '...', // Show more of URL for debugging
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
                // Continue with other images even if one fails
            }
        }

        // Create the place with arrays for images
        Place::create([
            'name' => $row['name'],
            'description' => $row['description'] ?? '',
            'category_id' => $category->placeCategoryID,
            'province_id' => $province->province_categoryID,
            'latitude' => $row['latitude'] ?? null,
            'longitude' => $row['longitude'] ?? null,
            'entry_free' => isset($row['entry_free']) ? filter_var($row['entry_free'], FILTER_VALIDATE_BOOLEAN) : null,
            'google_maps_link' => $row['google_maps_link'] ?? null,
            'operating_hours' => $operatingHours,
            'best_season_to_visit' => $row['best_season_to_visit'] ?? null,
            'ratings' => $row['ratings'] ?? 0,
            'reviews_count' => $row['reviews_count'] ?? 0,
            'images_url' => $imageUrls, // Stored as array (cast to JSON by model)
            'image_public_ids' => $imagePublicIds, // Stored as array (cast to JSON by model)
        ]);

        $this->successCount++;
    }

    /**
     * Download image from URL and upload to Cloudinary
     * 
     * @param string $imageUrl
     * @param string $placeName
     * @return array|null ['url' => string, 'public_id' => string]
     */
    protected function downloadAndUploadImage($imageUrl, $placeName)
    {
        try {
            // Validate URL
            if (!filter_var($imageUrl, FILTER_VALIDATE_URL)) {
                throw new \Exception('Invalid image URL: ' . $imageUrl);
            }

            // Download image to temporary file with proper context options
            $tempFile = tempnam(sys_get_temp_dir(), 'place_import_');
            
            // Create stream context with options for better compatibility
            $contextOptions = [
                'http' => [
                    'method' => 'GET',
                    'header' => "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36\r\n",
                    'follow_location' => true,
                    'max_redirects' => 5,
                    'timeout' => 30,
                    'ignore_errors' => false
                ],
                'ssl' => [
                    'verify_peer' => false,
                    'verify_peer_name' => false,
                ]
            ];
            $context = stream_context_create($contextOptions);
            
            $imageContent = @file_get_contents($imageUrl, false, $context);
            
            if ($imageContent === false) {
                $error = error_get_last();
                throw new \Exception('Failed to download image: ' . ($error['message'] ?? 'Unknown error'));
            }
            
            if (empty($imageContent)) {
                throw new \Exception('Downloaded image is empty (0 bytes)');
            }
            
            file_put_contents($tempFile, $imageContent);

            // Get file extension from URL or content type
            $extension = pathinfo(parse_url($imageUrl, PHP_URL_PATH), PATHINFO_EXTENSION);
            if (empty($extension)) {
                $finfo = finfo_open(FILEINFO_MIME_TYPE);
                $mimeType = finfo_file($finfo, $tempFile);
                finfo_close($finfo);
                
                $mimeToExt = [
                    'image/jpeg' => 'jpg',
                    'image/png' => 'png',
                    'image/gif' => 'gif',
                    'image/webp' => 'webp',
                ];
                $extension = $mimeToExt[$mimeType] ?? 'jpg';
            }

            // Rename temp file with proper extension
            $tempFileWithExt = $tempFile . '.' . $extension;
            rename($tempFile, $tempFileWithExt);

            // Create UploadedFile object
            $uploadedFile = new \Illuminate\Http\UploadedFile(
                $tempFileWithExt,
                basename($imageUrl),
                mime_content_type($tempFileWithExt),
                null,
                true
            );

            // Upload to Cloudinary
            $result = $this->mediaController->uploadFile($uploadedFile, 'places');

            // Clean up temp file
            @unlink($tempFileWithExt);

            return $result;
        } catch (\Exception $e) {
            // Clean up temp file on error
            if (isset($tempFile) && file_exists($tempFile)) {
                @unlink($tempFile);
            }
            if (isset($tempFileWithExt) && file_exists($tempFileWithExt)) {
                @unlink($tempFileWithExt);
            }
            
            throw $e;
        }
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