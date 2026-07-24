const Joi = require('joi');

const registerSchema = Joi.object({
    name: Joi.string().min(2).max(25).required().messages({
        'string.empty': 'Имя обязательно',
        'string.min': 'Имя должно быть минимум 2 символа',
        'any.required': 'Имя обязательно',
    }),
    email: Joi.string().email().required().messages({
        'string.email': 'Неверный формат email',
        'any.required': 'Email обязателен',
    }),
    password: Joi.string().min(8).required().messages({
        'string.min': 'Пароль должен быть минимум 8 символов',
        'any.required': 'Пароль обязателен',
    }),
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

module.exports = { registerSchema, loginSchema };
