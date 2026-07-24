const userRepository = require('../../../core/repositories/userRepository');
const catchAsync = require('../../../lib/catchAsync');
const ApiError = require('../../../lib/ApiError');
const logger = require('../../../config/logger');

const makeAdmin = catchAsync(async (req, res, next) => {
    const userId = req.params.id;
    const user = await userRepository.findById(userId);

    if (!user) return next(ApiError.notFound('Пользователь не найден'));
    if (user.role === 'admin') {
        return next(ApiError.badRequest('Пользователь уже администратор'));
    }

    const updatedUser = await userRepository.update(userId, { role: 'admin' });
    logger.auth(userId, 'make_admin', true);

    res.json({
        success: true,
        message: 'Пользователь назначен администратором',
        data: updatedUser,
    });
});

module.exports = { makeAdmin };
