import '../../domain/entities/user.dart';

/// Data model for Student based on API responses
class StudentModel extends User {
  final int? departmentId;
  final int? currentYear;
  final String? token;

  StudentModel({
    required String id,
    required String name,
    required String email,
    required String rollNumber,
    this.departmentId,
    String? department,
    this.currentYear,
    String? section,
    String? photoUrl,
    bool isFaceRegistered = false,
    this.token,
  }) : super(
         id: id,
         name: name,
         email: email,
         rollNumber: rollNumber,
         isFaceRegistered: isFaceRegistered,
         photoUrl: photoUrl,
         department: department,
         year: currentYear,
         section: section,
       );

  /// Create StudentModel from API JSON response
  factory StudentModel.fromJson(Map<String, dynamic> json) {
    return StudentModel(
      id: (json['id'] ?? json['student_id'] ?? 0).toString(),
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      rollNumber: json['roll_number'] ?? '',
      departmentId: json['department_id'],
      department: json['department_name'] ?? json['department'],
      currentYear: json['current_year'],
      section: json['section'],
      photoUrl: json['photo_url'],
      isFaceRegistered: json['face_registered'] ?? false,
      token: json['token'],
    );
  }

  /// Convert StudentModel to JSON for API requests
  Map<String, dynamic> toJson() {
    final data = <String, dynamic>{
      'id': int.tryParse(id) ?? id,
      'name': name,
      'email': email,
      'roll_number': rollNumber,
    };

    if (departmentId != null) data['department_id'] = departmentId;
    if (department != null) data['department_name'] = department;
    if (currentYear != null) data['current_year'] = currentYear;
    if (section != null) data['section'] = section;
    if (photoUrl != null) data['photo_url'] = photoUrl;
    data['face_registered'] = isFaceRegistered;
    if (token != null) data['token'] = token;

    return data;
  }

  /// Create StudentModel from User entity
  factory StudentModel.fromEntity(User user) {
    return StudentModel(
      id: user.id,
      name: user.name,
      email: user.email,
      rollNumber: user.rollNumber,
      departmentId: null, // Not available in base User entity
      department: user.department,
      currentYear: user.year,
      section: user.section,
      photoUrl: user.photoUrl,
      isFaceRegistered: user.isFaceRegistered,
      token: null, // Not available in base User entity
    );
  }

  /// Create a copy with updated fields
  @override
  StudentModel copyWith({
    String? name,
    String? email,
    String? rollNumber,
    bool? isFaceRegistered,
    String? photoUrl,
    String? department,
    int? year,
    String? section,
    // Additional fields specific to StudentModel
    int? departmentId,
    String? token,
  }) {
    return StudentModel(
      id: id, // ID cannot be changed
      name: name ?? this.name,
      email: email ?? this.email,
      rollNumber: rollNumber ?? this.rollNumber,
      departmentId: departmentId ?? this.departmentId,
      department: department ?? this.department,
      currentYear: year ?? this.currentYear,
      section: section ?? this.section,
      photoUrl: photoUrl ?? this.photoUrl,
      isFaceRegistered: isFaceRegistered ?? this.isFaceRegistered,
      token: token ?? this.token,
    );
  }

  @override
  String toString() {
    return 'StudentModel(id: $id, name: $name, email: $email, rollNumber: $rollNumber, departmentId: $departmentId, currentYear: $currentYear, section: $section)';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is StudentModel &&
        other.id == id &&
        other.name == name &&
        other.email == email &&
        other.rollNumber == rollNumber &&
        other.departmentId == departmentId;
  }

  @override
  int get hashCode {
    return id.hashCode ^
        name.hashCode ^
        email.hashCode ^
        rollNumber.hashCode ^
        departmentId.hashCode;
  }
}
