/// Generic API response model for handling success/error responses
class ApiResponseModel<T> {
  final bool success;
  final String? message;
  final T? data;
  final int? statusCode;
  final Map<String, dynamic>? errors;

  ApiResponseModel({
    required this.success,
    this.message,
    this.data,
    this.statusCode,
    this.errors,
  });

  /// Create successful response
  factory ApiResponseModel.success({
    T? data,
    String? message,
    int? statusCode,
  }) {
    return ApiResponseModel<T>(
      success: true,
      data: data,
      message: message ?? 'Operation completed successfully',
      statusCode: statusCode ?? 200,
    );
  }

  /// Create error response
  factory ApiResponseModel.error({
    required String message,
    int? statusCode,
    Map<String, dynamic>? errors,
  }) {
    return ApiResponseModel<T>(
      success: false,
      message: message,
      statusCode: statusCode ?? 400,
      errors: errors,
    );
  }

  /// Create from HTTP response
  factory ApiResponseModel.fromJson(
    Map<String, dynamic> json,
    T Function(Map<String, dynamic>)? fromJsonT,
  ) {
    try {
      // Check if response indicates success
      final isSuccessful =
          json['success'] ?? (json['error'] == null && json['message'] != null);

      if (isSuccessful && fromJsonT != null) {
        // Try to parse data
        T? parsedData;
        if (json['data'] != null) {
          parsedData = fromJsonT(json['data'] as Map<String, dynamic>);
        } else if (json.containsKey('student') ||
            json.containsKey('record') ||
            json.containsKey('departments')) {
          // Direct parsing for specific response types
          parsedData = fromJsonT(json);
        }

        return ApiResponseModel<T>(
          success: true,
          data: parsedData,
          message: json['message'],
          statusCode: json['status_code'] ?? 200,
        );
      } else {
        return ApiResponseModel<T>(
          success: false,
          message: json['message'] ?? json['error'] ?? 'Unknown error occurred',
          statusCode: json['status_code'] ?? 400,
          errors: json['errors'],
        );
      }
    } catch (e) {
      return ApiResponseModel<T>(
        success: false,
        message: 'Failed to parse response: ${e.toString()}',
        statusCode: 500,
      );
    }
  }

  /// Convert to JSON
  Map<String, dynamic> toJson([Map<String, dynamic> Function(T)? toJsonT]) {
    final result = <String, dynamic>{'success': success};

    if (message != null) result['message'] = message;
    if (statusCode != null) result['status_code'] = statusCode;
    if (errors != null) result['errors'] = errors;

    if (data != null) {
      if (toJsonT != null) {
        result['data'] = toJsonT(data as T);
      } else if (data is Map<String, dynamic>) {
        result['data'] = data;
      } else {
        result['data'] = data.toString();
      }
    }

    return result;
  }

  /// Check if response has data
  bool get hasData => data != null;

  /// Check if response has errors
  bool get hasErrors => errors != null && errors!.isNotEmpty;

  /// Get error message or default
  String getErrorMessage([String defaultMessage = 'An error occurred']) {
    return message ?? defaultMessage;
  }

  /// Get specific error field message
  String? getFieldError(String fieldName) {
    if (errors == null) return null;

    final fieldErrors = errors![fieldName];
    if (fieldErrors is List && fieldErrors.isNotEmpty) {
      return fieldErrors.first.toString();
    } else if (fieldErrors is String) {
      return fieldErrors;
    }

    return null;
  }

  @override
  String toString() {
    return 'ApiResponseModel(success: $success, message: $message, statusCode: $statusCode, hasData: $hasData)';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is ApiResponseModel<T> &&
        other.success == success &&
        other.message == message &&
        other.statusCode == statusCode &&
        other.data == data;
  }

  @override
  int get hashCode {
    return success.hashCode ^
        message.hashCode ^
        statusCode.hashCode ^
        data.hashCode;
  }
}

/// Specific response models for common API responses

/// Response for simple success/error messages
class MessageResponseModel {
  final String message;

  MessageResponseModel({required this.message});

  factory MessageResponseModel.fromJson(Map<String, dynamic> json) {
    return MessageResponseModel(message: json['message'] ?? '');
  }

  Map<String, dynamic> toJson() {
    return {'message': message};
  }
}

/// Response for operations that return a list
class ListResponseModel<T> {
  final List<T> items;
  final int? total;
  final int? page;
  final int? limit;

  ListResponseModel({required this.items, this.total, this.page, this.limit});

  factory ListResponseModel.fromJson(
    Map<String, dynamic> json,
    T Function(Map<String, dynamic>) fromJsonT,
  ) {
    final items = <T>[];

    // Try different possible list keys
    final listData =
        json['items'] ??
        json['data'] ??
        json['records'] ??
        json['departments'] ??
        json['history'] ??
        [];

    if (listData is List) {
      for (final item in listData) {
        if (item is Map<String, dynamic>) {
          items.add(fromJsonT(item));
        }
      }
    }

    return ListResponseModel<T>(
      items: items,
      total: json['total'],
      page: json['page'],
      limit: json['limit'],
    );
  }

  Map<String, dynamic> toJson(Map<String, dynamic> Function(T) toJsonT) {
    final result = <String, dynamic>{'items': items.map(toJsonT).toList()};

    if (total != null) result['total'] = total;
    if (page != null) result['page'] = page;
    if (limit != null) result['limit'] = limit;

    return result;
  }
}
