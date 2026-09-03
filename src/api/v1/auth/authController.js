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
            config,
        );
        logger.auth(user._id, 'login_jwt', true);
        res.json({ success: true, data: { user, token } });
    } catch (err) {
        logger.auth(email, 'login_jwt', false);
        next(err);
    }
});

const sessionLogin = (req, res, next) => {
    const checkForClean = req.headers.accept?.includes('application/json') || req.xhr;
    passport.authenticate('local', (err, user, info) => {
        if (err) return next(err);
        if (!user) {
            logger.auth(req.body.email, 'login_session', false);

            if (checkForClean) {
                return res.status(401).json({
                    success: false,
                    message: info?.message || 'Неверный email или пароль',
                });
            }
            return res.redirect('/login?error=invalid_credentials');
        }
        if (!user.isActive) {
            if (checkForClean) {
                return res.status(403).json({
                    success: false,
                    message: 'Аккаунт неактивен',
                });
            }
            return res.redirect(`/login?${new URLSearchParams({ error: 'Аккаунт неактивен' }).toString()}`);
        }
        req.login(user, loginErr => {
            if (loginErr) {
                if (checkForClean) {
                    return next(loginErr);
                }
                return res.redirect('/login?error=login_error');
            }
            logger.auth(user._id, 'login_session', true);
            if (checkForClean) {
                res.json({ success: true, data: { user: user.toJSON() } });
            } else {
                res.redirect('/');
            }
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
    prompt: 'select_account',
});


const googleCallback = (req, res, next) => {
    passport.authenticate('google', { failureRedirect: '/login' }, (err, user, info) => {
        if (err) {
            logger.error(`Google OAuth error: ${err.message}`);
            return res.redirect('/login?error=oauth_error');
        }

        if (!user) {
            logger.warn(`Google OAuth failed: ${info?.message || 'Unknown error'}`);
            return res.redirect('/login?error=oauth_failed');
        }

        if (!user.isActive) {
            logger.auth(user._id, 'login_google', false);
            return res.redirect('/login?error=account_deactivated');
        }

        req.login(user, (loginErr) => {
            if (loginErr) {
                logger.error(`Google OAuth login error: ${loginErr.message}`);
                return res.redirect('/login?error=login_error');
            }

            logger.auth(user._id, 'login_google', true);
            return res.redirect('/');
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
