# Dertam Trip Screen Implementation

## Overview
I've created a complete "My Trips" screen that displays your created trips in a beautiful, organized way with tabs for "Upcoming" and "Past" trips, just like the design in your images.

## Features Implemented

### 1. **Tab Navigation**
- **Upcoming Tab**: Shows trips that haven't ended yet (ongoing or future trips)
- **Past Tab**: Shows completed trips

### 2. **Trip Status Badges**
- **Ongoing** (Green): Trips that have started but not ended yet
- **Upcoming** (Blue): Trips that haven't started yet  
- **Completed** (Green): Trips that have already ended

### 3. **Trip Cards Display**
Each trip card shows:
- Beautiful trip image (using `bakong.jpg` from your assets)
- Status badge in the top-right corner
- Trip name
- Date range (start date - end date) with calendar icon
- Number of places to visit with location icon
- Days left/ended information:
  - For upcoming/ongoing trips: "X days left" (in green)
  - For past trips: "Ended X days ago" (in gray)

### 4. **Interactive Features**
- **Pull to Refresh**: Swipe down to reload trip data
- **Floating Action Button**: Blue "+" button to create new trips
- **Bottom Navigation Bar**: Shows Home, Trip Plan (active), Favorite, and Profile
- **Error Handling**: Shows error messages with retry button
- **Empty States**: Shows helpful messages when no trips exist

### 5. **Automatic Data Loading**
- Fetches all trips from `TripProvider` when screen loads
- Uses `AsyncValue` state management for loading, error, and success states

## Data Flow

The screen uses data from `TripProvider`:
```dart
// Fetches all trips
context.read<TripProvider>().fetchAllTrip()

// Accesses trip list
tripProvider.getTripList
```

## Trip Filtering Logic

### Upcoming Trips
- Shows trips where `endDate` is today or in the future
- Sorted by start date (earliest first)

### Past Trips  
- Shows trips where `endDate` is before today
- Sorted by end date (most recent first)

### Status Calculation
- **Ongoing**: Current date is between start date and end date
- **Upcoming**: Current date is before start date
- **Completed**: Current date is after end date

## UI Design Details

### Colors
- **Background**: White (`Colors.white`)
- **Ongoing Badge**: Green (`Colors.green`)
- **Upcoming Badge**: Blue (`Colors.blue`)
- **Completed Badge**: Dark Green (`Colors.green.shade600`)
- **Card Shadow**: Light black with 8% opacity

### Typography
- **Title**: 24px, bold, black
- **Trip Name**: 20px, bold, black
- **Dates & Places**: 14px, gray
- **Status Badge**: 14px, bold, white
- **Days Info**: 14px, semi-bold, green/gray

### Spacing & Sizing
- **Card Margins**: 16px bottom spacing
- **Card Border Radius**: 16px
- **Image Height**: 200px
- **Card Padding**: 16px all sides
- **Tab Bar Height**: 60px

## File Structure

```
lib/
└── ui/
    ├── screen/
    │   └── trip/
    │       └── dertam_trip_screen.dart  (Main screen)
    ├── providers/
    │   ├── trip_provider.dart          (Data provider)
    │   └── asyncvalue.dart             (Updated with .when method)
    └── models/
        └── trips/
            └── trips.dart              (Trip model)
```

## How to Use

1. **Import the screen** in your navigation/routing:
```dart
import 'package:mobile_frontend/ui/screen/trip/dertam_trip_screen.dart';
```

2. **Navigate to the screen**:
```dart
Navigator.push(
  context,
  MaterialPageRoute(builder: (context) => const DertamTripScreen()),
);
```

3. **Ensure TripProvider is provided** in your widget tree:
```dart
ChangeNotifierProvider(
  create: (context) => TripProvider(tripRepository: ...),
  child: DertamTripScreen(),
)
```

## Customization Options

### Change Trip Image
To use different images for different trips, you can modify the `TripCard` widget:
```dart
// In TripCard build method, change:
image: const AssetImage('assets/images/bakong.jpg'),
// To use a trip-specific image:
image: trip.imageUrl != null 
  ? NetworkImage(trip.imageUrl!)
  : const AssetImage('assets/images/bakong.jpg'),
```

### Add Navigation to Trip Details
In the `TripCard`, wrap the container with `GestureDetector` or `InkWell`:
```dart
return InkWell(
  onTap: () {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => TripDetailScreen(tripId: trip.tripId),
      ),
    );
  },
  child: Container(
    // ... existing card code
  ),
);
```

### Customize Bottom Navigation
Update the `onTap` callback in `bottomNavigationBar`:
```dart
onTap: (index) {
  switch (index) {
    case 0:
      Navigator.pushNamed(context, '/home');
      break;
    case 1:
      // Already on Trip Plan
      break;
    case 2:
      Navigator.pushNamed(context, '/favorite');
      break;
    case 3:
      Navigator.pushNamed(context, '/profile');
      break;
  }
},
```

## Date Formatting

The screen uses `intl` package for date formatting:
- Format: `dd/MM/yyyy` (e.g., "21/11/2025 - 22/11/2025")

## Dependencies Used

- `flutter/material.dart` - UI framework
- `provider` - State management
- `intl` - Date formatting (already in pubspec.yaml)

## Key Components

### 1. DertamTripScreen (StatefulWidget)
Main screen with TabController for managing Upcoming/Past tabs.

### 2. TripCard (StatelessWidget)  
Reusable card component for displaying individual trip information.

### 3. Helper Methods
- `_filterUpcomingTrips()` - Filters and sorts upcoming trips
- `_filterPastTrips()` - Filters and sorts past trips
- `_getTripStatus()` - Determines current status of a trip
- `_getStatusColor()` - Returns color for status badge
- `_getDaysLeft()` - Calculates days remaining
- `_getDaysEnded()` - Calculates days since completion

## Testing Recommendations

1. Test with no trips (empty state)
2. Test with only upcoming trips
3. Test with only past trips
4. Test with both upcoming and past trips
5. Test with ongoing trips
6. Test pull-to-refresh functionality
7. Test error states
8. Test date edge cases (trips starting/ending today)

## Future Enhancements

Consider adding:
- Trip search functionality
- Filter by trip name or date range
- Swipe to delete trips
- Edit trip functionality
- Share trip with friends
- Trip statistics (total trips, favorite destinations)
- Different images per trip (from API or user upload)
- Animations for tab transitions
- Shimmer loading effect instead of spinner

---

**Implementation Status**: ✅ Complete and ready to use!
