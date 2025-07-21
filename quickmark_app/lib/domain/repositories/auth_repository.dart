import '../entities/user.dart';

/// Abstract repository for authentication operations
abstract class AuthRepository {
  /// Authenticate user with roll number and password
  /// Returns User entity on successful login
  Future<User> login({required String rollNumber, required String password});

  /// Register a new student
  /// Returns User entity on successful registration
  Future<User> register({
    required String rollNumber,
    required String name,
    required String email,
    required String password,
    required int departmentId,
    required int currentYear,
    required String section,
  });

  /// Get current authenticated user
  /// Returns User entity if token is valid
  Future<User> getCurrentUser();

  /// Register face data for the current user
  /// Returns success message
  Future<String> registerFace({required String faceImageUrl});

  /// Upload profile photo
  /// Returns the uploaded photo URL
  Future<String> uploadPhoto({required String filePath});

  /// Get photo history for the user
  /// Returns list of photo URLs with timestamps
  Future<List<Map<String, dynamic>>> getPhotoHistory();

  /// Check if user is logged in
  Future<bool> isLoggedIn();

  /// Get stored JWT token
  Future<String?> getToken();

  /// Logout user and clear stored data
  Future<void> logout();

  /// Get list of available departments
  Future<List<Map<String, dynamic>>> getDepartments();
}
