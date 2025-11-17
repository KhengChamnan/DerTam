import 'package:flutter/material.dart';
import 'package:mobile_frontend/ui/widgets/inputs/dertam_playment_method.dart';
import '../../../theme/dertam_apptheme.dart';
import '../../../widgets/actions/dertam_button.dart';
import '../../../widgets/inputs/dertam_text_field.dart';

class DertamBookingCheckout extends StatefulWidget {
  final String fromLocation;
  final String toLocation;
  final String busName;
  final String busType;
  final String departureTime;
  final String arrivalTime;
  final List<int> selectedSeats;
  final int pricePerSeat;

  const DertamBookingCheckout({
    super.key,
    required this.fromLocation,
    required this.toLocation,
    required this.busName,
    required this.busType,
    required this.departureTime,
    required this.arrivalTime,
    required this.selectedSeats,
    required this.pricePerSeat,
  });

  @override
  State<DertamBookingCheckout> createState() => _DertamBookingCheckoutState();
}

class _DertamBookingCheckoutState extends State<DertamBookingCheckout> {
  // Controllers for text fields
  final TextEditingController _fullNameController = TextEditingController();
  final TextEditingController _mobileController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();

  String _selectedPaymentMethod = 'khqr';

  @override
  void dispose() {
    _fullNameController.dispose();
    _mobileController.dispose();
    _emailController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: DertamColors.white,
      body: SafeArea(
        child: Stack(
          children: [
            // Scrollable content
            SingleChildScrollView(
              padding: const EdgeInsets.only(
                bottom: 100, // Space for the button at bottom
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Header
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
                                    color: DertamColors.neutral,
                                    height: 1.4,
                                  ),
                                ),
                                Text(
                                  'Saduni Silva!',
                                  style: DertamTextStyles.body.copyWith(
                                    fontWeight: FontWeight.w400,
                                    color: DertamColors.neutral,
                                    height: 1.4,
                                  ),
                                ),
                              ],
                            ),
                            Text(
                              'Where you want go',
                              style: DertamTextStyles.body.copyWith(
                                color: DertamColors.primaryBlue,
                                height: 1.4,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 13),
                  // Bus Details Card
                  Container(
                    margin: const EdgeInsets.symmetric(horizontal: 15),
                    padding: const EdgeInsets.all(18),
                    decoration: BoxDecoration(
                      color: DertamColors.primaryBlue,
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Stack(
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.center,
                              children: [
                                // Bus Name
                                Text(
                                  widget.busName,
                                  style: DertamTextStyles.subtitle.copyWith(
                                    fontSize: 18,
                                    color: DertamColors.white,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                // Bus Type
                                Text(
                                  widget.busType,
                                  style: DertamTextStyles.bodyMedium.copyWith(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w300,
                                    color: DertamColors.white,
                                  ),
                                ),
                                const SizedBox(height: 8),
                                // Time details
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Text(
                                      widget.departureTime,
                                      style: DertamTextStyles.bodySmall
                                          .copyWith(color: Colors.white),
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
                                      style: DertamTextStyles.bodySmall
                                          .copyWith(color: DertamColors.white),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                            Image.asset(
                              'assets/images/bus_logo.png',
                              width: 120,
                              height: 70,
                              color: Colors.white.withOpacity(0.3),
                              errorBuilder: (context, error, stackTrace) {
                                return const SizedBox(width: 120, height: 70);
                              },
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 17),
                  Container(
                    margin: const EdgeInsets.symmetric(horizontal: 15),
                    decoration: BoxDecoration(
                      color: DertamColors.white,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    padding: const EdgeInsets.all(8),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Section Title
                        Center(
                          child: Text(
                            'Contact Information',
                            style: DertamTextStyles.subtitle.copyWith(
                              fontSize: 20,
                              color: DertamColors.primaryBlue,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                        // Mobile
                        Text(
                          'Mobile',
                          style: DertamTextStyles.bodyMedium.copyWith(
                            color: DertamColors.black,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        const SizedBox(height: 8),
                        DertamTextField(
                          hintText: '01234566',
                          controller: _mobileController,
                          keyboardType: TextInputType.phone,
                        ),

                        const SizedBox(height: DertamSpacings.xs),

                        // Email
                        Text(
                          'Email',
                          style: DertamTextStyles.bodyMedium.copyWith(
                            color: DertamColors.black,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        const SizedBox(height: DertamSpacings.xs),
                        DertamTextField(
                          hintText: 'Email',
                          controller: _emailController,
                          keyboardType: TextInputType.emailAddress,
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: DertamSpacings.xs),

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
                              color: const Color(0xFF192588),
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),

                        const SizedBox(height: 16),
                        // Payment Options
                        PaymentOptionItem(
                          value: 'khqr',
                          label: 'KH QR',
                          imagePath: 'assets/images/bakong.jpg',
                          isSelected: _selectedPaymentMethod == 'khqr',
                          hasCheckMark: true,
                          onTap: () {
                            setState(() {
                              _selectedPaymentMethod = 'khqr';
                            });
                          },
                        ),
                        const SizedBox(height: 16),
                        PaymentOptionItem(
                          value: 'cash',
                          label: 'Cash',
                          imagePath: 'assets/images/cash.jpg',
                          isSelected: _selectedPaymentMethod == 'cash',
                          onTap: () {
                            setState(() {
                              _selectedPaymentMethod = 'cash';
                            });
                          },
                        ),
                        const SizedBox(height: 16),
                        PaymentOptionItem(
                          value: 'aba',
                          label: 'ABA Bank',
                          imagePath: 'assets/images/aba.jpg',
                          isSelected: _selectedPaymentMethod == 'aba',
                          onTap: () {
                            setState(() {
                              _selectedPaymentMethod = 'aba';
                            });
                          },
                        ),
                        const SizedBox(height: 16),
                        PaymentOptionItem(
                          value: 'acelida',
                          label: 'Acelida Bank',
                          imagePath: 'assets/images/aceleda.jpg',
                          isSelected: _selectedPaymentMethod == 'acelida',
                          onTap: () {
                            setState(() {
                              _selectedPaymentMethod = 'acelida';
                            });
                          },
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 20),
                ],
              ),
            ),

            // Fixed Proceed to Book button at bottom
            Positioned(
              left: 0,
              right: 0,
              bottom: 0,
              child: Container(
                padding: const EdgeInsets.all(15),
                decoration: BoxDecoration(
                  color: DertamColors.white,
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.05),
                      blurRadius: 10,
                      offset: const Offset(0, -2),
                    ),
                  ],
                ),
                child: DertamButton(
                  text: 'Proceed to Book',
                  onPressed: _handleProceedToBook,
                  backgroundColor: DertamColors.primaryBlue,
                  height: 55,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _handleProceedToBook() {
    // Validate form fields
    if (_fullNameController.text.isEmpty) {
      _showErrorSnackBar('Please enter passenger name');
      return;
    }

    if (_mobileController.text.isEmpty) {
      _showErrorSnackBar('Please enter your mobile number');
      return;
    }
    if (_emailController.text.isEmpty) {
      _showErrorSnackBar('Please enter your email');
      return;
    }
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          'Booking ${widget.selectedSeats.length} seat(s) via $_selectedPaymentMethod',
        ),
        backgroundColor: Colors.green,
      ),
    );
  }

  ///
  /// Shows error snackbar with message
  ///
  void _showErrorSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), backgroundColor: Colors.red),
    );
  }
}

///
/// Private reusable widget for displaying a payment option item.
/// Shows payment method logo, label, and selection indicator.
///

