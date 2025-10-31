import 'package:flutter/material.dart';
import 'package:mobile_frontend/ui/theme/dertam_apptheme.dart';

class DertamSettingItem extends StatelessWidget {
  final IconData icon;
  final String title;
  final VoidCallback onTap;

  const DertamSettingItem({
    super.key,
    required this.icon,
    required this.title,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Icon(icon, color: DertamColors.primaryBlue),
      title: Text(title, style: TextStyle(color: DertamColors.black)),
      trailing: const Icon(Icons.chevron_right),
      onTap: onTap,
    );
  }
}
