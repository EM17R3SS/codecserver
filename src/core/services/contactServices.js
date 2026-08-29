const contactRepository = require('../repositories/contactRepository');
const ApiError = require('../../lib/ApiError');

class ContactService {
    async submitMessage(data) {
        if (!data.name || !data.email || !data.message) {
            throw ApiError.badRequest('Все поля обязательны');
        }

        const message = await contactRepository.create({
            name: data.name.trim(),
            email: data.email.toLowerCase().trim(),
            message: data.message.trim(),
            ipAddress: data.ipAddress || null,
            userAgent: data.userAgent || null,
        });

        return message;
    }

    async getAllMessages(page = 1, limit = 20, status = null) {
        return await contactRepository.findAll({ page, limit, status });
    }

    async getMessageById(id) {
        const message = await contactRepository.findById(id);
        if (!message) {
            throw ApiError.notFound('Сообщение не найдено');
        }
        return message;
    }

    async markAsRead(id) {
        const message = await contactRepository.findById(id);
        if (!message) {
            throw ApiError.notFound('Сообщение не найдено');
        }

        return await contactRepository.updateStatus(id, 'read');
    }

    async markAsReplied(id) {
        const message = await contactRepository.findById(id);
        if (!message) {
            throw ApiError.notFound('Сообщение не найдено');
        }

        return await contactRepository.updateStatus(id, 'replied');
    }

    async deleteMessage(id) {
        const message = await contactRepository.findById(id);
        if (!message) {
            throw ApiError.notFound('Сообщение не найдено');
        }

        return await contactRepository.delete(id);
    }

    async deleteMessages(ids) {
        if (!Array.isArray(ids) || ids.length === 0) {
            throw ApiError.badRequest('Укажите ID сообщений');
        }

        return await contactRepository.deleteMany(ids);
    }

    async getStats() {
        const total = await contactRepository.count();
        const newCount = await contactRepository.count('new');
        const readCount = await contactRepository.count('read');
        const repliedCount = await contactRepository.count('replied');

        return {
            total,
            new: newCount,
            read: readCount,
            replied: repliedCount,
        };
    }
}

module.exports = new ContactService();
