import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../datasources/local/local_storage.dart';

class ApiResponse<T> {
  final T? data;
  final bool success;
  final String? message;

  ApiResponse({this.data, required this.success, this.message});
}

class ApiException implements Exception {
  final String message;
  final int? statusCode;

  ApiException(this.message, [this.statusCode]);

  @override
  String toString() => 'ApiException: $message (Status code: $statusCode)';
}

class ApiService {
  final http.Client _client;
  final LocalStorage? _localStorage;

  ApiService({http.Client? client, LocalStorage? localStorage})
    : _client = client ?? http.Client(),
      _localStorage = localStorage;

  String get baseUrl {
    // Return from local storage if available, otherwise use default
    return _localStorage?.getApiUrl() ?? 'http://localhost:3000/api';
  }

  Map<String, String> _getHeaders({bool requireAuth = true}) {
    final headers = {'Content-Type': 'application/json'};

    if (requireAuth && _localStorage != null) {
      final token = _localStorage!.getToken();
      if (token != null) {
        headers['Authorization'] = 'Bearer $token';
      }
    }

    return headers;
  }

  Future<ApiResponse<T>> get<T>(
    String endpoint, {
    Map<String, dynamic>? queryParams,
    bool requireAuth = true,
    T Function(Map<String, dynamic> json)? fromJson,
  }) async {
    try {
      final uri = Uri.parse(
        '$baseUrl$endpoint',
      ).replace(queryParameters: queryParams);

      final response = await _client.get(
        uri,
        headers: _getHeaders(requireAuth: requireAuth),
      );

      return _processResponse(response, fromJson);
    } catch (e) {
      return ApiResponse(
        success: false,
        message: 'Network error: ${e.toString()}',
      );
    }
  }

  Future<ApiResponse<T>> post<T>(
    String endpoint, {
    Map<String, dynamic>? body,
    bool requireAuth = true,
    T Function(Map<String, dynamic> json)? fromJson,
  }) async {
    try {
      final uri = Uri.parse('$baseUrl$endpoint');

      final response = await _client.post(
        uri,
        headers: _getHeaders(requireAuth: requireAuth),
        body: body != null ? jsonEncode(body) : null,
      );

      return _processResponse(response, fromJson);
    } catch (e) {
      return ApiResponse(
        success: false,
        message: 'Network error: ${e.toString()}',
      );
    }
  }

  Future<ApiResponse<T>> put<T>(
    String endpoint, {
    Map<String, dynamic>? body,
    bool requireAuth = true,
    T Function(Map<String, dynamic> json)? fromJson,
  }) async {
    try {
      final uri = Uri.parse('$baseUrl$endpoint');

      final response = await _client.put(
        uri,
        headers: _getHeaders(requireAuth: requireAuth),
        body: body != null ? jsonEncode(body) : null,
      );

      return _processResponse(response, fromJson);
    } catch (e) {
      return ApiResponse(
        success: false,
        message: 'Network error: ${e.toString()}',
      );
    }
  }

  Future<ApiResponse<T>> delete<T>(
    String endpoint, {
    bool requireAuth = true,
    T Function(Map<String, dynamic> json)? fromJson,
  }) async {
    try {
      final uri = Uri.parse('$baseUrl$endpoint');

      final response = await _client.delete(
        uri,
        headers: _getHeaders(requireAuth: requireAuth),
      );

      return _processResponse(response, fromJson);
    } catch (e) {
      return ApiResponse(
        success: false,
        message: 'Network error: ${e.toString()}',
      );
    }
  }

  // For multipart requests (file uploads)
  Future<ApiResponse<T>> uploadFile<T>(
    String endpoint,
    String filePath,
    String fieldName, {
    Map<String, String>? fields,
    bool requireAuth = true,
    T Function(Map<String, dynamic> json)? fromJson,
  }) async {
    try {
      final uri = Uri.parse('$baseUrl$endpoint');
      final request = http.MultipartRequest('POST', uri);

      // Add file
      request.files.add(await http.MultipartFile.fromPath(fieldName, filePath));

      // Add other fields if any
      if (fields != null) {
        request.fields.addAll(fields);
      }

      // Add headers
      final headers = _getHeaders(requireAuth: requireAuth);
      request.headers.addAll(headers);

      // Send request
      final streamedResponse = await request.send();
      final response = await http.Response.fromStream(streamedResponse);

      return _processResponse(response, fromJson);
    } catch (e) {
      return ApiResponse(
        success: false,
        message: 'Network error: ${e.toString()}',
      );
    }
  }

  ApiResponse<T> _processResponse<T>(
    http.Response response,
    T Function(Map<String, dynamic> json)? fromJson,
  ) {
    final statusCode = response.statusCode;
    final responseBody = response.body;

    if (statusCode >= 200 && statusCode < 300) {
      if (responseBody.isEmpty) {
        return ApiResponse<T>(success: true);
      }

      final Map<String, dynamic> jsonResponse = jsonDecode(responseBody);

      if (fromJson != null) {
        final T data = fromJson(jsonResponse);
        return ApiResponse<T>(data: data, success: true);
      }

      return ApiResponse<T>(success: true, data: jsonResponse as T);
    } else {
      try {
        final Map<String, dynamic> errorResponse = jsonDecode(responseBody);
        final message = errorResponse['message'] ?? 'Unknown error';
        return ApiResponse<T>(success: false, message: message);
      } catch (_) {
        return ApiResponse<T>(
          success: false,
          message: 'Server error: $statusCode',
        );
      }
    }
  }
}
