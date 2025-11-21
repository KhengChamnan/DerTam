import 'package:flutter/material.dart';
import 'package:mobile_frontend/ui/theme/dertam_apptheme.dart';
import 'package:mobile_frontend/models/place/place.dart';

class TripPlaceCard extends StatelessWidget {
  final Place place;
  final VoidCallback? onDelete;
  final VoidCallback? onTap;
  final bool enableSwipeToDelete;

  const TripPlaceCard({
    super.key,
    required this.place,
    this.onDelete,
    this.onTap,
    this.enableSwipeToDelete = true,
  });

  @override
  Widget build(BuildContext context) {
    Widget cardContent = Container(
      margin: EdgeInsets.only(bottom: DertamSpacings.m),
      height: 100, // Fixed height for consistency
      decoration: BoxDecoration(
        color: DertamColors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.08),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(12),
          child: Padding(
            padding: EdgeInsets.all(DertamSpacings.m),
            child: Row(
              children: [
                // Place image - fixed size
                ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: Container(
                    width: 80,
                    height: 80,
                    decoration: BoxDecoration(color: Colors.grey[200]),
                    child: place.imagesUrl.isNotEmpty
                        ? Image.network(
                            place.imagesUrl,
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) {
                              return _buildPlaceholderImage();
                            },
                          )
                        : _buildPlaceholderImage(),
                  ),
                ),

                SizedBox(width: DertamSpacings.m),

                // Place details - takes remaining space
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment:
                        MainAxisAlignment.center, // Center vertically
                    children: [
                      Text(
                        place.name,
                        style: DertamTextStyles.subtitle.copyWith(
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      SizedBox(height: 4),
                      Text(
                        place.description,
                        style: DertamTextStyles.bodySmall.copyWith(
                          color: Colors.grey[600],
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );

    // Wrap with Dismissible if swipe-to-delete is enabled and onDelete is provided
    if (enableSwipeToDelete && onDelete != null) {
      return Dismissible(
        key: Key(place.placeId),
        direction: DismissDirection.endToStart,
        background: Container(
          margin: EdgeInsets.only(bottom: DertamSpacings.m),
          height: 100, // Same height as card
          decoration: BoxDecoration(
            color: DertamColors.red,
            borderRadius: BorderRadius.circular(12),
          ),
          alignment: Alignment.centerRight,
          padding: EdgeInsets.only(right: 20),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              Icon(Icons.delete, color: Colors.white, size: 24),
              SizedBox(width: 8),
              Text(
                'Delete',
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                ),
              ),
            ],
          ),
        ),
        confirmDismiss: (direction) async {
          return await showDialog<bool>(
                context: context,
                builder: (context) => AlertDialog(
                  title: Text('Delete Place'),
                  content: Text(
                    'Are you sure you want to remove "${place.name}" from your trip?',
                  ),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.of(context).pop(false),
                      child: Text('Cancel'),
                    ),
                    TextButton(
                      onPressed: () => Navigator.of(context).pop(true),
                      style: TextButton.styleFrom(foregroundColor: Colors.red),
                      child: Text('Delete'),
                    ),
                  ],
                ),
              ) ??
              false;
        },
        onDismissed: (direction) {
          onDelete!();
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('${place.name} removed from trip'),
              backgroundColor: Colors.red,
              duration: Duration(seconds: 2),
            ),
          );
        },
        child: cardContent,
      );
    }

    return cardContent;
  }

  Widget _buildPlaceholderImage() {
    return Container(
      color: Colors.grey[300],
      child: Center(
        child: Icon(Icons.place, color: Colors.grey[600], size: 32),
      ),
    );
  }
}
