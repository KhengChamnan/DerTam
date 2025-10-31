import 'package:flutter/material.dart';
import 'package:mobile_frontend/ui/screen/place_datail/place_detailed.dart';
import 'package:mobile_frontend/ui/theme/dertam_apptheme.dart';
import 'package:provider/provider.dart';
import 'package:mobile_frontend/ui/providers/place_provider.dart';
import 'package:mobile_frontend/ui/providers/asyncvalue.dart';
import 'package:mobile_frontend/models/place/place.dart';

class PlacesCategory extends StatefulWidget {
  const PlacesCategory({super.key});

  @override
  State<PlacesCategory> createState() => _PlacesCategoryState();
}

class _PlacesCategoryState extends State<PlacesCategory> {
  int? selectedCategoryId;

  @override
  void initState() {
    super.initState();
    // Fetch categories when the widget is initialized
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final placeProvider = context.read<PlaceProvider>();
      placeProvider.fetchPlaceCategories();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<PlaceProvider>(
      builder: (context, placeProvider, child) {
        final categoriesAsync = placeProvider.placeCategory;
        final placesAsync = placeProvider.places;

        // Handle categories loading and error states
        if (categoriesAsync.state == AsyncValueState.loading) {
          return const Center(
            child: Padding(
              padding: EdgeInsets.all(20.0),
              child: CircularProgressIndicator(),
            ),
          );
        }

        if (categoriesAsync.state == AsyncValueState.error) {
          return Center(
            child: Padding(
              padding: const EdgeInsets.all(20.0),
              child: Text(
                'Error loading categories: ${categoriesAsync.error}',
                style: const TextStyle(color: Colors.red),
              ),
            ),
          );
        }
        final categories = categoriesAsync.data ?? [];
        if (categories.isEmpty) {
          return const Center(
            child: Padding(
              padding: EdgeInsets.all(20.0),
              child: Text('No categories available'),
            ),
          );
        }
        // Set default category and load places if not selected
        if (selectedCategoryId == null && categories.isNotEmpty) {
          WidgetsBinding.instance.addPostFrameCallback((_) {
            setState(() {
              selectedCategoryId = categories.first.categoryId;
            });
            placeProvider.getPlacesByCategory(categories.first.categoryId);
          });
        }

        return Column(
          children: [
            // Category Filter Bar
            Container(
              height: 50,
              margin: const EdgeInsets.symmetric(horizontal: 16),
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                itemCount: categories.length,
                itemBuilder: (context, index) {
                  final category = categories[index];
                  final isSelected = category.categoryId == selectedCategoryId;

                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: FilterChip(
                      selected: isSelected,
                      label: Text(category.categoryName),
                      selectedColor: isSelected
                          ? DertamColors.primaryDark
                          : DertamColors.white,
                      onSelected: (selected) {
                        setState(() {
                          selectedCategoryId = category.categoryId;
                        });
                        // Fetch places for the selected category
                        placeProvider.getPlacesByCategory(category.categoryId);
                      },
                      labelStyle: TextStyle(
                        color: isSelected ? Colors.white : Colors.black87,
                      ),
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: 16),
            // Places List
            _buildPlacesList(placesAsync),
          ],
        );
      },
    );
  }

  Widget _buildPlacesList(AsyncValue<List<Place>> placesAsync) {
    if (placesAsync.state == AsyncValueState.loading) {
      return const SizedBox(
        height: 260,
        child: Center(child: CircularProgressIndicator()),
      );
    }

    if (placesAsync.state == AsyncValueState.error) {
      return SizedBox(
        height: 260,
        child: Center(
          child: Text(
            'Error loading places: ${placesAsync.error}',
            style: const TextStyle(color: Colors.red),
          ),
        ),
      );
    }

    final places = placesAsync.data ?? [];

    if (places.isEmpty) {
      return const SizedBox(
        height: 260,
        child: Center(child: Text('No places available for this category')),
      );
    }

    return SizedBox(
      height: 260,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        physics: const BouncingScrollPhysics(),
        itemCount: places.length,
        itemBuilder: (context, index) {
          final place = places[index];
          return Container(
            width: 320,
            margin: const EdgeInsets.only(right: 16),
            child: CategoryPlaceCard(
              name: place.name,
              location: place
                  .locationName, // You may want to map this to actual province name
              rating: place.ratings,
              imageUrl: place.imagesUrl.isNotEmpty
                  ? place.imagesUrl
                  : '', // Empty string for no image
              onTap: () => Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => DetailEachPlace(placeId: place.placeId),
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}

class CategoryPlaceCard extends StatelessWidget {
  final String name;
  final String location;
  final double rating;
  final String imageUrl;
  final VoidCallback? onTap;

  const CategoryPlaceCard({
    super.key,
    required this.name,
    required this.location,
    required this.rating,
    required this.imageUrl,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: Colors.grey.withOpacity(0.1),
              spreadRadius: 0,
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Expanded(
              child: Stack(
                children: [
                  ClipRRect(
                    borderRadius: const BorderRadius.vertical(
                      top: Radius.circular(20),
                      bottom: Radius.circular(20),
                    ),
                    child: imageUrl.isEmpty
                        ? Container(
                            height: 180,
                            width: double.infinity,
                            color: Colors.grey[300],
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(
                                  Icons.image_outlined,
                                  size: 50,
                                  color: Colors.grey[500],
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  'No Image',
                                  style: TextStyle(
                                    color: Colors.grey[600],
                                    fontSize: 14,
                                  ),
                                ),
                              ],
                            ),
                          )
                        : Image.network(
                            imageUrl,
                            height: 180,
                            width: double.infinity,
                            fit: BoxFit.cover,
                            loadingBuilder: (context, child, loadingProgress) {
                              if (loadingProgress == null) return child;
                              return Container(
                                height: 180,
                                width: double.infinity,
                                color: Colors.grey[200],
                                child: Center(
                                  child: CircularProgressIndicator(
                                    value:
                                        loadingProgress.expectedTotalBytes !=
                                            null
                                        ? loadingProgress
                                                  .cumulativeBytesLoaded /
                                              loadingProgress
                                                  .expectedTotalBytes!
                                        : null,
                                  ),
                                ),
                              );
                            },
                            errorBuilder: (context, error, stackTrace) {
                              print(
                                '❌ [CategoryPlaceCard] Error loading image: $error',
                              );
                              return Container(
                                height: 180,
                                width: double.infinity,
                                color: Colors.grey[300],
                                child: Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Icon(
                                      Icons.broken_image_outlined,
                                      size: 50,
                                      color: Colors.grey[500],
                                    ),
                                    const SizedBox(height: 8),
                                    Text(
                                      'Image not available',
                                      style: TextStyle(
                                        color: Colors.grey[600],
                                        fontSize: 12,
                                      ),
                                    ),
                                  ],
                                ),
                              );
                            },
                          ),
                  ),
                  // Like button
                  Positioned(
                    top: 8,
                    right: 8,
                    child: GestureDetector(
                      onTap: () {
                        // Handle favorite action
                        print('❤️ Favorite tapped for: $name');
                      },
                      child: Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.1),
                              spreadRadius: 0,
                              blurRadius: 4,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: const Icon(
                          Icons.favorite_border,
                          color: Colors.grey,
                          size: 20,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 8),
            // Content
            Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Place name
                  Text(
                    name,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w600,
                      color: Color(0xFF1F1F1F),
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  // Location and rating
                  Row(
                    children: [
                      const Icon(
                        Icons.location_on,
                        color: Color(0xFF526B8C),
                        size: 16,
                      ),
                      const SizedBox(width: 4),
                      Expanded(
                        child: Text(
                          location,
                          style: const TextStyle(
                            color: Color(0xFF526B8C),
                            fontSize: 14,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const Icon(
                        Icons.star_rounded,
                        color: Color(0xFFFFB23F),
                        size: 18,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        rating.toString(),
                        style: const TextStyle(
                          color: Color(0xFF1F1F1F),
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
