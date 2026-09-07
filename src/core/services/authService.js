const User = require('../models/User');
const { generateToken } = require('../../lib/jwt');
const { hashPassword } = require('../../lib/password');
const ApiError = require('../../lib/AppError');

class AuthService {
    async register({ name, email, password }) {
        const normalizedEmail = email.toLowerCase().trim();

        const existing = await User.findOne({ email: normalizedEmail });
        if (existing) {
            throw ApiError.badRequest(
                'User with this Email already exists',
            );
        }

        const hashedPassword = await hashPassword(password);
        const user = await User.create({
            name,
            email: normalizedEmail,
            password: hashedPassword,
            role: 'user',
            isActive: true,
        });

        const token = generateToken({
            id: user._id,
            email: user.email,
            role: user.role,
        });

        return { user: user.toJSON(), token };
    }

    async login(email, password, config) {
        const normalizedEmail = email.toLowerCase().trim();
        const user = await User.findOne({ email: normalizedEmail }).select(
            '+password +failedLoginAttempts +lockUntil',
        );

        if (!user) throw ApiError.unauthorized('Неверный email или пароль');
        if (!user.isActive) throw ApiError.unauthorized('Аккаунт заблокирован');
        if (user.lockUntil && user.lockUntil > Date.now()) {
            const minutes = Math.ceil((user.lockUntil - Date.now()) / 60000);
            throw ApiError.tooManyRequests(
                `Account is locked. Try again in ${minutes} min.`,
            );
        }

        const { comparePassword } = require('../../lib/password');
        const isMatch = await comparePassword(password, user.password);

        if (!isMatch) {
            await user.incrementLoginAttempts(config);
            throw ApiError.unauthorized('Invalid email or password');
        }

        if (user.failedLoginAttempts > 0) {
            await user.resetLoginAttempts();
        }

        const token = generateToken({
            id: user._id,
            email: user.email,
            role: user.role,
        });

        return { user: user.toJSON(), token };
    }
}

module.exports = new AuthService();
