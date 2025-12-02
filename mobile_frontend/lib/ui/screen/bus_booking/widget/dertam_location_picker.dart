import 'package:flutter/material.dart';
import 'package:mobile_frontend/models/province/province_category_detail.dart';
import 'package:mobile_frontend/ui/providers/bus_booking_provider.dart';
import 'package:mobile_frontend/ui/theme/dertam_apptheme.dart';
import 'package:provider/provider.dart';

class DertamLocationPicker extends StatefulWidget {
  final ProvinceCategoryDetail? initLocation;

  const DertamLocationPicker({super.key, this.initLocation});

  @override
  State<DertamLocationPicker> createState() => _DertamLocationPickerState();
}

class _DertamLocationPickerState extends State<DertamLocationPicker> {
  // State variables
  String searchText = '';
  List<ProvinceCategoryDetail> filteredProvinces = [];

  @override
  void initState() {
    super.initState();
    final busBookingProvider = context.read<BusBookingProvider>();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      busBookingProvider.fetchListLocation();
    });
  }

  void onBackSelected() {
    Navigator.of(context).pop();
  }

  void onLocationSelected(ProvinceCategoryDetail province) {
    // Return the province with ID when selected
    Navigator.of(context).pop(province);
  }

  void onSearchChanged(String newSearchText) {
    setState(() {
      searchText = newSearchText;
    });
  }

  @override
  Widget build(BuildContext context) {
    final busBookingProvider = context.watch<BusBookingProvider>();
    final locationAsyncValue = busBookingProvider.location;

    // Debug print to see the state
    print('Location Picker - State: ${locationAsyncValue.state}');

    return Scaffold(
      backgroundColor: DertamColors.backgroundWhite,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.only(left: 8, right: 8.0, top: 8.0),
          child: Column(
            children: [
              // Top search Search bar
              DertamSearchBar(
                onBackPressed: onBackSelected,
                onSearchChanged: onSearchChanged,
              ),
              const SizedBox(height: 16),

              // Handle async states
              Expanded(
                child: locationAsyncValue.when(
                  empty: () =>
                      const Center(child: Text('Tap to search locations')),
                  loading: () =>
                      const Center(child: CircularProgressIndicator()),
                  error: (error) => Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.error_outline,
                          color: DertamColors.red,
                          size: 48,
                        ),
                        const SizedBox(height: 16),
                        Text(
                          'Failed to load locations',
                          style: DertamTextStyles.body.copyWith(
                            color: DertamColors.red,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          error.toString(),
                          style: DertamTextStyles.label.copyWith(
                            color: DertamColors.textLight,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ),
                  ),
                  success: (provinceResponse) {
                    // Debug print
                    final provinces = provinceResponse.provinces;
                    print('Provinces loaded: ${provinces.length}');
                    if (provinces.isNotEmpty) {
                      print(
                        'First province: ${provinces.first.provinceCategoryName}',
                      );
                    }

                    // Filter provinces based on search text
                    final displayProvinces = searchText.isEmpty
                        ? provinces
                        : provinces.where((province) {
                            final name =
                                province.provinceCategoryName?.toLowerCase() ??
                                '';
                            final description =
                                province.categoryDescription?.toLowerCase() ??
                                '';
                            final search = searchText.toLowerCase();
                            return name.contains(search) ||
                                description.contains(search);
                          }).toList();

                    return displayProvinces.isEmpty
                        ? Center(
                            child: Text(
                              'No locations found',
                              style: DertamTextStyles.body.copyWith(
                                color: DertamColors.textLight,
                              ),
                            ),
                          )
                        : ListView.builder(
                            itemCount: displayProvinces.length,
                            itemBuilder: (ctx, index) => LocationTile(
                              location: displayProvinces[index],
                              onSelected: onLocationSelected,
                            ),
                          );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class LocationTile extends StatelessWidget {
  final ProvinceCategoryDetail location;
  final Function(ProvinceCategoryDetail location) onSelected;

  const LocationTile({
    super.key,
    required this.location,
    required this.onSelected,
  });

  String get title => location.provinceCategoryName ?? 'Unknown';

  @override
  Widget build(BuildContext context) {
    return ListTile(
      onTap: () => onSelected(location),
      leading: Icon(
        Icons.location_on_outlined,
        color: DertamColors.primaryBlue,
      ),
      title: Text(
        title,
        style: DertamTextStyles.body.copyWith(
          color: DertamColors.primaryDark,
          fontWeight: FontWeight.w500,
        ),
      ),

      trailing: Icon(
        Icons.arrow_forward_ios,
        color: DertamColors.textLight,
        size: 16,
      ),
    );
  }
}

class DertamSearchBar extends StatefulWidget {
  const DertamSearchBar({
    super.key,
    required this.onSearchChanged,
    required this.onBackPressed,
  });

  final Function(String text) onSearchChanged;
  final VoidCallback onBackPressed;

  @override
  State<DertamSearchBar> createState() => _DertamSearchBarState();
}

class _DertamSearchBarState extends State<DertamSearchBar> {
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
              decoration: InputDecoration(
                hintText: "Any city, street...",
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
              : SizedBox.shrink(), // Hides the icon if text field is empty
        ],
      ),
    );
  }
}
