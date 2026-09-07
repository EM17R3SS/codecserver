const { verifyToken } = require('../../lib/jwt');
const User = require('../../core/models/User');
const logger = require('../../config/logger');

const auth = async (req, res, next) => {
    if (req.isAuthenticated && req.isAuthenticated()) {
        if (req.user && req.user.isActive) {
            return next();
        }
        return res.status(401).json({
            success: false,
            message: 'User not active',
        });
    }

    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Authorization required. No token provided.',
        });
    }

    try {
        const decoded = verifyToken(token);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found',
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Account is inactive',
            });
        }

        req.user = user;
        next();
    } catch (error) {
        logger.error('Auth middleware error:', error);
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token',
        });
    }
};

module.exports = auth;
