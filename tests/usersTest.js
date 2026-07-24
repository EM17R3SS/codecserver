const request = require('supertest');
const app = require('../src/app');
const User = require('../src/core/models/User');
const { hashPassword } = require('../src/lib/password');
const { generateToken } = require('../src/lib/jwt');

describe('Users API — RBAC', () => {
    let userToken, adminToken, targetUserId;

    beforeEach(async () => {
        const hashedPassword = await hashPassword('password123');

        const normalUser = await User.create({
            name: 'Regular',
            email: 'regular@example.com',
            password: hashedPassword,
            role: 'user',
        });

        const admin = await User.create({
            name: 'Admin',
            email: 'admin@example.com',
            password: hashedPassword,
            role: 'admin',
        });

        const target = await User.create({
            name: 'ToDelete',
            email: 'target@example.com',
            password: hashedPassword,
            role: 'user',
        });

        targetUserId = target._id.toString();
        userToken = generateToken({
            id: normalUser._id,
            email: normalUser.email,
            role: 'user',
        });
        adminToken = generateToken({
            id: admin._id,
            email: admin.email,
            role: 'admin',
        });
    });

    afterEach(async () => {
        await User.deleteMany({});
    });

    it('обычный user МОЖЕТ просматривать список пользователей', async () => {
        const res = await request(app)
            .get('/api/v1/users')
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
    });

    it('обычный user НЕ МОЖЕТ удалить пользователя (403)', async () => {
        const res = await request(app)
            .delete(`/api/v1/users/${targetUserId}`)
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.statusCode).toBe(403);
    });

    it('admin МОЖЕТ удалить пользователя', async () => {
        const res = await request(app)
            .delete(`/api/v1/users/${targetUserId}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(200);

        const deleted = await User.findById(targetUserId);
        expect(deleted).toBeNull();
    });

    it('запрос без токена отклоняется (401)', async () => {
        const res = await request(app).get('/api/v1/users');
        expect(res.statusCode).toBe(401);
    });
});
