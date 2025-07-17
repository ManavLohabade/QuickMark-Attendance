// src/pages/Calendar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { reportsAPI } from '../../utils/api';

// --- HELPER FUNCTIONS ---
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// --- SUB-COMPONENTS ---
const MonthYearPicker = ({ currentDate, onDateSelect, onClose }) => {
    const [year, setYear] = useState(currentDate.getFullYear());
    const pickerRef = useRef(null);

    // Close picker if clicked outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (pickerRef.current && !pickerRef.current.contains(event.target)) {
                onClose();
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [pickerRef, onClose]);

    const selectMonth = (monthIndex) => {
        onDateSelect(new Date(year, monthIndex, 1));
        onClose();
    };

    return (
        <div ref={pickerRef} className="absolute z-10 top-12 left-1/2 -translate-x-1/2 bg-white p-4 rounded-lg shadow-2xl border w-72">
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => setYear(year - 1)} className="p-2 rounded-full hover:bg-gray-100"><ChevronLeft size={20}/></button>
                <div className="font-semibold">{year}</div>
                <button onClick={() => setYear(year + 1)} className="p-2 rounded-full hover:bg-gray-100"><ChevronRight size={20}/></button>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center">
                {monthNames.map((name, index) => (
                    <button 
                        key={name}
                        onClick={() => selectMonth(index)}
                        className={`p-2 rounded-md text-sm hover:bg-blue-500 hover:text-white ${currentDate.getFullYear() === year && currentDate.getMonth() === index ? 'bg-blue-500 text-white' : ''}`}
                    >
                        {name.substring(0, 3)}
                    </button>
                ))}
            </div>
        </div>
    );
};

// --- MAIN CALENDAR COMPONENT ---
export default function Calendar({ subject, student, onBack }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [attendanceData, setAttendanceData] = useState({});
    const [selectedDate, setSelectedDate] = useState(null);
    const [showPicker, setShowPicker] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // --- FETCH ATTENDANCE DATA ---
    const fetchAttendanceData = async (month, year) => {
        if (!subject?.subject_id || !student?.student_id) return;
        
        setLoading(true);
        setError(null);
        
        console.log('🔍 Admin Calendar - Fetching data for:', {
            subject_id: subject.subject_id,
            student_id: student.student_id,
            month: month + 1,
            year: year
        });
        
        try {
            const data = await reportsAPI.getStudentCalendarAttendance(
                subject.subject_id, 
                student.student_id, 
                month + 1, // API expects 1-based month
                year
            );
            console.log('✅ Admin Calendar - Data received:', data);
            setAttendanceData(data);
        } catch (err) {
            console.error('❌ Admin Calendar - Error fetching attendance data:', err);
            setError(err.response?.data?.message || 'Failed to fetch attendance data');
            setAttendanceData({});
        } finally {
            setLoading(false);
        }
    };

    // Fetch data when component mounts or date changes
    useEffect(() => {
        fetchAttendanceData(currentDate.getMonth(), currentDate.getFullYear());
    }, [currentDate, subject?.subject_id, student?.student_id]);

    const goToPreviousMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const goToNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    const handleDateClick = (day) => { if (day) setSelectedDate({ day, month: currentDate.getMonth(), year: currentDate.getFullYear() }); };
    
    const handleManualMarking = () => {
        if (!selectedDate) return;
        const dateStr = `${selectedDate.year}-${String(selectedDate.month + 1).padStart(2, '0')}-${String(selectedDate.day).padStart(2, '0')}`;
        const newStatus = attendanceData[dateStr] === 'present' ? 'absent' : 'present';
        setAttendanceData({ ...attendanceData, [dateStr]: newStatus });
        alert(`Marked ${student.rollNo || student.roll_number} as ${newStatus} on ${dateStr}`);
    };

    const renderCalendarGrid = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDayIndex = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const blanks = Array(firstDayIndex).fill(null).map((_, i) => <div key={`blank-${i}`}></div>);
        const days = Array(daysInMonth).fill(null).map((_, i) => {
            const day = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const status = attendanceData[dateStr];
            
            let circleStyle = '';
            if (status === 'present') {
                circleStyle = 'bg-green-500 text-white';
            } else if (status === 'absent') {
                circleStyle = 'bg-red-500 text-white';
            } else if (status === 'late') {
                circleStyle = 'bg-yellow-500 text-white';
            } else {
                circleStyle = 'hover:bg-gray-200';
            }
            
            const isSelected = selectedDate && selectedDate.day === day && selectedDate.month === month && selectedDate.year === year;
            return (<div key={`day-${day}`} className="flex justify-center items-center"><div onClick={() => handleDateClick(day)} className={`w-10 h-10 flex items-center justify-center rounded-full cursor-pointer transition-all duration-200 ${circleStyle} ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}>{day}</div></div>);
        });
        return [...blanks, ...days];
    };

    const buttonState = (() => {
        if (!selectedDate) return { text: 'Select a Date to Mark', disabled: true };
        const dateStr = `${selectedDate.year}-${String(selectedDate.month + 1).padStart(2, '0')}-${String(selectedDate.day).padStart(2, '0')}`;
        return attendanceData[dateStr] === 'present' ? { text: 'Mark as Absent', disabled: false } : { text: 'Mark as Present', disabled: false };
    })();

    if (!subject || !student) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="w-full max-w-3xl mx-auto bg-white rounded-xl shadow-2xl p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <button onClick={onBack} className="flex items-center text-sm text-gray-600 hover:text-gray-800 mb-2">
                        <ArrowLeft size={16} className="mr-2" />
                        Back
                    </button>
                    <h2 className="text-3xl font-bold text-gray-800">
                        {student.name} ({student.rollNo || student.roll_number})
                    </h2>
                    <p className="text-gray-600 mt-1">{subject.name || subject.subject_name}</p>
                </div>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <div className="bg-white p-6 rounded-lg">
                <div className="relative flex justify-between items-center mb-6 px-4">
                    <button onClick={goToPreviousMonth} className="p-2 rounded-full hover:bg-gray-100"><ChevronLeft size={20}/></button>
                    <button onClick={() => setShowPicker(!showPicker)} className="flex items-center gap-2 font-semibold text-lg p-2 rounded-md hover:bg-gray-100">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}<CalendarIcon size={18} className="text-gray-500"/></button>
                    <button onClick={goToNextMonth} className="p-2 rounded-full hover:bg-gray-100"><ChevronRight size={20}/></button>
                    {showPicker && <MonthYearPicker currentDate={currentDate} onDateSelect={setCurrentDate} onClose={() => setShowPicker(false)} />}
                </div>
                
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-7 gap-y-2 text-center text-sm">
                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => <div key={`header-${index}`} className="font-medium text-gray-500">{day}</div>)}
                            {renderCalendarGrid()}
                        </div>
                        
                        <div className="mt-6 flex justify-center gap-6 text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                <span>Present</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                <span>Late</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                <span>Absent</span>
                            </div>
                        </div>
                    </>
                )}
            </div>
            
            <div className="mt-8 flex justify-center items-center gap-4">
                <button onClick={handleManualMarking} disabled={buttonState.disabled || loading} className="w-full max-w-xs bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300">{buttonState.text}</button>
                <button onClick={onBack} className="w-full max-w-xs bg-gray-200 text-gray-800 font-bold py-3 px-4 rounded-lg hover:bg-gray-300">Close</button>
            </div>
        </div>
    );
};
