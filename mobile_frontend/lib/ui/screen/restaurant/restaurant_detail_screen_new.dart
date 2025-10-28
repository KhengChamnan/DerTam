import 'package:flutter/material.dart';
import 'package:iconsax/iconsax.dart';
import 'package:mobile_frontend/models/place/place_detail.dart';
import 'package:mobile_frontend/models/restaurant/food_menu.dart';
import 'package:mobile_frontend/ui/screen/restaurant/widget/food_category_tab.dart';
import 'package:mobile_frontend/ui/screen/restaurant/widget/list_food_menu.dart';
import 'package:mobile_frontend/ui/theme/dertam_apptheme.dart';

///
/// Restaurant Detail Screen displays detailed information about a restaurant.
/// Users can:
/// - View restaurant images
/// - See location, ratings, and description
/// - Browse menu items by category (Food, Drink, Snack, Others)
/// - See menu item prices
///
class RestaurantDetailScreen extends StatefulWidget {
  final NearByRestaurant restaurant;

  const RestaurantDetailScreen({super.key, required this.restaurant});

  @override
  State<RestaurantDetailScreen> createState() => _RestaurantDetailScreenState();
}

class _RestaurantDetailScreenState extends State<RestaurantDetailScreen> {
  bool _isFavorite = false;
  String _selectedCategory = 'Food';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: DertamColors.backgroundWhite,
      body: CustomScrollView(
        slivers: [
          // App Bar with image
          SliverAppBar(
            expandedHeight: 250,
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
                          Text(
                            'Route',
                            style: DertamTextStyles.bodyMedium.copyWith(
                              fontWeight: FontWeight.w600,
                              color: DertamColors.primaryDark,
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
                    'Malis Cambodian Cuisine draws inspiration from the ancient Angkor period, offering a unique flavor profile created through a masterful blend of spices. Each dish reflects Cambodia\'s rich botanical heritage.',
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
                  const SizedBox(height: DertamSpacings.xs),
                  // Location
                  Row(
                    children: [
                      Icon(
                        Iconsax.location,
                        size: 16,
                        color: DertamColors.primaryDark,
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          'TK ${widget.restaurant.googleMapsLink}',
                          style: DertamTextStyles.bodyMedium.copyWith(
                            color: DertamColors.primaryDark,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: DertamSpacings.l),
                  // Menu section title
                  Text(
                    'Menu',
                    style: DertamTextStyles.title.copyWith(
                      color: DertamColors.primaryDark,
                      fontWeight: FontWeight.bold,
                      fontSize: 20,
                    ),
                  ),

                  const SizedBox(height: DertamSpacings.s),
                ],
              ),
            ),
          ),

          // Menu category tabs
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: DertamSpacings.m),
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    FoodCategoryTab(
                      icon: Iconsax.cake,
                      label: 'Food',
                      isSelected: _selectedCategory == 'Food',
                      onTap: () {
                        setState(() {
                          _selectedCategory = 'Food';
                        });
                      },
                    ),
                    const SizedBox(width: DertamSpacings.xs),

                    FoodCategoryTab(
                      label: 'Drink',
                      icon: Iconsax.cup,
                      isSelected: _selectedCategory == 'Drink',
                      onTap: () {
                        setState(() {
                          _selectedCategory = 'Drink';
                        });
                      },
                    ),
                    const SizedBox(width: DertamSpacings.xs),
                    FoodCategoryTab(
                      icon: Iconsax.coffee,
                      label: 'Snack',
                      isSelected: _selectedCategory == 'Snack',
                      onTap: () {
                        setState(() {
                          _selectedCategory = 'Snack';
                        });
                      },
                    ),
                  ],
                ),
              ),
            ),
          ),
          const SliverToBoxAdapter(child: SizedBox(height: DertamSpacings.m)),
          // Menu items grid
          SliverPadding(
            padding: const EdgeInsets.symmetric(horizontal: DertamSpacings.m),
            sliver: SliverGrid(
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: DertamSpacings.s,
                mainAxisSpacing: DertamSpacings.s,
                childAspectRatio: 0.85,
              ),
              delegate: SliverChildBuilderDelegate((context, index) {
                return ListFoodMenu(menuItem: _getMenuItems()[index]);
              }, childCount: _getMenuItems().length),
            ),
          ),
          const SliverToBoxAdapter(child: SizedBox(height: DertamSpacings.l)),
        ],
      ),
    );
  }

  /// Get menu items based on selected category
  List<MenuItem> _getMenuItems() {
    // Dummy menu data
    final allItems = [
      MenuItem(
        name: 'Nom banh chok',
        imageUrl:
            'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400',
        price: '5',
      ),
      MenuItem(
        name: 'Nom banh chok',
        imageUrl:
            'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
        price: '5',
      ),
      MenuItem(
        name: 'Nom banh chok',
        imageUrl:
            'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400',
        price: '5',
      ),
      MenuItem(
        name: 'Chez Teritori',
        imageUrl:
            'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400',
        price: '5',
      ),
    ];
    return allItems;
  }
}
