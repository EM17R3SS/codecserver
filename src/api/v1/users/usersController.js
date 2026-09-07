const userService = require('../../../core/services/userService');
const catchAsync = require('../../../lib/catchAsync');
const logger = require('../../../config/logger');
const { generateRandomPassword } = require('../../../lib/utils');
const { hashPassword } = require('../../../lib/password');


const getUsers = catchAsync(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const { users, total } = await userService.getAllUsers({ page, limit });

    res.json({
        success: true,
        count: users.length,
        total,
        page,
        pages: Math.ceil(total / limit),
        data: users,
    });
});

const getUserById = catchAsync(async (req, res) => {
    const user = await userService.getUserById(req.params.id);
    res.json({ success: true, data: user });
});

const createUser = catchAsync(async (req, res) => {
    const payload = { ...req.body };

    if (payload.password && payload.password.trim() !== '') {
        payload.password = await hashPassword(payload.password);
    } else {
        const { generateRandomPassword } = require('../../../lib/utils');
        const randomPassword = generateRandomPassword();
        payload.password = await hashPassword(randomPassword);
        logger.info(`Generated password for ${payload.email}: ${randomPassword}`);
    }

    const user = await userService.createUser(payload);
    logger.info(`Admin ${req.user.email} created user ${user.email}`);
    res.status(201).json({ success: true, data: user });
});

const updateUser = catchAsync(async (req, res) => {
    const { hashPassword } = require('../../../lib/password');
    const payload = { ...req.body };

    if (payload.password) {
        payload.password = await hashPassword(payload.password);
    } else {
        delete payload.password;
    }

    const user = await userService.updateUser(req.params.id, payload);
    logger.info(`Admin ${req.user.email} updated user ${req.params.id}`);
    res.json({ success: true, data: user });
});

const deleteUser = catchAsync(async (req, res) => {
    await userService.deleteUser(req.params.id);
    logger.warn(`Admin ${req.user.email} deleted user ${req.params.id}`);
    res.json({ success: true, message: 'User deleted' });
});

module.exports = {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
};
