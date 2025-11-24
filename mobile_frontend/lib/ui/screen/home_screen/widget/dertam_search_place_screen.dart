import 'package:flutter/material.dart';
import 'package:mobile_frontend/ui/theme/dertam_apptheme.dart';

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

  List<SearchResult> allResults = [];
  List<SearchResult> filteredResults = [];
  String searchText = '';
  bool isLoading = false;

  @override
  void initState() {
    super.initState();
    _initializeSearchData();
  }

  void _initializeSearchData() {
    // Initialize with sample data - Replace with API call
    allResults = [
      // Places
      SearchResult(
        type: SearchResultType.place,
        title: 'Sigiriya Rock Fortress',
        subtitle: 'Cultural Triangle • Historical Site',
        province: 'Central Province',
        categoryName: 'Historical Site',
      ),
      SearchResult(
        type: SearchResultType.place,
        title: 'Temple of the Tooth',
        subtitle: 'Kandy • Religious Site',
        province: 'Central Province',
        categoryName: 'Religious Site',
      ),
      SearchResult(
        type: SearchResultType.place,
        title: 'Yala National Park',
        subtitle: 'Yala • Wildlife',
        province: 'Southern Province',
        categoryName: 'National Park',
      ),
      SearchResult(
        type: SearchResultType.place,
        title: 'Galle Fort',
        subtitle: 'Galle • Historical Site',
        province: 'Southern Province',
        categoryName: 'Historical Site',
      ),
      SearchResult(
        type: SearchResultType.place,
        title: 'Ella Rock',
        subtitle: 'Ella • Nature & Adventure',
        province: 'Uva Province',
        categoryName: 'Mountain',
      ),
      SearchResult(
        type: SearchResultType.place,
        title: 'Nine Arch Bridge',
        subtitle: 'Ella • Landmark',
        province: 'Uva Province',
        categoryName: 'Landmark',
      ),
      SearchResult(
        type: SearchResultType.place,
        title: 'Mirissa Beach',
        subtitle: 'Mirissa • Beach',
        province: 'Southern Province',
        categoryName: 'Beach',
      ),
      SearchResult(
        type: SearchResultType.place,
        title: 'Horton Plains',
        subtitle: 'Nuwara Eliya • Nature Reserve',
        province: 'Central Province',
        categoryName: 'National Park',
      ),
      // Categories
      SearchResult(
        type: SearchResultType.category,
        title: 'Historical Sites',
        subtitle: 'Ancient temples, forts & ruins',
        categoryName: 'Historical Site',
      ),
      SearchResult(
        type: SearchResultType.category,
        title: 'Beaches',
        subtitle: 'Coastal attractions & water sports',
        categoryName: 'Beach',
      ),
      SearchResult(
        type: SearchResultType.category,
        title: 'Wildlife & Nature',
        subtitle: 'National parks & safaris',
        categoryName: 'Wildlife',
      ),
      SearchResult(
        type: SearchResultType.category,
        title: 'Religious Sites',
        subtitle: 'Temples, churches & sacred places',
        categoryName: 'Religious Site',
      ),
      // Provinces
      SearchResult(
        type: SearchResultType.province,
        title: 'Western Province',
        subtitle: 'Colombo, Gampaha, Kalutara',
        province: 'Western Province',
      ),
      SearchResult(
        type: SearchResultType.province,
        title: 'Central Province',
        subtitle: 'Kandy, Matale, Nuwara Eliya',
        province: 'Central Province',
      ),
      SearchResult(
        type: SearchResultType.province,
        title: 'Southern Province',
        subtitle: 'Galle, Matara, Hambantota',
        province: 'Southern Province',
      ),
    ];

    filteredResults = allResults;
  }

  void onBackSelected() {
    Navigator.of(context).pop();
  }

  void onResultSelected(SearchResult result) {
    // Return the selected result to the previous screen
    Navigator.of(context).pop(result);
  }

  void onSearchChanged(String searchText) {
    setState(() {
      this.searchText = searchText;
      if (searchText.isEmpty) {
        filteredResults = allResults;
      } else {
        final query = searchText.toLowerCase();
        filteredResults = allResults.where((result) {
          final titleMatch = result.title.toLowerCase().contains(query);
          final subtitleMatch = result.subtitle.toLowerCase().contains(query);
          final provinceMatch =
              result.province?.toLowerCase().contains(query) ?? false;
          final categoryMatch =
              result.categoryName?.toLowerCase().contains(query) ?? false;

          return titleMatch || subtitleMatch || provinceMatch || categoryMatch;
        }).toList();
      }
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
              Expanded(
                child: filteredResults.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.search_off,
                              size: 64,
                              color: DertamColors.textLight.withOpacity(0.5),
                            ),
                            const SizedBox(height: 16),
                            Text(
                              searchText.isEmpty
                                  ? 'Search for places, categories, or provinces'
                                  : 'No results found',
                              style: DertamTextStyles.body.copyWith(
                                color: DertamColors.textLight,
                              ),
                              textAlign: TextAlign.center,
                            ),
                          ],
                        ),
                      )
                    : ListView.builder(
                        itemCount: filteredResults.length,
                        itemBuilder: (ctx, index) => _SearchResultTile(
                          result: filteredResults[index],
                          onSelected: onResultSelected,
                        ),
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ============= SEARCH RESULT MODEL =============

enum SearchResultType { place, category, province }

class SearchResult {
  final SearchResultType type;
  final String title;
  final String subtitle;
  final String? province;
  final String? categoryName;
  final String? placeId;
  final int? categoryId;
  final int? provinceId;

  SearchResult({
    required this.type,
    required this.title,
    required this.subtitle,
    this.province,
    this.categoryName,
    this.placeId,
    this.categoryId,
    this.provinceId,
  });
}

// ============= SEARCH RESULT TILE =============

class _SearchResultTile extends StatelessWidget {
  final SearchResult result;
  final Function(SearchResult) onSelected;

  const _SearchResultTile({required this.result, required this.onSelected});

  IconData get _icon {
    switch (result.type) {
      case SearchResultType.place:
        return Icons.place;
      case SearchResultType.category:
        return Icons.category;
      case SearchResultType.province:
        return Icons.map;
    }
  }

  Color get _iconColor {
    switch (result.type) {
      case SearchResultType.place:
        return DertamColors.primaryBlue;
      case SearchResultType.category:
        return const Color(0xFFF5A522);
      case SearchResultType.province:
        return const Color(0xFF4CAF50);
    }
  }

  String get _typeLabel {
    switch (result.type) {
      case SearchResultType.place:
        return 'Place';
      case SearchResultType.category:
        return 'Category';
      case SearchResultType.province:
        return 'Province';
    }
  }

  @override
  Widget build(BuildContext context) {
    return ListTile(
      onTap: () => onSelected(result),
      leading: Container(
        width: 48,
        height: 48,
        decoration: BoxDecoration(
          color: _iconColor.withOpacity(0.1),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Icon(_icon, color: _iconColor, size: 24),
      ),
      title: Row(
        children: [
          Expanded(
            child: Text(
              result.title,
              style: DertamTextStyles.body.copyWith(
                color: DertamColors.primaryDark,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: _iconColor.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              _typeLabel,
              style: DertamTextStyles.label.copyWith(
                color: _iconColor,
                fontSize: 10,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
      subtitle: Text(
        result.subtitle,
        style: DertamTextStyles.label.copyWith(color: DertamColors.textLight),
      ),
      trailing: Icon(
        Icons.arrow_forward_ios,
        color: DertamColors.textLight,
        size: 16,
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
            padding: const EdgeInsets.symmetric(horizontal: 8),
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
