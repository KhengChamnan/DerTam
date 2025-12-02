import 'package:flutter/material.dart';
import 'package:mobile_frontend/models/restaurant/food_menu.dart';
import 'package:mobile_frontend/ui/theme/dertam_apptheme.dart';


class ListFoodMenu extends StatelessWidget {
  final MenuItem menuItem;
  const ListFoodMenu({super.key, required this.menuItem});
  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(DertamSpacings.radius),
          boxShadow: [
            BoxShadow(
              color: Colors.grey.withOpacity(0.1),
              spreadRadius: 0,
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Menu item image
            Expanded(
              child: ClipRRect(
                borderRadius: const BorderRadius.vertical(
                  top: Radius.circular(DertamSpacings.radius),
                ),
                child: Stack(
                  children: [
                    Image.network(
                      menuItem.imageUrl,
                      width: double.infinity,
                      height: double.infinity,
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) {
                        return Container(
                          color: Colors.grey[300],
                          child: Icon(
                            Icons.restaurant,
                            size: 40,
                            color: Colors.grey[500],
                          ),
                        );
                      },
                    ),
                    // Price badge
                    Positioned(
                      bottom: 8,
                      right: 8,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: DertamColors.primaryDark,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          '\$${menuItem.price}',
                          style: DertamTextStyles.bodySmall.copyWith(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            // Menu item info
            Padding(
              padding: const EdgeInsets.all(DertamSpacings.s),
              child: Text(
                menuItem.name,
                style: DertamTextStyles.bodyMedium.copyWith(
                  fontWeight: FontWeight.w600,
                  color: DertamColors.primaryDark,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
