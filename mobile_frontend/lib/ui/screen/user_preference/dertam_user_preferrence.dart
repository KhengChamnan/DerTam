import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:mobile_frontend/models/question/user_preferrence.dart';
import 'package:mobile_frontend/ui/providers/auth_provider.dart';
import 'package:mobile_frontend/ui/screen/home_screen/home_page.dart';
import 'package:mobile_frontend/ui/screen/user_preference/widgets/question_input_widgets.dart';
import 'package:mobile_frontend/ui/theme/dertam_apptheme.dart';

class DertamUserPreferrence extends StatefulWidget {
  const DertamUserPreferrence({super.key});

  @override
  State<DertamUserPreferrence> createState() => _DertamUserPreferrenceState();
}

class _DertamUserPreferrenceState extends State<DertamUserPreferrence> {
  late TripPlanningState _planningState;
  final Map<String, dynamic> _answers = {};

  @override
  void initState() {
    super.initState();
    _initializeQuestions();
  }

  void _initializeQuestions() {
    // Initialize your questions here - this would typically come from an API
    final questions = [
      TripPlanningQuestion(
        id: 'trip_name',
        question: 'What would you like to name your trip?',
        type: 'text',
        placeholder: 'e.g., Summer Adventure 2025',
      ),
      TripPlanningQuestion(
        id: 'destination',
        question: 'Where do you want to go?',
        type: 'text',
        placeholder: 'Enter destination',
      ),
      TripPlanningQuestion(
        id: 'trip_type',
        question: 'What type of trip is this?',
        type: 'single',
        options: ['Adventure', 'Relaxation', 'Cultural', 'Business', 'Family'],
      ),
      TripPlanningQuestion(
        id: 'duration',
        question: 'How long will your trip be?',
        type: 'single',
        options: ['1-3 days', '4-7 days', '1-2 weeks', '2+ weeks'],
      ),
      TripPlanningQuestion(
        id: 'budget',
        question: 'What\'s your budget range?',
        type: 'single',
        options: ['Budget', 'Moderate', 'Luxury', 'Ultra Luxury'],
      ),
      TripPlanningQuestion(
        id: 'interests',
        question: 'What are your interests?',
        type: 'multiple',
        options: [
          'Food & Dining',
          'Nature & Wildlife',
          'History & Culture',
          'Adventure Sports',
          'Shopping',
          'Nightlife',
        ],
      ),
    ];

    _planningState = TripPlanningState(questions: questions);
  }

  void _handleNext() {
    final currentQuestion =
        _planningState.questions[_planningState.currentQuestionIndex];

    if (!_isQuestionAnswered(currentQuestion)) {
      _showSnackBar('Please answer this question before continuing');
      return;
    }

    if (_planningState.currentQuestionIndex <
        _planningState.questions.length - 1) {
      setState(() {
        _planningState = _planningState.copyWith(
          currentQuestionIndex: _planningState.currentQuestionIndex + 1,
        );
      });
    } else {
      _handleConfirm();
    }
  }

  void _handlePrevious() {
    if (_planningState.currentQuestionIndex > 0) {
      setState(() {
        _planningState = _planningState.copyWith(
          currentQuestionIndex: _planningState.currentQuestionIndex - 1,
        );
      });
    }
  }

  bool _isQuestionAnswered(TripPlanningQuestion question) {
    final answer = _answers[question.id];
    if (answer == null) return false;
    if (answer is String) return answer.isNotEmpty;
    if (answer is List) return answer.isNotEmpty;
    return true;
  }

  void _handleConfirm() async {
    await context.read<AuthProvider>().markPreferencesCompleted();
    if (!mounted) return;
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (context) => const HomePage()),
    );
  }

  void _showSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: DertamColors.primaryBlue,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final currentQuestion =
        _planningState.questions[_planningState.currentQuestionIndex];
    final progress =
        (_planningState.currentQuestionIndex + 1) /
        _planningState.questions.length;

    return Scaffold(
      backgroundColor: DertamColors.white,
      appBar: AppBar(
        backgroundColor: DertamColors.white,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: DertamColors.primaryBlue),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Plan Your Trip',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: DertamColors.primaryBlue,
          ),
        ),
        centerTitle: true,
      ),
      body: Column(
        children: [
          // Progress Bar
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Question ${_planningState.currentQuestionIndex + 1} of ${_planningState.questions.length}',
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.grey.shade600,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    Text(
                      '${(progress * 100).toInt()}%',
                      style: TextStyle(
                        fontSize: 14,
                        color: DertamColors.primaryBlue,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                ClipRRect(
                  borderRadius: BorderRadius.circular(10),
                  child: LinearProgressIndicator(
                    value: progress,
                    backgroundColor: Colors.grey.shade200,
                    valueColor: AlwaysStoppedAnimation<Color>(
                      DertamColors.primaryBlue,
                    ),
                    minHeight: 8,
                  ),
                ),
              ],
            ),
          ),
          // Question Content
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    currentQuestion.question,
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: DertamColors.black,
                      height: 1.3,
                    ),
                  ),
                  const SizedBox(height: 32),
                  _buildQuestionInput(currentQuestion),
                ],
              ),
            ),
          ),
          // Navigation Buttons
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: DertamColors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.05),
                  blurRadius: 10,
                  offset: const Offset(0, -5),
                ),
              ],
            ),
            child: Row(
              children: [
                if (_planningState.currentQuestionIndex > 0)
                  Expanded(
                    child: OutlinedButton(
                      onPressed: _handlePrevious,
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        side: BorderSide(color: DertamColors.primaryBlue),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: Text(
                        'Previous',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          color: DertamColors.primaryBlue,
                        ),
                      ),
                    ),
                  ),
                if (_planningState.currentQuestionIndex > 0)
                  const SizedBox(width: 16),
                Expanded(
                  flex: 2,
                  child: ElevatedButton(
                    onPressed: _handleNext,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: DertamColors.primaryBlue,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      elevation: 2,
                    ),
                    child: Text(
                      _planningState.currentQuestionIndex ==
                              _planningState.questions.length - 1
                          ? 'Confirm'
                          : 'Next',
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuestionInput(TripPlanningQuestion question) {
    switch (question.type) {
      case 'text':
        return QuestionInputWidgets.buildTextInput(
          question: question,
          onChanged: (value) {
            setState(() {
              _answers[question.id] = value;
            });
          },
        );
      case 'single':
        return QuestionInputWidgets.buildSingleChoice(
          question: question,
          selectedValue: _answers[question.id],
          onSelect: (option) {
            setState(() {
              _answers[question.id] = option;
            });
          },
        );
      case 'multiple':
        final selectedValues = (_answers[question.id] as List<String>?) ?? [];
        return QuestionInputWidgets.buildMultipleChoice(
          question: question,
          selectedValues: selectedValues,
          onToggle: (option) {
            setState(() {
              final currentList = List<String>.from(selectedValues);
              if (selectedValues.contains(option)) {
                currentList.remove(option);
              } else {
                currentList.add(option);
              }
              _answers[question.id] = currentList;
            });
          },
        );
      default:
        return const SizedBox.shrink();
    }
  }
}
