const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const jwt = require('jsonwebtoken');

describe('Admin Endpoints', () => {
    let adminToken;
    let superAdminToken;
    let userToken;

    beforeEach(async () => {
        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@admin.com',
            password: 'Password123!',
            passwordConfirm: 'Password123!',
            role: 'admin'
        });
        adminToken = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        const superAdmin = await User.create({
            name: 'Super Admin',
            email: 'super@admin.com',
            password: 'Password123!',
            passwordConfirm: 'Password123!',
            role: 'superadmin'
        });
        superAdminToken = jwt.sign({ id: superAdmin._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        const normalUser = await User.create({
            name: 'Normal User',
            email: 'normal@user.com',
            password: 'Password123!',
            passwordConfirm: 'Password123!',
            role: 'user'
        });
        userToken = jwt.sign({ id: normalUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    });

    it('should allow admin to access stats', async () => {
        const res = await request(app)
            .get('/api/v1/admin/stats')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.data).toHaveProperty('usersCount');
    });

    it('should deny non-admin access to stats', async () => {
        const res = await request(app)
            .get('/api/v1/admin/stats')
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.statusCode).toEqual(403);
    });

    it('should allow superadmin to get all users (God Mode)', async () => {
        const res = await request(app)
            .get('/api/v1/admin/users')
            .set('Authorization', `Bearer ${superAdminToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.data.users).toBeDefined();
    });

    it('should deny normal admin access to God Mode routes', async () => {
        const res = await request(app)
            .get('/api/v1/admin/users')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toEqual(403);
    });
});
