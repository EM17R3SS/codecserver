function rbac(...allowedRoles) {
    return (req, res, next) => {
        const user = req.user || req.session?.passport?.user;
        if (!user && req.session?.passport?.user) {
            return res.status(401).json({
                success: false,
                message: 'User not found in session',
            });
        }

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated',
            });
        }

        if (!allowedRoles.includes(user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to perform operation',
            });
        }

        if(!req.user && user) {
            req.user = user;
        }

        next();
    };
}

module.exports = rbac;
