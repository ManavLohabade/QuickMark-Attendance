const { pool } = require('../config/db');

// Create a new degree
const createDegree = async (name) => {
    const query = `INSERT INTO degrees (name) VALUES ($1) RETURNING *;`;
    const result = await pool.query(query, [name]);
    return result.rows[0];
};

// Get all degrees
const getAllDegrees = async () => {
    const query = `SELECT * FROM degrees ORDER BY name;`;
    const result = await pool.query(query);
    return result.rows;
};

// Get degree by ID
const getDegreeById = async (degreeId) => {
    const query = `SELECT * FROM degrees WHERE degree_id = $1;`;
    const result = await pool.query(query, [degreeId]);
    return result.rows[0];
};

// Update degree
const updateDegree = async (degreeId, name) => {
    const query = `UPDATE degrees SET name = $1, updated_at = CURRENT_TIMESTAMP WHERE degree_id = $2 RETURNING *;`;
    const result = await pool.query(query, [name, degreeId]);
    return result.rows[0];
};

// Delete degree
const deleteDegree = async (degreeId) => {
    const query = `DELETE FROM degrees WHERE degree_id = $1 RETURNING *;`;
    const result = await pool.query(query, [degreeId]);
    return result.rows[0];
};

// Link department to degree
const linkDepartmentToDegree = async (degreeId, departmentId) => {
    const query = `INSERT INTO degree_departments (degree_id, department_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *;`;
    const result = await pool.query(query, [degreeId, departmentId]);
    return result.rows[0];
};

// Unlink department from degree
const unlinkDepartmentFromDegree = async (degreeId, departmentId) => {
    const query = `DELETE FROM degree_departments WHERE degree_id = $1 AND department_id = $2 RETURNING *;`;
    const result = await pool.query(query, [degreeId, departmentId]);
    return result.rows[0];
};

// Get departments for a degree
const getDepartmentsForDegree = async (degreeId) => {
    const query = `
        SELECT d.* FROM departments d
        JOIN degree_departments dd ON d.department_id = dd.department_id
        WHERE dd.degree_id = $1
        ORDER BY d.name;
    `;
    const result = await pool.query(query, [degreeId]);
    return result.rows;
};

// Get degrees for a department
const getDegreesForDepartment = async (departmentId) => {
    const query = `
        SELECT deg.* FROM degrees deg
        JOIN degree_departments dd ON deg.degree_id = dd.degree_id
        WHERE dd.department_id = $1
        ORDER BY deg.name;
    `;
    const result = await pool.query(query, [departmentId]);
    return result.rows;
};

module.exports = {
    createDegree,
    getAllDegrees,
    getDegreeById,
    updateDegree,
    deleteDegree,
    linkDepartmentToDegree,
    unlinkDepartmentFromDegree,
    getDepartmentsForDegree,
    getDegreesForDepartment
}; 