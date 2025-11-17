import 'package:flutter/material.dart';
import 'package:mobile_frontend/ui/theme/dertam_apptheme.dart';
import 'package:mobile_frontend/ui/widgets/actions/dertam_button.dart';
import 'package:mobile_frontend/ui/widgets/inputs/dertam_text_field.dart';
import 'package:mobile_frontend/ui/screen/trip/widgets/trip_select_date_screen.dart';
import 'package:mobile_frontend/ui/widgets/navigation/navigation_bar.dart';

class TripPlanning extends StatefulWidget {
  const TripPlanning({super.key});

  @override
  State<TripPlanning> createState() => _TripPlanningState();
}

class _TripPlanningState extends State<TripPlanning> {
  final TextEditingController _tripNameController = TextEditingController();

  @override
  void dispose() {
    _tripNameController.dispose();
    super.dispose();
  }

  void _continueToDateSelection() {
    if (_tripNameController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please enter a trip name'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) =>
            TripDateScreen(tripName: _tripNameController.text.trim()),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: DertamColors.white,
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: Padding(
                padding: EdgeInsets.all(DertamSpacings.l),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    const Spacer(flex: 2),

                    // Title
                    Text(
                      'Give your trip a name',
                      style: DertamTextStyles.heading.copyWith(
                        color: DertamColors.black,
                        fontWeight: FontWeight.bold,
                        fontSize: 24,
                      ),
                      textAlign: TextAlign.center,
                    ),

                    SizedBox(height: DertamSpacings.m),

                    // Subtitle
                    Text(
                      'What should we call this adventure?',
                      style: DertamTextStyles.body.copyWith(
                        color: Colors.grey[600],
                        fontSize: 16,
                      ),
                      textAlign: TextAlign.center,
                    ),

                    SizedBox(height: DertamSpacings.xl * 2),

                    // Text Input
                    DertamTextField(
                      hintText: 'Enter here',
                      controller: _tripNameController,
                      onChanged: (value) {
                        setState(() {}); // Refresh to update button state
                      },
                    ),

                    const Spacer(flex: 3),
                  ],
                ),
              ),
            ),

            // Continue Button
            Padding(
              padding: EdgeInsets.all(DertamSpacings.l),
              child: DertamButton(
                text: 'Continue',
                onPressed: _tripNameController.text.trim().isNotEmpty
                    ? _continueToDateSelection
                    : () {},
                backgroundColor: _tripNameController.text.trim().isNotEmpty
                    ? DertamColors.primaryDark
                    : Colors.grey[400],
                width: double.infinity,
              ),
            ),
          ],
        ),
      ),
      // Use your existing Navigationbar component
      bottomNavigationBar: const Navigationbar(currentIndex: 2),
    );
  }
}
