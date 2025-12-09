const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./middlewares/errorMiddleware');

const rateLimit = require('express-rate-limit');

// Swagger
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const app = express();

// 1) GLOBAL SECURITY MIDDLEWARES

// Set Security HTTP headers
app.use(helmet({
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" }
}));

// Enable CORS
app.use(cors({
    origin: 'http://localhost:4200',
    credentials: true
}));

// Limit requests from same API
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// Data sanitization against NoSQL query injection
// DISABLED: express-mongo-sanitize is incompatible with Express 5.x
// TODO: Replace with custom sanitization middleware or update package
// app.use(mongoSanitize({
//     replaceWith: '_',
//     onSanitize: ({ req, key }) => {
//         console.warn(`Potential NoSQL injection attempt detected in ${key}`);
//     }
// }));

// Data sanitization against XSS - DISABLED as xss-clean is deprecated
// Use helmet's CSP instead for XSS protection
// app.use(xss());

// Development logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'DKHOUL API Documentation',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
        persistAuthorization: true
    }
}));

// Routes
const authRouter = require('./routes/authRoutes');
const userRouter = require('./routes/userRoutes');
const serviceRouter = require('./routes/serviceRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const chatRoutes = require('./routes/chatRoutes');
const aiRoutes = require('./routes/aiRoutes');

const path = require('path');

app.use('/api/v1/users', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/services', serviceRouter);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/chats', chatRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/admin', require('./routes/adminRoutes'));
app.use('/api/v1/upload', require('./routes/uploadRoutes'));
app.use('/api/v1/contact', require('./routes/contactRoutes'));

// Serve Static Files (Uploads) with CORS headers
app.use('/uploads', (req, res, next) => {
    // Set Cross-Origin-Resource-Policy to allow cross-origin requests
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
}, express.static(path.join(__dirname, '../uploads')));

// Routes Placeholder
app.get('/', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Welcome to DKHOUL API',
        docs: 'Visit /api-docs for API documentation'
    });
});

// 404 Handler
app.all(/(.*)/, (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handler
app.use(globalErrorHandler);

module.exports = app;
