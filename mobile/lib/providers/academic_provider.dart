import 'dart:convert';
import 'package:flutter/material.dart';
import '../models/gpa_model.dart';
import '../models/module_model.dart';
import '../models/timetable_model.dart';
import '../models/exam_model.dart';
import '../models/notification_model.dart';
import '../services/api_service.dart';

class AcademicProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();

  GpaPerformance? _performance;
  List<ModuleModel> _modules = [];
  List<TimetableEntry> _timetable = [];
  List<ExamSeries> _examSeries = [];
  List<NotificationModel> _notifications = [];
  bool _isLoading = false;

  // Projection state
  Map<String, dynamic>? _projectionResult;
  bool _isProjecting = false;

  GpaPerformance? get performance => _performance;
  List<ModuleModel> get modules => _modules;
  List<TimetableEntry> get timetable => _timetable;
  List<ExamSeries> get examSeries => _examSeries;
  List<NotificationModel> get notifications => _notifications;
  bool get isLoading => _isLoading;
  Map<String, dynamic>? get projectionResult => _projectionResult;
  bool get isProjecting => _isProjecting;

  int get unreadNotificationsCount =>
      _notifications.where((n) => !n.isRead).length;

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
      fetchModules(),
      fetchTimetable(),
      fetchExamSeries(),
      fetchNotifications(),
    ]);

    _isLoading = false;
    notifyListeners();
  }

  // --- GPA & Projection ---
  Future<void> fetchGpaPerformance() async {
    try {
      final response = await _apiService.get('/gpa');
      if (response.statusCode == 200) {
        final body = jsonDecode(response.body);
        _performance = GpaPerformance.fromJson(body);
      }
    } catch (e) {
      debugPrint('Error fetching GPA: $e');
    }
  }

  Future<void> calculateProjection(double targetGpa, int totalDegreeCredits) async {
    _isProjecting = true;
    notifyListeners();

    try {
      final response = await _apiService.post('/gpa/project', {
        'targetGpa': targetGpa.toStringAsFixed(2),
        'totalDegreeCredits': totalDegreeCredits.toString(),
      });

      if (response.statusCode == 200) {
        _projectionResult = jsonDecode(response.body);
      }
    } catch (e) {
      debugPrint('Error calculating projection: $e');
    } finally {
      _isProjecting = false;
      notifyListeners();
    }
  }

  // --- Modules ---
  Future<void> fetchModules() async {
    try {
      final response = await _apiService.get('/modules');
      if (response.statusCode == 200) {
        final List list = jsonDecode(response.body);
        _modules = list.map((item) => ModuleModel.fromJson(item)).toList();
      }
    } catch (e) {
      debugPrint('Error fetching modules: $e');
    }
  }

  Future<bool> createModule(Map<String, dynamic> data) async {
    try {
      final response = await _apiService.post('/modules', data);
      if (response.statusCode == 201 || response.statusCode == 200) {
        await fetchModules();
        await fetchGpaPerformance();
        return true;
      }
    } catch (e) {
      debugPrint('Error creating module: $e');
    }
    return false;
  }

  Future<bool> updateModule(String id, Map<String, dynamic> data) async {
    try {
      final response = await _apiService.put('/modules/$id', data);
      if (response.statusCode == 200) {
        await fetchModules();
        await fetchGpaPerformance();
        return true;
      }
    } catch (e) {
      debugPrint('Error updating module: $e');
    }
    return false;
  }

  Future<bool> deleteModule(String id) async {
    try {
      final response = await _apiService.delete('/modules/$id');
      if (response.statusCode == 200) {
        _modules.removeWhere((m) => m.id == id);
        await fetchGpaPerformance();
        notifyListeners();
        return true;
      }
    } catch (e) {
      debugPrint('Error deleting module: $e');
    }
    return false;
  }

  Future<void> updateAttendance(String moduleId, {required int attended, required int conducted}) async {
    try {
      final mod = _modules.firstWhere((m) => m.id == moduleId);
      final updatedData = mod.toJson();
      updatedData['attendedLectures'] = attended;
      updatedData['conductedLectures'] = conducted;

      await updateModule(moduleId, updatedData);
    } catch (e) {
      debugPrint('Error updating attendance: $e');
    }
  }

  // --- Timetable ---
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

  Future<bool> createTimetableEntry(Map<String, dynamic> data) async {
    try {
      final response = await _apiService.post('/timetable', data);
      if (response.statusCode == 201 || response.statusCode == 200) {
        await fetchTimetable();
        return true;
      }
    } catch (e) {
      debugPrint('Error adding class: $e');
    }
    return false;
  }

  Future<bool> deleteTimetableEntry(String id) async {
    try {
      final response = await _apiService.delete('/timetable/$id');
      if (response.statusCode == 200) {
        _timetable.removeWhere((t) => t.id == id);
        notifyListeners();
        return true;
      }
    } catch (e) {
      debugPrint('Error deleting class: $e');
    }
    return false;
  }

  // --- Exam Series ---
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

  Future<bool> createExamSeries(String title, List<Map<String, dynamic>> exams) async {
    try {
      final response = await _apiService.post('/exam-series', {
        'title': title,
        'exams': exams,
      });
      if (response.statusCode == 201 || response.statusCode == 200) {
        await fetchExamSeries();
        return true;
      }
    } catch (e) {
      debugPrint('Error creating exam series: $e');
    }
    return false;
  }

  Future<bool> deleteExamSeries(String id) async {
    try {
      final response = await _apiService.delete('/exam-series/$id');
      if (response.statusCode == 200) {
        _examSeries.removeWhere((s) => s.id == id);
        notifyListeners();
        return true;
      }
    } catch (e) {
      debugPrint('Error deleting exam series: $e');
    }
    return false;
  }

  // --- Notifications ---
  Future<void> fetchNotifications() async {
    try {
      final response = await _apiService.get('/notifications');
      if (response.statusCode == 200) {
        final List list = jsonDecode(response.body);
        _notifications = list.map((n) => NotificationModel.fromJson(n)).toList();
      }
    } catch (e) {
      debugPrint('Error fetching notifications: $e');
    }
  }

  Future<void> markAllNotificationsRead() async {
    try {
      await _apiService.put('/notifications/read-all');
      for (var i = 0; i < _notifications.length; i++) {
        _notifications[i] = NotificationModel(
          id: _notifications[i].id,
          title: _notifications[i].title,
          message: _notifications[i].message,
          type: _notifications[i].type,
          isRead: true,
          createdAt: _notifications[i].createdAt,
        );
      }
      notifyListeners();
    } catch (e) {
      debugPrint('Error marking notifications as read: $e');
    }
  }
}
