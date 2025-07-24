import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:shared_preferences/shared_preferences.dart';

// Core
import 'core/utils/app_theme.dart';

// Data
import 'data/repositories/auth_repository_impl.dart';
import 'data/repositories/attendance_repository_impl.dart';
import 'data/datasources/remote/remote_data_source.dart';
import 'data/datasources/local/local_data_source.dart';

// Domain
import 'domain/repositories/auth_repository.dart';
import 'domain/repositories/attendance_repository.dart';

// Presentation
import 'presentation/bloc/auth/auth.dart';
import 'presentation/bloc/attendance/attendance_bloc.dart';
import 'presentation/bloc/face/face_bloc.dart';
import 'presentation/screens/login/login_screen.dart';
import 'presentation/screens/register/register_screen.dart';
import 'presentation/screens/home/home_screen.dart';
import 'presentation/screens/face_registration/face_registration_screen.dart';
import 'presentation/screens/face_verification/face_verification_screen.dart';
import 'presentation/screens/attendance_history/attendance_history_screen.dart';
import 'presentation/screens/profile/profile_screen.dart';
import 'presentation/screens/qr_scanner/qr_scanner_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize services
  final sharedPreferences = await SharedPreferences.getInstance();
  final localDataSource = LocalDataSource(sharedPreferences);
  final remoteDataSource = RemoteDataSource();

  // Initialize repositories
  final authRepository = AuthRepositoryImpl(
    remoteDataSource: remoteDataSource,
    localDataSource: localDataSource,
  );

  final attendanceRepository = AttendanceRepositoryImpl(
    remoteDataSource: remoteDataSource,
    localDataSource: localDataSource,
  );

  runApp(
    MyApp(
      authRepository: authRepository,
      attendanceRepository: attendanceRepository,
      localDataSource: localDataSource,
    ),
  );
}

class MyApp extends StatelessWidget {
  final AuthRepository authRepository;
  final AttendanceRepository attendanceRepository;
  final LocalDataSource localDataSource;

  const MyApp({
    super.key,
    required this.authRepository,
    required this.attendanceRepository,
    required this.localDataSource,
  });

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider<AuthBloc>(
          create: (context) =>
              AuthBloc(authRepository: authRepository)
                ..add(const CheckAuthStatusEvent()),
        ),
        BlocProvider<AttendanceBloc>(
          create: (context) =>
              AttendanceBloc(attendanceRepository: attendanceRepository),
        ),
        BlocProvider<FaceBloc>(
          create: (context) => FaceBloc(
            authRepository: authRepository,
            attendanceRepository: attendanceRepository,
          ),
        ),
      ],
      child: MaterialApp(
        debugShowCheckedModeBanner: false,
        title: 'QuickMark',
        theme: AppTheme.lightTheme,
        darkTheme: AppTheme.darkTheme,
        themeMode: ThemeMode.system,
        routes: {
          '/': (context) => BlocBuilder<AuthBloc, AuthState>(
            builder: (context, state) {
              if (state is AuthLoading) {
                return const Scaffold(
                  body: Center(child: CircularProgressIndicator()),
                );
              } else if (state is AuthAuthenticated) {
                return const HomeScreen();
              } else {
                return const LoginScreen();
              }
            },
          ),
          LoginScreen.routeName: (context) => const LoginScreen(),
          RegisterScreen.routeName: (context) => const RegisterScreen(),
          HomeScreen.routeName: (context) => const HomeScreen(),
          FaceRegistrationScreen.routeName: (context) =>
              const FaceRegistrationScreen(),
          FaceVerificationScreen.routeName: (context) =>
              const FaceVerificationScreen(),
          AttendanceHistoryScreen.routeName: (context) =>
              const AttendanceHistoryScreen(),
          ProfileScreen.routeName: (context) => const ProfileScreen(),
          QRScannerScreen.routeName: (context) => const QRScannerScreen(),
        },
        initialRoute: '/',
      ),
    );
  }
}
