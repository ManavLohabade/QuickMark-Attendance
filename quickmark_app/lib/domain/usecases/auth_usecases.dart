import '../repositories/auth_repository.dart';
import '../entities/user.dart';

class LoginUseCase {
  final AuthRepository repository;

  LoginUseCase(this.repository);

  Future<User> execute({required String rollNumber, required String password}) {
    return repository.login(rollNumber: rollNumber, password: password);
  }
}

class LogoutUseCase {
  final AuthRepository repository;

  LogoutUseCase(this.repository);

  Future<void> execute() {
    return repository.logout();
  }
}

class GetCurrentUserUseCase {
  final AuthRepository repository;

  GetCurrentUserUseCase(this.repository);

  Future<User> execute() {
    return repository.getCurrentUser();
  }
}

class IsLoggedInUseCase {
  final AuthRepository repository;

  IsLoggedInUseCase(this.repository);

  Future<bool> execute() {
    return repository.isLoggedIn();
  }
}

class RegisterUseCase {
  final AuthRepository repository;

  RegisterUseCase(this.repository);

  Future<User> execute({
    required String rollNumber,
    required String name,
    required String email,
    required String password,
    required int departmentId,
    required int currentYear,
    required String section,
  }) {
    return repository.register(
      rollNumber: rollNumber,
      name: name,
      email: email,
      password: password,
      departmentId: departmentId,
      currentYear: currentYear,
      section: section,
    );
  }
}

class RegisterFaceUseCase {
  final AuthRepository repository;

  RegisterFaceUseCase(this.repository);

  Future<String> execute({required String faceImageUrl}) {
    return repository.registerFace(faceImageUrl: faceImageUrl);
  }
}

class UploadPhotoUseCase {
  final AuthRepository repository;

  UploadPhotoUseCase(this.repository);

  Future<String> execute({required String filePath}) {
    return repository.uploadPhoto(filePath: filePath);
  }
}

class GetPhotoHistoryUseCase {
  final AuthRepository repository;

  GetPhotoHistoryUseCase(this.repository);

  Future<List<Map<String, dynamic>>> execute() {
    return repository.getPhotoHistory();
  }
}

class GetTokenUseCase {
  final AuthRepository repository;

  GetTokenUseCase(this.repository);

  Future<String?> execute() {
    return repository.getToken();
  }
}

class GetDepartmentsUseCase {
  final AuthRepository repository;

  GetDepartmentsUseCase(this.repository);

  Future<List<Map<String, dynamic>>> execute() {
    return repository.getDepartments();
  }
}
