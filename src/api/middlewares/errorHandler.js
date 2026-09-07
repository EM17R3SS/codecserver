const logger = require('../../config/logger');
const config = require('../../config/env');

function errorHandler(err, req, res, _next) {
    logger.logError(err, req);

    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';
    let errors = err.errors && err.errors.length ? err.errors : undefined;

    if (err.name === 'CastError') {
        statusCode = 400;
        message = `Invalid identifier: ${err.value}`;
    }

    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation error';
        errors = Object.values(err.errors).map(e => e.message);
    }

    if (err.code === 11000) {
        statusCode = 400;
        const field = Object.keys(err.keyValue || {})[0];
        message = `Field "${field}" is already exists`;
    }

    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Invalid or expired token';
    }

    res.status(statusCode).json({
        success: false,
        message,
        ...(errors && { errors }),
        ...(config.NODE_ENV === 'development' && { stack: err.stack }),
    });
}

module.exports = errorHandler;
