const bcrypt = require('bcrypt');
const config = require('../config/env');

async function hashPassword(password) {
    const salt = await bcrypt.genSalt(config.BCRYPT_SALT_ROUNDS);
    return await bcrypt.hash(password, salt);
}

async function comparePassword(password, hashedPassword) {
    if (!hashedPassword) return false;
    return await bcrypt.compare(password, hashedPassword);
}

module.exports = { hashPassword, comparePassword };
