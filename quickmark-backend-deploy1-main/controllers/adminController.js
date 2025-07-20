// backend/controllers/adminController.js

const adminModel = require('../models/adminModel');
const { comparePassword, hashPassword } = require('../utils/passwordHasher');
const { generateToken } = require('../config/jwt');
const archiver = require('archiver');
const PDFDocument = require('pdfkit');
const { bulkCreateStudents } = require('../models/studentModel');
const logger = require('../utils/logger');
const { bulkCreateFaculty, bulkCreateSubjects, bulkCreateDepartments, bulkCreateDegrees, logAdminAction } = require('../models/adminModel');
const pool = require('../config/db').pool;

// --- ADMIN AUTH ---
const registerAdmin = async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email, and password are required.' });
    }
    try {
        const existingAdmin = await adminModel.findAdminByEmail(email);
        if (existingAdmin) {
            return res.status(409).json({ message: 'Admin with this email already exists.' });
        }
        const hashedPassword = await hashPassword(password);
        const newAdmin = await adminModel.createAdmin(name, email, hashedPassword);
        const token = generateToken({ id: newAdmin.admin_id, email: newAdmin.email, isAdmin: true });
        res.status(201).json({
            message: 'Admin registered successfully!',
            admin: {
                id: newAdmin.admin_id,
                name: newAdmin.name,
                email: newAdmin.email
            },
            token
        });
    } catch (error) {
        console.error('Admin registration error:', error);
        res.status(500).json({ message: 'Internal server error during registration.' });
    }
};

const loginAdmin = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }
    try {
        const admin = await adminModel.findAdminByEmail(email);
        if (!admin) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }
        const isMatch = await comparePassword(password, admin.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }
        const token = generateToken({ id: admin.admin_id, email: admin.email, isAdmin: true });
        res.status(200).json({
            message: 'Logged in successfully!',
            admin: {
                id: admin.admin_id,
                name: admin.name,
                email: admin.email
            },
            token
        });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ message: 'Internal server error during login.' });
    }
};

// --- DEPARTMENTS ---
const getDepartments = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const degree_id = req.query.degree_id || null;
    try {
        const { departments, totalItems, totalPages, currentPage } = await adminModel.getAllDepartments(page, limit, degree_id);
        res.status(200).json({ departments, totalItems, totalPages, currentPage });
    } catch (error) {
        console.error('Error getting departments:', error);
        res.status(500).json({ message: 'Internal server error getting departments.' });
    }
};

const createDepartment = async (req, res) => {
    const adminId = req.user?.admin_id || req.user?.id || 'unknown';
    try {
    const { name, degree_id } = req.body;
    if (!name || !degree_id) {
        return res.status(400).json({ message: 'Department name and degree_id are required.' });
    }
        const newDepartment = await adminModel.createDepartment(name, degree_id);
        logger.info(`Admin ${adminId} created department ${newDepartment.department_id}`, {
            action: 'create', entity: 'department', entity_id: newDepartment.department_id, admin_id: adminId
        });
        await logAdminAction({
            admin_id: adminId,
            action: 'create',
            entity: 'department',
            entity_id: newDepartment.department_id,
            details: { name, degree_id }
        });
        res.status(201).json({ message: 'Department created successfully.', department: newDepartment });
    } catch (error) {
        logger.error(`Admin ${adminId} failed to create department: ${error.message}`, {
            action: 'create', entity: 'department', admin_id: adminId, error: error.message
        });
        await logAdminAction({
            admin_id: adminId,
            action: 'create',
            entity: 'department',
            entity_id: null,
            details: { error: error.message }
        });
        res.status(500).json({ message: 'Internal server error creating department.' });
    }
};

// Department update
const updateDepartment = async (req, res) => {
  const adminId = req.user?.admin_id || req.user?.id || 'unknown';
  try {
    const { department_id } = req.params;
    const { name, degree_id } = req.body;
        const updatedDepartment = await adminModel.updateDepartment(department_id, name, degree_id);
    logger.info(`Admin ${adminId} updated department ${department_id}`, {
      action: 'update', entity: 'department', entity_id: department_id, admin_id: adminId
    });
    await logAdminAction({
      admin_id: adminId,
      action: 'update',
      entity: 'department',
      entity_id: department_id,
      details: { name, degree_id }
    });
        res.status(200).json({ message: 'Department updated successfully.', department: updatedDepartment });
    } catch (error) {
    logger.error(`Admin ${adminId} failed to update department: ${error.message}`, {
      action: 'update', entity: 'department', admin_id: adminId, error: error.message
    });
    await logAdminAction({
      admin_id: adminId,
      action: 'update',
      entity: 'department',
      entity_id: req.params.department_id,
      details: { error: error.message }
    });
        res.status(500).json({ message: 'Internal server error updating department.' });
    }
};

const deleteDepartment = async (req, res) => {
  const adminId = req.user?.admin_id || req.user?.id || 'unknown';
  try {
    const { department_id } = req.params;
    await adminModel.deleteDepartment(department_id);
    logger.info(`Admin ${adminId} deleted department ${department_id}`, {
      action: 'delete', entity: 'department', entity_id: department_id, admin_id: adminId
    });
    await logAdminAction({
      admin_id: adminId,
      action: 'delete',
      entity: 'department',
      entity_id: department_id,
      details: {}
    });
        res.status(200).json({ message: 'Department deleted successfully.' });
    } catch (error) {
    logger.error(`Admin ${adminId} failed to delete department: ${error.message}`, {
      action: 'delete', entity: 'department', admin_id: adminId, error: error.message
    });
    await logAdminAction({
      admin_id: adminId,
      action: 'delete',
      entity: 'department',
      entity_id: req.params.department_id,
      details: { error: error.message }
    });
        res.status(500).json({ message: 'Internal server error deleting department.' });
    }
};

// --- FACULTY ---
const getFaculties = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    try {
        const { faculty, totalItems, totalPages, currentPage } = await adminModel.getAllFaculties(page, limit);
        res.status(200).json({ faculty, totalItems, totalPages, currentPage });
    } catch (error) {
        console.error('Error getting faculties:', error);
        res.status(500).json({ message: 'Internal server error getting faculties.' });
    }
};

const createFaculty = async (req, res) => {
    const adminId = req.user?.admin_id || req.user?.id || 'unknown';
    try {
    const { name, email, password, department_id, subject_ids } = req.body;
    if (!name || !email || !password || !department_id) {
        return res.status(400).json({ message: 'All faculty fields are required.' });
    }
        const newFaculty = await adminModel.createFacultyByAdmin(name, email, password, department_id, subject_ids || []);
        logger.info(`Admin ${adminId} created faculty ${newFaculty.faculty_id}`, {
            action: 'create', entity: 'faculty', entity_id: newFaculty.faculty_id, admin_id: adminId
        });
        res.status(201).json({ message: 'Faculty created successfully.', faculty: newFaculty });
    } catch (error) {
        console.error('Error creating faculty:', error);
        res.status(500).json({ message: 'Internal server error creating faculty.' });
    }
};

const updateFaculty = async (req, res) => {
    const adminId = req.user?.admin_id || req.user?.id || 'unknown';
    try {
    const { faculty_id } = req.params;
    const { name, email, department_id, designation } = req.body;
    if (!name || !email || !department_id) {
        return res.status(400).json({ message: 'Name, email, and department are required for update.' });
    }
        const updatedFaculty = await adminModel.updateFaculty(faculty_id, name, email, department_id, designation || 'Faculty');
        logger.info(`Admin ${adminId} updated faculty ${faculty_id}`, {
            action: 'update', entity: 'faculty', entity_id: faculty_id, admin_id: adminId
        });
        await logAdminAction({
            admin_id: adminId,
            action: 'update',
            entity: 'faculty',
            entity_id: faculty_id,
            details: { name, email, department_id, designation }
        });
        res.status(200).json({ message: 'Faculty updated successfully.', faculty: updatedFaculty });
    } catch (error) {
        console.error('Error updating faculty:', error);
        logger.error(`Admin ${adminId} failed to update faculty: ${error.message}`, {
            action: 'update', entity: 'faculty', admin_id: adminId, error: error.message
        });
        await logAdminAction({
            admin_id: adminId,
            action: 'update',
            entity: 'faculty',
            entity_id: req.params.faculty_id,
            details: { error: error.message }
        });
        res.status(500).json({ message: 'Internal server error updating faculty.' });
    }
};

const deleteFaculty = async (req, res) => {
    const adminId = req.user?.admin_id || req.user?.id || 'unknown';
    try {
        const { faculty_id } = req.params;
        await adminModel.deleteFaculty(faculty_id);
        logger.info(`Admin ${adminId} deleted faculty ${faculty_id}`, {
            action: 'delete', entity: 'faculty', entity_id: faculty_id, admin_id: adminId
        });
        await logAdminAction({
            admin_id: adminId,
            action: 'delete',
            entity: 'faculty',
            entity_id: faculty_id,
            details: {}
        });
        res.status(200).json({ message: 'Faculty deleted successfully.' });
    } catch (error) {
        console.error('Error deleting faculty:', error);
        logger.error(`Admin ${adminId} failed to delete faculty: ${error.message}`, {
            action: 'delete', entity: 'faculty', admin_id: adminId, error: error.message
        });
        await logAdminAction({
            admin_id: adminId,
            action: 'delete',
            entity: 'faculty',
            entity_id: req.params.faculty_id,
            details: { error: error.message }
        });
        res.status(500).json({ message: 'Internal server error deleting faculty.' });
    }
};

// --- STUDENTS ---
const getStudents = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const departmentId = req.query.departmentId || null;
    const year = req.query.year || null;
    const section = req.query.section || null;
    try {
        const { students, totalItems, totalPages, currentPage } = await adminModel.getAllStudents(page, limit, departmentId, year, section);
        res.status(200).json({ students, totalItems, totalPages, currentPage });
    } catch (error) {
        console.error('Error getting students:', error);
        res.status(500).json({ message: 'Internal server error getting students.' });
    }
};

const createStudent = async (req, res) => {
    const adminId = req.user?.admin_id || req.user?.id || 'unknown';
    try {
    const { roll_number, name, email, department_id, current_year, section } = req.body;
    console.log('Creating student with data:', { roll_number, name, email, department_id, current_year, section });
    console.log('Data types:', { 
        roll_number: typeof roll_number, 
        name: typeof name, 
        email: typeof email, 
        department_id: typeof department_id, 
        current_year: typeof current_year, 
        section: typeof section 
    });
    if (!roll_number || !name || !email || !department_id || !current_year || !section) {
        console.log('Missing required fields:', { roll_number: !!roll_number, name: !!name, email: !!email, department_id: !!department_id, current_year: !!current_year, section: !!section });
        return res.status(400).json({ message: 'All required student fields are missing.' });
    }
        const newStudent = await adminModel.createStudent(roll_number, name, email, department_id, current_year, section);
        logger.info(`Admin ${adminId} created student ${newStudent.student_id}`, {
            action: 'create', entity: 'student', entity_id: newStudent.student_id, admin_id: adminId
        });
        res.status(201).json({ message: 'Student created successfully.', student: newStudent });
    } catch (error) {
        console.error('Error creating student:', error);
        res.status(500).json({ message: 'Internal server error creating student.' });
    }
};

const updateStudent = async (req, res) => {
    const adminId = req.user?.admin_id || req.user?.id || 'unknown';
    try {
    const { student_id } = req.params;
    const { roll_number, name, email, department_id, current_year, section } = req.body;
    if (!roll_number || !name || !email || !department_id || !current_year || !section) {
        return res.status(400).json({ message: 'All required student fields are missing for update.' });
    }
        const updatedStudent = await adminModel.updateStudent(student_id, roll_number, name, email, department_id, current_year, section);
        logger.info(`Admin ${adminId} updated student ${student_id}`, {
            action: 'update', entity: 'student', entity_id: student_id, admin_id: adminId
        });
        await logAdminAction({
            admin_id: adminId,
            action: 'update',
            entity: 'student',
            entity_id: student_id,
            details: { roll_number, name, email, department_id, current_year, section }
        });
        res.status(200).json({ message: 'Student updated successfully.', student: updatedStudent });
    } catch (error) {
        console.error('Error updating student:', error);
        logger.error(`Admin ${adminId} failed to update student: ${error.message}`, {
            action: 'update', entity: 'student', admin_id: adminId, error: error.message
        });
        await logAdminAction({
            admin_id: adminId,
            action: 'update',
            entity: 'student',
            entity_id: req.params.student_id,
            details: { error: error.message }
        });
        res.status(500).json({ message: 'Internal server error updating student.' });
    }
};

const deleteStudent = async (req, res) => {
    const adminId = req.user?.admin_id || req.user?.id || 'unknown';
    try {
        const { student_id } = req.params;
        await adminModel.deleteStudent(student_id);
        logger.info(`Admin ${adminId} deleted student ${student_id}`, {
            action: 'delete', entity: 'student', entity_id: student_id, admin_id: adminId
        });
        await logAdminAction({
            admin_id: adminId,
            action: 'delete',
            entity: 'student',
            entity_id: student_id,
            details: {}
        });
        res.status(200).json({ message: 'Student deleted successfully.' });
    } catch (error) {
        console.error('Error deleting student:', error);
        logger.error(`Admin ${adminId} failed to delete student: ${error.message}`, {
            action: 'delete', entity: 'student', admin_id: adminId, error: error.message
        });
        await logAdminAction({
            admin_id: adminId,
            action: 'delete',
            entity: 'student',
            entity_id: req.params.student_id,
            details: { error: error.message }
        });
        res.status(500).json({ message: 'Internal server error deleting student.' });
    }
};

// --- SUBJECTS ---
const getSubjects = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const searchTerm = req.query.searchTerm || '';
    const filterYear = req.query.filterYear || '';
    const filterSection = req.query.filterSection || '';
    const filterSemester = req.query.filterSemester || '';
    const filterDepartmentId = req.query.filterDepartmentId || '';
    try {
        const { subjects, totalItems, totalPages, currentPage } = await adminModel.getAllSubjects(page, limit, searchTerm, filterYear, filterSection, filterSemester, filterDepartmentId);
        res.status(200).json({ subjects, totalItems, totalPages, currentPage });
    } catch (error) {
        console.error('Error getting subjects:', error);
        res.status(500).json({ message: 'Internal server error getting subjects.' });
    }
};

const createSubject = async (req, res) => {
    const adminId = req.user?.admin_id || req.user?.id || 'unknown';
    try {
    const { subject_name, subject_code, department_id, year, section, semester } = req.body;
    if (!subject_name || !subject_code || !department_id || !year || !section || typeof semester === 'undefined') {
        return res.status(400).json({ message: 'Subject name, subject code, department, year, section, and semester are required.' });
    }
        const newSubject = await adminModel.createSubject(subject_name, subject_code, department_id, year, section, semester);
        logger.info(`Admin ${adminId} created subject ${newSubject.subject_id}`, {
            action: 'create', entity: 'subject', entity_id: newSubject.subject_id, admin_id: adminId
        });
        res.status(201).json({ message: 'Subject created successfully.', subject: newSubject });
    } catch (error) {
        console.error('Error creating subject:', error);
        res.status(500).json({ message: 'Internal server error creating subject.' });
    }
};

const updateSubject = async (req, res) => {
    const adminId = req.user?.admin_id || req.user?.id || 'unknown';
    try {
    const { subject_id } = req.params;
        const { subject_name, subject_code, department_id, year, section, semester } = req.body;
    if (!subject_name || !department_id || !year || !section || typeof semester === 'undefined') {
        return res.status(400).json({ message: 'Subject name, department, year, section, and semester are required for update.' });
    }
        const updatedSubject = await adminModel.updateSubject(subject_id, subject_name, subject_code, department_id, year, section, semester);
        logger.info(`Admin ${adminId} updated subject ${subject_id}`, {
            action: 'update', entity: 'subject', entity_id: subject_id, admin_id: adminId
        });
        await logAdminAction({
            admin_id: adminId,
            action: 'update',
            entity: 'subject',
            entity_id: subject_id,
            details: { subject_name, subject_code, department_id, year, section, semester }
        });
        res.status(200).json({ message: 'Subject updated successfully.', subject: updatedSubject });
    } catch (error) {
        console.error('Error updating subject:', error);
        logger.error(`Admin ${adminId} failed to update subject: ${error.message}`, {
            action: 'update', entity: 'subject', admin_id: adminId, error: error.message
        });
        await logAdminAction({
            admin_id: adminId,
            action: 'update',
            entity: 'subject',
            entity_id: req.params.subject_id,
            details: { error: error.message }
        });
        res.status(500).json({ message: 'Internal server error updating subject.' });
    }
};

const deleteSubject = async (req, res) => {
    const adminId = req.user?.admin_id || req.user?.id || 'unknown';
    try {
        const { subject_id } = req.params;
        await adminModel.deleteSubject(subject_id);
        logger.info(`Admin ${adminId} deleted subject ${subject_id}`, {
            action: 'delete', entity: 'subject', entity_id: subject_id, admin_id: adminId
        });
        await logAdminAction({
            admin_id: adminId,
            action: 'delete',
            entity: 'subject',
            entity_id: subject_id,
            details: {}
        });
        res.status(200).json({ message: 'Subject deleted successfully.' });
    } catch (error) {
        console.error('Error deleting subject:', error);
        logger.error(`Admin ${adminId} failed to delete subject: ${error.message}`, {
            action: 'delete', entity: 'subject', admin_id: adminId, error: error.message
        });
        await logAdminAction({
            admin_id: adminId,
            action: 'delete',
            entity: 'subject',
            entity_id: req.params.subject_id,
            details: { error: error.message }
        });
        res.status(500).json({ message: 'Internal server error deleting subject.' });
    }
};

// --- SETTINGS ---
const getAttendanceThreshold = async (req, res) => {
    try {
        const threshold = await adminModel.getAppSetting('attendance_threshold');
        res.status(200).json({ threshold: threshold ? parseInt(threshold) : 75 });
    } catch (error) {
        console.error('Error getting settings:', error);
        res.status(500).json({ message: 'Internal server error getting settings.' });
    }
};

const updateAttendanceThreshold = async (req, res) => {
    const { threshold } = req.body;
    if (typeof threshold !== 'number' || threshold < 0 || threshold > 100) {
        return res.status(400).json({ message: 'Threshold must be a number between 0 and 100.' });
    }
    try {
        await adminModel.updateAppSetting('attendance_threshold', String(threshold), 'Minimum attendance percentage for defaulters');
        res.status(200).json({ message: 'Attendance threshold updated successfully.' });
    } catch (error) {
        console.error('Error updating threshold:', error);
        res.status(500).json({ message: 'Internal server error updating threshold.' });
    }
};

// --- REPORTS ---
const backupData = async (req, res) => {
    try {
        const tables = ['departments', 'faculties', 'students', 'subjects', 'enrollments', 'attendance_sessions', 'attendance_records', 'app_settings', 'admins'];
        const archive = archiver('zip');
        res.attachment('backup.zip');
        archive.pipe(res);

        for (const table of tables) {
            const result = await adminModel.getAllTableData(table);
            archive.append(JSON.stringify(result, null, 2), { name: `${table}.json` });
        }
        archive.finalize();
    } catch (error) {
        console.error('Error creating backup:', error);
        res.status(500).json({ message: 'Failed to create backup.' });
    }
};

const printAttendanceSheet = async (req, res) => {
    try {
        const doc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="attendance-sheet.pdf"');
        doc.pipe(res);

        doc.fontSize(20).text('Master Attendance Sheet', { align: 'center' });
        doc.moveDown();

        const students = await adminModel.getStudentsForAttendanceSheet();
        students.forEach((student, idx) => {
            doc.fontSize(12).text(`${idx + 1}. ${student.roll_number} - ${student.name}`);
        });

        doc.end();
    } catch (error) {
        console.error('Error generating attendance sheet:', error);
        res.status(500).json({ message: 'Internal server error generating attendance sheet.' });
    }
};

// --- DASHBOARD ---
const getDashboardStats = async (req, res) => {
    try {
        // Use the updated model function to get all stats including degrees
        const stats = await adminModel.getDashboardStats();
        const defaultersCount = await adminModel.countDefaulters();

        res.status(200).json({
            degrees: stats.total_degrees || 0,
            departments: stats.total_departments || 0,
            faculties: stats.total_faculties || 0,
            students: stats.total_students || 0,
            subjects: stats.total_subjects || 0,
            defaulters: defaultersCount || 0,
        });
    } catch (error) {
        console.error('Error getting dashboard stats:', error);
        res.status(500).json({ message: 'Internal server error getting dashboard stats.' });
    }
};

const getAttendanceStats = async (req, res) => {
    const startDate = req.query.startDate || null;
    const endDate = req.query.endDate || null;
    
    try {
        const stats = await adminModel.getAttendanceStats(startDate, endDate);
        res.status(200).json(stats);
    } catch (error) {
        console.error('Error getting attendance stats:', error);
        res.status(500).json({ message: 'Internal server error getting attendance stats.' });
    }
};

const getDefaultersList = async (req, res) => {
    const threshold = parseInt(req.query.threshold) || 75;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    try {
        const { defaulters, totalItems, totalPages, currentPage } = await adminModel.getDefaultersList(threshold, page, limit);
        res.status(200).json({ defaulters, totalItems, totalPages, currentPage });
    } catch (error) {
        console.error('Error getting defaulters list:', error);
        res.status(500).json({ message: 'Internal server error getting defaulters list.' });
    }
};

// --- FACULTY ASSIGNMENT MANAGEMENT ---
const assignSubjectToFaculty = async (req, res) => {
    const { faculty_id, subject_id } = req.body;
    if (!faculty_id || !subject_id) {
        return res.status(400).json({ message: 'Faculty ID and Subject ID are required.' });
    }
    try {
        await adminModel.assignSubjectToFaculty(faculty_id, subject_id);
        res.status(200).json({ message: 'Subject assigned to faculty successfully.' });
    } catch (error) {
        console.error('Error assigning subject to faculty:', error);
        res.status(500).json({ message: 'Internal server error assigning subject to faculty.' });
    }
};

const removeSubjectFromFaculty = async (req, res) => {
    console.log('removeSubjectFromFaculty called with body:', req.body);
    console.log('Request method:', req.method);
    console.log('Request headers:', req.headers);
    
    const { faculty_id, subject_id } = req.body;
    console.log('Extracted faculty_id:', faculty_id, 'subject_id:', subject_id);
    
    if (!faculty_id || !subject_id) {
        console.log('Missing required fields - faculty_id:', faculty_id, 'subject_id:', subject_id);
        return res.status(400).json({ message: 'Faculty ID and Subject ID are required.' });
    }
    try {
        console.log('Calling adminModel.removeSubjectFromFaculty with:', faculty_id, subject_id);
        await adminModel.removeSubjectFromFaculty(faculty_id, subject_id);
        console.log('Successfully removed subject from faculty');
        res.status(200).json({ message: 'Subject removed from faculty successfully.' });
    } catch (error) {
        console.error('Error removing subject from faculty:', error);
        res.status(500).json({ message: 'Internal server error removing subject from faculty.' });
    }
};

const getFacultyAssignments = async (req, res) => {
    const { faculty_id } = req.params;
    try {
        const assignments = await adminModel.getFacultyAssignments(faculty_id);
        res.status(200).json({ assignments });
    } catch (error) {
        console.error('Error getting faculty assignments:', error);
        res.status(500).json({ message: 'Internal server error getting faculty assignments.' });
    }
};

// --- STUDENT ENROLLMENT MANAGEMENT ---
const enrollStudentInSubject = async (req, res) => {
    const { student_id, subject_id } = req.body;
    if (!student_id || !subject_id) {
        return res.status(400).json({ message: 'Student ID and Subject ID are required.' });
    }
    try {
        await adminModel.enrollStudentInSubject(student_id, subject_id);
        res.status(200).json({ message: 'Student enrolled in subject successfully.' });
    } catch (error) {
        console.error('Error enrolling student in subject:', error);
        res.status(500).json({ message: 'Internal server error enrolling student in subject.' });
    }
};

const removeStudentFromSubject = async (req, res) => {
    const { student_id, subject_id } = req.body;
    if (!student_id || !subject_id) {
        return res.status(400).json({ message: 'Student ID and Subject ID are required.' });
    }
    try {
        await adminModel.removeStudentFromSubject(student_id, subject_id);
        res.status(200).json({ message: 'Student removed from subject successfully.' });
    } catch (error) {
        console.error('Error removing student from subject:', error);
        res.status(500).json({ message: 'Internal server error removing student from subject.' });
    }
};

const getStudentEnrollments = async (req, res) => {
    const { student_id } = req.params;
    try {
        const enrollments = await adminModel.getStudentEnrollments(student_id);
        res.status(200).json({ enrollments });
    } catch (error) {
        console.error('Error getting student enrollments:', error);
        res.status(500).json({ message: 'Internal server error getting student enrollments.' });
    }
};

const getSubjectEnrollments = async (req, res) => {
    const { subject_id } = req.params;
    try {
        const enrollments = await adminModel.getSubjectEnrollments(subject_id);
        res.status(200).json({ enrollments });
    } catch (error) {
        console.error('Error getting subject enrollments:', error);
        res.status(500).json({ message: 'Internal server error getting subject enrollments.' });
    }
};

const bulkImportStudents = async (req, res) => {
  const adminId = req.user?.admin_id || req.user?.id || 'unknown';
  try {
    const { students } = req.body;
    if (!Array.isArray(students)) {
      logger.warn(`Admin ${adminId} sent invalid students array to bulk import`, {
        action: 'bulk_import', entity: 'student', admin_id: adminId
      });
      return res.status(400).json({ error: 'students must be an array' });
    }
    const result = await bulkCreateStudents(students);
    logger.info(`Admin ${adminId} bulk imported students`, {
      action: 'bulk_import', entity: 'student', admin_id: adminId, result
    });
    await logAdminAction({
      admin_id: adminId,
      action: 'bulk_import',
      entity: 'student',
      entity_id: null,
      details: result
    });
    res.json(result);
  } catch (err) {
    logger.error(`Admin ${adminId} failed bulk import: ${err.message}`, {
      action: 'bulk_import', entity: 'student', admin_id: adminId, error: err.message
    });
    await logAdminAction({
      admin_id: adminId,
      action: 'bulk_import',
      entity: 'student',
      entity_id: null,
      details: { error: err.message }
    });
    res.status(500).json({ error: err.message || 'Bulk import failed' });
  }
};

// Bulk import faculty
const bulkImportFaculty = async (req, res) => {
  const adminId = req.user?.admin_id || req.user?.id || 'unknown';
  try {
    const { faculty } = req.body;
    if (!Array.isArray(faculty)) {
      logger.warn(`Admin ${adminId} sent invalid faculty array to bulk import`, {
        action: 'bulk_import', entity: 'faculty', admin_id: adminId
      });
      return res.status(400).json({ error: 'faculty must be an array' });
    }
    const result = await bulkCreateFaculty(faculty);
    logger.info(`Admin ${adminId} bulk imported faculty`, {
      action: 'bulk_import', entity: 'faculty', admin_id: adminId, result
    });
    await logAdminAction({
      admin_id: adminId,
      action: 'bulk_import',
      entity: 'faculty',
      entity_id: null,
      details: result
    });
    res.json(result);
  } catch (err) {
    logger.error(`Admin ${adminId} failed faculty bulk import: ${err.message}`, {
      action: 'bulk_import', entity: 'faculty', admin_id: adminId, error: err.message
    });
    await logAdminAction({
      admin_id: adminId,
      action: 'bulk_import',
      entity: 'faculty',
      entity_id: null,
      details: { error: err.message }
    });
    res.status(500).json({ error: err.message || 'Bulk import failed' });
  }
};

// Bulk import subjects
const bulkImportSubjects = async (req, res) => {
  const adminId = req.user?.admin_id || req.user?.id || 'unknown';
  try {
    const { subjects } = req.body;
    if (!Array.isArray(subjects)) {
      logger.warn(`Admin ${adminId} sent invalid subjects array to bulk import`, {
        action: 'bulk_import', entity: 'subject', admin_id: adminId
      });
      return res.status(400).json({ error: 'subjects must be an array' });
    }
    const result = await bulkCreateSubjects(subjects);
    logger.info(`Admin ${adminId} bulk imported subjects`, {
      action: 'bulk_import', entity: 'subject', admin_id: adminId, result
    });
    await logAdminAction({
      admin_id: adminId,
      action: 'bulk_import',
      entity: 'subject',
      entity_id: null,
      details: result
    });
    res.json(result);
  } catch (err) {
    logger.error(`Admin ${adminId} failed subjects bulk import: ${err.message}`, {
      action: 'bulk_import', entity: 'subject', admin_id: adminId, error: err.message
    });
    await logAdminAction({
      admin_id: adminId,
      action: 'bulk_import',
      entity: 'subject',
      entity_id: null,
      details: { error: err.message }
    });
    res.status(500).json({ error: err.message || 'Bulk import failed' });
  }
};

// Bulk import departments
const bulkImportDepartments = async (req, res) => {
  const adminId = req.user?.admin_id || req.user?.id || 'unknown';
  try {
    const { departments } = req.body;
    if (!Array.isArray(departments)) {
      logger.warn(`Admin ${adminId} sent invalid departments array to bulk import`, {
        action: 'bulk_import', entity: 'department', admin_id: adminId
      });
      return res.status(400).json({ error: 'departments must be an array' });
    }
    const result = await bulkCreateDepartments(departments);
    logger.info(`Admin ${adminId} bulk imported departments`, {
      action: 'bulk_import', entity: 'department', admin_id: adminId, result
    });
    await logAdminAction({
      admin_id: adminId,
      action: 'bulk_import',
      entity: 'department',
      entity_id: null,
      details: result
    });
    res.json(result);
  } catch (err) {
    logger.error(`Admin ${adminId} failed departments bulk import: ${err.message}`, {
      action: 'bulk_import', entity: 'department', admin_id: adminId, error: err.message
    });
    await logAdminAction({
      admin_id: adminId,
      action: 'bulk_import',
      entity: 'department',
      entity_id: null,
      details: { error: err.message }
    });
    res.status(500).json({ error: err.message || 'Bulk import failed' });
  }
};

// Bulk import degrees
const bulkImportDegrees = async (req, res) => {
  const adminId = req.user?.admin_id || req.user?.id || 'unknown';
  try {
    const { degrees } = req.body;
    if (!Array.isArray(degrees)) {
      logger.warn(`Admin ${adminId} sent invalid degrees array to bulk import`, {
        action: 'bulk_import', entity: 'degree', admin_id: adminId
      });
      return res.status(400).json({ error: 'degrees must be an array' });
    }
    const result = await bulkCreateDegrees(degrees);
    logger.info(`Admin ${adminId} bulk imported degrees`, {
      action: 'bulk_import', entity: 'degree', admin_id: adminId, result
    });
    await logAdminAction({
      admin_id: adminId,
      action: 'bulk_import',
      entity: 'degree',
      entity_id: null,
      details: result
    });
    res.json(result);
  } catch (err) {
    logger.error(`Admin ${adminId} failed degrees bulk import: ${err.message}`, {
      action: 'bulk_import', entity: 'degree', admin_id: adminId, error: err.message
    });
    await logAdminAction({
      admin_id: adminId,
      action: 'bulk_import',
      entity: 'degree',
      entity_id: null,
      details: { error: err.message }
    });
    res.status(500).json({ error: err.message || 'Bulk import failed' });
  }
};

// Fetch audit logs with optional filters
const getAuditLogs = async (req, res) => {
  const { action, entity, admin_id, start_date, end_date, limit = 100 } = req.query;
  let query = 'SELECT * FROM admin_action_logs WHERE 1=1';
  const params = [];
  let idx = 1;
  if (action) {
    query += ` AND action = $${idx++}`;
    params.push(action);
  }
  if (entity) {
    query += ` AND entity = $${idx++}`;
    params.push(entity);
  }
  if (admin_id) {
    query += ` AND admin_id = $${idx++}`;
    params.push(admin_id);
  }
  if (start_date) {
    query += ` AND created_at >= $${idx++}`;
    params.push(start_date);
  }
  if (end_date) {
    query += ` AND created_at <= $${idx++}`;
    params.push(end_date);
  }
  query += ` ORDER BY created_at DESC LIMIT $${idx}`;
  params.push(Number(limit));
  try {
    const result = await pool.query(query, params);
    res.json({ logs: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Error fetching audit logs' });
    }
};

// --- FACULTY ACTIVITY LOGS (ADMIN) ---
const getFacultyActivityLogs = async (req, res) => {
    const { faculty_id, action, from, to } = req.query;
    if (!faculty_id) {
        return res.status(400).json({ message: 'faculty_id is required' });
    }
    let query = 'SELECT * FROM faculty_activity_logs WHERE faculty_id = $1';
    const params = [faculty_id];
    let paramIndex = 2;
    if (action) {
        query += ` AND action = $${paramIndex++}`;
        params.push(action);
    }
    if (from) {
        query += ` AND created_at >= $${paramIndex++}`;
        params.push(from);
    }
    if (to) {
        query += ` AND created_at <= $${paramIndex++}`;
        params.push(to);
    }
    query += ' ORDER BY created_at DESC LIMIT 100';
    try {
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

module.exports = {
    registerAdmin,
    loginAdmin,
    getDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    getFaculties,
    createFaculty,
    updateFaculty,
    deleteFaculty,
    getStudents,
    createStudent,
    updateStudent,
    deleteStudent,
    getSubjects,
    createSubject,
    updateSubject,
    deleteSubject,
    getAttendanceThreshold,
    updateAttendanceThreshold,
    backupData,
    printAttendanceSheet,
    getDashboardStats,
    getAttendanceStats,
    getDefaultersList,
    assignSubjectToFaculty,
    removeSubjectFromFaculty,
    getFacultyAssignments,
    enrollStudentInSubject,
    removeStudentFromSubject,
    getStudentEnrollments,
    getSubjectEnrollments,
    bulkImportStudents,
    bulkImportFaculty,
    bulkImportSubjects,
    bulkImportDepartments,
    bulkImportDegrees,
    getAuditLogs,
    getFacultyActivityLogs
};