class ApiEndpoint {
  static const String baseUrl = 'https://g9-capstone-project-ll.onrender.com';
  // Auth Endpoints
  static const String login = '$baseUrl/api/login';
  static const String register = '$baseUrl/api/register';
  static const String logout = '$baseUrl/api/logout';
  static const String forgotPassword = '$baseUrl/api/forgot-password';
  static const String resetPassword = '$baseUrl/api/reset-password';
  static const String verifyPin = '$baseUrl/api/verify/pin';
  static const String googleSignIn = '$baseUrl/api/auth/google';

  // Place Endpoints
  static const String categories = '/api/place-categories';
  static const String placeBaseOnCategory = '/api/places/by-category';
  static const String searchPlaces = '/api/places/search';
  static const String placeDetails = '/api/places/1/details';
  static const String upcomingEvents = '/api/events/upcoming';
  static const String recommendedPlaces = '/api/places/recommended';

  // Hotel Endpoints
  static const String hotel = '/api/hotels/properties';

 
  //Trip Endpoints
  static const String createTrip = '/api/trips';
  static const String getAllUsers = '/api/trips';
  static const String addPlaceToTripDay = '/api/trip-days/1/places';
  static const String getPlaceForTripDay = '/api/trip-days/7/places';
  static const String getAllPlacesForTripPlanning = '/api/trip-planning/places';
}
