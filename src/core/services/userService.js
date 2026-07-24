const userRepository = require('../repositories/userRepository');
const ApiError = require('../../lib/ApiError');

class UserService {
    async getAllUsers(query) {
        const users = await userRepository.findAll(query);
        const total = await userRepository.count();
        return { users, total };
    }

    async getUserById(id) {
        const user = await userRepository.findById(id);
        if (!user) throw ApiError.notFound('Пользователь не найден');
        return user;
    }

    async createUser(userData) {
        if (!userData.name || !userData.email) {
            throw ApiError.badRequest('Имя и Email обязательны');
        }

        const normalizedEmail = userData.email.toLowerCase().trim();
        const existing = await userRepository.findByEmail(normalizedEmail);
        if (existing) {
            throw ApiError.badRequest(
                'Пользователь с таким Email уже существует'
            );
        }

        return await userRepository.create({
            ...userData,
            email: normalizedEmail,
        });
    }

    async updateUser(id, userData) {
        const user = await userRepository.findById(id);
        if (!user) throw ApiError.notFound('Пользователь не найден');

        if (userData.email) {
            const normalizedEmail = userData.email.toLowerCase().trim();
            if (normalizedEmail !== user.email) {
                const existing =
                    await userRepository.findByEmail(normalizedEmail);
                if (existing) {
                    throw ApiError.badRequest(
                        'Пользователь с таким Email уже существует'
                    );
                }
            }
            userData.email = normalizedEmail;
        }

        return await userRepository.update(id, userData);
    }

    async deleteUser(id) {
        const user = await userRepository.findById(id);
        if (!user) throw ApiError.notFound('Пользователь не найден');
        return await userRepository.delete(id);
    }
}

module.exports = new UserService();
