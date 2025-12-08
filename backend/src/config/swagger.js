const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'DKHOUL API',
        version: '1.0.0',
        description: 'Marketplace Touristique Marocaine - API Documentation',
        contact: {
            name: 'DKHOUL Team'
        },
        license: {
            name: 'MIT'
        }
    },
    servers: [
        {
            url: 'http://localhost:5000',
            description: 'Development server'
        }
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description: 'Enter JWT token'
            }
        },
        schemas: {
            User: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    name: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    role: { type: 'string', enum: ['tourist', 'host', 'admin', 'superadmin'] },
                    photo: { type: 'string' }
                }
            },
            Service: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    title: { type: 'string' },
                    description: { type: 'string' },
                    price: { type: 'number' },
                    category: { type: 'string', enum: ['SPACE', 'SKILL', 'CONNECT'] },
                    city: { type: 'string' },
                    images: { type: 'array', items: { type: 'string' } },
                    host: { $ref: '#/components/schemas/User' }
                }
            },
            Booking: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    tourist: { $ref: '#/components/schemas/User' },
                    service: { $ref: '#/components/schemas/Service' },
                    price: { type: 'number' },
                    status: { type: 'string', enum: ['pending', 'paid', 'cancelled'] }
                }
            },
            Error: {
                type: 'object',
                properties: {
                    status: { type: 'string' },
                    message: { type: 'string' }
                }
            }
        }
    },
    tags: [
        { name: 'Auth', description: 'Authentication endpoints' },
        { name: 'Users', description: 'User management' },
        { name: 'Services', description: 'Service/Experience CRUD' },
        { name: 'Bookings', description: 'Booking and payment' },
        { name: 'Admin', description: 'Admin dashboard' },
        { name: 'AI', description: 'AI-powered features' }
    ]
};

const options = {
    swaggerDefinition,
    apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
