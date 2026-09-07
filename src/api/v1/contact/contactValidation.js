const Joi = require('joi');

const contactSchema = Joi.object({
    name: Joi.string().min(2).max(50).required().trim().messages({
        'string.empty': 'Name is required',
        'string.min': 'Name must be at least 2 characters',
        'string.max': 'Name cannot exceed 50 characters',
        'any.required': 'Name is required',
    }),
    email: Joi.string().email().required().lowercase().trim().messages({
        'string.email': 'Invalid email format',
        'any.required': 'Email is required',
    }),
    message: Joi.string().min(10).max(1000).required().trim().messages({
        'string.empty': 'Message is required',
        'string.min': 'Message must be at least 10 characters',
        'string.max': 'Message cannot exceed 1000 characters',
        'any.required': 'Message is required',
    }),
});

const bulkDeleteSchema = Joi.object({
    ids: Joi.array()
        .items(Joi.string().required())
        .min(1)
        .required()
        .messages({
            'array.min': 'Specify at least one message',
            'any.required': 'Specify message IDs',
        }),
});

module.exports = { contactSchema, bulkDeleteSchema };
