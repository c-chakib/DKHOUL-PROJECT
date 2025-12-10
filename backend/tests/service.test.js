const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const Service = require('../src/models/Service');
const jwt = require('jsonwebtoken');

describe('Service Endpoints', () => {
    let token;
    let userId;

    beforeEach(async () => {
        const user = await User.create({
            name: 'Service Host',
            email: 'host@services.com',
            password: 'Password123!',
            passwordConfirm: 'Password123!',
            role: 'guide' // Must be guide/admin to create service usually
        });
        userId = user._id;
        token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    });

    it('should create a new service', async () => {
        const res = await request(app)
            .post('/api/v1/services')
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'Test Service',
                description: 'A test service description for testing',
                price: 100,
                category: 'SPACE',
                city: 'Casablanca',
                duration: 1,
                location: {
                    type: 'Point',
                    coordinates: [-7.6, 33.5]
                }
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body.data.doc).toHaveProperty('title', 'Test Service');
    });

    it('should get all services', async () => {
        await Service.create({
            title: 'Existing Service',
            description: 'Desc',
            price: 50,
            category: 'SKILL',
            host: userId,
            location: { type: 'Point', coordinates: [0, 0] }
        });

        const res = await request(app)
            .get('/api/v1/services');

        expect(res.statusCode).toEqual(200);
        expect(res.body.results).toBeGreaterThanOrEqual(1);
    });

    it('should get service by id', async () => {
        const service = await Service.create({
            title: 'Detail Service',
            description: 'Desc',
            price: 50,
            category: 'CONNECT',
            host: userId,
            location: { type: 'Point', coordinates: [0, 0] }
        });

        const res = await request(app)
            .get(`/api/v1/services/${service._id}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.data.doc.title).toEqual('Detail Service');
    });
});
