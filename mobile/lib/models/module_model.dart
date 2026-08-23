class ModuleModel {
  final String id;
  final String moduleName;
  final String moduleCode;
  final int semester;
  final int credits;
  final String grade;
  final bool isGpa;
  final int totalLectures;
  final int conductedLectures;
  final int attendedLectures;
  final List<AssignmentModel> assignments;
  final List<LabModel> labs;
  final List<DocumentModel> documents;

  ModuleModel({
    required this.id,
    required this.moduleName,
    required this.moduleCode,
    required this.semester,
    required this.credits,
    required this.grade,
    required this.isGpa,
    required this.totalLectures,
    required this.conductedLectures,
    required this.attendedLectures,
    required this.assignments,
    required this.labs,
    required this.documents,
  });

  double get attendancePercentage {
    if (conductedLectures == 0) return 100.0;
    return ((attendedLectures / conductedLectures) * 100).clamp(0.0, 100.0);
  }

  factory ModuleModel.fromJson(Map<String, dynamic> json) {
    List<AssignmentModel> assignList = [];
    if (json['assignments'] != null && json['assignments'] is List) {
      assignList = (json['assignments'] as List)
          .map((a) => AssignmentModel.fromJson(a))
          .toList();
    }

    List<LabModel> labList = [];
    if (json['labs'] != null && json['labs'] is List) {
      labList = (json['labs'] as List).map((l) => LabModel.fromJson(l)).toList();
    }

    List<DocumentModel> docList = [];
    if (json['documents'] != null && json['documents'] is List) {
      docList = (json['documents'] as List).map((d) => DocumentModel.fromJson(d)).toList();
    }

    return ModuleModel(
      id: json['id']?.toString() ?? '',
      moduleName: json['moduleName']?.toString() ?? 'Module',
      moduleCode: json['moduleCode']?.toString() ?? '',
      semester: (json['semester'] as num?)?.toInt() ?? 1,
      credits: (json['credits'] as num?)?.toInt() ?? 0,
      grade: json['grade']?.toString() ?? '',
      isGpa: json['isGpa'] ?? true,
      totalLectures: (json['totalLectures'] as num?)?.toInt() ?? 0,
      conductedLectures: (json['conductedLectures'] as num?)?.toInt() ?? 0,
      attendedLectures: (json['attendedLectures'] as num?)?.toInt() ?? 0,
      assignments: assignList,
      labs: labList,
      documents: docList,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'moduleName': moduleName,
      'moduleCode': moduleCode,
      'semester': semester,
      'credits': credits,
      'grade': grade,
      'isGpa': isGpa,
      'totalLectures': totalLectures,
      'conductedLectures': conductedLectures,
      'attendedLectures': attendedLectures,
      'assignments': assignments.map((a) => a.toJson()).toList(),
      'labs': labs.map((l) => l.toJson()).toList(),
    };
  }
}

class AssignmentModel {
  final String id;
  final String title;
  final String status; // Pending, Submitted, Graded
  final String? dueDate;
  final double? marks;

  AssignmentModel({
    required this.id,
    required this.title,
    required this.status,
    this.dueDate,
    this.marks,
  });

  factory AssignmentModel.fromJson(Map<String, dynamic> json) {
    return AssignmentModel(
      id: json['id']?.toString() ?? '',
      title: json['title']?.toString() ?? 'Assignment',
      status: json['status']?.toString() ?? 'Pending',
      dueDate: json['dueDate']?.toString(),
      marks: (json['marks'] as num?)?.toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'status': status,
      'dueDate': dueDate,
      'marks': marks,
    };
  }
}

class LabModel {
  final String id;
  final String title;
  final String status; // Pending, Conducted, Graded
  final String? dueDate;
  final double? marks;

  LabModel({
    required this.id,
    required this.title,
    required this.status,
    this.dueDate,
    this.marks,
  });

  factory LabModel.fromJson(Map<String, dynamic> json) {
    return LabModel(
      id: json['id']?.toString() ?? '',
      title: json['title']?.toString() ?? 'Lab',
      status: json['status']?.toString() ?? 'Pending',
      dueDate: json['dueDate']?.toString(),
      marks: (json['marks'] as num?)?.toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'status': status,
      'dueDate': dueDate,
      'marks': marks,
    };
  }
}

class DocumentModel {
  final String id;
  final String fileName;
  final String fileUrl;
  final DateTime createdAt;

  DocumentModel({
    required this.id,
    required this.fileName,
    required this.fileUrl,
    required this.createdAt,
  });

  factory DocumentModel.fromJson(Map<String, dynamic> json) {
    DateTime parsedDate;
    try {
      parsedDate = DateTime.parse(json['createdAt']?.toString() ?? DateTime.now().toIso8601String());
    } catch (_) {
      parsedDate = DateTime.now();
    }
    return DocumentModel(
      id: json['id']?.toString() ?? '',
      fileName: json['fileName']?.toString() ?? 'Document.pdf',
      fileUrl: json['fileUrl']?.toString() ?? '',
      createdAt: parsedDate,
    );
  }
}
