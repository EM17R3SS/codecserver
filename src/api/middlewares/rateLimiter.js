const rateLimit = require('express-rate-limit');
const config = require('../../config/env');

const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many requests from this IP. Please try again later.',
    },
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    message: {
        success: false,
        message: 'Too many login attempts. Please try again in 15 minutes.',
    },
});

const apiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'API rate limit exceeded. Please slow down.',
    },
});

module.exports = { globalLimiter, authLimiter, apiLimiter };
