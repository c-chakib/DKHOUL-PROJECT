const contactController = require('../src/controllers/contactController');
const emailUtils = require('../src/utils/email');

// Mock email utility
jest.mock('../src/utils/email');

describe('Contact Controller Tests', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            body: {
                name: 'Contact User',
                email: 'contact@test.com',
                subject: 'Hello',
                message: 'Test Message'
            }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();

        emailUtils.sendEmail.mockResolvedValue(true);
    });

    it('should send contact email successfully', async () => {
        await contactController.submitContactForm(req, res, next);

        expect(emailUtils.sendEmail).toHaveBeenCalledWith(expect.objectContaining({
            to: process.env.EMAIL_FROM || 'admin@dkhoul.ma',
            subject: expect.stringContaining('Hello')
        }));

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            status: 'success'
        }));
    });

    it('should handle email sending failure', async () => {
        emailUtils.sendEmail.mockRejectedValue(new Error('Email Failed'));
        await contactController.submitContactForm(req, res, next);
        expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
});
