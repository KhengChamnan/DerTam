/// Enum representing different bus types with their seat configurations
enum BusType { miniVan, sleepingBus, regularBus }

/// Configuration class for different bus seat layouts
class SeatLayoutConfig {
  /// Number of columns on the left side of the aisle
  final int leftColumns;

  /// Number of columns on the right side of the aisle
  final int rightColumns;

  /// Total number of seats for this bus type
  final int totalSeats;

  /// Whether this bus has multiple decks (like sleeping bus)
  final bool hasMultipleDecks;

  /// Description of the bus layout
  final String description;

  const SeatLayoutConfig({
    required this.leftColumns,
    required this.rightColumns,
    required this.totalSeats,
    this.hasMultipleDecks = false,
    this.description = '',
  });

  /// Total columns per row (excluding aisle)
  int get seatsPerRow => leftColumns + rightColumns;

  /// Get the layout configuration based on bus type string
  static SeatLayoutConfig fromBusType(String? busType) {
    if (busType == null || busType.isEmpty) {
      return regularBus; // Default to regular bus
    }

    final lowerType = busType.toLowerCase();

    if (lowerType.contains('mini') || lowerType.contains('van')) {
      return miniVan;
    } else if (lowerType.contains('sleep') || lowerType.contains('sleeper')) {
      return sleepingBus;
    } else if (lowerType.contains('regular') ||
        lowerType.contains('standard')) {
      return regularBus;
    }

    // Try to infer from seat count in the type string
    final seatMatch = RegExp(r'(\d+)').firstMatch(busType);
    if (seatMatch != null) {
      final seatCount = int.tryParse(seatMatch.group(1) ?? '');
      if (seatCount != null) {
        if (seatCount <= 15) return miniVan;
        if (seatCount <= 34) return sleepingBus;
      }
    }

    return regularBus;
  }

  /// Get layout config based on actual seat count
  static SeatLayoutConfig fromSeatCount(int seatCount) {
    if (seatCount <= 15) {
      return miniVan;
    } else if (seatCount <= 34) {
      return sleepingBus;
    } else {
      return regularBus;
    }
  }

  /// Get layout config from both bus type and seat count for better accuracy
  static SeatLayoutConfig fromTypeAndCount(String? busType, int seatCount) {
    // First try to match by bus type name
    if (busType != null && busType.isNotEmpty) {
      final config = fromBusType(busType);
      // Validate if the config matches the seat count approximately
      if ((config.totalSeats - seatCount).abs() <= 5) {
        return config;
      }
    }
    // Fall back to seat count based detection
    return fromSeatCount(seatCount);
  }

  // Predefined configurations

  /// Mini Van: 15 seats, 3 columns (2 left + 1 right)
  /// Layout: [1][2]  [3]
  ///         [4][5]  [6]
  ///         ... etc
  static const SeatLayoutConfig miniVan = SeatLayoutConfig(
    leftColumns: 2,
    rightColumns: 1,
    totalSeats: 15,
    hasMultipleDecks: false,
    description: 'Compact van layout',
  );

  /// Sleeping Bus: 34 seats, 3 columns (2 left + 1 right), 2 decks
  /// Each deck has seats in format: [1][2]  [3]
  static const SeatLayoutConfig sleepingBus = SeatLayoutConfig(
    leftColumns: 2,
    rightColumns: 1,
    totalSeats: 34,
    hasMultipleDecks: true,
    description: 'Double-decker sleeping berths',
  );

  /// Regular Bus: 45 seats, 4 columns (2 left + 2 right)
  /// Layout: [1][2]  [3][4]
  ///         [5][6]  [7][8]
  ///         ... etc
  static const SeatLayoutConfig regularBus = SeatLayoutConfig(
    leftColumns: 2,
    rightColumns: 2,
    totalSeats: 45,
    hasMultipleDecks: false,
    description: 'Standard bus layout',
  );
}
