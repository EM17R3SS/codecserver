const mongoose = require('mongoose');
const config = require('./env');
const logger = require('./logger');

async function connectDB() {
    try {
        await mongoose.connect(config.MONGO_URI);
        logger.info('MongoDB connected (Mongoose)');
    } catch (err) {
        logger.error(`Failed to connect to MongoDB: ${err.message}`);
        process.exit(1);
    }
}

module.exports = connectDB;
