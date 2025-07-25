// lib/presentation/screens/attendance_history/attendance_history_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';
import '../../bloc/attendance/attendance.dart';
import '../../widgets/attendance_record_card.dart';
import '../../../core/utils/app_theme.dart';

class AttendanceHistoryScreen extends StatefulWidget {
  static const routeName = '/attendance-history';

  const AttendanceHistoryScreen({super.key});

  @override
  State<AttendanceHistoryScreen> createState() => _AttendanceHistoryScreenState();
}

class _AttendanceHistoryScreenState extends State<AttendanceHistoryScreen> {
  int? _selectedSubjectId;
  String? _selectedMonth;

  final List<String> _months = [
    'All Time', 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  @override
  void initState() {
    super.initState();
    _filterAttendance();
  }

  void _filterAttendance() {
    final now = DateTime.now();
    final monthIndex = _selectedMonth != null ? _months.indexOf(_selectedMonth!) : 0;
    final startDate = (monthIndex > 0) ? DateTime(now.year, monthIndex, 1) : null;
    final endDate = (monthIndex > 0) ? DateTime(now.year, monthIndex + 1, 0) : null;
    
    context.read<AttendanceBloc>().add(LoadAttendanceCalendarEvent(
        subjectId: _selectedSubjectId,
        startDate: startDate?.toIso8601String(),
        endDate: endDate?.toIso8601String(),
      ));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Attendance History'),
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list_alt),
            onPressed: _showFilterDialog,
            tooltip: 'Filter',
          ),
        ],
      ),
      body: Column(
        children: [
          if (_selectedSubjectId != null || (_selectedMonth != null && _selectedMonth != 'All Time'))
            _buildFilterSummary(),
          Expanded(
            child: BlocBuilder<AttendanceBloc, AttendanceState>(
              builder: (context, state) {
                if (state is AttendanceLoading) {
                  return const Center(child: CircularProgressIndicator());
                }
                if (state is AttendanceError) {
                  return _buildErrorView(state.message);
                }
                if (state is AttendanceCalendarLoaded) {
                  if (state.records.isEmpty) return _buildEmptyView();
                  return _buildAttendanceList(state.records);
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
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      color: AppTheme.primaryColor.withOpacity(0.1),
      child: Row(
        children: [
          Icon(Icons.filter_alt, color: AppTheme.primaryColor, size: 20),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              'Filters: ${_selectedMonth ?? 'All Time'}${_selectedSubjectId != null ? ' • Subject: $_selectedSubjectId' : ''}',
              style: TextStyle(color: AppTheme.primaryColor, fontWeight: FontWeight.w600),
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
            child: const Text('Clear'),
          ),
        ],
      ),
    );
  }

  Widget _buildAttendanceList(List records) {
    final Map<String, List> groupedRecords = {};
    for (final record in records) {
      final dateKey = DateFormat('yyyy-MM-dd').format(record.date);
      groupedRecords.putIfAbsent(dateKey, () => []).add(record);
    }
    
    final sortedDates = groupedRecords.keys.toList()..sort((a,b) => b.compareTo(a));

    return RefreshIndicator(
      onRefresh: () async => _filterAttendance(),
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: sortedDates.length,
        itemBuilder: (context, index) {
          final date = sortedDates[index];
          final dayRecords = groupedRecords[date]!;
          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 16.0, horizontal: 8.0),
                child: Text(
                  _formatDateHeader(date),
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
                ),
              ),
              ...dayRecords.map((record) => AttendanceRecordCard(record: record)),
            ],
          );
        },
      ),
    );
  }
  
  String _formatDateHeader(String dateStr) {
    final date = DateTime.parse(dateStr);
    final now = DateTime.now();
    if (date.year == now.year && date.month == now.month && date.day == now.day) {
      return 'Today - ${DateFormat.yMMMMd().format(date)}';
    }
    if (date.year == now.year && date.month == now.month && date.day == now.day - 1) {
      return 'Yesterday - ${DateFormat.yMMMMd().format(date)}';
    }
    return DateFormat.yMMMMd().format(date);
  }

  Widget _buildEmptyView() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.history_toggle_off, size: 80, color: Colors.grey[400]),
          const SizedBox(height: 16),
          Text('No Records Found', style: Theme.of(context).textTheme.headlineSmall),
          const SizedBox(height: 8),
          Text('Try adjusting your filters or mark attendance.', style: TextStyle(color: Colors.grey[600])),
        ],
      ),
    );
  }
  
  Widget _buildErrorView(String message) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.error_outline, size: 80, color: AppTheme.errorColor),
          const SizedBox(height: 16),
          Text('An Error Occurred', style: Theme.of(context).textTheme.headlineSmall),
          const SizedBox(height: 8),
          Text(message, textAlign: TextAlign.center, style: TextStyle(color: Colors.grey[600])),
           const SizedBox(height: 16),
          ElevatedButton.icon(
            onPressed: _filterAttendance,
            icon: const Icon(Icons.refresh),
            label: const Text('Retry'),
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
              title: const Text('Filter Attendance'),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  DropdownButtonFormField<String>(
                    value: tempMonth,
                    hint: const Text('Select Month'),
                    decoration: const InputDecoration(labelText: 'Month'),
                    items: _months.map((month) {
                      return DropdownMenuItem(value: month, child: Text(month));
                    }).toList(),
                    onChanged: (value) => setDialogState(() => tempMonth = value),
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    initialValue: tempSubjectId?.toString(),
                    decoration: const InputDecoration(labelText: 'Subject ID (optional)'),
                    keyboardType: TextInputType.number,
                    onChanged: (val) => tempSubjectId = int.tryParse(val),
                  ),
                ],
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('Cancel'),
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
                  child: const Text('Apply'),
                ),
              ],
            );
          },
        );
      },
    );
  }
}