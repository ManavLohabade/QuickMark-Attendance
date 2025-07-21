import 'package:flutter/material.dart';

class AttendanceStatsCard extends StatelessWidget {
  final List<dynamic> attendanceRecords;

  const AttendanceStatsCard({super.key, required this.attendanceRecords});

  @override
  Widget build(BuildContext context) {
    final stats = _calculateStats();

    return Card(
      elevation: 4, // card elevation from design.json
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(
          12,
        ), // card borderRadius from design.json
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(
                  Icons.analytics,
                  color: Color(0xFF4A90E2), // primaryColor from design.json
                  size: 24,
                ),
                const SizedBox(width: 8),
                const Text(
                  'Attendance Statistics',
                  style: TextStyle(
                    fontSize: 20, // title fontSize from design.json
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF333333), // textColor from design.json
                    fontFamily: 'Roboto',
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            Row(
              children: [
                Expanded(
                  child: _buildStatItem(
                    'Total Classes',
                    stats['total'].toString(),
                    const Color(0xFF4A90E2),
                    Icons.class_,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: _buildStatItem(
                    'Present',
                    stats['present'].toString(),
                    const Color(0xFF50E3C2), // accentColor from design.json
                    Icons.check_circle,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: _buildStatItem(
                    'Absent',
                    stats['absent'].toString(),
                    const Color(0xFFD0021B), // errorColor from design.json
                    Icons.cancel,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: _buildStatItem(
                    'Percentage',
                    '${stats['percentage'].toStringAsFixed(1)}%',
                    _getPercentageColor(stats['percentage']),
                    Icons.percent,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            _buildAttendanceBar(stats['percentage']),
          ],
        ),
      ),
    );
  }

  Map<String, dynamic> _calculateStats() {
    if (attendanceRecords.isEmpty) {
      return {'total': 0, 'present': 0, 'absent': 0, 'percentage': 0.0};
    }

    final total = attendanceRecords.length;
    final present = attendanceRecords
        .where((record) => record.present == true)
        .length;
    final absent = total - present;
    final percentage = total > 0 ? (present / total) * 100 : 0.0;

    return {
      'total': total,
      'present': present,
      'absent': absent,
      'percentage': percentage,
    };
  }

  Color _getPercentageColor(double percentage) {
    if (percentage >= 75) {
      return const Color(0xFF50E3C2); // accentColor - good
    } else if (percentage >= 50) {
      return const Color(0xFFF5A623); // warningColor - average
    } else {
      return const Color(0xFFD0021B); // errorColor - poor
    }
  }

  Widget _buildStatItem(
    String label,
    String value,
    Color color,
    IconData icon,
  ) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withValues(alpha: 0.3), width: 1),
      ),
      child: Column(
        children: [
          Icon(icon, color: color, size: 28),
          const SizedBox(height: 8),
          Text(
            value,
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: color,
              fontFamily: 'Roboto',
            ),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 12,
              color: const Color(0xFF333333).withValues(alpha: 0.7),
              fontFamily: 'Roboto',
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAttendanceBar(double percentage) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              'Overall Progress',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: Color(0xFF333333),
                fontFamily: 'Roboto',
              ),
            ),
            Text(
              '${percentage.toStringAsFixed(1)}%',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.bold,
                color: _getPercentageColor(percentage),
                fontFamily: 'Roboto',
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        Container(
          height: 8,
          decoration: BoxDecoration(
            color: Colors.grey[300],
            borderRadius: BorderRadius.circular(4),
          ),
          child: FractionallySizedBox(
            alignment: Alignment.centerLeft,
            widthFactor: percentage / 100,
            child: Container(
              decoration: BoxDecoration(
                color: _getPercentageColor(percentage),
                borderRadius: BorderRadius.circular(4),
              ),
            ),
          ),
        ),
        const SizedBox(height: 8),
        Text(
          _getAttendanceMessage(percentage),
          style: TextStyle(
            fontSize: 12,
            color: const Color(0xFF333333).withValues(alpha: 0.7),
            fontFamily: 'Roboto',
          ),
        ),
      ],
    );
  }

  String _getAttendanceMessage(double percentage) {
    if (percentage >= 75) {
      return 'Excellent attendance! Keep it up! 🎉';
    } else if (percentage >= 60) {
      return 'Good attendance, aim for 75% minimum.';
    } else if (percentage >= 50) {
      return 'Average attendance, needs improvement.';
    } else {
      return 'Poor attendance, immediate action required.';
    }
  }
}
