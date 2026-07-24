const User = require('../models/User');

class UserRepository {
    async findAll({ page = 1, limit = 20 } = {}) {
        const skip = (page - 1) * limit;
        return await User.find().select('-__v').skip(skip).limit(limit);
    }

    async count() {
        return await User.countDocuments();
    }

    async findById(id) {
        return await User.findById(id).select('-__v');
    }

    async findByEmail(email) {
        return await User.findOne({ email: email.toLowerCase().trim() }).select(
            '-__v'
        );
    }

    async create(userData) {
        return await User.create(userData);
    }

    async update(id, userData) {
        return await User.findByIdAndUpdate(id, userData, {
            new: true,
            runValidators: true,
        }).select('-__v');
    }

    async delete(id) {
        return await User.findByIdAndDelete(id);
    }
}

module.exports = new UserRepository();
