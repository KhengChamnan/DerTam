import 'dart:convert';
import 'dart:async';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:mobile_frontend/data/repository/abstract/auth_repository.dart';
import 'package:mobile_frontend/data/dto/auth_dto.dart';
import 'package:mobile_frontend/data/network/api_constant.dart';

///
/// Laravel Auth API Repository
/// Handles authentication API calls to Laravel backend
///
class LaravelAuthApiRepository extends AuthRepository {
  // Secure storage for tokens
  final _storage = const FlutterSecureStorage();
  // Token key for secure storage
  static const String _tokenKey = 'auth_token';

  // Google Sign-In scopes
  final GoogleSignIn _googleSignIn = GoogleSignIn(
    scopes: ['email', 'profile'],
    // Add your Google OAuth Client ID here (from Google Cloud Console)
    // clientId: 'your-client-id-here.apps.googleusercontent.com', // Uncomment and add your client ID
  );

  // Google Sign-In instance with server client ID
  /// Get stored authentication token
  Future<String?> getToken() async {
    return await _storage.read(key: _tokenKey);
  }
  /// Save authentication token
  Future<void> saveToken(String token) async {
    await _storage.write(key: _tokenKey, value: token);
  }
  /// Delete authentication token
  Future<void> deleteToken() async {
    await _storage.delete(key: _tokenKey);
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
        headers['Authorization'] = 'Bearer $token';
      }
    }

    return headers;
  }

  /// Handle HTTP response and return parsed JSON
  Map<String, dynamic> _handleResponse(http.Response response) {
    final responseBody = json.decode(response.body);

    if (response.statusCode >= 200 && response.statusCode < 300) {
      // Success response
      return {
        'success': true,
        'statusCode': response.statusCode,
        'message': responseBody['message'] ?? 'Success',
        'data': responseBody['data'] ?? responseBody,
      };
    } else {
      // Error response
      return {
        'success': false,
        'statusCode': response.statusCode,
        'message': responseBody['message'] ?? 'An error occurred',
        'errors': responseBody['errors'] ?? {},
        'data': null,
      };
    }
  }

  @override
  Future<Map<String, dynamic>> login(String email, String password) async {
    try {
      // 1 - Prepare request body
      final body = AuthDto.loginToJson(email, password);

      // 2 - Send POST request
      final response = await http.post(
        Uri.parse(ApiEndpoint.login),
        headers: await _getHeaders(),
        body: json.encode(body),
      );

      // 3 - Handle response
      final result = _handleResponse(response);

      // 4 - Save token if login successful
      if (result['success'] && result['data'] != null) {
        final token = result['data']['token'];
        if (token != null) {
          await saveToken(token);
        }
      }

      return result;
    } catch (e) {
      // Handle network or parsing errors
      return {
        'success': false,
        'statusCode': 500,
        'message': 'Network error: ${e.toString()}',
        'data': null,
      };
    }
  }

  @override
  Future<Map<String, dynamic>> register(
    String name,
    String email,
    String password,
    String confirmPassword,
  ) async {
    try {
      // 1 - Prepare request body
      final body = AuthDto.registerToJson(name, email, password);
      body['password_confirmation'] = confirmPassword;

      // 2 - Send POST request
      final response = await http.post(
        Uri.parse(ApiEndpoint.register),
        headers: await _getHeaders(),
        body: json.encode(body),
      );

      // 3 - Handle response
      final result = _handleResponse(response);

      // 4 - Save token if registration successful
      if (result['success'] && result['data'] != null) {
        final token = result['data']['token'];
        if (token != null) {
          await saveToken(token);
        }
      }

      return result;
    } catch (e) {
      // Handle network or parsing errors
      return {
        'success': false,
        'statusCode': 500,
        'message': 'Network error: ${e.toString()}',
        'data': null,
      };
    }
  }

  @override
  Future<Map<String, dynamic>> sendPasswordResetEmail(String email) async {
    try {
      // 1 - Prepare request body
      final body = AuthDto.resetPasswordToJson(email);

      // 2 - Send POST request
      final response = await http.post(
        Uri.parse(ApiEndpoint.forgotPassword),
        headers: await _getHeaders(),
        body: json.encode(body),
      );

      // 3 - Handle response
      return _handleResponse(response);
    } catch (e) {
      // Handle network or parsing errors
      return {
        'success': false,
        'statusCode': 500,
        'message': 'Network error: ${e.toString()}',
        'data': null,
      };
    }
  }

  @override
  Future<Map<String, dynamic>> verifyPin(String email, String pin) async {
    try {
      // 1 - Prepare request body
      final body = AuthDto.verifyPinToJson(email, pin);

      // 2 - Send POST request
      final response = await http.post(
        Uri.parse(ApiEndpoint.verifyPin),
        headers: await _getHeaders(),
        body: json.encode(body),
      );

      // 3 - Handle response
      return _handleResponse(response);
    } catch (e) {
      // Handle network or parsing errors
      return {
        'success': false,
        'statusCode': 500,
        'message': 'Network error: ${e.toString()}',
        'data': null,
      };
    }
  }

  @override
  Future<Map<String, dynamic>> resetPassword(
    String email,
    String newPassword,
  ) async {
    try {
      // 1 - Prepare request body
      final body = AuthDto.newPasswordToJson(email, newPassword);

      // 2 - Send POST request
      final response = await http.post(
        Uri.parse(ApiEndpoint.resetPassword),
        headers: await _getHeaders(),
        body: json.encode(body),
      );

      // 3 - Handle response
      return _handleResponse(response);
    } catch (e) {
      // Handle network or parsing errors
      return {
        'success': false,
        'statusCode': 500,
        'message': 'Network error: ${e.toString()}',
        'data': null,
      };
    }
  }

  /// Logout user and clear stored token
  Future<Map<String, dynamic>> logout() async {
    try {
      // 1 - Send POST request with token
      final response = await http.post(
        Uri.parse(ApiEndpoint.logout),
        headers: await _getHeaders(includeToken: true),
      );

      // 2 - Delete token from storage regardless of response
      await deleteToken();

      // 3 - Sign out from Google to clear cached account
      await _googleSignIn.signOut();

      // 4 - Handle response
      return _handleResponse(response);
    } catch (e) {
      // Delete token even if request fails
      await deleteToken();

      // Also try to sign out from Google even if request fails
      try {
        await _googleSignIn.signOut();
      } catch (googleError) {
        print('Google sign out error: $googleError');
      }

      return {
        'success': false,
        'statusCode': 500,
        'message': 'Network error: ${e.toString()}',
        'data': null,
      };
    }
  }

  @override
  Future<Map<String, dynamic>> googleSignIn() async {
    try {
      final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();

      final GoogleSignInAuthentication? googleAuth =
          await googleUser?.authentication;

      // Send access token to your Laravel backend (simplified approach)
      final response = await http.post(
        Uri.parse(ApiEndpoint.googleSignIn),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: jsonEncode({'access_token': googleAuth?.accessToken}),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);

        // Save token locally using saveToken function
        final token = data['token'];
        if (token != null) {
          await saveToken(token);
        }

        return {
          'success': true,
          'statusCode': 200,
          'message': 'Google sign-in successful',
          'data': data,
        };
      } else {
        print('Login failed: ${response.body}');
        return {
          'success': false,
          'statusCode': response.statusCode,
          'message': 'Google sign-in failed',
          'data': null,
        };
      }
    } catch (e) {
      print('Google Sign-In error: $e');
      return {
        'success': false,
        'statusCode': 500,
        'message': 'Google Sign-In error: ${e.toString()}',
        'data': null,
      };
    }
  }
}
