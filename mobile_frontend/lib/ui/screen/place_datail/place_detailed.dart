// ignore_for_file: deprecated_member_use

import 'dart:async';
import 'package:flutter/material.dart';
import 'package:iconsax/iconsax.dart';
import 'package:mobile_frontend/models/place/place.dart';
import 'package:mobile_frontend/models/trips/trips.dart';
import 'package:mobile_frontend/ui/providers/asyncvalue.dart';
import 'package:mobile_frontend/ui/providers/place_provider.dart';
import 'package:mobile_frontend/ui/screen/hotel/hotel_detail_screen.dart';
import 'package:mobile_frontend/ui/screen/place_datail/widget/dertam_hotel_nearby_card.dart';
import 'package:mobile_frontend/ui/screen/place_datail/widget/dertam_image_slidshow.dart';
import 'package:mobile_frontend/ui/screen/place_datail/widget/dertam_nearby_place_card.dart';
import 'package:mobile_frontend/ui/screen/place_datail/widget/dertam_retauanrant_nearby_card.dart';
import 'package:mobile_frontend/ui/screen/dertam_map/place_map_screen.dart';
import 'package:mobile_frontend/ui/screen/place_datail/widget/trip_day_selection_modal.dart';
import 'package:mobile_frontend/ui/screen/place_datail/widget/trip_selection_modal.dart';
import 'package:mobile_frontend/ui/screen/restaurant/restaurant_detail_screen_new.dart';
import 'package:mobile_frontend/ui/screen/trip/widgets/dertam_review_trip_screen.dart';
import 'package:mobile_frontend/ui/screen/trip/widgets/dertam_trip_planning_screen.dart';
import 'package:mobile_frontend/ui/theme/dertam_apptheme.dart';
import 'package:mobile_frontend/ui/widgets/actions/dertam_button.dart';
import 'package:mobile_frontend/ui/providers/trip_provider.dart';
import 'package:provider/provider.dart';

class DetailEachPlace extends StatefulWidget {
  final String placeId;
  const DetailEachPlace({super.key, required this.placeId});
  @override
  State<DetailEachPlace> createState() => _DetailEachPlaceState();
}

class _DetailEachPlaceState extends State<DetailEachPlace> {
  late PageController _pageController;
  Timer? _autoScrollTimer;

  @override
  void initState() {
    super.initState();
    _pageController = PageController(initialPage: 0);

    WidgetsBinding.instance.addPostFrameCallback((_) {
      final placeProvider = context.read<PlaceProvider>();
      placeProvider.getPlaceDetail(widget.placeId);
    });
  }

  @override
  void dispose() {
    _autoScrollTimer?.cancel();
    _pageController.dispose();
    super.dispose();
  }

  void _showTripSelectionModal() {
    final placeProvider = context.read<PlaceProvider>();
    final placeDetail = placeProvider.placeDetail.data?.placeDetail;

    if (placeDetail == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Place details not available'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    // Create a Place object from PlaceDetail to pass to the trip
    final place = Place(
      placeId: placeDetail.placeID.toString(),
      name: placeDetail.name,
      description: placeDetail.description,
      categoryId: 0, // Not available in PlaceDetail
      googleMapsLink: placeDetail.googleMapsLink,
      ratings: placeDetail.ratings,
      reviewsCount: placeDetail.reviewsCount,
      imagesUrl:
          placeProvider.placeDetail.data?.listOfImageUrl.isNotEmpty == true
          ? placeProvider.placeDetail.data!.listOfImageUrl.first
          : '',
      imagePublicIds: '',
      entryFree: placeDetail.entryFree,
      operatingHours: placeDetail.operatingHours,
      bestSeasonToVisit: placeDetail.bestSeasonToVisit,
      provinceId: 0, // Not directly available
      latitude: placeDetail.latitude,
      longitude: placeDetail.longitude,
      createdAt: DateTime.tryParse(placeDetail.createdAt) ?? DateTime.now(),
      updatedAt: DateTime.tryParse(placeDetail.updatedAt) ?? DateTime.now(),
      locationName: placeDetail.provinceCategoryName,
    );

    TripSelectionModal.show(
      context: context,
      onTripSelected: (trip) {
        _navigateToAddPlaceWithTrip(trip, place);
      },
      onCreateNewTrip: () {
        Navigator.push(
          context,
          MaterialPageRoute(builder: (context) => const TripPlanning()),
        );
      },
      onCancel: () {
        Navigator.pop(context);
      },
    );
  }

  void _navigateToAddPlaceWithTrip(Trip trip, Place place) {
    // Show the day selection modal for the selected trip
    TripDaySelectionModal.show(
      context: context,
      trip: trip,
      place: place,
      onDaySelected: (selectedDate) {
        _addPlaceToTripDay(trip, place, selectedDate);
      },
      onCancel: () {
        // Go back to trip selection modal
        Navigator.pop(context);
        _showTripSelectionModalWithPlace(place);
      },
    );
  }

  void _showTripSelectionModalWithPlace(Place place) {
    TripSelectionModal.show(
      context: context,
      onTripSelected: (trip) {
        _navigateToAddPlaceWithTrip(trip, place);
      },
      onCreateNewTrip: () {
        Navigator.push(
          context,
          MaterialPageRoute(builder: (context) => const TripPlanning()),
        );
      },
      onCancel: () {
        Navigator.pop(context);
      },
    );
  }

  void _addPlaceToTripDay(Trip trip, Place place, DateTime selectedDate) async {
    final tripProvider = context.read<TripProvider>();

    // Show loading indicator
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => Center(
        child: CircularProgressIndicator(color: DertamColors.primaryBlue),
      ),
    );

    try {
      // Fetch trip details to get existing places
      await tripProvider.fetchTripDetail(trip.tripId.toString());

      if (!mounted) return;
      Navigator.pop(context); // Dismiss loading indicator

      final tripDetail = tripProvider.getTripDetail.data?.data;
      final existingDays = tripDetail?.days;

      // Collect existing places from all days
      final existingPlaces = <Map<String, dynamic>>[];
      if (existingDays != null) {
        existingDays.forEach((dayKey, dayData) {
          final dayDate =
              dayData.date ??
              trip.startDate.add(
                Duration(days: int.parse(dayKey.replaceAll('day_', '')) - 1),
              );
          final placesForDay = dayData.places ?? [];

          for (var existingPlace in placesForDay) {
            existingPlaces.add({
              'place': existingPlace,
              'selectedDate': dayDate,
              'addedAt': DateTime.now(),
            });
          }
        });
      }

      // Clear provider's added places and set with existing + new place
      tripProvider.clearAddedPlaces();

      // Add all existing places
      for (var placeData in existingPlaces) {
        tripProvider.addPlaceToTrip(placeData);
      }

      // Add the new place
      tripProvider.addPlaceToTrip({
        'place': place,
        'selectedDate': selectedDate,
        'addedAt': DateTime.now(),
      });

      // Navigate to review trip screen to confirm the addition
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => ReviewTripScreen(
            tripId: trip.tripId.toString(),
            tripName: trip.tripName,
            startDate: trip.startDate,
            endDate: trip.endDate,
            addedPlaces: tripProvider.addedPlaces,
          ),
        ),
      );
    } catch (e) {
      if (!mounted) return;
      Navigator.pop(context); // Dismiss loading indicator

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Failed to load trip details: ${e.toString()}'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final placeProvider = context.watch<PlaceProvider>();
    final placeDetailData = placeProvider.placeDetail;

    // Nearby Hotel Widget
    Widget nearByHotel;
    switch (placeDetailData.state) {
      case AsyncValueState.empty:
        nearByHotel = SizedBox(
          height: 150,
          child: Center(
            child: Text(
              'No hotels available',
              style: TextStyle(fontSize: 16, color: Colors.grey),
            ),
          ),
        );
        break;
      case AsyncValueState.loading:
        nearByHotel = SizedBox(
          height: 150,
          child: Center(child: CircularProgressIndicator()),
        );
        break;
      case AsyncValueState.error:
        nearByHotel = SizedBox(
          height: 150,
          child: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.error_outline, color: Colors.red, size: 48),
                const SizedBox(height: 8),
                const Text(
                  'Failed to load hotels',
                  style: TextStyle(color: Colors.red),
                ),
                const SizedBox(height: 4),
                Text(
                  placeDetailData.error.toString(),
                  style: const TextStyle(fontSize: 12, color: Colors.grey),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
        );
        break;
      case AsyncValueState.success:
        if (placeDetailData.data?.hotelNearby.isEmpty == true) {
          nearByHotel = SizedBox(
            height: 150,
            child: Center(
              child: Text(
                'No nearby hotels found',
                style: TextStyle(fontSize: 16, color: Colors.grey),
              ),
            ),
          );
        } else {
          nearByHotel = SizedBox(
            height: 150,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              physics: const BouncingScrollPhysics(),
              itemCount: placeDetailData.data?.hotelNearby.length,
              itemBuilder: (context, index) {
                final hotel = placeDetailData.data?.hotelNearby[index];
                return Container(
                  margin: const EdgeInsets.only(right: 16),
                  child: DertamHotelNearby(
                    name: hotel?.name ?? '',
                    location: hotel?.provinceCategoryName ?? '',
                    rating: hotel?.ratings.toString() ?? '0.0',
                    imageUrl: hotel?.imagesUrl.isNotEmpty ?? false
                        ? (hotel?.imagesUrl.first ?? '')
                        : '',
                    onTap: () => Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) =>
                            HotelDetailScreen(hotelId: hotel?.placeID ?? ''),
                      ),
                    ),
                  ),
                );
              },
            ),
          );
        }
        break;
    }

    // Nearby Place Widget
    Widget nearByPlace;
    switch (placeDetailData.state) {
      case AsyncValueState.empty:
        nearByPlace = SizedBox(
          height: 200,
          child: Center(
            child: Text(
              'No places available',
              style: TextStyle(fontSize: 16, color: Colors.grey),
            ),
          ),
        );
        break;
      case AsyncValueState.loading:
        nearByPlace = SizedBox(
          height: 200,
          child: Center(child: CircularProgressIndicator()),
        );
        break;
      case AsyncValueState.error:
        nearByPlace = SizedBox(
          height: 200,
          child: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.error_outline, color: Colors.red, size: 48),
                const SizedBox(height: 8),
                const Text(
                  'Failed to load nearby places',
                  style: TextStyle(color: Colors.red),
                ),
                const SizedBox(height: 4),
                Text(
                  placeDetailData.error.toString(),
                  style: const TextStyle(fontSize: 12, color: Colors.grey),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
        );
        break;
      case AsyncValueState.success:
        if (placeDetailData.data?.nearbyPlace.isEmpty == true) {
          nearByPlace = SizedBox(
            height: 200,
            child: Center(
              child: Text(
                'No nearby places found',
                style: TextStyle(fontSize: 16, color: Colors.grey),
              ),
            ),
          );
        } else {
          nearByPlace = SizedBox(
            height: 200,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              physics: const BouncingScrollPhysics(),
              itemCount: placeDetailData.data?.nearbyPlace.length,
              itemBuilder: (context, index) {
                final place = placeDetailData.data?.nearbyPlace[index];
                return Container(
                  width: 200,
                  margin: const EdgeInsets.only(right: 16),
                  child: DertamNearbyPlace(
                    name: place?.name ?? '',
                    location:
                        place?.provinceCategoryName ?? 'Nearby not available',
                    rating: place?.ratings ?? 0.0,
                    imageUrl: place?.imagesUrl.isNotEmpty ?? false
                        ? (place?.imagesUrl.first ?? '')
                        : '',
                    onTap: () => Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => DetailEachPlace(
                          placeId: place?.placeID.toString() ?? '',
                        ),
                      ),
                    ),
                  ),
                );
              },
            ),
          );
        }
        break;
    }

    // Nearby Restaurant Widget
    Widget nearByRestaurant;
    switch (placeDetailData.state) {
      case AsyncValueState.empty:
        nearByRestaurant = SizedBox(
          height: 200,
          child: Center(
            child: Text(
              'No restaurants available',
              style: TextStyle(fontSize: 16, color: Colors.grey),
            ),
          ),
        );
        break;
      case AsyncValueState.loading:
        nearByRestaurant = SizedBox(
          height: 200,
          child: Center(child: CircularProgressIndicator()),
        );
        break;
      case AsyncValueState.error:
        nearByRestaurant = SizedBox(
          height: 200,
          child: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.error_outline, color: Colors.red, size: 48),
                const SizedBox(height: 8),
                const Text(
                  'Failed to load restaurants',
                  style: TextStyle(color: Colors.red),
                ),
                const SizedBox(height: 4),
                Text(
                  placeDetailData.error.toString(),
                  style: const TextStyle(fontSize: 12, color: Colors.grey),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
        );
        break;
      case AsyncValueState.success:
        if (placeDetailData.data?.restaurantNearby.isEmpty == true) {
          nearByRestaurant = SizedBox(
            height: 200,
            child: Center(
              child: Text(
                'No nearby restaurants found',
                style: TextStyle(fontSize: 16, color: Colors.grey),
              ),
            ),
          );
        } else {
          nearByRestaurant = SizedBox(
            height: 200,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              physics: const BouncingScrollPhysics(),
              itemCount: placeDetailData.data?.restaurantNearby.length,
              itemBuilder: (context, index) {
                final restaurant =
                    placeDetailData.data?.restaurantNearby[index];
                return Container(
                  width: 260,
                  margin: const EdgeInsets.only(right: 16),
                  child: DertamRetauanrantNearby(
                    name: restaurant?.name ?? '',
                    location: restaurant?.provinceCategoryName ?? '',
                    rating: restaurant?.ratings.toString() ?? '0.0',
                    imageUrl: restaurant?.imagesUrl.isNotEmpty ?? false
                        ? (restaurant?.imagesUrl.first ?? '')
                        : '',
                    onTap: () => Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) =>
                            RestaurantDetailScreen(restaurant: restaurant!),
                      ),
                    ),
                  ),
                );
              },
            ),
          );
        }
        break;
    }

    return Scaffold(
      backgroundColor: DertamColors.white,
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 320,
            floating: false,
            pinned: false,
            backgroundColor: DertamColors.white,
            automaticallyImplyLeading: false,

            flexibleSpace: FlexibleSpaceBar(
              background: DertamImageSlideshow(
                images: placeDetailData.data?.listOfImageUrl ?? [],
                onRoutePressed: () {
                  final placeDetail = placeDetailData.data?.placeDetail;
                  print(
                    'Laaaaaaaaaaaaaaaaaaaaaaaaaaaaaaatt${placeDetail?.latitude}',
                  );
                  if (placeDetail != null) {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => PlaceMapScreen(
                          latitude: placeDetail.latitude,
                          longitude: placeDetail.longitude,
                          placeName: placeDetail.name,
                          googleMapsLink: placeDetail.googleMapsLink,
                        ),
                      ),
                    );
                  } else {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Location data not available'),
                        backgroundColor: Colors.red,
                      ),
                    );
                  }
                },
              ),
            ),
          ),
          // Place Information - Sticky Header
          SliverPersistentHeader(
            pinned: true,
            delegate: _PlaceInfoHeaderDelegate(
              minHeight: 80,
              maxHeight: 80,
              child: Container(
                color: DertamColors.white,
                child: Padding(
                  padding: const EdgeInsets.all(20.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Title and Rating
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(
                            child: Text(
                              placeDetailData.data?.placeDetail.name ??
                                  'Not Available',
                              style: const TextStyle(
                                fontSize: 24,
                                fontWeight: FontWeight.bold,
                              ),
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 12,
                              vertical: 6,
                            ),
                            decoration: BoxDecoration(
                              color: Colors.amber.shade50,
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Row(
                              children: [
                                const Icon(
                                  Icons.star,
                                  color: Colors.amber,
                                  size: 20,
                                ),
                                const SizedBox(width: 4),
                                Text(
                                  placeDetailData.data?.placeDetail.ratings
                                          .toString() ??
                                      '0.0',
                                  style: const TextStyle(
                                    fontWeight: FontWeight.normal,
                                    fontSize: 14,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
          // Description Section
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(8.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Center(
                    child: DertamButton(
                      height: 50,
                      text: 'Start Planning',
                      onPressed: () {
                        _showTripSelectionModal();
                      },
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Location
                  Row(
                    children: [
                      Icon(Iconsax.location, size: 18, color: Colors.grey[600]),
                      const SizedBox(width: 4),
                      Text(
                        placeDetailData
                                .data
                                ?.placeDetail
                                .provinceCategoryName ??
                            'Not Available',
                        style: TextStyle(fontSize: 16, color: Colors.grey[600]),
                      ),
                    ],
                  ), // Quick Info Cards
                  const SizedBox(height: 16),
                  const Text(
                    'Description',
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                  ),

                  const SizedBox(height: 10),
                  Text(
                    placeDetailData.data?.placeDetail.description ??
                        'No description available.',
                    style: TextStyle(
                      fontSize: 15,
                      color: Colors.grey[700],
                      height: 1.6,
                    ),
                  ),
                  const SizedBox(height: 24),

                  Text(
                    'Nearby Places',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 24,
                      color: DertamColors.primaryBlue,
                    ),
                  ),
                  const SizedBox(height: 8),
                  nearByPlace,
                  SizedBox(height: 18),
                  Text(
                    'Nearby Hotels',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 24,
                      color: DertamColors.primaryBlue,
                    ),
                  ),
                  SizedBox(height: 18),

                  /// NearBy Hotel
                  nearByHotel,

                  SizedBox(height: 18),
                  Text(
                    'Nearby Restaurants',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 24,
                      color: DertamColors.primaryBlue,
                    ),
                  ),
                  SizedBox(height: 18),
                  nearByRestaurant,
                  SizedBox(height: 18),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// Custom SliverPersistentHeaderDelegate for sticky place info
class _PlaceInfoHeaderDelegate extends SliverPersistentHeaderDelegate {
  final double minHeight;
  final double maxHeight;
  final Widget child;

  _PlaceInfoHeaderDelegate({
    required this.minHeight,
    required this.maxHeight,
    required this.child,
  });

  @override
  double get minExtent => minHeight;

  @override
  double get maxExtent => maxHeight;

  @override
  Widget build(
    BuildContext context,
    double shrinkOffset,
    bool overlapsContent,
  ) {
    return SizedBox.expand(child: child);
  }

  @override
  bool shouldRebuild(_PlaceInfoHeaderDelegate oldDelegate) {
    return maxHeight != oldDelegate.maxHeight ||
        minHeight != oldDelegate.minHeight ||
        child != oldDelegate.child;
  }
}
