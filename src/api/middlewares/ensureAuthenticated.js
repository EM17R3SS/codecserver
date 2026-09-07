const jwt = require('jsonwebtoken');
const config = require('../../config/env');
const User = require('../../core/models/User');

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated && req.isAuthenticated()) {
        if (!req.user.isActive) {
            if (req.xhr || req.headers.accept?.includes('application/json')) {
                return res.status(403).json({
                    success: false,
                    message: 'Account is inactive. Please contact support.',
                });
            }
            return res.redirect('/login?error=account_inactive');
        }
        return next();
    }

    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
        try {
            const decoded = jwt.verify(token, config.JWT_SECRET);

            User.findById(decoded.id)
                .then(user => {
                    if (!user || !user.isActive) {
                        return res.status(401).json({
                            success: false,
                            message: 'Invalid or inactive account',
                        });
                    }
                    req.user = user;
                    next();
                })
                .catch(err => {
                    return res.status(500).json({
                        success: false,
                        message: 'Database error',
                    });
                });
            return;
        } catch (err) {
            console.debug('Invalid JWT token:', err.message);
        }
    }

    const isApiRequest = req.xhr ||
                        req.headers.accept?.includes('application/json') ||
                        req.path.startsWith('/api/');

    if (isApiRequest) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required. Please log in.',
        });
    }

    const redirectUrl = encodeURIComponent(req.originalUrl);
    return res.redirect(`/login?redirect=${redirectUrl}`);
}

function ensureGuest(req, res, next) {
    if (req.isAuthenticated && req.isAuthenticated()) {
        return res.redirect('/');
    }

    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
        try {
            jwt.verify(token, config.JWT_SECRET);
            return res.redirect('/');
        } catch (err) {
        }
    }

    next();
}

function ensureRole(...roles) {
    return (req, res, next) => {
        if (!req.isAuthenticated || !req.isAuthenticated()) {
            if (req.xhr || req.headers.accept?.includes('application/json')) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required',
                });
            }
            return res.redirect('/login');
        }

        if (!req.user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Account is inactive',
            });
        }

        if (!roles.includes(req.user.role)) {
            if (req.xhr || req.headers.accept?.includes('application/json')) {
                return res.status(403).json({
                    success: false,
                    message: 'Insufficient permissions. Required role: ' + roles.join(' or '),
                });
            }
            return res.redirect('/');
        }

        next();
    };
}

module.exports = {
    ensureAuthenticated,
    ensureGuest,
    ensureRole,
};
