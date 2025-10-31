import 'package:flutter/material.dart';
import 'package:mobile_frontend/ui/screen/bus_booking/widget/dertam_booking_checkout.dart';
import 'package:mobile_frontend/ui/screen/bus_booking/widget/dertam_seat_label_widget.dart';
import 'package:mobile_frontend/ui/theme/dertam_apptheme.dart';
import 'package:mobile_frontend/ui/widgets/actions/dertam_button.dart';

class DertamSelectSeat extends StatefulWidget {
  final String fromLocation;
  final String toLocation;
  final String date;
  final String busName;
  final String busType;
  final String departureTime;
  final String arrivalTime;
  final String duration;
  final int pricePerSeat;
  final int seatsLeft;

  const DertamSelectSeat({
    super.key,
    required this.fromLocation,
    required this.toLocation,
    required this.date,
    required this.busName,
    required this.busType,
    required this.departureTime,
    required this.arrivalTime,
    required this.duration,
    required this.pricePerSeat,
    required this.seatsLeft,
  });

  @override
  State<DertamSelectSeat> createState() => _DertamSelectSeatState();
}

class _DertamSelectSeatState extends State<DertamSelectSeat> {
  // Track selected deck (true = lower, false = upper)
  bool isLowerDeck = true;

  // Track selected seats (seat number as key, true if selected)
  Set<int> selectedSeats = {};

  // Lower deck seat configuration (4 seats per row, 6 rows = 24 seats)
  // 0 = available, 1 = booked, 2 = selected
  final List<List<int>> lowerDeckSeats = [
    [1, 0, 0, 0], // Row 1: A1 booked
    [0, 0, 0, 1], // Row 2: D2 booked
    [0, 0, 2, 2], // Row 3: C3, D3 your seat (selected)
    [1, 1, 0, 0], // Row 4: A4, B4 booked
    [0, 0, 0, 1], // Row 5: D5 booked
    [0, 0, 0, 0], // Row 6: All available
  ];

  // Upper deck seat configuration (example)
  final List<List<int>> upperDeckSeats = [
    [0, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ];

  void _toggleSeat(int row, int col) {
    setState(() {
      int seatNumber = row * 4 + col + 1;
      List<List<int>> currentDeck = isLowerDeck
          ? lowerDeckSeats
          : upperDeckSeats;

      // Only toggle if seat is available (0) or already selected (2)
      if (currentDeck[row][col] == 0) {
        currentDeck[row][col] = 2;
        selectedSeats.add(seatNumber);
      } else if (currentDeck[row][col] == 2) {
        currentDeck[row][col] = 0;
        selectedSeats.remove(seatNumber);
      }
    });
  }

  Color _getSeatColor(int status) {
    switch (status) {
      case 1: // Booked
        return const Color(0xFF01015B);
      case 2: // Your seat (selected)
        return const Color(0xFFF5A522);
      default: // Available
        return const Color(0xFFDAD9DB);
    }
  }

  @override
  Widget build(BuildContext context) {
    List<List<int>> currentDeck = isLowerDeck ? lowerDeckSeats : upperDeckSeats;
    int totalFare = selectedSeats.length * widget.pricePerSeat;
    List<int> selectedSeatsList = selectedSeats.toList()..sort();
    String seatsDisplay = selectedSeatsList.isEmpty
        ? 'None'
        : selectedSeatsList.map((s) => s.toString()).join(', ');

    return Scaffold(
      backgroundColor: DertamColors.white,
      body: SafeArea(
        child: Column(
          children: [
            // Header
            Padding(
              padding: const EdgeInsets.fromLTRB(15, 20, 15, 0),
              child: Row(
                children: [
                  // Back button
                  GestureDetector(
                    onTap: () => Navigator.pop(context),
                    child: Container(
                      width: 28,
                      height: 28,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: Colors.transparent,
                      ),
                      child: Icon(
                        Icons.arrow_back_ios_new,
                        size: 18,
                        color: DertamColors.black,
                      ),
                    ),
                  ),

                  const SizedBox(width: 19),

                  // Avatar and greeting
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(9999),
                      image: const DecorationImage(
                        image: NetworkImage(
                          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
                        ),
                        fit: BoxFit.cover,
                      ),
                    ),
                  ),

                  const SizedBox(width: 12),

                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(
                            'Hello ',
                            style: DertamTextStyles.body.copyWith(
                              fontWeight: FontWeight.w600,
                              color: const Color(0xFF757575),
                              height: 1.4,
                            ),
                          ),
                          Text(
                            'Saduni Silva!',
                            style: DertamTextStyles.body.copyWith(
                              fontWeight: FontWeight.w400,
                              color: const Color(0xFF757575),
                              height: 1.4,
                            ),
                          ),
                        ],
                      ),
                      Text(
                        'Where you want go',
                        style: DertamTextStyles.body.copyWith(
                          color: const Color(0xFF192588),
                          height: 1.4,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 13),

            // Trip info card
            Container(
              margin: const EdgeInsets.symmetric(horizontal: 15),
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: DertamColors.primaryBlue,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                children: [
                  // Locations with swap icon
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        widget.fromLocation,
                        style: DertamTextStyles.subtitle.copyWith(
                          color: DertamColors.white,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      Container(
                        width: 54,
                        height: 54,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: Colors.black.withOpacity(0.3),
                        ),
                        child: Center(
                          child: Image.network(
                            'https://cdn-icons-png.flaticon.com/512/545/545682.png',
                            width: 28,
                            height: 28,
                            color: const Color(0xFFFFC107),
                          ),
                        ),
                      ),
                      Text(
                        widget.toLocation,
                        style: DertamTextStyles.subtitle.copyWith(
                          color: DertamColors.white,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 14),

                  // Date display
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 20,
                      vertical: 12,
                    ),
                    decoration: BoxDecoration(
                      border: Border.all(color: const Color(0xFFEEEEEE)),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Text(
                      widget.date,
                      style: DertamTextStyles.body.copyWith(
                        color: const Color(0xFFEEEEEE),
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 17),

            // Bus details card
            Container(
              margin: const EdgeInsets.symmetric(horizontal: 15),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFE0E0E0)),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.08),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            widget.busName,
                            style: DertamTextStyles.subtitle.copyWith(
                              fontSize: 18,
                              fontWeight: FontWeight.w400,
                              color: const Color(0xFF585656),
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            widget.busType,
                            style: DertamTextStyles.bodyMedium.copyWith(
                              fontWeight: FontWeight.w300,
                              color: const Color(0xFF616161),
                            ),
                          ),
                        ],
                      ),
                      Text(
                        'LKR ${widget.pricePerSeat}',
                        style: DertamTextStyles.title.copyWith(
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                          color: const Color(0xFFF5A522),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Text(
                        widget.departureTime,
                        style: DertamTextStyles.bodySmall.copyWith(
                          color: Colors.black,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        width: 10,
                        height: 2,
                        color: const Color(0xFF9E9E9E),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        widget.arrivalTime,
                        style: DertamTextStyles.bodySmall.copyWith(
                          color: const Color(0xFF616161),
                        ),
                      ),
                      const Spacer(),
                      Text(
                        widget.duration,
                        style: DertamTextStyles.bodyMedium.copyWith(
                          color: Colors.black,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    '${widget.seatsLeft} Seats left',
                    style: DertamTextStyles.bodyMedium.copyWith(
                      fontWeight: FontWeight.w300,
                      color: const Color(0xFF43A047),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),

            // Seat selection area
            Expanded(
              child: SingleChildScrollView(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 15),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Bus seat layout
                      Expanded(
                        flex: 3,
                        child: Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: const Color(0xFFE0E0E0),
                              width: 2,
                            ),
                          ),
                          child: Column(
                            children: [
                              // Steering wheel
                              Row(
                                mainAxisAlignment: MainAxisAlignment.end,
                                children: [
                                  Image.network(
                                    'https://cdn-icons-png.flaticon.com/512/3097/3097138.png',
                                    width: 40,
                                    height: 40,
                                    color: const Color(0xFF9E9E9E),
                                  ),
                                ],
                              ),

                              const SizedBox(height: 15),

                              // Column labels
                              Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceEvenly,
                                children: [
                                  DertamSeatLabelWidget(label: 'A'),
                                  DertamSeatLabelWidget(label: 'B'),
                                  const SizedBox(width: 40),
                                  DertamSeatLabelWidget(label: 'C'),
                                  DertamSeatLabelWidget(label: 'D'),
                                ],
                              ),

                              const SizedBox(height: 10),

                              // Seats grid
                              ...List.generate(6, (rowIndex) {
                                return Padding(
                                  padding: const EdgeInsets.only(bottom: 12),
                                  child: Row(
                                    mainAxisAlignment:
                                        MainAxisAlignment.spaceEvenly,
                                    children: [
                                      // Left side (A, B)
                                      _SeatWidget(
                                        row: rowIndex,
                                        col: 0,
                                        status: currentDeck[rowIndex][0],
                                        onTap: () => _toggleSeat(rowIndex, 0),
                                        getSeatColor: _getSeatColor,
                                      ),
                                      _SeatWidget(
                                        row: rowIndex,
                                        col: 1,
                                        status: currentDeck[rowIndex][1],
                                        onTap: () => _toggleSeat(rowIndex, 1),
                                        getSeatColor: _getSeatColor,
                                      ),
                                      const SizedBox(width: 40),
                                      // Right side (C, D)
                                      _SeatWidget(
                                        row: rowIndex,
                                        col: 2,
                                        status: currentDeck[rowIndex][2],
                                        onTap: () => _toggleSeat(rowIndex, 2),
                                        getSeatColor: _getSeatColor,
                                      ),
                                      _SeatWidget(
                                        row: rowIndex,
                                        col: 3,
                                        status: currentDeck[rowIndex][3],
                                        onTap: () => _toggleSeat(rowIndex, 3),
                                        getSeatColor: _getSeatColor,
                                      ),
                                    ],
                                  ),
                                );
                              }),

                              const SizedBox(height: 10),

                              // Lower deck label
                              RotatedBox(
                                quarterTurns: 3,
                                child: Text(
                                  'LOWER DECK',
                                  style: DertamTextStyles.bodyMedium.copyWith(
                                    fontSize: 15,
                                    fontWeight: FontWeight.bold,
                                    color: const Color(0xFFD9D9D9),
                                    letterSpacing: 1.5,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),

                      const SizedBox(width: 15),

                      // Legend and deck selector
                      Expanded(
                        flex: 2,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Legend items
                            _LegendItem(
                              color: DertamColors.primaryBlue,
                              label: 'Booked',
                            ),
                            const SizedBox(height: 12),
                            _LegendItem(
                              color: DertamColors.orange,
                              label: 'Your Seat',
                            ),
                            const SizedBox(height: 12),
                            _LegendItem(
                              color: DertamColors.white,
                              label: 'Available',
                            ),
                            const SizedBox(height: 20),
                            // Deck selector buttons
                            _DeckButton(
                              label: 'LOWER',
                              isLower: true,
                              isSelected: isLowerDeck,
                              onTap: () {
                                setState(() {
                                  isLowerDeck = true;
                                });
                              },
                            ),
                            const SizedBox(height: 10),
                            _DeckButton(
                              label: 'UPPER',
                              isLower: false,
                              isSelected: !isLowerDeck,
                              onTap: () {
                                setState(() {
                                  isLowerDeck = false;
                                });
                              },
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),

            // Bottom booking section
            Container(
              padding: const EdgeInsets.fromLTRB(15, 15, 15, 15),
              decoration: BoxDecoration(
                color: DertamColors.white,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.1),
                    blurRadius: 10,
                    offset: const Offset(0, -2),
                  ),
                ],
              ),
              child: Column(
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Selected Seats',
                              style: DertamTextStyles.bodyMedium.copyWith(
                                color: const Color(0xFF585656),
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              seatsDisplay,
                              style: DertamTextStyles.bodyMedium.copyWith(
                                fontWeight: FontWeight.bold,
                                color: DertamColors.black,
                              ),
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 15),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text(
                            'Total Fee',
                            style: DertamTextStyles.bodyMedium.copyWith(
                              color: const Color(0xFF585656),
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            '\$$totalFare',
                            style: DertamTextStyles.bodyMedium.copyWith(
                              fontWeight: FontWeight.bold,
                              color: DertamColors.black,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 15),
                  // Book button
                  DertamButton(
                    text: 'Booked',
                    onPressed: selectedSeats.isEmpty
                        ? () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text(
                                  'Please select at least one seat',
                                ),
                                backgroundColor: Colors.red,
                              ),
                            );
                          }
                        : () {
                            // Handle booking
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) => DertamBookingCheckout(
                                  fromLocation: widget.fromLocation,
                                  toLocation: widget.toLocation,
                                  busName: widget.busName,
                                  busType: widget.busType,
                                  departureTime: widget.departureTime,
                                  arrivalTime: widget.arrivalTime,
                                  selectedSeats: [widget.seatsLeft],
                                  pricePerSeat: widget.pricePerSeat,
                                ),
                              ),
                            );
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text(
                                  'Booking ${selectedSeats.length} seat(s)',
                                ),
                                backgroundColor: Colors.green,
                              ),
                            );
                          },
                    backgroundColor: DertamColors.primaryBlue,
                    height: 50,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SeatWidget extends StatelessWidget {
  final int row;
  final int col;
  final int status;
  final VoidCallback onTap;
  final Color Function(int) getSeatColor;

  const _SeatWidget({
    required this.row,
    required this.col,
    required this.status,
    required this.onTap,
    required this.getSeatColor,
  });

  @override
  Widget build(BuildContext context) {
    bool isClickable = status != 1; // Can't click booked seats

    return GestureDetector(
      onTap: isClickable ? onTap : null,
      child: Container(
        width: 31,
        height: 31,
        decoration: BoxDecoration(
          color: getSeatColor(status),
          borderRadius: BorderRadius.circular(5),
        ),
      ),
    );
  }
}

class _LegendItem extends StatelessWidget {
  final String label;
  final Color color;
  const _LegendItem({required this.label, required this.color});
  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 12,
          height: 12,
          decoration: BoxDecoration(
            color: color,
            borderRadius: BorderRadius.circular(5),
          ),
        ),
        const SizedBox(width: 8),
        Text(
          label,
          style: DertamTextStyles.bodyMedium.copyWith(
            color: DertamColors.neutralLight,
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }
}

class _DeckButton extends StatefulWidget {
  final String label;
  final bool isLower;
  final bool isSelected;
  final VoidCallback onTap;

  const _DeckButton({
    required this.label,
    required this.isLower,
    required this.isSelected,
    required this.onTap,
  });

  @override
  State<_DeckButton> createState() => _DeckButtonState();
}

class _DeckButtonState extends State<_DeckButton> {
  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: widget.onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 8),
        decoration: BoxDecoration(
          color: DertamColors.white,
          border: Border.all(
            color: widget.isSelected
                ? DertamColors.primaryBlue
                : DertamColors.neutralLight,
            width: 1,
          ),
          borderRadius: BorderRadius.circular(5),
        ),
        child: Center(
          child: Text(
            widget.label,
            style: DertamTextStyles.bodyMedium.copyWith(
              color: widget.isSelected
                  ? DertamColors.primaryBlue
                  : DertamColors.neutralLight,
              fontWeight: FontWeight.w500,
            ),
          ),
        ),
      ),
    );
  }
}
