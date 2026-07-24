const Joi = require('joi');

const createUserSchema = Joi.object({
    name: Joi.string().min(2).max(25).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    role: Joi.string().valid('user', 'admin').optional(),
});

const updateUserSchema = Joi.object({
    name: Joi.string().min(2).max(25),
    email: Joi.string().email(),
    role: Joi.string().valid('user', 'admin'),
    isActive: Joi.boolean(),
}).min(1);

module.exports = { createUserSchema, updateUserSchema };
