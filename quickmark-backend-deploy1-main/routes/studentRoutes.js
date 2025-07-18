const express = require('express');
const {
    loginStudent,
    getMyStudentProfile,
    markAttendanceByLoggedInStudent,
    getStudentCalendar,
    registerStudent,
    getAllDepartmentsPublic,
    registerFace,
    upload,
    uploadStudentPhoto,
    getStudentPhotoHistory
} = require('../controllers/studentController');
const studentAuthMiddleware = require('../middleware/studentAuthMiddleware');
const adminAuthMiddleware = require('../middleware/adminAuthMiddleware');
const { requireAdminOrSelfStudent } = require('../middleware/accessControlMiddleware');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// Student Authentication (Public) - this is the dedicated student login endpoint
router.post('/auth/login', loginStudent);

// Student Registration (Public)
router.post('/auth/register', registerStudent);

// Register or update student face (public or protected as needed)
router.post('/:id/face', registerFace);

// Upload student photo
router.post('/students/:id/photo', authMiddleware, requireAdminOrSelfStudent, upload.single('photo'), uploadStudentPhoto);

// Get student photo history
router.get('/students/:id/photo-history', authMiddleware, requireAdminOrSelfStudent, getStudentPhotoHistory);

// Student Protected Routes (require student token)
router.get('/me', studentAuthMiddleware, getMyStudentProfile);
router.post('/attendance/mark', studentAuthMiddleware, markAttendanceByLoggedInStudent);
router.get('/attendance/calendar', studentAuthMiddleware, getStudentCalendar); // Route for calendar

// Public: Get all departments (for registration, etc.)
router.get('/departments', getAllDepartmentsPublic);

module.exports = router;