const express = require('express');
const router = express.Router();
const adminController = require('./adminController');
const auth = require('../../middlewares/auth');
const rbac = require('../../middlewares/rbac');

router.use(auth);
router.post('/make-admin/:id', rbac('admin'), adminController.makeAdmin);

module.exports = router;
