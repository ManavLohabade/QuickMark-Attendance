// Defines API routes for attendance management
const express = require('express');
const router = express.Router();

const {
    startAttendanceSession,
    generateNextQRCode,
    endAttendanceSession,
    markStudentAttendance,
    getStudentCalendarAttendance,
    getAdminStudentCalendarAttendance,
    overrideAttendance,
    submitAttendance,
    verifySession,
    getSessionLiveCount,
    pauseAttendanceSession,
    resumeAttendanceSession,
    getOverrideLog
} = require('../controllers/attendanceController');

const { authMiddleware } = require('../middleware/authMiddleware');
const { requireAdminOrFaculty, requireAdmin } = require('../middleware/accessControlMiddleware');

// Protect routes using appropriate middleware

// Override attendance – only Admin or Faculty can do this
router.post('/override', authMiddleware, overrideAttendance);

// Start a new attendance session (Admin or Faculty)
router.post('/start', authMiddleware, requireAdminOrFaculty, startAttendanceSession);

// Generate next QR code for active session (Faculty only)
router.post('/:session_id/generate-qr', authMiddleware, requireAdminOrFaculty, generateNextQRCode);

// End an attendance session (Admin or Faculty)
router.post('/:session_id/end', authMiddleware, requireAdminOrFaculty, endAttendanceSession);

// Submit attendance with weight (Faculty only)
router.post('/:session_id/submit', authMiddleware, requireAdminOrFaculty, submitAttendance);

// Pause attendance session (Faculty only)
router.post('/:session_id/pause', authMiddleware, requireAdminOrFaculty, pauseAttendanceSession);

// Resume attendance session (Faculty only)
router.post('/:session_id/resume', authMiddleware, requireAdminOrFaculty, resumeAttendanceSession);

// Get attendance data for student calendar view (Admin only - no assignment required)
router.get('/admin/subjects/:subject_id/students/:student_id/calendar', authMiddleware, requireAdmin, getAdminStudentCalendarAttendance);

// Get attendance data for student calendar view (Faculty only - requires assignment)
router.get('/subjects/:subject_id/students/:student_id/calendar', authMiddleware, requireAdminOrFaculty, getStudentCalendarAttendance);

// Verify session (QR scan) - issues a short-lived token after QR validation
router.post('/verify-session', authMiddleware, verifySession);

// Get live count for a session
router.get('/:session_id/live-count', authMiddleware, requireAdminOrFaculty, getSessionLiveCount);

// Get override log/history for a subject/student
router.get('/overrides', authMiddleware, requireAdminOrFaculty, getOverrideLog);


module.exports = router;
