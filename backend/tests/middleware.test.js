const errorMiddleware = require('../src/middlewares/errorMiddleware');
const { upload, resizeAndOptimize } = require('../src/middlewares/uploadMiddleware');
const AppError = require('../src/utils/appError');
const fs = require('fs');
const path = require('path');

// Mock dependencies
jest.mock('sharp');
const sharp = require('sharp');

describe('Middleware Tests', () => {

    describe('Error Middleware', () => {
        let req, res, next;

        beforeEach(() => {
            req = {};
            res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
            next = jest.fn();
            process.env.NODE_ENV = 'development'; // Default
        });

        it('should send full error details in development', () => {
            const err = new AppError('Test Error', 400);
            errorMiddleware(err, req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                status: 'fail',
                message: 'Test Error',
                stack: expect.any(String)
            }));
        });

        it('should send generic error for unknown errors in production', () => {
            process.env.NODE_ENV = 'production';
            const err = new Error('Random Crash'); // Not AppError, no status
            errorMiddleware(err, req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                status: 'error',
                message: 'Something went very wrong!'
            });
        });

        it('should send operational error message in production', () => {
            process.env.NODE_ENV = 'production';
            const err = new AppError('Trusted Error', 404);
            errorMiddleware(err, req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                status: 'fail',
                message: 'Trusted Error'
            });
        });

        // Test specific DB error handlers logic (simulated)
        it('should handle MongoDB duplicate key error (code 11000)', () => {
            process.env.NODE_ENV = 'production';
            const err = {
                code: 11000,
                errmsg: 'dup key: { email: "taken@test.com" }',
                message: 'Duplicate key'
            };

            errorMiddleware(err, req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                message: expect.stringContaining('Duplicate field value')
            }));
        });
    });

    describe('Upload Middleware', () => {
        let req, res, next;

        beforeEach(() => {
            req = {};
            res = {};
            next = jest.fn();
            jest.clearAllMocks();
        });

        describe('resizeAndOptimize', () => {
            it('should call next if no file is present', async () => {
                await resizeAndOptimize(req, res, next);
                expect(next).toHaveBeenCalled();
            });

            it('should optimize image if file exists', async () => {
                req.file = { buffer: Buffer.from('fake'), mimetype: 'image/jpeg' };

                // Mock Sharp chain: resize().toFormat().webp().toFile()
                const toFileMock = jest.fn().mockResolvedValue({});
                const webpMock = jest.fn().mockReturnValue({ toFile: toFileMock });
                const toFormatMock = jest.fn().mockReturnValue({ webp: webpMock });
                const resizeMock = jest.fn().mockReturnValue({ toFormat: toFormatMock });

                sharp.mockReturnValue({ resize: resizeMock });

                await resizeAndOptimize(req, res, next);

                expect(sharp).toHaveBeenCalledWith(req.file.buffer);
                expect(resizeMock).toHaveBeenCalled();
                expect(toFileMock).toHaveBeenCalled();
                expect(req.file.filename).toBeDefined();
                expect(req.file.filename).toContain('.webp');
                expect(next).toHaveBeenCalled();
            });

            it('should handle sharp errors gracefully and call next', async () => {
                req.file = { buffer: Buffer.from('fake') };
                sharp.mockImplementation(() => { throw new Error('Sharp failed'); });

                // Suppress console.error for this test
                const originalError = console.error;
                console.error = jest.fn();

                await resizeAndOptimize(req, res, next);

                expect(console.error).toHaveBeenCalled();
                expect(next).toHaveBeenCalled(); // Flow continues even if opt fails

                console.error = originalError;
            });
        });
    });
});
