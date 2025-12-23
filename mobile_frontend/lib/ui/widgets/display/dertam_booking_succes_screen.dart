import 'package:flutter/material.dart';
import 'package:mobile_frontend/ui/screen/profile/widget/dertam_booking_screen.dart';

class DertamBookingSuccessDialog extends StatefulWidget {
  const DertamBookingSuccessDialog({super.key});

  /// Shows the booking success dialog
  static Future<void> show(BuildContext context) {
    return showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const DertamBookingSuccessDialog(),
    );
  }

  @override
  State<DertamBookingSuccessDialog> createState() =>
      _DertamBookingSuccessDialogState();
}

class _DertamBookingSuccessDialogState
    extends State<DertamBookingSuccessDialog> {
  @override
  void initState() {
    super.initState();
    // Navigate to home page after 3 seconds
    Future.delayed(const Duration(seconds: 5), () {
      if (mounted) {
        Navigator.of(context).pushAndRemoveUntil(
          MaterialPageRoute(builder: (context) => const DertamBookingScreen()),
          (route) => false,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: Colors.white,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      insetPadding: const EdgeInsets.symmetric(horizontal: 40),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Green header with checkmark
          Container(
            width: double.infinity,
            height: 180,
            decoration: const BoxDecoration(
              color: Color(0xFF2ECC71),
              borderRadius: BorderRadius.only(
                topLeft: Radius.circular(16),
                topRight: Radius.circular(16),
                bottomLeft: Radius.circular(100),
                bottomRight: Radius.circular(100),
              ),
            ),
            child: Center(
              child: Container(
                width: 90,
                height: 90,
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.2),
                  shape: BoxShape.circle,
                ),
                child: Center(
                  child: Icon(
                    Icons.check_rounded,
                    size: 55,
                    color: Colors.white,
                  ),
                ),
              ),
            ),
          ),
          // Success text content
          Padding(
            padding: const EdgeInsets.fromLTRB(24, 28, 24, 32),
            child: Column(
              children: const [
                Text(
                  'Success',
                  style: TextStyle(
                    fontFamily: 'Inter',
                    fontSize: 22,
                    fontWeight: FontWeight.w700,
                    color: Colors.black87,
                  ),
                ),
                SizedBox(height: 10),
                Text(
                  'Transaction Completed Successfully!',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontFamily: 'Inter',
                    fontSize: 15,
                    fontWeight: FontWeight.w400,
                    color: Colors.black45,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
