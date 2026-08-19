import 'dart:convert';
import 'package:flutter/material.dart';
import '../models/user_model.dart';
import '../services/api_service.dart';

class AuthProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();
  UserModel? _user;
  String? _token;
  bool _isLoading = true;

  UserModel? get user => _user;
  String? get token => _token;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _token != null;

  AuthProvider() {
    tryAutoLogin();
  }

  Future<void> tryAutoLogin() async {
    try {
      final storedToken = await _apiService.getToken();
      final storedUserData = await _apiService.getUserData();

      if (storedToken != null && storedUserData != null) {
        _token = storedToken;
        _user = UserModel.fromJson(storedUserData);
      }
    } catch (_) {}
    _isLoading = false;
    notifyListeners();
  }

  Future<Map<String, dynamic>> login(String registrationNumber, String password) async {
    try {
      final response = await _apiService.post('/auth/login', {
        'registrationNumber': registrationNumber.trim(),
        'password': password,
      });

      final body = jsonDecode(response.body);

      if (response.statusCode == 200 && body['token'] != null) {
        _token = body['token'];
        _user = UserModel.fromJson(body['user']);

        await _apiService.saveToken(_token!);
        await _apiService.saveUserData(body['user']);

        notifyListeners();
        return {'success': true};
      } else {
        return {'success': false, 'error': body['message'] ?? 'Login failed'};
      }
    } catch (e) {
      return {'success': false, 'error': 'Cannot reach server: $e'};
    }
  }

  Future<Map<String, dynamic>> register({
    required String registrationNumber,
    required String password,
    required String firstName,
    required String lastName,
  }) async {
    try {
      final response = await _apiService.post('/auth/register', {
        'registrationNumber': registrationNumber.trim(),
        'password': password,
        'firstName': firstName.trim(),
        'lastName': lastName.trim(),
      });

      final body = jsonDecode(response.body);

      if ((response.statusCode == 200 || response.statusCode == 201) && body['token'] != null) {
        _token = body['token'];
        _user = UserModel.fromJson(body['user']);

        await _apiService.saveToken(_token!);
        await _apiService.saveUserData(body['user']);

        notifyListeners();
        return {'success': true};
      } else {
        return {'success': false, 'error': body['message'] ?? 'Registration failed'};
      }
    } catch (e) {
      return {'success': false, 'error': 'Cannot reach server: $e'};
    }
  }

  Future<void> logout() async {
    await _apiService.deleteToken();
    _token = null;
    _user = null;
    notifyListeners();
  }
}
