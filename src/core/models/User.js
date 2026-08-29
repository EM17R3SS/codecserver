const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Имя обязательно'],
            trim: true,
            minlength: [2, 'Имя должно быть минимум 2 символа'],
            maxlength: [25, 'Имя не должно превышать 25 символов'],
        },
        email: {
            type: String,
            required: [true, 'Email обязателен'],
            unique: true,
            lowercase: true,
            trim: true,
            set: v => (v ? v.toLowerCase().trim() : v),
            match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Неверный формат email'],
        },
        password: {
            type: String,
            minlength: [8, 'Пароль должен быть минимум 8 символов'],
            required: function() {
                return !this.googleId || this.googleId === null;
            },
            default: null,
        },
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user',
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        googleId: {
            type: String,
            default: null,
        },
        failedLoginAttempts: {
            type: Number,
            default: 0,
            select: false,
        },
        lockUntil: {
            type: Date,
            default: null,
            select: false,
        },
    },
    {
        timestamps: true,
    },
);

userSchema.set('toJSON', {
    transform: (doc, ret) => {
        delete ret.password;
        delete ret.failedLoginAttempts;
        delete ret.lockUntil;
        delete ret.__v;
        return ret;
    },
});
userSchema.set('toObject', {
    transform: (doc, ret) => {
        delete ret.password;
        delete ret.failedLoginAttempts;
        delete ret.lockUntil;
        delete ret.__v;
        return ret;
    },
});

userSchema.methods.incrementLoginAttempts = async function(config) {
    this.failedLoginAttempts += 1;

    if (this.failedLoginAttempts >= config.MAX_LOGIN_ATTEMPTS) {
        this.lockUntil = Date.now() + config.LOCK_TIME_MS;
    }

    await this.save({ validateBeforeSave: false });
};

userSchema.methods.resetLoginAttempts = async function() {
    this.failedLoginAttempts = 0;
    this.lockUntil = null;
    await this.save({ validateBeforeSave: false });
};

userSchema.methods.checkIsActive = function() {
    return this.isActive === true;
};

module.exports = mongoose.model('User', userSchema);
