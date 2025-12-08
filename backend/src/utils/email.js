/**
 * Email Utility for DKHOUL Marketplace
 * Uses Nodemailer for sending transactional emails
 */

const nodemailer = require('nodemailer');

// Create transporter (using environment variables for security)
const createTransporter = () => {
    // For production: Use a real SMTP service (Gmail, SendGrid, etc.)
    // For development: Use Mailtrap or console logging

    if (process.env.NODE_ENV === 'production') {
        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }

    // Development: Use Mailtrap or ethereal
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
        port: process.env.EMAIL_PORT || 2525,
        auth: {
            user: process.env.EMAIL_USERNAME || 'your_mailtrap_user',
            pass: process.env.EMAIL_PASSWORD || 'your_mailtrap_pass'
        }
    });
};

/**
 * Send email wrapper function
 * @param {Object} options - { to, subject, text, html }
 */
const sendEmail = async (options) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: `DKHOUL Marketplace <${process.env.EMAIL_FROM || 'noreply@dkhoul.ma'}>`,
            to: options.to,
            subject: options.subject,
            text: options.text,
            html: options.html
        };

        // In development without proper email config, just log
        if (!process.env.EMAIL_USERNAME) {
            console.log('📧 [EMAIL MOCK] Would send email:');
            console.log(`   To: ${options.to}`);
            console.log(`   Subject: ${options.subject}`);
            return { messageId: 'mock-' + Date.now() };
        }

        const info = await transporter.sendMail(mailOptions);
        console.log(`📧 Email sent: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error('❌ Email Error:', error.message);
        // Don't throw - email failure shouldn't break the main flow
        return null;
    }
};

/**
 * Send Welcome Email after registration
 */
const sendWelcomeEmail = async (user) => {
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #D4A574, #8B4513); padding: 40px; text-align: center;">
                <h1 style="color: white; margin: 0;">🇲🇦 Bienvenue sur DKHOUL!</h1>
            </div>
            <div style="padding: 30px; background: #f9f9f9;">
                <h2 style="color: #333;">Salam ${user.name}!</h2>
                <p style="color: #666; line-height: 1.6;">
                    Nous sommes ravis de vous accueillir dans la communauté DKHOUL. 
                    Découvrez des expériences authentiques au Maroc, rencontrez des guides locaux passionnés, 
                    et créez des souvenirs inoubliables.
                </p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:4200'}/marketplace" 
                       style="background: #D4A574; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                        Explorer les expériences
                    </a>
                </div>
                <p style="color: #999; font-size: 12px; text-align: center;">
                    © 2024 DKHOUL Marketplace. Tous droits réservés.
                </p>
            </div>
        </div>
    `;

    return sendEmail({
        to: user.email,
        subject: '🇲🇦 Bienvenue sur DKHOUL - Votre aventure marocaine commence!',
        text: `Bienvenue ${user.name}! Découvrez des expériences authentiques au Maroc.`,
        html
    });
};

/**
 * Send Booking Confirmation Email
 */
const sendBookingConfirmation = async (user, booking, service) => {
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #228B22, #2E8B57); padding: 40px; text-align: center;">
                <h1 style="color: white; margin: 0;">✅ Réservation Confirmée!</h1>
            </div>
            <div style="padding: 30px; background: #f9f9f9;">
                <h2 style="color: #333;">Merci ${user.name}!</h2>
                <p style="color: #666; line-height: 1.6;">
                    Votre réservation a été confirmée avec succès. Voici les détails:
                </p>
                
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #228B22;">
                    <h3 style="margin: 0 0 10px 0; color: #333;">${service.title}</h3>
                    <p style="margin: 5px 0; color: #666;">📍 ${service.city}</p>
                    <p style="margin: 5px 0; color: #666;">💰 ${booking.price} MAD</p>
                    <p style="margin: 5px 0; color: #666;">🎫 Réf: #${booking._id.toString().slice(-8).toUpperCase()}</p>
                </div>

                <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:4200'}/dashboard" 
                       style="background: #228B22; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                        Voir mes réservations
                    </a>
                </div>
                
                <p style="color: #999; font-size: 12px; text-align: center;">
                    Gardez cet email comme confirmation de votre réservation.
                </p>
            </div>
        </div>
    `;

    return sendEmail({
        to: user.email,
        subject: `✅ Réservation Confirmée - ${service.title} | DKHOUL`,
        text: `Votre réservation pour "${service.title}" a été confirmée. Réf: #${booking._id}`,
        html
    });
};

/**
 * Send Password Reset Email
 */
const sendPasswordResetEmail = async (user, resetURL) => {
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #4B0082, #663399); padding: 40px; text-align: center;">
                <h1 style="color: white; margin: 0;">🔐 Réinitialisation du mot de passe</h1>
            </div>
            <div style="padding: 30px; background: #f9f9f9;">
                <h2 style="color: #333;">Bonjour ${user.name},</h2>
                <p style="color: #666; line-height: 1.6;">
                    Vous avez demandé la réinitialisation de votre mot de passe DKHOUL. 
                    Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe.
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetURL}" 
                       style="background: #D4A574; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                        Réinitialiser mon mot de passe
                    </a>
                </div>
                
                <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
                    <p style="margin: 0; color: #856404; font-size: 14px;">
                        ⚠️ Ce lien expire dans <strong>10 minutes</strong>. 
                        Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
                    </p>
                </div>
                
                <p style="color: #999; font-size: 12px;">
                    Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur:<br>
                    <a href="${resetURL}" style="color: #4B0082;">${resetURL}</a>
                </p>
                
                <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
                    © 2024 DKHOUL Marketplace. Tous droits réservés.
                </p>
            </div>
        </div>
    `;

    return sendEmail({
        to: user.email,
        subject: '🔐 Réinitialisation de votre mot de passe DKHOUL (10 min)',
        text: `Réinitialisez votre mot de passe: ${resetURL}. Ce lien expire dans 10 minutes.`,
        html
    });
};

module.exports = {
    sendEmail,
    sendWelcomeEmail,
    sendBookingConfirmation,
    sendPasswordResetEmail
};
