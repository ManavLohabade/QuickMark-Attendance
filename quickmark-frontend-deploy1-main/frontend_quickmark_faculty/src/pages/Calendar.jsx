import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { getStudentCalendarAttendance } from '../api/attendance';

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
                        className={`p-2 rounded-md text-sm hover:bg-primary hover:text-white ${currentDate.getFullYear() === year && currentDate.getMonth() === index ? 'bg-primary text-white' : ''}`}
                    >
                        {name.substring(0, 3)}
                    </button>
                ))}
            </div>
        </div>
    );
};

// --- MAIN CALENDAR COMPONENT ---
const Calendar = ({ subject, student, onBack }) => {
    // --- STATE MANAGEMENT ---
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
        
        try {
            const data = await getStudentCalendarAttendance(
                subject.subject_id, 
                student.student_id, 
                month + 1, // API expects 1-based month
                year
            );
            setAttendanceData(data);
        } catch (err) {
            console.error('Error fetching attendance data:', err);
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

    // --- EVENT HANDLERS ---
    const goToPreviousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const handleDateClick = (day) => {
        if (!day) return;
        setSelectedDate({
            day: day,
            month: currentDate.getMonth(),
            year: currentDate.getFullYear()
        });
    };
    
    const handleManualMarking = () => {
        if (!selectedDate) return;
        
        const dateStr = `${selectedDate.year}-${String(selectedDate.month + 1).padStart(2, '0')}-${String(selectedDate.day).padStart(2, '0')}`;
        const currentStatus = attendanceData[dateStr];
        const newStatus = currentStatus === 'present' ? 'absent' : 'present';

        const updatedData = { ...attendanceData, [dateStr]: newStatus };
        setAttendanceData(updatedData);
        alert(`Marked student ${student.roll_number || student.rollNo} as ${newStatus} on ${dateStr}`);
    };

    // --- RENDER LOGIC ---
    const renderCalendarGrid = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDayIndex = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const blanks = Array.from({ length: firstDayIndex }, (_, i) => <div key={`blank-${i}`}></div>);
        
        const days = Array.from({ length: daysInMonth }, (_, i) => {
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

            let selectionStyle = '';
            if (selectedDate && selectedDate.day === day && selectedDate.month === month && selectedDate.year === year) {
                selectionStyle = 'ring-2 ring-primary ring-offset-2';
            }

            return (
                <div key={`day-${day}`} className="flex justify-center items-center">
                    <div
                        onClick={() => handleDateClick(day)}
                        className={`w-10 h-10 flex items-center justify-center rounded-full cursor-pointer transition-all duration-200 ${circleStyle} ${selectionStyle}`}
                    >
                        {day}
                    </div>
                </div>
            )
        });

        return [...blanks, ...days];
    };

    const getButtonState = () => {
        if (!selectedDate) return { text: 'Mark Present/Absent', disabled: true };
        const dateStr = `${selectedDate.year}-${String(selectedDate.month + 1).padStart(2, '0')}-${String(selectedDate.day).padStart(2, '0')}`;
        const status = attendanceData[dateStr];

        if (status === 'present') return { text: 'Mark as Absent', disabled: false };
        if (status === 'absent') return { text: 'Mark as Present', disabled: false };

        return { text: 'Mark Present/Absent', disabled: true };
    };

    const buttonState = getButtonState();

    if (!subject || !student) {
        return (
             <div className="text-center">
                <p>Loading student data...</p>
                <button onClick={onBack} className="mt-4 px-4 py-2 bg-primary text-white rounded-lg">Go Back</button>
            </div>
        )
    }

    // --- JSX ---
    return (
        <div className="w-full max-w-3xl mx-auto">
            <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
                <div>
                    <button onClick={onBack} className="flex items-center text-sm text-text-secondary hover:text-text-primary mb-2">
                        <ArrowLeft size={16} className="mr-2" />
                        Back to Subject Detail
                    </button>
                    <h2 className="text-3xl font-bold text-text-primary">
                        {subject.subject_name || subject.name} - {student.roll_number || student.rollNo}
                    </h2>
                    {student.name && <p className="text-text-secondary mt-1">{student.name}</p>}
                </div>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="relative flex justify-between items-center mb-6 px-4">
                    <button onClick={goToPreviousMonth} className="p-2 rounded-full hover:bg-gray-100"><ChevronLeft size={20}/></button>
                    <div className="text-center">
                         <button onClick={() => setShowPicker(!showPicker)} className="flex items-center gap-2 font-semibold text-lg p-2 rounded-md hover:bg-gray-100">
                             {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                             <CalendarIcon size={18} className="text-text-secondary"/>
                         </button>
                    </div>
                    <button onClick={goToNextMonth} className="p-2 rounded-full hover:bg-gray-100"><ChevronRight size={20}/></button>
                     {showPicker && <MonthYearPicker currentDate={currentDate} onDateSelect={setCurrentDate} onClose={() => setShowPicker(false)} />}
                </div>
                
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-7 gap-y-2 text-center text-sm">
                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => <div key={`header-${index}`} className="font-medium text-text-secondary">{day}</div>)}
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

            <div className="mt-8 text-center">
                 <button
                    onClick={handleManualMarking}
                    disabled={buttonState.disabled || loading}
                    className="w-full max-w-xs bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-dark transition-colors duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                    {buttonState.text}
                </button>
            </div>
        </div>
    );
};

export default Calendar;
