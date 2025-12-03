import 'package:flutter/material.dart';
import 'package:mobile_frontend/ui/providers/bus_booking_provider.dart';
import 'package:mobile_frontend/ui/screen/bus_booking/dertam_bus_booking_screen.dart';
import 'package:mobile_frontend/ui/screen/bus_booking/widget/dertam_bus_qr_code_screen.dart';
import 'package:mobile_frontend/ui/screen/home_screen/home_page.dart';
import 'package:mobile_frontend/ui/widgets/display/dertam_booking_succes_screen.dart';
import 'package:mobile_frontend/ui/widgets/inputs/dertam_playment_method.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../theme/dertam_apptheme.dart';
import '../../../widgets/actions/dertam_button.dart';

class DertamBookingCheckout extends StatefulWidget {
  final String scheduleId;
  final String fromLocation;
  final String toLocation;
  final String busName;
  final String busType;
  final String departureTime;
  final String arrivalTime;
  final String displaySeat;
  final int pricePerSeat;
  final List<int> selectedSeats;

  const DertamBookingCheckout({
    super.key,
    required this.scheduleId,
    required this.fromLocation,
    required this.toLocation,
    required this.busName,
    required this.busType,
    required this.departureTime,
    required this.arrivalTime,
    required this.displaySeat,
    required this.pricePerSeat,
    required this.selectedSeats,
  });

  @override
  State<DertamBookingCheckout> createState() => _DertamBookingCheckoutState();
}

class _DertamBookingCheckoutState extends State<DertamBookingCheckout> {
  String _selectedPaymentDisplay = 'deeplink';
  bool _isProcessing = false;

  @override
  void dispose() {
    super.dispose();
  }

  /// Formats a time string to a readable format (e.g., "1 PM, Sat")
  String _formatTime(String timeString) {
    try {
      // Try parsing as ISO 8601 format
      final dateTime = DateTime.parse(timeString);
      final hour = dateTime.hour;
      final minute = dateTime.minute;
      final period = hour >= 12 ? 'PM' : 'AM';
      final hour12 = hour > 12 ? hour - 12 : (hour == 0 ? 12 : hour);

      // Get day of week
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      final dayName = days[dateTime.weekday - 1];

      if (minute == 0) {
        return '$hour12 $period, $dayName';
      } else {
        return '$hour12:${minute.toString().padLeft(2, '0')} $period, $dayName';
      }
    } catch (e) {
      // If parsing fails, return the original string
      return timeString;
    }
  }

  Future<void> _handlePayNow() async {
    if (_isProcessing) return;

    setState(() {
      _isProcessing = true;
    });

    try {
      final busBooking = context.read<BusBookingProvider>();
      await busBooking.createBusBooking(
        widget.scheduleId,
        widget.selectedSeats,
      );
      // Get the response AFTER createBusBooking completes
      final busBookingResponse = busBooking.busBookingResponse;
      if (_selectedPaymentDisplay == 'deeplink') {
        // ABA PayWay - Open ABA app via deeplink
        final deeplink =
            busBookingResponse.data?.data?.abaResponse.abapayDeeplink;
        print('Attempting to open ABA PayWay with deeplink: $deeplink');
        if (deeplink != null && deeplink.isNotEmpty) {
          print('ABA PayWay Deeplink: $deeplink');
          // Launch the deeplink to open ABA PayWay app
          final uri = Uri.parse(deeplink);
          if (await canLaunchUrl(uri)) {
            print('canLaunchUrl returned true, launching...');
            final launched = await launchUrl(
              uri,
              mode: LaunchMode.externalApplication,
            );
            print('launchUrl result: $launched');
            // Clear cached data after successful booking
            if (mounted) {
              busBooking.clearAfterBooking();
            }
            // Show success message
            if (mounted) {
              Navigator.pushAndRemoveUntil(
                context,
                MaterialPageRoute(
                  builder: (context) => DertamBookingSuccessScreen(),
                ),
                (route) => false,
              );
            }
            // Don't navigate away - let the deep link handle the return
          } else {
            print('canLaunchUrl returned false');
            throw Exception(
              'Could not launch ABA PayWay. Please install the app.',
            );
          }
        } else {
          print('Deeplink is null or empty');
          throw Exception('No payment deeplink received from server');
        }
      } else if (_selectedPaymentDisplay == 'qr') {
        // ABA QR - Show QR code on screen
        final qrString = busBookingResponse.data?.data?.abaResponse.qrString;
        final qrImage = busBookingResponse.data?.data?.abaResponse.qrImage;
        final bookingId = busBookingResponse.data?.data?.booking.id;
        // Validate QR data is available
        if (qrString == null || qrString.isEmpty) {
          throw Exception('No QR code received from server');
        }
        print('QR String: $qrString');
        print('QR Image available: ${qrImage != null && qrImage.isNotEmpty}');
        // Navigate to QR code screen and wait for user to complete payment
        if (mounted) {
          final result = await Navigator.push<bool>(
            context,
            MaterialPageRoute(
              builder: (context) => DertamBusQrCodeScreen(
                qrData: qrString,
                qrImage: qrImage,
                bookingId: bookingId.toString(),
              ),
            ),
          );

          // Only navigate to success if user confirmed payment
          if (result == true && mounted) {
            Navigator.pushAndRemoveUntil(
              context,
              MaterialPageRoute(
                builder: (context) => DertamBookingSuccessScreen(),
              ),
              (route) => false,
            );
          }
        }
      } else {
        // Cash payment
        if (mounted) {
          await Future.delayed(const Duration(seconds: 2));
          if (mounted) {
            Navigator.pushAndRemoveUntil(
              context,
              MaterialPageRoute(builder: (context) => HomePage()),
              (route) => false,
            );
          }
        }
      }
    } catch (e) {
      print('❌ Booking Error: $e');
      String errorMessage = e.toString();
      if (errorMessage.startsWith('Exception: ')) {
        errorMessage = errorMessage.substring('Exception: '.length);
      }
      if (mounted) {
        showDialog(
          context: context,
          builder: (BuildContext context) {
            return AlertDialog(
              title: Row(
                children: [
                  Icon(Icons.error_outline, color: Colors.red),
                  const SizedBox(width: 8),
                  const Text('Booking Failed'),
                ],
              ),
              content: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(errorMessage),
                    const SizedBox(height: 16),
                    const Text(
                      'Please check:',
                      style: TextStyle(fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 8),
                    const Text('• Selected seats are still available'),
                    const Text('• Payment method is valid'),
                    const Text('• All required fields are filled'),
                  ],
                ),
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.of(context).pop(),
                  child: const Text('OK'),
                ),
              ],
            );
          },
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isProcessing = false;
        });
      }
    }
  }

  void _clear() {
    context.read<BusBookingProvider>().clearSelectedSeats();
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (context) => DertamBusBookingScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    final totalPrice = widget.selectedSeats.length * widget.pricePerSeat;
    return Scaffold(
      backgroundColor: DertamColors.backgroundWhite,
      appBar: AppBar(
        backgroundColor: DertamColors.white,
        elevation: 0,
        leading: Padding(
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
        title: Text(
          'Confirm Booking',
          style: DertamTextStyles.subtitle.copyWith(
            fontFamily: 'Poppins',
            fontWeight: FontWeight.bold,
            color: DertamColors.primaryBlue,
            fontSize: 24,
          ),
        ),
        centerTitle: true,
        actions: [
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
                  Icons.cancel,
                  color: DertamColors.primaryDark,
                  size: 20,
                ),
                onPressed: () => _clear(),
              ),
            ),
          ),
        ],
      ),
      body: Stack(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Bus Details Card
                Container(
                  decoration: BoxDecoration(
                    color: DertamColors.white,
                    borderRadius: BorderRadius.circular(10),
                    boxShadow: [
                      BoxShadow(
                        color: DertamColors.primaryBlue.withOpacity(0.1),
                        blurRadius: 8,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  padding: const EdgeInsets.all(DertamSpacings.s),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        height: 104,
                        width: 88,
                        decoration: BoxDecoration(
                          color: DertamColors.primaryBlue.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Image.asset(
                          'assets/images/bus_logo.png',
                          color: DertamColors.primaryBlue,
                        ),
                      ),

                      const SizedBox(width: DertamSpacings.m),
                      // Bus Details
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Bus Name
                            Text(
                              widget.busName,
                              style: DertamTextStyles.bodySmall.copyWith(
                                color: DertamColors.primaryBlue,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: DertamSpacings.xs),
                            // Bus Type
                            Text(
                              widget.busType,
                              style: DertamTextStyles.labelSmall.copyWith(
                                color: DertamColors.black,
                                fontFamily: 'Inter',
                              ),
                            ),
                            const SizedBox(height: DertamSpacings.xs),
                            // Route
                            Row(
                              children: [
                                Icon(
                                  Icons.location_on,
                                  size: 12,
                                  color: DertamColors.primaryBlue,
                                ),
                                const SizedBox(width: 4),
                                Expanded(
                                  child: Text(
                                    '${widget.fromLocation} → ${widget.toLocation}',
                                    style: DertamTextStyles.labelSmall.copyWith(
                                      color: DertamColors.black,
                                      fontFamily: 'Inter',
                                    ),
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: DertamSpacings.xs),
                            // Time
                            Row(
                              children: [
                                Icon(
                                  Icons.access_time,
                                  size: 12,
                                  color: DertamColors.primaryBlue,
                                ),
                                const SizedBox(width: 4),
                                Expanded(
                                  child: Text(
                                    '${_formatTime(widget.departureTime)} - ${_formatTime(widget.arrivalTime)}',
                                    style: DertamTextStyles.labelSmall.copyWith(
                                      color: DertamColors.black,
                                      fontFamily: 'Inter',
                                    ),
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: DertamSpacings.xs),
                            // Seats
                            Row(
                              children: [
                                Icon(
                                  Icons.event_seat,
                                  size: 12,
                                  color: DertamColors.primaryBlue,
                                ),
                                const SizedBox(width: 4),
                                Text(
                                  'Seats: ${widget.displaySeat}',
                                  style: DertamTextStyles.labelSmall.copyWith(
                                    color: DertamColors.black,
                                    fontFamily: 'Inter',
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                      // Price
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text(
                            '\$$totalPrice',
                            style: DertamTextStyles.bodyMedium.copyWith(
                              color: DertamColors.primaryBlue,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          Text(
                            '${widget.selectedSeats.length} seat(s)',
                            style: DertamTextStyles.labelSmall.copyWith(
                              color: DertamColors.greyDark,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: DertamSpacings.xxl),

                // Payment Method Section
                Container(
                  margin: const EdgeInsets.symmetric(
                    horizontal: DertamSpacings.s,
                  ),
                  decoration: BoxDecoration(
                    color: DertamColors.white,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  padding: const EdgeInsets.all(DertamSpacings.xs),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Section Title
                      Center(
                        child: Text(
                          'Payment Methods',
                          style: DertamTextStyles.subtitle.copyWith(
                            fontSize: 20,
                            color: DertamColors.primaryDark,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),
                      PaymentOptionItem(
                        value: 'abapay_deeplink',
                        label: 'ABA PayWay',
                        imagePath: 'assets/images/aba.jpg',
                        isSelected: _selectedPaymentDisplay == 'deeplink',
                        hasCheckMark: true,
                        onTap: () {
                          setState(() {
                            _selectedPaymentDisplay = 'deeplink';
                          });
                        },
                      ),
                      const SizedBox(height: 16),
                      PaymentOptionItem(
                        value: 'abaqr',
                        label: 'ABA QR',
                        imagePath: 'assets/images/bakong.jpg',
                        isSelected: _selectedPaymentDisplay == 'qr',
                        hasCheckMark: true,
                        onTap: () {
                          setState(() {
                            _selectedPaymentDisplay = 'qr';
                          });
                        },
                      ),

                      const SizedBox(height: 16),
                    ],
                  ),
                ),
                const SizedBox(height: DertamSpacings.xs),
              ],
            ),
          ),
        ],
      ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.all(DertamSpacings.l),
        child: DertamButton(
          text: _isProcessing ? 'Processing...' : 'Pay Now',
          onPressed: _isProcessing ? () {} : _handlePayNow,
          height: 55,
        ),
      ),
    );
  }
}
