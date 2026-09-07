const crypto = require('crypto');
const config = require('../../config/env');
const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';

function generateCsrfToken(req, res, next) {
    let token = req.cookies?.[CSRF_COOKIE_NAME];

    if (!token) {
        token = crypto
            .createHmac('sha256', config.CSRF_SECRET)
            .update(crypto.randomBytes(32))
            .digest('hex');

        res.cookie(CSRF_COOKIE_NAME, token, {
            httpOnly: false,
            secure: config.NODE_ENV === 'production',
            sameSite: 'strict',
        });
    }

    res.locals.csrfToken = token;
    next();
}

function verifyCsrfToken(req, res, next) {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next();
    }

    const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];
    const clientToken = req.body?._csrf || req.headers[CSRF_HEADER_NAME];

    if (!cookieToken || !clientToken) {
        return res.status(403).json({
            success: false,
            message: 'CSRF-token not found.',
        });
    }
    if (cookieToken !== clientToken) {
        return res.status(403).json({
            success: false,
            message: 'Invalid CSRF-token.',
        });
    }

    next();
}

module.exports = { generateCsrfToken, verifyCsrfToken, CSRF_HEADER_NAME };
