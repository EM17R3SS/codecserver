const passport = require('../../../config/passport');
const authService = require('../../../core/services/authService');
const logger = require('../../../config/logger');
const config = require('../../../config/env');
const catchAsync = require('../../../lib/catchAsync');

const register = catchAsync(async (req, res) => {
    const { user, token } = await authService.register(req.body);
    logger.auth(user._id, 'register', true);

    res.status(201).json({ success: true, data: { user, token } });
});

const login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    try {
        const { user, token } = await authService.login(
            email,
            password,
            config
        );
        logger.auth(user._id, 'login_jwt', true);
        res.json({ success: true, data: { user, token } });
    } catch (err) {
        logger.auth(email, 'login_jwt', false);
        next(err);
    }
});

const sessionLogin = (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) return next(err);
        if (!user) {
            logger.auth(req.body.email, 'login_session', false);
            return res.status(401).json({
                success: false,
                message: info?.message || 'Неверный email или пароль',
            });
        }
        req.login(user, loginErr => {
            if (loginErr) return next(loginErr);
            logger.auth(user._id, 'login_session', true);
            const userSafe = user.toObject();
            delete userSafe.password;
            res.json({ success: true, data: { user: userSafe } });
        });
    })(req, res, next);
};

const logout = (req, res, next) => {
    const userId = req.user?._id || 'unknown';
    req.logout(err => {
        if (err) return next(err);
        req.session.destroy(() => {
            res.clearCookie('connect.sid');
            logger.auth(userId, 'logout', true);
            res.json({ success: true, message: 'Выход выполнен' });
        });
    });
};

const getSessionInfo = (req, res) => {
    res.json({
        success: true,
        authenticated: !!req.user,
        user: req.user || null,
    });
};

const googleAuth = passport.authenticate('google', {
    scope: ['profile', 'email'],
});

const googleCallback = (req, res, next) => {
    passport.authenticate('google', { failureRedirect: '/login' }, err => {
        if (err) return next(err);
        req.login(req.user, loginErr => {
            if (loginErr) return next(loginErr);
            logger.auth(req.user._id, 'login_google', true);
            res.redirect('/');
        });
    })(req, res, next);
};

module.exports = {
    register,
    login,
    sessionLogin,
    logout,
    getSessionInfo,
    googleAuth,
    googleCallback,
};
