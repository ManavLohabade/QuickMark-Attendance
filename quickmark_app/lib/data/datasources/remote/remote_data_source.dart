import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:path/path.dart' as path;

class RemoteDataSource {
  static const String _baseUrl =
      'https://quickmark-backend-deploy1.onrender.com/api/student';
  final http.Client _httpClient;

  RemoteDataSource({http.Client? httpClient})
    : _httpClient = httpClient ?? http.Client();

  // Common headers
  Map<String, String> get _headers => {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  Map<String, String> _headersWithAuth(String token) => {
    ..._headers,
    'Authorization': 'Bearer $token',
  };

  /// 1. POST /auth/login
  /// Authenticates a student and returns a JWT token
  Future<Map<String, dynamic>> login({
    required String rollNumber,
    required String password,
  }) async {
    try {
      final response = await _httpClient.post(
        Uri.parse('$_baseUrl/auth/login'),
        headers: _headers,
        body: json.encode({'roll_number': rollNumber, 'password': password}),
      );

      final responseData = json.decode(response.body) as Map<String, dynamic>;

      if (response.statusCode == 200) {
        return responseData;
      } else {
        throw _handleErrorResponse(response.statusCode, responseData);
      }
    } catch (e) {
      if (e is SocketException) {
        throw Exception(
          'No internet connection. Please check your connection and try again.',
        );
      }
      rethrow;
    }
  }

  /// 2. POST /auth/register
  /// Registers a new student
  Future<Map<String, dynamic>> register({
    required String rollNumber,
    required String name,
    required String email,
    required String password,
    required int departmentId,
    required int currentYear,
    required String section,
  }) async {
    try {
      final response = await _httpClient.post(
        Uri.parse('$_baseUrl/auth/register'),
        headers: _headers,
        body: json.encode({
          'roll_number': rollNumber,
          'name': name,
          'email': email,
          'password': password,
          'department_id': departmentId,
          'current_year': currentYear,
          'section': section,
        }),
      );

      final responseData = json.decode(response.body) as Map<String, dynamic>;

      if (response.statusCode == 201) {
        return responseData;
      } else {
        throw _handleErrorResponse(response.statusCode, responseData);
      }
    } catch (e) {
      if (e is SocketException) {
        throw Exception(
          'No internet connection. Please check your connection and try again.',
        );
      }
      rethrow;
    }
  }

  /// 3. POST /:id/face
  /// Registers or updates a student's face data
  Future<Map<String, dynamic>> registerFace({
    required int studentId,
    required String faceImageUrl,
  }) async {
    try {
      final response = await _httpClient.post(
        Uri.parse('$_baseUrl/$studentId/face'),
        headers: _headers,
        body: json.encode({'face_image_url': faceImageUrl}),
      );

      final responseData = json.decode(response.body) as Map<String, dynamic>;

      if (response.statusCode == 200) {
        return responseData;
      } else {
        throw _handleErrorResponse(response.statusCode, responseData);
      }
    } catch (e) {
      if (e is SocketException) {
        throw Exception(
          'No internet connection. Please check your connection and try again.',
        );
      }
      rethrow;
    }
  }

  /// 4. POST /students/:id/photo
  /// Uploads a photo for a student
  Future<Map<String, dynamic>> uploadPhoto({
    required int studentId,
    required String filePath,
    required String token,
  }) async {
    try {
      final request = http.MultipartRequest(
        'POST',
        Uri.parse('$_baseUrl/students/$studentId/photo'),
      );

      // Add headers
      request.headers.addAll({
        'Authorization': 'Bearer $token',
        'Accept': 'application/json',
      });

      // Add file
      final file = File(filePath);
      if (!await file.exists()) {
        throw Exception('File not found: $filePath');
      }

      final multipartFile = await http.MultipartFile.fromPath(
        'photo',
        filePath,
        filename: path.basename(filePath),
      );
      request.files.add(multipartFile);

      final streamedResponse = await _httpClient.send(request);
      final response = await http.Response.fromStream(streamedResponse);
      final responseData = json.decode(response.body) as Map<String, dynamic>;

      if (response.statusCode == 200) {
        return responseData;
      } else {
        throw _handleErrorResponse(response.statusCode, responseData);
      }
    } catch (e) {
      if (e is SocketException) {
        throw Exception(
          'No internet connection. Please check your connection and try again.',
        );
      }
      rethrow;
    }
  }

  /// 5. GET /students/:id/photo-history
  /// Retrieves the photo history for a student
  Future<Map<String, dynamic>> getPhotoHistory({
    required int studentId,
    required String token,
  }) async {
    try {
      final response = await _httpClient.get(
        Uri.parse('$_baseUrl/students/$studentId/photo-history'),
        headers: _headersWithAuth(token),
      );

      final responseData = json.decode(response.body) as Map<String, dynamic>;

      if (response.statusCode == 200) {
        return responseData;
      } else {
        throw _handleErrorResponse(response.statusCode, responseData);
      }
    } catch (e) {
      if (e is SocketException) {
        throw Exception(
          'No internet connection. Please check your connection and try again.',
        );
      }
      rethrow;
    }
  }

  /// 6. GET /me
  /// Fetches the profile of the currently logged-in student
  Future<Map<String, dynamic>> getCurrentStudent({
    required String token,
  }) async {
    try {
      final response = await _httpClient.get(
        Uri.parse('$_baseUrl/me'),
        headers: _headersWithAuth(token),
      );

      final responseData = json.decode(response.body) as Map<String, dynamic>;

      if (response.statusCode == 200) {
        return responseData;
      } else {
        throw _handleErrorResponse(response.statusCode, responseData);
      }
    } catch (e) {
      if (e is SocketException) {
        throw Exception(
          'No internet connection. Please check your connection and try again.',
        );
      }
      rethrow;
    }
  }

  /// 7. POST /attendance/mark
  /// Marks attendance for the logged-in student
  Future<Map<String, dynamic>> markAttendance({
    required String token,
    required String verifySessionToken,
    required bool faceVerify,
  }) async {
    try {
      final response = await _httpClient.post(
        Uri.parse('$_baseUrl/attendance/mark'),
        headers: _headersWithAuth(token),
        body: json.encode({
          'verify_session_token': verifySessionToken,
          'face_verify': faceVerify,
        }),
      );

      final responseData = json.decode(response.body) as Map<String, dynamic>;

      if (response.statusCode == 200) {
        return responseData;
      } else {
        throw _handleErrorResponse(response.statusCode, responseData);
      }
    } catch (e) {
      if (e is SocketException) {
        throw Exception(
          'No internet connection. Please check your connection and try again.',
        );
      }
      rethrow;
    }
  }

  /// 8. GET /attendance/calendar
  /// Retrieves the attendance calendar for the logged-in student
  Future<List<Map<String, dynamic>>> getAttendanceCalendar({
    required String token,
    int? subjectId,
    String? startDate,
    String? endDate,
  }) async {
    try {
      final queryParams = <String, String>{};
      if (subjectId != null) queryParams['subject_id'] = subjectId.toString();
      if (startDate != null) queryParams['start_date'] = startDate;
      if (endDate != null) queryParams['end_date'] = endDate;

      final uri = Uri.parse(
        '$_baseUrl/attendance/calendar',
      ).replace(queryParameters: queryParams.isNotEmpty ? queryParams : null);

      final response = await _httpClient.get(
        uri,
        headers: _headersWithAuth(token),
      );

      if (response.statusCode == 200) {
        final responseData = json.decode(response.body);
        if (responseData is List) {
          return responseData.cast<Map<String, dynamic>>();
        } else if (responseData is Map<String, dynamic> &&
            responseData.containsKey('records')) {
          return (responseData['records'] as List).cast<Map<String, dynamic>>();
        } else {
          throw Exception('Unexpected response format for attendance calendar');
        }
      } else {
        final responseData = json.decode(response.body) as Map<String, dynamic>;
        throw _handleErrorResponse(response.statusCode, responseData);
      }
    } catch (e) {
      if (e is SocketException) {
        throw Exception(
          'No internet connection. Please check your connection and try again.',
        );
      }
      rethrow;
    }
  }

  /// 9. GET /departments
  /// Gets a list of all departments
  Future<Map<String, dynamic>> getDepartments() async {
    try {
      final response = await _httpClient.get(
        Uri.parse('$_baseUrl/departments'),
        headers: _headers,
      );

      final responseData = json.decode(response.body) as Map<String, dynamic>;

      if (response.statusCode == 200) {
        return responseData;
      } else {
        throw _handleErrorResponse(response.statusCode, responseData);
      }
    } catch (e) {
      if (e is SocketException) {
        throw Exception(
          'No internet connection. Please check your connection and try again.',
        );
      }
      rethrow;
    }
  }

  // Additional helper methods for QR code verification and session management

  /// Parse QR code data to extract session token and information
  Map<String, dynamic> parseQRCode(String qrData) {
    try {
      // Assuming QR code contains JSON data with session information
      final data = json.decode(qrData) as Map<String, dynamic>;

      // Validate required fields
      if (!data.containsKey('session_token') ||
          !data.containsKey('session_id')) {
        throw Exception('Invalid QR code format');
      }

      return data;
    } catch (e) {
      throw Exception('Failed to parse QR code: ${e.toString()}');
    }
  }

  /// Upload face image for verification during attendance marking
  Future<Map<String, dynamic>> uploadFaceForVerification({
    required String token,
    required String filePath,
  }) async {
    try {
      final request = http.MultipartRequest(
        'POST',
        Uri.parse('$_baseUrl/attendance/verify-face'),
      );

      // Add headers
      request.headers.addAll({
        'Authorization': 'Bearer $token',
        'Accept': 'application/json',
      });

      // Add file
      final file = File(filePath);
      if (!await file.exists()) {
        throw Exception('Face image file not found: $filePath');
      }

      final multipartFile = await http.MultipartFile.fromPath(
        'face_image',
        filePath,
        filename: path.basename(filePath),
      );
      request.files.add(multipartFile);

      final streamedResponse = await _httpClient.send(request);
      final response = await http.Response.fromStream(streamedResponse);
      final responseData = json.decode(response.body) as Map<String, dynamic>;

      if (response.statusCode == 200) {
        return responseData;
      } else {
        throw _handleErrorResponse(response.statusCode, responseData);
      }
    } catch (e) {
      if (e is SocketException) {
        throw Exception(
          'No internet connection. Please check your connection and try again.',
        );
      }
      rethrow;
    }
  }

  /// Get active attendance sessions for the student
  Future<List<Map<String, dynamic>>> getActiveSessions({
    required String token,
  }) async {
    try {
      final response = await _httpClient.get(
        Uri.parse('$_baseUrl/attendance/active-sessions'),
        headers: _headersWithAuth(token),
      );

      if (response.statusCode == 200) {
        final responseData = json.decode(response.body);
        if (responseData is List) {
          return responseData.cast<Map<String, dynamic>>();
        } else if (responseData is Map<String, dynamic> &&
            responseData.containsKey('sessions')) {
          return (responseData['sessions'] as List)
              .cast<Map<String, dynamic>>();
        } else {
          throw Exception('Unexpected response format for active sessions');
        }
      } else {
        final responseData = json.decode(response.body) as Map<String, dynamic>;
        throw _handleErrorResponse(response.statusCode, responseData);
      }
    } catch (e) {
      if (e is SocketException) {
        throw Exception(
          'No internet connection. Please check your connection and try again.',
        );
      }
      rethrow;
    }
  }

  /// Handle different HTTP error status codes
  Exception _handleErrorResponse(
    int statusCode,
    Map<String, dynamic> responseData,
  ) {
    final message =
        responseData['message'] ??
        responseData['error'] ??
        'Unknown error occurred';

    switch (statusCode) {
      case 400:
        return Exception('Bad Request: $message');
      case 401:
        return Exception('Unauthorized: $message');
      case 403:
        return Exception('Forbidden: $message');
      case 404:
        return Exception('Not Found: $message');
      case 409:
        return Exception('Conflict: $message');
      case 422:
        return Exception('Validation Error: $message');
      case 500:
        return Exception('Internal Server Error: $message');
      case 502:
        return Exception('Bad Gateway: Server is temporarily unavailable');
      case 503:
        return Exception('Service Unavailable: Server is temporarily down');
      default:
        return Exception('HTTP Error $statusCode: $message');
    }
  }

  /// Dispose of the HTTP client
  void dispose() {
    _httpClient.close();
  }
}
