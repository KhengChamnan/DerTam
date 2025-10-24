// ignore_for_file: deprecated_member_use

import 'package:flutter/material.dart';
import 'package:mobile_frontend/ui/providers/asyncvalue.dart';
import 'package:mobile_frontend/ui/providers/place_provider.dart';
import 'package:mobile_frontend/ui/screen/home_screen/widget/home_slide_show.dart';
import 'package:mobile_frontend/ui/screen/home_screen/widget/places_category.dart';
import 'package:mobile_frontend/ui/screen/home_screen/widget/recommendation_place_card.dart';
import 'package:mobile_frontend/ui/screen/home_screen/widget/upcoming_even.dart';
import 'package:mobile_frontend/ui/screen/place_datail/place_detailed.dart';
import 'package:mobile_frontend/ui/theme/dertam_apptheme.dart';
import 'package:mobile_frontend/ui/widgets/navigation/navigation_bar.dart';
import 'package:provider/provider.dart';

class HomePage extends StatefulWidget {
  HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  @override
  void initState() {
    super.initState();
    // Fetch recommended places and upcoming events when the page loads
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final placeProvider = context.read<PlaceProvider>();
      placeProvider.fetchRecommendedPlaces();
      placeProvider.fetchUpcomingEvents();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          child: Column(
            children: [
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // User Profile Header
                    Row(
                      children: [
                        CircleAvatar(
                          backgroundImage: NetworkImage(
                            'https://i.pravatar.cc/100',
                          ),
                          onBackgroundImageError: (e, stackTrace) {
                            return;
                          },
                          backgroundColor: Colors.grey[200],
                          radius: 20,
                          child: Icon(Icons.person, color: Colors.grey[400]),
                        ),
                        SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            'Hi John,',
                            style: TextStyle(
                              color: DertamColors.primaryBlue,
                              fontSize: 24,
                            ),
                          ),
                        ),
                        IconButton(
                          icon: Icon(Icons.search),
                          color: DertamColors.primaryBlue,
                          iconSize: 28,
                          onPressed: () {},
                        ),
                        SizedBox(width: 8),
                        IconButton(
                          icon: Icon(Icons.notifications_none_outlined),
                          color: Colors.grey[600],
                          iconSize: 28,
                          onPressed: () {},
                        ),
                      ],
                    ),
                    SizedBox(height: 16),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Row(
                            children: [
                              SizedBox(width: 12),
                              Text(
                                'Welcome to Cambodia\nWhere you wanna go?',
                                style: TextStyle(
                                  color: DertamColors.primaryBlue,
                                  fontSize: 32,
                                  fontWeight: FontWeight.bold,
                                  height: 1.2,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    SizedBox(height: 20),
                    // Custom Slideshow
                    HomeSlideShow(),
                    SizedBox(height: 20),
                    SizedBox(child: PlacesCategory()),
                    // Place Recommendations
                    Text(
                      'Personalized Recommended',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 24,
                        color: DertamColors.primaryBlue,
                      ),
                    ),
                    SizedBox(height: 10),
                    Consumer<PlaceProvider>(
                      builder: (context, placeProvider, child) {
                        final recommendedPlaces =
                            placeProvider.recommendedPlaces;

                        // Handle loading state
                        if (recommendedPlaces.state ==
                            AsyncValueState.loading) {
                          return SizedBox(
                            height: 280,
                            child: Center(
                              child: CircularProgressIndicator(
                                color: DertamColors.primaryBlue,
                              ),
                            ),
                          );
                        }
                        // Handle error state
                        if (recommendedPlaces.state == AsyncValueState.error) {
                          return SizedBox(
                            height: 280,
                            child: Center(
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(
                                    Icons.error_outline,
                                    size: 48,
                                    color: Colors.red,
                                  ),
                                  SizedBox(height: 16),
                                  Text(
                                    'Failed to load recommendations',
                                    style: TextStyle(color: Colors.grey[600]),
                                  ),
                                  SizedBox(height: 8),
                                  ElevatedButton(
                                    onPressed: () {
                                      context
                                          .read<PlaceProvider>()
                                          .fetchRecommendedPlaces();
                                    },
                                    child: Text('Retry'),
                                  ),
                                ],
                              ),
                            ),
                          );
                        }

                        // Handle empty state
                        if (recommendedPlaces.state == AsyncValueState.empty ||
                            recommendedPlaces.data == null ||
                            recommendedPlaces.data!.isEmpty) {
                          return SizedBox(
                            height: 280,
                            child: Center(
                              child: Text(
                                'No recommendations available',
                                style: TextStyle(color: Colors.grey[600]),
                              ),
                            ),
                          );
                        }

                        // Handle success state
                        return SingleChildScrollView(
                          scrollDirection: Axis.horizontal,
                          child: Row(
                            children: recommendedPlaces.data!
                                .map(
                                  (place) => RecommendationPlaceCard(
                                    place: place,
                                    onTap: () => Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                        builder: (context) => DetailEachPlace(
                                          placeId: place.placeId,
                                        ),
                                      ),
                                    ),
                                  ),
                                )
                                .toList(),
                          ),
                        );
                      },
                    ),
                    SizedBox(height: 20),

                    // Upcoming Events
                    Text(
                      'Upcoming Event',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 24,
                        color: DertamColors.primaryBlue,
                      ),
                    ),
                    SizedBox(height: 10),

                    Consumer<PlaceProvider>(
                      builder: (context, placeProvider, child) {
                        final upcomingEvents = placeProvider.upcomingEvents;

                        // Handle loading state
                        if (upcomingEvents.state == AsyncValueState.loading) {
                          return SizedBox(
                            height: 260,
                            child: Center(
                              child: CircularProgressIndicator(
                                color: DertamColors.primaryBlue,
                              ),
                            ),
                          );
                        }

                        // Handle error state
                        if (upcomingEvents.state == AsyncValueState.error) {
                          return SizedBox(
                            height: 260,
                            child: Center(
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(
                                    Icons.error_outline,
                                    size: 48,
                                    color: Colors.red,
                                  ),
                                  SizedBox(height: 16),
                                  Text(
                                    'Failed to load upcoming events',
                                    style: TextStyle(color: Colors.grey[600]),
                                  ),
                                  SizedBox(height: 8),
                                  ElevatedButton(
                                    onPressed: () {
                                      context
                                          .read<PlaceProvider>()
                                          .fetchUpcomingEvents();
                                    },
                                    child: Text('Retry'),
                                  ),
                                ],
                              ),
                            ),
                          );
                        }

                        // Handle empty state
                        if (upcomingEvents.state == AsyncValueState.empty ||
                            upcomingEvents.data == null ||
                            upcomingEvents.data!.isEmpty) {
                          return SizedBox(
                            height: 260,
                            child: Center(
                              child: Text(
                                'No upcoming events available',
                                style: TextStyle(color: Colors.grey[600]),
                              ),
                            ),
                          );
                        }

                        // Handle success state
                        return SizedBox(
                          height: 260,
                          child: ListView.builder(
                            scrollDirection: Axis.horizontal,
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                            physics: const BouncingScrollPhysics(),
                            itemCount: upcomingEvents.data!.length,
                            itemBuilder: (context, index) {
                              final event = upcomingEvents.data![index];
                              return Container(
                                width: 320,
                                margin: const EdgeInsets.only(right: 16),
                                child: EventCard(
                                  place: event,
                                  onTap: () => Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                      builder: (context) => DetailEachPlace(
                                        placeId: event.placeId,
                                      ),
                                    ),
                                  ),
                                ),
                              );
                            },
                          ),
                        );
                      },
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
      bottomNavigationBar: Navigationbar(currentIndex: 0),
    );
  }
}
