const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const jwt = require('jsonwebtoken');

describe('User Endpoints', () => {
    let token;
    const testUser = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        passwordConfirm: 'password123',
        role: 'user'
    };

    beforeEach(async () => {
        // Create a user and generate token
        const user = await User.create(testUser);
        const secret = process.env.JWT_SECRET || 'test-secret-key-123';
        token = jwt.sign({ id: user._id }, secret, { expiresIn: '1h' });
    });

    it('should get current user profile', async () => {
        const res = await request(app)
            .get('/api/v1/users/me')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.data.data).toHaveProperty('email', testUser.email);
    });

    it('should update user details', async () => {
        const res = await request(app)
            .patch('/api/v1/users/updateMe')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'John Updated'
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body.data.user.name).toEqual('John Updated');
    });

    it('should fail to access without token', async () => {
        const res = await request(app)
            .get('/api/v1/users/me');

        expect(res.statusCode).toEqual(401);
    });
});
