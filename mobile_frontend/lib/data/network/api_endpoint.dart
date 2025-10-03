class ApiEndpoint {
  //Authentication
  static const String login = '/auth/login';
  static const String register = '/auth/register';

  //Places Category
  static const String getPlacesCategory = '/places-category';

  //Places 
  static const String getPlaces = '/places';
  static const String getPlacesByCategory = '/places/category/';

  // Create Trip
  static const String createTrip = '/trips/create';
  static const String getTrips = '/trips/user/';
  static const String getTripDetails = '/trips/'; // + {tripId} 
  static const String updateTrip = '/trips/update/'; // + {tripId}  
  static const String deleteTrip = '/trips/delete/'; // + {tripId}
  static const String addPlaceToTrip = '/trips/add-place/'; // + {tripId}
  static const String removePlaceFromTrip = '/trips/remove-place/'; // + {tripId} + /{placeId}
  static const String setAmountBudget = '/trips/set-budget/'; // + {tripId}
  

  //
}
