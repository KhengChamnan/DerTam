<?php

namespace App\Http\Controllers\API\Profile;

use App\Http\Controllers\API\BaseController;
use App\Http\Controllers\MediaController;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\JsonResponse;

class ProfileController extends BaseController
{
    /**
     * Get authenticated user's profile.
     * 
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        try {
            $user = Auth::user();
            
            return $this->sendResponse($user, 'Profile retrieved successfully.');
        } catch (\Exception $e) {
            return $this->sendError('Error retrieving profile', ['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Get authenticated user's profile by token.
     * 
     * @return JsonResponse
     */
    public function show(): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return $this->sendError('User not found', [], 404);
            }

            // Remove sensitive data
            $user->makeHidden(['password', 'remember_token', 'two_factor_recovery_codes', 'two_factor_secret']);
            
            return $this->sendResponse($user, 'User profile retrieved successfully.');
        } catch (\Exception $e) {
            return $this->sendError('Error retrieving user profile', ['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Update authenticated user's profile.
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function update(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            
            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|string|max:255',
                'username' => 'sometimes|string|max:255|unique:users,username,' . $user->id,
                'email' => 'sometimes|email|unique:users,email,' . $user->id,
                'phone_number' => 'sometimes|string|max:20',
                'age' => 'sometimes|integer|min:1|max:150',
                'gender' => 'sometimes|in:male,female,other',
                'profile_image' => 'sometimes|image|mimes:jpeg,png,jpg,gif|max:2048',
                'password' => 'sometimes|string|min:8|confirmed',
                'current_password' => 'required_with:password',
            ]);

            if ($validator->fails()) {
                return $this->sendError('Validation Error', $validator->errors(), 422);
            }

            // Verify current password if changing password
            if ($request->has('password')) {
                if (!Hash::check($request->current_password, $user->password)) {
                    return $this->sendError('Current password is incorrect', [], 422);
                }
            }

            // Update user fields
            $updateData = $request->only([
                'name', 
                'username', 
                'email', 
                'phone_number', 
                'age', 
                'gender'
            ]);

            // Handle profile image upload if present
            if ($request->hasFile('profile_image')) {
                // Delete old image from Cloudinary if exists
                if ($user->profile_image_public_id) {
                    try {
                        $mediaController = new MediaController();
                        $mediaController->deleteFile($user->profile_image_public_id);
                    } catch (\Exception $e) {
                        \Log::warning('Failed to delete old profile image: ' . $e->getMessage());
                    }
                }

                // Upload new image
                $mediaController = new MediaController();
                $uploadResult = $mediaController->uploadFile(
                    $request->file('profile_image'),
                    'profiles'
                );
                $updateData['profile_image_url'] = $uploadResult['url'];
                $updateData['profile_image_public_id'] = $uploadResult['public_id'];
            }

            if ($request->has('password')) {
                $updateData['password'] = $request->password;
            }

            $user->update($updateData);
            
            return $this->sendResponse($user->fresh(), 'Profile updated successfully.');
        } catch (\Exception $e) {
            return $this->sendError('Error updating profile', ['error' => $e->getMessage()], 500);
        }
    }

 

    /**
     * Delete authenticated user's account.
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function destroy(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            
            $validator = Validator::make($request->all(), [
                'password' => 'required|string',
            ]);

            if ($validator->fails()) {
                return $this->sendError('Validation Error', $validator->errors(), 422);
            }

            // Verify password before deletion
            if (!Hash::check($request->password, $user->password)) {
                return $this->sendError('Password is incorrect', [], 422);
            }

            // Delete profile image from Cloudinary if exists
            if ($user->profile_image_url && $user->profile_image_public_id) {
                try {
                    $mediaController = new MediaController();
                    $mediaController->deleteFile($user->profile_image_public_id);
                } catch (\Exception $e) {
                    \Log::warning('Failed to delete profile image during account deletion: ' . $e->getMessage());
                }
            }

            // Revoke all tokens
            $user->tokens()->delete();
            
            // Delete user account
            $user->delete();
            
            return $this->sendResponse([], 'Account deleted successfully.');
        } catch (\Exception $e) {
            return $this->sendError('Error deleting account', ['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Change user password.
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function changePassword(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            
            $validator = Validator::make($request->all(), [
                'current_password' => 'required|string',
                'new_password' => 'required|string|min:8|confirmed',
            ]);

            if ($validator->fails()) {
                return $this->sendError('Validation Error', $validator->errors(), 422);
            }

            // Verify current password
            if (!Hash::check($request->current_password, $user->password)) {
                return $this->sendError('Current password is incorrect', [], 422);
            }

            // Update password
            $user->update([
                'password' => $request->new_password
            ]);
            
            return $this->sendResponse([], 'Password changed successfully.');
        } catch (\Exception $e) {
            return $this->sendError('Error changing password', ['error' => $e->getMessage()], 500);
        }
    }
}
