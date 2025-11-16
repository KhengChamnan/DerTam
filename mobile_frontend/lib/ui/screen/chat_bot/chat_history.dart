import 'package:flutter/material.dart';
import 'package:iconsax/iconsax.dart';
import 'package:mobile_frontend/ui/theme/dertam_apptheme.dart';
import 'chat_bot.dart';

class ChatHistoryScreen extends StatelessWidget {
  const ChatHistoryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: DertamColors.white,
      appBar: AppBar(
        backgroundColor: DertamColors.white,
        elevation: 0,
        title: Text(
          'AI assistant',
          style: DertamTextStyles.title.copyWith(
            color: DertamColors.primaryDark,
            fontWeight: FontWeight.bold,
          ),
        ),
        leading: IconButton(
          icon: Icon(Icons.close, color: DertamColors.primaryDark),
          onPressed: () => Navigator.pop(context),
        ),
       
      ),
      body: Column(
        children: [
          // New Chat Button
          Padding(
            padding: const EdgeInsets.all(DertamSpacings.m),
            child: OutlinedButton(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => const ChatBotScreen(),
                  ),
                );
              },
              style: OutlinedButton.styleFrom(
                minimumSize: const Size(double.infinity, 50),
                side: BorderSide(color: DertamColors.primaryDark),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(DertamSpacings.radius),
                ),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.add, color: DertamColors.primaryDark),
                  const SizedBox(width: 8),
                  Text(
                    'New Chat',
                    style: DertamTextStyles.body.copyWith(
                      color: DertamColors.primaryDark,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Chat History List
          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(horizontal: DertamSpacings.m),
              children: [
                // Today Section
                Text(
                  'Today',
                  style: DertamTextStyles.bodyMedium.copyWith(
                    color: Colors.grey[600],
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: DertamSpacings.s),
                _buildChatHistoryItem(
                  context,
                  'Best places to visit in Siem Reap',
                ),
                _buildChatHistoryItem(
                  context,
                  'Best places to visit in Siem Reap',
                ),
                const SizedBox(height: DertamSpacings.m),

                // Yesterday Section
                Text(
                  'Yesterday',
                  style: DertamTextStyles.bodyMedium.copyWith(
                    color: Colors.grey[600],
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: DertamSpacings.s),
                _buildChatHistoryItem(
                  context,
                  'Best places to visit in Siem Reap',
                ),
                const SizedBox(height: DertamSpacings.s),

                // See More Button
                TextButton(
                  onPressed: () {},
                  style: TextButton.styleFrom(
                    alignment: Alignment.centerLeft,
                    padding: EdgeInsets.all(12),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        Icons.keyboard_arrow_down,
                        size: 20,
                        color: DertamColors.primaryDark,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        'see more',
                        style: DertamTextStyles.body.copyWith(
                          color: DertamColors.primaryDark,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildChatHistoryItem(BuildContext context, String title) {
    return ListTile(
      contentPadding: const EdgeInsets.symmetric(
        horizontal: DertamSpacings.s,
        vertical: 4,
      ),
      leading: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: DertamColors.primaryDark.withOpacity(0.1),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Icon(
          Iconsax.message_text,
          size: 20,
          color: DertamColors.primaryDark,
        ),
      ),
      title: Text(
        title,
        style: DertamTextStyles.body.copyWith(
          color: DertamColors.primaryDark,
        ),
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
      ),
      trailing: PopupMenuButton<String>(
        icon: Icon(
          Icons.more_horiz,
          color: DertamColors.primaryDark,
        ),
        onSelected: (value) {
          switch (value) {
            case 'rename':
              _showRenameDialog(context, title);
              break;
            case 'delete':
              _showDeleteDialog(context, title);
              break;
          }
        },
        itemBuilder: (BuildContext context) => [
          PopupMenuItem<String>(
            value: 'rename',
            child: Row(
              children: [
                Icon(Icons.edit, size: 20, color: DertamColors.primaryDark),
                const SizedBox(width: 8),
                Text(
                  'Rename',
                  style: DertamTextStyles.body.copyWith(
                    color: DertamColors.primaryDark,
                  ),
                ),
              ],
            ),
          ),
          PopupMenuItem<String>(
            value: 'delete',
            child: Row(
              children: [
                Icon(Icons.delete, size: 20, color: Colors.red),
                const SizedBox(width: 8),
                Text(
                  'Delete',
                  style: DertamTextStyles.body.copyWith(
                    color: Colors.red,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => const ChatBotScreen(
              initialMessages: [
                {'role': 'user', 'text': 'Best places to visit in Siem Reap'},
              ],
            ),
          ),
        );
      },
    );
  }

  // Add these helper methods at the end of the class
  void _showRenameDialog(BuildContext context, String oldTitle) {
    final TextEditingController controller = TextEditingController(text: oldTitle);

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(
          'Rename Chat',
          style: DertamTextStyles.title.copyWith(
            color: DertamColors.primaryDark,
          ),
        ),
        content: TextField(
          controller: controller,
          decoration: InputDecoration(
            hintText: 'Enter new name',
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(DertamSpacings.radius),
            ),
          ),
          autofocus: true,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(
              'Cancel',
              style: DertamTextStyles.body.copyWith(
                color: Colors.grey[600],
              ),
            ),
          ),
          ElevatedButton(
            onPressed: () {
              // TODO: Implement rename logic
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('Renamed to: ${controller.text}'),
                  backgroundColor: DertamColors.primaryDark,
                ),
              );
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: DertamColors.primaryDark,
            ),
            child: Text('Rename', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  void _showDeleteDialog(BuildContext context, String title) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(
          'Delete Chat',
          style: DertamTextStyles.title.copyWith(
            color: DertamColors.primaryDark,
          ),
        ),
        content: Text(
          'Are you sure you want to delete this chat? This action cannot be undone.',
          style: DertamTextStyles.body.copyWith(
            color: Colors.grey[700],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(
              'Cancel',
              style: DertamTextStyles.body.copyWith(
                color: Colors.grey[600],
              ),
            ),
          ),
          ElevatedButton(
            onPressed: () {
              // TODO: Implement delete logic
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('Chat deleted'),
                  backgroundColor: Colors.red,
                ),
              );
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
            ),
            child: Text('Delete', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }
}