const attendanceModel = require('../models/attendanceModel');
const subjectModel = require('../models/subjectModel');
const studentModel = require('../models/studentModel');
const redisClient = require('../config/redis');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { logFacultyActivity } = require('../utils/activityLogger');
const { Pool } = require('pg');
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT, 10),
});

// Starts a new attendance session for a subject.
const startAttendanceSession = async (req, res) => {
    const { subject_id } = req.body;
    const facultyId = req.user.id;
    if (!subject_id) {
        return res.status(400).json({ message: 'Subject ID is required.' });
    }
    try {
        const isAssigned = await subjectModel.isFacultyAssignedToSubject(facultyId, subject_id);
        if (!isAssigned) {
            return res.status(403).json({ message: 'You are not authorized to start attendance for this subject.' });
        }
        
        const sessionDate = new Date().toISOString().split('T')[0];
        const startTime = new Date().toLocaleTimeString('en-US', { hour12: false });
        
        // Get subject code for QR generation
        const subjectCode = await subjectModel.getSubjectCode(subject_id);
        if (!subjectCode) {
            return res.status(400).json({ message: 'Subject code not found.' });
        }
        
        // Generate initial QR code with sequence 01
        const formattedDate = sessionDate.replace(/-/g, '').substring(4, 8); // Extract MM-DD from YYYY-MM-DD
        const initialQrCode = `${subjectCode}-${formattedDate}-01`;

        const newSession = await attendanceModel.createAttendanceSession(
            subject_id,
            facultyId,
            sessionDate,
            startTime,
            initialQrCode
        );

        res.status(201).json({
            message: 'Attendance session started successfully!',
            session: {
                ...newSession,
                current_qr: initialQrCode,
                subject_code: subjectCode
            }
        });
        await logFacultyActivity(facultyId, 'start_session', { subject_id });
    } catch (error) {
        console.error('Error starting attendance session:', error.message);
        res.status(500).json({ message: 'Internal server error starting session.' });
    }
};

// Generate next QR code for an active session
const generateNextQRCode = async (req, res) => {
    const { session_id } = req.params;
    const facultyId = req.user.id;
    
    try {
        const session = await attendanceModel.findSessionById(session_id);
        if (!session) {
            return res.status(404).json({ message: 'Attendance session not found.' });
        }
        
        if (session.status !== 'open') {
            return res.status(400).json({ message: 'Session is not active.' });
        }
        
        if (session.faculty_id !== facultyId) {
            return res.status(403).json({ message: 'You are not authorized to generate QR codes for this session.' });
        }
        
        // Get subject code
        const subjectCode = await subjectModel.getSubjectCode(session.subject_id);
        if (!subjectCode) {
            return res.status(400).json({ message: 'Subject code not found.' });
        }
        
        const nextQR = await attendanceModel.generateNextQRCode(session_id, subjectCode, session.session_date);
        
        res.status(200).json({
            message: 'Next QR code generated successfully!',
            qr_data: nextQR.qr_code,
            sequence_number: nextQR.sequence_number,
            expires_at: nextQR.expires_at
        });
    } catch (error) {
        console.error('Error generating next QR code:', error.message);
        res.status(500).json({ message: 'Internal server error generating QR code.' });
    }
};

// Ends an active attendance session.
const endAttendanceSession = async (req, res) => {
    const { session_id } = req.params;
    const facultyId = req.user.id;
    try {
        const session = await attendanceModel.findSessionById(session_id);

        if (!session || session.status !== 'open') {
            return res.status(404).json({ message: 'Active attendance session not found or already closed.' });
        }
        if (session.faculty_id !== facultyId) {
            return res.status(403).json({ message: 'You are not authorized to end this session.' });
        }

        const endTime = new Date().toLocaleTimeString('en-US', { hour12: false });
        const closedSession = await attendanceModel.closeAttendanceSession(session_id, endTime);

        res.status(200).json({
            message: 'Attendance session ended successfully!',
            session: closedSession
        });
        await logFacultyActivity(facultyId, 'end_session', { session_id });
    } catch (error) {
        console.error('Error in endAttendanceSession:', error.message);
        res.status(500).json({ message: 'Internal server error ending session.' });
    }
};

// Faculty manually marks a student's attendance.
const markStudentAttendance = async (req, res) => {
    const { session_id } = req.params;
    const { student_id, status } = req.body;
    const facultyId = req.user.id;

    if (!student_id || !status) {
        return res.status(400).json({ message: 'Student ID and status are required.' });
    }

    const validStatuses = ['present', 'absent', 'late'];
    if (!validStatuses.includes(status.toLowerCase())) {
        return res.status(400).json({ message: `Invalid status. Must be: ${validStatuses.join(', ')}` });
    }

    try {
        const session = await attendanceModel.findSessionById(session_id);
        if (!session) {
            return res.status(404).json({ message: 'Attendance session not found.' });
        }

        const isAssigned = await subjectModel.isFacultyAssignedToSubject(facultyId, session.subject_id);
        if (!isAssigned) {
            return res.status(403).json({ message: 'Forbidden: Not assigned to this subject.' });
        }

        const isStudentEnrolled = await studentModel.isStudentEnrolledInSubject(student_id, session.subject_id);
        if (!isStudentEnrolled) {
            return res.status(400).json({ message: 'Student not enrolled in this subject.' });
        }

        const attendedAt = new Date().toISOString();
        const record = await attendanceModel.createOrUpdateAttendanceRecord(
            session_id,
            student_id,
            status.toLowerCase(),
            attendedAt
        );

        res.status(200).json({ message: 'Attendance recorded.', record });

    } catch (error) {
        console.error('Error in markStudentAttendance:', error.message);
        res.status(500).json({ message: 'Internal server error while marking attendance.' });
    }
};

// Faculty view: Calendar-style attendance for a student
const getStudentCalendarAttendance = async (req, res) => {
    const { subject_id, student_id } = req.params;
    const { month, year } = req.query;
    const facultyId = req.user.id;

    if (!month || !year || isNaN(parseInt(month)) || isNaN(parseInt(year))) {
        return res.status(400).json({ message: 'Month and Year must be valid numbers.' });
    }

    const parsedMonth = parseInt(month);
    const parsedYear = parseInt(year);

    if (parsedMonth < 1 || parsedMonth > 12) {
        return res.status(400).json({ message: 'Month must be between 1 and 12.' });
    }

    if (parsedYear < 2000 || parsedYear > 2100) {
        return res.status(400).json({ message: 'Year out of range.' });
    }

    try {
        const isAssigned = await subjectModel.isFacultyAssignedToSubject(facultyId, subject_id);
        if (!isAssigned) {
            return res.status(403).json({ message: 'You are not assigned to this subject.' });
        }

        const isEnrolled = await studentModel.isStudentEnrolledInSubject(student_id, subject_id);
        if (!isEnrolled) {
            return res.status(404).json({ message: 'Student not enrolled.' });
        }

        const startDate = `${parsedYear}-${String(parsedMonth).padStart(2, '0')}-01`;
        const endDate = `${parsedYear}-${String(parsedMonth).padStart(2, '0')}-${new Date(parsedYear, parsedMonth, 0).getDate()}`;

        const records = await attendanceModel.getStudentAttendanceBySubjectAndDateRange(student_id, subject_id, startDate, endDate);
        const formattedCalendarData = {};
        // Analytics
        let totalSessions = 0, attendedSessions = 0, missedSessions = 0, lateSessions = 0;
        records.forEach(record => {
            const date = record.session_date.toISOString().split('T')[0];
            const status = record.attendance_status;
            formattedCalendarData[date] = status;
            totalSessions++;
            if (status === 'present') attendedSessions++;
            else if (status === 'absent') missedSessions++;
            else if (status === 'late') lateSessions++;
        });
        const attendancePercentage = totalSessions > 0 ? Math.round(((attendedSessions + lateSessions) / totalSessions) * 100) : 0;
        res.status(200).json({
            ...formattedCalendarData,
            totalSessions,
            attendedSessions,
            missedSessions,
            lateSessions,
            attendancePercentage
        });
    } catch (error) {
        console.error('Error in getStudentCalendarAttendance:', error.message);
        res.status(500).json({ message: 'Failed to fetch calendar attendance.' });
    }
};

// Admin view: Calendar-style attendance for any student (no faculty assignment check)
const getAdminStudentCalendarAttendance = async (req, res) => {
    const { subject_id, student_id } = req.params;
    const { month, year } = req.query;

    if (!month || !year || isNaN(parseInt(month)) || isNaN(parseInt(year))) {
        return res.status(400).json({ message: 'Month and Year must be valid numbers.' });
    }

    const parsedMonth = parseInt(month);
    const parsedYear = parseInt(year);

    if (parsedMonth < 1 || parsedMonth > 12) {
        return res.status(400).json({ message: 'Month must be between 1 and 12.' });
    }

    if (parsedYear < 2000 || parsedYear > 2100) {
        return res.status(400).json({ message: 'Year out of range.' });
    }

    try {
        // Check if student is enrolled in the subject
        const isEnrolled = await studentModel.isStudentEnrolledInSubject(student_id, subject_id);
        if (!isEnrolled) {
            return res.status(404).json({ message: 'Student not enrolled in this subject.' });
        }

        const startDate = `${parsedYear}-${String(parsedMonth).padStart(2, '0')}-01`;
        const endDate = `${parsedYear}-${String(parsedMonth).padStart(2, '0')}-${new Date(parsedYear, parsedMonth, 0).getDate()}`;

        const records = await attendanceModel.getStudentAttendanceBySubjectAndDateRange(student_id, subject_id, startDate, endDate);
        const formattedCalendarData = {};
        // Analytics
        let totalSessions = 0, attendedSessions = 0, missedSessions = 0, lateSessions = 0;
        records.forEach(record => {
            const date = record.session_date.toISOString().split('T')[0];
            const status = record.status;
            formattedCalendarData[date] = status;
            totalSessions++;
            if (status === 'present') attendedSessions++;
            else if (status === 'absent') missedSessions++;
            else if (status === 'late') lateSessions++;
        });
        const attendancePercentage = totalSessions > 0 ? Math.round(((attendedSessions + lateSessions) / totalSessions) * 100) : 0;
        res.status(200).json({
            ...formattedCalendarData,
            totalSessions,
            attendedSessions,
            missedSessions,
            lateSessions,
            attendancePercentage
        });
    } catch (error) {
        console.error('Error in getAdminStudentCalendarAttendance:', error.message);
        res.status(500).json({ message: 'Failed to fetch calendar attendance.' });
    }
};

// Student view: Get own calendar attendance for a subject
const getStudentOwnCalendarAttendance = async (req, res) => {
    const { subject_id } = req.params;
    const { month, year } = req.query;
    const studentId = req.user.id;

    if (!month || !year || isNaN(parseInt(month)) || isNaN(parseInt(year))) {
        return res.status(400).json({ message: 'Month and Year must be valid numbers.' });
    }

    const parsedMonth = parseInt(month);
    const parsedYear = parseInt(year);

    if (parsedMonth < 1 || parsedMonth > 12) {
        return res.status(400).json({ message: 'Month must be between 1 and 12.' });
    }

    if (parsedYear < 2000 || parsedYear > 2100) {
        return res.status(400).json({ message: 'Year out of range.' });
    }

    try {
        // Check if student is enrolled in the subject
        const isEnrolled = await studentModel.isStudentEnrolledInSubject(studentId, subject_id);
        if (!isEnrolled) {
            return res.status(404).json({ message: 'You are not enrolled in this subject.' });
        }

        const startDate = `${parsedYear}-${String(parsedMonth).padStart(2, '0')}-01`;
        const endDate = `${parsedYear}-${String(parsedMonth).padStart(2, '0')}-${new Date(parsedYear, parsedMonth, 0).getDate()}`;

        const records = await attendanceModel.getStudentAttendanceBySubjectAndDateRange(studentId, subject_id, startDate, endDate);
        
        // Format data for calendar display
        const calendarData = {
            attendedDays: [],
            missedDays: [],
            lateDays: [],
            totalSessions: 0,
            attendedSessions: 0,
            missedSessions: 0,
            lateSessions: 0
        };

        records.forEach(record => {
            const date = record.session_date;
            const status = record.status;
            
            if (status === 'present') {
                calendarData.attendedDays.push(date);
                calendarData.attendedSessions++;
            } else if (status === 'absent') {
                calendarData.missedDays.push(date);
                calendarData.missedSessions++;
            } else if (status === 'late') {
                calendarData.lateDays.push(date);
                calendarData.lateSessions++;
            }
            calendarData.totalSessions++;
        });

        // Calculate attendance percentage
        calendarData.attendancePercentage = calendarData.totalSessions > 0 
            ? Math.round(((calendarData.attendedSessions + calendarData.lateSessions) / calendarData.totalSessions) * 100)
            : 0;

        res.status(200).json(calendarData);

    } catch (error) {
        console.error('Error in getStudentOwnCalendarAttendance:', error.message);
        res.status(500).json({ message: 'Failed to fetch calendar attendance.' });
    }
};

// Manual override attendance for a specific date
const overrideAttendance = async (req, res) => {
    const { subject_id, student_id, date, status } = req.body;
    const faculty_id = req.user.faculty_id;

    console.log('Override request received:', {
        subject_id,
        student_id,
        date,
        status,
        faculty_id
    });

    if (!subject_id || !student_id || !date || !status) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    if (!['present', 'absent', 'late'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status. Must be present, absent, or late.' });
    }

    try {
        // Verify faculty teaches this subject
        const teacherQuery = `
            SELECT 1 FROM faculty_subjects 
            WHERE faculty_id = $1 AND subject_id = $2
        `;
        const teacherResult = await pool.query(teacherQuery, [faculty_id, subject_id]);

        if (teacherResult.rows.length === 0) {
            return res.status(403).json({ message: 'Not authorized to modify attendance for this subject' });
        }

        // Check if student is enrolled in the subject
        const enrollmentQuery = `
            SELECT 1 FROM enrollments 
            WHERE student_id = $1 AND subject_id = $2
        `;
        const enrollmentResult = await pool.query(enrollmentQuery, [student_id, subject_id]);

        if (enrollmentResult.rows.length === 0) {
            return res.status(400).json({ message: 'Student is not enrolled in this subject' });
        }

        // Get or create attendance session for the date
        let sessionQuery = `
            SELECT session_id FROM attendance_sessions 
            WHERE subject_id = $1 AND session_date = $2::date
        `;
        let session = await pool.query(sessionQuery, [subject_id, date]);

        let session_id;
        if (session.rows.length === 0) {
            // Create new session
            const newSessionQuery = `
                INSERT INTO attendance_sessions 
                (subject_id, faculty_id, session_date, start_time, end_time, status) 
                VALUES ($1, $2, $3::date, $4::time, $4::time, 'completed') 
                RETURNING session_id
            `;
            const now = new Date();
            const timeStr = now.toTimeString().split(' ')[0];
            const newSession = await pool.query(newSessionQuery, [subject_id, faculty_id, date, timeStr]);
            session_id = newSession.rows[0].session_id;
        } else {
            session_id = session.rows[0].session_id;
        }

        // Update or insert attendance record
        const upsertQuery = `
            INSERT INTO attendance_records 
            (session_id, student_id, status, attended_at, updated_at) 
            VALUES ($1, $2, $3::attendance_record_status, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
            ON CONFLICT (session_id, student_id) 
            DO UPDATE SET 
                status = $3::attendance_record_status,
                updated_at = CURRENT_TIMESTAMP
            RETURNING record_id
        `;
        const record = await pool.query(upsertQuery, [session_id, student_id, status]);

        // Log the manual override
        const logQuery = `
            INSERT INTO faculty_activity_logs 
            (faculty_id, action, details) 
            VALUES ($1, 'manual_override', $2)
        `;
        await pool.query(logQuery, [
            faculty_id,
            JSON.stringify({
                subject_id,
                student_id,
                date,
                status,
                session_id,
                record_id: record.rows[0].record_id
            })
        ]);

        console.log('Attendance override successful:', {
            session_id,
            record_id: record.rows[0].record_id,
            status
        });

        res.json({ 
            message: 'Attendance updated successfully',
            record_id: record.rows[0].record_id
        });
    } catch (error) {
        console.error('Error in manual override:', error);
        res.status(500).json({ message: 'Internal server error during attendance override' });
    }
};

// Submit/finalize attendance for a session with weight
const submitAttendance = async (req, res) => {
    const { session_id } = req.params;
    const { attendance_weight } = req.body;
    const facultyId = req.user.id;

    if (!attendance_weight || attendance_weight < 1 || attendance_weight > 6) {
        return res.status(400).json({ message: 'Attendance weight must be between 1 and 6.' });
    }

    try {
        const session = await attendanceModel.findSessionById(session_id);
        if (!session) {
            return res.status(404).json({ message: 'Attendance session not found.' });
        }

        // Allow submission for closed sessions (after end session)
        if (session.status !== 'open' && session.status !== 'closed') {
            return res.status(400).json({ message: 'Session is not in a valid state for submission.' });
        }

        if (session.faculty_id !== facultyId) {
            return res.status(403).json({ message: 'You are not authorized to submit attendance for this session.' });
        }

        // Update session with attendance weight and mark as submitted
        const updatedSession = await attendanceModel.submitAttendanceSession(session_id, attendance_weight);

        res.status(200).json({
            message: 'Attendance submitted successfully!',
            session: updatedSession
        });
        await logFacultyActivity(facultyId, 'submit_attendance', { session_id, weight: attendance_weight });
    } catch (error) {
        console.error('Error submitting attendance:', error.message);
        res.status(500).json({ message: 'Internal server error submitting attendance.' });
    }
};

// Verify session (QR scan) - issues a short-lived token after QR validation
const verifySession = async (req, res) => {
    const { qr_code_data } = req.body;
    const studentId = req.user.id;
    if (!qr_code_data) {
        console.log(`[verifySession] Missing QR code data | studentId: ${studentId} | time: ${new Date().toISOString()}`);
        return res.status(400).json({ message: 'QR code data is required.' });
    }
    try {
        // 1. Find the active session for this QR code
        const session = await attendanceModel.getActiveSessionByQRCode(qr_code_data);
        if (!session) {
            console.log(`[verifySession] Invalid/expired QR | studentId: ${studentId} | qr: ${qr_code_data} | time: ${new Date().toISOString()}`);
            return res.status(400).json({ message: 'Invalid or expired QR code.' });
        }
        // 2. Check if student is enrolled in the subject
        const isEnrolled = await attendanceModel.isStudentEnrolledInSubject(studentId, session.subject_id);
        if (!isEnrolled) {
            console.log(`[verifySession] Not enrolled | studentId: ${studentId} | subjectId: ${session.subject_id} | time: ${new Date().toISOString()}`);
            return res.status(403).json({ message: 'You are not enrolled in this subject.' });
        }
        // 3. Generate a short-lived JWT session token
        const jti = uuidv4();
        const payload = {
            studentId,
            sessionId: session.session_id,
            jti
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '10s', jwtid: jti });
        // 4. Store the token's jti in Redis as 'unused' with a 10s TTL
        await redisClient.setEx(`attendance_session_token:${jti}`, 10, 'unused');
        // 5. Log token issuance (simple analytics)
        console.log(`[verifySession] Token issued | studentId: ${studentId} | sessionId: ${session.session_id} | jti: ${jti} | time: ${new Date().toISOString()}`);
        // 6. Return the token
        return res.status(200).json({ verify_session_token: token, expires_in: 10 });
    } catch (error) {
        console.error(`[verifySession] Error | studentId: ${studentId} | error: ${error.message} | time: ${new Date().toISOString()}`);
        return res.status(500).json({ message: 'Internal server error during session verification.' });
    }
};

// Get live count of students who have marked attendance for a session
const getSessionLiveCount = async (req, res) => {
    const { session_id } = req.params;
    const facultyId = req.user.id;
    
    try {
        const session = await attendanceModel.findSessionById(session_id);
        if (!session) {
            return res.status(404).json({ message: 'Attendance session not found.' });
        }
        
        if (session.faculty_id !== facultyId) {
            return res.status(403).json({ message: 'You are not authorized to view this session.' });
        }
        
        const liveCount = await attendanceModel.getSessionLiveCount(session_id);
        
        res.status(200).json({
            session_id,
            total_students: liveCount.total_students,
            present_count: liveCount.present_count,
            absent_count: liveCount.absent_count,
            marked_count: liveCount.marked_count
        });
    } catch (error) {
        console.error('Error getting session live count:', error);
        res.status(500).json({ message: 'Internal server error getting live count.' });
    }
};

// Pause attendance session
const pauseAttendanceSession = async (req, res) => {
    const { session_id } = req.params;
    const facultyId = req.user.id;

    try {
        const session = await attendanceModel.findSessionById(session_id);
        if (!session) {
            return res.status(404).json({ message: 'Attendance session not found.' });
        }

        if (session.faculty_id !== facultyId) {
            return res.status(403).json({ message: 'You are not authorized to pause this session.' });
        }

        if (session.status !== 'open') {
            return res.status(400).json({ message: 'Session is not active.' });
        }

        const updatedSession = await attendanceModel.updateSessionStatus(session_id, 'paused');
        
        res.status(200).json({
            message: 'Session paused successfully!',
            session: updatedSession
        });
        await logFacultyActivity(facultyId, 'pause_session', { session_id });
    } catch (error) {
        console.error('Error pausing session:', error);
        res.status(500).json({ message: 'Internal server error pausing session.' });
    }
};

// Resume attendance session
const resumeAttendanceSession = async (req, res) => {
    const { session_id } = req.params;
    const facultyId = req.user.id;

    try {
        const session = await attendanceModel.findSessionById(session_id);
        if (!session) {
            return res.status(404).json({ message: 'Attendance session not found.' });
        }

        if (session.faculty_id !== facultyId) {
            return res.status(403).json({ message: 'You are not authorized to resume this session.' });
        }

        if (session.status !== 'paused') {
            return res.status(400).json({ message: 'Session is not paused.' });
        }

        const updatedSession = await attendanceModel.updateSessionStatus(session_id, 'open');
        
        res.status(200).json({
            message: 'Session resumed successfully!',
            session: updatedSession
        });
        await logFacultyActivity(facultyId, 'resume_session', { session_id });
    } catch (error) {
        console.error('Error resuming session:', error);
        res.status(500).json({ message: 'Internal server error resuming session.' });
    }
};

// Get override log/history for a subject/student
const getOverrideLog = async (req, res) => {
  const { subject_id, student_id } = req.query;
  try {
    const result = await pool.query(
      `SELECT * FROM faculty_activity_logs
       WHERE action = 'manual_override'
         AND details->>'subject_id' = $1
         AND details->>'student_id' = $2
       ORDER BY created_at DESC
       LIMIT 20`,
      [subject_id, student_id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch override log.' });
  }
};

module.exports = {
    startAttendanceSession,
    generateNextQRCode,
    endAttendanceSession,
    markStudentAttendance,
    getStudentCalendarAttendance,
    getAdminStudentCalendarAttendance,
    getStudentOwnCalendarAttendance,
    overrideAttendance,
    submitAttendance,
    verifySession,
    getSessionLiveCount,
    pauseAttendanceSession,  // Add this
    resumeAttendanceSession,  // Add this
    getOverrideLog
};
