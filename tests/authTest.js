const request = require('supertest');
const app = require('../src/app');
const User = require('../src/core/models/User');

describe('Auth API', () => {
    afterEach(async () => {
        await User.deleteMany({});
    });

    it('регистрирует нового пользователя и выдаёт JWT', async () => {
        const res = await request(app).post('/api/v1/auth/register').send({
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123',
        });

        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.token).toBeDefined();
        expect(res.body.data.user.password).toBeUndefined();
    });

    it('не даёт зарегистрировать существующий email', async () => {
        await request(app).post('/api/v1/auth/register').send({
            name: 'A',
            email: 'dup@example.com',
            password: 'password123',
        });

        const res = await request(app).post('/api/v1/auth/register').send({
            name: 'B',
            email: 'dup@example.com',
            password: 'password123',
        });

        expect(res.statusCode).toBe(400);
    });

    it('логинит с правильными данными', async () => {
        await request(app).post('/api/v1/auth/register').send({
            name: 'Login',
            email: 'login@example.com',
            password: 'password123',
        });

        const res = await request(app).post('/api/v1/auth/login').send({
            email: 'login@example.com',
            password: 'password123',
        });

        expect(res.statusCode).toBe(200);
        expect(res.body.data.token).toBeDefined();
    });

    it('блокирует аккаунт после N неверных попыток', async () => {
        await request(app).post('/api/v1/auth/register').send({
            name: 'Lock',
            email: 'lock@example.com',
            password: 'password123',
        });

        for (let i = 0; i < 5; i++) {
            await request(app).post('/api/v1/auth/login').send({
                email: 'lock@example.com',
                password: 'wrong',
            });
        }

        const res = await request(app).post('/api/v1/auth/login').send({
            email: 'lock@example.com',
            password: 'password123',
        });

        expect(res.statusCode).toBe(429);
    });
});
