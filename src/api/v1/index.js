const express = require('express');
const router = express.Router();

router.use('/users', require('./users/usersRouter'));
router.use('/auth', require('./auth/authRouter'));
router.use('/admin', require('./admin/adminRouter'));

module.exports = router;
