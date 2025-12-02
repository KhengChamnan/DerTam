import 'package:flutter/material.dart';
import 'package:mobile_frontend/ui/screen/home_screen/home_page.dart';
import 'package:mobile_frontend/ui/theme/dertam_apptheme.dart';


class DertamBookingSuccessScreen extends StatefulWidget {
  const DertamBookingSuccessScreen({super.key});

  @override
  State<DertamBookingSuccessScreen> createState() =>
      _DertamBookingSuccessScreenState();
}

class _DertamBookingSuccessScreenState
    extends State<DertamBookingSuccessScreen> {
  @override
  void initState() {
    super.initState();
    // Navigate to home page after 5 seconds
    Future.delayed(const Duration(seconds: 5), () {
      if (mounted) {
        Navigator.of(context).pushAndRemoveUntil(
          MaterialPageRoute(builder: (context) => const HomePage()),
          (route) => false,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final screenHeight = MediaQuery.of(context).size.height;
    final screenWidth = MediaQuery.of(context).size.width;

    return Scaffold(
      backgroundColor: DertamColors.white,
      body: SafeArea(
        child: Stack(
          children: [
            // Success Icon/Image
            Positioned(
              top: screenHeight * 0.2149,
              left: screenWidth * 0.2196,
              right: screenWidth * 0.2196,
              child: Container(
                height: screenHeight * 0.2592,
                decoration: BoxDecoration(
                  color: DertamColors.primaryBlue.withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: Center(
                  child: Icon(
                    Icons.check_circle,
                    size: screenWidth * 0.35,
                    color: DertamColors.primaryBlue,
                  ),
                ),
              ),
            ),

            // Success Message
            Positioned(
              top: screenHeight * 0.5,
              left: screenWidth * 0.2313,
              right: screenWidth * 0.2173,
              child: Text(
                'Your order has been\nplaced successfully',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontFamily: 'Inter',
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: DertamColors.primaryDark,
                  height: 1.2,
                ),
              ),
            ),

            // Thank You Message
            Positioned(
              top: screenHeight * 0.5886,
              left: screenWidth * 0.0794,
              right: screenWidth * 0.0794,
              child: Text(
                'Thank you for choosing us! Feel free to reach\nus if you have any problems with your\nroom. Have a nice day!',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontFamily: 'Inter',
                  fontSize: 16,
                  fontWeight: FontWeight.w300,
                  color: DertamColors.primaryBlue,
                  height: 1.3,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
