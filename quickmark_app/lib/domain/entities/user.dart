class User {
  final String id;
  final String name;
  final String email;
  final String rollNumber;
  final bool isFaceRegistered;
  final String? photoUrl;
  final String? department;
  final int? year;
  final String? section;

  User({
    required this.id,
    required this.name,
    required this.email,
    required this.rollNumber,
    required this.isFaceRegistered,
    this.photoUrl,
    this.department,
    this.year,
    this.section,
  });

  User copyWith({
    String? name,
    String? email,
    String? rollNumber,
    bool? isFaceRegistered,
    String? photoUrl,
    String? department,
    int? year,
    String? section,
  }) {
    return User(
      id: id,
      name: name ?? this.name,
      email: email ?? this.email,
      rollNumber: rollNumber ?? this.rollNumber,
      isFaceRegistered: isFaceRegistered ?? this.isFaceRegistered,
      photoUrl: photoUrl ?? this.photoUrl,
      department: department ?? this.department,
      year: year ?? this.year,
      section: section ?? this.section,
    );
  }

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

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] ?? json['student_id'] ?? '',
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      rollNumber: json['roll_number'] ?? '',
      isFaceRegistered: json['face_registered'] ?? false,
      photoUrl: json['photo_url'],
      department: json['department'],
      year: json['current_year'] ?? json['year'],
      section: json['section'],
    );
  }
}
