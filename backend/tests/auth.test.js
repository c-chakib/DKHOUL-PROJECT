const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');

describe('Auth Endpoints', () => {
    const testUser = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
        passwordConfirm: 'Password123!',
        role: 'tourist'
    };

    it('should register a new user', async () => {
        const res = await request(app)
            .post('/api/v1/users/signup')
            .send(testUser);

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('token');
        expect(res.body.data.user).toHaveProperty('email', testUser.email);
    });

    it('should login with valid credentials', async () => {
        // First register the user (or assume separate test env)
        // Since we clear DB afterEach, we need to create user first
        await User.create({
            name: testUser.name,
            email: testUser.email,
            password: testUser.password,
            passwordConfirm: testUser.passwordConfirm,
            role: testUser.role
        });

        const res = await request(app)
            .post('/api/v1/users/login')
            .send({
                email: testUser.email,
                password: testUser.password
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('token');
    });

    it('should not login with incorrect password', async () => {
        await User.create({
            name: testUser.name,
            email: testUser.email,
            password: testUser.password,
            passwordConfirm: testUser.passwordConfirm,
            role: testUser.role
        });

        const res = await request(app)
            .post('/api/v1/users/login')
            .send({
                email: testUser.email,
                password: 'wrongpassword'
            });

        expect(res.statusCode).toEqual(401);
    });
});
