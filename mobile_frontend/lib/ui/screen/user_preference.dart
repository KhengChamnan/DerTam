import 'package:flutter/material.dart';
import 'package:mobile_frontend/data/repo/laravel/laravel_preference_api_repository.dart';
import 'package:mobile_frontend/ui/providers/user_preference_provider.dart';
import 'package:mobile_frontend/ui/widgets/actions/dertam_button.dart';
import 'package:provider/provider.dart';

class UserPreferenceScreen extends StatefulWidget {
  const UserPreferenceScreen({Key? key}) : super(key: key);

  @override
  State<UserPreferenceScreen> createState() => _UserPreferenceScreenState();
}

class _UserPreferenceScreenState extends State<UserPreferenceScreen> {
  final PageController _pageController = PageController();
  final int _pageCount = 5; // 4 questions + review
  late final List<ScrollController> _scrollControllers;
  int _pageIndex = 0;

  final List<List<String>> _options = [
    [
      'Beach',
      'Mountains',
      'Historical Sites',
      'Nature & Wildlife',
      'Shopping Malls',
      'City Exploration',
      'Local Villages',
    ],
    [
      'Adventure (Hiking, Rafting, Ziplining)',
      'Relaxation (Spas, Resorts, Beaches)',
      'Cultural Experiences (Temples, Museums, Traditional Events)',
      'Nightlife (Bars, Clubs, Concerts)',
      'Food & Dining (Street Food, Fine Dining, Cafés)',
      'Sightseeing (Famous Landmarks, Scenic View)',
    ],
    ['Below \$30', '\$30 - \$70', '\$70 - \$120', 'Above \$120'],
    ['Photography', 'Hiking', 'Diving', 'Shopping', 'History & Culture', 'Art'],
  ];

  final List<String> _questions = [
    'What type of places do you enjoy visiting?',
    'What activities do you prefer?',
    'Select your budget for Accommodation',
    'Do you have any special interests? (Select all that apply)',
    'Review & Submit',
  ];

  // Per-question maximum selection counts. Use <=0 or missing => unlimited
  final List<int> _maxSelections = [3, 3, 1, 0];

  @override
  void initState() {
    super.initState();
    _scrollControllers = List.generate(_pageCount, (_) => ScrollController());
    _pageController.addListener(() {
      final p = (_pageController.page ?? 0).round();
      if (p != _pageIndex) setState(() => _pageIndex = p);
    });
  }

  @override
  void dispose() {
    for (final c in _scrollControllers) {
      c.dispose();
    }
    _pageController.dispose();
    super.dispose();
  }

  Widget _optionTile(
    BuildContext context,
    int page,
    int idx,
    String text,
    double scale,
  ) {
    final provider = Provider.of<UserPreferenceProvider>(context);
    // guard if provider doesn't have expected data yet
    if (provider.selected.length <= page) return const SizedBox.shrink();
    final selected = provider.selected[page].contains(idx);
    final max = (_maxSelections.length > page && _maxSelections[page] > 0)
        ? _maxSelections[page]
        : 9999;
    final singleChoice = (max == 1);

    return Padding(
      padding: EdgeInsets.symmetric(vertical: 8.0 * scale),
      child: Material(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12.0),
        elevation: selected ? 4 : 0,
        child: InkWell(
          borderRadius: BorderRadius.circular(12.0),
          onTap: () {
            final changed = provider.toggle(page, idx, max: max);
            if (!changed) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(
                    'You can select up to ${_maxSelections[page]} items.',
                  ),
                  duration: const Duration(seconds: 2),
                ),
              );
            }
          },
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 180),
            padding: EdgeInsets.symmetric(
              horizontal: 14.0 * scale,
              vertical: 14.0 * scale,
            ),
            decoration: BoxDecoration(
              color: selected ? const Color(0xFFEDF4FF) : Colors.white,
              border: Border.all(
                color: selected
                    ? const Color(0xFF1E2A78)
                    : const Color(0xFFDDDDDD),
                width: selected ? 2.2 : 1.2,
              ),
              borderRadius: BorderRadius.circular(12.0),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    text,
                    style: TextStyle(
                      fontSize: 14.0 * scale,
                      fontWeight: FontWeight.w600,
                      color: Colors.black87,
                    ),
                  ),
                ),
                // Render radio indicator for single-choice questions, checkbox style for multi-choice
                if (singleChoice)
                  Container(
                    width: 28 * scale,
                    height: 28 * scale,
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                      color: selected
                          ? const Color(0xFF1E2A78)
                          : Colors.transparent,
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: selected
                            ? const Color(0xFF1E2A78)
                            : const Color(0xFFCCCCCC),
                      ),
                    ),
                    child: selected
                        ? Icon(
                            Icons.radio_button_checked,
                            color: Colors.white,
                            size: 18 * scale,
                          )
                        : Icon(
                            Icons.radio_button_unchecked,
                            color: const Color(0xFF666666),
                            size: 18 * scale,
                          ),
                  )
                else
                  Container(
                    width: 28 * scale,
                    height: 28 * scale,
                    decoration: BoxDecoration(
                      color: selected
                          ? const Color(0xFF1E2A78)
                          : Colors.transparent,
                      border: Border.all(
                        color: selected
                            ? const Color(0xFF1E2A78)
                            : const Color(0xFFCCCCCC),
                      ),
                      borderRadius: BorderRadius.circular(14 * scale),
                    ),
                    child: selected
                        ? Icon(
                            Icons.check,
                            color: Colors.white,
                            size: 18 * scale,
                          )
                        : null,
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Future<void> _submitPreferences(BuildContext context) async {
    final provider = Provider.of<UserPreferenceProvider>(
      context,
      listen: false,
    );
    // build payload
    final payload = <String, dynamic>{
      'places': provider.selected.isNotEmpty && provider.selected.length > 0
          ? provider.selected[0].map((i) => _options[0][i]).toList()
          : <String>[],
      'activities': provider.selected.isNotEmpty && provider.selected.length > 1
          ? provider.selected[1].map((i) => _options[1][i]).toList()
          : <String>[],
      'budget':
          provider.selected.isNotEmpty &&
              provider.selected.length > 2 &&
              provider.selected[2].isNotEmpty
          ? _options[2][provider.selected[2].first]
          : null,
      'interests': provider.selected.isNotEmpty && provider.selected.length > 3
          ? provider.selected[3].map((i) => _options[3][i]).toList()
          : <String>[],
    };

    showDialog<void>(
      context: context,
      barrierDismissible: false,
      builder: (_) => const Center(child: CircularProgressIndicator()),
    );

    try {
      final repo = LaravelPreferenceApiRepository();
      final res = await repo.submitPreferences(payload);
      Navigator.of(context).pop(); // close progress

      // show result
      showDialog<void>(
        context: context,
        builder: (_) => AlertDialog(
          title: const Text('Preferences submitted'),
          content: Text(res.toString()),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('OK'),
            ),
          ],
        ),
      );
    } catch (e) {
      Navigator.of(context).pop(); // close progress
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Submission failed: $e')));
    }
  }

  // Navigation via swipe; per-page Next button removed.

  @override
  Widget build(BuildContext context) {
    final mq = MediaQuery.of(context);
    final scale = (mq.size.width / 390).clamp(0.8, 1.2);

    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
        title: ConstrainedBox(
          constraints: const BoxConstraints(maxHeight: 300, maxWidth: 250),
          child: Image.asset(
            'assets/images/Blue_Colorful_Illustrative_Travel_Animated_Presentation_Photoroom.png',
            fit: BoxFit.contain,
          ),
        ),
      ),
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: EdgeInsets.symmetric(
                horizontal: 16.0 * scale,
                vertical: 12.0 * scale,
              ),
              child: Row(
                children: [
                  if (_pageIndex > 0)
                    IconButton(
                      icon: Icon(
                        Icons.arrow_back,
                        color: Colors.black87,
                        size: 22 * scale,
                      ),
                      onPressed: () => _pageController.previousPage(
                        duration: const Duration(milliseconds: 250),
                        curve: Curves.easeOut,
                      ),
                    )
                  else
                    SizedBox(width: 44 * scale),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        Text(
                          'Question ${_pageIndex + 1} of $_pageCount',
                          style: TextStyle(
                            fontWeight: FontWeight.w600,
                            fontSize: 13 * scale,
                            color: Colors.black54,
                          ),
                        ),
                        SizedBox(height: 6 * scale),
                        ClipRRect(
                          borderRadius: BorderRadius.circular(8 * scale),
                          child: LinearProgressIndicator(
                            value: _pageIndex / (_pageCount - 1),
                            backgroundColor: const Color(0xFFF0F0F5),
                            valueColor: const AlwaysStoppedAnimation(
                              Color(0xFF1E2A78),
                            ),
                            minHeight: 6 * scale,
                          ),
                        ),
                      ],
                    ),
                  ),
                  SizedBox(width: 44 * scale),
                ],
              ),
            ),
            const Divider(height: 1),
            Expanded(
              child: PageView.builder(
                controller: _pageController,
                itemCount: _pageCount,
                itemBuilder: (context, page) {
                  // review page
                  if (page == _pageCount - 1) {
                    return Scrollbar(
                      controller: _scrollControllers[page],
                      child: SingleChildScrollView(
                        controller: _scrollControllers[page],
                        padding: EdgeInsets.symmetric(
                          horizontal: 20 * scale,
                          vertical: 18 * scale,
                        ),
                        child: Consumer<UserPreferenceProvider>(
                          builder: (context, provider, _) {
                            final children = <Widget>[];
                            children.add(
                              Text(
                                _questions[page],
                                textAlign: TextAlign.center,
                                style: TextStyle(
                                  fontSize: 18 * scale,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            );
                            children.add(SizedBox(height: 12 * scale));

                            for (var q = 0; q < _options.length; q++) {
                              children.add(
                                Text(
                                  'Question ${q + 1}:',
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 14 * scale,
                                  ),
                                ),
                              );
                              children.add(SizedBox(height: 8 * scale));
                              final sel = (provider.selected.length > q)
                                  ? provider.selected[q]
                                  : <int>{};
                              if (sel.isEmpty) {
                                children.add(
                                  Text(
                                    'No selection',
                                    style: TextStyle(color: Colors.black54),
                                  ),
                                );
                              } else {
                                children.add(
                                  Wrap(
                                    spacing: 8,
                                    runSpacing: 8,
                                    children: sel
                                        .map(
                                          (i) =>
                                              Chip(label: Text(_options[q][i])),
                                        )
                                        .toList(),
                                  ),
                                );
                              }
                              children.add(SizedBox(height: 16 * scale));
                            }

                            children.add(
                              Consumer<UserPreferenceProvider>(
                                builder: (context, provider, _) {
                                  final allAnswered = List<bool>.generate(
                                    _options.length,
                                    (i) =>
                                        provider.selected.length > i &&
                                        provider.selected[i].isNotEmpty,
                                  ).every((v) => v);

                                  return Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.stretch,
                                    children: [
                                      if (!allAnswered)
                                        Padding(
                                          padding: EdgeInsets.only(
                                            bottom: 10.0 * scale,
                                          ),
                                          child: Text(
                                            'Please answer all questions before submitting.',
                                            textAlign: TextAlign.center,
                                            style: TextStyle(
                                              color: Colors.redAccent,
                                              fontSize: 13 * scale,
                                            ),
                                          ),
                                        ),
                                      Padding(
                                        padding: EdgeInsets.symmetric(
                                          horizontal: 12.0 * scale,
                                        ),
                                        child: Opacity(
                                          opacity: allAnswered ? 1.0 : 0.6,
                                          child: AbsorbPointer(
                                            absorbing: !allAnswered,
                                            child: DertamButtonGradient(
                                              text: 'Submit',
                                              onPressed: () =>
                                                  _submitPreferences(context),
                                              height: 48.0 * scale,
                                            ),
                                          ),
                                        ),
                                      ),
                                    ],
                                  );
                                },
                              ),
                            );

                            return Column(
                              crossAxisAlignment: CrossAxisAlignment.stretch,
                              children: children,
                            );
                          },
                        ),
                      ),
                    );
                  }

                  // normal question pages
                  final opts = _options[page];
                  final hintMax =
                      (_maxSelections.length > page && _maxSelections[page] > 0)
                      ? _maxSelections[page]
                      : null;

                  return Scrollbar(
                    controller: _scrollControllers[page],
                    child: SingleChildScrollView(
                      controller: _scrollControllers[page],
                      padding: EdgeInsets.symmetric(
                        horizontal: 20 * scale,
                        vertical: 18 * scale,
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          Text(
                            _questions[page],
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              fontSize: 18 * scale,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          if (hintMax != null) ...[
                            SizedBox(height: 8 * scale),
                            Center(
                              child: Text(
                                '(Select up to $hintMax)',
                                style: TextStyle(
                                  color: Colors.black54,
                                  fontSize: 12 * scale,
                                ),
                              ),
                            ),
                          ],
                          SizedBox(height: 12 * scale),
                          ...List<Widget>.generate(
                            opts.length,
                            (idx) => _optionTile(
                              context,
                              page,
                              idx,
                              opts[idx],
                              scale,
                            ),
                          ),
                          SizedBox(height: 18 * scale),
                          // Next button removed: users navigate between pages via swipe.
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
