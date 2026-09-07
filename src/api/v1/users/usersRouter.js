const express = require('express');
const router = express.Router();
const controller = require('./usersController');
const validate = require('../../middlewares/validate');
const { createUserSchema, updateUserSchema } = require('./usersValidation');
const auth = require('../../middlewares/auth');
const rbac = require('../../middlewares/rbac');

router.use(auth);

router.get('/', rbac('user', 'admin'), controller.getUsers);
router.get('/:id', rbac('user', 'admin'), controller.getUserById);

router.post('/', rbac('admin'), validate(createUserSchema), controller.createUser);
router.put('/:id', rbac('admin'), validate(updateUserSchema), controller.updateUser);
router.delete('/:id', rbac('admin'), controller.deleteUser);

module.exports = router;
