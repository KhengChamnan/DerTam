import 'package:flutter/material.dart';
import 'package:mobile_frontend/ui/providers/trip_provider.dart';
import 'package:mobile_frontend/ui/providers/place_provider.dart';
import 'package:mobile_frontend/ui/screen/trip/widgets/dertam_review_trip_screen.dart';
import 'package:mobile_frontend/ui/theme/dertam_apptheme.dart';
import 'package:mobile_frontend/ui/widgets/actions/dertam_button.dart';
import 'package:mobile_frontend/models/place/place.dart';
import 'package:provider/provider.dart';
// import 'package:mobile_frontend/models/trips/trips.dart';
// import 'package:mobile_frontend/models/trips/trip_days.dart';

class DertamAddPlaceToTrip extends StatefulWidget {
  final String? tripId;
  final List<Place>? existingPlaces;
  final DateTime? preSelectedDate;
  const DertamAddPlaceToTrip({
    super.key,
    this.existingPlaces,
    this.preSelectedDate,
    this.tripId,
  });

  @override
  State<DertamAddPlaceToTrip> createState() => _DertamAddPlaceToTripState();
}

class _DertamAddPlaceToTripState extends State<DertamAddPlaceToTrip> {
  final TextEditingController _searchController = TextEditingController();

  int? _selectedCategoryId; // null means 'All'
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    // Initialize with existing places if provided
    final tripProvider = context.read<TripProvider>();
    final placeProvider = context.read<PlaceProvider>();
    if (widget.existingPlaces != null) {
      tripProvider.setAddedPlaces(
        widget.existingPlaces!
            .map(
              (place) => {
                'place': place,
                'selectedDate': widget.preSelectedDate ?? DateTime.now(),
                'addedAt': DateTime.now(),
              },
            )
            .toList(),
      );
    }
    WidgetsBinding.instance.addPostFrameCallback((_) {
      placeProvider.fetchPlaceCategories();
      placeProvider.fetchRecommendedPlaces(); // Load initial places
      tripProvider.fetchTripDetail(widget.tripId!);
    });
  }

  Future<void> _filterPlaces() async {
    final placeProvider = context.read<PlaceProvider>();
    final searchQuery = _searchController.text.trim();

    setState(() {
      _isLoading = true;
    });
    if (searchQuery.isNotEmpty) {
      // If there's a search query, use search API
      await placeProvider.searchAllPlace(searchQuery);
    } else if (_selectedCategoryId != null) {
      // If a category is selected, fetch places by category
      await placeProvider.getPlacesByCategory(_selectedCategoryId!);
    } else {
      await placeProvider.fetchRecommendedPlaces();
    }

    if (mounted) {
      setState(() {
        _isLoading = false;
      });
    }
  }

  void _showDateSelectionModal(Place place) {
    final tripProvider = Provider.of<TripProvider>(context, listen: false);
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
          startDate:
              tripProvider.createTrip.data?.trip?.startDate ?? DateTime.now(),
          endDate:
              tripProvider.createTrip.data?.trip?.endDate ?? DateTime.now(),
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
    final tripProvider = context.read<TripProvider>();
    tripProvider.addPlaceToTrip({
      'place': place,
      'selectedDate': selectedDate,
      'addedAt': DateTime.now(),
    });
  }

  void _removePlaceFromTrip(Place place) {
    final tripProvider = context.read<TripProvider>();
    tripProvider.removePlaceFromTrip(place.placeId);
  }

  void _reviewItinerary() {
    final tripProvider = Provider.of<TripProvider>(context, listen: false);

    if (tripProvider.addedPlaces.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Please add at least one place to your trip'),
          backgroundColor: DertamColors.primaryBlue,
        ),
      );
      return;
    }
    // Navigate to itinerary review screen
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => ReviewTripScreen(
          tripId: tripProvider.createTrip.data?.trip?.tripId.toString() ?? '',
          tripName: tripProvider.createTrip.data?.trip?.tripName ?? '',
          startDate:
              tripProvider.createTrip.data?.trip?.startDate ?? DateTime.now(),
          endDate:
              tripProvider.createTrip.data?.trip?.endDate ?? DateTime.now(),
          addedPlaces: tripProvider.addedPlaces,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final tripProvider = context.watch<TripProvider>();
    final tripData = tripProvider.getTripDetail.data;
    final placeProvider = context.watch<PlaceProvider>();
    final categories = placeProvider.placeCategory.data ?? [];
    final places = placeProvider.places.data ?? [];
    final addedPlaces = tripProvider.addedPlaces;
    return Scaffold(
      backgroundColor: DertamColors.white,
      appBar: AppBar(
        backgroundColor: DertamColors.white,
        elevation: 0,
        leading: Padding(
          padding: const EdgeInsets.all(8.0),
          child: Container(
            decoration: BoxDecoration(
              color: Colors.white,
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.1),
                  spreadRadius: 0,
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: IconButton(
              icon: Icon(
                Icons.arrow_back_ios_new,
                color: DertamColors.primaryDark,
                size: 20,
              ),
              onPressed: () => Navigator.of(context).pop(),
            ),
          ),
        ),
        title: Text(
          tripData?.data.tripName ?? 'Don not Have Trip',
          style: DertamTextStyles.title.copyWith(
            color: DertamColors.primaryBlue,
          ),
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
                      _buildCategoryChip('All', null),
                      SizedBox(width: DertamSpacings.s),
                      ...categories.map(
                        (category) => Padding(
                          padding: EdgeInsets.only(right: DertamSpacings.s),
                          child: _buildCategoryChip(
                            category.categoryName,
                            category.categoryId,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Places List
          Expanded(
            child: _isLoading
                ? Center(
                    child: CircularProgressIndicator(
                      color: DertamColors.primaryDark,
                    ),
                  )
                : places.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.search_off,
                          size: 64,
                          color: Colors.grey[400],
                        ),
                        SizedBox(height: DertamSpacings.m),
                        Text(
                          'No places found',
                          style: DertamTextStyles.bodyMedium.copyWith(
                            color: Colors.grey[600],
                          ),
                        ),
                      ],
                    ),
                  )
                : ListView.builder(
                    padding: EdgeInsets.symmetric(horizontal: DertamSpacings.l),
                    itemCount: places.length,
                    itemBuilder: (context, index) {
                      final place = places[index];
                      final isAdded = tripProvider.isPlaceAdded(place.placeId);
                      final addedItem = addedPlaces.firstWhere(
                        (item) => item['place'].placeId == place.placeId,
                        orElse: () => {},
                      );
                      return PlaceCard(
                        place: place,
                        isAdded: isAdded,
                        selectedDate: addedItem.isNotEmpty
                            ? addedItem['selectedDate']
                            : null,
                        preSelectedDate: widget
                            .preSelectedDate, // Pass the pre-selected date
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
                  color: DertamColors.primaryBlue.withOpacity(0.1),
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
                          '${addedPlaces.length} items',
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
                    backgroundColor: addedPlaces.isNotEmpty
                        ? DertamColors.primaryDark
                        : DertamColors.neutralLighter,
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

  Widget _buildCategoryChip(String categoryName, int? categoryId) {
    final isSelected = _selectedCategoryId == categoryId;
    return GestureDetector(
      onTap: () {
        setState(() {
          _selectedCategoryId = categoryId;
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
          categoryName,
          style: DertamTextStyles.bodyMedium.copyWith(
            color: isSelected ? Colors.white : Colors.grey[700],
            fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
          ),
        ),
      ),
    );
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
                    color: isAdded ? Colors.green : DertamColors.white,
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: DertamColors.black.withOpacity(0.2),
                        blurRadius: 4,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Icon(
                    isAdded ? Icons.check : Icons.add,
                    color: DertamColors.primaryBlue,
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
              color: DertamColors.neutralLighter,
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
                      color: DertamColors.black,
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
