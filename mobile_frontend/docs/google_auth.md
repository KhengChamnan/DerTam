# AuthService Documentation

## Overview
The `AuthService` class provides authentication functionality for the Flutter mobile application, specifically handling Google Sign-In integration with a Laravel backend API. It manages user authentication, token storage, and session management.

## Dependencies
```yaml
dependencies:
  google_sign_in: ^6.1.5
  http: ^1.1.0
  shared_preferences: ^2.2.2
```

## Configuration

### Base URL
The service is configured to work with different environments:
- **Android Emulator**: `https://elegant-many-oyster.ngrok-free.app/api`
- **iOS Simulator**: `http://localhost:8000/api` (commented out)

### Google Sign-In Setup
The Google Sign-In is configured with:
- Scopes: `['email', 'profile']`
- Client ID: Needs to be uncommented and configured with your Google OAuth Client ID

## Class Structure

### Static Properties
- `baseUrl`: The API endpoint for authentication requests
- `_googleSignIn`: Google Sign-In instance with configured scopes

## Methods

### 1. `signInWithGoogle()`
**Purpose**: Handles Google authentication and communicates with the Laravel backend.

**Return Type**: `Future<Map<String, dynamic>?>`

**Process**:
1. Initiates Google Sign-In flow
2. Retrieves Google authentication credentials
3. Sends access token to Laravel backend (`/api/auth/google`)
4. Stores authentication token and user data locally
5. Returns user data and token on success

**Usage**:
```dart
final result = await AuthService.signInWithGoogle();
if (result != null) {
  print('Login successful: ${result['user']['name']}');
} else {
  print('Login failed');
}
```

**Error Handling**: Returns `null` on failure and prints error messages to console.

### 2. `signOut()`
**Purpose**: Signs out the user and clears stored authentication data.

**Return Type**: `Future<void>`

**Process**:
1. Signs out from Google Sign-In
2. Removes stored authentication token
3. Removes stored user data from SharedPreferences

**Usage**:
```dart
await AuthService.signOut();
```

### 3. `getToken()`
**Purpose**: Retrieves the stored authentication token.

**Return Type**: `Future<String?>`

**Usage**:
```dart
final token = await AuthService.getToken();
if (token != null) {
  // Use token for authenticated requests
}
```

### 4. `getUserData()`
**Purpose**: Retrieves stored user information.

**Return Type**: `Future<Map<String, dynamic>?>`

**Usage**:
```dart
final userData = await AuthService.getUserData();
if (userData != null) {
  print('User: ${userData['name']}');
  print('Email: ${userData['email']}');
}
```

### 5. `isLoggedIn()`
**Purpose**: Checks if the user is currently authenticated.

**Return Type**: `Future<bool>`

**Usage**:
```dart
final isAuthenticated = await AuthService.isLoggedIn();
if (isAuthenticated) {
  // Navigate to home screen
} else {
  // Show login screen
}
```

## Data Storage
The service uses `SharedPreferences` to store:
- **auth_token**: JWT or session token from the backend
- **user_data**: JSON-encoded user information

## API Integration

### Backend Endpoint
- **URL**: `POST /api/auth/google`
- **Headers**: 
  - `Content-Type: application/json`
  - `Accept: application/json`
- **Body**: 
  ```json
  {
    "access_token": "google_access_token_here"
  }
  ```

### Expected Response
```json
{
  "token": "your_auth_token",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": "https://..."
  }
}
```

## Setup Instructions

### 1. Google OAuth Configuration
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add the Client ID to the `GoogleSignIn` configuration:
   ```dart
   static final GoogleSignIn _googleSignIn = GoogleSignIn(
     scopes: ['email', 'profile'],
     clientId: 'your-client-id-here.apps.googleusercontent.com',
   );
   ```

### 2. Android Configuration
Add to `android/app/build.gradle`:
```gradle
android {
    defaultConfig {
        // Add your OAuth client ID
    }
}
```

### 3. iOS Configuration
Add to `ios/Runner/Info.plist`:
```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLName</key>
        <string>REVERSED_CLIENT_ID</string>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>your-reversed-client-id</string>
        </array>
    </dict>
</array>
```

## Usage Examples

### Complete Authentication Flow
```dart
class LoginScreen extends StatelessWidget {
  Future<void> _handleGoogleSignIn() async {
    try {
      final result = await AuthService.signInWithGoogle();
      
      if (result != null) {
        // Login successful
        Navigator.pushReplacementNamed(context, '/home');
      } else {
        // Show error message
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Login failed. Please try again.')),
        );
      }
    } catch (e) {
      print('Login error: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: ElevatedButton(
          onPressed: _handleGoogleSignIn,
          child: Text('Sign in with Google'),
        ),
      ),
    );
  }
}
```

### Check Authentication Status
```dart
class SplashScreen extends StatefulWidget {
  @override
  _SplashScreenState createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _checkAuthStatus();
  }

  Future<void> _checkAuthStatus() async {
    final isLoggedIn = await AuthService.isLoggedIn();
    
    if (isLoggedIn) {
      Navigator.pushReplacementNamed(context, '/home');
    } else {
      Navigator.pushReplacementNamed(context, '/login');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(child: CircularProgressIndicator()),
    );
  }
}
```

### Making Authenticated API Calls
```dart
class ApiService {
  static Future<http.Response> makeAuthenticatedRequest(String endpoint) async {
    final token = await AuthService.getToken();
    
    return http.get(
      Uri.parse('${AuthService.baseUrl}$endpoint'),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    );
  }
}
```

## Error Handling
The service implements basic error handling:
- Network errors are caught and logged
- Failed authentication returns `null`
- Sign-out errors are logged but don't throw exceptions

## Security Considerations
1. **Token Storage**: Tokens are stored in SharedPreferences (consider encrypted storage for production)
2. **HTTPS**: Always use HTTPS in production
3. **Token Validation**: Implement token expiration and refresh mechanisms
4. **Client ID**: Keep Google OAuth Client ID secure

## Testing
To test the authentication service:
1. Ensure backend is running and accessible
2. Configure Google OAuth credentials
3. Test on physical device (Google Sign-In may not work on some emulators)
4. Verify token storage and retrieval

## Troubleshooting

### Common Issues
1. **Google Sign-In not working**: Check OAuth configuration and Client ID
2. **Network errors**: Verify backend URL and ngrok tunnel
3. **Token not persisting**: Check SharedPreferences permissions
4. **iOS build issues**: Verify Info.plist configuration

### Debug Tips
- Enable debug logging in Google Sign-In
- Check network requests in Flutter Inspector
- Verify backend logs for authentication requests
- Test on different devices/platforms

## Future Enhancements
1. Add token refresh mechanism
2. Implement biometric authentication
3. Add encrypted token storage
4. Support for other OAuth providers
5. Add comprehensive error handling with user-friendly messages