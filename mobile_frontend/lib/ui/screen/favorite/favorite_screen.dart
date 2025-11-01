import 'package:flutter/material.dart';
import 'package:mobile_frontend/ui/widgets/navigation/navigation_bar.dart';

class FavoriteScreen extends StatelessWidget {
  const FavoriteScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Favorite Screen')),
      body: const Center(child: Text('This is the Favorite Screen')),
      bottomNavigationBar: Navigationbar(currentIndex: 3),
    );
  }
}
