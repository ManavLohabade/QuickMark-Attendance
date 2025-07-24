// backend/controllers/facultyController.js

const userModel = require('../models/userModel'); // This is your 'faculty' model
const { hashPassword, comparePassword } = require('../utils/passwordHasher');
const { generateToken } = require('../config/jwt'); // Use the proper JWT import
const subjectModel = require('../models/subjectModel');
const adminModel = require('../models/adminModel');
const { logFacultyActivity } = require('../utils/activityLogger');

// Gets the profile of the authenticated faculty.
const getMyProfile = async (req, res) => {
    const facultyId = req.user.id; // From authMiddleware
    try {
        // Join with departments to get department name
        const result = await userModel.findFacultyWithDepartmentById(facultyId);
        if (!result) {
            return res.status(404).json({ message: 'Faculty profile not found.' });
        }
        // Exclude sensitive information like password_hash from the response
        const { password_hash, ...facultyWithoutHash } = result;
        res.status(200).json(facultyWithoutHash);
    } catch (error) {
        console.error('Error getting faculty profile:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// Updates the profile of the authenticated faculty.
const updateMyProfile = async (req, res) => {
    const facultyId = req.user.id;
    const updates = req.body;
    try {
        const updatedFaculty = await userModel.updateFacultyProfile(facultyId, updates);
        if (!updatedFaculty) {
            return res.status(400).json({ message: 'No valid fields provided for update or profile not found.' });
        }
        // Log the profile update
        await logFacultyActivity(facultyId, 'update_profile', updates);
        res.status(200).json({
            message: 'Profile updated successfully!',
            faculty: updatedFaculty
        });
    } catch (error) {
        console.error('Error updating faculty profile:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// Password validation rules
const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number');
    }
    if (!/[!@#$%^&*]/.test(password)) {
        errors.push('Password must contain at least one special character (!@#$%^&*)');
    }
    return errors;
};

// Changes the password of the authenticated faculty.
const changeMyPassword = async (req, res) => {
    const facultyId = req.user.id;
    const { current_password, new_password } = req.body;

    // Validate request
    if (!current_password || !new_password) {
        return res.status(400).json({ message: 'Current and new passwords are required.' });
    }

    // Validate new password strength
    const validationErrors = validatePassword(new_password);
    if (validationErrors.length > 0) {
        return res.status(400).json({ 
            message: 'Password does not meet requirements.',
            errors: validationErrors
        });
    }

    try {
        // Get faculty
        const faculty = await userModel.findFacultyById(facultyId);
        if (!faculty) {
            return res.status(404).json({ message: 'Faculty not found.' });
        }

        // Verify current password
        const isMatch = await comparePassword(current_password, faculty.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Current password is incorrect.' });
        }

        // Check if new password is same as current
        if (current_password === new_password) {
            return res.status(400).json({ message: 'New password must be different from current password.' });
        }

        // Hash new password
        const newHashedPassword = await hashPassword(new_password);

        // Update password with history check
        try {
            await userModel.updateFacultyPassword(facultyId, newHashedPassword);
        } catch (error) {
            if (error.message.includes('used recently')) {
                return res.status(400).json({ message: error.message });
            }
            throw error;
        }

        // Log the password change
        await logFacultyActivity(facultyId, 'change_password', {
            timestamp: new Date(),
            success: true
        });

        res.status(200).json({ message: 'Password updated successfully!' });
    } catch (error) {
        console.error('Error changing password:', error);
        
        // Log failed attempt
        await logFacultyActivity(facultyId, 'change_password', {
            timestamp: new Date(),
            success: false,
            error: error.message
        }).catch(console.error); // Don't let logging failure affect response

        res.status(500).json({ message: 'Internal server error during password change.' });
    }
};

// NEW: Faculty Login Function
const loginFaculty = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        // Find faculty by email
        const faculty = await userModel.findFacultyByEmail(email);

        if (!faculty) {
            // User not found
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // Compare provided password with hashed password from DB
        const isMatch = await comparePassword(password, faculty.password_hash);

        if (!isMatch) {
            // Passwords do not match
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // Generate JWT using the proper function
        const token = generateToken({ 
            id: faculty.faculty_id, 
            email: faculty.email, 
            role: 'faculty' 
        });

        // Log the login
        await logFacultyActivity(faculty.faculty_id, 'login', { email: faculty.email });

        // Send token and faculty details (excluding password hash)
        // Ensure you return all necessary faculty details for the frontend
        res.status(200).json({
            message: 'Login successful!',
            token,
            faculty: {
                id: faculty.faculty_id,
                name: faculty.name,
                email: faculty.email,
                department_id: faculty.department_id // Include this if needed on frontend
            }
        });

    } catch (error) {
        console.error('Error during faculty login:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// Get enrolled students for a subject (only if faculty is assigned to that subject)
const getSubjectStudents = async (req, res) => {
    const { subject_id } = req.params;
    const facultyId = req.user.id;
    
    try {
        // First check if faculty is assigned to this subject
        const isAssigned = await subjectModel.isFacultyAssignedToSubject(facultyId, subject_id);
        if (!isAssigned) {
            return res.status(403).json({ message: 'You are not assigned to this subject.' });
        }
        
        // Get enrolled students for this subject
        const enrollments = await adminModel.getSubjectEnrollments(subject_id);
        res.status(200).json({ students: enrollments });
    } catch (error) {
        console.error('Error getting subject students:', error);
        res.status(500).json({ message: 'Internal server error getting subject students.' });
    }
};

const getMyActivityLogs = async (req, res) => {
    const facultyId = req.user.id;
    const result = await pool.query(
        'SELECT * FROM faculty_activity_logs WHERE faculty_id = $1 ORDER BY created_at DESC LIMIT 100',
        [facultyId]
    );
    res.json(result.rows);
};

// Check password expiry status
const checkPasswordStatus = async (req, res) => {
    const facultyId = req.user.id;
    try {
        const status = await userModel.checkPasswordExpiry(facultyId);
        res.status(200).json(status);
    } catch (error) {
        console.error('Error checking password status:', error);
        res.status(500).json({ message: 'Internal server error checking password status.' });
    }
};

// Upload profile photo - simplified version
const uploadProfilePhoto = async (req, res) => {
    try {
        // Check if file exists
        if (!req.file) {
            return res.status(400).json({ message: 'Please select a photo to upload.' });
        }

        const facultyId = req.user.id;
        const photoUrl = `/uploads/faculty/photos/${req.file.filename}`;

        // Update faculty profile with new photo URL
        await userModel.updateFacultyProfile(facultyId, { photo_url: photoUrl });

        res.status(200).json({
            message: 'Profile photo updated successfully',
            photo_url: photoUrl
        });
    } catch (error) {
        console.error('Error uploading profile photo:', error);
        res.status(500).json({ message: 'Failed to upload profile photo.' });
    }
};

// Export all functions
module.exports = {
    getMyProfile,
    updateMyProfile,
    changeMyPassword,
    loginFaculty, // Make sure this is exported!
    getSubjectStudents,
    getMyActivityLogs,
    uploadProfilePhoto,
    checkPasswordStatus // Ensure this is exported
};