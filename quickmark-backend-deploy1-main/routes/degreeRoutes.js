const express = require('express');
const router = express.Router();
const degreeController = require('../controllers/degreeController');

// CRUD for degrees
router.post('/', degreeController.createDegree);
router.get('/', degreeController.getAllDegrees);
router.get('/:degreeId', degreeController.getDegreeById);
router.put('/:degreeId', degreeController.updateDegree);
router.delete('/:degreeId', degreeController.deleteDegree);

// Link/unlink departments
router.post('/link-department', degreeController.linkDepartmentToDegree);
router.post('/unlink-department', degreeController.unlinkDepartmentFromDegree);

// Get departments for a degree
router.get('/:degreeId/departments', degreeController.getDepartmentsForDegree);
// Get degrees for a department
router.get('/department/:departmentId', degreeController.getDegreesForDepartment);

module.exports = router; 