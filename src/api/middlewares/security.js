const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const { filterXSS } = require('xss');

const helmetMiddleware = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: [
                "'self'",
                'https://fonts.googleapis.com',
                "'unsafe-inline'",
            ],
            fontSrc: ["'self'", 'https://fonts.gstatic.com'],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", 'data:'],
        },
    },
});

const mongoSanitizeMiddleware = mongoSanitize({
    replaceWith: '_',
});

const hppMiddleware = hpp();

function xssSanitize(req, res, next) {
    const sanitizeObject = obj => {
        if (!obj || typeof obj !== 'object') return;
        for (const key of Object.keys(obj)) {
            if (typeof obj[key] === 'string') {
                obj[key] = filterXSS(obj[key], {
                    whiteList: {},
                });
            } else if (typeof obj[key] === 'object') {
                sanitizeObject(obj[key]);
            }
        }
    };

    sanitizeObject(req.body);
    sanitizeObject(req.query);
    sanitizeObject(req.params);
    next();
}

module.exports = {
    helmetMiddleware,
    mongoSanitizeMiddleware,
    hppMiddleware,
    xssSanitize,
};
