// src/api/v1/auth/authRouter.js
const express = require('express');
const router = express.Router();
const controller = require('./authController');
const validate = require('../../middlewares/validate');
const { registerSchema, loginSchema } = require('./authValidation');
const { verifyCsrfToken } = require('../../middlewares/csrf');
const { authLimiter } = require('../../middlewares/rateLimiter');

router.post(
    '/register',
    authLimiter,
    validate(registerSchema),
    controller.register
);
router.post('/login', authLimiter, validate(loginSchema), controller.login);
router.post('/logout', controller.logout);
router.post(
    '/session-login',
    authLimiter,
    verifyCsrfToken,
    validate(loginSchema),
    controller.sessionLogin
);
router.get('/session', controller.getSessionInfo);

const config = require('../../../config/env');
if (config.GOOGLE_CLIENT_ID) {
    router.get('/google', controller.googleAuth);
    router.get('/google/callback', controller.googleCallback);
}

module.exports = router;
