import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class LocalStorage {
  final SharedPreferences _sharedPreferences;

  LocalStorage(this._sharedPreferences);

  // Auth tokens
  static const String _tokenKey = 'auth_token';
  static const String _userKey = 'current_user';

  // Face registration
  static const String _faceRegisteredKey = 'face_registered';
  static const String _faceImagePathKey = 'face_image_path';

  // Settings
  static const String _darkModeKey = 'dark_mode';
  static const String _apiUrlKey = 'api_url';

  // Auth methods
  Future<void> saveToken(String token) async {
    await _sharedPreferences.setString(_tokenKey, token);
  }

  String? getToken() {
    return _sharedPreferences.getString(_tokenKey);
  }

  Future<void> saveUserData(Map<String, dynamic> userData) async {
    await _sharedPreferences.setString(_userKey, jsonEncode(userData));
  }

  Map<String, dynamic>? getUserData() {
    final userJson = _sharedPreferences.getString(_userKey);
    if (userJson == null) return null;
    return jsonDecode(userJson) as Map<String, dynamic>;
  }

  Future<void> clearAuthData() async {
    await _sharedPreferences.remove(_tokenKey);
    await _sharedPreferences.remove(_userKey);
  }

  // Face registration methods
  Future<void> setFaceRegistered(bool isRegistered) async {
    await _sharedPreferences.setBool(_faceRegisteredKey, isRegistered);
  }

  bool isFaceRegistered() {
    return _sharedPreferences.getBool(_faceRegisteredKey) ?? false;
  }

  Future<void> saveFaceImagePath(String path) async {
    await _sharedPreferences.setString(_faceImagePathKey, path);
  }

  String? getFaceImagePath() {
    return _sharedPreferences.getString(_faceImagePathKey);
  }

  // Settings methods
  Future<void> setDarkMode(bool isDarkMode) async {
    await _sharedPreferences.setBool(_darkModeKey, isDarkMode);
  }

  bool isDarkMode() {
    return _sharedPreferences.getBool(_darkModeKey) ?? false;
  }

  Future<void> saveApiUrl(String url) async {
    await _sharedPreferences.setString(_apiUrlKey, url);
  }

  String getApiUrl() {
    return _sharedPreferences.getString(_apiUrlKey) ?? 'http://localhost:3000';
  }
}
