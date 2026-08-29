const jwt = require('jsonwebtoken');
const config = require('../config/env');

function generateToken(payload) {
    return jwt.sign(payload, config.JWT_SECRET, {
        expiresIn: config.JWT_EXPIRES_IN,
    });
}

function verifyToken(token) {
    try {
        return jwt.verify(token, config.JWT_SECRET);
    } catch (err) {
        throw new Error('Invalid token');
    }
}

module.exports = { generateToken, verifyToken };
