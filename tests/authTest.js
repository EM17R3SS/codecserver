const request = require('supertest');
const app = require('../src/app');
const User = require('../src/core/models/User');

describe('Auth API', () => {
    afterEach(async () => {
        await User.deleteMany({});
    });

    describe('Registration', () => {
        it('регистрирует нового пользователя и выдаёт JWT', async () => {
            const res = await request(app).post('/api/v1/auth/register').send({
                name: 'Test User',
                email: 'test@example.com',
                password: 'Password123',
            });

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.token).toBeDefined();
            expect(res.body.data.user.password).toBeUndefined();
        });

        it('не даёт зарегистрировать существующий email', async () => {
            await request(app).post('/api/v1/auth/register').send({
                name: 'SA',
                email: 'dup@example.com',
                password: 'Password123',
            });

            const res = await request(app).post('/api/v1/auth/register').send({
                name: 'SA',
                email: 'dup@example.com',
                password: 'Password123',
            });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('требует пароль минимум 8 символов', async () => {
            const res = await request(app).post('/api/v1/auth/register').send({
                name: 'Test',
                email: 'test@example.com',
                password: 'Pass12',
            });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toContain('минимум 8');
        });

        it('требует пароль с прописными и строчными буквами и цифрами', async () => {
            const res = await request(app).post('/api/v1/auth/register').send({
                name: 'Test',
                email: 'test@example.com',
                password: 'password123',
            });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toContain('прописные');
        });

        it('требует валидный email', async () => {
            const res = await request(app).post('/api/v1/auth/register').send({
                name: 'Test',
                email: 'invalid-email',
                password: 'Password123',
            });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toContain('email');
        });
    });

    describe('Login', () => {
        it('логинит с правильными данными', async () => {
            await request(app).post('/api/v1/auth/register').send({
                name: 'Login',
                email: 'login@example.com',
                password: 'Password123',
            });

            const res = await request(app).post('/api/v1/auth/login').send({
                email: 'login@example.com',
                password: 'Password123',
            });

            expect(res.statusCode).toBe(200);
            expect(res.body.data.token).toBeDefined();
        });

        it('отклоняет неверный пароль', async () => {
            await request(app).post('/api/v1/auth/register').send({
                name: 'Login',
                email: 'login@example.com',
                password: 'Password123',
            });

            const res = await request(app).post('/api/v1/auth/login').send({
                email: 'login@example.com',
                password: 'WrongPassword123',
            });

            expect(res.statusCode).toBe(401);
            expect(res.body.success).toBe(false);
        });

        it('отклоняет несуществующий email', async () => {
            const res = await request(app).post('/api/v1/auth/login').send({
                email: 'nonexistent@example.com',
                password: 'Password123',
            });

            expect(res.statusCode).toBe(401);
        });
    });

    describe('Account Lockout', () => {
        it('блокирует аккаунт после N неверных попыток', async () => {
            await request(app).post('/api/v1/auth/register').send({
                name: 'Lock',
                email: 'lock@example.com',
                password: 'Password123',
            });

            for (let i = 0; i < 5; i++) {
                await request(app).post('/api/v1/auth/login').send({
                    email: 'lock@example.com',
                    password: 'WrongPassword',
                });
            }

            const res = await request(app).post('/api/v1/auth/login').send({
                email: 'lock@example.com',
                password: 'Password123',
            });

            expect(res.statusCode).toBe(429);
            expect(res.body.message).toContain('заблокирован');
        });
    });

    describe('Rate Limiting', () => {
        it('ограничивает количество попыток входа', async () => {
            const requests = [];

            for (let i = 0; i < 15; i++) {
                requests.push(
                    request(app).post('/api/v1/auth/login').send({
                        email: `test${i}@example.com`,
                        password: 'WrongPassword',
                    }),
                );
            }

            const responses = await Promise.all(requests);
            const rateLimited = responses.some(res => res.statusCode === 429);

            expect(rateLimited).toBe(true);
        });
    });
});
