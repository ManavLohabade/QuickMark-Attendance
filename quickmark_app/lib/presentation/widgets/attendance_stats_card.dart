// lib/presentation/widgets/attendance_stats_card.dart
// MODIFIED TO BE THEME-AWARE

import 'package:flutter/material.dart';

class AttendanceStatsCard extends StatelessWidget {
  final List<dynamic> attendanceRecords;

  const AttendanceStatsCard({super.key, required this.attendanceRecords});

  @override
  Widget build(BuildContext context) {
    final stats = _calculateStats();
    final theme = Theme.of(context); // Get the current theme

    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(
                  Icons.analytics_outlined,
                  color: theme.colorScheme.primary,
                  size: 24,
                ),
                const SizedBox(width: 8),
                 Text(
                  'Attendance Statistics',
                  style: theme.textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                    // ## FIX: Removed hardcoded dark color ##
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            Row(
              children: [
                Expanded(
                  child: _buildStatItem(
                    context,
                    'Total Classes',
                    stats['total'].toString(),
                    theme.colorScheme.secondary,
                    Icons.class_,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: _buildStatItem(
                    context,
                    'Present',
                    stats['present'].toString(),
                    Colors.green,
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
                    context,
                    'Absent',
                    stats['absent'].toString(),
                    theme.colorScheme.error,
                    Icons.cancel,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: _buildStatItem(
                    context,
                    'Percentage',
                    '${stats['percentage'].toStringAsFixed(1)}%',
                    _getPercentageColor(stats['percentage']),
                    Icons.percent,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            _buildAttendanceBar(context, stats['percentage']),
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
    final present =
        attendanceRecords.where((record) => record.present == true).length;
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
      return Colors.green;
    } else if (percentage >= 50) {
      return Colors.orange;
    } else {
      return Colors.red;
    }
  }

  Widget _buildStatItem(
    BuildContext context,
    String label,
    String value,
    Color color,
    IconData icon,
  ) {
    final theme = Theme.of(context);
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.3), width: 1),
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
            ),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            textAlign: TextAlign.center,
            style: theme.textTheme.bodySmall?.copyWith(
              // ## FIX: Using theme text color ##
              color: theme.textTheme.bodySmall?.color?.withOpacity(0.7),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAttendanceBar(BuildContext context, double percentage) {
    final theme = Theme.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
             Text(
              'Overall Progress',
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w600,
                // ## FIX: Removed hardcoded dark color ##
              ),
            ),
            Text(
              '${percentage.toStringAsFixed(1)}%',
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
                color: _getPercentageColor(percentage),
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        Container(
          height: 8,
          clipBehavior: Clip.antiAlias,
          decoration: BoxDecoration(
            color: theme.colorScheme.surfaceVariant,
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
          style: theme.textTheme.bodySmall?.copyWith(
            // ## FIX: Using theme text color ##
            color: theme.textTheme.bodySmall?.color?.withOpacity(0.7)
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