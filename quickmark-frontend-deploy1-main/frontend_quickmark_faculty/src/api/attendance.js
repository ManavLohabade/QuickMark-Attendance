import { api } from '../utils/api';

// Start attendance session
export const startAttendanceSession = async (subjectId) => {
    try {
        const response = await api.post('/attendance/start', { subject_id: subjectId });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Generate next QR code for active session
export const generateNextQRCode = async (sessionId) => {
    try {
        const response = await api.post(`/attendance/${sessionId}/generate-qr`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// End attendance session
export const endAttendanceSession = async (sessionId) => {
    try {
        const response = await api.post(`/attendance/${sessionId}/end`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Get faculty attendance sessions
export const getFacultyAttendanceSessions = async (startDate = null, endDate = null) => {
    try {
        const params = {};
        if (startDate) params.start_date = startDate;
        if (endDate) params.end_date = endDate;
        
        const response = await api.get('/attendance/sessions', { params });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Mark student attendance manually
export const markStudentAttendance = async (sessionId, studentId, status) => {
    try {
        const response = await api.post(`/attendance/${sessionId}/mark`, {
            student_id: studentId,
            status: status
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Submit attendance with weight
export const submitAttendance = async (sessionId, attendanceWeight) => {
    try {
        const response = await api.post(`/attendance/${sessionId}/submit`, {
            attendance_weight: attendanceWeight
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Get student calendar attendance (for faculty viewing student attendance)
export const getStudentCalendarAttendance = async (subjectId, studentId, month, year) => {
    try {
        const response = await api.get(`/attendance/subjects/${subjectId}/students/${studentId}/calendar`, {
            params: { month, year }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};
