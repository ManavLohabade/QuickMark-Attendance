const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/jwt');
const userModel = require('../models/userModel');

const authMiddleware = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'No token provided.' });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Invalid token format.' });
        }

        // Verify token using wrapper
        const { verifyToken } = require('../config/jwt');
        const decoded = verifyToken(token);
        if (!decoded) {
            return res.status(401).json({ message: 'Invalid or expired token.' });
        }
        req.user = decoded;

        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// Check if password needs to be changed
const checkPasswordExpiry = async (req, res, next) => {
    try {
        // Skip check for password-related endpoints
        if (req.path.includes('/password')) {
            return next();
        }

        const status = await userModel.checkPasswordExpiry(req.user.id);
        if (status.password_expired) {
            return res.status(403).json({
                message: 'Password has expired. Please change your password to continue.',
                code: 'PASSWORD_EXPIRED',
                expires_at: status.password_expires_at
            });
        }
        next();
    } catch (error) {
        console.error('Password expiry check error:', error);
        next(); // Continue even if check fails
    }
};

module.exports = {
    authMiddleware,
    checkPasswordExpiry,
    
};
