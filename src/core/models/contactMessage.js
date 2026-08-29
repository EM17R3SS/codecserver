const mongoose = require('mongoose');

const contactMessageSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Имя обязательно'],
            trim: true,
            minlength: [2, 'Имя должно быть минимум 2 символа'],
            maxlength: [50, 'Имя не должно превышать 50 символов'],
        },
        email: {
            type: String,
            required: [true, 'Email обязателен'],
            lowercase: true,
            trim: true,
            match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Неверный формат email'],
        },
        message: {
            type: String,
            required: [true, 'Сообщение обязательно'],
            minlength: [10, 'Сообщение должно быть минимум 10 символов'],
            maxlength: [1000, 'Сообщение не должно превышать 1000 символов'],
        },
        status: {
            type: String,
            enum: ['new', 'read', 'replied'],
            default: 'new',
        },
        ipAddress: {
            type: String,
            default: null,
        },
        userAgent: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: true,
    },
);

contactMessageSchema.index({ email: 1 });
contactMessageSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ContactMessage', contactMessageSchema);
