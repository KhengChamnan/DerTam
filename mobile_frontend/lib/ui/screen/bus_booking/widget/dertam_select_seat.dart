import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:mobile_frontend/models/bus/bus_detail_response.dart';
import 'package:mobile_frontend/models/bus/bus_seat.dart';
import 'package:mobile_frontend/models/bus/seat_layout_config.dart';
import 'package:mobile_frontend/ui/providers/auth_provider.dart';
import 'package:mobile_frontend/ui/providers/bus_booking_provider.dart';
import 'package:mobile_frontend/ui/screen/bus_booking/widget/bus_seat_grid_builder.dart';
import 'package:mobile_frontend/ui/screen/bus_booking/widget/dertam_booking_checkout.dart';
import 'package:mobile_frontend/ui/theme/dertam_apptheme.dart';
import 'package:mobile_frontend/ui/widgets/actions/dertam_button.dart';
import 'package:mobile_frontend/utils/animations_utils.dart';
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
    // Defer the loading to after the first frame to avoid calling notifyListeners during build
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadBusDetails();
    });
  }

  Future<void> _loadBusDetails() async {
    if (!mounted) return;

    try {
      setState(() {
        _isLoading = true;
        _errorMessage = null;
      });
      final provider = context.read<BusBookingProvider>();
      final busDetail = await provider.fetchBusScheduleDetail(
        widget.scheduleId,
      );

      if (!mounted) return;

      setState(() {
        _busDetail = busDetail;
        _isLoading = false;
      });
    } catch (e) {
      if (!mounted) return;

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

  /// Get the seat layout configuration based on bus type
  SeatLayoutConfig _getLayoutConfig() {
    final busType = _busDetail?.schedule.busType;
    print('Buss typppppppppppp: $busType');
    final totalSeats = _getTotalSeatCount();
    return SeatLayoutConfig.fromTypeAndCount(busType, totalSeats);
  }

  /// Get total seat count from all decks
  int _getTotalSeatCount() {
    final busLayout = _busDetail?.busLayout;
    int count = 0;
    if (busLayout?.lowerDeck?.seats != null) {
      count += busLayout!.lowerDeck!.seats!.length;
    }
    if (busLayout?.upperDeck?.seats != null) {
      count += busLayout!.upperDeck!.seats!.length;
    }
    return count;
  }

  /// Check if the bus has multiple decks
  bool _hasMultipleDecks() {
    final busLayout = _busDetail?.busLayout;
    return busLayout?.upperDeck?.seats != null &&
        busLayout!.upperDeck!.seats!.isNotEmpty;
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
        leading: // Back button
        Padding(
          padding: const EdgeInsets.all(8.0),
          child: Container(
            decoration: BoxDecoration(
              color: Colors.white,
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.1),
                  spreadRadius: 0,
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: IconButton(
              icon: Icon(
                Icons.arrow_back_ios_new,
                color: DertamColors.primaryDark,
                size: 20,
              ),
              onPressed: () => Navigator.of(context).pop(),
            ),
          ),
        ),
        title: // Header
        Padding(
          padding: const EdgeInsets.fromLTRB(0, 0, 0, 0),
          child: Row(
            children: [
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
                        child: LayoutBuilder(
                          builder: (context, constraints) {
                            // Calculate responsive seat size based on available width
                            // For 4 seats + aisle: width = 4*seatSize + 3*spacing + aisle
                            // For 5 seats (last row): width = 5*seatSize + 4*spacing
                            final availableWidth =
                                constraints.maxWidth - 20; // padding
                            // Calculate seat size to fit 5 seats with spacing (for last row)
                            final maxSeatSize =
                                (availableWidth - (4 * 4) - 16) /
                                5; // 5 seats, 4 spacings of 4px, 16px for gaps
                            final seatSize = maxSeatSize.clamp(
                              28.0,
                              36.0,
                            ); // Min 28, max 36
                            final seatSpacing = 4.0;
                            final aisleWidth =
                                seatSize * 0.8; // Proportional aisle

                            return Container(
                              padding: const EdgeInsets.all(10),
                              decoration: BoxDecoration(
                                color: DertamColors.white,
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
                                        width: 32,
                                        height: 32,
                                        color: const Color(0xFF9E9E9E),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 12),
                                  // Column labels - dynamically based on layout config
                                  SeatColumnLabels(
                                    config: _getLayoutConfig(),
                                    customLabels: currentDeck?.columns,
                                    seatSize: seatSize,
                                    seatSpacing: seatSpacing,
                                    aisleWidth: aisleWidth,
                                  ),

                                  const SizedBox(height: 8),
                                  // Seats grid using the new BusSeatGridBuilder
                                  BusSeatGridBuilder(
                                    seats: seats,
                                    selectedSeatIds: selectedSeatIds,
                                    busType: schedule?.busType,
                                    onSeatTap: _toggleSeat,
                                    seatSize: seatSize,
                                    seatSpacing: seatSpacing,
                                    aisleWidth: aisleWidth,
                                    rowSpacing: 10,
                                  ),

                                  const SizedBox(height: 10),

                                  // Deck label - only show if multiple decks
                                  if (_hasMultipleDecks())
                                    RotatedBox(
                                      quarterTurns: 3,
                                      child: Text(
                                        isLowerDeck
                                            ? 'LOWER DECK'
                                            : 'UPPER DECK',
                                        style: DertamTextStyles.bodyMedium
                                            .copyWith(
                                              fontSize: 13,
                                              fontWeight: FontWeight.bold,
                                              color: const Color(0xFFD9D9D9),
                                              letterSpacing: 1.5,
                                            ),
                                      ),
                                    ),
                                ],
                              ),
                            );
                          },
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
                              color: const Color(0xFFDAEAFE),
                              label: 'Available',
                            ),
                            // Deck selector buttons - only show for multi-deck buses
                            if (_hasMultipleDecks()) ...[
                              const SizedBox(height: 20),
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
                            Navigator.of(context).push(
                              AnimationUtils.fade(
                                DertamBookingCheckout(
                                  scheduleId: schedule?.id ?? '',
                                  fromLocation: schedule?.fromLocation ?? '',
                                  toLocation: schedule?.toLocation ?? '',
                                  busName: schedule?.busName ?? '',
                                  busType: schedule?.busType ?? '',
                                  departureTime: schedule?.departureTime ?? '',
                                  arrivalTime: schedule?.arrivalTime ?? '',
                                  displaySeat: seatsDisplay,
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
