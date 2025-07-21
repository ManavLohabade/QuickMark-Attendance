import 'student_model.dart';

/// Model for photo upload API response
class PhotoUploadResponseModel {
  final StudentModel student;

  PhotoUploadResponseModel({required this.student});

  /// Create PhotoUploadResponseModel from API JSON response
  factory PhotoUploadResponseModel.fromJson(Map<String, dynamic> json) {
    return PhotoUploadResponseModel(
      student: StudentModel.fromJson(json['student'] ?? json),
    );
  }

  /// Convert to JSON
  Map<String, dynamic> toJson() {
    return {'student': student.toJson()};
  }

  @override
  String toString() {
    return 'PhotoUploadResponseModel(student: $student)';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is PhotoUploadResponseModel && other.student == student;
  }

  @override
  int get hashCode {
    return student.hashCode;
  }
}

/// Model for photo history API response
class PhotoHistoryResponseModel {
  final List<PhotoHistoryItem> history;

  PhotoHistoryResponseModel({required this.history});

  /// Create PhotoHistoryResponseModel from API JSON response
  factory PhotoHistoryResponseModel.fromJson(Map<String, dynamic> json) {
    final historyList = json['history'] as List<dynamic>? ?? [];

    return PhotoHistoryResponseModel(
      history: historyList
          .map(
            (item) => PhotoHistoryItem.fromJson(item as Map<String, dynamic>),
          )
          .toList(),
    );
  }

  /// Convert to JSON
  Map<String, dynamic> toJson() {
    return {'history': history.map((item) => item.toJson()).toList()};
  }

  @override
  String toString() {
    return 'PhotoHistoryResponseModel(history: $history)';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is PhotoHistoryResponseModel &&
        _listEquals(other.history, history);
  }

  @override
  int get hashCode {
    return history.hashCode;
  }

  /// Helper method to compare lists
  bool _listEquals<T>(List<T>? a, List<T>? b) {
    if (a == null) return b == null;
    if (b == null || a.length != b.length) return false;
    if (identical(a, b)) return true;
    for (int index = 0; index < a.length; index += 1) {
      if (a[index] != b[index]) return false;
    }
    return true;
  }
}

/// Model for individual photo history item
class PhotoHistoryItem {
  final String id;
  final String photoUrl;
  final DateTime uploadedAt;
  final String? description;

  PhotoHistoryItem({
    required this.id,
    required this.photoUrl,
    required this.uploadedAt,
    this.description,
  });

  /// Create PhotoHistoryItem from API JSON response
  factory PhotoHistoryItem.fromJson(Map<String, dynamic> json) {
    return PhotoHistoryItem(
      id: (json['id'] ?? '').toString(),
      photoUrl: json['photo_url'] ?? json['url'] ?? '',
      uploadedAt: json['uploaded_at'] != null
          ? DateTime.parse(json['uploaded_at'])
          : DateTime.now(),
      description: json['description'],
    );
  }

  /// Convert to JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'photo_url': photoUrl,
      'uploaded_at': uploadedAt.toIso8601String(),
      if (description != null) 'description': description,
    };
  }

  @override
  String toString() {
    return 'PhotoHistoryItem(id: $id, photoUrl: $photoUrl, uploadedAt: $uploadedAt)';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is PhotoHistoryItem &&
        other.id == id &&
        other.photoUrl == photoUrl &&
        other.uploadedAt == uploadedAt;
  }

  @override
  int get hashCode {
    return id.hashCode ^ photoUrl.hashCode ^ uploadedAt.hashCode;
  }
}
