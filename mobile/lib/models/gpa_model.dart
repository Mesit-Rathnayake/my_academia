class GpaPerformance {
  final double ogpa;
  final String classification;
  final int totalCredits;
  final int totalGpaCredits;
  final double totalWeightedPoints;
  final Map<String, SemesterGpa> semesters;
  final List<ModuleResult> modules;

  GpaPerformance({
    required this.ogpa,
    required this.classification,
    required this.totalCredits,
    required this.totalGpaCredits,
    required this.totalWeightedPoints,
    required this.semesters,
    required this.modules,
  });

  factory GpaPerformance.fromJson(Map<String, dynamic> json) {
    Map<String, SemesterGpa> semMap = {};
    if (json['semesters'] != null && json['semesters'] is Map) {
      json['semesters'].forEach((key, val) {
        semMap[key.toString()] = SemesterGpa.fromJson(val);
      });
    }

    List<ModuleResult> modResults = [];
    if (json['modules'] != null && json['modules'] is List) {
      modResults = (json['modules'] as List)
          .map((m) => ModuleResult.fromJson(m))
          .toList();
    }

    return GpaPerformance(
      ogpa: (json['ogpa'] as num?)?.toDouble() ?? 0.0,
      classification: json['classification']?.toString() ?? 'In Progress',
      totalCredits: (json['totalCredits'] as num?)?.toInt() ?? 0,
      totalGpaCredits: (json['totalGpaCredits'] as num?)?.toInt() ?? 0,
      totalWeightedPoints: (json['totalWeightedPoints'] as num?)?.toDouble() ?? 0.0,
      semesters: semMap,
      modules: modResults,
    );
  }
}

class SemesterGpa {
  final double sgpa;
  final int credits;
  final double weightedGp;

  SemesterGpa({
    required this.sgpa,
    required this.credits,
    required this.weightedGp,
  });

  factory SemesterGpa.fromJson(Map<String, dynamic> json) {
    return SemesterGpa(
      sgpa: (json['sgpa'] as num?)?.toDouble() ?? 0.0,
      credits: (json['credits'] as num?)?.toInt() ?? 0,
      weightedGp: (json['weightedGp'] as num?)?.toDouble() ?? 0.0,
    );
  }
}

class ModuleResult {
  final String id;
  final String moduleName;
  final String moduleCode;
  final int semester;
  final int credits;
  final String grade;
  final bool isGpa;

  ModuleResult({
    required this.id,
    required this.moduleName,
    required this.moduleCode,
    required this.semester,
    required this.credits,
    required this.grade,
    required this.isGpa,
  });

  factory ModuleResult.fromJson(Map<String, dynamic> json) {
    return ModuleResult(
      id: json['id']?.toString() ?? '',
      moduleName: json['moduleName']?.toString() ?? 'Module',
      moduleCode: json['moduleCode']?.toString() ?? '',
      semester: (json['semester'] as num?)?.toInt() ?? 1,
      credits: (json['credits'] as num?)?.toInt() ?? 0,
      grade: json['grade']?.toString() ?? '',
      isGpa: json['isGpa'] ?? true,
    );
  }
}
