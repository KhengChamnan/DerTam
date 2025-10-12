import 'package:flutter/material.dart';
import 'package:mobile_frontend/data/repo/laravel/laravel_auth_api_repository.dart';
import 'package:mobile_frontend/ui/providers/asyncvalue.dart';

///
/// Auth Provider
/// Manages authentication state and handles all auth-related operations
///
class AuthProvider extends ChangeNotifier {
  // Repository instance
  final LaravelAuthApiRepository _authRepository = LaravelAuthApiRepository();

  // Async values for different operations
  AsyncValue<Map<String, dynamic>>? loginValue;
  AsyncValue<Map<String, dynamic>>? registerValue;
  AsyncValue<Map<String, dynamic>>? forgotPasswordValue;
  AsyncValue<Map<String, dynamic>>? verifyPinValue;
  AsyncValue<Map<String, dynamic>>? resetPasswordValue;
  AsyncValue<Map<String, dynamic>>? googleSignInValue;

  // User state
  String? _authToken;
  bool _isAuthenticated = false;

  /// Check if user is authenticated
  bool get isAuthenticated => _isAuthenticated;

  /// Get authentication token
  String? get authToken => _authToken;

  /// Initialize auth state (check if token exists)
  Future<void> initializeAuth() async {
    final token = await _authRepository.getToken();
    if (token != null) {
      _authToken = token;
      _isAuthenticated = true;
      notifyListeners();
    }
  }

  /// Login user
  Future<void> login(String email, String password) async {
    // 1 - Set loading state
    loginValue = AsyncValue.loading();
    notifyListeners();

    try {
      // 2 - Call repository to login
      final result = await _authRepository.login(email, password);

      // 3 - Handle success
      if (result['success']) {
        _authToken = result['data']['token'];
        _isAuthenticated = true;
        loginValue = AsyncValue.success(result);
      } else {
        // Handle error response
        loginValue = AsyncValue.error(result['message']);
      }
    } catch (error) {
      // 4 - Handle exception
      loginValue = AsyncValue.error(error);
    }

    // 5 - Notify listeners
    notifyListeners();
  }

  /// Register new user
  Future<void> register(
    String name,
    String email,
    String password,
    String confirmPassword,
  ) async {
    // 1 - Set loading state
    registerValue = AsyncValue.loading();
    notifyListeners();

    try {
      // 2 - Call repository to register
      final result = await _authRepository.register(
        name,
        email,
        password,
        confirmPassword,
      );

      // 3 - Handle success
      if (result['success']) {
        _authToken = result['data']['token'];
        _isAuthenticated = true;
        registerValue = AsyncValue.success(result);
      } else {
        // Handle error response
        registerValue = AsyncValue.error(result['message']);
      }
    } catch (error) {
      // 4 - Handle exception
      registerValue = AsyncValue.error(error);
    }

    // 5 - Notify listeners
    notifyListeners();
  }

  /// Send password reset email
  Future<void> sendPasswordResetEmail(String email) async {
    // 1 - Set loading state
    forgotPasswordValue = AsyncValue.loading();
    notifyListeners();

    try {
      // 2 - Call repository to send reset email
      final result = await _authRepository.sendPasswordResetEmail(email);

      // 3 - Handle response
      if (result['success']) {
        forgotPasswordValue = AsyncValue.success(result);
      } else {
        forgotPasswordValue = AsyncValue.error(result['message']);
      }
    } catch (error) {
      // 4 - Handle exception
      forgotPasswordValue = AsyncValue.error(error);
    }

    // 5 - Notify listeners
    notifyListeners();
  }

  /// Verify PIN code
  Future<void> verifyPin(String email, String pin) async {
    // 1 - Set loading state
    verifyPinValue = AsyncValue.loading();
    notifyListeners();

    try {
      // 2 - Call repository to verify PIN
      final result = await _authRepository.verifyPin(email, pin);

      // 3 - Handle response
      if (result['success']) {
        verifyPinValue = AsyncValue.success(result);
      } else {
        verifyPinValue = AsyncValue.error(result['message']);
      }
    } catch (error) {
      // 4 - Handle exception
      verifyPinValue = AsyncValue.error(error);
    }

    // 5 - Notify listeners
    notifyListeners();
  }

  /// Reset password
  Future<void> resetPassword(String email, String newPassword) async {
    // 1 - Set loading state
    resetPasswordValue = AsyncValue.loading();
    notifyListeners();

    try {
      // 2 - Call repository to reset password
      final result = await _authRepository.resetPassword(email, newPassword);

      // 3 - Handle response
      if (result['success']) {
        resetPasswordValue = AsyncValue.success(result);
      } else {
        resetPasswordValue = AsyncValue.error(result['message']);
      }
    } catch (error) {
      // 4 - Handle exception
      resetPasswordValue = AsyncValue.error(error);
    }

    // 5 - Notify listeners
    notifyListeners();
  }

  /// Google sign in
  Future<void> googleSignIn() async {
    // 1 - Set loading state
    googleSignInValue = AsyncValue.loading();
    notifyListeners();

    try {
      // 2 - Call repository to sign in with Google
      final result = await _authRepository.googleSignIn();

      // 3 - Handle success
      if (result['success']) {
        _authToken = result['data']['token'];
        _isAuthenticated = true;
        googleSignInValue = AsyncValue.success(result);
      } else {
        // Handle error response
        googleSignInValue = AsyncValue.error(result['message']);
      }
    } catch (error) {
      // 4 - Handle exception
      googleSignInValue = AsyncValue.error(error);
    }

    // 5 - Notify listeners
    notifyListeners();
  }

  /// Logout user
  Future<void> logout() async {
    try {
      // Call repository to logout
      await _authRepository.logout();
    } catch (error) {
      // Log error but continue with local logout
      debugPrint('Logout error: $error');
    } finally {
      // Clear local auth state
      _authToken = null;
      _isAuthenticated = false;
      
      // Clear all async values
      loginValue = null;
      registerValue = null;
      forgotPasswordValue = null;
      verifyPinValue = null;
      resetPasswordValue = null;
      googleSignInValue = null;
      
      notifyListeners();
    }
  }

  /// Clear specific async value (useful for resetting state)
  void clearLoginValue() {
    loginValue = null;
    notifyListeners();
  }

  void clearRegisterValue() {
    registerValue = null;
    notifyListeners();
  }

  void clearForgotPasswordValue() {
    forgotPasswordValue = null;
    notifyListeners();
  }

  void clearVerifyPinValue() {
    verifyPinValue = null;
    notifyListeners();
  }

  void clearResetPasswordValue() {
    resetPasswordValue = null;
    notifyListeners();
  }

  void clearGoogleSignInValue() {
    googleSignInValue = null;
    notifyListeners();
  }
}
