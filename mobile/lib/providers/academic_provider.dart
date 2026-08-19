import 'dart:convert';
import 'package:flutter/material.dart';
import '../models/gpa_model.dart';
import '../models/timetable_model.dart';
import '../models/exam_model.dart';
import '../services/api_service.dart';

class AcademicProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();

  GpaPerformance? _performance;
  List<TimetableEntry> _timetable = [];
  List<ExamSeries> _examSeries = [];
  bool _isLoading = false;

  GpaPerformance? get performance => _performance;
  List<TimetableEntry> get timetable => _timetable;
  List<ExamSeries> get examSeries => _examSeries;
  bool get isLoading => _isLoading;

  List<TimetableEntry> get todayClasses {
    final currentDayIndex = DateTime.now().weekday; // 1 = Mon ... 7 = Sun
    final mappedDay = currentDayIndex == 7 ? 6 : currentDayIndex - 1;
    return _timetable.where((t) => t.dayOfWeek == mappedDay).toList()
      ..sort((a, b) => a.startTime.compareTo(b.startTime));
  }

  List<ExamPaper> get upcomingExams {
    List<ExamPaper> all = [];
    for (var series in _examSeries) {
      all.addAll(series.exams);
    }
    final now = DateTime.now();
    return all.where((e) => e.dateTime.isAfter(now) || e.dateTime.isAtSameMomentAs(now)).toList()
      ..sort((a, b) => a.dateTime.compareTo(b.dateTime));
  }

  Future<void> fetchDashboardData() async {
    _isLoading = true;
    notifyListeners();

    await Future.wait([
      fetchGpaPerformance(),
      fetchTimetable(),
      fetchExamSeries(),
    ]);

    _isLoading = false;
    notifyListeners();
  }

  Future<void> fetchGpaPerformance() async {
    try {
      final response = await _apiService.get('/gpa/calculate');
      if (response.statusCode == 200) {
        final body = jsonDecode(response.body);
        if (body['success'] == true && body['data'] != null) {
          _performance = GpaPerformance.fromJson(body['data']);
        }
      }
    } catch (e) {
      debugPrint('Error fetching GPA: $e');
    }
  }

  Future<void> fetchTimetable() async {
    try {
      final response = await _apiService.get('/timetable');
      if (response.statusCode == 200) {
        final List list = jsonDecode(response.body);
        _timetable = list.map((item) => TimetableEntry.fromJson(item)).toList();
      }
    } catch (e) {
      debugPrint('Error fetching timetable: $e');
    }
  }

  Future<void> fetchExamSeries() async {
    try {
      final response = await _apiService.get('/exam-series');
      if (response.statusCode == 200) {
        final List list = jsonDecode(response.body);
        _examSeries = list.map((item) => ExamSeries.fromJson(item)).toList();
      }
    } catch (e) {
      debugPrint('Error fetching exam series: $e');
    }
  }
}
