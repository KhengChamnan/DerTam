# Google OAuth Setup for Flutter Mobile App

This guide explains how to implement Google Sign-In for your Flutter mobile app using the simplified Laravel Sanctum backend.

## Backend Setup (Completed)

### 1. Laravel Packages Required
- ✅ `laravel/sanctum` - For API token authentication
- ✅ Laravel HTTP Client (built-in) - For Google API **calls**

**Note**: Laravel Socialite and Google API Client packages have been removed as they're not needed for this simplified mobile authentication approach.

### 2. Database Migration
- ✅ Added `google_id` and `avatar` fields to users table
- ✅ Updated User model to handle social authentication

### 3. Environment Variables Required

Add these to your `.env` file:

```env
# For Mobile App Authentication (Android)
GOOGLE_CLIENT_ID=1084018675439-qui12g8amtfvt3gbiirlbla51uller7j.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URL=
```

**Important**: For Android mobile apps, you only need the `GOOGLE_CLIENT_ID`. No client secret or redirect URL is required.

## Google Console Setup

### Step 1: Create Google Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Google+ API** and **Google Identity Toolkit**

### Step 2: Configure OAuth 2.0
1. Go to **APIs & Services > Credentials**
2. Click **Create Credentials > OAuth 2.0 Client IDs**
3. Application type: **Android** (for your Flutter app)
4. Package name: Your Flutter app package name (e.g., `com.example.your_app`)
5. SHA-1 certificate fingerprint: (Get from Flutter project)

**Note**: For mobile apps, you only need the Android OAuth client. No web application client is required.

### Step 3: Get SHA-1 Fingerprint for Development
```bash
# For debug/development
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android

# For release
keytool -list -v -keystore path/to/your/release.keystore -alias your_alias
```

## API Endpoints Available

### Public Endpoints
- `POST /api/auth/google` - Authenticate with Google access token (simplified approach)

### Protected Endpoints (require Bearer token)
- `POST /api/auth/logout` - Logout and revoke token

**Note**: The simplified backend only provides essential Google authentication. Complex ID token verification has been removed for simplicity.

## Flutter Mobile App Setup

### 1. Add Dependencies to `pubspec.yaml`

```yaml
dependencies:
  flutter:
    sdk: flutter
  google_sign_in: ^6.1.5
  http: ^1.1.0
  shared_preferences: ^2.2.2
```

### 2. Android Configuration

**android/app/build.gradle:**
```gradle
android {
    compileSdkVersion 34
    
    defaultConfig {
        applicationId "com.example.your_app"
        minSdkVersion 21
        targetSdkVersion 34
        // ... other config
    }
}
```

**android/app/src/main/AndroidManifest.xml:**
```**xml**
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-permission android:name="android.permission.INTERNET" />
    
    <application
        android:label="Your App"
        android:name="${applicationName}"
        android:icon="@mipmap/ic_launcher">
        
        <!-- ... other config ... -->
        
    </application>
</manifest>
```



### 3. Flutter Service Implementation Guidelines

#### Create Authentication Service (`lib/services/auth_service.dart`)

**Configure Base URL:**
- Use `http://10.0.2.2:8000/api` for Android emulator
- Use `http://localhost:8000/api` for iOS simulator
- Update to your production URL when deploying

**Set Up Google Sign-In Configuration:**
- Initialize GoogleSignIn with scopes: `['email', 'profile']`
- No client ID needed in Flutter code (handled by platform configuration)

**Implement Core Authentication Methods:**

1. **Sign In Method:**
   - Trigger Google Sign-In flow using GoogleSignIn package
   - Extract access token from Google authentication result
   - Send POST request to `/api/auth/google` endpoint with access token
   - Handle successful response by storing auth token and user data locally
   - Return user data on success, null on failure

2. **Sign Out Method:**
   - Call GoogleSignIn sign out
   - Clear stored authentication token from SharedPreferences
   - Clear stored user data from SharedPreferences

3. **Token Management Methods:**
   - Create method to retrieve stored auth token
   - Create method to retrieve stored user data
   - Create method to check if user is currently logged in

**Local Storage Strategy:**
- Use SharedPreferences to store authentication tokens
- Store user data as JSON string
- Keys to use: `'auth_token'` and `'user_data'`

**Error Handling:**
- Wrap all network calls in try-catch blocks
- Return null for failed authentication attempts
- Log errors to console for debugging
- Handle network connectivity issues gracefully

**API Communication:**
- Use standard HTTP headers: `'Content-Type': 'application/json'` and `'Accept': 'application/json'`
- Send access token in request body as JSON
- Parse response JSON to extract token and user information


## Testing the Implementation

### 1. Test API Endpoints

Using Postman or curl:

```bash
# Test Google access token authentication (simplified)
curl -X POST http://localhost:8000/api/auth/google \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"access_token": "your_google_access_token_here"}'
```

### 2. Expected Response

```json
{
  "token": "your_sanctum_token_here",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "google_id": "1234567890",
    "avatar": null,
    "created_at": "2025-10-03T12:00:00.000000Z",
    "updated_at": "2025-10-03T12:00:00.000000Z"
  }
}
```

### 3. Using the Token

All subsequent API calls should include the Bearer token:

```bash
curl -X GET http://localhost:8000/api/products \
  -H "Authorization: Bearer your_sanctum_token_here" \
  -H "Accept: application/json"
```

## Backend Implementation Overview

Your Laravel backend uses a simplified approach:

```php
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
```

This simplified approach:
- ✅ Uses minimal dependencies (only Laravel Sanctum)
- ✅ Makes direct HTTP calls to Google's API
- ✅ Perfect for mobile app authentication
- ✅ Easy to understand and maintain

## Security Considerations

1. **Always verify tokens server-side** - Don't trust client-side verification
2. **Use HTTPS in production** - Protect token transmission
3. **Implement token expiration** - Set reasonable token lifetimes
4. **Validate redirect URIs** - Ensure proper OAuth flow security
5. **Store tokens securely** - Use secure storage in mobile app

## Troubleshooting

### Common Issues:

1. **SHA-1 Fingerprint Mismatch**
   - Ensure development and production fingerprints are added to Google Console

2. **Package Name Mismatch**
   - Verify package name in Google Console matches your Flutter app

3. **Token Validation Fails**
   - Check if Google client ID is correctly configured in Laravel

4. **CORS Issues**
   - Ensure your Laravel CORS configuration allows mobile app requests

## Production Deployment

1. **Generate release keystore** for your Flutter app
2. **Get production SHA-1** fingerprint
3. **Update Google Console** with production credentials
4. **Configure production environment** variables
5. **Test thoroughly** with production build

This setup provides a secure, scalable authentication system that works seamlessly between your Laravel backend and Flutter mobile app!