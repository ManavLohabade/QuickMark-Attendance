const express = require('express');
const multer = require('multer');
const path = require('path');
const { 
    loginFaculty, 
    getMyProfile, 
    updateMyProfile, 
    changeMyPassword, 
    getSubjectStudents,
    uploadProfilePhoto,
    checkPasswordStatus
} = require('../controllers/facultyController');
const { getFacultySubjects } = require('../models/userModel');
const { authMiddleware } = require('../middleware/authMiddleware');
const { requireFaculty } = require('../middleware/accessControlMiddleware');

// Make sure requireFaculty checks for req.user.role === 'faculty' in its implementation

// Simple multer setup for profile photos
const storage = multer.diskStorage({
    destination: 'uploads/faculty/photos/',
    filename: (req, file, cb) => {
        const uniqueName = `faculty-${Date.now()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only .jpg and .png files are allowed'));
        }
    }
});

const router = express.Router();

// Public routes
router.post('/login', loginFaculty);

// Protected routes
router.get('/me', authMiddleware, getMyProfile);
router.put('/me', authMiddleware, updateMyProfile);
router.put('/me/password', authMiddleware, changeMyPassword);
router.get('/me/password-status', authMiddleware, requireFaculty, checkPasswordStatus);

// Profile photo upload
router.post('/me/photo', authMiddleware, upload.single('photo'), uploadProfilePhoto);

// Faculty subject routes
router.get('/me/subjects', authMiddleware, requireFaculty, async (req, res) => {
    try {
        const subjects = await getFacultySubjects(req.user.id);
        res.status(200).json(subjects);
    } catch (error) {
        console.error('Error fetching faculty subjects:', error);
        res.status(500).json({ message: 'Failed to fetch faculty subjects.' });
    }
});

router.get('/subjects/:subject_id/students', authMiddleware, requireFaculty, getSubjectStudents);

module.exports = router;