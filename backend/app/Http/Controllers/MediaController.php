<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request;

class MediaController extends Controller
{

    /**
     * Upload a single file to Cloudinary
     * 
     * @param \Illuminate\Http\UploadedFile $file
     * @param string $folder
     * @return array ['url' => string, 'public_id' => string]
     */
    public function uploadFile($file, $folder = 'uploads')
    {
        $uploadedImage = cloudinary()->uploadApi()->upload(
            $file->getRealPath(),
            ['folder' => $folder]
        );

        return [
            'url' => $uploadedImage['secure_url'],
            'public_id' => $uploadedImage['public_id'],
        ];
    }

    /**
     * Upload multiple files to Cloudinary
     * 
     * @param array $files
     * @param string $folder
     * @return array ['urls' => array, 'public_ids' => array]
     */
    public function uploadMultipleFiles(array $files, $folder = 'uploads')
    {
        $urls = [];
        $publicIds = [];

        // Ensure $files is a proper array and not empty
        if (empty($files)) {
            throw new \InvalidArgumentException('No files provided for upload');
        }

        foreach ($files as $file) {
            // Skip null or invalid files
            if ($file === null || !is_object($file)) {
                continue;
            }
            
            $result = $this->uploadFile($file, $folder);
            $urls[] = $result['url'];
            $publicIds[] = $result['public_id'];
        }

        // Ensure at least one file was uploaded
        if (empty($urls)) {
            throw new \InvalidArgumentException('No valid files were uploaded');
        }

        return [
            'urls' => $urls,
            'public_ids' => $publicIds,
        ];
    }

    /**
     * Delete a file from Cloudinary
     * 
     * @param string $publicId
     * @return mixed
     */
    public function deleteFile($publicId)
    {
        return cloudinary()->uploadApi()->destroy($publicId);
    }

    /**
     * Delete multiple files from Cloudinary
     * 
     * @param array $publicIds
     * @return array
     */
    public function deleteMultipleFiles(array $publicIds)
    {
        $results = [];
        
        foreach ($publicIds as $publicId) {
            try {
                $results[] = $this->deleteFile($publicId);
            } catch (\Exception $e) {
                $results[] = [
                    'public_id' => $publicId,
                    'error' => $e->getMessage()
                ];
            }
        }
        
        return $results;
    }
}