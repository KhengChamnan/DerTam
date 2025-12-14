class ApiEndpoint {
  static const String baseUrl = 'https://g9-capstone-project-ll.onrender.com';
  // Auth Endpoints
  static const String login = '/api/login';
  static const String register = '/api/register';
  static const String logout = '/api/auth/logout';
  static const String forgotPassword = '/api/forgot-password';
  static const String resetPassword = '/api/reset-password';
  static const String verifyPin = '/api/verify/pin';
  static const String googleSignIn = '/api/auth/google';
  static const String userInfo = '/api/profile';
  static const String updateProfile = '/api/profile';
  static const String changePassword = '/api/profile';

  // Place Endpoints
  static const String categories = '/api/place-categories';
  static const String placeBaseOnCategory = '/api/places/by-category';
  static const String searchPlaces = '/api/places/search';
  static const String placeDetails = '/api/places/1/details';
  static const String upcomingEvents = '/api/events/upcoming';
  static const String recommendedPlaces = '/api/places/recommended';
  static const String upcomingEventDetail = '/api/events';
  static const String slideShow = '/api/slideshow';
  // Hotel Endpoints
  static const String getListHotel = '/api/hotels/properties';
  static const String hotelDetails = '/api/hotel-details';
  static const String roomDetails = '/api/rooms';
  static const String hotelBooking = '/api/booking/hotel/create';
  static const String searchAvailableRooms = '/api/rooms/search';
  static const String getAllBookings = '/api/booking/hotel/my-bookings';
  static const String getBookingDetail = '/api/booking/hotel';
  static const String cancelBooking = '/api/booking/{{booking_id}}/cancel';
  static const String searchHotels = '/api/hotels/search';

  /// Restaurant Endpoints
  static const String getMenuCategories = '/api/menu-categories';
  static const String getMenuItems = '/api/restaurants';

  //Trip Endpoints
  static const String createTrip = '/api/trips';
  static const String addPlaceToTripDay =
      '/api/add-places'; // Have to put trip ID
  static const String getTripDetail = '/api/trips';
  static const String getAllTrips = '/api/trips';

  // Social sharing Endpoints
  static const String generateShareableLink =
      '/api/trip/8/share'; // Input trip ID

  static const String joinTripViaShareLink = '/api/trip/share';

  // Budget Endpoints
  static const String createBudget = '/api/budgets';
  static const String getBudgetDetails =
      '/api/trips/{{tripId}}/budget'; // Here we need the budget Id
  static const String updateBudget = '/api/budgets';
  static const String addExpense = '/api/budgets/{{budgetId}}/expenses';
  static const String updateExpense = '/api/expenses';
  static const String deleteExpense = '/api/expenses';
  static const String expenseCategory = '/api/expense-categories';

  /// Bus Booking endpoints
  static const String searchProvinces = '/api/bus/provinces';
  static const String searchBuses = '/api/bus/search';
  // Put the schedule ID here for schedule Detials
  static const String scheduleDetails = '/api/bus/schedule';
  static const String upcomingJourneys = '/api/bus/upcoming-journeys';
  static const String busBooking = '/api/booking/bus/create';
  static const String getAllBusBooking = '/api/booking/bus/my-bookings';
  static const String getBusBookingDetail = '/api/booking/bus';
}
