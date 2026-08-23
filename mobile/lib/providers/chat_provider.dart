import 'dart:convert';
import 'package:flutter/material.dart';
import '../models/chat_model.dart';
import '../services/api_service.dart';

class ChatProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();

  List<ChatSessionModel> _sessions = [];
  ChatSessionModel? _activeSession;
  List<ChatMessageModel> _messages = [];
  bool _isLoadingSessions = false;
  bool _isLoadingMessages = false;
  bool _isSending = false;

  List<ChatSessionModel> get sessions => _sessions;
  ChatSessionModel? get activeSession => _activeSession;
  List<ChatMessageModel> get messages => _messages;
  bool get isLoadingSessions => _isLoadingSessions;
  bool get isLoadingMessages => _isLoadingMessages;
  bool get isSending => _isSending;

  Future<void> fetchSessions(String moduleId) async {
    _isLoadingSessions = true;
    notifyListeners();

    try {
      final response = await _apiService.get('/modules/$moduleId/sessions');
      if (response.statusCode == 200) {
        final List list = jsonDecode(response.body);
        _sessions = list.map((s) => ChatSessionModel.fromJson(s)).toList();

        if (_sessions.isNotEmpty && _activeSession == null) {
          await selectSession(moduleId, _sessions.first);
        }
      }
    } catch (e) {
      debugPrint('Error fetching sessions: $e');
    } finally {
      _isLoadingSessions = false;
      notifyListeners();
    }
  }

  Future<void> selectSession(String moduleId, ChatSessionModel session) async {
    _activeSession = session;
    _isLoadingMessages = true;
    notifyListeners();

    try {
      final response = await _apiService.get('/modules/$moduleId/sessions/${session.id}/chat');
      if (response.statusCode == 200) {
        final List list = jsonDecode(response.body);
        _messages = list.map((m) => ChatMessageModel.fromJson(m)).toList();
      }
    } catch (e) {
      debugPrint('Error fetching messages: $e');
    } finally {
      _isLoadingMessages = false;
      notifyListeners();
    }
  }

  Future<ChatSessionModel?> createSession(String moduleId, {String? title}) async {
    try {
      final response = await _apiService.post('/modules/$moduleId/sessions', {
        'title': title ?? 'New Discussion',
      });
      if (response.statusCode == 200 || response.statusCode == 201) {
        final body = jsonDecode(response.body);
        final newSession = ChatSessionModel.fromJson(body);
        _sessions.insert(0, newSession);
        await selectSession(moduleId, newSession);
        return newSession;
      }
    } catch (e) {
      debugPrint('Error creating session: $e');
    }
    return null;
  }

  Future<void> deleteSession(String moduleId, String sessionId) async {
    try {
      final response = await _apiService.delete('/modules/$moduleId/sessions/$sessionId');
      if (response.statusCode == 200) {
        _sessions.removeWhere((s) => s.id == sessionId);
        if (_activeSession?.id == sessionId) {
          if (_sessions.isNotEmpty) {
            await selectSession(moduleId, _sessions.first);
          } else {
            _activeSession = null;
            _messages = [];
          }
        }
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Error deleting session: $e');
    }
  }

  Future<void> sendMessage(String moduleId, String messageText) async {
    if (messageText.trim().isEmpty) return;

    // If no active session, create one
    if (_activeSession == null) {
      final created = await createSession(moduleId, title: messageText.trim());
      if (created == null) return;
    }

    final userMessage = ChatMessageModel(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      role: 'user',
      content: messageText.trim(),
      createdAt: DateTime.now(),
    );

    _messages.add(userMessage);
    _isSending = true;
    notifyListeners();

    try {
      final response = await _apiService.post(
        '/modules/$moduleId/sessions/${_activeSession!.id}/chat',
        {'message': messageText.trim()},
      );

      if (response.statusCode == 200) {
        final body = jsonDecode(response.body);
        final assistantMessage = ChatMessageModel.fromJson(body);
        _messages.add(assistantMessage);
      }
    } catch (e) {
      _messages.add(ChatMessageModel(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        role: 'assistant',
        content: '⚠️ Failed to connect to AI Tutor. Please ensure your cloud service is running.',
        createdAt: DateTime.now(),
      ));
    } finally {
      _isSending = false;
      notifyListeners();
    }
  }
}
