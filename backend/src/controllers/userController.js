const User = require('../models/User');
const AppError = require('../utils/appError');

/**
 * Filter object to only allow certain fields
 */
const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
};

/**
 * Get current user profile
 */
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        res.status(200).json({
            status: 'success',
            data: { user }
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Update current user profile (NOT password)
 */
exports.updateMe = async (req, res, next) => {
    try {
        // 1) Create error if user POSTs password data
        if (req.body.password || req.body.passwordConfirm) {
            return next(
                new AppError(
                    'This route is not for password updates. Please use /updateMyPassword.',
                    400
                )
            );
        }

        // 2) Filter out unwanted fields
        const filteredBody = filterObj(req.body, 'name', 'email', 'bio');

        // 3) If avatar uploaded, add photo URL
        if (req.file) {
            // Check if it's base64 or file path
            if (req.file.filename) {
                filteredBody.photo = `/uploads/images/${req.file.filename}`;
            } else if (req.file.buffer) {
                const b64 = Buffer.from(req.file.buffer).toString('base64');
                filteredBody.photo = `data:${req.file.mimetype};base64,${b64}`;
            }
        }

        // 4) Update user document
        const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            status: 'success',
            data: { user: updatedUser }
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Update current user password
 */
exports.updateMyPassword = async (req, res, next) => {
    try {
        const { currentPassword, password, passwordConfirm } = req.body;

        // 1) Get user from collection
        const user = await User.findById(req.user.id).select('+password');

        // 2) Check if POSTed current password is correct
        if (!(await user.correctPassword(currentPassword, user.password))) {
            return next(new AppError('Votre mot de passe actuel est incorrect', 401));
        }

        // 3) If so, update password
        user.password = password;
        user.passwordConfirm = passwordConfirm;
        await user.save();

        // 4) Log user in, send JWT
        const jwt = require('jsonwebtoken');
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN
        });

        user.password = undefined;

        res.status(200).json({
            status: 'success',
            token,
            data: { user }
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Get all users (Admin only)
 */
exports.getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find();

        res.status(200).json({
            status: 'success',
            results: users.length,
            data: { users }
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Delete current user account
 */
exports.deleteMe = async (req, res, next) => {
    try {
        await User.findByIdAndDelete(req.user.id);

        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (err) {
        next(err);
    }
};
