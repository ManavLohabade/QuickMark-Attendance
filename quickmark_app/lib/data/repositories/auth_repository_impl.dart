import '../../domain/repositories/auth_repository.dart';
import '../../domain/entities/user.dart';
import '../datasources/remote/remote_data_source.dart';
import '../datasources/local/local_data_source.dart';
import '../models/models.dart';

class AuthRepositoryImpl implements AuthRepository {
  final RemoteDataSource _remoteDataSource;
  final LocalDataSource _localDataSource;

  AuthRepositoryImpl({
    required RemoteDataSource remoteDataSource,
    required LocalDataSource localDataSource,
  }) : _remoteDataSource = remoteDataSource,
       _localDataSource = localDataSource;

  @override
  Future<User> login({
    required String rollNumber,
    required String password,
  }) async {
    try {
      final response = await _remoteDataSource.login(
        rollNumber: rollNumber,
        password: password,
      );

      final loginResponse = LoginResponseModel.fromJson(response);

      // Save token locally
      await _localDataSource.saveJwtToken(loginResponse.token);

      // Save user data locally
      await _localDataSource.saveUserData({
        'id': loginResponse.student.id,
        'name': loginResponse.student.name,
        'email': loginResponse.student.email,
        'roll_number': loginResponse.student.rollNumber,
        'department': loginResponse.student.department,
        'section': loginResponse.student.section,
        'photo_url': loginResponse.student.photoUrl,
        'is_face_registered': loginResponse.student.isFaceRegistered,
      });

      return loginResponse.student;
    } catch (e) {
      throw Exception('Login failed: ${e.toString()}');
    }
  }

  @override
  Future<User> register({
    required String rollNumber,
    required String name,
    required String email,
    required String password,
    required int departmentId,
    required int currentYear,
    required String section,
  }) async {
    try {
      final response = await _remoteDataSource.register(
        rollNumber: rollNumber,
        name: name,
        email: email,
        password: password,
        departmentId: departmentId,
        currentYear: currentYear,
        section: section,
      );

      final registerResponse = RegisterResponseModel.fromJson(response);

      // Save user data locally
      await _localDataSource.saveUserData({
        'id': registerResponse.student.id,
        'name': registerResponse.student.name,
        'email': registerResponse.student.email,
        'roll_number': registerResponse.student.rollNumber,
        'department': registerResponse.student.department,
        'section': registerResponse.student.section,
        'photo_url': registerResponse.student.photoUrl,
        'is_face_registered': registerResponse.student.isFaceRegistered,
      });

      return registerResponse.student;
    } catch (e) {
      throw Exception('Registration failed: ${e.toString()}');
    }
  }

  @override
  Future<User> getCurrentUser() async {
    try {
      final token = _localDataSource.getJwtToken();
      if (token == null) {
        throw Exception('No authentication token found');
      }

      // Check if we have local user data first
      final localUserData = _localDataSource.getUserData();
      if (localUserData != null) {
        // Check if we have local face embedding
        final hasLocalEmbedding = _localDataSource.hasFaceEmbedding();

        // If we have local embedding, mark face as registered locally
        if (hasLocalEmbedding && localUserData['is_face_registered'] != true) {
          localUserData['is_face_registered'] = true;
          await _localDataSource.saveUserData(localUserData);
        }

        // Create user from local data
        final localUser = StudentModel(
          id: localUserData['id'] ?? '',
          name: localUserData['name'] ?? '',
          email: localUserData['email'] ?? '',
          rollNumber: localUserData['roll_number'] ?? '',
          department: localUserData['department'] ?? '',
          section: localUserData['section'] ?? '',
          photoUrl: localUserData['photo_url'],
          isFaceRegistered:
              hasLocalEmbedding ||
              (localUserData['is_face_registered'] == true),
        );

        return localUser;
      }

      // Fallback to server if no local data
      final response = await _remoteDataSource.getCurrentStudent(token: token);
      final studentModel = StudentModel.fromJson(response);

      // Update local user data
      await _localDataSource.saveUserData({
        'id': studentModel.id,
        'name': studentModel.name,
        'email': studentModel.email,
        'roll_number': studentModel.rollNumber,
        'department': studentModel.department,
        'section': studentModel.section,
        'photo_url': studentModel.photoUrl,
        'is_face_registered': studentModel.isFaceRegistered,
      });

      return studentModel;
    } catch (e) {
      throw Exception('Failed to get current user: ${e.toString()}');
    }
  }

  @override
  Future<String> registerFace({required String faceImageUrl}) async {
    try {
      final userData = _localDataSource.getUserData();
      final studentId = userData?['id'];
      if (studentId == null) {
        throw Exception('User ID not found');
      }

      final response = await _remoteDataSource.registerFace(
        studentId: studentId.toString(),
        faceImageUrl: faceImageUrl,
      );

      final faceResponse = FaceRegistrationResponseModel.fromJson(response);
      return faceResponse.message;
    } catch (e) {
      throw Exception('Face registration failed: ${e.toString()}');
    }
  }

  @override
  Future<String> uploadPhoto({required String filePath}) async {
    try {
      final token = _localDataSource.getJwtToken();
      if (token == null) {
        throw Exception('No authentication token found');
      }

      final userData = _localDataSource.getUserData();
      final studentId = userData?['id'];
      if (studentId == null) {
        throw Exception('User ID not found');
      }

      final response = await _remoteDataSource.uploadPhoto(
        studentId: studentId.toString(),
        filePath: filePath,
        token: token,
      );

      final photoResponse = PhotoUploadResponseModel.fromJson(response);
      return photoResponse.student.photoUrl ?? '';
    } catch (e) {
      throw Exception('Photo upload failed: ${e.toString()}');
    }
  }

  @override
  Future<List<Map<String, dynamic>>> getPhotoHistory() async {
    try {
      final token = _localDataSource.getJwtToken();
      if (token == null) {
        throw Exception('No authentication token found');
      }

      final userData = _localDataSource.getUserData();
      final studentId = userData?['id'];
      if (studentId == null) {
        throw Exception('User ID not found');
      }

      final response = await _remoteDataSource.getPhotoHistory(
        studentId: studentId.toString(),
        token: token,
      );

      // Return photo history as list
      return (response['photos'] as List?)?.cast<Map<String, dynamic>>() ?? [];
    } catch (e) {
      throw Exception('Failed to get photo history: ${e.toString()}');
    }
  }

  @override
  Future<bool> isLoggedIn() async {
    try {
      return _localDataSource.hasValidJwtToken();
    } catch (e) {
      return false;
    }
  }

  @override
  Future<String?> getToken() async {
    try {
      return _localDataSource.getJwtToken();
    } catch (e) {
      return null;
    }
  }

  @override
  Future<void> logout() async {
    try {
      await _localDataSource.clearAllData();
    } catch (e) {
      throw Exception('Logout failed: ${e.toString()}');
    }
  }

  @override
  Future<List<Map<String, dynamic>>> getDepartments() async {
    try {
      final response = await _remoteDataSource.getDepartments();
      final departments =
          (response['departments'] as List?)?.cast<Map<String, dynamic>>() ??
          [];
      return departments;
    } catch (e) {
      throw Exception('Failed to get departments: ${e.toString()}');
    }
  }
}
