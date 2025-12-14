import 'package:flutter/material.dart';
import 'package:iconsax/iconsax.dart';
import 'package:mobile_frontend/models/place/place_detail.dart';
import 'package:mobile_frontend/models/restaurant/food_menu.dart';
import 'package:mobile_frontend/ui/providers/restaurant_provider.dart';
import 'package:mobile_frontend/ui/screen/dertam_map/place_map_screen.dart';
import 'package:mobile_frontend/ui/screen/restaurant/widget/food_category_tab.dart';
import 'package:mobile_frontend/ui/screen/restaurant/widget/list_food_menu.dart';
import 'package:mobile_frontend/ui/theme/dertam_apptheme.dart';
import 'package:provider/provider.dart';

class RestaurantDetailScreen extends StatefulWidget {
  final NearByRestaurant restaurant;

  const RestaurantDetailScreen({super.key, required this.restaurant});

  @override
  State<RestaurantDetailScreen> createState() => _RestaurantDetailScreenState();
}

class _RestaurantDetailScreenState extends State<RestaurantDetailScreen> {
  bool _isFavorite = false;
  String _selectedCategory = 'All';
  int? _selectedCategoryId;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _fetchData();
    });
  }

  Future<void> _fetchData() async {
    final provider = Provider.of<RestaurantProvider>(context, listen: false);
    await provider.fetchMenuCategories();
    await provider.fetchMenuItems(widget.restaurant.placeID.toString());
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: DertamColors.backgroundWhite,
      body: CustomScrollView(
        slivers: [
          // App Bar with image
          SliverAppBar(
            expandedHeight: 250,
            pinned: false,
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
            actions: [
              Padding(
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
                      _isFavorite ? Iconsax.heart5 : Iconsax.heart,
                      color: _isFavorite
                          ? Colors.red
                          : DertamColors.primaryDark,
                      size: 20,
                    ),
                    onPressed: () {
                      setState(() {
                        _isFavorite = !_isFavorite;
                      });
                    },
                  ),
                ),
              ),
            ],
            flexibleSpace: FlexibleSpaceBar(
              background: Stack(
                fit: StackFit.expand,
                children: [
                  widget.restaurant.imagesUrl.isEmpty
                      ? Container(
                          color: Colors.grey[300],
                          child: Icon(
                            Icons.restaurant,
                            size: 80,
                            color: Colors.grey[500],
                          ),
                        )
                      : Image.network(
                          widget.restaurant.imagesUrl[0],
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) {
                            return Container(
                              color: Colors.grey[300],
                              child: Icon(
                                Icons.broken_image_outlined,
                                size: 80,
                                color: Colors.grey[500],
                              ),
                            );
                          },
                        ),
                  // Route button overlay
                  Positioned(
                    bottom: 16,
                    right: 16,
                    child: Container(
                      height: 48,
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 8,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.1),
                            spreadRadius: 0,
                            blurRadius: 8,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            Iconsax.routing_2,
                            size: 18,
                            color: DertamColors.primaryDark,
                          ),
                          const SizedBox(width: 6),
                          TextButton(
                            onPressed: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (context) => PlaceMapScreen(
                                    latitude: widget.restaurant.latitude,
                                    longitude: widget.restaurant.longitude,
                                    placeName: widget.restaurant.name,
                                    googleMapsLink:
                                        widget.restaurant.googleMapsLink,
                                  ),
                                ),
                              );
                            },
                            child: Text(
                              'Route',
                              style: DertamTextStyles.bodyMedium.copyWith(
                                fontWeight: FontWeight.w600,
                                color: DertamColors.primaryDark,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          // Content
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(DertamSpacings.m),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Restaurant name and rating
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          widget.restaurant.name,
                          style: DertamTextStyles.title.copyWith(
                            color: DertamColors.primaryDark,
                            fontWeight: FontWeight.bold,
                            fontSize: 22,
                          ),
                        ),
                      ),
                      // Star rating
                      ...List.generate(
                        5,
                        (index) => Icon(
                          index <
                                  double.parse(
                                    widget.restaurant.ratings.toString(),
                                  ).floor()
                              ? Icons.star
                              : Icons.star_border,
                          color: Colors.amber,
                          size: 20,
                        ),
                      ),
                      const SizedBox(width: 4),
                      Text(
                        widget.restaurant.ratings.toString(),
                        style: DertamTextStyles.body.copyWith(
                          fontWeight: FontWeight.w600,
                          color: DertamColors.primaryDark,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: DertamSpacings.s),
                  // Description
                  Text(
                    widget.restaurant.description,
                    style: DertamTextStyles.bodyMedium.copyWith(
                      color: Colors.grey[700],
                      height: 1.5,
                    ),
                  ),
                  const SizedBox(height: DertamSpacings.m),
                  // Phone number
                  Row(
                    children: [
                      Icon(
                        Iconsax.call,
                        size: 16,
                        color: DertamColors.primaryDark,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        '+855 123456',
                        style: DertamTextStyles.bodyMedium.copyWith(
                          color: DertamColors.primaryDark,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: DertamSpacings.s),
                  // Menu section title
                  Text(
                    'Menu',
                    style: DertamTextStyles.title.copyWith(
                      color: DertamColors.primaryDark,
                      fontWeight: FontWeight.bold,
                      fontSize: 20,
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Menu category tabs
          SliverToBoxAdapter(
            child: Consumer<RestaurantProvider>(
              builder: (context, provider, child) {
                return provider.menuCategoriesSnapshot.when(
                  empty: () => const SizedBox.shrink(),
                  loading: () => const Padding(
                    padding: EdgeInsets.symmetric(horizontal: DertamSpacings.m),
                    child: Center(child: CircularProgressIndicator()),
                  ),
                  error: (error) => const SizedBox.shrink(),
                  success: (categories) {
                    return Padding(
                      padding: const EdgeInsets.symmetric(
                        horizontal: DertamSpacings.m,
                      ),
                      child: SingleChildScrollView(
                        scrollDirection: Axis.horizontal,
                        child: Row(
                          children: [
                            FoodCategoryTab(
                              icon: Iconsax.menu_board,
                              label: 'All',
                              isSelected: _selectedCategory == 'All',
                              onTap: () {
                                setState(() {
                                  _selectedCategory = 'All';
                                  _selectedCategoryId = null;
                                });
                              },
                            ),
                            const SizedBox(width: DertamSpacings.xs),
                            ...categories.map((category) {
                              final categoryName =
                                  category.categoryName ?? 'Unknown';
                              IconData icon = _getCategoryIcon(categoryName);
                              return Padding(
                                padding: const EdgeInsets.only(
                                  right: DertamSpacings.xs,
                                ),
                                child: FoodCategoryTab(
                                  icon: icon,
                                  label: categoryName,
                                  isSelected: _selectedCategory == categoryName,
                                  onTap: () {
                                    setState(() {
                                      _selectedCategory = categoryName;
                                      _selectedCategoryId = category.menuId;
                                    });
                                  },
                                ),
                              );
                            }),
                          ],
                        ),
                      ),
                    );
                  },
                );
              },
            ),
          ),
          const SliverToBoxAdapter(child: SizedBox(height: DertamSpacings.m)),
          // Menu items grid
          Consumer<RestaurantProvider>(
            builder: (context, provider, child) {
              return provider.menuItems.when(
                empty: () => const SliverToBoxAdapter(
                  child: Padding(
                    padding: EdgeInsets.all(DertamSpacings.l),
                    child: Center(
                      child: Text(
                        'No menu items available',
                        style: TextStyle(color: Colors.grey),
                      ),
                    ),
                  ),
                ),
                loading: () => const SliverToBoxAdapter(
                  child: Padding(
                    padding: EdgeInsets.all(DertamSpacings.l),
                    child: Center(child: CircularProgressIndicator()),
                  ),
                ),
                error: (error) => SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.all(DertamSpacings.l),
                    child: Center(
                      child: Text(
                        'Error: ${error.toString()}',
                        style: const TextStyle(color: Colors.red),
                      ),
                    ),
                  ),
                ),
                success: (menuData) {
                  final filteredItems = _filterMenuItems(
                    menuData.data.menuItems,
                  );

                  if (filteredItems.isEmpty) {
                    return const SliverToBoxAdapter(
                      child: Padding(
                        padding: EdgeInsets.all(DertamSpacings.l),
                        child: Center(
                          child: Text(
                            'No items in this category',
                            style: TextStyle(color: Colors.grey),
                          ),
                        ),
                      ),
                    );
                  }

                  return SliverPadding(
                    padding: const EdgeInsets.symmetric(
                      horizontal: DertamSpacings.m,
                    ),
                    sliver: SliverGrid(
                      gridDelegate:
                          const SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: 2,
                            crossAxisSpacing: DertamSpacings.s,
                            mainAxisSpacing: DertamSpacings.s,
                            childAspectRatio: 0.85,
                          ),
                      delegate: SliverChildBuilderDelegate((context, index) {
                        return ListFoodMenu(menuItem: filteredItems[index]);
                      }, childCount: filteredItems.length),
                    ),
                  );
                },
              );
            },
          ),
          const SliverToBoxAdapter(child: SizedBox(height: DertamSpacings.l)),
        ],
      ),
    );
  }

  List<MenuItem> _filterMenuItems(List<MenuItem> items) {
    if (_selectedCategoryId == null) {
      return items;
    }
    return items
        .where((item) => item.menuCategoryId == _selectedCategoryId)
        .toList();
  }

  IconData _getCategoryIcon(String categoryName) {
    final lowerName = categoryName.toLowerCase();
    if (lowerName.contains('food') || lowerName.contains('main')) {
      return Iconsax.cake;
    } else if (lowerName.contains('drink') || lowerName.contains('beverage')) {
      return Iconsax.cup;
    } else if (lowerName.contains('snack') || lowerName.contains('appetizer')) {
      return Iconsax.coffee;
    } else if (lowerName.contains('dessert')) {
      return Iconsax.cake;
    }
    return Iconsax.menu_board;
  }
}
