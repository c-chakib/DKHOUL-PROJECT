const { sendEmail, sendWelcomeEmail } = require('../src/utils/email');

// Mock Nodemailer
jest.mock('nodemailer');
const nodemailer = require('nodemailer');

describe('Email Utility Tests', () => {
    let sendMailMock;

    beforeEach(() => {
        sendMailMock = jest.fn().mockResolvedValue({ messageId: '123' });
        nodemailer.createTransport.mockReturnValue({
            sendMail: sendMailMock
        });

        // Setup Environement
        delete process.env.SENDGRID_API_KEY;
        delete process.env.EMAIL_HOST;
        process.env.NODE_ENV = 'test';
        process.env.EMAIL_USERNAME = 'test_user'; // Enable transporter path
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should call transporter.sendMail with correct options', async () => {
        await sendEmail({
            to: 'test@test.com',
            subject: 'Test Subject',
            text: 'Test Body'
        });

        expect(nodemailer.createTransport).toHaveBeenCalled();
        expect(sendMailMock).toHaveBeenCalledWith(expect.objectContaining({
            to: 'test@test.com',
            subject: 'Test Subject',
            text: 'Test Body'
        }));
    });

    it('should handle sendMail errors without throwing', async () => {
        sendMailMock.mockRejectedValue(new Error('SMTP connection failed'));

        // Mock console.error to keep output clean
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

        const result = await sendEmail({ to: 'fail@test.com' });

        expect(result).toBeNull();
        expect(consoleSpy).toHaveBeenCalled();

        consoleSpy.mockRestore();
    });

    it('should generate welcome email content', async () => {
        const user = { name: 'New User', email: 'new@user.com' };
        await sendWelcomeEmail(user);

        expect(sendMailMock).toHaveBeenCalledWith(expect.objectContaining({
            to: 'new@user.com',
            subject: expect.stringContaining('Bienvenue'),
            html: expect.stringMatching(/Bienvenue sur DKHOUL/) // Regex match
        }));
    });
});
