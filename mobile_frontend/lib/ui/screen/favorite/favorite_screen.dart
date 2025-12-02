import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:mobile_frontend/models/place/place.dart';
import 'package:mobile_frontend/ui/theme/dertam_apptheme.dart';
import 'package:mobile_frontend/ui/widgets/actions/dertam_button.dart';
import 'package:mobile_frontend/ui/widgets/navigation/navigation_bar.dart';
import 'package:mobile_frontend/ui/screen/home_screen/home_page.dart';
import 'package:mobile_frontend/ui/screen/trip/widgets/dertam_trip_planning_screen.dart';

class FavoriteScreen extends StatefulWidget {
  const FavoriteScreen({super.key});
  @override
  State<FavoriteScreen> createState() => _FavoriteScreenState();
}

class _FavoriteScreenState extends State<FavoriteScreen>
    with TickerProviderStateMixin {
  late TabController _tabController;
  List<Place> _favoritePlaces = [];
  List<Place> _filteredPlaces = [];
  String _selectedCategory = 'All';
  bool _isLoading = true;
  final TextEditingController _searchController = TextEditingController();
  // Categories for filtering
  final List<Map<String, dynamic>> _categories = [
    {'id': 0, 'name': 'All', 'icon': Icons.apps},
    {'id': 1, 'name': 'Temple', 'icon': Icons.temple_hindu},
    {'id': 2, 'name': 'Hotel', 'icon': Icons.hotel},
    {'id': 3, 'name': 'Restaurant', 'icon': Icons.restaurant},
    {'id': 4, 'name': 'Attraction', 'icon': Icons.attractions},
    {'id': 5, 'name': 'Nature', 'icon': Icons.nature},
  ];
  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadFavoritePlaces();
  }

  @override
  void dispose() {
    _tabController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadFavoritePlaces() async {
    setState(() {
      _isLoading = true;
    });

    try {
      await Future.delayed(const Duration(seconds: 1)); // Simulate loading
      _favoritePlaces = _getMockFavoritePlaces();
      _filteredPlaces = _favoritePlaces;
    } catch (e) {
      debugPrint('Error loading favorite places: $e');
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  void _filterPlaces() {
    setState(() {
      _filteredPlaces = _favoritePlaces.where((place) {
        final matchesSearch =
            place.name.toLowerCase().contains(
              _searchController.text.toLowerCase(),
            ) ||
            place.description.toLowerCase().contains(
              _searchController.text.toLowerCase(),
            );

        final matchesCategory =
            _selectedCategory == 'All' ||
            _getCategoryName(place.categoryId) == _selectedCategory;

        return matchesSearch && matchesCategory;
      }).toList();
    });
  }

  String _getCategoryName(int categoryId) {
    final category = _categories.firstWhere(
      (cat) => cat['id'] == categoryId,
      orElse: () => {'name': 'Other'},
    );
    return category['name'];
  }

  void _removeFavorite(Place place) {
    setState(() {
      _favoritePlaces.removeWhere((p) => p.placeId == place.placeId);
      _filterPlaces();
    });

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('${place.name} removed from favorites'),
        action: SnackBarAction(
          label: 'Undo',
          onPressed: () {
            setState(() {
              _favoritePlaces.add(place);
              _filterPlaces();
            });
          },
        ),
        duration: const Duration(seconds: 3),
      ),
    );
  }

  void _navigateToTripPlanning() {
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (context) => const TripPlanning()),
    );
  }

  void _navigateToExplore() {
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (context) => HomePage()),
    );
  }

  void _showComingSoonDialog(String feature) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          title: Row(
            children: [
              Icon(
                Icons.rocket_launch,
                color: DertamColors.primaryDark,
                size: 28,
              ),
              const SizedBox(width: 12),
              Text(
                'Coming Soon!',
                style: TextStyle(
                  color: DertamColors.primaryDark,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          content: Text(
            '$feature will be available soon!',
            style: TextStyle(
              fontSize: 16,
              color: Colors.grey[700],
              height: 1.4,
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: Text(
                'Got it!',
                style: TextStyle(
                  color: DertamColors.primaryDark,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ],
        );
      },
    );
  }

  void _openInMaps(Place place) {
    _showComingSoonDialog('Map Integration');
  }

  void _addToTrip(Place place) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => _AddToTripSheet(
        place: place,
        onAddToExistingTrip: () {
          Navigator.pop(context);
          _showComingSoonDialog('Trip Management');
        },
        onCreateNewTrip: () {
          Navigator.pop(context);
          _showComingSoonDialog('Trip Creation');
        },
      ),
    );
  }

  void _showPlaceDetails(Place place) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => _PlaceDetailsSheet(
        place: place,
        onRemoveFavorite: () => _removeFavorite(place),
        onViewOnMap: () => _openInMaps(place),
        onAddToTrip: () => _addToTrip(place),
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
          'My Favorites',
          style: DertamTextStyles.title.copyWith(color: DertamColors.black),
        ),
        centerTitle: true,

        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(100),
          child: Column(
            children: [
              // Search Bar
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: TextField(
                  controller: _searchController,
                  onChanged: (value) => _filterPlaces(),
                  decoration: InputDecoration(
                    hintText: 'Search your favorite places...',
                    prefixIcon: Icon(Icons.search, color: Colors.grey[600]),
                    suffixIcon: _searchController.text.isNotEmpty
                        ? IconButton(
                            icon: Icon(Icons.clear, color: Colors.grey[600]),
                            onPressed: () {
                              _searchController.clear();
                              _filterPlaces();
                            },
                          )
                        : null,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(25),
                      borderSide: BorderSide(color: Colors.grey[300]!),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(25),
                      borderSide: BorderSide(color: DertamColors.primaryDark),
                    ),
                    filled: true,
                    fillColor: Colors.grey[100],
                  ),
                ),
              ),
              const SizedBox(height: 16),
              _buildCategoryFilter(),
            ],
          ),
        ),
      ),
      body: _isLoading
          ? _buildLoadingState()
          : _favoritePlaces.isEmpty
          ? _buildEmptyState()
          : _buildFavoritesList(),
      bottomNavigationBar: const Navigationbar(currentIndex: 3),
    );
  }

  Widget _buildCategoryFilter() {
    return SizedBox(
      height: 40,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: _categories.length,
        itemBuilder: (context, index) {
          final category = _categories[index];
          final isSelected = _selectedCategory == category['name'];

          return Padding(
            padding: const EdgeInsets.only(right: 8),
            child: _CategoryChip(
              category: category['name'],
              icon: category['icon'],
              isSelected: isSelected,
              onTap: () {
                setState(() {
                  _selectedCategory = category['name'];
                });
                _filterPlaces();
              },
            ),
          );
        },
      ),
    );
  }

  Widget _buildLoadingState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          CircularProgressIndicator(color: DertamColors.primaryDark),
          const SizedBox(height: 16),
          Text(
            'Loading your favorites...',
            style: TextStyle(color: Colors.grey[600], fontSize: 16),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.favorite_border, size: 80, color: Colors.grey[400]),
            const SizedBox(height: 24),
            Text(
              'No Favorites Yet',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: Colors.grey[700],
              ),
            ),
            const SizedBox(height: 12),
            Text(
              'Start exploring places and add them to your favorites by tapping the heart icon.',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 16,
                color: Colors.grey[600],
                height: 1.5,
              ),
            ),
            const SizedBox(height: 32),
            Row(
              children: [
                Expanded(
                  child: DertamButton(
                    text: 'Explore Places',
                    onPressed: _navigateToExplore,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: OutlinedButton(
                    onPressed: _navigateToTripPlanning,
                    style: OutlinedButton.styleFrom(
                      side: BorderSide(color: DertamColors.primaryDark),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                    child: Text(
                      'Plan Trip',
                      style: TextStyle(color: DertamColors.primaryDark),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFavoritesList() {
    if (_filteredPlaces.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.search_off, size: 64, color: Colors.grey[400]),
              const SizedBox(height: 16),
              Text(
                'No places found',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                  color: Colors.grey[700],
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Try adjusting your search or category filter',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 14, color: Colors.grey[600]),
              ),
            ],
          ),
        ),
      );
    }

    return Column(
      children: [
        // Results Count
        Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Text(
                '${_filteredPlaces.length} place${_filteredPlaces.length != 1 ? 's' : ''} found',
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.grey[600],
                  fontWeight: FontWeight.w500,
                ),
              ),
              const Spacer(),
              if (_selectedCategory != 'All' ||
                  _searchController.text.isNotEmpty)
                TextButton(
                  onPressed: () {
                    setState(() {
                      _selectedCategory = 'All';
                      _searchController.clear();
                    });
                    _filterPlaces();
                  },
                  child: Text(
                    'Clear filters',
                    style: TextStyle(
                      color: DertamColors.primaryDark,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
            ],
          ),
        ),

        // Places Grid
        Expanded(
          child: GridView.builder(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              childAspectRatio: 0.8,
            ),
            itemCount: _filteredPlaces.length,
            itemBuilder: (context, index) {
              final place = _filteredPlaces[index];
              return _FavoritePlaceCard(
                place: place,
                onTap: () => _showPlaceDetails(place),
                onRemoveFavorite: () => _removeFavorite(place),
              );
            },
          ),
        ),
      ],
    );
  }

  // Mock data for demonstration
  List<Place> _getMockFavoritePlaces() {
    return [
      Place(
        placeId: '1',
        name: 'Angkor Wat',
        description:
            'Ancient temple complex and UNESCO World Heritage Site. One of the most magnificent architectural wonders in the world.',
        categoryId: 1,
        googleMapsLink:
            'https://maps.google.com/?q=Angkor+Wat,+Krong+Siem+Reap,+Cambodia',
        ratings: 4.8,
        reviewsCount: 15420,
        imagesUrl:
            'https://images.unsplash.com/photo-1539650116574-75c0c6d73e0e?w=500',
        imagePublicIds: 'angkor_wat_main',
        entryFree: true,
        operatingHours: {'open': '05:00', 'close': '18:00'},
        bestSeasonToVisit: 'November to March',
        provinceId: 1,
        latitude: 13.4125,
        longitude: 103.8667,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
        locationName: 'Siem Reap, Cambodia',
      ),
      Place(
        placeId: '2',
        name: 'Royal Palace',
        description:
            'Beautiful royal palace complex in Phnom Penh featuring stunning Khmer architecture and important cultural artifacts.',
        categoryId: 1,
        googleMapsLink:
            'https://maps.google.com/?q=Royal+Palace,+Phnom+Penh,+Cambodia',
        ratings: 4.5,
        reviewsCount: 8750,
        imagesUrl:
            'https://images.unsplash.com/photo-1544530612-7eadc7006f6d?w=500',
        imagePublicIds: 'royal_palace_main',
        entryFree: true,
        operatingHours: {'open': '08:00', 'close': '17:00'},
        bestSeasonToVisit: 'December to February',
        provinceId: 2,
        latitude: 11.5564,
        longitude: 104.9282,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
        locationName: 'Phnom Penh, Cambodia',
      ),
      Place(
        placeId: '3',
        name: 'Bayon Temple',
        description:
            'Famous temple known for its massive stone faces and intricate bas-relief carvings.',
        categoryId: 1,
        googleMapsLink:
            'https://maps.google.com/?q=Bayon+Temple,+Angkor+Thom,+Cambodia',
        ratings: 4.7,
        reviewsCount: 12300,
        imagesUrl:
            'https://images.unsplash.com/photo-1544530612-7eadc7006f6d?w=500',
        imagePublicIds: 'bayon_temple_main',
        entryFree: true,
        operatingHours: {'open': '05:00', 'close': '18:00'},
        bestSeasonToVisit: 'November to March',
        provinceId: 1,
        latitude: 13.4412,
        longitude: 103.8590,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
        locationName: 'Siem Reap, Cambodia',
      ),
      Place(
        placeId: '4',
        name: 'Koh Rong Beach',
        description:
            'Pristine tropical beach with crystal clear waters and white sand, perfect for relaxation and water activities.',
        categoryId: 5,
        googleMapsLink: 'https://maps.google.com/?q=Koh+Rong+Beach,+Cambodia',
        ratings: 4.6,
        reviewsCount: 5240,
        imagesUrl:
            'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500',
        imagePublicIds: 'koh_rong_main',
        entryFree: true,
        operatingHours: {'open': '24/7', 'close': '24/7'},
        bestSeasonToVisit: 'November to April',
        provinceId: 3,
        latitude: 10.6964,
        longitude: 103.2948,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
        locationName: 'Koh Rong, Cambodia',
      ),
    ];
  }
}

// Add to Trip Sheet
class _AddToTripSheet extends StatelessWidget {
  final Place place;
  final VoidCallback onAddToExistingTrip;
  final VoidCallback onCreateNewTrip;

  const _AddToTripSheet({
    required this.place,
    required this.onAddToExistingTrip,
    required this.onCreateNewTrip,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  'Add to Trip',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: DertamColors.black,
                  ),
                ),
              ),
              IconButton(
                onPressed: () => Navigator.pop(context),
                icon: Icon(Icons.close, color: Colors.grey[600]),
              ),
            ],
          ),

          const SizedBox(height: 20),

          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.grey[100],
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: Image.network(
                    place.imagesUrl,
                    width: 60,
                    height: 60,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) {
                      return Container(
                        width: 60,
                        height: 60,
                        color: Colors.grey[300],
                        child: Icon(Icons.place, color: Colors.grey[600]),
                      );
                    },
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        place.name,
                        style: const TextStyle(
                          fontWeight: FontWeight.w600,
                          fontSize: 16,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        place.locationName,
                        style: TextStyle(color: Colors.grey[600], fontSize: 14),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 20),

          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: onAddToExistingTrip,
                  icon: Icon(Icons.add, color: DertamColors.primaryDark),
                  label: Text(
                    'Add to Existing Trip',
                    style: TextStyle(color: DertamColors.primaryDark),
                  ),
                  style: OutlinedButton.styleFrom(
                    side: BorderSide(color: DertamColors.primaryDark),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 12),

          Row(
            children: [
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: onCreateNewTrip,
                  icon: Icon(Icons.create_new_folder, color: Colors.white),
                  label: Text(
                    'Create New Trip',
                    style: TextStyle(color: Colors.white),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: DertamColors.primaryDark,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 16),
        ],
      ),
    );
  }
}

// Category Chip Widget
class _CategoryChip extends StatefulWidget {
  final String category;
  final IconData icon;
  final bool isSelected;
  final VoidCallback onTap;

  const _CategoryChip({
    required this.category,
    required this.icon,
    required this.isSelected,
    required this.onTap,
  });

  @override
  State<_CategoryChip> createState() => _CategoryChipState();
}

class _CategoryChipState extends State<_CategoryChip>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 150),
      vsync: this,
    );
    _scaleAnimation = Tween<double>(begin: 1.0, end: 0.95).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _scaleAnimation,
      builder: (context, child) {
        return Transform.scale(
          scale: _scaleAnimation.value,
          child: GestureDetector(
            onTap: () {
              HapticFeedback.lightImpact();
              widget.onTap();
            },
            onTapDown: (_) => _animationController.forward(),
            onTapUp: (_) => _animationController.reverse(),
            onTapCancel: () => _animationController.reverse(),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: BoxDecoration(
                color: widget.isSelected
                    ? DertamColors.primaryDark
                    : Colors.transparent,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: widget.isSelected
                      ? DertamColors.primaryDark
                      : Colors.grey[300]!,
                ),
                boxShadow: widget.isSelected
                    ? [
                        BoxShadow(
                          color: DertamColors.primaryDark.withOpacity(0.3),
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ]
                    : null,
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    widget.icon,
                    size: 16,
                    color: widget.isSelected ? Colors.white : Colors.grey[600],
                  ),
                  const SizedBox(width: 6),
                  Text(
                    widget.category,
                    style: TextStyle(
                      color: widget.isSelected
                          ? Colors.white
                          : Colors.grey[700],
                      fontWeight: widget.isSelected
                          ? FontWeight.w600
                          : FontWeight.normal,
                      fontSize: 16,
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}

// Favorite Place Card Widget
class _FavoritePlaceCard extends StatefulWidget {
  final Place place;
  final VoidCallback onTap;
  final VoidCallback onRemoveFavorite;

  const _FavoritePlaceCard({
    required this.place,
    required this.onTap,
    required this.onRemoveFavorite,
  });

  @override
  State<_FavoritePlaceCard> createState() => _FavoritePlaceCardState();
}

class _FavoritePlaceCardState extends State<_FavoritePlaceCard>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 150),
      vsync: this,
    );
    _scaleAnimation = Tween<double>(begin: 1.0, end: 0.95).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  String _getCategoryName(int categoryId) {
    switch (categoryId) {
      case 1:
        return 'Temple';
      case 2:
        return 'Hotel';
      case 3:
        return 'Restaurant';
      case 4:
        return 'Attraction';
      case 5:
        return 'Nature';
      default:
        return 'Place';
    }
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _scaleAnimation,
      builder: (context, child) {
        return Transform.scale(
          scale: _scaleAnimation.value,
          child: GestureDetector(
            onTap: widget.onTap,
            onTapDown: (_) => _animationController.forward(),
            onTapUp: (_) => _animationController.reverse(),
            onTapCancel: () => _animationController.reverse(),
            child: Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.1),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Image and Favorite Button
                  Expanded(
                    flex: 3,
                    child: Stack(
                      children: [
                        Container(
                          width: double.infinity,
                          decoration: BoxDecoration(
                            borderRadius: const BorderRadius.vertical(
                              top: Radius.circular(16),
                            ),
                            color: Colors.grey[200],
                          ),
                          child: ClipRRect(
                            borderRadius: const BorderRadius.vertical(
                              top: Radius.circular(16),
                            ),
                            child: Image.network(
                              widget.place.imagesUrl,
                              fit: BoxFit.cover,
                              height: 150,
                              errorBuilder: (context, error, stackTrace) {
                                return Container(
                                  color: Colors.grey[300],
                                  child: Icon(
                                    Icons.image_not_supported,
                                    color: Colors.grey[600],
                                    size: 150,
                                  ),
                                );
                              },
                            ),
                          ),
                        ),

                        // Favorite Button
                        Positioned(
                          top: 8,
                          right: 8,
                          child: GestureDetector(
                            onTap: () {
                              HapticFeedback.lightImpact();
                              widget.onRemoveFavorite();
                            },
                            child: Container(
                              padding: const EdgeInsets.all(6),
                              decoration: BoxDecoration(
                                color: Colors.white.withOpacity(0.9),
                                shape: BoxShape.circle,
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withOpacity(0.1),
                                    blurRadius: 4,
                                    offset: const Offset(0, 2),
                                  ),
                                ],
                              ),
                              child: Icon(
                                Icons.favorite,
                                color: Colors.red,
                                size: 20,
                              ),
                            ),
                          ),
                        ),

                        // Category Badge
                        Positioned(
                          top: 8,
                          left: 8,
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 4,
                            ),
                            decoration: BoxDecoration(
                              color: DertamColors.primaryDark.withOpacity(0.9),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(
                              _getCategoryName(widget.place.categoryId),
                              style: const TextStyle(
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

                  // Place Info
                  Expanded(
                    flex: 2,
                    child: Padding(
                      padding: const EdgeInsets.all(12),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            widget.place.name,
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                              height: 1.2,
                            ),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),

                          const Spacer(),
                          Row(
                            children: [
                              Icon(
                                Icons.location_on,
                                size: 12,
                                color: Colors.grey[600],
                              ),
                              const SizedBox(width: 2),
                              Expanded(
                                child: Text(
                                  widget.place.locationName,
                                  style: TextStyle(
                                    fontSize: 11,
                                    color: Colors.grey[600],
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            ],
                          ),
                          const Spacer(),
                          Row(
                            children: [
                              Icon(Icons.star, size: 14, color: Colors.amber),
                              const SizedBox(width: 2),
                              Text(
                                widget.place.ratings.toString(),
                                style: const TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              const SizedBox(width: 4),
                              Text(
                                '(${widget.place.reviewsCount})',
                                style: TextStyle(
                                  fontSize: 11,
                                  color: Colors.grey[600],
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}

// Place Details Sheet Widget
class _PlaceDetailsSheet extends StatelessWidget {
  final Place place;
  final VoidCallback onRemoveFavorite;
  final VoidCallback onViewOnMap;
  final VoidCallback onAddToTrip;

  const _PlaceDetailsSheet({
    required this.place,
    required this.onRemoveFavorite,
    required this.onViewOnMap,
    required this.onAddToTrip,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: MediaQuery.of(context).size.height * 0.8,
      child: Column(
        children: [
          // Header
          Container(
            padding: const EdgeInsets.fromLTRB(20, 10, 20, 10),
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    place.name,
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: Icon(Icons.close, color: Colors.grey[600]),
                ),
              ],
            ),
          ),

          // Content
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Image
                  Container(
                    height: 200,
                    width: double.infinity,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(12),
                      color: Colors.grey[200],
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(12),
                      child: Image.network(
                        place.imagesUrl,
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) {
                          return Container(
                            color: Colors.grey[300],
                            child: Icon(
                              Icons.image_not_supported,
                              color: Colors.grey[600],
                              size: 60,
                            ),
                          );
                        },
                      ),
                    ),
                  ),

                  const SizedBox(height: 15),

                  // Rating and Reviews
                  Row(
                    children: [
                      Icon(Icons.star, color: Colors.amber, size: 20),
                      const SizedBox(width: 4),
                      Text(
                        place.ratings.toString(),
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        '(${place.reviewsCount} reviews)',
                        style: TextStyle(fontSize: 14, color: Colors.grey[600]),
                      ),
                    ],
                  ),

                  const SizedBox(height: 10),

                  // Location
                  Row(
                    children: [
                      Icon(
                        Icons.location_on,
                        color: Colors.grey[600],
                        size: 20,
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          place.locationName,
                          style: TextStyle(
                            fontSize: 14,
                            color: Colors.grey[700],
                          ),
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 10),

                  // Entry Fee
                  if (place.entryFree && place.entryFree) ...[
                    Row(
                      children: [
                        Icon(
                          Icons.money_off,
                          color: Colors.green[600],
                          size: 20,
                        ),
                        const SizedBox(width: 8),
                        Text(
                          'Free Entry',
                          style: TextStyle(
                            fontSize: 14,
                            color: Colors.green[700],
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                  ],

                  // Operating Hours
                  if (place.operatingHours.isNotEmpty) ...[
                    Row(
                      children: [
                        Icon(
                          Icons.access_time,
                          color: Colors.grey[600],
                          size: 20,
                        ),
                        const SizedBox(width: 8),
                        Text(
                          'Open: ${place.operatingHours['open']} - ${place.operatingHours['close']}',
                          style: TextStyle(
                            fontSize: 14,
                            color: Colors.grey[700],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                  ],

                  // Description
                  Text(
                    'About',
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    place.description,
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.grey[700],
                      height: 1.5,
                    ),
                  ),

                  const SizedBox(height: 12),

                  // Action Buttons
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: () {
                            Navigator.pop(context);
                            onRemoveFavorite();
                          },
                          icon: Icon(Icons.favorite, color: Colors.red),
                          label: Text(
                            'Remove',
                            style: TextStyle(color: Colors.red),
                          ),
                          style: OutlinedButton.styleFrom(
                            side: BorderSide(color: Colors.red),
                            padding: const EdgeInsets.symmetric(vertical: 12),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: () {
                            Navigator.pop(context);
                            onAddToTrip();
                          },
                          icon: Icon(Icons.add, color: Colors.white),
                          label: Text(
                            'Add to Trip',
                            style: TextStyle(color: Colors.white),
                          ),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: DertamColors.primaryDark,
                            padding: const EdgeInsets.symmetric(vertical: 12),
                          ),
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 16),

                  Row(
                    children: [
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: () {
                            Navigator.pop(context);
                            onViewOnMap();
                          },
                          icon: Icon(Icons.map, color: Colors.white),
                          label: Text(
                            'View on Map',
                            style: TextStyle(color: Colors.white),
                          ),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: DertamColors.primaryBlue,
                            padding: const EdgeInsets.symmetric(vertical: 12),
                          ),
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 20),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
