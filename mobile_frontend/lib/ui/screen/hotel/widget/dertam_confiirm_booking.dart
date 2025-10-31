import 'package:flutter/material.dart';
import '../../../theme/dertam_apptheme.dart';
import '../../../widgets/actions/dertam_button.dart';
import '../../../widgets/inputs/dertam_text_field.dart';

///
/// Screen for confirming hotel room booking.
/// Allows users to:
/// - View selected room details
/// - Enter personal information
/// - Enter contact information
/// - Upload ID document
/// - Select payment method
/// - Complete booking
///
class DertamConfirmBooking extends StatefulWidget {
  final String roomType;
  final double pricePerNight;
  final int maxGuests;
  final int numberOfRooms;
  final List<String> roomImage;

  const DertamConfirmBooking({
    super.key,
    required this.roomType,
    required this.pricePerNight,
    required this.numberOfRooms,
    required this.roomImage,
    required this.maxGuests,
  });

  @override
  State<DertamConfirmBooking> createState() => _DertamConfirmBookingState();
}

class _DertamConfirmBookingState extends State<DertamConfirmBooking> {
  // Controllers for text fields
  final TextEditingController _fullNameController = TextEditingController();
  final TextEditingController _mobileController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _idNumberController = TextEditingController();
  // Gender selection
  String _selectedGender = 'male';
  String _selectedPaymentMethod = 'khqr';
  @override
  void dispose() {
    _fullNameController.dispose();
    _mobileController.dispose();
    _emailController.dispose();
    _idNumberController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: DertamColors.backgroundWhite,
      appBar: AppBar(
        backgroundColor: DertamColors.white,
        elevation: 0,
        leading: IconButton(
          icon: Icon(
            Icons.arrow_back_ios_new,
            color: DertamColors.black,
            size: 16,
          ),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: Text(
          'Confirm Booking',
          style: DertamTextStyles.subtitle.copyWith(
            color: DertamColors.black,
            fontWeight: FontWeight.bold,
          ),
        ),
        centerTitle: true,
      ),
      body: Stack(
        children: [
          // Scrollable content
          SingleChildScrollView(
            padding: const EdgeInsets.only(
              left: DertamSpacings.m,
              right: DertamSpacings.m,
              top: DertamSpacings.m,
              bottom: 100, // Space for the button at bottom
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Room Details Card
                _buildRoomDetailsCard(),
                const SizedBox(height: DertamSpacings.xs),
                // Personal Information Section
                _buildPersonalInformationSection(),
                const SizedBox(height: DertamSpacings.xs),
                // Contact Information Section
                _buildContactInformationSection(),
                const SizedBox(height: DertamSpacings.xs),

                // Payment Method Section
                _buildPaymentMethodSection(),
                const SizedBox(height: DertamSpacings.xs),
              ],
            ),
          ),

          // Fixed Pay Now button at bottom
          Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            child: Container(
              padding: const EdgeInsets.all(DertamSpacings.m),
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
                text: 'Pay Now',
                onPressed: _handlePayNow,
                height: 55,
              ),
            ),
          ),
        ],
      ),
    );
  }

  ///
  /// Builds the room details card showing room image, type, and price
  ///
  Widget _buildRoomDetailsCard() {
    return Container(
      decoration: BoxDecoration(
        color: DertamColors.white,
        borderRadius: BorderRadius.circular(10),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
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
                Wrap(
                  spacing: 8,
                  runSpacing: 4,
                  children: [
                    _buildAmenityChip(Icons.wifi, 'WIFI'),
                    _buildAmenityChip(Icons.pool, 'Swimming'),
                  ],
                ),
                const SizedBox(height: DertamSpacings.xs),
                // People capacity
                Row(
                  children: [
                    Icon(Icons.person, size: 12, color: DertamColors.black),
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
              Text(
                'X ${widget.numberOfRooms}',
                style: DertamTextStyles.body.copyWith(
                  color: DertamColors.primaryBlue,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  ///
  /// Builds a small amenity chip with icon and text
  ///
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

  ///
  /// Builds the personal information section with name and gender
  ///
  Widget _buildPersonalInformationSection() {
    return Container(
      decoration: BoxDecoration(
        color: DertamColors.white,
        borderRadius: BorderRadius.circular(10),
      ),
      padding: const EdgeInsets.all(DertamSpacings.s),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Section Title
          Text(
            'Personal Information',
            style: DertamTextStyles.subtitle.copyWith(
              color: DertamColors.primaryBlue,
              fontWeight: FontWeight.w500,
            ),
          ),

          const SizedBox(height: DertamSpacings.s),
          // Full Name Label
          Text(
            'Full Name',
            style: DertamTextStyles.bodyMedium.copyWith(
              color: DertamColors.black,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: DertamSpacings.xs),

          // Full Name TextField
          DertamTextField(
            hintText: 'Full Name',
            controller: _fullNameController,
          ),
          const SizedBox(height: DertamSpacings.m),

          // Gender Selection
          Row(
            children: [
              Text(
                'Age',
                style: DertamTextStyles.bodyMedium.copyWith(
                  color: DertamColors.black,
                ),
              ),
              const SizedBox(width: DertamSpacings.xl),
              _buildGenderOption('male', 'Male'),
              const SizedBox(width: DertamSpacings.m),
              _buildGenderOption('female', 'Female'),
              const SizedBox(width: DertamSpacings.m),
              _buildGenderOption('other', 'Other'),
            ],
          ),
        ],
      ),
    );
  }

  ///
  /// Builds a gender radio button option
  ///
  Widget _buildGenderOption(String value, String label) {
    final bool isSelected = _selectedGender == value;
    return GestureDetector(
      onTap: () {
        setState(() {
          _selectedGender = value;
        });
      },
      child: Row(
        children: [
          Container(
            width: 12,
            height: 12,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(
                color: isSelected
                    ? DertamColors.primaryBlue
                    : Colors.grey.shade400,
                width: 2,
              ),
              color: isSelected ? DertamColors.primaryBlue : Colors.transparent,
            ),
          ),
          const SizedBox(width: 4),
          Text(
            label,
            style: DertamTextStyles.bodyMedium.copyWith(
              color: DertamColors.black,
            ),
          ),
        ],
      ),
    );
  }

  ///
  /// Builds the contact information section
  ///
  Widget _buildContactInformationSection() {
    return Container(
      decoration: BoxDecoration(
        color: DertamColors.white,
        borderRadius: BorderRadius.circular(10),
      ),
      padding: const EdgeInsets.all(DertamSpacings.m),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Section Title
          Text(
            'Contact Information',
            style: DertamTextStyles.subtitle.copyWith(
              color: DertamColors.primaryBlue,
              fontWeight: FontWeight.w500,
            ),
          ),

          const SizedBox(height: DertamSpacings.s),

          // Mobile
          Text(
            'Mobile',
            style: DertamTextStyles.bodyMedium.copyWith(
              color: DertamColors.black,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: DertamSpacings.xs),
          DertamTextField(
            hintText: '01234566',
            controller: _mobileController,
            keyboardType: TextInputType.phone,
          ),
          const SizedBox(height: DertamSpacings.m),

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
          const SizedBox(height: DertamSpacings.m),

          // ID Number
          Text(
            'ID Number',
            style: DertamTextStyles.bodyMedium.copyWith(
              color: DertamColors.black,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: DertamSpacings.xs),
          DertamTextField(
            hintText: 'ID Number',
            controller: _idNumberController,
          ),
          const SizedBox(height: DertamSpacings.m),

          // ID Upload Box
          _buildIdUploadBox(),
        ],
      ),
    );
  }

  ///
  /// Builds the ID document upload box
  ///
  Widget _buildIdUploadBox() {
    return GestureDetector(
      onTap: _handleIdUpload,
      child: Container(
        height: 130,
        decoration: BoxDecoration(
          color: DertamColors.white,
          borderRadius: BorderRadius.circular(DertamSpacings.radiusLarge),
          border: Border.all(color: const Color(0xFFD9D9D9), width: 1),
        ),
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.upload_file, size: 48, color: Colors.grey.shade300),
              const SizedBox(height: DertamSpacings.xs),
              Text(
                'Click here to upload the ID image',
                style: DertamTextStyles.body.copyWith(
                  color: const Color(0xFFB8B8B8),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  ///
  /// Builds the payment method selection section
  ///
  Widget _buildPaymentMethodSection() {
    return Container(
      decoration: BoxDecoration(
        color: DertamColors.white,
        borderRadius: BorderRadius.circular(10),
      ),
      padding: const EdgeInsets.all(DertamSpacings.m),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Section Title
          Text(
            'Payment Method',
            style: DertamTextStyles.subtitle.copyWith(
              color: DertamColors.primaryBlue,
              fontWeight: FontWeight.w500,
            ),
          ),

          const SizedBox(height: DertamSpacings.s),

          // Payment Options
          _buildPaymentOption(
            'khqr',
            'KH QR',
            'assets/images/bakong.jpg',
            hasCheckMark: true,
          ),
          const SizedBox(height: DertamSpacings.m),
          _buildPaymentOption('cash', 'Cash', 'assets/images/cash.jpg'),
          const SizedBox(height: DertamSpacings.m),
          _buildPaymentOption('aba', 'ABA Bank', 'assets/images/aba.jpg'),
          const SizedBox(height: DertamSpacings.m),
          _buildPaymentOption(
            'acelida',
            'Acelida Bank',
            'assets/images/aceleda.jpg',
          ),
        ],
      ),
    );
  }

  ///
  /// Builds a single payment option with radio button
  ///
  Widget _buildPaymentOption(
    String value,
    String label,
    String imagePath, {
    bool hasCheckMark = false,
  }) {
    return _PaymentOptionItem(
      value: value,
      label: label,
      imagePath: imagePath,
      isSelected: _selectedPaymentMethod == value,
      hasCheckMark: hasCheckMark,
      onTap: () {
        setState(() {
          _selectedPaymentMethod = value;
        });
      },
    );
  }

  ///
  /// Handles ID document upload
  ///
  void _handleIdUpload() {
    // TODO: Implement image picker for ID upload
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('ID upload functionality to be implemented'),
      ),
    );
  }

  ///
  /// Handles pay now button press
  ///
  void _handlePayNow() {
    // Validate form fields
    if (_fullNameController.text.isEmpty) {
      _showErrorSnackBar('Please enter your full name');
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

    if (_idNumberController.text.isEmpty) {
      _showErrorSnackBar('Please enter your ID number');
      return;
    }

    // TODO: Implement payment processing
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Processing payment via $_selectedPaymentMethod'),
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
class _PaymentOptionItem extends StatelessWidget {
  final String value;
  final String label;
  final String imagePath;
  final bool isSelected;
  final bool hasCheckMark;
  final VoidCallback onTap;

  const _PaymentOptionItem({
    required this.value,
    required this.label,
    required this.imagePath,
    required this.isSelected,
    required this.onTap,
    this.hasCheckMark = false,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Row(
        children: [
          // Payment method image/icon
          Container(
            width: 40,
            height: 40,
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Colors.grey.shade100,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Image.asset(
              imagePath,
              fit: BoxFit.contain,
              errorBuilder: (context, error, stackTrace) {
                return Icon(
                  Icons.payment,
                  color: DertamColors.primaryBlue,
                  size: 24,
                );
              },
            ),
          ),
          const SizedBox(width: DertamSpacings.m),

          // Label
          Expanded(
            child: Text(
              label,
              style: DertamTextStyles.bodyMedium.copyWith(
                color: DertamColors.black,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),

          // Radio Button or Check Mark
          if (hasCheckMark && isSelected)
            Icon(Icons.check_circle, color: DertamColors.primaryBlue, size: 18)
          else
            Container(
              width: 15,
              height: 15,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(
                  color: isSelected
                      ? DertamColors.primaryBlue
                      : Colors.grey.shade400,
                  width: 2,
                ),
                color: isSelected
                    ? DertamColors.primaryBlue
                    : Colors.transparent,
              ),
            ),
        ],
      ),
    );
  }
}
