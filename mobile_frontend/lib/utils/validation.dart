///
/// Utility class for form validation.
/// Contains static methods for validating common input fields.
///
class Validation {
  /// Validates email format
  /// Returns error message if invalid, null if valid
  static String? validateEmail(String? value) {
    if (value == null || value.isEmpty) {
      return 'Please enter your email';
    }
    final emailRegex = RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$');
    if (!emailRegex.hasMatch(value)) {
      return 'Please enter a valid email';
    }
    return null;                                          // Email is valid
  }

  /// Validates password format
  /// Returns error message if invalid, null if valid
  static String? validatePassword(String? value) {
    if (value == null || value.isEmpty) {
      return 'Please enter your password';
    }
    if (value.length < 6) {
      return 'Password must be at least 6 characters';
    }
    return null;                                          // Password is valid
  }

  /// Validates required field
  /// Returns error message if empty, null if valid
  static String? validateRequired(String? value, {String fieldName = 'This field'}) {
    if (value == null || value.isEmpty) {
      return '$fieldName is required';
    }
    return null;                                          // Field is not empty
  }

  /// Validates phone number format
  /// Returns error message if invalid, null if valid
  static String? validatePhoneNumber(String? value) {
    if (value == null || value.isEmpty) {
      return 'Please enter your phone number';
    }
    final phoneRegex = RegExp(r'^\+?[0-9]{8,15}$');
    if (!phoneRegex.hasMatch(value)) {
      return 'Please enter a valid phone number';
    }
    return null;                                          // Phone number is valid
  }

  /// Validates minimum length
  /// Returns error message if too short, null if valid
  static String? validateMinLength(String? value, int minLength, {String fieldName = 'This field'}) {
    if (value == null || value.isEmpty) {
      return '$fieldName is required';
    }
    if (value.length < minLength) {
      return '$fieldName must be at least $minLength characters';
    }
    return null;                                          // Meets minimum length
  }

  /// Validates maximum length
  /// Returns error message if too long, null if valid
  static String? validateMaxLength(String? value, int maxLength, {String fieldName = 'This field'}) {
    if (value == null || value.isEmpty) {
      return null;                                        // Empty is acceptable for max length
    }
    if (value.length > maxLength) {
      return '$fieldName must not exceed $maxLength characters';
    }
    return null;                                          // Within maximum length
  }

  /// Validates password confirmation
  /// Returns error message if passwords don't match, null if valid
  static String? validatePasswordConfirmation(String? value, String password) {
    if (value == null || value.isEmpty) {
      return 'Please confirm your password';
    }
    if (value != password) {
      return 'Passwords do not match';
    }
    return null;                                          // Passwords match
  }

  /// Validates username format (alphanumeric and underscore only)
  /// Returns error message if invalid, null if valid
  static String? validateUsername(String? value) {
    if (value == null || value.isEmpty) {
      return 'Please enter a username';
    }
    if (value.length < 3) {
      return 'Username must be at least 3 characters';
    }
    final usernameRegex = RegExp(r'^[a-zA-Z0-9_]+$');
    if (!usernameRegex.hasMatch(value)) {
      return 'Username can only contain letters, numbers, and underscores';
    }
    return null;                                          // Username is valid
  }

  /// Validates numeric input
  /// Returns error message if not a number, null if valid
  static String? validateNumeric(String? value, {String fieldName = 'This field'}) {
    if (value == null || value.isEmpty) {
      return '$fieldName is required';
    }
    if (double.tryParse(value) == null) {
      return '$fieldName must be a number';
    }
    return null;                                          // Value is numeric
  }

  /// Validates URL format
  /// Returns error message if invalid, null if valid
  static String? validateUrl(String? value) {
    if (value == null || value.isEmpty) {
      return 'Please enter a URL';
    }
    final urlRegex = RegExp(
      r'^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$'
    );
    if (!urlRegex.hasMatch(value)) {
      return 'Please enter a valid URL';
    }
    return null;                                          // URL is valid
  }
}
