const Joi = require('joi');

const registerSchema = Joi.object({
    name: Joi.string().min(2).max(25).required().messages({
        'string.empty': 'Имя обязательно',
        'string.min': 'Имя должно быть минимум 2 символа',
        'string.max': 'Имя не должно превышать 25 символов',
        'any.required': 'Имя обязательно',
    }),
    email: Joi.string().email().required().messages({
        'string.email': 'Неверный формат email',
        'any.required': 'Email обязателен',
    }),
    password: Joi.string()
        .min(8)
        .max(128)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .required()
        .messages({
            'string.min': 'Пароль должен быть минимум 8 символов',
            'string.max': 'Пароль не должен превышать 128 символов',
            'string.pattern.base': 'Пароль должен содержать: прописные буквы, строчные буквы и цифры',
            'any.required': 'Пароль обязателен',
        }),
});

const loginSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Неверный формат email',
        'any.required': 'Email обязателен',
    }),
    password: Joi.string().required().messages({
        'any.required': 'Пароль обязателен',
    }),
});

module.exports = { registerSchema, loginSchema };
