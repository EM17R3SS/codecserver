function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated && req.isAuthenticated()) {
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
        if (!roles.includes(req.user.role)) {
            return res.status(403).render('error', {
                title: 'Доступ запрещён',
                message: 'У вас недостаточно прав для просмотра этой страницы',
            });
        }
        next();
    };
}

module.exports = { ensureAuthenticated, ensureGuest, ensureRole };
