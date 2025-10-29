import 'package:flutter/material.dart';
import 'package:mobile_frontend/data/repository/abstract/auth_repository.dart';
import 'package:mobile_frontend/models/user/user_model.dart';
import 'package:mobile_frontend/ui/providers/asyncvalue.dart';

class AuthProvider extends ChangeNotifier {
  // Repository instance
  final AuthRepository authRepository;
  AuthProvider({required this.authRepository});
  // Async values for different operations
  AsyncValue<User>? loginValue;
  AsyncValue<User>? registerValue;
  AsyncValue<User>? forgotPasswordValue;
  AsyncValue<User>? verifyPinValue;
  AsyncValue<User>? resetPasswordValue;
  AsyncValue<User>? googleSignInValue;
  AsyncValue<String?> _userToken = AsyncValue.empty();

  // User state
  String? _authToken;
  User? _currentUser;
  bool _isAuthenticated = false;

  /// Check if user is authenticated
  bool get isAuthenticated => _isAuthenticated;

  /// Get authentication token
  String? get authToken => _authToken;

  /// Get current user
  User? get currentUser => _currentUser;

  /// Get user token
  AsyncValue<String?> get userToken => _userToken;
  Future<void> initializeAuth() async {
    final token = await authRepository.getToken();
    if (token != null && token.isNotEmpty) {
      _authToken = token;
      _isAuthenticated = true;
      notifyListeners();
    }
  }

  Future<String?> getUserToken() async {
    _userToken = AsyncValue.loading();
    notifyListeners();
    try {
      final token = await authRepository.getToken();
      _userToken = AsyncValue.success(token);
      notifyListeners();
      return token;
    } catch (error) {
      debugPrint('❌ Error getting user token in provider: $error');
      _userToken = AsyncValue.error(error);
      notifyListeners();
      return null;
    }
  }

  Future<void> login(String email, String password) async {
    loginValue = AsyncValue.loading();
    notifyListeners();

    try {
      final user = await authRepository.login(email, password);
      final token = await authRepository.getToken();
      _authToken = token;
      _currentUser = user;
      _isAuthenticated = true;
      loginValue = AsyncValue.success(user);
      debugPrint('✅ Login successful in provider');
    } catch (error) {
      debugPrint('❌ Login error in provider: $error');
      loginValue = AsyncValue.error(error);
      _isAuthenticated = false;
    }
    notifyListeners();
  }

  Future<void> register(
    String name,
    String email,
    String password,
    String confirmPassword,
  ) async {
    registerValue = AsyncValue.loading();
    notifyListeners();

    try {
      final user = await authRepository.register(
        name,
        email,
        password,
        confirmPassword,
      );
      final token = await authRepository.getToken();
      _authToken = token;
      _currentUser = user;
      _isAuthenticated = true;
      registerValue = AsyncValue.success(user);
      debugPrint('✅ Registration successful in provider');
    } catch (error) {
      debugPrint('❌ Registration error in provider: $error');
      registerValue = AsyncValue.error(error);
      _isAuthenticated = false;
    }
    notifyListeners();
  }

  Future<void> sendPasswordResetEmail(String email) async {
    forgotPasswordValue = AsyncValue.loading();
    notifyListeners();
    try {
      final user = await authRepository.sendPasswordResetEmail(email);
      forgotPasswordValue = AsyncValue.success(user);
      debugPrint('✅ Password reset email sent successfully in provider');
    } catch (error) {
      debugPrint('❌ Password reset email error in provider: $error');
      forgotPasswordValue = AsyncValue.error(error);
    }
    notifyListeners();
  }

  Future<void> verifyPin(String email, String pin) async {
    verifyPinValue = AsyncValue.loading();
    notifyListeners();
    try {
      final user = await authRepository.verifyPin(email, pin);
      verifyPinValue = AsyncValue.success(user);
      debugPrint('✅ PIN verified successfully in provider');
    } catch (error) {
      debugPrint('❌ PIN verification error in provider: $error');
      verifyPinValue = AsyncValue.error(error);
    }
    notifyListeners();
  }

  Future<void> resetPassword(String email, String newPassword) async {
    resetPasswordValue = AsyncValue.loading();
    notifyListeners();

    try {
      final user = await authRepository.resetPassword(email, newPassword);
      resetPasswordValue = AsyncValue.success(user);
      debugPrint('✅ Password reset successfully in provider');
    } catch (error) {
      debugPrint('❌ Password reset error in provider: $error');
      resetPasswordValue = AsyncValue.error(error);
    }
    notifyListeners();
  }

  Future<void> googleSignIn() async {
    googleSignInValue = AsyncValue.loading();
    notifyListeners();

    try {
      final user = await authRepository.googleSignIn();
      final token = await authRepository.getToken();
      _authToken = token;
      _currentUser = user;
      _isAuthenticated = true;
      googleSignInValue = AsyncValue.success(user);

      debugPrint('✅ Google sign-in successful in provider');
    } catch (error) {
      // 5 - Handle exception
      debugPrint('❌ Google sign-in error in provider: $error');
      googleSignInValue = AsyncValue.error(error);
      _isAuthenticated = false;
    }

    // 6 - Notify listeners
    notifyListeners();
  }

  /// Logout user
  Future<void> logout() async {
    try {
      // Call repository to logout
      await authRepository.logOut();
      debugPrint('✅ Logout successful in provider');
    } catch (error) {
      // Log error but continue with local logout
      debugPrint('❌ Logout error in provider: $error');
    } finally {
      // Clear local auth state
      _authToken = null;
      _currentUser = null;
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
