const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./middlewares/errorMiddleware');

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}
app.use(express.json());

// Routes
const authRouter = require('./routes/authRoutes');
const serviceRouter = require('./routes/serviceRoutes');

app.use('/api/v1/users', authRouter);
app.use('/api/v1/services', serviceRouter);

// Routes Placeholder
app.get('/', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Welcome to DKHOUL API',
    });
});

// 404 Handler
// 404 Handler
app.all(/(.*)/, (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handler
app.use(globalErrorHandler);

module.exports = app;
