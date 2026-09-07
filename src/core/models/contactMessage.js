const mongoose = require('mongoose');

const contactMessageSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            minlength: [2, 'Name must be at least 2 characters'],
            maxlength: [50, 'Name cannot exceed 50 characters'],
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            lowercase: true,
            trim: true,
            match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format'],
        },
        message: {
            type: String,
            required: [true, 'Message is required'],
            minlength: [10, 'Message must be at least 10 characters'],
            maxlength: [1000, 'Message cannot exceed 1000 characters'],
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
