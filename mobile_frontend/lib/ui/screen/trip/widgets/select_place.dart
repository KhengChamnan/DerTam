import 'package:flutter/material.dart';
import 'package:mobile_frontend/ui/screen/trip/widgets/review_trip_screen.dart';
import 'package:mobile_frontend/ui/theme/dertam_apptheme.dart';
import 'package:mobile_frontend/ui/widgets/actions/dertam_button.dart';
import 'package:mobile_frontend/models/place/place.dart';
// import 'package:mobile_frontend/models/trips/trips.dart';
// import 'package:mobile_frontend/models/trips/trip_days.dart';

class SelectPlaceScreen extends StatefulWidget {
  final String tripId;
  final String tripName;
  final DateTime startDate;
  final DateTime endDate;
  final List<Map<String, dynamic>>? existingPlaces;
  final DateTime? preSelectedDate;

  const SelectPlaceScreen({
    super.key,
    required this.tripId,
    required this.tripName,
    required this.startDate,
    required this.endDate,
    this.existingPlaces,
    this.preSelectedDate,
  });

  @override
  State<SelectPlaceScreen> createState() => _SelectPlaceScreenState();
}

class _SelectPlaceScreenState extends State<SelectPlaceScreen> {
  final TextEditingController _searchController = TextEditingController();
  String _selectedCategory = 'All';
  List<Map<String, dynamic>> _addedPlaces =
      []; // Track places with their selected dates
  List<Place> _filteredPlaces = [];
  List<Place> _allPlaces = [];

  @override
  void initState() {
    super.initState();
    _loadMockPlaces();
    // Initialize with existing places if provided
    if (widget.existingPlaces != null) {
      _addedPlaces = List.from(widget.existingPlaces!);
    }
  }

  void _loadMockPlaces() {
    // Mock data using your actual Place model structure
    _allPlaces = [
      Place(
        placeId: '1',
        name: 'California Sunset/Twilight Boat Cruise',
        description:
            'Experience a magical sunset cruise with stunning views and twilight atmosphere',
        categoryId: 1,
        googleMapsLink: 'https://maps.google.com/place1',
        ratings: 4.96,
        reviewsCount: 672,
        imagesUrl:
            'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
        imagePublicIds: 'cruise_1',
        entryFree: false,
        operatingHours: {
          'monday': '6:00 PM - 8:00 PM',
          'tuesday': '6:00 PM - 8:00 PM',
          'wednesday': '6:00 PM - 8:00 PM',
          'thursday': '6:00 PM - 8:00 PM',
          'friday': '6:00 PM - 8:00 PM',
          'saturday': '6:00 PM - 8:00 PM',
          'sunday': '6:00 PM - 8:00 PM',
        },
        bestSeasonToVisit: 'Year-round',
        provinceId: 1,
        latitude: 10.762622,
        longitude: 106.660172,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
        locationName: 'Marina Bay, Ho Chi Minh City',
      ),
      Place(
        placeId: '2',
        name: 'Angkor Wat Temple',
        description: 'Ancient temple complex and UNESCO World Heritage site',
        categoryId: 2,
        googleMapsLink: 'https://maps.google.com/place2',
        ratings: 4.8,
        reviewsCount: 1240,
        imagesUrl:
            'https://images.unsplash.com/photo-1539650116574-75c0c6d73289?w=800',
        imagePublicIds: 'angkor_wat_1',
        entryFree: false,
        operatingHours: {
          'monday': '5:00 AM - 6:00 PM',
          'tuesday': '5:00 AM - 6:00 PM',
          'wednesday': '5:00 AM - 6:00 PM',
          'thursday': '5:00 AM - 6:00 PM',
          'friday': '5:00 AM - 6:00 PM',
          'saturday': '5:00 AM - 6:00 PM',
          'sunday': '5:00 AM - 6:00 PM',
        },
        bestSeasonToVisit: 'November to March',
        provinceId: 2,
        latitude: 13.412469,
        longitude: 103.866986,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
        locationName: 'Angkor Archaeological Park, Siem Reap',
      ),
      Place(
        placeId: '3',
        name: 'Royal Palace Hotel',
        description: 'Luxury accommodation with traditional Khmer architecture',
        categoryId: 3,
        googleMapsLink: 'https://maps.google.com/place3',
        ratings: 4.5,
        reviewsCount: 856,
        imagesUrl:
            'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
        imagePublicIds: 'royal_palace_1',
        entryFree: false,
        operatingHours: {
          'monday': '24 hours',
          'tuesday': '24 hours',
          'wednesday': '24 hours',
          'thursday': '24 hours',
          'friday': '24 hours',
          'saturday': '24 hours',
          'sunday': '24 hours',
        },
        bestSeasonToVisit: 'Year-round',
        provinceId: 3,
        latitude: 11.5564,
        longitude: 104.9282,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
        locationName: 'Central Phnom Penh',
      ),
      Place(
        placeId: '4',
        name: 'Khmer Kitchen',
        description: 'Authentic Cambodian cuisine with traditional flavors',
        categoryId: 4,
        googleMapsLink: 'https://maps.google.com/place4',
        ratings: 4.7,
        reviewsCount: 423,
        imagesUrl:
            'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
        imagePublicIds: 'khmer_kitchen_1',
        entryFree: false,
        operatingHours: {
          'monday': '11:00 AM - 10:00 PM',
          'tuesday': '11:00 AM - 10:00 PM',
          'wednesday': '11:00 AM - 10:00 PM',
          'thursday': '11:00 AM - 10:00 PM',
          'friday': '11:00 AM - 10:00 PM',
          'saturday': '11:00 AM - 10:00 PM',
          'sunday': '11:00 AM - 10:00 PM',
        },
        bestSeasonToVisit: 'Year-round',
        provinceId: 3,
        latitude: 11.5564,
        longitude: 104.9282,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
        locationName: 'Street 240, Phnom Penh',
      ),
      Place(
        placeId: '5',
        name: 'Bayon Temple',
        description: 'Famous temple with stone faces carved into towers',
        categoryId: 2,
        googleMapsLink: 'https://maps.google.com/place5',
        ratings: 4.6,
        reviewsCount: 998,
        imagesUrl:
            'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800',
        imagePublicIds: 'bayon_temple_1',
        entryFree: false,
        operatingHours: {
          'monday': '7:30 AM - 5:30 PM',
          'tuesday': '7:30 AM - 5:30 PM',
          'wednesday': '7:30 AM - 5:30 PM',
          'thursday': '7:30 AM - 5:30 PM',
          'friday': '7:30 AM - 5:30 PM',
          'saturday': '7:30 AM - 5:30 PM',
          'sunday': '7:30 AM - 5:30 PM',
        },
        bestSeasonToVisit: 'November to March',
        provinceId: 2,
        latitude: 13.441,
        longitude: 103.859,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
        locationName: 'Angkor Thom, Siem Reap',
      ),
    ];
    _filteredPlaces = _allPlaces;
  }

  void _filterPlaces() {
    setState(() {
      _filteredPlaces = _allPlaces.where((place) {
        final matchesSearch = place.name.toLowerCase().contains(
          _searchController.text.toLowerCase(),
        );
        final matchesCategory =
            _selectedCategory == 'All' ||
            _getCategoryName(place.categoryId).toLowerCase() ==
                _selectedCategory.toLowerCase();
        return matchesSearch && matchesCategory;
      }).toList();
    });
  }

  String _getCategoryName(int categoryId) {
    switch (categoryId) {
      case 1:
        return 'Attraction';
      case 2:
        return 'Temple';
      case 3:
        return 'Hotel';
      case 4:
        return 'Restaurant';
      default:
        return 'Other';
    }
  }

  bool _isPlaceAdded(String placeId) {
    return _addedPlaces.any((item) => item['place'].placeId == placeId);
  }

  void _showDateSelectionModal(Place place) {
    // If we have a pre-selected date, use it directly without showing modal
    if (widget.preSelectedDate != null) {
      _addPlaceToTrip(place, widget.preSelectedDate!);
      return;
    }

    // Otherwise, show the date selection modal as before
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      isDismissible: false,
      enableDrag: false,
      builder: (context) => WillPopScope(
        onWillPop: () async => false,
        child: DateSelectionModal(
          place: place,
          startDate: widget.startDate,
          endDate: widget.endDate,
          onDateSelected: (selectedDate) {
            _addPlaceToTrip(place, selectedDate);
            Navigator.pop(context);
          },
          onCancel: () {
            Navigator.pop(context);
          },
        ),
      ),
    );
  }

  void _addPlaceToTrip(Place place, DateTime selectedDate) {
    setState(() {
      // Remove if already exists and add with new date
      _addedPlaces.removeWhere(
        (item) => item['place'].placeId == place.placeId,
      );
      _addedPlaces.add({
        'place': place,
        'selectedDate': selectedDate,
        'addedAt': DateTime.now(),
      });
    });
  }

  void _removePlaceFromTrip(Place place) {
    setState(() {
      _addedPlaces.removeWhere(
        (item) => item['place'].placeId == place.placeId,
      );
    });

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('${place.name} removed from trip'),
        backgroundColor: Colors.orange,
        duration: Duration(seconds: 2),
      ),
    );
  }

  void _reviewItinerary() {
    if (_addedPlaces.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Please add at least one place to your trip'),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }

    // Navigate to itinerary review screen
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => ReviewTripScreen(
          tripId: widget.tripId,
          tripName: widget.tripName,
          startDate: widget.startDate,
          endDate: widget.endDate,
          addedPlaces: _addedPlaces,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: DertamColors.white,
      appBar: AppBar(
        backgroundColor: DertamColors.white,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_rounded, color: DertamColors.black),
          onPressed: () =>
              Navigator.pop(context, _addedPlaces), // Return updated places
        ),
        title: Text(
          widget.preSelectedDate != null
              ? 'Edit ${_formatEditDate(widget.preSelectedDate!)}'
              : widget.tripName,
          style: DertamTextStyles.title.copyWith(color: DertamColors.primaryBlue),
        ),
        centerTitle: true,
      ),

      body: Column(
        children: [
          // Search and Filter Section
          Padding(
            padding: EdgeInsets.all(DertamSpacings.m),
            child: Column(
              children: [
                // Search Bar
                Container(
                  decoration: BoxDecoration(
                    color: Colors.grey[100],
                    borderRadius: BorderRadius.circular(25),
                  ),
                  child: TextField(
                    controller: _searchController,
                    onChanged: (value) => _filterPlaces(),
                    decoration: InputDecoration(
                      hintText: 'Search places for your plan...',
                      prefixIcon: Icon(Icons.search, color: Colors.grey[600]),
                      border: InputBorder.none,
                      contentPadding: EdgeInsets.symmetric(
                        horizontal: DertamSpacings.l,
                        vertical: DertamSpacings.m,
                      ),
                    ),
                  ),
                ),

                SizedBox(height: DertamSpacings.m),

                // Category Filter
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      _buildCategoryChip('All'),
                      SizedBox(width: DertamSpacings.s),
                      _buildCategoryChip('Temple'),
                      SizedBox(width: DertamSpacings.s),
                      _buildCategoryChip('Hotel'),
                      SizedBox(width: DertamSpacings.s),
                      _buildCategoryChip('Restaurant'),
                      SizedBox(width: DertamSpacings.s),
                      _buildCategoryChip('Attraction'),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Places List
          Expanded(
            child: ListView.builder(
              padding: EdgeInsets.symmetric(horizontal: DertamSpacings.l),
              itemCount: _filteredPlaces.length,
              itemBuilder: (context, index) {
                final place = _filteredPlaces[index];
                final isAdded = _isPlaceAdded(place.placeId);
                final addedItem = _addedPlaces.firstWhere(
                  (item) => item['place'].placeId == place.placeId,
                  orElse: () => {},
                );

                return PlaceCard(
                  place: place,
                  isAdded: isAdded,
                  selectedDate: addedItem.isNotEmpty
                      ? addedItem['selectedDate']
                      : null,
                  preSelectedDate:
                      widget.preSelectedDate, // Pass the pre-selected date
                  onAddPlace: () => _showDateSelectionModal(place),
                  onRemovePlace: () => _removePlaceFromTrip(place),
                );
              },
            ),
          ),

          // Bottom Action Bar
          Container(
            padding: EdgeInsets.all(DertamSpacings.l),
            decoration: BoxDecoration(
              color: DertamColors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.1),
                  blurRadius: 10,
                  offset: const Offset(0, -5),
                ),
              ],
            ),
            child: SafeArea(
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          '${_addedPlaces.length} items',
                          style: DertamTextStyles.bodyMedium.copyWith(
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        Text(
                          'added to your trip',
                          style: DertamTextStyles.bodySmall.copyWith(
                            color: Colors.grey[600],
                          ),
                        ),
                      ],
                    ),
                  ),
                  DertamButton(
                    text: 'Review itinerary',
                    onPressed: _reviewItinerary,
                    backgroundColor: _addedPlaces.isNotEmpty
                        ? DertamColors.primaryDark
                        : Colors.grey[400],
                    width: 150,
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCategoryChip(String category) {
    final isSelected = _selectedCategory == category;
    return GestureDetector(
      onTap: () {
        setState(() {
          _selectedCategory = category;
        });
        _filterPlaces();
      },
      child: Container(
        padding: EdgeInsets.symmetric(
          horizontal: DertamSpacings.l,
          vertical: 5,
        ),
        decoration: BoxDecoration(
          color: isSelected ? DertamColors.primaryDark : Colors.transparent,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? DertamColors.primaryDark : Colors.grey[300]!,
          ),
        ),
        child: Text(
          category,
          style: DertamTextStyles.bodyMedium.copyWith(
            color: isSelected ? Colors.white : Colors.grey[700],
            fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
          ),
        ),
      ),
    );
  }

  String _formatEditDate(DateTime date) {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    // Calculate day number
    final dayNumber = date.difference(widget.startDate).inDays + 1;

    return 'Day $dayNumber (${months[date.month - 1]} ${date.day})';
  }
}

// Updated PlaceCard to show added status and date
class PlaceCard extends StatelessWidget {
  final Place place;
  final bool isAdded;
  final DateTime? selectedDate;
  final DateTime? preSelectedDate;
  final VoidCallback onAddPlace;
  final VoidCallback onRemovePlace;

  const PlaceCard({
    super.key,
    required this.place,
    required this.isAdded,
    this.selectedDate,
    this.preSelectedDate,
    required this.onAddPlace,
    required this.onRemovePlace,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: EdgeInsets.only(bottom: DertamSpacings.l),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        border: preSelectedDate != null
            ? Border.all(
                color: DertamColors.primaryDark.withOpacity(0.3),
                width: 2,
              )
            : null,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(12),
        child: Stack(
          children: [
            // Image
            Container(
              height: 200,
              decoration: BoxDecoration(
                image: DecorationImage(
                  image: NetworkImage(place.imagesUrl),
                  fit: BoxFit.cover,
                  onError: (error, stackTrace) {
                    // Handle image error
                  },
                ),
              ),
              child: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [Colors.transparent, Colors.black.withOpacity(0.7)],
                  ),
                ),
              ),
            ),

            // Add/Remove button
            Positioned(
              top: DertamSpacings.m,
              right: DertamSpacings.m,
              child: GestureDetector(
                onTap: isAdded ? onRemovePlace : onAddPlace,
                child: Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    color: isAdded ? Colors.green : DertamColors.primaryDark,
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.2),
                        blurRadius: 4,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Icon(
                    isAdded ? Icons.check : Icons.add,
                    color: Colors.white,
                    size: 20,
                  ),
                ),
              ),
            ),

            // Rating badge
            Positioned(
              top: DertamSpacings.m,
              left: DertamSpacings.m,
              child: Container(
                padding: EdgeInsets.symmetric(
                  horizontal: DertamSpacings.s,
                  vertical: 4,
                ),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.1),
                      blurRadius: 4,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.star, color: Colors.amber, size: 14),
                    SizedBox(width: 4),
                    Text(
                      place.ratings.toStringAsFixed(1),
                      style: DertamTextStyles.bodySmall.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    Text(
                      ' (${place.reviewsCount})',
                      style: DertamTextStyles.bodySmall.copyWith(
                        color: Colors.grey[600],
                        fontSize: 10,
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // Added date badge (if added)
            if (isAdded && selectedDate != null)
              Positioned(
                top: DertamSpacings.m + 40,
                right: DertamSpacings.m,
                child: Container(
                  padding: EdgeInsets.symmetric(
                    horizontal: DertamSpacings.s,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.green,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    _formatDate(selectedDate!),
                    style: DertamTextStyles.bodySmall.copyWith(
                      color: Colors.white,
                      fontSize: 10,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ),

            // Place info
            Positioned(
              bottom: 0,
              left: 0,
              right: 0,
              child: Container(
                padding: EdgeInsets.all(DertamSpacings.l),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      place.name,
                      style: DertamTextStyles.subtitle.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    SizedBox(height: 4),
                    Text(
                      place.description,
                      style: DertamTextStyles.bodySmall.copyWith(
                        color: Colors.white.withOpacity(0.9),
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
            ),

            if (preSelectedDate != null && !isAdded)
              Positioned(
                top: DertamSpacings.m + 40,
                left: DertamSpacings.m,
                child: Container(
                  padding: EdgeInsets.symmetric(
                    horizontal: DertamSpacings.s,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: DertamColors.primaryDark,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    'Will add to ${_formatDate(preSelectedDate!)}',
                    style: DertamTextStyles.bodySmall.copyWith(
                      color: Colors.white,
                      fontSize: 10,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  String _formatDate(DateTime date) {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return '${months[date.month - 1]} ${date.day}';
  }
}

// Updated DateSelectionModal with Cancel option
class DateSelectionModal extends StatefulWidget {
  final Place place;
  final DateTime startDate;
  final DateTime endDate;
  final Function(DateTime) onDateSelected;
  final VoidCallback onCancel;

  const DateSelectionModal({
    super.key,
    required this.place,
    required this.startDate,
    required this.endDate,
    required this.onDateSelected,
    required this.onCancel,
  });

  @override
  State<DateSelectionModal> createState() => _DateSelectionModalState();
}

class _DateSelectionModalState extends State<DateSelectionModal> {
  DateTime? selectedDate;

  @override
  Widget build(BuildContext context) {
    final tripDays = widget.endDate.difference(widget.startDate).inDays + 1;

    // Calculate dynamic height based on number of days - FIXED CALCULATION
    final int rows = (tripDays / 7).ceil();
    final double baseHeight = 180;
    final double rowHeight = 50;
    final double dynamicHeight = baseHeight + (rows * rowHeight);
    final double maxHeight = MediaQuery.of(context).size.height * 0.65;
    final double containerHeight = dynamicHeight.clamp(280, maxHeight);

    return Container(
      height: containerHeight,
      decoration: BoxDecoration(
        color: DertamColors.white,
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(20),
          topRight: Radius.circular(20),
        ),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Handle bar
          Container(
            margin: EdgeInsets.symmetric(vertical: DertamSpacings.s),
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: Colors.grey[300],
              borderRadius: BorderRadius.circular(2),
            ),
          ),

          // Header with close button
          Padding(
            padding: EdgeInsets.symmetric(
              horizontal: DertamSpacings.l,
              vertical: DertamSpacings.s,
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    'Select a date for this activity',
                    style: TextStyle(
                      fontSize: 16, // Reduced from 18
                      fontWeight: FontWeight.bold,
                      color: Colors.black,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),
                GestureDetector(
                  onTap: widget.onCancel,
                  child: Container(
                    padding: EdgeInsets.all(4),
                    child: Icon(
                      Icons.close,
                      color: DertamColors.primaryDark,
                      size: 18, // Reduced from 20
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Calendar container - FIXED OVERFLOW
          Expanded(
            child: Padding(
              padding: EdgeInsets.symmetric(horizontal: DertamSpacings.m),
              child: Container(
                width: double.infinity,
                decoration: BoxDecoration(
                  color: Colors.grey[100],
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Column(
                  children: [
                    // Weekday headers - FIXED ALIGNMENT
                    Padding(
                      padding: EdgeInsets.symmetric(
                        horizontal: DertamSpacings.s, // Same as grid padding
                        vertical: DertamSpacings.s,
                      ),
                      child: GridView.count(
                        shrinkWrap: true,
                        physics: NeverScrollableScrollPhysics(),
                        crossAxisCount: 7,
                        crossAxisSpacing: 3,
                        mainAxisSpacing: 0,
                        childAspectRatio: 3, // Make headers shorter
                        children:
                            ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
                                .map(
                                  (day) => Container(
                                    alignment: Alignment.center,
                                    child: Text(
                                      day,
                                      style: TextStyle(
                                        color: Colors.grey[600],
                                        fontSize: 9,
                                        fontWeight: FontWeight.w500,
                                      ),
                                      textAlign: TextAlign.center,
                                    ),
                                  ),
                                )
                                .toList(),
                      ),
                    ),

                    // Date grid - SAME PADDING AND SPACING AS HEADERS
                    Expanded(
                      child: Padding(
                        padding: EdgeInsets.symmetric(
                          horizontal: DertamSpacings.s, // Same as headers
                          vertical: 0,
                        ),
                        child: GridView.builder(
                          shrinkWrap: true,
                          physics: NeverScrollableScrollPhysics(),
                          gridDelegate:
                              SliverGridDelegateWithFixedCrossAxisCount(
                                crossAxisCount: 7,
                                childAspectRatio: 1.0,
                                crossAxisSpacing: 3, // Same as headers
                                mainAxisSpacing: 3,
                              ),
                          itemCount: tripDays,
                          itemBuilder: (context, index) {
                            final date = widget.startDate.add(
                              Duration(days: index),
                            );
                            final isSelected =
                                selectedDate != null &&
                                selectedDate!.year == date.year &&
                                selectedDate!.month == date.month &&
                                selectedDate!.day == date.day;

                            return GestureDetector(
                              onTap: () {
                                setState(() {
                                  selectedDate = date;
                                });
                              },
                              child: Container(
                                decoration: BoxDecoration(
                                  color: isSelected
                                      ? DertamColors.primaryDark
                                      : Colors.transparent,
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Text(
                                      date.day.toString(),
                                      style: TextStyle(
                                        color: isSelected
                                            ? Colors.white
                                            : DertamColors.primaryDark,
                                        fontWeight: FontWeight.bold,
                                        fontSize: 12,
                                      ),
                                    ),
                                    SizedBox(height: 1),
                                    Text(
                                      _getShortMonth(date),
                                      style: TextStyle(
                                        color: isSelected
                                            ? Colors.white.withOpacity(0.9)
                                            : Colors.grey[500],
                                        fontSize: 8,
                                        fontWeight: FontWeight.w500,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            );
                          },
                        ),
                      ),
                    ),

                    SizedBox(height: DertamSpacings.xs),
                  ],
                ),
              ),
            ),
          ),

          // Bottom button - FIXED PADDING
          SafeArea(
            child: Container(
              padding: EdgeInsets.only(
                left: DertamSpacings.l,
                right: DertamSpacings.l,
                top: DertamSpacings.s,
                bottom: DertamSpacings.s,
              ),
              child: DertamButton(
                text: 'Confirm',
                onPressed: selectedDate != null
                    ? () => widget.onDateSelected(selectedDate!)
                    : () {},
                backgroundColor: selectedDate != null
                    ? DertamColors.primaryDark
                    : Colors.grey[400],
                width: double.infinity,
              ),
            ),
          ),
        ],
      ),
    );
  }

  String _getShortMonth(DateTime date) {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    return months[date.month - 1];
  }
}
