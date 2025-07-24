const userModel = require('../models/userModel');
const { hashPassword, comparePassword } = require('../utils/passwordHasher'); // Ensure comparePassword is imported
const { generateToken } = require('../config/jwt');

const registerFaculty = async (req, res) => {
    const { name, email, password, department_id } = req.body;
    if (!name || !email || !password || !department_id) {
        return res.status(400).json({ message: 'All fields are required.' });
    }
    try {
        const existingFaculty = await userModel.findFacultyByEmail(email);
        if (existingFaculty) {
            return res.status(409).json({ message: 'Faculty with this email already exists.' });
        }
        const hashedPassword = await hashPassword(password);
        const newFaculty = await userModel.createFaculty(name, email, hashedPassword, department_id);
        const token = generateToken({ id: newFaculty.faculty_id, email: newFaculty.email, role: 'faculty' });
        res.status(201).json({
            message: 'Faculty registered successfully!',
            faculty: {
                id: newFaculty.faculty_id,
                name: newFaculty.name,
                email: newFaculty.email
            },
            token
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Internal server error during registration.' });
    }
};

const loginFaculty = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }
    try {
        const faculty = await userModel.findFacultyByEmail(email);

        if (!faculty) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const isMatch = await comparePassword(password, faculty.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const token = generateToken({ id: faculty.faculty_id, email: faculty.email, role: 'faculty' });
        res.status(200).json({
            message: 'Logged in successfully!',
            faculty: {
                id: faculty.faculty_id,
                name: faculty.name,
                email: faculty.email
            },
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error during login.' });
    }
};

module.exports = {
    registerFaculty,
    loginFaculty
};