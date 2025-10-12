import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:mobile_frontend/ui/screen/auth_screen/login/dertam_login_screen.dart';
import 'package:mobile_frontend/ui/providers/auth_provider.dart';
import 'package:mobile_frontend/ui/theme/dertam_apptheme.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
      ],
      child: MaterialApp(
        title: 'DerTam',
        debugShowCheckedModeBanner: false,
        theme: dertamAppTheme,
        home: const DertamLoginScreen(),
      ),
    );
  }
}
