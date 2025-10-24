// ignore_for_file: deprecated_member_use

import 'dart:async';
import 'package:flutter/material.dart';
import 'package:iconsax/iconsax.dart';
import 'package:mobile_frontend/models/place/place_deatail.dart';
import 'package:mobile_frontend/ui/providers/asyncvalue.dart';
import 'package:mobile_frontend/ui/providers/hotel_provider.dart';
import 'package:mobile_frontend/ui/providers/place_provider.dart';
import 'package:mobile_frontend/ui/screen/hotel/hotel_detail_screen.dart';
import 'package:mobile_frontend/ui/screen/place_datail/widget/dertam_detail_info.dart';
import 'package:mobile_frontend/ui/screen/place_datail/widget/dertam_hotel_nearby_card.dart';
import 'package:mobile_frontend/ui/screen/place_datail/widget/dertam_image_slidshow.dart';
import 'package:mobile_frontend/ui/screen/place_datail/widget/dertam_nearby_place_card.dart';
import 'package:mobile_frontend/ui/screen/place_datail/widget/dertam_retauanrant_nearby_card.dart';
import 'package:mobile_frontend/ui/screen/restaurant/restaurant_detail_screen_new.dart';
import 'package:mobile_frontend/ui/theme/dertam_apptheme.dart';
import 'package:provider/provider.dart';

class DetailEachPlace extends StatefulWidget {
  final String placeId;
  const DetailEachPlace({super.key, required this.placeId});
  @override
  State<DetailEachPlace> createState() => _DetailEachPlaceState();
}

class _DetailEachPlaceState extends State<DetailEachPlace> {
  late PageController _pageController;
  final int _currentImageIndex = 0;
  Timer? _autoScrollTimer;
  final bool _isAutoScrolling = true;

  final PlaceDetailData _dummyPlaceData = PlaceDetailData(
    placeDetail: PlaceDetail(
      placeID: 4,
      name: 'Sample Place',
      description:
          'Angkor Wat is a unique combination of the temple mountain(the standard design for the empire state temples) and the later plan of concentric galleries, most of which were originally derived from religious beliefs ofmore.',
      categoryName: 'Tourist Attraction',
      categoryDescription:
          'Historical sites, temples, museums, monuments, and cultural attractions',
      googleMapsLink: 'https://maps.google.com/?q=11.5564,104.9282',
      ratings: '4.50',
      reviewsCount: 10,
      entryFree: 1,
      operatingHours: {'mon': '9:00-17:00', 'tue': '9:00-17:00'},
      bestSeasonToVisit: 'Summer',
      provinceCategoryName: 'Phnom Penh',
      provinceDescription:
          'Capital and most populous city of Cambodia, located at the confluence of the Mekong and Tonlé Sap rivers',
      latitude: '11.5564000',
      longitude: '104.9282000',
      createdAt: '2025-10-18 08:35:46',
      updatedAt: '2025-10-18 08:35:46',
    ),
    listOfImageUrl: [
      'https://upload.wikimedia.org/wikipedia/commons/4/41/Angkor_Wat.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/4/41/Angkor_Wat.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/4/41/Angkor_Wat.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/4/41/Angkor_Wat.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/4/41/Angkor_Wat.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/4/41/Angkor_Wat.jpg',
    ],
    nearbyPlace: [],
    hotelNearby: [],
    restaurantNearby: [
      NearByRestaurant(
        placeId: '201',
        name: 'Malis Restaurant',
        imageUrl:
            'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',

        location: 'Phnom Penh',
        rating: '4.6',
      ),
      NearByRestaurant(
        placeId: '201',
        name: 'Malis Restaurant',
        imageUrl:
            'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',

        location: 'Phnom Penh',
        rating: '4.6',
      ),
      NearByRestaurant(
        placeId: '201',
        name: 'Malis Restaurant',
        imageUrl:
            'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',

        location: 'Phnom Penh',
        rating: '4.6',
      ),
      NearByRestaurant(
        placeId: '201',
        name: 'Malis Restaurant',
        imageUrl:
            'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',

        location: 'Phnom Penh',
        rating: '4.6',
      ),
    ],
  );

  @override
  void initState() {
    super.initState();
    _pageController = PageController(initialPage: 0);
    _startAutoScroll();
    // Fetch recommended places and upcoming events when the page loads
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final placeProvider = context.read<PlaceProvider>();
      final hotelProvider = context.read<HotelProvider>();
      placeProvider.getPlaceDetail(widget.placeId);
      hotelProvider.fetchHotels();
    });
  }

  @override
  void dispose() {
    _autoScrollTimer?.cancel();
    _pageController.dispose();
    super.dispose();
  }

  void _startAutoScroll() {
    _autoScrollTimer?.cancel();
    if (_isAutoScrolling && _dummyPlaceData.listOfImageUrl.length > 1) {
      _autoScrollTimer = Timer.periodic(const Duration(seconds: 4), (timer) {
        if (_pageController.hasClients) {
          int nextPage =
              (_currentImageIndex + 1) % _dummyPlaceData.listOfImageUrl.length;
          _pageController.animateToPage(
            nextPage,
            duration: const Duration(milliseconds: 500),
            curve: Curves.easeInOut,
          );
        }
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final placeProvider = context.watch<PlaceProvider>();
    final hotelProvider = context.watch<HotelProvider>();

    final placeDetailData = placeProvider.placeDetail;
    final hotelData = hotelProvider.hotels;
    Widget content;
    print('mean konleng dek ot ${hotelData.data}');
    switch (hotelData.state) {
      case AsyncValueState.empty:
        content = SizedBox(
          height: 150,
          child: Center(
            child: Text(
              'No hotels available',
              style: TextStyle(fontSize: 16, color: Colors.grey),
            ),
          ),
        );

      case AsyncValueState.loading:
        content = SizedBox(
          height: 150,
          child: Center(child: CircularProgressIndicator()),
        );

      case AsyncValueState.error:
        content = SizedBox(
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
                  hotelData.error.toString(),
                  style: const TextStyle(fontSize: 12, color: Colors.grey),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
        );

      case AsyncValueState.success:
        if (hotelData.data?.isEmpty ?? true) {
          content = SizedBox(
            height: 150,
            child: Center(
              child: Text(
                'No nearby hotels found',
                style: TextStyle(fontSize: 16, color: Colors.grey),
              ),
            ),
          );
        }

        content = SizedBox(
          height: 150,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            physics: const BouncingScrollPhysics(),
            itemCount: hotelData.data?.length,
            itemBuilder: (context, index) {
              final hotel = hotelData.data?[index];
              return Container(
                margin: const EdgeInsets.only(right: 16),
                child: DertamHotelNearby(
                  name: hotel?.name ?? '',
                  location: hotel?.provinceCategory.name ?? '',
                  rating: hotel?.rating ?? '',
                  imageUrl: hotel?.imageUrl.isNotEmpty ?? false
                      ? (hotel?.imageUrl.first ?? '')
                      : '',
                  onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => HotelDetailScreen(hotelId: '1'),
                    ),
                  ),
                ),
              );
            },
          ),
        );
    }
    return Scaffold(
      backgroundColor: DertamColors.white,
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 320,
            pinned: true,
            backgroundColor: DertamColors.white,
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
            flexibleSpace: FlexibleSpaceBar(
              background: DertamImageSlideshow(
                images: placeDetailData.data?.listOfImageUrl ?? [],
              ),
            ),
          ),
          // Place Information
          SliverToBoxAdapter(
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
                            fontSize: 28,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 6,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.amber.shade50,
                          borderRadius: BorderRadius.circular(20),
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
                              placeDetailData.data?.placeDetail.ratings ??
                                  '0.0',
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 16,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),

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
                  ),
                  const SizedBox(height: 20),

                  // Description Section
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

                  // Quick Info Cards
                  Row(
                    children: [
                      Expanded(
                        child: DertamDetailInfo(
                          icon: Iconsax.clock,
                          title: 'Opening Hours',
                          value:
                              placeDetailData
                                  .data
                                  ?.placeDetail
                                  .operatingHours
                                  .entries
                                  .map((e) => '${e.key}: ${e.value}')
                                  .join(', ') ??
                              'Not Available',
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: DertamDetailInfo(
                          icon: Iconsax.ticket,
                          title: 'Entry Fee',
                          value:
                              '\$${placeDetailData.data?.placeDetail.entryFree ?? '0.0'}',
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: DertamDetailInfo(
                          icon: Iconsax.calendar,
                          title: 'Best Season',
                          value:
                              placeDetailData
                                  .data
                                  ?.placeDetail
                                  .bestSeasonToVisit ??
                              'Not Available',
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: DertamDetailInfo(
                          icon: Iconsax.people,
                          title: 'Reviews',
                          value:
                              '${placeDetailData.data?.placeDetail.reviewsCount ?? 0}+',
                        ),
                      ),
                    ],
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
                  SizedBox(
                    height: 200,
                    child: ListView.builder(
                      scrollDirection: Axis.horizontal,
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      physics: const BouncingScrollPhysics(),
                      itemCount: placeDetailData.data?.nearbyPlace.length,
                      itemBuilder: (context, index) {
                        return Container(
                          width: 200,
                          margin: const EdgeInsets.only(right: 16),
                          child: DertamNearbyPlace(
                            name:
                                placeDetailData.data?.nearbyPlace[index].name ??
                                '',
                            location:
                                placeDetailData
                                    .data
                                    ?.nearbyPlace[index]
                                    .provinceCategoryName ??
                                'Neatby not available',
                            rating:
                                double.tryParse(
                                  placeDetailData
                                          .data
                                          ?.nearbyPlace[index]
                                          .ratings ??
                                      '0.0',
                                ) ??
                                0.0,
                            imageUrl:
                                placeDetailData
                                    .data
                                    ?.nearbyPlace[index]
                                    .imagesUrl
                                    .first ??
                                '',
                            onTap: () => Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) => DetailEachPlace(
                                  placeId:
                                      placeDetailData
                                          .data
                                          ?.nearbyPlace[index]
                                          .placeID
                                          .toString() ??
                                      '',
                                ),
                              ),
                            ),
                          ),
                        );
                      },
                    ),
                  ),
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

                  // Hotel List with State Management
                  content,

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
                  SizedBox(
                    height: 200,
                    child: ListView.builder(
                      scrollDirection: Axis.horizontal,
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      physics: const BouncingScrollPhysics(),
                      itemCount: _dummyPlaceData.restaurantNearby.length,
                      itemBuilder: (context, index) {
                        return Container(
                          width: 260,
                          margin: const EdgeInsets.only(right: 16),
                          child: DertamRetauanrantNearby(
                            name: _dummyPlaceData.restaurantNearby[index].name,
                            location: _dummyPlaceData
                                .restaurantNearby[index]
                                .location,
                            rating:
                                _dummyPlaceData.restaurantNearby[index].rating,
                            imageUrl:
                                _dummyPlaceData
                                    .restaurantNearby[index]
                                    .imageUrl
                                    .isNotEmpty
                                ? _dummyPlaceData
                                      .restaurantNearby[index]
                                      .imageUrl
                                : '',
                            onTap: () => Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) => RestaurantDetailScreen(
                                  restaurant:
                                      _dummyPlaceData.restaurantNearby[index],
                                ),
                              ),
                            ),
                          ),
                        );
                      },
                    ),
                  ),
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
