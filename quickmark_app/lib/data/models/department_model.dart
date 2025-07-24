/// Model for Department data based on API responses
class DepartmentModel {
  final int departmentId;
  final String name;

  DepartmentModel({required this.departmentId, required this.name});

  /// Create DepartmentModel from API JSON response
  factory DepartmentModel.fromJson(Map<String, dynamic> json) {
    return DepartmentModel(
      departmentId: json['department_id'] ?? json['id'] ?? 0,
      name: json['name'] ?? '',
    );
  }

  /// Convert to JSON for API requests
  Map<String, dynamic> toJson() {
    return {'department_id': departmentId, 'name': name};
  }

  @override
  String toString() {
    return 'DepartmentModel(departmentId: $departmentId, name: $name)';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is DepartmentModel &&
        other.departmentId == departmentId &&
        other.name == name;
  }

  @override
  int get hashCode {
    return departmentId.hashCode ^ name.hashCode;
  }
}

/// Model for departments list API response
class DepartmentsResponseModel {
  final List<DepartmentModel> departments;

  DepartmentsResponseModel({required this.departments});

  /// Create DepartmentsResponseModel from API JSON response
  factory DepartmentsResponseModel.fromJson(Map<String, dynamic> json) {
    final departmentsList = json['departments'] as List<dynamic>? ?? [];

    return DepartmentsResponseModel(
      departments: departmentsList
          .map((dept) => DepartmentModel.fromJson(dept as Map<String, dynamic>))
          .toList(),
    );
  }

  /// Convert to JSON
  Map<String, dynamic> toJson() {
    return {'departments': departments.map((dept) => dept.toJson()).toList()};
  }

  @override
  String toString() {
    return 'DepartmentsResponseModel(departments: $departments)';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is DepartmentsResponseModel &&
        _listEquals(other.departments, departments);
  }

  @override
  int get hashCode {
    return departments.hashCode;
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
