// Defines API routes related to subjects (e.g., getting students for a subject).
const express = require('express');
const { getSubjectStudents, getSubjectStudentCount } = require('../controllers/subjectController');
const { authMiddleware } = require('../middleware/authMiddleware'); // Fixed: use destructuring

const router = express.Router();

router.get('/:subject_id/students', authMiddleware, getSubjectStudents); // Get students enrolled in a specific subject
router.get('/:subject_id/students/count', authMiddleware, getSubjectStudentCount); // <-- Add this line

module.exports = router;