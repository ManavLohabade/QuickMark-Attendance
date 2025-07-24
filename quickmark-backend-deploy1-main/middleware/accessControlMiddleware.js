// This middleware assumes that authMiddleware.js has already run and attached req.user
// req.user should contain flags like req.user.isAdmin, req.user.isFaculty, req.user.isStudent

const requireAdmin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(403).json({ message: 'Forbidden: Admin access required' });
    }
};

const requireFaculty = (req, res, next) => {
    if (req.user && req.user.role === 'faculty') {
        next();
    } else {
        res.status(403).json({ message: 'Forbidden: Faculty access required' });
    }
};

const requireStudent = (req, res, next) => {
    if (req.user && req.user.isStudent) {
        next();
    } else {
        res.status(403).json({ message: 'Forbidden: Student access required' });
    }
};

const requireAdminOrFaculty = (req, res, next) => {
    if (req.user && (req.user.isAdmin || req.user.isFaculty)) {
        next();
    } else {
        res.status(403).json({ message: 'Forbidden: Admin or Faculty access required' });
    }
};

const requireAdminOrFacultyOrStudent = (req, res, next) => {
    if (req.user && (req.user.isAdmin || req.user.isFaculty || req.user.isStudent)) {
        next();
    } else {
        res.status(403).json({ message: 'Forbidden: Admin, Faculty, or Student access required' });
    }
};

const requireAdminOrSelfStudent = (req, res, next) => {
    const user = req.user;
    const studentIdParam = req.params.id;
    if (user && user.isAdmin) {
        return next();
    }
    if (user && user.isStudent && user.id && user.id === studentIdParam) {
        return next();
    }
    return res.status(403).json({ message: 'Forbidden: Only admin or the student themselves can perform this action.' });
};

module.exports = {
    requireAdmin,
    requireFaculty,
    requireStudent,
    requireAdminOrFaculty,
    requireAdminOrFacultyOrStudent,
    requireAdminOrSelfStudent
};