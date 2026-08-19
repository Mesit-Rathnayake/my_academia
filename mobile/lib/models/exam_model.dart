class ExamSeries {
  final String id;
  final String title;
  final List<ExamPaper> exams;

  ExamSeries({
    required this.id,
    required this.title,
    required this.exams,
  });

  factory ExamSeries.fromJson(Map<String, dynamic> json) {
    List<ExamPaper> examList = [];
    if (json['exams'] != null && json['exams'] is List) {
      examList = (json['exams'] as List)
          .map((e) => ExamPaper.fromJson(e))
          .toList();
    }

    return ExamSeries(
      id: json['id']?.toString() ?? '',
      title: json['title']?.toString() ?? 'Examination Series',
      exams: examList,
    );
  }
}

class ExamPaper {
  final String id;
  final String title;
  final String subject;
  final DateTime dateTime;
  final String location;

  ExamPaper({
    required this.id,
    required this.title,
    required this.subject,
    required this.dateTime,
    required this.location,
  });

  factory ExamPaper.fromJson(Map<String, dynamic> json) {
    DateTime parsedDate;
    try {
      parsedDate = DateTime.parse(json['dateTime']?.toString() ?? DateTime.now().toIso8601String());
    } catch (_) {
      parsedDate = DateTime.now();
    }

    return ExamPaper(
      id: json['id']?.toString() ?? '',
      title: json['title']?.toString() ?? 'Exam',
      subject: json['subject']?.toString() ?? json['title']?.toString() ?? 'Exam',
      dateTime: parsedDate,
      location: json['location']?.toString() ?? '',
    );
  }
}
