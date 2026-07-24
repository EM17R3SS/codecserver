const rateLimit = require('express-rate-limit');
const config = require('../../config/env');

const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Слишком много запросов с этого IP. Попробуйте позже.',
    },
});

const authLimiter = rateLimit({
    windowMs: config.AUTH_RATE_LIMIT_WINDOW_MS,
    max: config.AUTH_RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    message: {
        success: false,
        message:
            'Слишком много попыток входа. Попробуйте снова через 15 минут.',
    },
});

module.exports = { globalLimiter, authLimiter };
