// lib/presentation/widgets/attendance_record_card.dart
import 'package:flutter/material.dart';
import '../../core/utils/app_theme.dart';

class AttendanceRecordCard extends StatelessWidget {
  final dynamic record;

  const AttendanceRecordCard({super.key, required this.record});

  @override
  Widget build(BuildContext context) {
    final bool isPresent = record.present ?? false;
    final Color statusColor = isPresent ? Colors.green : AppTheme.errorColor;

    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(
        side: BorderSide(color: statusColor.withOpacity(0.5), width: 1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            CircleAvatar(
              backgroundColor: statusColor.withOpacity(0.1),
              child: Icon(isPresent ? Icons.check : Icons.close, color: statusColor, size: 24),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    record.subjectName ?? 'Unknown Subject',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    record.facultyName ?? 'Unknown Faculty',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: Colors.grey[600]),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 16),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  _formatTime(record.time, context),
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 4),
                Text(isPresent ? 'Present' : 'Absent', style: TextStyle(color: statusColor, fontWeight: FontWeight.bold)),
              ],
            ),
          ],
        ),
      ),
    );
  }

  String _formatTime(dynamic time, BuildContext context) {
    if (time == null) return 'N/A';
    try {
      final dateTime = (time is String) ? DateTime.parse(time) : time as DateTime;
      return TimeOfDay.fromDateTime(dateTime).format(context);
    } catch (e) {
      return 'N/A';
    }
  }
}