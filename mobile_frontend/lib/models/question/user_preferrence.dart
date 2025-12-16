class TripPlanningQuestion {
  final String id;
  final String question;
  final String type; // 'single', 'multiple', 'text', 'date'
  final List<String>? options;
  final bool isRequired;
  final String? placeholder;

  TripPlanningQuestion({
    required this.id,
    required this.question,
    required this.type,
    this.options,
    this.isRequired = true,
    this.placeholder,
  });

  factory TripPlanningQuestion.fromJson(Map<String, dynamic> json) {
    return TripPlanningQuestion(
      id: json['id'] as String,
      question: json['question'] as String,
      type: json['type'] as String,
      options: json['options'] != null 
          ? List<String>.from(json['options']) 
          : null,
      isRequired: json['isRequired'] ?? true,
      placeholder: json['placeholder'],
    );
  }
}

class TripPlanningAnswer {
  final String questionId;
  final dynamic answer; // Can be String, List<String>, DateTime, etc.

  TripPlanningAnswer({
    required this.questionId,
    required this.answer,
  });

  Map<String, dynamic> toJson() {
    return {
      'questionId': questionId,
      'answer': answer,
    };
  }
}

class TripPlanningState {
  final List<TripPlanningQuestion> questions;
  final Map<String, dynamic> answers;
  final int currentQuestionIndex;
  final bool isComplete;

  TripPlanningState({
    required this.questions,
    this.answers = const {},
    this.currentQuestionIndex = 0,
    this.isComplete = false,
  });

  TripPlanningState copyWith({
    List<TripPlanningQuestion>? questions,
    Map<String, dynamic>? answers,
    int? currentQuestionIndex,
    bool? isComplete,
  }) {
    return TripPlanningState(
      questions: questions ?? this.questions,
      answers: answers ?? this.answers,
      currentQuestionIndex: currentQuestionIndex ?? this.currentQuestionIndex,
      isComplete: isComplete ?? this.isComplete,
    );
  }

  bool get canGoNext => 
      currentQuestionIndex < questions.length - 1 &&
      _isCurrentQuestionAnswered();

  bool get canGoPrevious => currentQuestionIndex > 0;

  bool _isCurrentQuestionAnswered() {
    final currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion.isRequired) return true;
    
    final answer = answers[currentQuestion.id];
    if (answer == null) return false;
    
    if (answer is String) return answer.isNotEmpty;
    if (answer is List) return answer.isNotEmpty;
    return true;
  }

  double get progress => 
      questions.isEmpty ? 0 : (currentQuestionIndex + 1) / questions.length;
}

class TripPlanningRequest {
  final String userId;
  final Map<String, dynamic> answers;

  TripPlanningRequest({
    required this.userId,
    required this.answers,
  });

  Map<String, dynamic> toJson() {
    return {
      'userId': userId,
      'answers': answers,
    };
  }
}