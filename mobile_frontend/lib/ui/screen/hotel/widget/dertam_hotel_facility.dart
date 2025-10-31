import 'package:flutter/material.dart';

class FacilitiesList extends StatelessWidget {
  final String imageUrl;
  const FacilitiesList({super.key, required this.imageUrl});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 96,
      width: 96,
      child: ClipRRect(
        borderRadius: const BorderRadius.vertical(
          top: Radius.circular(20),
          bottom: Radius.circular(20),
        ),
        child: Image.network(imageUrl, fit: BoxFit.cover),
      ),
    );
  }
}
