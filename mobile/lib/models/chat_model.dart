class ChatSessionModel {
  final String id;
  final String title;
  final String moduleId;
  final DateTime createdAt;

  ChatSessionModel({
    required this.id,
    required this.title,
    required this.moduleId,
    required this.createdAt,
  });

  factory ChatSessionModel.fromJson(Map<String, dynamic> json) {
    DateTime parsedDate;
    try {
      parsedDate = DateTime.parse(json['createdAt']?.toString() ?? DateTime.now().toIso8601String());
    } catch (_) {
      parsedDate = DateTime.now();
    }
    return ChatSessionModel(
      id: json['id']?.toString() ?? json['_id']?.toString() ?? '',
      title: json['title']?.toString() ?? 'New Session',
      moduleId: json['moduleId']?.toString() ?? '',
      createdAt: parsedDate,
    );
  }
}

class ChatMessageModel {
  final String id;
  final String role; // 'user' | 'assistant'
  final String content;
  final List<QuizQuestionModel>? quiz;
  final DateTime createdAt;

  ChatMessageModel({
    required this.id,
    required this.role,
    required this.content,
    this.quiz,
    required this.createdAt,
  });

  factory ChatMessageModel.fromJson(Map<String, dynamic> json) {
    List<QuizQuestionModel>? quizList;
    if (json['quiz'] != null && json['quiz'] is List) {
      quizList = (json['quiz'] as List)
          .map((q) => QuizQuestionModel.fromJson(q))
          .toList();
    }

    DateTime parsedDate;
    try {
      parsedDate = DateTime.parse(json['createdAt']?.toString() ?? DateTime.now().toIso8601String());
    } catch (_) {
      parsedDate = DateTime.now();
    }

    return ChatMessageModel(
      id: json['id']?.toString() ?? DateTime.now().millisecondsSinceEpoch.toString(),
      role: json['role']?.toString() ?? 'user',
      content: json['content']?.toString() ?? '',
      quiz: quizList,
      createdAt: parsedDate,
    );
  }
}

class QuizQuestionModel {
  final String question;
  final List<String> options;
  final int correctIndex;
  final String explanation;
  int? selectedIndex;

  QuizQuestionModel({
    required this.question,
    required this.options,
    required this.correctIndex,
    required this.explanation,
    this.selectedIndex,
  });

  factory QuizQuestionModel.fromJson(Map<String, dynamic> json) {
    List<String> opts = [];
    if (json['options'] != null && json['options'] is List) {
      opts = (json['options'] as List).map((o) => o.toString()).toList();
    }
    return QuizQuestionModel(
      question: json['question']?.toString() ?? 'Quiz Question',
      options: opts,
      correctIndex: (json['correctIndex'] as num?)?.toInt() ?? 0,
      explanation: json['explanation']?.toString() ?? '',
    );
  }
}
