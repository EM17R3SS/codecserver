const winston = require('winston');
const config = require('./env');

const logger = winston.createLogger({
    level: config.LOG_LEVEL,
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(
            ({ timestamp, level, message }) =>
                `[${timestamp}] ${level.toUpperCase()}: ${message}`,
        ),
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
        }),
        new winston.transports.File({ filename: 'logs/combined.log' }),
    ],
});

logger.logError = (err, req = null) => {
    const meta = {
        message: err.message,
        stack: err.stack,
        code: err.code || err.statusCode || 500,
    };
    if (req) {
        meta.url = req.url;
        meta.method = req.method;
        meta.ip = req.ip;
    }
    logger.error(JSON.stringify(meta));
};

logger.auth = (userId, action, success) => {
    logger.info(`[AUTH] user=${userId} action=${action} success=${success}`);
};

module.exports = logger;
