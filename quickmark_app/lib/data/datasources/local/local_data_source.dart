import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

/// Local data source for handling JWT tokens and face embeddings
/// using SharedPreferences for persistent storage
class LocalDataSource {
  final SharedPreferences _prefs;

  LocalDataSource(this._prefs);

  // Storage keys
  static const String _jwtTokenKey = 'student_jwt_token';
  static const String _refreshTokenKey = 'student_refresh_token';
  static const String _tokenExpiryKey = 'token_expiry_time';
  static const String _faceEmbeddingKey = 'face_embedding_data';
  static const String _faceEmbeddingVersionKey = 'face_embedding_version';
  static const String _studentIdKey = 'current_student_id';
  static const String _lastLoginTimeKey = 'last_login_time';
  static const String _userDataKey = 'user_data';

  // JWT Token Management

  /// Save JWT token with optional expiry time
  Future<bool> saveJwtToken(String token, {DateTime? expiryTime}) async {
    try {
      final success = await _prefs.setString(_jwtTokenKey, token);

      if (expiryTime != null) {
        await _prefs.setInt(_tokenExpiryKey, expiryTime.millisecondsSinceEpoch);
      }

      // Update last login time
      await _prefs.setInt(
        _lastLoginTimeKey,
        DateTime.now().millisecondsSinceEpoch,
      );

      return success;
    } catch (e) {
      return false;
    }
  }

  /// Retrieve JWT token
  String? getJwtToken() {
    try {
      return _prefs.getString(_jwtTokenKey);
    } catch (e) {
      return null;
    }
  }

  /// Check if JWT token exists and is valid (not expired)
  bool hasValidJwtToken() {
    try {
      final token = getJwtToken();
      if (token == null || token.isEmpty) return false;

      // Check if token has expired
      final expiryTime = getTokenExpiryTime();
      if (expiryTime != null && DateTime.now().isAfter(expiryTime)) {
        return false;
      }

      return true;
    } catch (e) {
      return false;
    }
  }

  /// Get token expiry time
  DateTime? getTokenExpiryTime() {
    try {
      final expiryMillis = _prefs.getInt(_tokenExpiryKey);
      return expiryMillis != null
          ? DateTime.fromMillisecondsSinceEpoch(expiryMillis)
          : null;
    } catch (e) {
      return null;
    }
  }

  /// Save refresh token
  Future<bool> saveRefreshToken(String refreshToken) async {
    try {
      return await _prefs.setString(_refreshTokenKey, refreshToken);
    } catch (e) {
      return false;
    }
  }

  /// Get refresh token
  String? getRefreshToken() {
    try {
      return _prefs.getString(_refreshTokenKey);
    } catch (e) {
      return null;
    }
  }

  /// Clear all authentication tokens
  Future<bool> clearTokens() async {
    try {
      final futures = await Future.wait([
        _prefs.remove(_jwtTokenKey),
        _prefs.remove(_refreshTokenKey),
        _prefs.remove(_tokenExpiryKey),
        _prefs.remove(_lastLoginTimeKey),
      ]);

      return futures.every((success) => success);
    } catch (e) {
      return false;
    }
  }

  // Face Embedding Management

  /// Save face embedding data as a string
  Future<bool> saveFaceEmbedding(String embedding, {int? version}) async {
    try {
      final success = await _prefs.setString(_faceEmbeddingKey, embedding);

      if (version != null) {
        await _prefs.setInt(_faceEmbeddingVersionKey, version);
      } else {
        // Auto-increment version
        final currentVersion = getFaceEmbeddingVersion() ?? 0;
        await _prefs.setInt(_faceEmbeddingVersionKey, currentVersion + 1);
      }

      return success;
    } catch (e) {
      return false;
    }
  }

  /// Retrieve face embedding data
  String? getFaceEmbedding() {
    try {
      return _prefs.getString(_faceEmbeddingKey);
    } catch (e) {
      return null;
    }
  }

  /// Check if face embedding exists
  bool hasFaceEmbedding() {
    try {
      final embedding = getFaceEmbedding();
      return embedding != null && embedding.isNotEmpty;
    } catch (e) {
      return false;
    }
  }

  /// Get face embedding version
  int? getFaceEmbeddingVersion() {
    try {
      return _prefs.getInt(_faceEmbeddingVersionKey);
    } catch (e) {
      return null;
    }
  }

  /// Clear face embedding data
  Future<bool> clearFaceEmbedding() async {
    try {
      final futures = await Future.wait([
        _prefs.remove(_faceEmbeddingKey),
        _prefs.remove(_faceEmbeddingVersionKey),
      ]);

      return futures.every((success) => success);
    } catch (e) {
      return false;
    }
  }

  // Student ID Management

  /// Save current student ID
  Future<bool> saveStudentId(String studentId) async {
    try {
      return await _prefs.setString(_studentIdKey, studentId);
    } catch (e) {
      return false;
    }
  }

  /// Get current student ID
  String? getStudentId() {
    try {
      return _prefs.getString(_studentIdKey);
    } catch (e) {
      return null;
    }
  }

  /// Clear student ID
  Future<bool> clearStudentId() async {
    try {
      return await _prefs.remove(_studentIdKey);
    } catch (e) {
      return false;
    }
  }

  // Session Management

  /// Get last login time
  DateTime? getLastLoginTime() {
    try {
      final loginMillis = _prefs.getInt(_lastLoginTimeKey);
      return loginMillis != null
          ? DateTime.fromMillisecondsSinceEpoch(loginMillis)
          : null;
    } catch (e) {
      return null;
    }
  }

  /// Check if user has been logged in recently (within specified duration)
  bool hasRecentLogin({Duration threshold = const Duration(days: 30)}) {
    try {
      final lastLogin = getLastLoginTime();
      if (lastLogin == null) return false;

      return DateTime.now().difference(lastLogin) < threshold;
    } catch (e) {
      return false;
    }
  }

  // User Data Management

  /// Save user data
  Future<bool> saveUserData(Map<String, dynamic> userData) async {
    return await saveJsonData(_userDataKey, userData);
  }

  /// Retrieve user data
  Map<String, dynamic>? getUserData() {
    return getJsonData(_userDataKey);
  }

  /// Check if user data exists
  bool hasUserData() {
    try {
      final userData = getUserData();
      return userData != null && userData.isNotEmpty;
    } catch (e) {
      return false;
    }
  }

  /// Clear user data
  Future<bool> clearUserData() async {
    try {
      return await _prefs.remove(_userDataKey);
    } catch (e) {
      return false;
    }
  }

  // Utility Methods

  /// Save complex data as JSON string
  Future<bool> saveJsonData(String key, Map<String, dynamic> data) async {
    try {
      final jsonString = json.encode(data);
      return await _prefs.setString(key, jsonString);
    } catch (e) {
      return false;
    }
  }

  /// Retrieve complex data from JSON string
  Map<String, dynamic>? getJsonData(String key) {
    try {
      final jsonString = _prefs.getString(key);
      if (jsonString == null) return null;

      return json.decode(jsonString) as Map<String, dynamic>;
    } catch (e) {
      return null;
    }
  }

  /// Clear all local data (complete logout)
  Future<bool> clearAllData() async {
    try {
      final futures = await Future.wait([
        clearTokens(),
        clearFaceEmbedding(),
        clearStudentId(),
      ]);

      return futures.every((success) => success);
    } catch (e) {
      return false;
    }
  }

  /// Get all stored keys for debugging
  Set<String> getAllKeys() {
    try {
      return _prefs.getKeys();
    } catch (e) {
      return <String>{};
    }
  }

  /// Check if storage is accessible
  bool isStorageAccessible() {
    try {
      // Try to read a simple value
      _prefs.getBool('test_key');
      return true;
    } catch (e) {
      return false;
    }
  }

  // Security Methods

  /// Save face embedding with basic encryption (simple XOR)
  Future<bool> saveSecureFaceEmbedding(String embedding, String key) async {
    try {
      final encrypted = _simpleEncrypt(embedding, key);
      return await saveFaceEmbedding(encrypted);
    } catch (e) {
      return false;
    }
  }

  /// Retrieve and decrypt face embedding
  String? getSecureFaceEmbedding(String key) {
    try {
      final encrypted = getFaceEmbedding();
      if (encrypted == null) return null;

      return _simpleDecrypt(encrypted, key);
    } catch (e) {
      return null;
    }
  }

  /// Simple XOR encryption for basic security
  String _simpleEncrypt(String text, String key) {
    final textBytes = text.codeUnits;
    final keyBytes = key.codeUnits;
    final encrypted = <int>[];

    for (int i = 0; i < textBytes.length; i++) {
      encrypted.add(textBytes[i] ^ keyBytes[i % keyBytes.length]);
    }

    return base64Encode(encrypted);
  }

  /// Simple XOR decryption
  String _simpleDecrypt(String encryptedText, String key) {
    final encryptedBytes = base64Decode(encryptedText);
    final keyBytes = key.codeUnits;
    final decrypted = <int>[];

    for (int i = 0; i < encryptedBytes.length; i++) {
      decrypted.add(encryptedBytes[i] ^ keyBytes[i % keyBytes.length]);
    }

    return String.fromCharCodes(decrypted);
  }
}
