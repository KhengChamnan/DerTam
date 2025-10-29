import 'package:flutter/material.dart';

class RoomThumbnail extends StatelessWidget {
  final String imageUrl;

  const RoomThumbnail({super.key, required this.imageUrl});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 70,
      height: 70,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        image: imageUrl.isNotEmpty
            ? DecorationImage(image: NetworkImage(imageUrl), fit: BoxFit.cover)
            : null,
        color: imageUrl.isEmpty ? Colors.grey[300] : null,
      ),
      child: imageUrl.isEmpty
          ? Icon(Icons.hotel, color: Colors.grey[500])
          : null,
    );
  }
}
