const User = require('../models/User');
const AppError = require('../../errors/AppError');

class UserRepository {
    async findAll({ page = 1, limit = 20 } = {}) {
        const skip = (page - 1) * limit;
        const users = await User.find()
            .select('-__v')
            .skip(skip)
            .limit(limit)
            .lean();
        return users.map(user => {
            delete user.password;
            delete user.failedLoginAttempts;
            delete user.lockUntil;
            return user;
        });
    }

    async count() {
        return await User.countDocuments();
    }

    async findById(id) {
        const user = await User.findById(id).select('-__v').lean();
        if (!user) return null;
        delete user.password;
        delete user.failedLoginAttempts;
        delete user.lockUntil;
        return user;
    }

    async findByEmail(email) {
        const user = await User.findOne({ email: email.toLowerCase().trim() })
            .select('-__v')
            .lean();
        if (!user) return null;
        delete user.password;
        delete user.failedLoginAttempts;
        delete user.lockUntil;
        return user;
    }

    async create(userData) {
        const user = await User.create(userData);
        return user.toJSON();
    }

    async update(id, userData) {
        const user = await User.findByIdAndUpdate(id, userData, {
            new: true,
            runValidators: true,
        }).select('-__v');
        if (!user) return null;
        return user.toJSON();
    }

    async delete(id) {
        const deletedUser = await User.findByIdAndDelete(id);

        if (!deletedUser) {
            throw AppError.notFound('User not found');
        }

        return deletedUser;
    }
}

module.exports = new UserRepository();
