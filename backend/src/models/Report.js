const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    reporter: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'A report must have a reporter']
    },
    targetType: {
        type: String,
        enum: ['service', 'user'],
        required: [true, 'Please specify the target type']
    },
    targetService: {
        type: mongoose.Schema.ObjectId,
        ref: 'Service'
    },
    targetUser: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    reason: {
        type: String,
        enum: ['inappropriate', 'fake_profile', 'scam', 'other'],
        required: [true, 'Please provide a reason for the report']
    },
    details: {
        type: String,
        maxlength: [1000, 'Details cannot exceed 1000 characters']
    },
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
        default: 'pending'
    },
    adminNotes: {
        type: String
    },
    resolvedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    resolvedAt: Date
}, {
    timestamps: true
});

// Populate references on find
reportSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'reporter',
        select: 'name email photo'
    }).populate({
        path: 'targetService',
        select: 'title host images'
    }).populate({
        path: 'targetUser',
        select: 'name email photo role'
    });
    next();
});

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;
