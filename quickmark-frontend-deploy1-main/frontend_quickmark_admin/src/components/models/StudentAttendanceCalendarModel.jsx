import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Info } from 'lucide-react'; // Added Info icon
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Helper component to show attendance details in a tooltip
const AttendanceTooltip = ({ records }) => {
    if (!records || records.length === 0) return null;
    
    return (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-800 text-white text-xs rounded py-1 px-2 w-max max-w-xs z-50">
            {records.map((record, idx) => (
                <div key={idx} className="whitespace-nowrap">
                    {record.subject_name}: {record.attendance_status}
                    {record.attendance_status === 'late' && ` (${record.late_minutes} mins)`}
                </div>
            ))}
        </div>
    );
};

// Helper component to show attendance statistics
const AttendanceStats = ({ data }) => {
    if (!data || data.length === 0) return null;

    const stats = data.reduce((acc, record) => {
        if (record.attendance_status === 'present') acc.present++;
        else if (record.attendance_status === 'absent') acc.absent++;
        else if (record.attendance_status === 'late') acc.late++;
        return acc;
    }, { present: 0, absent: 0, late: 0 });

    const total = stats.present + stats.absent + stats.late;
    const attendancePercentage = total > 0 
        ? ((stats.present + stats.late) / total * 100).toFixed(1)
        : 0;

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm mb-4 grid grid-cols-4 gap-4">
            <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.present}</div>
                <div className="text-sm text-gray-600">Present</div>
            </div>
            <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
                <div className="text-sm text-gray-600">Absent</div>
            </div>
            <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.late}</div>
                <div className="text-sm text-gray-600">Late</div>
            </div>
            <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{attendancePercentage}%</div>
                <div className="text-sm text-gray-600">Attendance</div>
            </div>
        </div>
    );
};

// Helper component to render the calendar grid for a month
const CalendarGrid = ({ data }) => {
    const [hoveredDay, setHoveredDay] = useState(null);

    if (!data || data.length === 0) {
        return <p className="text-center text-gray-500 py-4">No attendance records found for this period.</p>;
    }

    const groupedByMonth = data.reduce((acc, record) => {
        const date = new Date(record.session_date);
        const yearMonth = `${date.getFullYear()}-${date.getMonth()}`;
        if (!acc[yearMonth]) {
            acc[yearMonth] = {
                name: date.toLocaleString('default', { month: 'long', year: 'numeric' }),
                days: {}
            };
        }
        const dayOfMonth = date.getDate();
        if (!acc[yearMonth].days[dayOfMonth]) {
            acc[yearMonth].days[dayOfMonth] = [];
        }
        acc[yearMonth].days[dayOfMonth].push(record);
        return acc;
    }, {});

    const sortedMonths = Object.keys(groupedByMonth).sort((a, b) => {
        const [y1, m1] = a.split('-').map(Number);
        const [y2, m2] = b.split('-').map(Number);
        if (y1 !== y2) return y1 - y2;
        return m1 - m2;
    });

    return (
        <div className="space-y-6">
            {sortedMonths.map(yearMonth => {
                const [year, monthIndex] = yearMonth.split('-').map(Number);
                const firstDayOfMonth = new Date(year, monthIndex, 1).getDay();
                const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

                return (
                    <div key={yearMonth} className="border p-4 rounded-lg shadow-sm">
                        <h4 className="font-semibold text-lg mb-4 text-center">{groupedByMonth[yearMonth].name}</h4>
                        <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium text-gray-600 mb-2">
                            <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
                        </div>
                        <div className="grid grid-cols-7 gap-1 text-center">
                            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                                <span key={`empty-pre-${yearMonth}-${i}`} className="p-1"></span>
                            ))}
                            {Array.from({ length: daysInMonth }).map((_, dayIndex) => {
                                const dayNum = dayIndex + 1;
                                const recordsForDay = groupedByMonth[yearMonth].days[dayNum] || [];
                                const hasPresent = recordsForDay.some(r => r.attendance_status === 'present');
                                const hasAbsent = recordsForDay.some(r => r.attendance_status === 'absent');
                                const hasLate = recordsForDay.some(r => r.attendance_status === 'late');

                                let bgColor = 'bg-gray-100';
                                let textColor = 'text-gray-800';
                                let hoverEffect = '';

                                if (hasPresent && !hasAbsent && !hasLate) {
                                    bgColor = 'bg-green-100';
                                    textColor = 'text-green-700';
                                } else if (hasAbsent && !hasPresent && !hasLate) {
                                    bgColor = 'bg-red-100';
                                    textColor = 'text-red-700';
                                } else if (hasLate && !hasAbsent) {
                                    bgColor = 'bg-yellow-100';
                                    textColor = 'text-yellow-700';
                                } else if (recordsForDay.length > 0) {
                                    bgColor = 'bg-blue-100';
                                    textColor = 'text-blue-700';
                                }

                                if (recordsForDay.length > 0) {
                                    hoverEffect = 'hover:ring-2 hover:ring-blue-400 cursor-pointer';
                                }

                                return (
                                    <div
                                        key={`day-${yearMonth}-${dayNum}`}
                                        className={`relative p-2 rounded-md ${bgColor} ${textColor} ${hoverEffect} transition-all duration-200`}
                                        onMouseEnter={() => setHoveredDay(`${yearMonth}-${dayNum}`)}
                                        onMouseLeave={() => setHoveredDay(null)}
                                    >
                                        <span className="relative z-10">{dayNum}</span>
                                        {recordsForDay.length > 0 && (
                                            <span className="absolute top-0 right-0 w-2 h-2 bg-blue-500 rounded-full"></span>
                                        )}
                                        {hoveredDay === `${yearMonth}-${dayNum}` && recordsForDay.length > 0 && (
                                            <AttendanceTooltip records={recordsForDay} />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

const StudentAttendanceCalendarModel = ({ studentId, studentName, onClose }) => {
    const [calendarData, setCalendarData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

    const getAdminToken = () => localStorage.getItem('adminToken');

    useEffect(() => {
        const fetchCalendarData = async () => {
            setLoading(true);
            setError('');
            try {
                const token = getAdminToken();
                if (!token) {
                    setError('Authentication required to view calendar.');
                    setLoading(false);
                    return;
                }
                const response = await axios.get(`http://localhost:3700/api/student/${studentId}/attendance/calendar?month=${currentMonth}&year=${currentYear}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCalendarData(response.data);
            } catch (err) {
                console.error('Error fetching student calendar data:', err.response ? err.response.data : err.message);
                setError(err.response?.data?.message || 'Failed to load attendance calendar.');
            } finally {
                setLoading(false);
            }
        };

        if (studentId) {
            fetchCalendarData();
        }
    }, [studentId, currentMonth, currentYear]);

    const handleMonthChange = (direction) => {
        let newMonth = currentMonth + direction;
        let newYear = currentYear;
        if (newMonth > 12) {
            newMonth = 1;
            newYear++;
        } else if (newMonth < 1) {
            newMonth = 12;
            newYear--;
        }
        setCurrentMonth(newMonth);
        setCurrentYear(newYear);
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4 border-b pb-3">
                    <h2 className="text-xl font-semibold">Attendance Calendar for {studentName || 'Student'}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100">
                        <X size={24} />
                    </button>
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-1">
                        <div className="w-4 h-4 bg-green-100 rounded"></div>
                        <span>Present</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-4 h-4 bg-red-100 rounded"></div>
                        <span>Absent</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-4 h-4 bg-yellow-100 rounded"></div>
                        <span>Late</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-4 h-4 bg-blue-100 rounded"></div>
                        <span>Mixed</span>
                    </div>
                </div>

                {/* Attendance Statistics */}
                <AttendanceStats data={calendarData} />

                {/* Month Navigation */}
                <div className="flex justify-between items-center mb-4">
                    <button 
                        onClick={() => handleMonthChange(-1)} 
                        className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <span className="text-lg font-bold">
                        {new Date(currentYear, currentMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </span>
                    <button 
                        onClick={() => handleMonthChange(1)} 
                        className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <div>Loading Calendar...</div>
                    </div>
                ) : error ? (
                    <div className="text-red-500 text-center py-8 bg-red-50 rounded-lg">
                        <Info size={24} className="mx-auto mb-2" />
                        Error: {error}
                    </div>
                ) : (
                    <CalendarGrid data={calendarData} />
                )}
            </div>
        </div>
    );
};

export default StudentAttendanceCalendarModel;