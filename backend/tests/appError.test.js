const AppError = require('../src/utils/appError');

describe('AppError Unit Tests', () => {
    it('should create an AppError with correct properties', () => {
        const err = new AppError('Test Message', 404);
        expect(err.message).toBe('Test Message');
        expect(err.statusCode).toBe(404);
        expect(err.status).toBe('fail');
        expect(err.isOperational).toBe(true);
    });

    it('should have "error" status for 500 code', () => {
        const err = new AppError('Server Error', 500);
        expect(err.status).toBe('error');
    });

    it('should capture stack trace', () => {
        const err = new AppError('Test', 400);
        expect(err.stack).toBeDefined();
    });
});
