const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            minlength: [2, 'Name must be at least 2 characters'],
            maxlength: [25, 'Name cannot exceed 25 characters'],
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            set: v => (v ? v.toLowerCase().trim() : v),
            match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format'],
        },
        password: {
            type: String,
            minlength: [8, 'Password must be at least 8 characters'],
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
