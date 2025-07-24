import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../bloc/attendance/attendance_bloc.dart';
import '../../bloc/attendance/attendance_event.dart';
import '../../bloc/attendance/attendance_state.dart';
import '../../widgets/attendance_record_card.dart';

class AttendanceHistoryScreen extends StatefulWidget {
  static const routeName = '/attendance-history';

  const AttendanceHistoryScreen({super.key});

  @override
  State<AttendanceHistoryScreen> createState() =>
      _AttendanceHistoryScreenState();
}

class _AttendanceHistoryScreenState extends State<AttendanceHistoryScreen> {
  int? _selectedSubjectId;
  String? _selectedMonth;

  final List<String> _months = [
    'All Months',
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  @override
  void initState() {
    super.initState();
    context.read<AttendanceBloc>().add(const LoadAttendanceCalendarEvent());
  }

  void _filterAttendance() {
    context.read<AttendanceBloc>().add(
      LoadAttendanceCalendarEvent(
        subjectId: _selectedSubjectId,
        startDate: _getStartDateForMonth(_selectedMonth),
        endDate: _getEndDateForMonth(_selectedMonth),
      ),
    );
  }

  String? _getStartDateForMonth(String? month) {
    if (month == null || month == 'All Months') return null;
    final now = DateTime.now();
    final monthIndex = _months.indexOf(month);
    if (monthIndex <= 0) return null;
    return DateTime(now.year, monthIndex, 1).toIso8601String();
  }

  String? _getEndDateForMonth(String? month) {
    if (month == null || month == 'All Months') return null;
    final now = DateTime.now();
    final monthIndex = _months.indexOf(month);
    if (monthIndex <= 0) return null;
    return DateTime(now.year, monthIndex + 1, 0).toIso8601String();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F5),
      appBar: AppBar(
        title: const Text(
          'Attendance History',
          style: TextStyle(
            fontFamily: 'Roboto',
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        backgroundColor: const Color(0xFF4A90E2),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list, color: Colors.white),
            onPressed: _showFilterDialog,
            tooltip: 'Filter',
          ),
        ],
      ),
      body: Column(
        children: [
          // Filter Summary
          if (_selectedSubjectId != null || _selectedMonth != null)
            _buildFilterSummary(),

          // Attendance List
          Expanded(
            child: BlocBuilder<AttendanceBloc, AttendanceState>(
              builder: (context, state) {
                if (state is AttendanceLoading) {
                  return _buildLoadingView();
                } else if (state is AttendanceCalendarLoaded) {
                  if (state.records.isEmpty) {
                    return _buildEmptyView();
                  }
                  return _buildAttendanceList(state.records);
                } else if (state is AttendanceError) {
                  return _buildErrorView(state.message);
                }
                return _buildEmptyView();
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterSummary() {
    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF4A90E2).withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: const Color(0xFF4A90E2).withValues(alpha: .3),
        ),
      ),
      child: Row(
        children: [
          const Icon(Icons.filter_list, color: Color(0xFF4A90E2), size: 20),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              'Filters: ${_selectedMonth ?? 'All Months'}${_selectedSubjectId != null ? ' • Subject Filter' : ''}',
              style: const TextStyle(
                fontSize: 14,
                color: Color(0xFF4A90E2),
                fontWeight: FontWeight.w600,
                fontFamily: 'Roboto',
              ),
            ),
          ),
          TextButton(
            onPressed: () {
              setState(() {
                _selectedSubjectId = null;
                _selectedMonth = null;
              });
              _filterAttendance();
            },
            child: const Text(
              'Clear',
              style: TextStyle(
                color: Color(0xFF4A90E2),
                fontWeight: FontWeight.bold,
                fontFamily: 'Roboto',
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAttendanceList(List records) {
    // Group records by date
    final Map<String, List> groupedRecords = {};
    for (final record in records) {
      final dateKey = _formatDate(record.date);
      if (!groupedRecords.containsKey(dateKey)) {
        groupedRecords[dateKey] = [];
      }
      groupedRecords[dateKey]!.add(record);
    }

    final sortedDates = groupedRecords.keys.toList()
      ..sort((a, b) => b.compareTo(a)); // Most recent first

    return RefreshIndicator(
      onRefresh: () async {
        context.read<AttendanceBloc>().add(const LoadAttendanceCalendarEvent());
      },
      color: const Color(0xFF4A90E2),
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: sortedDates.length,
        itemBuilder: (context, index) {
          final date = sortedDates[index];
          final dayRecords = groupedRecords[date]!;

          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Date Header
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 8),
                child: Text(
                  _formatDateHeader(date),
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF333333),
                    fontFamily: 'Roboto',
                  ),
                ),
              ),

              // Records for this date
              ...dayRecords.map(
                (record) => Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: AttendanceRecordCard(record: record),
                ),
              ),

              const SizedBox(height: 8),
            ],
          );
        },
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
            'Loading attendance history...',
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

  Widget _buildEmptyView() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.history, size: 80, color: Colors.grey[400]),
          const SizedBox(height: 16),
          Text(
            'No attendance records found',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.grey[600],
              fontFamily: 'Roboto',
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Start attending classes to see your records here',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey[500],
              fontFamily: 'Roboto',
            ),
          ),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            onPressed: () => Navigator.pop(context),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF4A90E2),
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            icon: const Icon(Icons.face),
            label: const Text(
              'Mark Attendance',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontFamily: 'Roboto',
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildErrorView(String message) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.error_outline, size: 80, color: Color(0xFFD0021B)),
          const SizedBox(height: 16),
          Text(
            'Error loading attendance',
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Color(0xFFD0021B),
              fontFamily: 'Roboto',
            ),
          ),
          const SizedBox(height: 8),
          Text(
            message,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey[600],
              fontFamily: 'Roboto',
            ),
          ),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            onPressed: () {
              context.read<AttendanceBloc>().add(
                const LoadAttendanceCalendarEvent(),
              );
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF4A90E2),
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            icon: const Icon(Icons.refresh),
            label: const Text(
              'Retry',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontFamily: 'Roboto',
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _showFilterDialog() {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        String? tempMonth = _selectedMonth;
        int? tempSubjectId = _selectedSubjectId;

        return StatefulBuilder(
          builder: (context, setDialogState) {
            return AlertDialog(
              title: const Text(
                'Filter Attendance',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontFamily: 'Roboto',
                ),
              ),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Month',
                    style: TextStyle(
                      fontWeight: FontWeight.w600,
                      fontFamily: 'Roboto',
                    ),
                  ),
                  const SizedBox(height: 8),
                  DropdownButtonFormField<String>(
                    value: tempMonth,
                    decoration: const InputDecoration(
                      border: OutlineInputBorder(),
                      hintText: 'Select month',
                    ),
                    items: _months.map((month) {
                      return DropdownMenuItem(
                        value: month == 'All Months' ? null : month,
                        child: Text(month),
                      );
                    }).toList(),
                    onChanged: (value) {
                      setDialogState(() {
                        tempMonth = value;
                      });
                    },
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'Subject (Optional)',
                    style: TextStyle(
                      fontWeight: FontWeight.w600,
                      fontFamily: 'Roboto',
                    ),
                  ),
                  const SizedBox(height: 8),
                  TextFormField(
                    decoration: const InputDecoration(
                      border: OutlineInputBorder(),
                      hintText: 'Enter subject ID (optional)',
                    ),
                    keyboardType: TextInputType.number,
                    initialValue: tempSubjectId?.toString(),
                    onChanged: (value) {
                      tempSubjectId = int.tryParse(value);
                    },
                  ),
                ],
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
                    setState(() {
                      _selectedMonth = tempMonth;
                      _selectedSubjectId = tempSubjectId;
                    });
                    _filterAttendance();
                    Navigator.pop(context);
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF4A90E2),
                    foregroundColor: Colors.white,
                  ),
                  child: const Text(
                    'Apply',
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
      },
    );
  }

  String _formatDate(dynamic date) {
    if (date is DateTime) {
      return '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';
    } else if (date is String) {
      return date.split('T')[0]; // Extract date part from ISO string
    }
    return date.toString();
  }

  String _formatDateHeader(String date) {
    try {
      final dateTime = DateTime.parse(date);
      final now = DateTime.now();
      final today = DateTime(now.year, now.month, now.day);
      final yesterday = today.subtract(const Duration(days: 1));
      final recordDate = DateTime(dateTime.year, dateTime.month, dateTime.day);

      if (recordDate == today) {
        return 'Today - ${_formatDisplayDate(dateTime)}';
      } else if (recordDate == yesterday) {
        return 'Yesterday - ${_formatDisplayDate(dateTime)}';
      } else {
        return _formatDisplayDate(dateTime);
      }
    } catch (e) {
      return date;
    }
  }

  String _formatDisplayDate(DateTime date) {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return '${date.day} ${months[date.month - 1]} ${date.year}';
  }
}
