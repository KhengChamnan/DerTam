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
  static const String userInfo = '/api/profile';

  // Place Endpoints
  static const String categories = '/api/place-categories';
  static const String placeBaseOnCategory = '/api/places/by-category';
  static const String searchPlaces = '/api/places/search';
  static const String placeDetails = '/api/places/1/details';
  static const String upcomingEvents = '/api/events/upcoming';
  static const String recommendedPlaces = '/api/places/recommended';

  // Hotel Endpoints
  static const String getListHotel = '/api/hotels/properties';
  static const String hotelDetails = '/api/hotel-details';
  static const String roomDetails = '/api/rooms';
  static const String createBooking = '/api/hotels/bookings';
  static const String getAllBookings = '/api/hotels/bookings';
  static const String getSingleBookingById = '/api/hotels/bookings';

  static const String deleteBooking = '/api/hotels/bookings';
  //Trip Endpoints
  static const String createTrip = '/api/trips';
  static const String getTrips = '/api/trips';
  static const String getTripDays = '/api/trips'; // Here we need the trip Id
  static const String addPlaceToTripDay = '/api/trip-days/1/places';
  static const String getTripDetails = '/api/trip-days/7/places';
  static const String getAllPlacesForTripPlanning = '/api/trip-planning/places';

  // Social sharing Endpoints
  static const String generateShareableLink =
      '/api/trip/8/share'; // Input trip ID
  static const String clickLink =
      '/api/trip/share/T5FgpgG3LSN1eM6MJtnNz2GQbt1YYKBj';

  // Budget Endpoints
  static const String createBudget = '/api/budgets';
  static const String getBudgetDetails =
      '/api/trips/{{tripId}}/budget'; // Here we need the budget Id
  static const String updateBudget = '/api/budgets';
  static const String addExpense = '/api/budgets/{{budgetId}}/expenses';
  static const String updateExpense = '/api/expenses/{{expenseId}}';
  static const String deleteExpense = '/api/expenses/{{expenseId}}';
}
