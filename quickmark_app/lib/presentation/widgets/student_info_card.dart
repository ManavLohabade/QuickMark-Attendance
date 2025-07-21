import 'package:flutter/material.dart';

class StudentInfoCard extends StatelessWidget {
  final dynamic user;

  const StudentInfoCard({super.key, required this.user});

  @override
  Widget build(BuildContext context) {
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
                CircleAvatar(
                  radius: 30,
                  backgroundColor: const Color(0xFF4A90E2).withOpacity(0.1),
                  child: const Icon(
                    Icons.person,
                    size: 30,
                    color: Color(0xFF4A90E2), // primaryColor from design.json
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        user.name ?? 'Student Name',
                        style: const TextStyle(
                          fontSize: 20, // title fontSize from design.json
                          fontWeight: FontWeight.bold,
                          color: Color(
                            0xFF333333,
                          ), // textColor from design.json
                          fontFamily: 'Roboto',
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Roll No: ${user.rollNumber ?? 'N/A'}',
                        style: TextStyle(
                          fontSize: 14,
                          color: const Color(0xFF333333).withOpacity(0.7),
                          fontFamily: 'Roboto',
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: const Color(
                      0xFF50E3C2,
                    ).withOpacity(0.1), // accentColor
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Text(
                    'Active',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF50E3C2),
                      fontFamily: 'Roboto',
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            const Divider(color: Color(0xFFE0E0E0), thickness: 1),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: _buildInfoItem(
                    'Course',
                    user.course ?? 'N/A',
                    Icons.school,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: _buildInfoItem(
                    'Year',
                    user.year?.toString() ?? 'N/A',
                    Icons.calendar_today,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: _buildInfoItem(
                    'Section',
                    user.section ?? 'N/A',
                    Icons.group,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: _buildInfoItem(
                    'Semester',
                    user.semester?.toString() ?? 'N/A',
                    Icons.book,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoItem(String label, String value, IconData icon) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(icon, size: 16, color: const Color(0xFF4A90E2)),
            const SizedBox(width: 4),
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                color: const Color(0xFF333333).withOpacity(0.6),
                fontFamily: 'Roboto',
              ),
            ),
          ],
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: Color(0xFF333333),
            fontFamily: 'Roboto',
          ),
        ),
      ],
    );
  }
}
