# Bus Seat Selection Screen Implementation

## Overview
I've successfully implemented the bus seat selection screen based on your Figma design. The screen allows users to select seats when booking a bus ticket.

## What Was Implemented

### 1. **DertamSelectSeat Widget** (`dertam_select_seat.dart`)
A complete seat selection screen with the following features:

#### Features:
- ✅ **Header Section**: Back button, user avatar, and greeting
- ✅ **Trip Information Card**: Displays route (from/to), swap icon, and travel date
- ✅ **Bus Details Card**: Shows bus name, type, timing, duration, price, and available seats
- ✅ **Interactive Seat Layout**: 
  - 4 columns (A, B, C, D) representing seat positions
  - 6 rows representing 24 seats per deck
  - Visual aisle spacing between columns B and C
  - Steering wheel icon at the top
  - "LOWER DECK" label
- ✅ **Seat States**:
  - **Booked** (Dark Blue #01015B): Cannot be selected
  - **Your Seat** (Orange #F5A522): Currently selected by user
  - **Available** (Gray #DAD9DB): Can be selected
- ✅ **Legend Section**: Shows color coding for seat states
- ✅ **Deck Selector**: Toggle between LOWER and UPPER decks
- ✅ **Bottom Booking Panel**:
  - Shows selected seat numbers
  - Displays total fare calculation
  - "Booked" button to confirm booking

#### Props:
```dart
DertamSelectSeat({
  required String fromLocation,      // e.g., "Kelaniya"
  required String toLocation,        // e.g., "Colombo"
  required String date,              // e.g., "08th - Dec - 2024 | Sunday"
  required String busName,           // e.g., "Perera Travels"
  required String busType,           // e.g., "A/C Sleeper (2+2)"
  required String departureTime,     // e.g., "9:00 AM"
  required String arrivalTime,       // e.g., "9:45 AM"
  required String duration,          // e.g., "45 Min"
  required int pricePerSeat,         // e.g., 200
  required int seatsLeft,            // e.g., 15
})
```

### 2. **Updated DertamBusesCard** (`dertam_buses_card.dart`)
Enhanced the bus card to be interactive:
- Added tap functionality to navigate to seat selection
- Added optional parameters for route and date information
- Automatically extracts price value for calculation

### 3. **Updated DertamAvailableBusesScreen** (`dertam_available_buses.dart`)
Updated to pass location and date data to bus cards so they can navigate properly.

## How It Works

### Navigation Flow:
```
Bus Booking Screen 
  → Available Buses Screen 
    → [Tap Bus Card] 
      → Seat Selection Screen 
        → [Select Seats & Book]
          → Booking Confirmation
```

### User Interaction:
1. User sees available buses on the "Available Buses" screen
2. User taps on a bus card
3. Seat selection screen opens with:
   - All trip details pre-filled
   - Interactive seat map
4. User can:
   - Tap available (gray) seats to select them (turns orange)
   - Tap selected (orange) seats to deselect them (turns gray)
   - Cannot tap booked (blue) seats
   - Switch between LOWER and UPPER decks
5. Selected seats and total fare update automatically
6. User taps "Booked" button to confirm

## Seat Layout Configuration

The current implementation includes sample seat data:

```dart
// Lower deck: 6 rows × 4 columns = 24 seats
// 0 = available, 1 = booked, 2 = selected (your seat)
final List<List<int>> lowerDeckSeats = [
  [1, 0, 0, 0], // Row 1: A1 booked
  [0, 0, 0, 1], // Row 2: D2 booked
  [0, 0, 2, 2], // Row 3: C3, D3 pre-selected
  [1, 1, 0, 0], // Row 4: A4, B4 booked
  [0, 0, 0, 1], // Row 5: D5 booked
  [0, 0, 0, 0], // Row 6: All available
];
```

### To Customize Seat Layout:
You'll need to replace the hardcoded seat data with dynamic data from your backend API. The seat status codes are:
- `0` = Available
- `1` = Booked
- `2` = Selected (by current user)

## Design System Compliance

The implementation follows your existing design system:

### Colors:
- Primary Dark: `#01015B`
- Orange/Yellow: `#F5A522`
- Gray: `#DAD9DB`, `#A0A0A0`, `#585656`, `#757575`
- White: `#FFFFFF`
- Black: `#020202`

### Typography:
- Uses `DertamTextStyles` from your theme
- Font family: Inter
- Font weights: Regular (400), Medium (500), Semi-Bold (600), Bold (700)

### Spacing & Borders:
- Border radius: 5px (seats), 10-16px (cards)
- Consistent padding and margins
- Uses `DertamSpacings` constants

## Testing the Implementation

### Option 1: Direct Navigation
Navigate directly to the screen for testing:

```dart
Navigator.push(
  context,
  MaterialPageRoute(
    builder: (context) => DertamSelectSeat(
      fromLocation: 'Kelaniya',
      toLocation: 'Colombo',
      date: '08th - Dec - 2024 | Sunday',
      busName: 'Perera Travels',
      busType: 'A/C Sleeper (2+2)',
      departureTime: '9:00 AM',
      arrivalTime: '9:45 AM',
      duration: '45 Min',
      pricePerSeat: 200,
      seatsLeft: 15,
    ),
  ),
);
```

### Option 2: Through Bus Selection
Just tap any bus card in the "Available Buses" screen - it will automatically navigate with the correct data.

## Future Enhancements

To make this production-ready, consider:

1. **Backend Integration**:
   - Fetch seat availability from API
   - Real-time seat updates (WebSocket)
   - Prevent double-booking with seat locking

2. **Additional Features**:
   - Seat preferences (window, aisle)
   - Gender-based seat allocation
   - Seat pricing tiers (premium seats)
   - Seat hold timer (countdown)

3. **Validations**:
   - Minimum/maximum seat selection limits
   - Adjacent seat suggestions for groups
   - Accessibility seat indicators

4. **User Experience**:
   - Loading states while fetching seats
   - Error handling for booking failures
   - Success confirmation with booking details
   - Share booking details

## Files Modified/Created

1. ✅ `lib/ui/screen/bus_booking/widget/dertam_select_seat.dart` - **Created**
2. ✅ `lib/ui/screen/bus_booking/widget/select_seat_example.dart` - **Created** (example usage)
3. ✅ `lib/ui/screen/bus_booking/widget/dertam_buses_card.dart` - **Updated** (added navigation)
4. ✅ `lib/ui/screen/bus_booking/widget/dertam_available_buses.dart` - **Updated** (passed route data)

## Design Fidelity

The implementation closely matches the Figma design:
- ✅ Header layout with back button and user info
- ✅ Trip information card styling
- ✅ Bus details card format
- ✅ Seat grid layout (4 columns, 6 rows)
- ✅ Color coding (booked, selected, available)
- ✅ Legend with color indicators
- ✅ Deck selector buttons
- ✅ Bottom panel with seat summary and booking button
- ✅ Proper spacing and alignment
- ✅ Matching colors and typography

## Notes

- The steering wheel icon uses a placeholder from the web. You can replace it with a local asset.
- User avatar uses a sample image. Replace with actual user data.
- The "Booked" button currently shows a SnackBar. Implement your booking logic there.
- Deck switching is functional but both decks use similar test data. Update with real data.

Enjoy your new seat selection feature! 🎉
