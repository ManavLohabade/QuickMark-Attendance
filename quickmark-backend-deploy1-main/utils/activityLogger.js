const { pool } = require('../config/db');

async function logFacultyActivity(faculty_id, action, details = {}) {
    const query = `
        INSERT INTO faculty_activity_logs (faculty_id, action, details)
        VALUES ($1, $2, $3)
    `;
    await pool.query(query, [faculty_id, action, details]);
}

module.exports = { logFacultyActivity };