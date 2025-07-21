import 'package:flutter/material.dart';

class AttendanceRecordCard extends StatelessWidget {
  final dynamic record;

  const AttendanceRecordCard({super.key, required this.record});

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            // Status Icon
            CircleAvatar(
              radius: 24,
              backgroundColor: record.present
                  ? const Color(0xFF50E3C2).withOpacity(0.2)
                  : const Color(0xFFD0021B).withOpacity(0.2),
              child: Icon(
                record.present ? Icons.check : Icons.close,
                color: record.present
                    ? const Color(0xFF50E3C2)
                    : const Color(0xFFD0021B),
                size: 20,
              ),
            ),

            const SizedBox(width: 16),

            // Subject and Faculty Info
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
                  const SizedBox(height: 4),
                  Text(
                    record.facultyName ?? 'Unknown Faculty',
                    style: TextStyle(
                      fontSize: 14,
                      color: const Color(0xFF333333).withOpacity(0.7),
                      fontFamily: 'Roboto',
                    ),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Icon(
                        Icons.access_time,
                        size: 14,
                        color: const Color(0xFF333333).withOpacity(0.5),
                      ),
                      const SizedBox(width: 4),
                      Text(
                        _formatTime(record.time),
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
            ),

            // Status and Additional Info
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: record.present
                        ? const Color(0xFF50E3C2).withOpacity(0.1)
                        : const Color(0xFFD0021B).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
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
                ),
                const SizedBox(height: 8),
                if (record.markedAt != null) ...[
                  Text(
                    'Marked at',
                    style: TextStyle(
                      fontSize: 10,
                      color: const Color(0xFF333333).withOpacity(0.5),
                      fontFamily: 'Roboto',
                    ),
                  ),
                  Text(
                    _formatTime(record.markedAt),
                    style: TextStyle(
                      fontSize: 12,
                      color: const Color(0xFF333333).withOpacity(0.7),
                      fontWeight: FontWeight.w600,
                      fontFamily: 'Roboto',
                    ),
                  ),
                ],
              ],
            ),
          ],
        ),
      ),
    );
  }

  String _formatTime(dynamic time) {
    if (time == null) return 'N/A';

    try {
      DateTime dateTime;
      if (time is String) {
        dateTime = DateTime.parse(time);
      } else if (time is DateTime) {
        dateTime = time;
      } else {
        return time.toString();
      }

      return '${dateTime.hour.toString().padLeft(2, '0')}:${dateTime.minute.toString().padLeft(2, '0')}';
    } catch (e) {
      return time.toString();
    }
  }
}
