import 'package:flutter/material.dart';
import 'package:mobile_frontend/models/hotel/room.dart';
import 'package:mobile_frontend/ui/providers/hotel_provider.dart';
import 'package:mobile_frontend/ui/screen/home_screen/home_page.dart';
import 'package:mobile_frontend/ui/widgets/display/dertam_qr_code_screen.dart';
import 'package:mobile_frontend/ui/widgets/inputs/dertam_playment_method.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../theme/dertam_apptheme.dart';
import '../../../widgets/actions/dertam_button.dart';

class DertamConfirmBooking extends StatefulWidget {
  final String roomType;
  final double pricePerNight;
  final int maxGuests;
  final List<String> roomImage;
  final DateTime? checkIn;
  final DateTime? checkOut;
  final Room room;

  const DertamConfirmBooking({
    super.key,
    required this.roomType,
    required this.pricePerNight,
    required this.roomImage,
    required this.maxGuests,
    required this.checkIn,
    required this.checkOut,
    required this.room,
  });
  @override
  State<DertamConfirmBooking> createState() => _DertamConfirmBookingState();
}

class _DertamConfirmBookingState extends State<DertamConfirmBooking> {
  String _selectedPaymentMethod = 'abapay_khqr_deeplink';
  String _selectedPaymentDisplay = 'deeplink';
  bool _isProcessing = false;

  @override
  void dispose() {
    super.dispose();
  }

  Future<void> _handlePayNow() async {
    if (_isProcessing) return;

    setState(() {
      _isProcessing = true;
    });
    try {
      final hotelProvider = context.read<HotelProvider>();

      // Get check-in and check-out dates with defaults
      final checkIn = widget.checkIn ?? DateTime.now();
      final checkOut =
          widget.checkOut ?? DateTime.now().add(const Duration(days: 1));

      // Format dates as YYYY-MM-DD strings
      final String formattedCheckIn =
          '${checkIn.year}-${checkIn.month.toString().padLeft(2, '0')}-${checkIn.day.toString().padLeft(2, '0')}';
      final String formattedCheckOut =
          '${checkOut.year}-${checkOut.month.toString().padLeft(2, '0')}-${checkOut.day.toString().padLeft(2, '0')}';

      // Debug: Print booking data before sending
      print('🔍 [Booking Debug] Check-in: $formattedCheckIn');
      print('🔍 [Booking Debug] Check-out: $formattedCheckOut');
      print('🔍 [Booking Debug] Room ID: ${widget.room.roomPropertiesId}');
      print('🔍 [Booking Debug] Room Type: ${widget.room.roomType}');
      print('🔍 [Booking Debug] Price: ${widget.room.pricePerNight}');
      print('🔍 [Booking Debug] Payment Method: $_selectedPaymentMethod');

      // Create booking with the selected payment option
      final bookingResponse = await hotelProvider.createBooking(
        checkIn,
        checkOut,
        [widget.room],
        _selectedPaymentMethod,
      );
      print('Booking created successfully: ${bookingResponse.message}');
      print(
        'Transaction ID: ${bookingResponse.data?.abaResponse.status.tranId}',
      );

      // Debug: Print the entire response
      print('Payment method selected: $_selectedPaymentMethod');
      print('Payment display mode: $_selectedPaymentDisplay');
      print(
        'ABA Deeplink: ${bookingResponse.data?.abaResponse.abapayDeeplink}',
      );

      // Store booking ID for payment verification
      final bookingId = bookingResponse.data?.booking.id;

      // Handle payment based on selected display mode
      if (_selectedPaymentDisplay == 'deeplink') {
        // ABA PayWay - Open ABA app via deeplink
        final deeplink = bookingResponse.data?.abaResponse.abapayDeeplink;
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

            if (!launched) {
              throw Exception('Failed to launch ABA PayWay app');
            }

            // Show loading dialog while verifying payment
            if (mounted) {
              showDialog(
                context: context,
                barrierDismissible: false,
                builder: (BuildContext context) {
                  return WillPopScope(
                    onWillPop: () async => false,
                    child: Center(
                      child: Card(
                        child: Padding(
                          padding: const EdgeInsets.all(24.0),
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              CircularProgressIndicator(
                                color: DertamColors.primaryBlue,
                              ),
                              const SizedBox(height: 16),
                              const Text(
                                'Verifying Payment...',
                                style: TextStyle(fontSize: 16),
                              ),
                              const SizedBox(height: 8),
                              const Text(
                                'Please wait',
                                style: TextStyle(
                                  fontSize: 14,
                                  color: Colors.grey,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  );
                },
              );
            }

            // Poll for payment status with retries
            String? finalStatus;
            const maxAttempts = 6; // Check 6 times
            const delayBetweenChecks = Duration(seconds: 3);

            for (int attempt = 0; attempt < maxAttempts; attempt++) {
              await Future.delayed(delayBetweenChecks);

              print(
                '🔄 Checking payment status (attempt ${attempt + 1}/$maxAttempts)...',
              );

              finalStatus = await _checkPaymentStatus(
                hotelProvider,
                bookingId.toString(),
              );

              // If payment is confirmed, break early
              if (finalStatus == 'success') {
                print('✅ Payment confirmed on attempt ${attempt + 1}');
                break;
              }

              // If payment failed, break early
              if (finalStatus == 'failed') {
                print('❌ Payment failed on attempt ${attempt + 1}');
                break;
              }

              // If still pending, continue polling
              print('⏳ Payment still pending, will retry...');
            }

            // Close loading dialog
            if (mounted) {
              Navigator.of(context).pop();
            }

            // Handle final payment status
            if (finalStatus == 'success' && mounted) {
              // Payment successful, show success dialog
              await showDialog(
                context: context,
                barrierDismissible: false,
                builder: (BuildContext context) {
                  return AlertDialog(
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(20),
                    ),
                    content: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Colors.green,
                            shape: BoxShape.circle,
                          ),
                          child: Icon(
                            Icons.check,
                            color: Colors.white,
                            size: 60,
                          ),
                        ),
                        const SizedBox(height: 24),
                        Text(
                          'Payment Successful!',
                          style: TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                            color: DertamColors.primaryBlue,
                          ),
                        ),
                        const SizedBox(height: 12),
                        Text(
                          'Your booking has been confirmed.',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 16,
                            color: Colors.grey[600],
                          ),
                        ),
                      ],
                    ),
                    actions: [
                      TextButton(
                        onPressed: () {
                          Navigator.of(context).pop(); // Close dialog
                          Navigator.pushAndRemoveUntil(
                            context,
                            MaterialPageRoute(builder: (context) => HomePage()),
                            (route) => false,
                          );
                        },
                        style: TextButton.styleFrom(
                          backgroundColor: DertamColors.primaryBlue,
                          padding: const EdgeInsets.symmetric(
                            horizontal: 32,
                            vertical: 12,
                          ),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
                        ),
                        child: Text(
                          'OK',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                    actionsAlignment: MainAxisAlignment.center,
                  );
                },
              );
            } else if (finalStatus == 'failed' && mounted) {
              return;
            } else if (mounted) {
              // Payment still pending after all retries
              print('⏳ Payment still pending after all retries');
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(
                    'Payment is still processing. Please check your bookings later.',
                  ),
                  backgroundColor: Colors.orange,
                  duration: Duration(seconds: 2),
                ),
              );
            }
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
        final qrString = bookingResponse.data?.abaResponse.qrString;
        final qrImage = bookingResponse.data?.abaResponse.qrImage;

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
              builder: (context) => DertamQrCodeScreen(
                qrData: qrString,
                qrImage: qrImage,
                bookingId: bookingId.toString(),
              ),
            ),
          );

          // Only navigate to success if user confirmed payment
          if (result == true && mounted) {
            await showDialog(
              context: context,
              barrierDismissible: false,
              builder: (BuildContext context) {
                return AlertDialog(
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(20),
                  ),
                  content: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.green,
                          shape: BoxShape.circle,
                        ),
                        child: Icon(Icons.check, color: Colors.white, size: 60),
                      ),
                      const SizedBox(height: 24),
                      Text(
                        'Payment Successful!',
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                          color: DertamColors.primaryBlue,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Text(
                        'Your booking has been confirmed.',
                        textAlign: TextAlign.center,
                        style: TextStyle(fontSize: 16, color: Colors.grey[600]),
                      ),
                    ],
                  ),
                  actions: [
                    TextButton(
                      onPressed: () {
                        Navigator.of(context).pop(); // Close dialog
                        Navigator.pushAndRemoveUntil(
                          context,
                          MaterialPageRoute(builder: (context) => HomePage()),
                          (route) => false,
                        );
                      },
                      style: TextButton.styleFrom(
                        backgroundColor: DertamColors.primaryBlue,
                        padding: const EdgeInsets.symmetric(
                          horizontal: 32,
                          vertical: 12,
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                      child: Text(
                        'OK',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                  actionsAlignment: MainAxisAlignment.center,
                );
              },
            );
          }
          // If result is false or null, stay on current screen
        }
      } else {
        // Cash or other payment methods
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                'Booking created! Payment method: $_selectedPaymentMethod',
              ),
              backgroundColor: Colors.green,
            ),
          );
        }
        // Navigate back to home after delay for cash
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
      // Extract error message
      String errorMessage = e.toString();
      if (errorMessage.startsWith('Exception: ')) {
        errorMessage = errorMessage.substring('Exception: '.length);
      }
      if (mounted) {
        // Show error in a dialog for better visibility
        await showDialog(
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
                    const Text('• Check-in and check-out dates are valid'),
                    const Text('• Room is available for selected dates'),
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
        // Stay on current screen after error
      }
    } finally {
      if (mounted) {
        setState(() {
          _isProcessing = false;
        });
      }
    }
  }

  // New method to check payment status once
  Future<String> _checkPaymentStatus(
    HotelProvider hotelProvider,
    String bookingId,
  ) async {
    try {
      print('🔍 Checking payment status...');

      // Fetch booking details to check payment status
      final bookingDetail = await hotelProvider.fetchHotelBookingDetail(
        bookingId,
      );
      // Extract payment status from booking detail
      final paymentStatus = bookingDetail.data.status.toLowerCase();
      print('💳 Payment status: $paymentStatus');

      // Check if payment is successful - use contains for flexibility
      if (paymentStatus.contains('confirmed')) {
        print('✅ Payment successful!');
        return 'success';
      }

      // Check if payment failed
      if (paymentStatus.contains('fail') || paymentStatus.contains('cancel')) {
        print('❌ Payment failed or cancelled');
        return 'failed';
      }

      // Payment is still pending
      print('⏳ Payment is pending - Status: $paymentStatus');
      return 'pending';
    } catch (e) {
      print('⚠️ Error checking payment status: $e');
      return 'pending'; // Treat errors as pending
    }
  }

  @override
  Widget build(BuildContext context) {
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
                onPressed: () => Navigator.pushReplacement(
                  context,
                  MaterialPageRoute(builder: (context) => HomePage()),
                ),
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
                // Room Details Card
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
                      // Room Image
                      ClipRRect(
                        borderRadius: BorderRadius.circular(8),
                        child: Image.network(
                          widget.roomImage.first,
                          width: 124,
                          height: 98,
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) {
                            return Container(
                              width: 124,
                              height: 98,
                              color: Colors.grey[200],
                              child: Icon(
                                Icons.image_not_supported,
                                color: Colors.grey[400],
                              ),
                            );
                          },
                        ),
                      ),
                      const SizedBox(width: DertamSpacings.m),
                      // Room Details
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Room Type
                            Text(
                              widget.roomType,
                              style: DertamTextStyles.bodySmall.copyWith(
                                color: DertamColors.primaryBlue,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: DertamSpacings.xs),

                            // Amenities
                            if (widget.room.amenities.isNotEmpty)
                              Wrap(
                                spacing: 8,
                                runSpacing: 4,
                                children: widget.room.amenities
                                    .take(3) // Show only first 3 amenities
                                    .map(
                                      (amenity) => _buildAmenityChip(
                                        _getAmenityIcon(amenity.amenityName),
                                        amenity.amenityName,
                                      ),
                                    )
                                    .toList(),
                              ),
                            const SizedBox(height: DertamSpacings.xs),
                            // People capacity
                            Row(
                              children: [
                                Icon(
                                  Icons.person,
                                  size: 12,
                                  color: DertamColors.black,
                                ),
                                const SizedBox(width: 4),
                                Text(
                                  widget.maxGuests.toString(),
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
                      // Price and quantity
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text(
                            '\$${widget.pricePerNight.toStringAsFixed(0)} nightly',
                            style: DertamTextStyles.bodyMedium.copyWith(
                              color: DertamColors.primaryBlue,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 40),
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
                            _selectedPaymentMethod = 'abapay_khqr_deeplink';
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
                            _selectedPaymentMethod = 'abapay_khqr_deeplink';
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

          // Fixed Pay Now button at bottom
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

  Widget _buildAmenityChip(IconData icon, String label) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 12, color: DertamColors.primaryBlue),
        const SizedBox(width: 4),
        Text(
          label,
          style: DertamTextStyles.labelSmall.copyWith(
            color: DertamColors.black,
            fontFamily: 'Inter',
          ),
        ),
      ],
    );
  }

  // Helper method to get icon based on amenity name
  IconData _getAmenityIcon(String amenityName) {
    final name = amenityName.toLowerCase();
    if (name.contains('wifi') || name.contains('internet')) {
      return Icons.wifi;
    } else if (name.contains('pool') || name.contains('swimming')) {
      return Icons.pool;
    } else if (name.contains('tv') || name.contains('television')) {
      return Icons.tv;
    } else if (name.contains('air') || name.contains('ac')) {
      return Icons.ac_unit;
    } else if (name.contains('parking')) {
      return Icons.local_parking;
    } else if (name.contains('gym') || name.contains('fitness')) {
      return Icons.fitness_center;
    } else if (name.contains('restaurant') || name.contains('dining')) {
      return Icons.restaurant;
    } else if (name.contains('spa')) {
      return Icons.spa;
    } else if (name.contains('coffee') || name.contains('breakfast')) {
      return Icons.free_breakfast;
    } else if (name.contains('pet')) {
      return Icons.pets;
    } else {
      return Icons.check_circle;
    }
  }
}
