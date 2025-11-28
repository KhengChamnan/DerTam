import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:mobile_frontend/models/bus/bus_detail_response.dart';
import 'package:mobile_frontend/models/bus/bus_seat.dart';
import 'package:mobile_frontend/ui/providers/auth_provider.dart';
import 'package:mobile_frontend/ui/providers/bus_booking_provider.dart';
import 'package:mobile_frontend/ui/screen/bus_booking/widget/dertam_booking_checkout.dart';
import 'package:mobile_frontend/ui/screen/bus_booking/widget/dertam_seat_label_widget.dart';
import 'package:mobile_frontend/ui/theme/dertam_apptheme.dart';
import 'package:mobile_frontend/ui/widgets/actions/dertam_button.dart';
import 'package:provider/provider.dart';

class DertamSelectSeat extends StatefulWidget {
  final String scheduleId;

  const DertamSelectSeat({super.key, required this.scheduleId});

  @override
  State<DertamSelectSeat> createState() => _DertamSelectSeatState();
}

class _DertamSelectSeatState extends State<DertamSelectSeat> {
  // Track selected deck (true = lower, false = upper)
  bool isLowerDeck = true;
  // Bus detail data from provider

  BusDetailResponse? _busDetail;

  bool _isLoading = true;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _loadBusDetails();
  }

  Future<void> _loadBusDetails() async {
    try {
      setState(() {
        _isLoading = true;
        _errorMessage = null;
      });

      final provider = context.read<BusBookingProvider>();
      final busDetail = await provider.fetchBusScheduleDetail(
        widget.scheduleId,
      );

      setState(() {
        _busDetail = busDetail;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = e.toString();
        _isLoading = false;
      });
    }
  }

  void _toggleSeat(BusSeat seat) {
    if (seat.id == null) return;
    context.read<BusBookingProvider>().toggleSeatSelection(seat.id!);
  }

  Color _getSeatColor(String? status, int? seatId, Set<int> selectedSeatIds) {
    // Check if this seat is selected by user
    if (selectedSeatIds.contains(seatId)) {
      return const Color(0xFFF5A522); // Selected (yellow/orange)
    }

    switch (status?.toLowerCase()) {
      case 'booked':
      case 'reserved':
        return const Color(0xFF01015B); // Booked (dark blue)
      default: // Available
        return const Color(0xFFDAD9DB);
    }
  }

  bool _isSeatAvailable(String? status) {
    final lowerStatus = status?.toLowerCase();
    return lowerStatus == 'available' || lowerStatus == null;
  }

  String _formatDateDisplay(String date) {
    if (date.isEmpty) {
      return '';
    }
    try {
      DateTime parsedDate;
      // Handle different date formats
      if (date.contains('T')) {
        // ISO 8601 format: 2025-11-29T09:30:00.000000Z
        parsedDate = DateTime.parse(date);
      } else if (date.contains('.')) {
        // Format: 2025.11.29
        parsedDate = DateFormat('yyyy.MM.dd').parse(date);
      } else if (date.contains('-')) {
        // Format: 2025-11-29
        parsedDate = DateTime.parse(date);
      } else if (date.contains('/')) {
        // Format: 29/11/2025
        parsedDate = DateFormat('dd/MM/yyyy').parse(date);
      } else {
        return date;
      }
      // Get day with ordinal suffix
      int day = parsedDate.day;
      String suffix = _getOrdinalSuffix(day);
      String dayStr = day.toString().padLeft(2, '0');
      // Get month abbreviation
      String month = DateFormat('MMM').format(parsedDate);
      // Get year
      String year = parsedDate.year.toString();
      return '$dayStr$suffix - $month - $year';
    } catch (e) {
      // If parsing fails, return original format
      return date;
    }
  }

  String _getOrdinalSuffix(int day) {
    if (day >= 11 && day <= 13) {
      return 'th';
    }
    switch (day % 10) {
      case 1:
        return 'st';
      case 2:
        return 'nd';
      case 3:
        return 'rd';
      default:
        return 'th';
    }
  }

  // Build seat grid from API data
  Widget _buildSeatGrid(List<BusSeat> seats, Set<int> selectedSeatIds) {
    // Group seats by row (assuming seat numbers like A1, B1, C1, D1, A2, B2, etc.)
    // or organize based on seat numbers
    final int seatsPerRow = 4;
    final int totalRows = (seats.length / seatsPerRow).ceil();

    return Column(
      children: List.generate(totalRows, (rowIndex) {
        final startIdx = rowIndex * seatsPerRow;
        final endIdx = (startIdx + seatsPerRow).clamp(0, seats.length);
        final rowSeats = seats.sublist(startIdx, endIdx);

        return Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              // Left side seats (first 2)
              ...rowSeats
                  .take(2)
                  .map((seat) => _buildSeatWidget(seat, selectedSeatIds)),
              if (rowSeats.length < 2)
                ...List.generate(
                  2 - rowSeats.length,
                  (_) => const SizedBox(width: 31),
                ),
              const SizedBox(width: 40),
              // Right side seats (next 2)
              ...rowSeats
                  .skip(2)
                  .take(2)
                  .map((seat) => _buildSeatWidget(seat, selectedSeatIds)),
              if (rowSeats.length < 4 && rowSeats.length > 2)
                ...List.generate(
                  4 - rowSeats.length,
                  (_) => const SizedBox(width: 31),
                ),
            ],
          ),
        );
      }),
    );
  }

  Widget _buildSeatWidget(BusSeat seat, Set<int> selectedSeatIds) {
    final isAvailable = _isSeatAvailable(seat.status);
    final isSelected = selectedSeatIds.contains(seat.id);

    return GestureDetector(
      onTap: isAvailable ? () => _toggleSeat(seat) : null,
      child: Container(
        width: 31,
        height: 31,
        decoration: BoxDecoration(
          color: _getSeatColor(seat.status, seat.id, selectedSeatIds),
          borderRadius: BorderRadius.circular(5),
        ),
        child: Center(
          child: Text(
            seat.seatNumber ?? '',
            style: TextStyle(
              fontSize: 8,
              color: isSelected || !isAvailable ? Colors.white : Colors.black54,
              fontWeight: FontWeight.w500,
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = context.read<AuthProvider>();
    final userData = authProvider.userInfo;
    // Show loading state
    if (_isLoading) {
      return Scaffold(
        backgroundColor: DertamColors.white,
        appBar: AppBar(
          backgroundColor: Colors.transparent,
          elevation: 0,
          leading: IconButton(
            icon: Icon(Icons.arrow_back_ios_new, color: DertamColors.black),
            onPressed: () => Navigator.pop(context),
          ),
        ),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    // Show error state
    if (_errorMessage != null) {
      return Scaffold(
        backgroundColor: DertamColors.white,
        appBar: AppBar(
          backgroundColor: Colors.transparent,
          elevation: 0,
          leading: IconButton(
            icon: Icon(Icons.arrow_back_ios_new, color: DertamColors.black),
            onPressed: () => Navigator.pop(context),
          ),
        ),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text('Error: $_errorMessage'),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: _loadBusDetails,
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
      );
    }

    // Extract data from bus detail
    final schedule = _busDetail?.schedule;
    final busLayout = _busDetail?.busLayout;
    final currentDeck = isLowerDeck
        ? busLayout?.lowerDeck
        : busLayout?.upperDeck;
    final seats = currentDeck?.seats ?? [];

    // Calculate price per seat from first available seat or schedule price
    final pricePerSeat =
        double.tryParse(
          seats
                  .firstWhere(
                    (s) => s.price != null,
                    orElse: () => BusSeat(price: schedule?.price ?? '0'),
                  )
                  .price ??
              '0',
        ) ??
        0.0;

    // Get selected seat IDs from provider
    final selectedSeatIds = context.watch<BusBookingProvider>().selectedSeatIds;
    final totalFare = selectedSeatIds.length * pricePerSeat;
    // Get selected seat numbers for display
    final selectedSeatNumbers =
        seats
            .where((s) => selectedSeatIds.contains(s.id))
            .map((s) => s.seatNumber ?? '')
            .toList()
          ..sort();
    final seatsDisplay = selectedSeatNumbers.isEmpty
        ? 'None'
        : selectedSeatNumbers.join(', ');

    return Scaffold(
      backgroundColor: DertamColors.white,
      appBar: AppBar(
        leading:  // Back button
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
        title: // Header
        Padding(
          padding: const EdgeInsets.fromLTRB(0, 0, 0, 0),
          child: Row(
            children: [
              // Avatar and greeting
              Container(
                width: 50,
                height: 50,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(9999),
                  image: DecorationImage(
                    image: userData.data?.imageUrl?.isNotEmpty == true
                        ? NetworkImage(userData.data?.imageUrl ?? '')
                        : AssetImage('assets/images/dertam_logo.png')
                              as ImageProvider,
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
                        userData.data?.name ?? '',
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
      ),
      body: SafeArea(
        child: Column(
          children: [
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
                        schedule?.fromLocation ?? '',
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
                        schedule?.toLocation ?? '',
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
                      _formatDateDisplay(schedule?.departureDate ?? ''),
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
                            schedule?.busName ?? '',
                            style: DertamTextStyles.subtitle.copyWith(
                              fontSize: 18,
                              fontWeight: FontWeight.w400,
                              color: const Color(0xFF585656),
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            schedule?.busType ?? '',
                            style: DertamTextStyles.bodyMedium.copyWith(
                              fontWeight: FontWeight.w300,
                              color: const Color(0xFF616161),
                            ),
                          ),
                        ],
                      ),
                      Text(
                        'LKR ${pricePerSeat.toStringAsFixed(0)}',
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
                        schedule?.departureTime ?? '',
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
                        schedule?.arrivalTime ?? '',
                        style: DertamTextStyles.bodySmall.copyWith(
                          color: const Color(0xFF616161),
                        ),
                      ),
                      const Spacer(),
                      Text(
                        schedule?.duration ?? '',
                        style: DertamTextStyles.bodyMedium.copyWith(
                          color: Colors.black,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    '${schedule?.availableSeats ?? 0} Seats left',
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

                              // Column labels - dynamically from API
                              if (currentDeck?.columns != null &&
                                  currentDeck!.columns!.isNotEmpty)
                                Row(
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceEvenly,
                                  children: [
                                    ...currentDeck.columns!
                                        .take(2)
                                        .map(
                                          (col) =>
                                              DertamSeatLabelWidget(label: col),
                                        ),
                                    const SizedBox(width: 40),
                                    ...currentDeck.columns!
                                        .skip(2)
                                        .map(
                                          (col) =>
                                              DertamSeatLabelWidget(label: col),
                                        ),
                                  ],
                                )
                              else
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

                              // Seats grid from API data
                              if (seats.isNotEmpty)
                                _buildSeatGrid(seats, selectedSeatIds)
                              else
                                const Padding(
                                  padding: EdgeInsets.all(20),
                                  child: Text('No seats available'),
                                ),

                              const SizedBox(height: 10),

                              // Deck label
                              RotatedBox(
                                quarterTurns: 3,
                                child: Text(
                                  isLowerDeck ? 'LOWER DECK' : 'UPPER DECK',
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
                            '\$${totalFare.toStringAsFixed(0)}',
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
                    text: 'Book Now',
                    onPressed: selectedSeatIds.isEmpty
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
                                  fromLocation: schedule?.fromLocation ?? '',
                                  toLocation: schedule?.toLocation ?? '',
                                  busName: schedule?.busName ?? '',
                                  busType: schedule?.busType ?? '',
                                  departureTime: schedule?.departureTime ?? '',
                                  arrivalTime: schedule?.arrivalTime ?? '',
                                  selectedSeats: selectedSeatIds.toList(),
                                  pricePerSeat: pricePerSeat.toInt(),
                                ),
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

// class _SeatWidget extends StatelessWidget {
//   final int row;
//   final int col;
//   final int status;
//   final VoidCallback onTap;
//   final Color Function(int) getSeatColor;

//   const _SeatWidget({
//     required this.row,
//     required this.col,
//     required this.status,
//     required this.onTap,
//     required this.getSeatColor,
//   });

//   @override
//   Widget build(BuildContext context) {
//     bool isClickable = status != 1; // Can't click booked seats

//     return GestureDetector(
//       onTap: isClickable ? onTap : null,
//       child: Container(
//         width: 31,
//         height: 31,
//         decoration: BoxDecoration(
//           color: getSeatColor(status),
//           borderRadius: BorderRadius.circular(5),
//         ),
//       ),
//     );
//   }
// }

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
