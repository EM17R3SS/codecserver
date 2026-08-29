const Joi = require('joi');

const contactSchema = Joi.object({
    name: Joi.string().min(2).max(50).required().trim().messages({
        'string.empty': 'Имя обязательно',
        'string.min': 'Имя должно быть минимум 2 символа',
        'string.max': 'Имя не должно превышать 50 символов',
        'any.required': 'Имя обязательно',
    }),
    email: Joi.string().email().required().lowercase().trim().messages({
        'string.email': 'Неверный формат email',
        'any.required': 'Email обязателен',
    }),
    message: Joi.string().min(10).max(1000).required().trim().messages({
        'string.empty': 'Сообщение обязательно',
        'string.min': 'Сообщение должно быть минимум 10 символов',
        'string.max': 'Сообщение не должно превышать 1000 символов',
        'any.required': 'Сообщение обязательно',
    }),
});

const bulkDeleteSchema = Joi.object({
    ids: Joi.array()
        .items(Joi.string().required())
        .min(1)
        .required()
        .messages({
            'array.min': 'Укажите минимум одно сообщение',
            'any.required': 'Укажите ID сообщений',
        }),
});

module.exports = { contactSchema, bulkDeleteSchema };
