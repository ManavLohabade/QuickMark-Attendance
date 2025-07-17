const degreeModel = require('../models/degreeModel');

// Create a new degree
const createDegree = async (req, res) => {
    try {
        const { name } = req.body;
        const degree = await degreeModel.createDegree(name);
        res.status(201).json(degree);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all degrees
const getAllDegrees = async (req, res) => {
    try {
        const degrees = await degreeModel.getAllDegrees();
        res.json(degrees);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get degree by ID
const getDegreeById = async (req, res) => {
    try {
        const { degreeId } = req.params;
        const degree = await degreeModel.getDegreeById(degreeId);
        if (!degree) return res.status(404).json({ error: 'Degree not found' });
        res.json(degree);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update degree
const updateDegree = async (req, res) => {
    try {
        const { degreeId } = req.params;
        const { name } = req.body;
        const degree = await degreeModel.updateDegree(degreeId, name);
        if (!degree) return res.status(404).json({ error: 'Degree not found' });
        res.json(degree);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete degree
const deleteDegree = async (req, res) => {
    try {
        const { degreeId } = req.params;
        const degree = await degreeModel.deleteDegree(degreeId);
        if (!degree) return res.status(404).json({ error: 'Degree not found' });
        res.json({ message: 'Degree deleted', degree });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Link department to degree
const linkDepartmentToDegree = async (req, res) => {
    try {
        const { degreeId, departmentId } = req.body;
        const link = await degreeModel.linkDepartmentToDegree(degreeId, departmentId);
        res.status(201).json(link);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Unlink department from degree
const unlinkDepartmentFromDegree = async (req, res) => {
    try {
        const { degreeId, departmentId } = req.body;
        const unlink = await degreeModel.unlinkDepartmentFromDegree(degreeId, departmentId);
        res.json(unlink);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get departments for a degree
const getDepartmentsForDegree = async (req, res) => {
    try {
        const { degreeId } = req.params;
        const departments = await degreeModel.getDepartmentsForDegree(degreeId);
        res.json(departments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get degrees for a department
const getDegreesForDepartment = async (req, res) => {
    try {
        const { departmentId } = req.params;
        const degrees = await degreeModel.getDegreesForDepartment(departmentId);
        res.json(degrees);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
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