// lib/presentation/screens/home/home_screen.dart
// MODIFIED TO INCLUDE THEME AND LOGOUT BUTTONS

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../bloc/auth/auth.dart';
import '../../bloc/attendance/attendance.dart';
// ## NEW: Import the ThemeCubit ##
import '../../bloc/theme/theme_cubit.dart';
import '../face_verification/face_verification_screen.dart';
import '../face_registration/face_registration_screen.dart';
import '../../widgets/student_info_card.dart';
import '../../widgets/attendance_stats_card.dart';
import '../../widgets/quick_actions_card.dart';
import '../attendance_history/attendance_history_screen.dart';
import '../profile/profile_screen.dart';
import '../qr_scanner/qr_scanner_screen.dart';
import '../../../core/utils/app_theme.dart';
import '../login/login_screen.dart';

class HomeScreen extends StatefulWidget {
  static const routeName = '/home';

  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  @override
  void initState() {
    super.initState();
    context.read<AttendanceBloc>().add(const LoadAttendanceCalendarEvent());
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _checkFaceRegistrationStatus();
    });
  }

  void _checkFaceRegistrationStatus() {
    final authState = context.read<AuthBloc>().state;
    if (authState is AuthAuthenticated && !authState.user.isFaceRegistered) {
      _showFaceRegistrationPrompt();
    }
  }

  void _showFaceRegistrationPrompt() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Face Registration Required'),
        content: const Text(
            'For a seamless and secure experience, please register your face. This is a one-time setup.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Later'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.of(ctx).pop();
              Navigator.pushNamed(context, FaceRegistrationScreen.routeName);
            },
            child: const Text('Register Now'),
          ),
        ],
      ),
    );
  }

  void _handleAttendanceAction() {
    final authState = context.read<AuthBloc>().state;
    if (authState is AuthAuthenticated) {
      if (authState.user.isFaceRegistered) {
        Navigator.pushNamed(context, FaceVerificationScreen.routeName);
      } else {
        _showFaceRegistrationPrompt();
      }
    }
  }

  void _handleLogout() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Logout'),
        content: const Text('Are you sure you want to logout?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              Navigator.of(ctx).pop();
              context.read<AuthBloc>().add(const LogoutEvent());
            },
            child: const Text('Logout'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    // ## NEW: Determine current brightness for the icon ##
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('QuickMark Dashboard'),
        actions: [
          // ## NEW: Theme toggle button ##
          IconButton(
            icon: Icon(isDarkMode ? Icons.light_mode_outlined : Icons.dark_mode_outlined),
            // Pass the isDarkMode boolean to the toggleTheme function
            onPressed: () => context.read<ThemeCubit>().toggleTheme(isDarkMode),
            tooltip: 'Toggle Theme',
          ),
          IconButton(
            icon: const Icon(Icons.person_outline),
            onPressed: () => Navigator.pushNamed(context, ProfileScreen.routeName),
            tooltip: 'Profile',
          ),
          // ## NEW: Logout button ##
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: _handleLogout,
            tooltip: 'Logout',
          )
        ],
      ),
      body: BlocListener<AuthBloc, AuthState>(
        listener: (context, state) {
          if (state is AuthUnauthenticated) {
            Navigator.pushReplacementNamed(context, LoginScreen.routeName);
          }
        },
        child: RefreshIndicator(
          onRefresh: () async {
            context.read<AttendanceBloc>().add(const LoadAttendanceCalendarEvent());
          },
          child: BlocBuilder<AuthBloc, AuthState>(
            builder: (context, authState) {
              if (authState is AuthAuthenticated) {
                return _buildAuthenticatedView(authState);
              }
              return const Center(child: CircularProgressIndicator());
            },
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _handleAttendanceAction,
        icon: const Icon(Icons.face_retouching_natural),
        label: const Text('Mark Attendance'),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerFloat,
    );
  }

  Widget _buildAuthenticatedView(AuthAuthenticated authState) {
    // This part of the UI remains the same as it's already theme-aware.
    return ListView(
      padding: const EdgeInsets.all(16.0),
      children: [
        _buildWelcomeHeader(authState.user),
        const SizedBox(height: 24),
        StudentInfoCard(user: authState.user),
        const SizedBox(height: 16),
        BlocBuilder<AttendanceBloc, AttendanceState>(
          builder: (context, attendanceState) {
            if (attendanceState is AttendanceCalendarLoaded) {
              return AttendanceStatsCard(attendanceRecords: attendanceState.records);
            }
            return const AttendanceStatsCard(attendanceRecords: []);
          },
        ),
        const SizedBox(height: 16),
        QuickActionsCard(
          onMarkAttendance: _handleAttendanceAction,
          onViewHistory: () => Navigator.pushNamed(context, AttendanceHistoryScreen.routeName),
          onViewProfile: () => Navigator.pushNamed(context, ProfileScreen.routeName),
          onScanQR: () => Navigator.pushNamed(context, QRScannerScreen.routeName),
        ),
        const SizedBox(height: 24),
        // ... (rest of the widgets)
        const SizedBox(height: 100),
      ],
    );
  }

  Widget _buildWelcomeHeader(user) {
    final theme = Theme.of(context);
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: theme.colorScheme.primary,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Hello,',
            style: theme.textTheme.titleLarge?.copyWith(color: theme.colorScheme.onPrimary.withOpacity(0.8)),
          ),
          const SizedBox(height: 4),
          Text(
            user.name,
            style: theme.textTheme.headlineMedium?.copyWith(
              color: theme.colorScheme.onPrimary,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }
}