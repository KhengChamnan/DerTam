import 'package:flutter/material.dart';
import 'package:mobile_frontend/models/booking/location.dart';
import 'package:mobile_frontend/ui/theme/dertam_apptheme.dart';

class DertamLocationPicker extends StatefulWidget {
  final Location?
  initLocation; 

  const DertamLocationPicker({super.key, this.initLocation});

  @override
  State<DertamLocationPicker> createState() => _DertamLocationPickerState();
}

class _DertamLocationPickerState extends State<DertamLocationPicker> {
  // ----------------------------------
  // Initialize the Form attributes
  // ----------------------------------

  // Sample locations for Sri Lanka (you can expand this list)
  final List<Location> allLocations = const [
    Location(
      name: 'Colombo',
      country: Country.france,
    ), // Using france as placeholder for Sri Lanka
    Location(name: 'Kelaniya', country: Country.france),
    Location(name: 'Biyagama', country: Country.france),
    Location(name: 'Gampaha', country: Country.france),
    Location(name: 'Negombo', country: Country.france),
    Location(name: 'Kandy', country: Country.france),
    Location(name: 'Galle', country: Country.france),
    Location(name: 'Matara', country: Country.france),
    Location(name: 'Jaffna', country: Country.france),
    Location(name: 'Trincomalee', country: Country.france),
    Location(name: 'Anuradhapura', country: Country.france),
    Location(name: 'Polonnaruwa', country: Country.france),
    Location(name: 'Batticaloa', country: Country.france),
    Location(name: 'Kurunegala', country: Country.france),
    Location(name: 'Ratnapura', country: Country.france),
  ];

  List<Location> filteredLocations = [];
  String searchText = '';

  @override
  void initState() {
    super.initState();
    filteredLocations = allLocations; // Initially show all locations
  }

  void onBackSelected() {
    Navigator.of(context).pop();
  }

  void onLocationSelected(Location location) {
    Navigator.of(context).pop(location);
  }

  void onSearchChanged(String searchText) {
    setState(() {
      this.searchText = searchText;
      if (searchText.isEmpty) {
        filteredLocations = allLocations;
      } else {
        filteredLocations = allLocations
            .where(
              (location) => location.name.toLowerCase().contains(
                searchText.toLowerCase(),
              ),
            )
            .toList();
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
              DertamSearchBar(
                onBackPressed: onBackSelected,
                onSearchChanged: onSearchChanged,
              ),

              const SizedBox(height: 16),
              Expanded(
                child: filteredLocations.isEmpty
                    ? Center(
                        child: Text(
                          'No locations found',
                          style: DertamTextStyles.body.copyWith(
                            color: DertamColors.textLight,
                          ),
                        ),
                      )
                    : ListView.builder(
                        itemCount: filteredLocations.length,
                        itemBuilder: (ctx, index) => LocationTile(
                          location: filteredLocations[index],
                          onSelected: onLocationSelected,
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


class LocationTile extends StatelessWidget {
  final Location location;
  final Function(Location location) onSelected;

  const LocationTile({
    super.key,
    required this.location,
    required this.onSelected,
  });

  String get title => location.name;

  String get subTitle => 'Sri Lanka'; 

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
      subtitle: Text(
        subTitle,
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
