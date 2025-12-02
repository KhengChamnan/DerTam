import 'dart:async';

import 'package:flutter/material.dart';
import 'package:mobile_frontend/models/place/place.dart';
import 'package:mobile_frontend/ui/providers/place_provider.dart';
import 'package:mobile_frontend/ui/screen/place_datail/place_detailed.dart';
import 'package:mobile_frontend/ui/theme/dertam_apptheme.dart';
import 'package:mobile_frontend/ui/widgets/place_search_card.dart';
import 'package:provider/provider.dart';

class DertamSearchPlaceScreen extends StatefulWidget {
  const DertamSearchPlaceScreen({super.key});

  @override
  State<DertamSearchPlaceScreen> createState() =>
      _DertamSearchPlaceScreenState();
}

class _DertamSearchPlaceScreenState extends State<DertamSearchPlaceScreen> {
  // ----------------------------------
  // Search State
  // ----------------------------------

  List<Place> searchResults = [];
  String searchText = '';
  bool isLoading = false;
  String? errorMessage;
  Timer? _debounceTimer;

  @override
  void dispose() {
    _debounceTimer?.cancel();
    super.dispose();
  }

  void onBackSelected() {
    Navigator.of(context).pop();
  }

  void onPlaceSelected(Place place) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => DetailEachPlace(placeId: place.placeId),
      ),
    );
  }

  Future<void> _performSearch(String query) async {
    if (query.isEmpty) {
      setState(() {
        searchResults = [];
        isLoading = false;
        errorMessage = null;
      });
      return;
    }

    setState(() {
      isLoading = true;
      errorMessage = null;
    });

    try {
      final placeProvider = context.read<PlaceProvider>();
      final results = await placeProvider.searchAllPlace(query);
      if (mounted) {
        setState(() {
          searchResults = results;
          isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          isLoading = false;
          errorMessage = 'Failed to search places. Please try again.';
        });
      }
    }
  }

  void onSearchChanged(String searchText) {
    setState(() {
      this.searchText = searchText;
    });

    // Cancel the previous timer
    _debounceTimer?.cancel();

    // Set a new timer for debouncing (wait 500ms after user stops typing)
    _debounceTimer = Timer(const Duration(milliseconds: 500), () {
      _performSearch(searchText);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: DertamColors.backgroundWhite,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.only(left: 8, right: 8.0, top: 8.0),
          child: Column(
            children: [
              // Top search Search bar
              _DertamSearchBar(
                onBackPressed: onBackSelected,
                onSearchChanged: onSearchChanged,
              ),

              const SizedBox(height: 16),
              // Search results
              Expanded(child: _buildSearchContent()),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSearchContent() {
    // Show loading indicator
    if (isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    // Show error message
    if (errorMessage != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.error_outline,
              size: 64,
              color: DertamColors.red.withOpacity(0.5),
            ),
            const SizedBox(height: 16),
            Text(
              errorMessage!,
              style: DertamTextStyles.body.copyWith(
                color: DertamColors.textLight,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () => _performSearch(searchText),
              child: const Text('Retry'),
            ),
          ],
        ),
      );
    }

    // Show empty state
    if (searchResults.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.search,
              size: 64,
              color: DertamColors.textLight.withOpacity(0.5),
            ),
            const SizedBox(height: 16),
            Text(
              searchText.isEmpty
                  ? 'Search for places'
                  : 'No places found for "$searchText"',
              style: DertamTextStyles.body.copyWith(
                color: DertamColors.textLight,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      );
    }

    // Show search results
    return ListView.builder(
      itemCount: searchResults.length,
      itemBuilder: (ctx, index) => PlaceSearchCard(
        place: searchResults[index],
        onTap: () => onPlaceSelected(searchResults[index]),
      ),
    );
  }
}

class _DertamSearchBar extends StatefulWidget {
  const _DertamSearchBar({
    required this.onSearchChanged,
    required this.onBackPressed,
  });

  final Function(String text) onSearchChanged;
  final VoidCallback onBackPressed;

  @override
  State<_DertamSearchBar> createState() => _DertamSearchBarState();
}

class _DertamSearchBarState extends State<_DertamSearchBar> {
  final TextEditingController _controller = TextEditingController();
  final FocusNode _focusNode = FocusNode();

  bool get searchIsNotEmpty => _controller.text.isNotEmpty;

  void onChanged(String newText) {
    // 1 - Notity the listener
    widget.onSearchChanged(newText);

    // 2 - Update the cross icon
    setState(() {});
  }

  @override
  void dispose() {
    _controller.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: DertamColors.backgroundAccent,
        borderRadius: BorderRadius.circular(
          DertamSpacings.radius,
        ), // Rounded corners
      ),
      child: Row(
        children: [
          // Left icon
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 4),
            child: IconButton(
              onPressed: widget.onBackPressed,
              icon: Icon(
                Icons.arrow_back_ios,
                color: DertamColors.neutralLighter,
                size: 16,
              ),
            ),
          ),

          Expanded(
            child: TextField(
              focusNode: _focusNode, // Keep focus
              onChanged: onChanged,
              controller: _controller,
              style: TextStyle(color: DertamColors.neutralLight),
              decoration: const InputDecoration(
                hintText: "Search places, categories, provinces...",
                border: InputBorder.none, // No border
                enabledBorder: InputBorder.none, // No border when enabled
                focusedBorder: InputBorder.none, // No border when focused
                filled: false, // No background fill
              ),
            ),
          ),

          searchIsNotEmpty // A clear button appears when search contains some text
              ? IconButton(
                  icon: Icon(Icons.close, color: DertamColors.neutralLighter),
                  onPressed: () {
                    _controller.clear();
                    _focusNode.requestFocus(); // Ensure it stays focused
                    onChanged("");
                  },
                )
              : const SizedBox.shrink(), // Hides the icon if text field is empty
        ],
      ),
    );
  }
}
