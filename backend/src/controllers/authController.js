const { promisify } = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/appError');
const { sendWelcomeEmail, sendPasswordResetEmail } = require('../utils/email');

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);

    // Remove password from output
    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user,
        },
    });
};

exports.signup = async (req, res, next) => {
    try {
        // console.log('Signup Entry');

        // Sanitize
        req.body.email = String(req.body.email);
        req.body.password = String(req.body.password);
        req.body.passwordConfirm = String(req.body.passwordConfirm);

        const newUser = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            passwordConfirm: req.body.passwordConfirm,
            role: req.body.role || 'user',
            isVerified: req.body.isVerified,
        });

        console.log('User created:', newUser._id);

        // Use non-blocking email send
        sendWelcomeEmail(newUser).catch(err => console.error('Welcome email failed:', err));

        // Emit Socket Event for Admin Dashboard
        try {
            const socketModule = require('../socket');
            const io = socketModule.getIO();
            io.emit('user-created', newUser);
        } catch (socketErr) {
            console.error('Socket emit failed:', socketErr.message);
        }

        createSendToken(newUser, 201, res);
    } catch (err) {
        console.error('Signup Error Detailed:', err);
        if (typeof next === 'function') {
            next(err);
        } else {
            console.error('CRITICAL: next is not a function inside signup catch!', err);
            // Fallback response if next is busted
            res.status(400).json({ status: 'error', message: err.message });
        }
    }
};

exports.login = async (req, res, next) => {
    try {
        const email = String(req.body.email);
        const password = String(req.body.password);

        // 1) Check if email and password exist.log('Login Attempt for:', email);

        if (!email || !password) {
            return next(new AppError('Please provide email and password!', 400));
        }

        const user = await User.findOne({ email }).select('+password');
        console.log('User found:', user ? 'Yes' : 'No');

        if (!user || !(await user.correctPassword(password, user.password))) {
            console.error('Login Failed: Incorrect email or password');
            return next(new AppError('Incorrect email or password', 401));
        }

        console.log('Login Successful for', email);
        createSendToken(user, 200, res);
    } catch (err) {
        console.error('Login Error:', err);
        next(err);
    }
};

exports.googleLogin = async (req, res, next) => {
    try {
        const { googleToken, email, name } = req.body;
        // console.log('Google Login Attempt for:', email);

        if (!googleToken) {
            return next(new AppError('Google Token is required', 400));
        }

        if (!email) {
            return next(new AppError('Email is required for Google Login (Mock)', 400));
        }

        let user = await User.findOne({ email });
        console.log('Google User found:', user ? 'Yes' : 'No');

        if (!user) {
            console.log('Creating new Google User');
            // Generate a secure random password
            const randomPassword = crypto.randomBytes(16).toString('hex') + 'A!1';

            user = await User.create({
                name: name || 'Google User',
                email: email,
                password: randomPassword,
                passwordConfirm: randomPassword,
                role: 'tourist',
                isVerified: true
            });
        }

        createSendToken(user, 200, res);

    } catch (err) {
        console.error('Google Login Error:', err);
        next(err);
    }
};

/**
 * Forgot Password - Send reset token via email
 */
exports.forgotPassword = async (req, res, next) => {
    try {
        // 1) Get user based on POSTed email
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return next(new AppError('Aucun utilisateur avec cette adresse email.', 404));
        }

        // 2) Generate the random reset token
        const resetToken = user.createPasswordResetToken();
        await user.save({ validateBeforeSave: false });

        // 3) Send it to user's email
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
        const resetURL = `${frontendUrl}/reset-password/${resetToken}`;

        try {
            await sendPasswordResetEmail(user, resetURL);

            res.status(200).json({
                status: 'success',
                message: 'Token envoyé par email!'
            });
        } catch (err) {
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            await user.save({ validateBeforeSave: false });

            console.error('Email error:', err);
            return next(new AppError("Erreur lors de l'envoi de l'email. Réessayez plus tard.", 500));
        }
    } catch (err) {
        next(err);
    }
};

/**
 * Reset Password - Verify token and set new password
 */
exports.resetPassword = async (req, res, next) => {
    try {
        // 1) Get user based on the token
        const hashedToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');

        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() }
        });

        // 2) If token has not expired, and there is user, set the new password
        if (!user) {
            return next(new AppError('Token invalide ou expiré.', 400));
        }

        // 3) Update password
        user.password = req.body.password;
        user.passwordConfirm = req.body.passwordConfirm;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        // 4) Log the user in, send JWT
        createSendToken(user, 200, res);
    } catch (err) {
        next(err);
    }
};

exports.protect = async (req, res, next) => {
    console.time('ProtectMiddleware');
    try {
        // 1) Getting token and check of it's there
        let token;
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        ) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            console.timeEnd('ProtectMiddleware');
            return next(
                new AppError('You are not logged in! Please log in to get access.', 401)
            );
        }

        // 2) Verification token
        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

        // 3) Check if user still exists
        const currentUser = await User.findById(decoded.id);
        if (!currentUser) {
            console.timeEnd('ProtectMiddleware');
            return next(
                new AppError(
                    'The user belonging to this token does no longer exist.',
                    401
                )
            );
        }

        // 4) Check if user changed password after the token was issued
        if (currentUser.changedPasswordAfter && currentUser.changedPasswordAfter(decoded.iat)) {
            console.timeEnd('ProtectMiddleware');
            return next(
                new AppError('User recently changed password! Please log in again.', 401)
            );
        }

        // GRANT ACCESS TO PROTECTED ROUTE
        req.user = currentUser;
        console.timeEnd('ProtectMiddleware');
        next();
    } catch (err) {
        console.timeEnd('ProtectMiddleware');
        next(err);
    }
};

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        // roles ['admin', 'host']. role='tourist'
        if (!roles.includes(req.user.role)) {
            return next(
                new AppError('You do not have permission to perform this action', 403)
            );
        }

        next();
    };
};
