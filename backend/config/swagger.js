const swaggerJSDoc = require('swagger-jsdoc');

const options = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'DKHOUL API',
            version: '1.0.0',
            description: 'Documentation API pour DKHOUL App'
        },
        servers: [{ url: 'http://localhost:5000' }],
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        },
        security: [{ BearerAuth: [] }]
    },
    apis: ['./src/routes/*.js'],
};

module.exports = swaggerJSDoc(options);
