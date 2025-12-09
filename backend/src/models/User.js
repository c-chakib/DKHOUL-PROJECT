const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please tell us your name!'],
        },
        email: {
            type: String,
            required: [true, 'Please provide your email'],
            unique: true,
            lowercase: true,
            validate: [validator.isEmail, 'Please provide a valid email'],
        },
        photo: String, // Avatar URL
        bio: {
            type: String,
            maxlength: 500
        },
        role: {
            type: String,
            enum: ['tourist', 'host', 'admin', 'superadmin'],
            default: 'tourist',
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        password: {
            type: String,
            required: [true, 'Please provide a password'],
            minlength: 8,
            select: false,
        },
        passwordConfirm: {
            type: String,
            required: [true, 'Please confirm your password'],
            validate: {
                // This only works on CREATE and SAVE!!!
                validator: function (el) {
                    return el === this.password;
                },
                message: 'Passwords are not the same!',
            },
        },
        // Password Reset Fields
        passwordResetToken: String,
        passwordResetExpires: Date,
        passwordChangedAt: Date,
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

userSchema.pre('save', async function () {
    // Only run this function if password was actually modified
    if (!this.isModified('password')) return;

    // Hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);

    // Delete passwordConfirm field
    this.passwordConfirm = undefined;
});

// Update passwordChangedAt when password is modified
// Update passwordChangedAt when password is modified
userSchema.pre('save', async function () {
    if (!this.isModified('password') || this.isNew) return;

    this.passwordChangedAt = Date.now() - 1000;
});

userSchema.methods.correctPassword = async function (
    candidatePassword,
    userPassword
) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

// Check if password was changed after token was issued
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(
            this.passwordChangedAt.getTime() / 1000,
            10
        );
        return JWTTimestamp < changedTimestamp;
    }
    return false;
};

// Create password reset token
userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Token expires in 10 minutes
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
