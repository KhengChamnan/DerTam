class ApiEndpoint {
  static const String baseUrl = 'https://elegant-many-oyster.ngrok-free.app/api';
    // Auth Endpoints 
  static const String login = '$baseUrl/login';
  static const String register = '$baseUrl/register';
  static const String logout = '$baseUrl/logout';
  static const String forgotPassword = '$baseUrl/forgot-password';
  static const String resetPassword = '$baseUrl/reset-password';
  static const String verifyPin = '$baseUrl/verify/pin';
  static const String googleSignIn = '$baseUrl/auth/google';
}
