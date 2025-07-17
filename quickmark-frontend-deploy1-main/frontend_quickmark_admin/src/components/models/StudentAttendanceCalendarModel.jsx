import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X } from 'lucide-react'; // Close icon
import { ChevronLeft, ChevronRight } from 'lucide-react'; // Navigation icons

// Helper component to render the calendar grid for a month
const CalendarGrid = ({ data }) => {
    if (!data || data.length === 0) {
        return <p className="text-center text-gray-500 py-4">No attendance records found for this period.</p>;
    }

    const groupedByMonth = data.reduce((acc, record) => {
        const date = new Date(record.session_date);
        const yearMonth = `${date.getFullYear()}-${date.getMonth()}`; // e.g., "2024-8" for Sept 2024
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
                const firstDayOfMonth = new Date(year, monthIndex, 1).getDay(); // 0 for Sunday, 6 for Saturday
                const daysInMonth = new Date(year, monthIndex + 1, 0).getDate(); // Last day of month

                return (
                    <div key={yearMonth} className="border p-4 rounded-lg shadow-sm">
                        <h4 className="font-semibold text-lg mb-4 text-center">{groupedByMonth[yearMonth].name}</h4>
                        <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium text-gray-600 mb-2">
                            <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
                        </div>
                        <div className="grid grid-cols-7 gap-1 text-center">
                            {/* Fill empty leading days */}
                            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                                <span key={`empty-pre-${yearMonth}-${i}`} className="p-1"></span>
                            ))}
                            {/* Render days with attendance */}
                            {Array.from({ length: daysInMonth }).map((_, dayIndex) => {
                                const dayNum = dayIndex + 1;
                                const recordsForDay = groupedByMonth[yearMonth].days[dayNum] || [];
                                const hasPresent = recordsForDay.some(r => r.attendance_status === 'present');
                                const hasAbsent = recordsForDay.some(r => r.attendance_status === 'absent' || r.attendance_status === 'late');

                                let bgColor = 'bg-gray-100'; // Default (no record or unhandled status)
                                let textColor = 'text-gray-800';

                                if (hasPresent && !hasAbsent) {
                                    bgColor = 'bg-green-100';
                                    textColor = 'text-green-700';
                                } else if (hasAbsent && !hasPresent) {
                                    bgColor = 'bg-red-100';
                                    textColor = 'text-red-700';
                                } else if (hasPresent && hasAbsent) { // Mixed status on the same day
                                    bgColor = 'bg-yellow-100';
                                    textColor = 'text-yellow-700';
                                }

                                return (
                                    <div key={`day-${yearMonth}-${dayNum}`} className={`p-1 rounded-md ${bgColor} ${textColor}`}>
                                        {dayNum}
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
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1); // 1-12
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

    const getAdminToken = () => localStorage.getItem('adminToken'); // Admin token for Admin view

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
    }, [studentId, currentMonth, currentYear]); // Refetch if studentId or month/year changes

    if (!studentId) return null; // Don't render if no studentId is passed

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
                    <h2 className="text-xl font-semibold">Attendance Calendar for {studentName || 'Student'} ({studentId})</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100">
                        <X size={24} />
                    </button>
                </div>

                {/* Month Navigation */}
                <div className="flex justify-between items-center mb-4">
                    <button onClick={() => handleMonthChange(-1)} className="p-2 rounded-full hover:bg-gray-200">
                        <ChevronLeft size={20} />
                    </button>
                    <span className="text-lg font-bold">
                        {new Date(currentYear, currentMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </span>
                    <button onClick={() => handleMonthChange(1)} className="p-2 rounded-full hover:bg-gray-200">
                        <ChevronRight size={20} />
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-8">Loading Calendar...</div>
                ) : error ? (
                    <div className="text-red-500 text-center py-8">Error: {error}</div>
                ) : (
                    <CalendarGrid data={calendarData} />
                )}
            </div>
        </div>
    );
};

export default StudentAttendanceCalendarModel;