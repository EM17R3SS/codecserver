const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../src/core/models/User');
const { hashPassword } = require('../src/lib/password');

async function seed() {
    try {
        const MONGO_URI =
            process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/myapp';
        console.log(`Подключение к MongoDB: ${MONGO_URI}`);

        await mongoose.connect(MONGO_URI);
        console.log('Подключение к БД...');

        await User.deleteMany({});
        console.log('База очищена');

        const adminPassword = await hashPassword('admin123');
        const admin = await User.create({
            name: 'Admin',
            email: 'admin@example.com',
            password: adminPassword,
            role: 'admin',
        });
        console.log('Админ создан:', admin.email);

        const users = [
            { name: 'Иван Петров', email: 'ivan@example.com' },
            { name: 'Мария Смирнова', email: 'maria@example.com' },
            { name: 'Алексей Новиков', email: 'alex@example.com' },
        ];

        for (const user of users) {
            const hashedPassword = await hashPassword('password123');
            await User.create({
                ...user,
                password: hashedPassword,
            });
        }
        console.log('Тестовые пользователи созданы');

        console.log('Seed завершен!');
        process.exit(0);
    } catch (error) {
        console.error('Ошибка:', error.message);
        process.exit(1);
    }
}

seed();
