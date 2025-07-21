import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../bloc/auth/auth.dart';
import '../../bloc/attendance/attendance_bloc.dart';
import '../../bloc/attendance/attendance_event.dart';
import '../../bloc/attendance/attendance_state.dart';
import '../face_verification/face_verification_screen.dart';
import '../face_registration/face_registration_screen.dart';
import '../../widgets/student_info_card.dart';
import '../../widgets/attendance_stats_card.dart';
import '../../widgets/quick_actions_card.dart';

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
    // Load initial data
    context.read<AttendanceBloc>().add(const LoadAttendanceCalendarEvent());

    // Check face registration status after a short delay to ensure auth state is ready
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _checkFaceRegistrationStatus();
    });
  }

  void _checkFaceRegistrationStatus() {
    final authState = context.read<AuthBloc>().state;
    if (authState is AuthAuthenticated) {
      final user = authState.user;
      if (!user.isFaceRegistered) {
        // User doesn't have a registered face, prompt for registration
        _showFaceRegistrationPrompt();
      }
    }
  }

  void _showFaceRegistrationPrompt() {
    showDialog(
      context: context,
      barrierDismissible: false, // User must make a choice
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text(
            'Face Registration Required',
            style: TextStyle(fontWeight: FontWeight.bold, fontFamily: 'Roboto'),
          ),
          content: const Text(
            'To mark attendance, you need to register your face. This is a one-time setup for security purposes.',
            style: TextStyle(fontFamily: 'Roboto'),
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(context);
                // User can skip for now, but they won't be able to mark attendance
              },
              child: const Text(
                'Skip for Now',
                style: TextStyle(color: Colors.grey, fontFamily: 'Roboto'),
              ),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.pop(context);
                Navigator.pushNamed(context, FaceRegistrationScreen.routeName);
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF4A90E2),
                foregroundColor: Colors.white,
              ),
              child: const Text(
                'Register Face',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontFamily: 'Roboto',
                ),
              ),
            ),
          ],
        );
      },
    );
  }

  void _markAttendance() {
    final authState = context.read<AuthBloc>().state;
    if (authState is AuthAuthenticated) {
      final user = authState.user;
      if (!user.isFaceRegistered) {
        // User doesn't have a registered face, show registration prompt
        showDialog(
          context: context,
          builder: (BuildContext context) {
            return AlertDialog(
              title: const Text(
                'Face Registration Required',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontFamily: 'Roboto',
                ),
              ),
              content: const Text(
                'You need to register your face before marking attendance. This ensures secure attendance tracking.',
                style: TextStyle(fontFamily: 'Roboto'),
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text(
                    'Cancel',
                    style: TextStyle(fontFamily: 'Roboto'),
                  ),
                ),
                ElevatedButton(
                  onPressed: () {
                    Navigator.pop(context);
                    Navigator.pushNamed(
                      context,
                      FaceRegistrationScreen.routeName,
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF4A90E2),
                    foregroundColor: Colors.white,
                  ),
                  child: const Text(
                    'Register Face',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontFamily: 'Roboto',
                    ),
                  ),
                ),
              ],
            );
          },
        );
        return;
      }
    }

    // User has registered face, proceed with face verification
    Navigator.pushNamed(context, FaceVerificationScreen.routeName);
  }

  void _showAttendanceHistory() {
    // Navigate to attendance history screen
    Navigator.pushNamed(context, '/attendance-history');
  }

  void _scanQRCode() {
    final authState = context.read<AuthBloc>().state;
    if (authState is AuthAuthenticated) {
      final user = authState.user;
      if (!user.isFaceRegistered) {
        // User doesn't have a registered face, show registration prompt
        showDialog(
          context: context,
          builder: (BuildContext context) {
            return AlertDialog(
              title: const Text(
                'Face Registration Required',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontFamily: 'Roboto',
                ),
              ),
              content: const Text(
                'You need to register your face before using QR attendance. This ensures secure attendance tracking.',
                style: TextStyle(fontFamily: 'Roboto'),
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text(
                    'Cancel',
                    style: TextStyle(fontFamily: 'Roboto'),
                  ),
                ),
                ElevatedButton(
                  onPressed: () {
                    Navigator.pop(context);
                    Navigator.pushNamed(
                      context,
                      FaceRegistrationScreen.routeName,
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF4A90E2),
                    foregroundColor: Colors.white,
                  ),
                  child: const Text(
                    'Register Face',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontFamily: 'Roboto',
                    ),
                  ),
                ),
              ],
            );
          },
        );
        return;
      }
    }

    // User has registered face, proceed directly to QR scanner (alternative flow)
    Navigator.pushNamed(context, '/qr-scanner');
  }

  void _showProfile() {
    // Navigate to profile screen
    Navigator.pushNamed(context, '/profile');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(
        0xFFF5F5F5,
      ), // backgroundColor from design.json
      appBar: AppBar(
        title: const Text(
          'QuickMark',
          style: TextStyle(
            fontFamily: 'Roboto',
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        backgroundColor: const Color(
          0xFF4A90E2,
        ), // primaryColor from design.json
        elevation: 2,
        actions: [
          IconButton(
            icon: const Icon(Icons.person, color: Colors.white),
            onPressed: _showProfile,
            tooltip: 'Profile',
          ),
          IconButton(
            icon: const Icon(Icons.logout, color: Colors.white),
            onPressed: () {
              context.read<AuthBloc>().add(const LogoutEvent());
            },
            tooltip: 'Logout',
          ),
        ],
      ),
      body: BlocListener<AuthBloc, AuthState>(
        listener: (context, state) {
          if (state is AuthUnauthenticated) {
            Navigator.pushReplacementNamed(context, '/login');
          }
        },
        child: RefreshIndicator(
          onRefresh: () async {
            context.read<AttendanceBloc>().add(
              const LoadAttendanceCalendarEvent(),
            );
          },
          color: const Color(0xFF4A90E2),
          child: BlocBuilder<AuthBloc, AuthState>(
            builder: (context, authState) {
              if (authState is AuthAuthenticated) {
                return _buildAuthenticatedView(authState);
              }
              return _buildLoadingView();
            },
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _markAttendance,
        backgroundColor: const Color(
          0xFF50E3C2,
        ), // accentColor from design.json
        foregroundColor: Colors.white,
        elevation: 4,
        icon: const Icon(Icons.face_outlined),
        label: const Text(
          'Mark Attendance',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            fontFamily: 'Roboto',
          ),
        ),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerFloat,
    );
  }

  Widget _buildAuthenticatedView(AuthAuthenticated authState) {
    return SingleChildScrollView(
      physics: const AlwaysScrollableScrollPhysics(),
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Welcome Header
          _buildWelcomeHeader(authState.user),

          const SizedBox(height: 20),

          // Student Information Card
          StudentInfoCard(user: authState.user),

          const SizedBox(height: 16),

          // Attendance Statistics Card
          BlocBuilder<AttendanceBloc, AttendanceState>(
            builder: (context, attendanceState) {
              if (attendanceState is AttendanceCalendarLoaded) {
                return AttendanceStatsCard(
                  attendanceRecords: attendanceState.records,
                );
              }
              return const AttendanceStatsCard(attendanceRecords: []);
            },
          ),

          const SizedBox(height: 16),

          // Quick Actions Card
          QuickActionsCard(
            onMarkAttendance: _markAttendance,
            onViewHistory: _showAttendanceHistory,
            onViewProfile: _showProfile,
            onScanQR: _scanQRCode,
          ),

          const SizedBox(height: 16),

          // Recent Activity Section
          _buildRecentActivitySection(),

          const SizedBox(height: 100), // Space for FAB
        ],
      ),
    );
  }

  Widget _buildWelcomeHeader(user) {
    final now = DateTime.now();
    final hour = now.hour;
    String greeting;

    if (hour < 12) {
      greeting = 'Good Morning';
    } else if (hour < 17) {
      greeting = 'Good Afternoon';
    } else {
      greeting = 'Good Evening';
    }

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [
            Color(0xFF4A90E2), // primaryColor
            Color(0xFF357ABD), // darker shade
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(
          12,
        ), // card borderRadius from design.json
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 8,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            greeting,
            style: const TextStyle(
              fontSize: 16,
              color: Colors.white70,
              fontFamily: 'Roboto',
            ),
          ),
          const SizedBox(height: 4),
          Text(
            user.name,
            style: const TextStyle(
              fontSize: 24, // headline fontSize from design.json
              fontWeight: FontWeight.bold,
              color: Colors.white,
              fontFamily: 'Roboto',
            ),
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              const Icon(Icons.badge, color: Colors.white70, size: 16),
              const SizedBox(width: 4),
              Text(
                'Roll No: ${user.rollNumber}',
                style: const TextStyle(
                  fontSize: 14,
                  color: Colors.white70,
                  fontFamily: 'Roboto',
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildRecentActivitySection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Recent Activity',
          style: TextStyle(
            fontSize: 20, // title fontSize from design.json
            fontWeight: FontWeight.bold,
            color: Color(0xFF333333), // textColor from design.json
            fontFamily: 'Roboto',
          ),
        ),
        const SizedBox(height: 12),
        BlocBuilder<AttendanceBloc, AttendanceState>(
          builder: (context, state) {
            if (state is AttendanceLoading) {
              return _buildLoadingCard();
            } else if (state is AttendanceCalendarLoaded) {
              if (state.records.isEmpty) {
                return _buildEmptyActivityCard();
              }
              return _buildActivityList(state.records.take(3).toList());
            } else if (state is AttendanceError) {
              return _buildErrorCard(state.message);
            }
            return _buildEmptyActivityCard();
          },
        ),
      ],
    );
  }

  Widget _buildActivityList(List records) {
    return Card(
      elevation: 4, // card elevation from design.json
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(
          12,
        ), // card borderRadius from design.json
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: records.map<Widget>((record) {
            return Padding(
              padding: const EdgeInsets.symmetric(vertical: 8),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 20,
                    backgroundColor: record.present
                        ? const Color(0xFF50E3C2).withOpacity(
                            0.2,
                          ) // accentColor
                        : const Color(
                            0xFFD0021B,
                          ).withOpacity(0.2), // errorColor
                    child: Icon(
                      record.present ? Icons.check : Icons.close,
                      color: record.present
                          ? const Color(0xFF50E3C2)
                          : const Color(0xFFD0021B),
                      size: 20,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          record.subjectName ?? 'Unknown Subject',
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF333333),
                            fontFamily: 'Roboto',
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          record.facultyName ?? 'Unknown Faculty',
                          style: TextStyle(
                            fontSize: 14,
                            color: const Color(0xFF333333).withOpacity(0.7),
                            fontFamily: 'Roboto',
                          ),
                        ),
                      ],
                    ),
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        record.present ? 'Present' : 'Absent',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: record.present
                              ? const Color(0xFF50E3C2)
                              : const Color(0xFFD0021B),
                          fontFamily: 'Roboto',
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        '2 hours ago', // You can format the timestamp here
                        style: TextStyle(
                          fontSize: 12,
                          color: const Color(0xFF333333).withOpacity(0.5),
                          fontFamily: 'Roboto',
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            );
          }).toList(),
        ),
      ),
    );
  }

  Widget _buildLoadingCard() {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: const Padding(
        padding: EdgeInsets.all(40),
        child: Center(
          child: CircularProgressIndicator(color: Color(0xFF4A90E2)),
        ),
      ),
    );
  }

  Widget _buildEmptyActivityCard() {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(40),
        child: Center(
          child: Column(
            children: [
              Icon(Icons.history, size: 48, color: Colors.grey[400]),
              const SizedBox(height: 12),
              Text(
                'No recent activity',
                style: TextStyle(
                  fontSize: 16,
                  color: Colors.grey[600],
                  fontFamily: 'Roboto',
                ),
              ),
              const SizedBox(height: 4),
              Text(
                'Mark your first attendance!',
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.grey[500],
                  fontFamily: 'Roboto',
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildErrorCard(String message) {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Row(
          children: [
            const Icon(Icons.error_outline, color: Color(0xFFD0021B), size: 24),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                message,
                style: const TextStyle(
                  fontSize: 14,
                  color: Color(0xFFD0021B),
                  fontFamily: 'Roboto',
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLoadingView() {
    return const Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          CircularProgressIndicator(color: Color(0xFF4A90E2)),
          SizedBox(height: 16),
          Text(
            'Loading...',
            style: TextStyle(
              fontSize: 16,
              color: Color(0xFF333333),
              fontFamily: 'Roboto',
            ),
          ),
        ],
      ),
    );
  }
}
