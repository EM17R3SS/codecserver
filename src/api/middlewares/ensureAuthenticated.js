function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated && req.isAuthenticated()) {
        if (!req.user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Аккаунт неактивен',
            });
        }
        return next();
    }
    return res.redirect('/login');
}

function ensureGuest(req, res, next) {
    if (req.isAuthenticated && req.isAuthenticated()) {
        return res.redirect('/');
    }
    return next();
}

function ensureRole(...roles) {
    return (req, res, next) => {
        if (!req.isAuthenticated || !req.isAuthenticated()) {
            return res.redirect('/login');
        }
        if (!req.user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Аккаунт неактивен',
            });
        }
        if (!roles.includes(req.user.role)) {
            return res.redirect('/');
        }
        next();
    };
}

module.exports = { ensureAuthenticated, ensureGuest, ensureRole };
