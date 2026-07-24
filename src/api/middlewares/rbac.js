function rbac(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Требуется авторизация',
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Недостаточно прав для выполнения операции',
            });
        }

        next();
    };
}

module.exports = rbac;
