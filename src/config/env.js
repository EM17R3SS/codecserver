const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    PORT: process.env.PORT || 3000,
    HOST: process.env.HOST || 'localhost',
    NODE_ENV: process.env.NODE_ENV || 'development',
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',

    MONGO_URI: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/myapp',

    JWT_SECRET: process.env.JWT_SECRET || 'secretkey',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

    SESSION_SECRET: process.env.SESSION_SECRET || 'sessionsecret',
    SESSION_MAX_AGE:
        parseInt(process.env.SESSION_MAX_AGE) || 24 * 60 * 60 * 1000,

    BCRYPT_SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10,

    CSRF_SECRET: process.env.CSRF_SECRET || 'csrfsecret',

    CORS_ORIGIN: process.env.CORS_ORIGIN || '*',

    AUTH_RATE_LIMIT_WINDOW_MS:
        parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    AUTH_RATE_LIMIT_MAX: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 10,

    MAX_LOGIN_ATTEMPTS: parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5,
    LOCK_TIME_MS: parseInt(process.env.LOCK_TIME_MS) || 15 * 60 * 1000,

    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
    GOOGLE_CALLBACK_URL:
        process.env.GOOGLE_CALLBACK_URL ||
        'http://localhost:3000/api/v1/auth/google/callback',
};
