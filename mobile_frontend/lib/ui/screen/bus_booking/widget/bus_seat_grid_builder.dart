import 'package:flutter/material.dart';
import 'package:mobile_frontend/models/bus/bus_seat.dart';
import 'package:mobile_frontend/models/bus/seat_layout_config.dart';


class BusSeatGridBuilder extends StatelessWidget {
  final List<BusSeat> seats;
  final Set<int> selectedSeatIds;
  final void Function(BusSeat seat)? onSeatTap;
  final String? busType;
  final SeatLayoutConfig? customConfig;
  final double seatSize;
  final double seatSpacing;
  final double aisleWidth;

  /// Vertical spacing between rows
  final double rowSpacing;

  const BusSeatGridBuilder({
    super.key,
    required this.seats,
    required this.selectedSeatIds,
    this.onSeatTap,
    this.busType,
    this.customConfig,
    this.seatSize = 40.0,
    this.seatSpacing = 8.0,
    this.aisleWidth = 40.0,
    this.rowSpacing = 12.0,
  });

  /// Get seat color based on status and selection
  Color _getSeatColor(String? status, int? seatId) {
    // Check if this seat is selected by user
    if (selectedSeatIds.contains(seatId)) {
      return const Color(0xFFF5A522); 
    }
    switch (status?.toLowerCase()) {
      case 'booked':
      case 'reserved':
        return const Color(0xFF01015B); 
      
      default: // Available
        return const Color(0xFFDAEAFE); 
    }
  }

  /// Check if seat is available for selection
  bool _isSeatAvailable(String? status) {
    final lowerStatus = status?.toLowerCase();
    return lowerStatus == 'available' || lowerStatus == null;
  }

  /// Build a single seat widget
  Widget _buildSeat(BusSeat seat) {
    final isAvailable = _isSeatAvailable(seat.status);
    final isSelected = selectedSeatIds.contains(seat.id);

    return GestureDetector(
      onTap: isAvailable && onSeatTap != null ? () => onSeatTap!(seat) : null,
      child: Container(
        width: seatSize,
        height: seatSize,
        decoration: BoxDecoration(
          color: _getSeatColor(seat.status, seat.id),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: isSelected ? const Color(0xFFF5A522) : Colors.transparent,
            width: 2,
          ),
        ),
        child: Center(
          child: Text(
            seat.seatNumber ?? '',
            style: TextStyle(
              fontSize: seatSize * 0.35,
              color: isSelected || !isAvailable ? Colors.white : Colors.black87,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
      ),
    );
  }

  /// Build an empty placeholder for missing seats
  Widget _buildEmptySeat() {
    return SizedBox(width: seatSize, height: seatSize);
  }

  /// Build a row of seats based on the layout configuration
  Widget _buildSeatRow(
    List<BusSeat?> rowSeats,
    SeatLayoutConfig config, {
    bool isLastRow = false,
    bool isFirstRow = false,
    bool isMiniVan = false,
    bool isSleepingBus = false,
  }) {
    // Special handling for Regular Bus last row (5 seats: 2-1-2 layout)
    if (isLastRow &&
        config == SeatLayoutConfig.regularBus &&
        rowSeats.length == 5) {
      return _buildLastRowRegularBus(rowSeats);
    }

    // Special handling for Sleeping Bus
    if (isSleepingBus) {
      // Last row with 4 seats (upper deck back row)
      if (isLastRow && rowSeats.length == 4) {
        return _buildSleepingBusLastRow4Seats(rowSeats);
      }
      // Last row with 3 seats (lower deck back row - no aisle)
      if (isLastRow && rowSeats.length == 3) {
        return _buildSleepingBusLastRow3Seats(rowSeats);
      }
      // Regular 3-seat rows (2+1 layout with aisle)
      if (rowSeats.length == 3) {
        return _buildSleepingBusRow(rowSeats);
      }
    }

    // Special handling for Mini Van
    if (isMiniVan) {
      // Row 1: 2 seats on right only
      if (isFirstRow && rowSeats.length == 2) {
        return _buildMiniVanRow1(rowSeats);
      }
      // Row 2: 3 seats on left side
      if (rowSeats.length == 3 && rowSeats[0]?.seatNumber == '3') {
        return _buildMiniVanRow2(rowSeats);
      }
      // Rows 3-4: 2 left + 1 right
      if (rowSeats.length == 3) {
        return _buildMiniVanMiddleRow(rowSeats);
      }
      // Last row: 4 seats across
      if (isLastRow && rowSeats.length == 4) {
        return _buildMiniVanLastRow(rowSeats);
      }
    }

    final leftSeats = <Widget>[];
    final rightSeats = <Widget>[];

    // Build left side seats
    for (int i = 0; i < config.leftColumns; i++) {
      if (i < rowSeats.length && rowSeats[i] != null) {
        leftSeats.add(_buildSeat(rowSeats[i]!));
      } else {
        leftSeats.add(_buildEmptySeat());
      }
      if (i < config.leftColumns - 1) {
        leftSeats.add(SizedBox(width: seatSpacing));
      }
    }

    // Build right side seats
    for (int i = config.leftColumns; i < config.seatsPerRow; i++) {
      if (i < rowSeats.length && rowSeats[i] != null) {
        rightSeats.add(_buildSeat(rowSeats[i]!));
      } else {
        rightSeats.add(_buildEmptySeat());
      }
      if (i < config.seatsPerRow - 1) {
        rightSeats.add(SizedBox(width: seatSpacing));
      }
    }

    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        // Left side seats
        Row(children: leftSeats),
        // Aisle
        SizedBox(width: aisleWidth),
        // Right side seats
        Row(children: rightSeats),
      ],
    );
  }

  /// Row 1: 2 seats on right side only
  /// Layout:              [1][2]   <- aligned with last 2 columns (14-15 positions)
  Widget _buildMiniVanRow1(List<BusSeat?> rowSeats) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        // Empty columns 1 and 2 (positions 12-13)
        _buildEmptySeat(),
        SizedBox(width: seatSpacing),
        _buildEmptySeat(),
        SizedBox(width: seatSpacing),
        // Seats 1-2 at columns 3-4 (positions 14-15)
        if (rowSeats.isNotEmpty && rowSeats[0] != null)
          _buildSeat(rowSeats[0]!)
        else
          _buildEmptySeat(),
        SizedBox(width: seatSpacing),
        if (rowSeats.length > 1 && rowSeats[1] != null)
          _buildSeat(rowSeats[1]!)
        else
          _buildEmptySeat(),
      ],
    );
  }

  /// Row 2: 3 seats on left side only
  /// Layout: [3][4][5]            <- aligned with first 3 columns (12-14 positions)
  Widget _buildMiniVanRow2(List<BusSeat?> rowSeats) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        // 3 seats at columns 1-3 (positions 12-14)
        if (rowSeats.isNotEmpty && rowSeats[0] != null)
          _buildSeat(rowSeats[0]!)
        else
          _buildEmptySeat(),
        SizedBox(width: seatSpacing),
        if (rowSeats.length > 1 && rowSeats[1] != null)
          _buildSeat(rowSeats[1]!)
        else
          _buildEmptySeat(),
        SizedBox(width: seatSpacing),
        if (rowSeats.length > 2 && rowSeats[2] != null)
          _buildSeat(rowSeats[2]!)
        else
          _buildEmptySeat(),
        SizedBox(width: seatSpacing),
        // Empty column 4 (position 15)
        _buildEmptySeat(),
      ],
    );
  }

  /// Rows 3-4: 2 seats left + 1 seat right
  /// Layout: [6][7]       [8]     <- columns 1-2 and column 4
  Widget _buildMiniVanMiddleRow(List<BusSeat?> rowSeats) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        // 2 seats at columns 1-2
        if (rowSeats.isNotEmpty && rowSeats[0] != null)
          _buildSeat(rowSeats[0]!)
        else
          _buildEmptySeat(),
        SizedBox(width: seatSpacing),
        if (rowSeats.length > 1 && rowSeats[1] != null)
          _buildSeat(rowSeats[1]!)
        else
          _buildEmptySeat(),
        // Aisle/gap at column 3
        SizedBox(width: seatSpacing),
        _buildEmptySeat(),
        SizedBox(width: seatSpacing),
        // 1 seat at column 4
        if (rowSeats.length > 2 && rowSeats[2] != null)
          _buildSeat(rowSeats[2]!)
        else
          _buildEmptySeat(),
      ],
    );
  }

  /// Last row: 4 seats across
  /// Layout: [12][13][14][15]     <- all 4 columns
  Widget _buildMiniVanLastRow(List<BusSeat?> rowSeats) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        // 4 seats at columns 1-4
        if (rowSeats.isNotEmpty && rowSeats[0] != null)
          _buildSeat(rowSeats[0]!)
        else
          _buildEmptySeat(),
        SizedBox(width: seatSpacing),
        if (rowSeats.length > 1 && rowSeats[1] != null)
          _buildSeat(rowSeats[1]!)
        else
          _buildEmptySeat(),
        SizedBox(width: seatSpacing),
        if (rowSeats.length > 2 && rowSeats[2] != null)
          _buildSeat(rowSeats[2]!)
        else
          _buildEmptySeat(),
        SizedBox(width: seatSpacing),
        if (rowSeats.length > 3 && rowSeats[3] != null)
          _buildSeat(rowSeats[3]!)
        else
          _buildEmptySeat(),
      ],
    );
  }

  /// Build special last row for Regular Bus with 5 seats
  /// Layout: [1][2]  [3]  [4][5]
  /// Where seat 3 is centered in the middle (aisle area)
  /// Left 2 seats align with normal rows, right 2 seats align with normal rows
  Widget _buildLastRowRegularBus(List<BusSeat?> rowSeats) {
    // Use a small gap between seats for the 5-seat last row
    // This ensures all 5 seats fit without overflow
    final smallGap = seatSpacing;

    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        // Left 2 seats (aligned with columns 1-2 of normal rows)
        if (rowSeats.isNotEmpty && rowSeats[0] != null)
          _buildSeat(rowSeats[0]!)
        else
          _buildEmptySeat(),
        SizedBox(width: seatSpacing),
        if (rowSeats.length > 1 && rowSeats[1] != null)
          _buildSeat(rowSeats[1]!)
        else
          _buildEmptySeat(),
        // Gap before middle seat
        SizedBox(width: smallGap),
        // Middle seat (seat 3) - centered in aisle
        if (rowSeats.length > 2 && rowSeats[2] != null)
          _buildSeat(rowSeats[2]!)
        else
          _buildEmptySeat(),
        // Gap after middle seat
        SizedBox(width: smallGap),
        // Right 2 seats (aligned with columns 3-4 of normal rows)
        if (rowSeats.length > 3 && rowSeats[3] != null)
          _buildSeat(rowSeats[3]!)
        else
          _buildEmptySeat(),
        SizedBox(width: seatSpacing),
        if (rowSeats.length > 4 && rowSeats[4] != null)
          _buildSeat(rowSeats[4]!)
        else
          _buildEmptySeat(),
      ],
    );
  }

  /// Build a regular row for Sleeping Bus with 3 seats (2+1 layout)
  /// Layout: [1][2]    [3]
  Widget _buildSleepingBusRow(List<BusSeat?> rowSeats) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        // Left 2 seats
        if (rowSeats.isNotEmpty && rowSeats[0] != null)
          _buildSeat(rowSeats[0]!)
        else
          _buildEmptySeat(),
        SizedBox(width: seatSpacing),
        if (rowSeats.length > 1 && rowSeats[1] != null)
          _buildSeat(rowSeats[1]!)
        else
          _buildEmptySeat(),
        // Aisle
        SizedBox(width: aisleWidth),
        // Right 1 seat
        if (rowSeats.length > 2 && rowSeats[2] != null)
          _buildSeat(rowSeats[2]!)
        else
          _buildEmptySeat(),
      ],
    );
  }

  /// Build the last row for Sleeping Bus Lower Deck with 3 seats (no aisle)
  /// Layout: [13][14][15]
  Widget _buildSleepingBusLastRow3Seats(List<BusSeat?> rowSeats) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        // 3 seats across (no aisle in last row)
        if (rowSeats.isNotEmpty && rowSeats[0] != null)
          _buildSeat(rowSeats[0]!)
        else
          _buildEmptySeat(),
        SizedBox(width: seatSpacing),
        if (rowSeats.length > 1 && rowSeats[1] != null)
          _buildSeat(rowSeats[1]!)
        else
          _buildEmptySeat(),
        SizedBox(width: seatSpacing),
        if (rowSeats.length > 2 && rowSeats[2] != null)
          _buildSeat(rowSeats[2]!)
        else
          _buildEmptySeat(),
      ],
    );
  }

  Widget _buildSleepingBusLastRow4Seats(List<BusSeat?> rowSeats) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        // 4 seats across (no aisle in last row)
        if (rowSeats.isNotEmpty && rowSeats[0] != null)
          _buildSeat(rowSeats[0]!)
        else
          _buildEmptySeat(),
        SizedBox(width: seatSpacing),
        if (rowSeats.length > 1 && rowSeats[1] != null)
          _buildSeat(rowSeats[1]!)
        else
          _buildEmptySeat(),
        SizedBox(width: seatSpacing),
        if (rowSeats.length > 2 && rowSeats[2] != null)
          _buildSeat(rowSeats[2]!)
        else
          _buildEmptySeat(),
        SizedBox(width: seatSpacing),
        if (rowSeats.length > 3 && rowSeats[3] != null)
          _buildSeat(rowSeats[3]!)
        else
          _buildEmptySeat(),
      ],
    );
  }

  /// Check if the bus type string indicates a Mini Van
  bool _isMiniVanType(String? busType) {
    if (busType == null || busType.isEmpty) return false;
    final lowerType = busType.toLowerCase();
    return lowerType.contains('mini') || lowerType.contains('van');
  }

  /// Check if the bus type string indicates a Sleeping Bus
  bool _isSleepingBusType(String? busType) {
    if (busType == null || busType.isEmpty) return false;
    final lowerType = busType.toLowerCase();
    return lowerType.contains('sleep') || lowerType.contains('sleeper');
  }

  /// Organize seats into rows based on the layout configuration
  List<List<BusSeat?>> _organizeSeatsIntoRows(
    List<BusSeat> seats,
    SeatLayoutConfig config,
    String? busType,
  ) {
    final rows = <List<BusSeat?>>[];
    if (seats.length == 15 && _isMiniVanType(busType)) {
      // Row 1: seats 1-2 (2 seats on right)
      rows.add([seats[0], seats[1]]);
      rows.add([seats[2], seats[3], seats[4]]);
      rows.add([seats[5], seats[6], seats[7]]);
      rows.add([seats[8], seats[9], seats[10]]);
      rows.add([seats[11], seats[12], seats[13], seats[14]]);
      return rows;
    }

    // Special handling for Sleeping Bus Lower Deck (15 seats)
    // Layout based on image reference:
    // Rows 1-4: 3 seats each in 2+1 layout (2 left + 1 right with aisle)
    // Row 5 (last): 3 seats across (no aisle, continuous)
    // Apply Sleeping Bus layout if bus type indicates sleeping bus OR if it's 15 seats and NOT a mini van
    if (seats.length == 15 &&
        (_isSleepingBusType(busType) && !_isMiniVanType(busType))) {
      // Rows 1-4: 3 seats each in 2+1 layout
      // Row 1: seats 1, 2, 3 (indices 0, 1, 2)
      rows.add([seats[0], seats[1], seats[2]]);
      // Row 2: seats 4, 5, 6 (indices 3, 4, 5)
      rows.add([seats[3], seats[4], seats[5]]);
      // Row 3: seats 7, 8, 9 (indices 6, 7, 8)
      rows.add([seats[6], seats[7], seats[8]]);
      // Row 4: seats 10, 11, 12 (indices 9, 10, 11)
      rows.add([seats[9], seats[10], seats[11]]);
      rows.add([seats[12], seats[13], seats[14]]);

      return rows;
    }
    // Special handling for Sleeping Bus Upper Deck (19 seats)
    // 5 rows of 3 seats (2+1 layout) + 1 last row of 4 seats
    if (config == SeatLayoutConfig.sleepingBus && seats.length == 19) {
      // First 5 rows with 3 seats each (2+1 layout)
      for (int rowIndex = 0; rowIndex < 5; rowIndex++) {
        final rowSeats = <BusSeat?>[];
        for (int colIndex = 0; colIndex < 3; colIndex++) {
          final seatIndex = rowIndex * 3 + colIndex;
          if (seatIndex < seats.length) {
            rowSeats.add(seats[seatIndex]);
          }
        }
        rows.add(rowSeats);
      }
      // Last row with 4 seats (seats 16-19 of upper deck, indices 15-18)
      final lastRowSeats = <BusSeat?>[];
      for (int i = 15; i < 19 && i < seats.length; i++) {
        lastRowSeats.add(seats[i]);
      }
      rows.add(lastRowSeats);
      return rows;
    }

    // Special handling for Regular Bus (45 seats: 10 rows of 4 + 1 row of 5)
    if (config == SeatLayoutConfig.regularBus && seats.length == 45) {
      // First 10 rows with 4 seats each
      for (int rowIndex = 0; rowIndex < 10; rowIndex++) {
        final rowSeats = <BusSeat?>[];
        for (int colIndex = 0; colIndex < 4; colIndex++) {
          final seatIndex = rowIndex * 4 + colIndex;
          if (seatIndex < seats.length) {
            rowSeats.add(seats[seatIndex]);
          }
        }
        rows.add(rowSeats);
      }
      // Last row with 5 seats (41-45)
      final lastRowSeats = <BusSeat?>[];
      for (int i = 40; i < 45 && i < seats.length; i++) {
        lastRowSeats.add(seats[i]);
      }
      rows.add(lastRowSeats);
      return rows;
    }

    // Default organization for other bus types
    final seatsPerRow = config.seatsPerRow;
    final totalRows = (seats.length / seatsPerRow).ceil();

    for (int rowIndex = 0; rowIndex < totalRows; rowIndex++) {
      final rowSeats = <BusSeat?>[];
      for (int colIndex = 0; colIndex < seatsPerRow; colIndex++) {
        final seatIndex = rowIndex * seatsPerRow + colIndex;
        if (seatIndex < seats.length) {
          rowSeats.add(seats[seatIndex]);
        } else {
          rowSeats.add(null);
        }
      }
      rows.add(rowSeats);
    }

    return rows;
  }

  @override
  Widget build(BuildContext context) {
    if (seats.isEmpty) {
      return const Center(
        child: Padding(
          padding: EdgeInsets.all(20),
          child: Text(
            'No seats available',
            style: TextStyle(color: Colors.grey, fontSize: 14),
          ),
        ),
      );
    }

    // Determine the layout configuration
    final config =
        customConfig ??
        SeatLayoutConfig.fromTypeAndCount(busType, seats.length);

    // Check if this is a Mini Van or Sleeping Bus
    final isMiniVan = config == SeatLayoutConfig.miniVan;
    final isSleepingBus = config == SeatLayoutConfig.sleepingBus;

    // Organize seats into rows
    final rows = _organizeSeatsIntoRows(seats, config, busType);
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        for (int i = 0; i < rows.length; i++) ...[
          _buildSeatRow(
            rows[i],
            config,
            isLastRow: i == rows.length - 1,
            isFirstRow: i == 0,
            isMiniVan: isMiniVan,
            isSleepingBus: isSleepingBus,
          ),
          if (i < rows.length - 1) SizedBox(height: rowSpacing),
        ],
      ],
    );
  }
}

/// A widget that displays column labels above the seat grid
class SeatColumnLabels extends StatelessWidget {
  final SeatLayoutConfig config;
  final List<String>? customLabels;
  final double seatSize;
  final double seatSpacing;
  final double aisleWidth;
  final TextStyle? labelStyle;

  const SeatColumnLabels({
    super.key,
    required this.config,
    this.customLabels,
    this.seatSize = 40.0,
    this.seatSpacing = 8.0,
    this.aisleWidth = 40.0,
    this.labelStyle,
  });

  Widget _buildLabel(String label) {
    return SizedBox(
      width: seatSize,
      child: Center(
        child: Text(
          label,
          style:
              labelStyle ??
              const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w500,
                color: Colors.grey,
              ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    // Generate default labels if not provided
    final labels =
        customLabels ??
        List.generate(config.seatsPerRow, (i) => String.fromCharCode(65 + i));

    final leftLabels = <Widget>[];
    final rightLabels = <Widget>[];

    // Build left side labels
    for (int i = 0; i < config.leftColumns && i < labels.length; i++) {
      leftLabels.add(_buildLabel(labels[i]));
      if (i < config.leftColumns - 1) {
        leftLabels.add(SizedBox(width: seatSpacing));
      }
    }

    // Build right side labels
    for (
      int i = config.leftColumns;
      i < config.seatsPerRow && i < labels.length;
      i++
    ) {
      rightLabels.add(_buildLabel(labels[i]));
      if (i < config.seatsPerRow - 1) {
        rightLabels.add(SizedBox(width: seatSpacing));
      }
    }

    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Row(children: leftLabels),
        SizedBox(width: aisleWidth),
        Row(children: rightLabels),
      ],
    );
  }
}
