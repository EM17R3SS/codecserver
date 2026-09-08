const express = require('express');
const router = express.Router();
const controller = require('./authController');
const validate = require('../../middlewares/validate');
const { registerSchema, loginSchema } = require('./authValidation');
const { verifyCsrfToken } = require('../../middlewares/csrf');
const { authLimiter } = require('../../middlewares/rateLimiter');
const config = require('../../../config/env');
const authMiddleware = require('../../middlewares/auth');
//const controller = require('./authController');

router.post(
    '/register',
    authLimiter,
    validate(registerSchema),
    controller.register,
);
router.post('/login', authLimiter, validate(loginSchema), controller.login);
router.post('/logout', authMiddleware, controller.logout);
router.post(
    '/session-login',
    authLimiter,
    verifyCsrfToken,
    validate(loginSchema),
    controller.sessionLogin,
);
router.get('/session', controller.getSessionInfo);
router.get('/validate-token', authMiddleware, controller.validateToken);

const googleEnabled = config.GOOGLE_CLIENT_ID && config.GOOGLE_CLIENT_SECRET;
if (googleEnabled) {
    router.get('/google', controller.googleAuth);
    router.get('/google/callback', controller.googleCallback);
}

module.exports = router;
