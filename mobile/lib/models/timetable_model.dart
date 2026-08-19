class TimetableEntry {
  final String id;
  final int dayOfWeek; // 0 = Mon, 6 = Sun
  final String startTime;
  final String endTime;
  final String type;
  final String location;
  final String? moduleName;

  TimetableEntry({
    required this.id,
    required this.dayOfWeek,
    required this.startTime,
    required this.endTime,
    required this.type,
    required this.location,
    this.moduleName,
  });

  factory TimetableEntry.fromJson(Map<String, dynamic> json) {
    return TimetableEntry(
      id: json['id']?.toString() ?? '',
      dayOfWeek: (json['dayOfWeek'] as num?)?.toInt() ?? 0,
      startTime: json['startTime']?.toString() ?? '08:00',
      endTime: json['endTime']?.toString() ?? '10:00',
      type: json['type']?.toString() ?? 'Lecture',
      location: json['location']?.toString() ?? 'Main Hall',
      moduleName: json['moduleName']?.toString(),
    );
  }
}
