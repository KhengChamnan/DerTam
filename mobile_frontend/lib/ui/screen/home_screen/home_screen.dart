import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:mobile_frontend/ui/providers/auth_provider.dart';
import 'package:mobile_frontend/ui/screen/auth_screen/login/dertam_login_screen.dart';
import 'package:mobile_frontend/ui/theme/dertam_apptheme.dart';
import 'package:mobile_frontend/ui/widgets/actions/dertam_button.dart';

///
/// Home Screen
/// Main screen after user logs in successfully
///
class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  /// Handle logout action
  Future<void> _handleLogout(BuildContext context) async {
    // Show confirmation dialog
    final shouldLogout = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(
          'Logout',
          style: DertamTextStyles.title.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        content: Text(
          'Are you sure you want to logout?',
          style: DertamTextStyles.body,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: Text(
              'Cancel',
              style: DertamTextStyles.button.copyWith(
                color: DertamColors.greyDark,
              ),
            ),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: Text(
              'Logout',
              style: DertamTextStyles.button.copyWith(
                color: Colors.red,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
    );

    // If user confirmed logout
    if (shouldLogout == true && context.mounted) {
      // Get auth provider
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      
      // Call logout
      await authProvider.logout();

      // Show success message
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Logged out successfully'),
            backgroundColor: Colors.green,
          ),
        );

        // Navigate back to login screen
        Navigator.pushAndRemoveUntil(
          context,
          MaterialPageRoute(builder: (context) => const DertamLoginScreen()),
          (route) => false,
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: DertamColors.backgroundWhite,
      appBar: AppBar(
        title: Text(
          'Home',
          style: DertamTextStyles.title.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        backgroundColor: DertamColors.white,
        elevation: 0,
        centerTitle: true,
        actions: [
          // Logout icon button
          IconButton(
            icon: Icon(
              Icons.logout,
              color: DertamColors.primaryDark,
            ),
            onPressed: () => _handleLogout(context),
            tooltip: 'Logout',
          ),
        ],
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(DertamSpacings.l),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Welcome message
              Consumer<AuthProvider>(
                builder: (context, authProvider, child) {
                  return Column(
                    children: [
                      Icon(
                        Icons.check_circle,
                        size: 80,
                        color: Colors.green,
                      ),
                      const SizedBox(height: DertamSpacings.l),
                      Text(
                        'Welcome!',
                        style: DertamTextStyles.heading.copyWith(
                          fontWeight: FontWeight.bold,
                          color: DertamColors.primaryDark,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: DertamSpacings.m),
                      Text(
                        'You are successfully logged in',
                        style: DertamTextStyles.body.copyWith(
                          color: DertamColors.greyDark,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: DertamSpacings.s),
                      if (authProvider.isAuthenticated)
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: DertamSpacings.m,
                            vertical: DertamSpacings.xs,
                          ),
                          decoration: BoxDecoration(
                            color: Colors.green.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(DertamSpacings.radiusSmall),
                          ),
                          child: Text(
                            'Authenticated ✓',
                            style: DertamTextStyles.bodyMedium.copyWith(
                              color: Colors.green,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                    ],
                  );
                },
              ),
              
              const SizedBox(height: DertamSpacings.xxl * 2),
              
              // Logout button
              DertamButton(
                text: 'Logout',
                onPressed: () => _handleLogout(context),
                backgroundColor: Colors.red,
                textColor: DertamColors.white,
              ),
              
              const SizedBox(height: DertamSpacings.m),
              
              // Additional info
              Container(
                padding: const EdgeInsets.all(DertamSpacings.m),
                decoration: BoxDecoration(
                  color: DertamColors.backgroundLight,
                  borderRadius: BorderRadius.circular(DertamSpacings.radius),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Session Info:',
                      style: DertamTextStyles.body.copyWith(
                        fontWeight: FontWeight.bold,
                        color: DertamColors.primaryDark,
                      ),
                    ),
                    const SizedBox(height: DertamSpacings.xs),
                    Consumer<AuthProvider>(
                      builder: (context, authProvider, child) {
                        return Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            _buildInfoRow(
                              'Status:',
                              authProvider.isAuthenticated ? 'Active' : 'Inactive',
                              authProvider.isAuthenticated ? Colors.green : Colors.red,
                            ),
                            const SizedBox(height: DertamSpacings.xs),
                            _buildInfoRow(
                              'Token:',
                              authProvider.authToken != null 
                                  ? '${authProvider.authToken!.substring(0, 20)}...' 
                                  : 'No token',
                              DertamColors.greyDark,
                            ),
                          ],
                        );
                      },
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  /// Build info row widget
  Widget _buildInfoRow(String label, String value, Color valueColor) {
    return Row(
      children: [
        Text(
          label,
          style: DertamTextStyles.bodyMedium.copyWith(
            color: DertamColors.greyDark,
          ),
        ),
        const SizedBox(width: DertamSpacings.xs),
        Expanded(
          child: Text(
            value,
            style: DertamTextStyles.bodyMedium.copyWith(
              color: valueColor,
              fontWeight: FontWeight.bold,
            ),
            overflow: TextOverflow.ellipsis,
          ),
        ),
      ],
    );
  }
}