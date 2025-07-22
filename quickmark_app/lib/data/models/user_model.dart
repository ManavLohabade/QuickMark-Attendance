import '../../domain/entities/user.dart';

class UserModel extends User {
  UserModel({
    required super.id,
    required super.name,
    required super.email,
    required super.rollNumber,
    required super.isFaceRegistered,
    super.photoUrl,
    super.department,
    super.year,
    super.section,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] ?? json['student_id'] ?? '',
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      rollNumber: json['roll_number'] ?? '',
      isFaceRegistered: json['face_registered'] ?? false,
      photoUrl: json['photo_url'],
      department: json['department'] ?? json['department_name'],
      year: json['current_year'] ?? json['year'],
      section: json['section'],
    );
  }

  @override
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'roll_number': rollNumber,
      'face_registered': isFaceRegistered,
      'photo_url': photoUrl,
      'department': department,
      'year': year,
      'section': section,
    };
  }

  static UserModel fromEntity(User user) {
    return UserModel(
      id: user.id,
      name: user.name,
      email: user.email,
      rollNumber: user.rollNumber,
      isFaceRegistered: user.isFaceRegistered,
      photoUrl: user.photoUrl,
      department: user.department,
      year: user.year,
      section: user.section,
    );
  }
}
