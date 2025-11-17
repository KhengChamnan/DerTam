class ApiEndpoint {
  static const String baseUrl = 'https://g9-capstone-project-ll.onrender.com';
  // Auth Endpoints
  static const String login = '/api/login';
  static const String register = '/api/register';
  static const String logout = '/api/logout';
  static const String forgotPassword = '/api/forgot-password';
  static const String resetPassword = '/api/reset-password';
  static const String verifyPin = '/api/verify/pin';
  static const String googleSignIn = '/api/auth/google';
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
  static const String hotelBooking = '/api/booking/create';
  static const String searchAvailableRooms = '/api/rooms/search';
  static const String getAllBookings = '/api/booking/my-bookings';
  static const String getBookingDetail = '/api/booking';
  static const String cancelBooking = '/api/booking/{{booking_id}}/cancel';
  //Trip Endpoints
  static const String createTrip = '/api/trips';
  static const String getListOfTrips = '/api/trips';
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
