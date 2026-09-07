const userRepository = require('../../../core/repositories/userRepository');
const catchAsync = require('../../../lib/catchAsync');
const ApiError = require('../../../lib/AppError');
const logger = require('../../../config/logger');

const makeAdmin = catchAsync(async (req, res, next) => {
    const userId = req.params.id;
    const user = await userRepository.findById(userId);

    if (!user) return next(ApiError.notFound('User not found'));
    if (user.role === 'admin') {
        return next(ApiError.badRequest('User is already an admin'));
    }

    const updatedUser = await userRepository.update(userId, { role: 'admin' });
    logger.auth(userId, 'make_admin', true);

    res.json({
        success: true,
        message: 'User made an admin',
        data: updatedUser,
    });
});

module.exports = { makeAdmin };
