import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Check, X } from 'lucide-react';
import { getStudentCalendarAttendance, overrideAttendance } from '../api/attendance';

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

// Manual Override Modal Component
const ManualOverrideModal = ({ isOpen, onClose, onSubmit, selectedDate, currentStatus, isLoading }) => {
    if (!isOpen || !selectedDate) return null;

    const formattedDate = new Date(selectedDate.year, selectedDate.month, selectedDate.day)
        .toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Manual Attendance Override</h3>
                    <button 
                        onClick={onClose} 
                        disabled={isLoading}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <X size={20} />
                    </button>
                </div>

                <p className="text-gray-600 mb-4">{formattedDate}</p>
                
                <div className="space-y-2">
                    <p className="text-sm text-gray-500 mb-2">
                        Current Status: <span className="capitalize">{currentStatus || 'Not marked'}</span>
                    </p>
                    <button
                        onClick={() => onSubmit('present')}
                        disabled={isLoading}
                        className={`w-full py-2 px-4 bg-green-500 text-white rounded hover:bg-green-600 mb-2 transition-colors
                            ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isLoading ? 'Updating...' : 'Mark as Present'}
                    </button>
                    <button
                        onClick={() => onSubmit('absent')}
                        disabled={isLoading}
                        className={`w-full py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600 mb-2 transition-colors
                            ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isLoading ? 'Updating...' : 'Mark as Absent'}
                    </button>
                    <button
                        onClick={() => onSubmit('late')}
                        disabled={isLoading}
                        className={`w-full py-2 px-4 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors
                            ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isLoading ? 'Updating...' : 'Mark as Late'}
                    </button>
                </div>
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
    const [showOverrideModal, setShowOverrideModal] = useState(false);
    const [overrideLoading, setOverrideLoading] = useState(false);

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
        const date = {
            day: day,
            month: currentDate.getMonth(),
            year: currentDate.getFullYear()
        };
        setSelectedDate(date);
        setShowOverrideModal(true);
    };
    
    const handleOverrideSubmit = async (status) => {
        if (!selectedDate || !subject?.subject_id || !student?.student_id || overrideLoading) return;

        setOverrideLoading(true);
        try {
            const date = `${selectedDate.year}-${String(selectedDate.month + 1).padStart(2, '0')}-${String(selectedDate.day).padStart(2, '0')}`;
            
            console.log('Submitting override:', {
                subject_id: subject.subject_id,
                student_id: student.student_id,
                date,
                status
            });

            await overrideAttendance(
                subject.subject_id,
                student.student_id,
                date,
                status
            );

            // Update local state
            setAttendanceData(prev => ({
                ...prev,
                [date]: status
            }));

            // Show success toast
            const toast = document.createElement('div');
            toast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg flex items-center z-50';
            toast.innerHTML = `
                <svg class="w-4 h-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                Attendance updated successfully
            `;
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);

            // Close modal
            setShowOverrideModal(false);
            setSelectedDate(null);

            // Refresh calendar data
            fetchAttendanceData();

        } catch (err) {
            console.error('Error overriding attendance:', err);
            setError('Failed to update attendance. Please try again.');
        } finally {
            setOverrideLoading(false);
        }
    };

    const getCurrentStatus = () => {
        if (!selectedDate) return null;
        const dateStr = `${selectedDate.year}-${String(selectedDate.month + 1).padStart(2, '0')}-${String(selectedDate.day).padStart(2, '0')}`;
        return attendanceData[dateStr] || null;
    };

    // --- RENDER LOGIC ---
    const renderCalendarGrid = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDayIndex = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const blanks = Array.from({ length: firstDayIndex }, (_, i) => (
            <div key={`blank-${i}`}></div>
        ));
        
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
            );
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

    const renderAnalytics = () => {
        if (!attendanceData || Object.keys(attendanceData).length === 0) {
            return (
                <div className="grid grid-cols-3 gap-4 mb-8 text-center">
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

        const stats = Object.values(attendanceData).reduce((acc, status) => {
            if (status === 'present') acc.present++;
            else if (status === 'absent') acc.absent++;
            else if (status === 'late') acc.late++;
            return acc;
        }, { present: 0, absent: 0, late: 0 });

        const totalClasses = stats.present + stats.absent + stats.late;
        const attendancePercentage = totalClasses > 0 
            ? Math.round(((stats.present + stats.late) / totalClasses) * 100)
            : 0;

        return (
            <div className="grid grid-cols-3 gap-4 mb-8 text-center">
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
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <>
                        {renderAnalytics()}

                        <div className="relative flex justify-between items-center mb-6 px-4">
                            <button onClick={goToPreviousMonth} className="p-2 rounded-full hover:bg-gray-100">
                                <ChevronLeft size={20}/>
                            </button>
                            <div className="text-center">
                                <button onClick={() => setShowPicker(!showPicker)} className="flex items-center gap-2 font-semibold text-lg p-2 rounded-md hover:bg-gray-100">
                                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                                    <CalendarIcon size={18} className="text-text-secondary"/>
                                </button>
                            </div>
                            <button onClick={goToNextMonth} className="p-2 rounded-full hover:bg-gray-100">
                                <ChevronRight size={20}/>
                            </button>
                            {showPicker && (
                                <MonthYearPicker 
                                    currentDate={currentDate} 
                                    onDateSelect={setCurrentDate} 
                                    onClose={() => setShowPicker(false)} 
                                />
                            )}
                        </div>

                        <div className="grid grid-cols-7 gap-y-2 text-center text-sm">
                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                                <div key={`header-${index}`} className="font-medium text-text-secondary">
                                    {day}
                                </div>
                            ))}
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

                        {error && (
                            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
                                {error}
                            </div>
                        )}
                    </>
                )}
            </div>

            <ManualOverrideModal
                isOpen={showOverrideModal}
                onClose={() => {
                    if (!overrideLoading) {
                        setShowOverrideModal(false);
                        setSelectedDate(null);
                    }
                }}
                onSubmit={handleOverrideSubmit}
                selectedDate={selectedDate}
                currentStatus={getCurrentStatus()}
                isLoading={overrideLoading}
            />
        </div>
    );
};

export default Calendar;