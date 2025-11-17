import 'dart:convert';
import 'dart:async';
import 'package:flutter/material.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:logging/logging.dart';
import 'package:mobile_frontend/data/network/fetching_data.dart';
import 'package:mobile_frontend/data/repository/abstract/auth_repository.dart';
import 'package:mobile_frontend/data/dto/auth_dto.dart';
import 'package:mobile_frontend/data/network/api_constant.dart';
import 'package:mobile_frontend/models/user/user_model.dart';

///
/// Laravel Auth API Repository
/// Handles authentication API calls to Laravel backend
///
class LaravelAuthApiRepository extends AuthRepository {
  // Secure storage for tokens
  final _storage = const FlutterSecureStorage();
  final _baseHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  Map<String, String> _getAuthHeaders(String token) => {
    ..._baseHeaders,
    'Authorization': 'Bearer $token',
  };
  // Token key for secure storage
  static const String _tokenKey = 'auth_token';

  // Logger instance
  static final _logger = Logger('LaravelAuthApiRepository');

  // Cached token
  String? _cachedToken;

  // Google Sign-In scopes
  final GoogleSignIn _googleSignIn = GoogleSignIn(
    scopes: ['email', 'profile'],
    // Add your Google OAuth Client ID here (from Google Cloud Console)
    // clientId: 'your-client-id-here.apps.googleusercontent.com', // Uncomment and add your client ID
  );

  // Debug helper method
  void _debugLog(String message) {
    debugPrint('🔐 LaravelAuthRepository: $message');
  }

  // Debug method to check token state
  Future<Map<String, dynamic>> debugTokenState() async {
    _debugLog('Checking token state');
    final result = <String, dynamic>{};
    result['cachedToken'] = _cachedToken != null && _cachedToken!.isNotEmpty;
    result['cachedTokenValue'] = _cachedToken != null
        ? (_cachedToken!.length > 10
              ? '${_cachedToken!.substring(0, 10)}...'
              : _cachedToken)
        : null;
    try {
      final storedToken = await _storage.read(key: _tokenKey);
      result['storedToken'] = storedToken != null && storedToken.isNotEmpty;
      result['storedTokenValue'] = storedToken != null
          ? (storedToken.length > 10
                ? '${storedToken.substring(0, 10)}...'
                : storedToken)
          : null;
      _debugLog('Token state check complete:');
      _debugLog('- Cached token exists: ${result['cachedToken']}');
      _debugLog('- Stored token exists: ${result['storedToken']}');
      return result;
    } catch (e) {
      _debugLog('❌ Error checking token state: $e');
      result['error'] = e.toString();
      return result;
    }
  }

  /// Get stored authentication token
  @override
  Future<String?> getToken() async {
    _debugLog('Getting current token');

    if (_cachedToken != null && _cachedToken!.isNotEmpty) {
      _debugLog('Returning cached token (length: ${_cachedToken!.length})');
      return _cachedToken;
    }
    _debugLog('No cached token, checking secure storage');
    _cachedToken = await _storage.read(key: _tokenKey);
    if (_cachedToken == null || _cachedToken!.isEmpty) {
      _debugLog('❌ No token found in secure storage');
    } else {
      _debugLog(
        '✅ Token retrieved from secure storage (length: ${_cachedToken!.length})',
      );
    }
    return _cachedToken;
  }

  @override
  Future<void> saveToken(String token) async {
    try {
      _debugLog('Saving token (length: ${token.length})');
      await _storage.write(key: _tokenKey, value: token);
      _cachedToken = token;
      _debugLog('✅ Token saved successfully');
    } catch (e) {
      _debugLog('❌ Error saving token: $e');
      _logger.warning('Error saving token: $e');
    }
  }

  Future<void> deleteToken() async {
    try {
      _debugLog('Deleting token');
      await _storage.delete(key: _tokenKey);
      _cachedToken = null;
      _debugLog('✅ Token deleted successfully');
    } catch (e) {
      _debugLog('❌ Error deleting token: $e');
      _logger.warning('Error deleting token: $e');
    }
  }

  /// Get headers for API requests
  Future<Map<String, String>> _getHeaders({bool includeToken = false}) async {
    final headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (includeToken) {
      final token = await getToken();
      if (token != null) {
        final cleanToken = token.replaceAll('"', '');
        _debugLog("Creating auth headers - token length: ${cleanToken.length}");
        headers['Authorization'] = 'Bearer $cleanToken';
      }
    }

    return headers;
  }

  /// Handle HTTP response and extract error message
  Exception _handleErrorResponse(dynamic response, String operation) {
    String errorMessage = '$operation failed';

    try {
      final error = json.decode(response.body);

      if (error['errors'] != null) {
        final errors = error['errors'];
        final errorMessages = <String>[];

        if (errors is Map<String, dynamic>) {
          errors.forEach((_, value) {
            if (value is List) {
              errorMessages.addAll(value.cast<String>());
            } else {
              errorMessages.add(value.toString());
            }
          });
        } else if (errors is List) {
          errorMessages.addAll(errors.map((e) => e.toString()));
        } else {
          errorMessages.add(errors.toString());
        }
        errorMessage = errorMessages.join(', ');
      } else if (error['message'] != null) {
        errorMessage = error['message'].toString();
      } else if (error['error'] != null) {
        errorMessage = error['error'].toString();
      } else {
        errorMessage = '$operation failed with status ${response.statusCode}';
      }

      _logger.warning('$operation error: $errorMessage');
    } catch (e) {
      errorMessage =
          '$operation failed with status ${response.statusCode}: ${response.body}';
      _logger.severe('Error parsing error response: $e');
    }

    return Exception(errorMessage);
  }

  @override
  Future<User> login(String email, String password) async {
    try {
      _debugLog('Attempting login with email: $email');
      // 1 - Prepare request body
      final body = AuthDto.loginToJson(email, password);
      // 2 - Send POST request
      final response = await FetchingData.postHeader(
        ApiEndpoint.login,
        await _getHeaders(),
        body,
      );

      _debugLog('Login response status code: ${response.statusCode}');

      if (response.statusCode == 200) {
        final responseBody = json.decode(response.body);
        final data = responseBody['data'];
        final accessToken =
            responseBody['token'] ??
            (data is Map ? data['token'] ?? data['access_token'] ?? '' : '');

        if (accessToken == null || accessToken.isEmpty) {
          _debugLog('❌ Access token not found in response');
          _logger.severe('Access token not found in response: $responseBody');
          throw Exception('Access token not found in response');
        }

        _debugLog(
          '✅ Login successful, saving token (length: ${accessToken.length})',
        );
        await saveToken(accessToken);
        _cachedToken = accessToken;

        _logger.info('Login successful, token saved');
        return User.fromJson(data ?? responseBody['user']);
      }

      throw _handleErrorResponse(response, 'Login');
    } catch (e) {
      _debugLog('❌ Login error: $e');
      _logger.severe('Login error: $e');
      rethrow;
    }
  }

  @override
  Future<User> register(
    String name,
    String email,
    String password,
    String confirmPassword,
  ) async {
    try {
      _debugLog('Attempting registration for email: $email');

      // 1 - Prepare request body
      final body = AuthDto.registerToJson(name, email, password);
      body['password_confirmation'] = confirmPassword;
      // 2 - Send POST request
      final response = await FetchingData.postHeader(
        ApiEndpoint.register,
        await _getHeaders(),
        body,
      );

      _logger.info('Registration response status code: ${response.statusCode}');
      _logger.info('Registration response body: ${response.body}');

      if (response.statusCode == 200 || response.statusCode == 201) {
        final responseBody = json.decode(response.body);
        final data = responseBody['data'];
        final accessToken =
            responseBody['token'] ??
            (data is Map ? data['token'] ?? data['access_token'] ?? '' : '');

        if (accessToken != null && accessToken.isNotEmpty) {
          _debugLog(
            '✅ Registration successful, saving token (length: ${accessToken.length})',
          );
          await saveToken(accessToken);
          _cachedToken = accessToken;
        }

        return User.fromJson(data ?? responseBody['user']);
      }

      throw _handleErrorResponse(response, 'Registration');
    } catch (e) {
      _debugLog('❌ Registration error: $e');
      _logger.severe('Registration error: $e');
      rethrow;
    }
  }

  @override
  Future<User> sendPasswordResetEmail(String email) async {
    try {
      _debugLog('Sending password reset email to: $email');
      // 1 - Prepare request body
      final body = AuthDto.resetPasswordToJson(email);
      // 2 - Send POST request
      final response = await FetchingData.postHeader(
        ApiEndpoint.forgotPassword,
        await _getHeaders(),
        body,
      );
      _logger.info(
        'Password reset email response status code: ${response.statusCode}',
      );
      _logger.info('Password reset email response body: ${response.body}');
      if (response.statusCode == 200) {
        final responseBody = json.decode(response.body);
        final data = responseBody['data'];
        _debugLog('✅ Password reset email sent successfully');
        // Return user data if available, otherwise return empty user
        if (data != null && data is Map) {
          return User.fromJson(Map<String, dynamic>.from(data));
        }
        // Return a minimal user object since this is just a password reset request
        return User(id: 0, name: '', email: email);
      }
      throw _handleErrorResponse(response, 'Password reset email');
    } catch (e) {
      _debugLog('❌ Password reset email error: $e');
      _logger.severe('Password reset email error: $e');
      rethrow;
    }
  }

  @override
  Future<User> verifyPin(String email, String pin) async {
    try {
      _debugLog('Verifying PIN for email: $email');
      // 1 - Prepare request body
      final body = AuthDto.verifyPinToJson(email, pin);
      // 2 - Send POST request
      final response = await FetchingData.postHeader(
        ApiEndpoint.verifyPin,
        await _getHeaders(),
        body,
      );
      _logger.info(
        'PIN verification response status code: ${response.statusCode}',
      );
      _logger.info('PIN verification response body: ${response.body}');
      if (response.statusCode == 200) {
        final responseBody = json.decode(response.body);
        final data = responseBody['data'];
        _debugLog('✅ PIN verified successfully');
        // Return user data if available
        if (data != null && data is Map) {
          return User.fromJson(Map<String, dynamic>.from(data));
        }

        // Return a minimal user object
        return User(id: 0, name: '', email: email);
      }

      throw _handleErrorResponse(response, 'PIN verification');
    } catch (e) {
      _debugLog('❌ PIN verification error: $e');
      _logger.severe('PIN verification error: $e');
      rethrow;
    }
  }

  @override
  Future<User> resetPassword(String email, String newPassword) async {
    try {
      _debugLog('Resetting password for email: $email');
      // 1 - Prepare request body
      final body = {'email': email, 'newPassword': newPassword};

      // 2 - Send POST request
      final response = await FetchingData.postHeader(
        ApiEndpoint.resetPassword,
        await _getHeaders(),
        body,
      );

      _logger.info(
        'Password reset response status code: ${response.statusCode}',
      );
      _logger.info('Password reset response body: ${response.body}');

      if (response.statusCode == 200) {
        final responseBody = json.decode(response.body);
        final data = responseBody['data'];

        _debugLog('✅ Password reset successfully');

        // Return user data if available
        if (data != null && data is Map) {
          return User.fromJson(Map<String, dynamic>.from(data));
        }

        // Return a minimal user object
        return User(id: 0, name: '', email: email);
      }

      throw _handleErrorResponse(response, 'Password reset');
    } catch (e) {
      _debugLog('❌ Password reset error: $e');
      _logger.severe('Password reset error: $e');
      rethrow;
    }
  }

  /// Logout user and clear stored token
  Future<void> logout() async {
    try {
      _debugLog('Attempting logout');

      // 1 - Send POST request with token
      final response = await FetchingData.postWithHeaderOnly(
        ApiEndpoint.logout,
        await _getHeaders(includeToken: true),
      );
      _logger.info('Logout response status code: ${response.statusCode}');
      // 2 - Delete token from storage regardless of response
      await deleteToken();
      // 3 - Sign out from Google to clear cached account
      await _googleSignIn.signOut();
      _debugLog('✅ Logout successful');
    } catch (e) {
      _debugLog('❌ Logout error: $e');
      // Delete token even if request fails
      await deleteToken();
      // Also try to sign out from Google even if request fails
      try {
        await _googleSignIn.signOut();
      } catch (googleError) {
        _logger.warning('Google sign out error: $googleError');
      }

      _logger.severe('Logout error: $e');
      rethrow;
    }
  }

  @override
  Future<User> googleSignIn() async {
    try {
      _debugLog('Attempting Google sign in');

      final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();
      if (googleUser == null) {
        _debugLog('❌ Google sign in cancelled by user');
        throw Exception('Google sign in cancelled');
      }
      final GoogleSignInAuthentication googleAuth =
          await googleUser.authentication;
      if (googleAuth.accessToken == null) {
        _debugLog('❌ Failed to get Google authentication');
        throw Exception('Failed to get Google authentication');
      }
      _logger.info(
        'Attempting Google sign in with token type: ${googleAuth.accessToken!.startsWith('ya29') ? 'access_token' : 'id_token'}',
      );
      _logger.info('Token length: ${googleAuth.accessToken!.length}');

      // Send access token to Laravel backend
      final response = await FetchingData.postHeader(
        ApiEndpoint.googleSignIn,
        await _getHeaders(),
        {'social_type': 'google', 'token': googleAuth.accessToken},
      );

      _logger.info('Google sign in response: ${response.statusCode}');
      _logger.info('Response body: ${response.body}');

      if (response.statusCode == 200) {
        final responseBody = json.decode(response.body);
        _logger.info('Parsed response: $responseBody');

        final data = responseBody['data'];
        final accessToken =
            responseBody['token'] ??
            (data is Map ? data['token'] ?? data['access_token'] ?? '' : '');

        if (accessToken == null || accessToken.isEmpty) {
          _logger.severe('No backend token in response: $responseBody');
          throw Exception(
            'Authentication failed: No token received from server',
          );
        }

        _debugLog(
          '✅ Google sign in successful, saving token (length: ${accessToken.length})',
        );
        await saveToken(accessToken);
        _cachedToken = accessToken;

        _logger.info('Google sign in successful');
        return User.fromJson(data ?? responseBody['user']);
      }

      // Handle specific error cases
      if (response.statusCode == 400) {
        final responseBody = json.decode(response.body);
        String errorMessage =
            responseBody['message'] ?? 'Invalid Google token format';
        throw Exception('Bad request: $errorMessage');
      } else if (response.statusCode == 401) {
        throw Exception('Invalid Google token. Please try signing in again.');
      } else if (response.statusCode == 403) {
        throw Exception(
          'Access denied. Please check your Google account permissions.',
        );
      } else if (response.statusCode == 422) {
        final responseBody = json.decode(response.body);
        String errorMessage =
            responseBody['message'] ?? 'Token validation failed';
        throw Exception('Token validation error: $errorMessage');
      }

      throw _handleErrorResponse(response, 'Google sign in');
    } catch (e) {
      _debugLog('❌ Google sign in error: $e');
      _logger.severe('Google sign in error: $e');

      if (e.toString().contains('Send Wrong Token')) {
        throw Exception(
          'Invalid token format. Please try signing out of Google and signing in again.',
        );
      }

      rethrow;
    }
  }

  @override
  Future<void> logOut() async {
    try {
      _logger.info('Attempting logout');
      _cachedToken = null;
      deleteToken();
    } catch (e) {
      _logger.severe('Logout error: $e');
      rethrow;
    }
  }

  @override
  Future<User> getUserInfo() async {
    try {
      _debugLog('Getting user info...');
      final token = await getToken();

      if (token == null || token.isEmpty) {
        _debugLog('❌ No authentication token found');
        throw Exception('No authentication token found');
      }

      _debugLog('Token found, length: ${token.length}');
      _debugLog('Making API request to: ${ApiEndpoint.userInfo}');

      final headers = _getAuthHeaders(token);
      _debugLog('Request headers: $headers');

      final response = await FetchingData.getData(
        ApiEndpoint.userInfo,
        headers,
      );

      _debugLog('Response status code: ${response.statusCode}');
      _debugLog('Response body: ${response.body}');

      if (response.statusCode == 200) {
        final jsonResponse = json.decode(response.body);
        final jsonData = jsonResponse['data'];
        if (jsonData == null) {
          _debugLog('❌ Response does not contain "data" field');
          throw Exception('Response does not contain "data" field');
        }
        _debugLog('✅ User info retrieved successfully');
        return User.fromJson(jsonData);
      } else if (response.statusCode == 404) {
        _debugLog('❌ 404 Error - Endpoint not found or user not found');
        throw Exception(
          'Failed to load user info: User endpoint not found (404)',
        );
      } else if (response.statusCode == 401) {
        _debugLog('❌ 401 Error - Unauthorized, token may be invalid');
        throw Exception('Failed to load user info: Unauthorized (401)');
      } else {
        _debugLog('❌ Error: ${response.statusCode}');
        throw Exception('Failed to load user info: ${response.statusCode}');
      }
    } catch (e) {
      _debugLog('❌ getUserInfo exception: $e');
      rethrow;
    }
  }
}
