import 'package:flutter/material.dart';
import 'package:mobile_frontend/ui/theme/dertam_apptheme.dart';
import 'package:mobile_frontend/ui/screen/chat_bot/chat_history.dart';

class ChatBotScreen extends StatefulWidget {
  final List<Map<String, String>>? initialMessages;

  const ChatBotScreen({super.key, this.initialMessages});

  @override
  State<ChatBotScreen> createState() => _ChatBotScreenState();
}

class _ChatBotScreenState extends State<ChatBotScreen> {
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final List<Map<String, String>> _messages = [];

  @override
  void initState() {
    super.initState();
    if (widget.initialMessages != null) {
      _messages.addAll(widget.initialMessages!);
      // Add bot response
      _messages.add({
        'role': 'bot',
        'text':
            'I will details for you step by step, Phnom Penh is a capital city of Cambodia, which have many famous places for tourist.',
      });
      _messages.add({'role': 'bot', 'text': 'Do you have any questions?'});
    }
  }

  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _sendMessage() {
    if (_messageController.text.trim().isEmpty) return;

    setState(() {
      _messages.add({'role': 'user', 'text': _messageController.text.trim()});
    });

    _messageController.clear();

    // Simulate bot response
    Future.delayed(const Duration(milliseconds: 500), () {
      setState(() {
        _messages.add({
          'role': 'bot',
          'text':
              'Here\'s a suggested Day 1 itinerary for your trip to Siem Reap, Cambodia, focusing on the must-see attractions and experiences in the area:\n\nDay 1: Angkor Wat and Surroundings\n\nMorning:\nAngkor Wat: Start your day early to catch the sunrise at this iconic temple. Explore the intricate carvings and vast grounds.\n\nBreakfast: Enjoy a local breakfast at a nearby café or at your hotel.\n\nAngkor Thom: Visit the ancient city of Angkor Thom, including the Bayon Temple with its famous smiling faces.\n\nAfternoon:\nTa Prohm: Explore the jungle-clad ruins of Ta Prohm, made famous by the Tomb Raider movie.',
        });
      });

      // Scroll to bottom
      Future.delayed(const Duration(milliseconds: 100), () {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: DertamColors.backgroundWhite,
      appBar: AppBar(
        backgroundColor: DertamColors.white,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: DertamColors.primaryDark),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'AI assistant',
          style: DertamTextStyles.title.copyWith(
            color: DertamColors.primaryDark,
            fontWeight: FontWeight.bold,
          ),
        ),
        actions: [
          IconButton(
            icon: Icon(Icons.more_vert, color: DertamColors.primaryDark),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const ChatHistoryScreen(),
                ),
              );
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Messages List
          Expanded(
            child: _messages.isEmpty
            //show welcome message when no messages
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Image.asset(
                          'assets/images/bot.png',
                          width: 120,
                          height: 120,
                        ),
                        const SizedBox(height: DertamSpacings.m),
                        Text(
                          'Hello',
                          style: DertamTextStyles.title.copyWith(
                            fontSize: 32,
                            fontWeight: FontWeight.bold,
                            color: DertamColors.primaryDark,
                          ),
                        ),
                        const SizedBox(height: DertamSpacings.s),
                        Text(
                          'How can I help you plan your trip  today?',
                          style: DertamTextStyles.body.copyWith(
                            color: Colors.grey[600],
                          ),
                        ),
                      ],
                    ),
                  )
                  
                  // Messages ListView
                : ListView.builder(
                    controller: _scrollController,
                    padding: const EdgeInsets.all(DertamSpacings.m),
                    itemCount: _messages.length,
                    itemBuilder: (context, index) {
                      final message = _messages[index];
                      final isUser = message['role'] == 'user';

                      return Align(
                        alignment: isUser
                            ? Alignment.centerRight
                            : Alignment.centerLeft,
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Bot icon outside container (left side)
                            if (!isUser) ...[
                              Image.asset(
                                'assets/images/bot_icon.png',
                                width: 40,
                                height: 40,
                              ),
                              const SizedBox(width: 8),
                            ],
                            // Message container
                            Container(
                              margin: const EdgeInsets.only(
                                bottom: DertamSpacings.s,
                              ),
                              padding: const EdgeInsets.all(DertamSpacings.m),
                              constraints: BoxConstraints(
                                maxWidth:
                                    MediaQuery.of(context).size.width * 0.75,
                              ),
                              decoration: BoxDecoration(
                                color: isUser
                                    ? DertamColors.primaryDark
                                    : Colors.grey[200],
                                borderRadius: BorderRadius.circular(
                                  DertamSpacings.radius,
                                ),
                              ),
                              child: Text(
                                message['text']!,
                                style: DertamTextStyles.body.copyWith(
                                  color: isUser
                                      ? Colors.white
                                      : DertamColors.primaryDark,
                                  height: 1.5,
                                ),
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
          ),

          // Quick Suggestions (if no messages)
          if (_messages.isEmpty)
            Container(
              height: 50,
              margin: const EdgeInsets.only(bottom: DertamSpacings.m),
              child: ListView(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(
                  horizontal: DertamSpacings.m,
                ),
                children: [
                  _buildSuggestionChip('Ask about my trip'),
                  const SizedBox(width: 8),
                  _buildSuggestionChip('Where should I go my 3 days trip'),
                  const SizedBox(width: 8),
                  _buildSuggestionChip('Best places to visit'),
                  const SizedBox(width: 8),
                  _buildSuggestionChip('Plan my itinerary'),
                ],
              ),
            ),

          // Input Field
          Container(
            padding: const EdgeInsets.all(DertamSpacings.m),
            decoration: BoxDecoration(
              color: DertamColors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.grey.withOpacity(0.1),
                  spreadRadius: 1,
                  blurRadius: 5,
                  offset: const Offset(0, -2),
                ),
              ],
            ),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _messageController,
                    decoration: InputDecoration(
                      hintText: 'Ask me anything ...',
                      hintStyle: DertamTextStyles.body.copyWith(
                        color: Colors.grey[400],
                      ),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(
                          DertamSpacings.radius,
                        ),
                        borderSide: BorderSide(color: Colors.grey[300]!),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(
                          DertamSpacings.radius,
                        ),
                        borderSide: BorderSide(color: Colors.grey[300]!),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(
                          DertamSpacings.radius,
                        ),
                        borderSide: BorderSide(color: DertamColors.primaryDark),
                      ),
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: DertamSpacings.m,
                        vertical: DertamSpacings.s,
                      ),
                    ),
                    maxLines: null,
                    textInputAction: TextInputAction.send,
                    onSubmitted: (_) => _sendMessage(),
                  ),
                ),
                const SizedBox(width: 8),
                Container(
                  decoration: BoxDecoration(
                    color: DertamColors.primaryDark,
                    borderRadius: BorderRadius.circular(DertamSpacings.radius),
                  ),
                  child: IconButton(
                    icon: const Icon(Icons.send, color: Colors.white),
                    onPressed: _sendMessage,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSuggestionChip(String label) {
    return InkWell(
      onTap: () {
        _messageController.text = label;
        _sendMessage();
      },
      child: Container(
        padding: const EdgeInsets.symmetric(
          horizontal: DertamSpacings.m,
          vertical: DertamSpacings.s,
        ),
        decoration: BoxDecoration(
          border: Border.all(color: DertamColors.primaryDark),
          borderRadius: BorderRadius.circular(DertamSpacings.radius),
        ),
        child: Text(
          label,
          style: DertamTextStyles.body.copyWith(
            color: DertamColors.primaryDark,
          ),
        ),
      ),
    );
  }
}
