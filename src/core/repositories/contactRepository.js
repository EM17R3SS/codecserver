const ContactMessage = require('../models/contactMessage');

class ContactRepository {
    async create(data) {
        const message = await ContactMessage.create(data);
        return message.toObject();
    }

    async findAll({ page = 1, limit = 20, status = null } = {}) {
        const skip = (page - 1) * limit;
        const query = status ? { status } : {};

        const messages = await ContactMessage.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await ContactMessage.countDocuments(query);

        return {
            messages,
            total,
            page,
            pages: Math.ceil(total / limit),
        };
    }

    async findById(id) {
        return await ContactMessage.findById(id).lean();
    }

    async updateStatus(id, status) {
        return await ContactMessage.findByIdAndUpdate(
            id,
            { status },
            { new: true, runValidators: true },
        ).lean();
    }

    async delete(id) {
        return await ContactMessage.findByIdAndDelete(id);
    }

    async deleteMany(ids) {
        return await ContactMessage.deleteMany({ _id: { $in: ids } });
    }

    async count(status = null) {
        const query = status ? { status } : {};
        return await ContactMessage.countDocuments(query);
    }
}

module.exports = new ContactRepository();
