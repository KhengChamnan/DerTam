/// Helper class to provide user-friendly error messages
class ErrorMessageHelper {
  /// Get a user-friendly error message from an error object
  static String getUserFriendlyMessage(dynamic error) {
    if (error == null) {
      return 'An unexpected error occurred. Please try again.';
    }

    final errorString = error.toString().toLowerCase();

    // Authentication errors (wrong credentials)
    if (_isAuthenticationError(errorString)) {
      return 'Invalid email or password. Please check your credentials and try again.';
    }

    // Network/Connection errors
    if (_isNetworkError(errorString)) {
      return 'No internet connection. Please check your network and try again.';
    }

    // Server errors
    if (_isServerError(errorString)) {
      return 'Server is temporarily unavailable. Please try again later.';
    }

    // Token/Session errors
    if (_isTokenError(errorString)) {
      return 'Your session has expired. Please login again.';
    }

    // If we can extract a specific message from the exception
    final specificMessage = _extractSpecificMessage(error.toString());
    if (specificMessage != null) {
      return specificMessage;
    }

    // Default error message
    return 'Something went wrong. Please try again.';
  }

  /// Check if the error is related to authentication (wrong credentials)
  static bool _isAuthenticationError(String errorString) {
    final authPatterns = [
      'invalid credentials',
      'invalid email or password',
      'unauthorized',
      'unauthenticated',
      'wrong password',
      'incorrect password',
      'invalid password',
      'invalid email',
      'user not found',
      'authentication failed',
      'login failed',
      '401',
      'these credentials do not match our records',
    ];

    return authPatterns.any((pattern) => errorString.contains(pattern));
  }

  /// Check if the error is related to network/connection issues
  static bool _isNetworkError(String errorString) {
    final networkPatterns = [
      'network',
      'connection',
      'socket',
      'timeout',
      'failed host lookup',
      'no internet',
      'unreachable',
      'connection refused',
      'connection reset',
      'connection closed',
      'connection timed out',
      'network unreachable',
      'no route to host',
      'os error',
    ];

    return networkPatterns.any((pattern) => errorString.contains(pattern));
  }

  /// Check if the error is related to server issues
  static bool _isServerError(String errorString) {
    final serverPatterns = [
      '500',
      '502',
      '503',
      '504',
      'internal server error',
      'bad gateway',
      'service unavailable',
      'gateway timeout',
      'server error',
    ];

    return serverPatterns.any((pattern) => errorString.contains(pattern));
  }

  /// Check if the error is related to token/session
  static bool _isTokenError(String errorString) {
    final tokenPatterns = [
      'token',
      'session expired',
      'access denied',
      'forbidden',
      '403',
    ];

    return tokenPatterns.any((pattern) => errorString.contains(pattern));
  }

  /// Extract specific error message from exception string
  static String? _extractSpecificMessage(String errorString) {
    // Try to extract message from "Exception: message" format
    final exceptionPattern = RegExp(
      r'Exception:\s*(.+)$',
      caseSensitive: false,
    );
    final match = exceptionPattern.firstMatch(errorString);

    if (match != null && match.group(1) != null) {
      String message = match.group(1)!.trim();

      // Clean up the message
      message = message.replaceAll(
        RegExp(r'^Exception:\s*', caseSensitive: false),
        '',
      );

      // If the extracted message is too technical, return null
      if (_isTooTechnical(message)) {
        return null;
      }

      // Capitalize first letter
      if (message.isNotEmpty) {
        message = message[0].toUpperCase() + message.substring(1);
      }

      return message;
    }

    return null;
  }

  /// Check if a message is too technical for end users
  static bool _isTooTechnical(String message) {
    final technicalPatterns = [
      'stacktrace',
      'at line',
      'instance of',
      'dart:',
      'package:',
    ];

    return technicalPatterns.any(
      (pattern) => message.toLowerCase().contains(pattern),
    );
  }
}
