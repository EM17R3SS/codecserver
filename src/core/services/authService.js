const User = require('../models/User');
const { generateToken } = require('../../lib/jwt');
const { hashPassword } = require('../../lib/password');
const ApiError = require('../../lib/ApiError');

class AuthService {
    async register({ name, email, password }) {
        const normalizedEmail = email.toLowerCase().trim();

        const existing = await User.findOne({ email: normalizedEmail });
        if (existing) {
            throw ApiError.badRequest(
                'Пользователь с таким Email уже существует'
            );
        }

        const hashedPassword = await hashPassword(password);
        const user = await User.create({
            name,
            email: normalizedEmail,
            password: hashedPassword,
            role: 'user',
        });

        const token = generateToken({
            id: user._id,
            email: user.email,
            role: user.role,
        });

        const userWithoutPassword = user.toObject();
        delete userWithoutPassword.password;

        return { user: userWithoutPassword, token };
    }

    async login(email, password, config) {
        const normalizedEmail = email.toLowerCase().trim();
        const user = await User.findOne({ email: normalizedEmail }).select(
            '+password +failedLoginAttempts +lockUntil'
        );

        if (!user) throw ApiError.unauthorized('Неверный email или пароль');

        if (user.lockUntil && user.lockUntil > Date.now()) {
            const minutes = Math.ceil((user.lockUntil - Date.now()) / 60000);
            throw ApiError.tooManyRequests(
                `Аккаунт заблокирован. Попробуйте через ${minutes} мин.`
            );
        }

        const { comparePassword } = require('../../lib/password');
        const isMatch = await comparePassword(password, user.password);

        if (!isMatch) {
            await user.incrementLoginAttempts(config);
            throw ApiError.unauthorized('Неверный email или пароль');
        }

        if (user.failedLoginAttempts > 0) {
            await user.resetLoginAttempts();
        }

        const token = generateToken({
            id: user._id,
            email: user.email,
            role: user.role,
        });

        const userWithoutPassword = user.toObject();
        delete userWithoutPassword.password;

        return { user: userWithoutPassword, token };
    }
}

module.exports = new AuthService();
