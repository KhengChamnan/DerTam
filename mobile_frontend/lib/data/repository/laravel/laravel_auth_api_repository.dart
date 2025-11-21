import 'dart:convert';
import 'dart:async';
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

  // Debug method to check token state
  Future<Map<String, dynamic>> debugTokenState() async {
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
      return result;
    } catch (e) {
      result['error'] = e.toString();
      return result;
    }
  }

  /// Get stored authentication token
  @override
  Future<String?> getToken() async {
    if (_cachedToken != null && _cachedToken!.isNotEmpty) {
      return _cachedToken;
    }

    _cachedToken = await _storage.read(key: _tokenKey);
    return _cachedToken;
  }
  @override
  Future<void> saveToken(String token) async {
    try {
      await _storage.write(key: _tokenKey, value: token);
      _cachedToken = token;
    } catch (e) {
      _logger.warning('Error saving token: $e');
      rethrow;
    }
  }

  Future<void> deleteToken() async {
    try {
      await _storage.delete(key: _tokenKey);
      _cachedToken = null;
    } catch (e) {
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
        headers['Authorization'] = 'Bearer ${token.replaceAll('"', '')}';
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
      final body = AuthDto.loginToJson(email, password);
      final response = await FetchingData.postHeader(
        ApiEndpoint.login,
        await _getHeaders(),
        body,
      );

      if (response.statusCode == 200) {
        final responseBody = json.decode(response.body);
        final data = responseBody['data'];
        final accessToken =
            responseBody['token'] ??
            (data is Map ? data['token'] ?? data['access_token'] : null);

        if (accessToken == null || accessToken.isEmpty) {
          throw Exception('Access token not found in response');
        }

        await saveToken(accessToken);
        _cachedToken = accessToken;
        return User.fromJson(data ?? responseBody['user']);
      }

      throw _handleErrorResponse(response, 'Login');
    } catch (e) {
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
      final body = AuthDto.registerToJson(name, email, password);
      body['password_confirmation'] = confirmPassword;

      final response = await FetchingData.postHeader(
        ApiEndpoint.register,
        await _getHeaders(),
        body,
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        final responseBody = json.decode(response.body);
        final data = responseBody['data'];
        final accessToken =
            responseBody['token'] ??
            (data is Map ? data['token'] ?? data['access_token'] : null);

        if (accessToken != null && accessToken.isNotEmpty) {
          await saveToken(accessToken);
          _cachedToken = accessToken;
        }

        return User.fromJson(data ?? responseBody['user']);
      }

      throw _handleErrorResponse(response, 'Registration');
    } catch (e) {
      _logger.severe('Registration error: $e');
      rethrow;
    }
  }

  @override
  Future<User> sendPasswordResetEmail(String email) async {
    try {
      final body = AuthDto.resetPasswordToJson(email);
      final response = await FetchingData.postHeader(
        ApiEndpoint.forgotPassword,
        await _getHeaders(),
        body,
      );

      if (response.statusCode == 200) {
        final responseBody = json.decode(response.body);
        final data = responseBody['data'];
        if (data != null && data is Map) {
          return User.fromJson(Map<String, dynamic>.from(data));
        }

        return User(id: 0, name: '', email: email);
      }

      throw _handleErrorResponse(response, 'Password reset email');
    } catch (e) {
      _logger.severe('Password reset email error: $e');
      rethrow;
    }
  }

  @override
  Future<User> verifyPin(String email, String pin) async {
    try {
      final body = AuthDto.verifyPinToJson(email, pin);
      final response = await FetchingData.postHeader(
        ApiEndpoint.verifyPin,
        await _getHeaders(),
        body,
      );

      if (response.statusCode == 200) {
        final responseBody = json.decode(response.body);
        final data = responseBody['data'];

        if (data != null && data is Map) {
          return User.fromJson(Map<String, dynamic>.from(data));
        }

        return User(id: 0, name: '', email: email);
      }

      throw _handleErrorResponse(response, 'PIN verification');
    } catch (e) {
      _logger.severe('PIN verification error: $e');
      rethrow;
    }
  }

  @override
  Future<User> resetPassword(String email, String newPassword) async {
    try {
      final body = {'email': email, 'newPassword': newPassword};
      final response = await FetchingData.postHeader(
        ApiEndpoint.resetPassword,
        await _getHeaders(),
        body,
      );

      if (response.statusCode == 200) {
        final responseBody = json.decode(response.body);
        final data = responseBody['data'];

        if (data != null && data is Map) {
          return User.fromJson(Map<String, dynamic>.from(data));
        }

        return User(id: 0, name: '', email: email);
      }

      throw _handleErrorResponse(response, 'Password reset');
    } catch (e) {
      _logger.severe('Password reset error: $e');
      rethrow;
    }
  }

  /// Logout user and clear stored token
  Future<void> logout() async {
    try {
      await FetchingData.postWithHeaderOnly(
        ApiEndpoint.logout,
        await _getHeaders(includeToken: true),
      );

      await deleteToken();
      await _googleSignIn.signOut();
    } catch (e) {
      await deleteToken();

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
      // Get Google user account
      final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();
      if (googleUser == null) {
        throw Exception('Google sign in cancelled');
      }

      // Get authentication tokens
      final GoogleSignInAuthentication googleAuth =
          await googleUser.authentication;
      final token = googleAuth.idToken ?? googleAuth.accessToken;

      if (token == null) {
        throw Exception('Failed to get Google authentication');
      }

      // Send token to Laravel backend
      final response = await FetchingData.postHeader(
        ApiEndpoint.googleSignIn,
        await _getHeaders(),
        {
          'social_type': 'google',
          'token': token,
          'email': googleUser.email,
          'name': googleUser.displayName,
        },
      );

      if (response.statusCode == 200) {
        final responseBody = json.decode(response.body);
        final data = responseBody['data'];
        final accessToken =
            responseBody['token'] ??
            (data is Map ? data['token'] ?? data['access_token'] : null);

        if (accessToken == null || accessToken.isEmpty) {
          throw Exception(
            'Authentication failed: No token received from server',
          );
        }

        await saveToken(accessToken);
        _cachedToken = accessToken;
        return User.fromJson(data ?? responseBody['user']);
      }

      final responseBody = json.decode(response.body);
      final errorMessage = responseBody['message'] ?? 'Authentication failed';
      throw Exception(errorMessage);
    } catch (e) {
      _logger.severe('Google sign in error: $e');
      rethrow;
    }
  }

  @override
  Future<void> logOut() async {
    try {
      _cachedToken = null;
      await deleteToken();
    } catch (e) {
      _logger.severe('Logout error: $e');
      rethrow;
    }
  }

  @override
  Future<User> getUserInfo() async {
    try {
      final token = await getToken();
      if (token == null || token.isEmpty) {
        throw Exception('No authentication token found');
      }

      final headers = _getAuthHeaders(token);
      final response = await FetchingData.getData(
        ApiEndpoint.userInfo,
        headers,
      );

      if (response.statusCode == 200) {
        final jsonResponse = json.decode(response.body);
        final jsonData = jsonResponse['data'];

        if (jsonData == null) {
          throw Exception('Response does not contain "data" field');
        }

        return User.fromJson(jsonData);
      }

      if (response.statusCode == 401) {
        throw Exception('Unauthorized: Please login again');
      }

      if (response.statusCode == 404) {
        throw Exception('User endpoint not found');
      }

      throw Exception('Failed to load user info: ${response.statusCode}');
    } catch (e) {
      _logger.severe('getUserInfo error: $e');
      rethrow;
    }
  }
}
