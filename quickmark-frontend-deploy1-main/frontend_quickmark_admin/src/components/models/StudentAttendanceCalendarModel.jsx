import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { API_BASE_URL } from '../../utils/api';

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

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

                console.log('Fetching calendar data:', {
                    studentId,
                    month: currentMonth,
                    year: currentYear,
                    url: `${API_BASE_URL}/admin/student/${studentId}/attendance/calendar?month=${currentMonth}&year=${currentYear}`
                });

                const response = await axios.get(
                    `${API_BASE_URL}/admin/student/${studentId}/attendance/calendar?month=${currentMonth}&year=${currentYear}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                console.log('Calendar API response:', response.data);

                if (response.data && Array.isArray(response.data.records)) {
                    setCalendarData(response.data.records);
                } else {
                    console.error('Invalid response format:', response.data);
                    setError('Invalid data format received from server');
                }
            } catch (err) {
                console.error('Error fetching calendar data:', {
                    error: err,
                    response: err.response?.data,
                    status: err.response?.status
                });
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

    const renderAnalytics = () => {
        if (!calendarData || calendarData.length === 0) {
            return (
                <div className="grid grid-cols-3 gap-4 mb-6 text-center">
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-2xl font-bold text-gray-700">0</div>
                        <div className="text-sm text-gray-600">Total Classes</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                        <div className="text-2xl font-bold text-green-700">0%</div>
                        <div className="text-sm text-gray-600">Attendance</div>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4">
                        <div className="text-2xl font-bold text-red-700">0</div>
                        <div className="text-sm text-gray-600">Classes Missed</div>
                    </div>
                </div>
            );
        }

        const stats = calendarData.reduce((acc, record) => {
            if (record.status === 'present') acc.present++;
            else if (record.status === 'absent') acc.absent++;
            else if (record.status === 'late') acc.late++;
            return acc;
        }, { present: 0, absent: 0, late: 0 });

        const totalClasses = stats.present + stats.absent + stats.late;
        const attendancePercentage = totalClasses > 0 
            ? Math.round(((stats.present + stats.late) / totalClasses) * 100)
            : 0;

        return (
            <div className="grid grid-cols-3 gap-4 mb-6 text-center">
                <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-gray-700">{totalClasses}</div>
                    <div className="text-sm text-gray-600">Total Classes</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-700">{attendancePercentage}%</div>
                    <div className="text-sm text-gray-600">Attendance</div>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-red-700">{stats.absent}</div>
                    <div className="text-sm text-gray-600">Classes Missed</div>
                </div>
            </div>
        );
    };

    const renderCalendarGrid = () => {
        const firstDayIndex = new Date(currentYear, currentMonth - 1, 1).getDay();
        const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();

        // Create array for calendar days including empty cells for proper alignment
        const days = [];
        for (let i = 0; i < firstDayIndex; i++) {
            days.push(null); // Empty cells before first day
        }
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(i);
        }

        // Group attendance records by date
        const recordsByDate = calendarData.reduce((acc, record) => {
            const date = new Date(record.session_date);
            const dayKey = date.getDate();
            if (!acc[dayKey]) acc[dayKey] = [];
            acc[dayKey].push(record);
            return acc;
        }, {});

        return (
            <div className="grid grid-cols-7 gap-1">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                    <div key={`header-${index}`} className="text-center py-2 text-sm font-medium text-gray-600">
                        {day}
                    </div>
                ))}
                {days.map((day, index) => {
                    if (day === null) {
                        return <div key={`empty-${index}`} className="p-4"></div>;
                    }

                    const records = recordsByDate[day] || [];
                    let statusClass = '';
                    let dotColor = '';

                    if (records.length > 0) {
                        const statuses = records.map(r => r.status);
                        if (statuses.every(s => s === 'present')) {
                            statusClass = 'bg-green-50';
                            dotColor = 'bg-green-500';
                        } else if (statuses.every(s => s === 'absent')) {
                            statusClass = 'bg-red-50';
                            dotColor = 'bg-red-500';
                        } else if (statuses.every(s => s === 'late')) {
                            statusClass = 'bg-yellow-50';
                            dotColor = 'bg-yellow-500';
                        }
                    }

                    return (
                        <div
                            key={`day-${day}`}
                            className={`relative p-4 text-center ${statusClass} rounded-lg`}
                        >
                            <span className="text-sm">{day}</span>
                            {records.length > 0 && (
                                <span className={`absolute top-1 right-1 w-2 h-2 rounded-full ${dotColor}`}></span>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-semibold">
                        Attendance Calendar
                        <div className="text-sm text-gray-600 mt-1">{studentName}</div>
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6">
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        </div>
                    ) : error ? (
                        <div className="text-red-500 text-center py-8">
                            {error}
                        </div>
                    ) : (
                        <>
                            {renderAnalytics()}

                            <div className="flex justify-between items-center mb-6">
                                <button 
                                    onClick={() => handleMonthChange(-1)}
                                    className="p-2 hover:bg-gray-100 rounded-full"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <h2 className="text-lg font-semibold">
                                    {monthNames[currentMonth - 1]} {currentYear}
                                </h2>
                                <button 
                                    onClick={() => handleMonthChange(1)}
                                    className="p-2 hover:bg-gray-100 rounded-full"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>

                            {renderCalendarGrid()}
                            
                            <div className="flex justify-center gap-6 mt-6 text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-green-500"></span>
                                    <span>Present</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-red-500"></span>
                                    <span>Absent</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                                    <span>Late</span>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentAttendanceCalendarModel;