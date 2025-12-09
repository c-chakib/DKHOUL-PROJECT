require('dotenv').config();
const nodemailer = require('nodemailer');
const { sendEmail } = require('./src/utils/email');

console.log('--- Email Configuration Check ---');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Has SENDGRID_API_KEY:', !!process.env.SENDGRID_API_KEY);
console.log('Has EMAIL_USERNAME:', !!process.env.EMAIL_USERNAME);
console.log('Has EMAIL_PASSWORD:', !!process.env.EMAIL_PASSWORD);
console.log('Has EMAIL_HOST:', !!process.env.EMAIL_HOST);
console.log('Has EMAIL_PORT:', !!process.env.EMAIL_PORT);

(async () => {
    console.log('\n--- Attempting to Send Test Email ---');
    const result = await sendEmail({
        to: 'test@example.com', // Mock or real?
        subject: 'Test Email from Debugger',
        text: 'If you see this, email sending is working.',
        html: '<p>If you see this, email sending is working.</p>'
    });

    if (result) {
        if (result.messageId && result.messageId.startsWith('mock-')) {
            console.log('⚠️ Result: MOCK EMAIL (Logged to console only)');
        } else {
            console.log('✅ Result: REAL EMAIL SENT (Check inbox/trap)');
            console.log('Message ID:', result.messageId);
        }
    } else {
        console.log('❌ Result: FAILED to send email.');
    }
})();
