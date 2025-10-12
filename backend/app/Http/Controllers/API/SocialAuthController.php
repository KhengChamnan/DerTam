<?php

namespace App\Http\Controllers\API;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Http;

class SocialAuthController
{
    /**
     * Simple Google login - create or get user from database
     */
    public function googleAuth(Request $request): JsonResponse
    {
        // Get user info from Google
        $response = Http::get('https://www.googleapis.com/oauth2/v2/userinfo', [
            'access_token' => $request->access_token
        ]);

        $googleUser = $response->json();

        // Check if user exists by email
        $user = User::where('email', $googleUser['email'])->first();

        if (!$user) {
            // Create new user
            $user = User::create([
                'name' => $googleUser['name'],
                'email' => $googleUser['email'],
                'google_id' => $googleUser['id'],
                'password' => bcrypt('password'),
            ]);
        }

        // Create token
        $token = $user->createToken('auth')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $user
        ]);
    }

    /**
     * Logout user
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    }
}
