import 'package:flutter/material.dart';

class TamSearchbar extends StatefulWidget {
  final VoidCallback onSearchTap;

  const TamSearchbar({super.key, required this.onSearchTap});

  @override
  State<TamSearchbar> createState() => _TamSearchbarState();
}

class _TamSearchbarState extends State<TamSearchbar> {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(25),
      ),
      child: Row(
        children: [
          const Icon(Icons.search, color: Colors.grey),
          const SizedBox(width: 8),
          Expanded(
            child: GestureDetector(
              onTap: widget.onSearchTap,
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 15),
                child: const Text(
                  'Search destination',
                  style: TextStyle(color: Colors.grey),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
