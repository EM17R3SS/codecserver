const passport = require('../../config/passport');

const auth = (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user) => {
        if (err) return next(err);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Требуется авторизация (неверный или отсутствующий токен)',
            });
        }
        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Аккаунт неактивен',
            });
        }
        req.user = user;
        next();
    })(req, res, next);
};

module.exports = auth;
