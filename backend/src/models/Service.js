const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'A service must have a title'],
            trim: true,
        },
        description: {
            type: String,
            required: [true, 'A service must have a description'],
        },
        price: {
            type: Number,
            required: [true, 'A service must have a price'],
        },
        category: {
            type: String,
            required: [true, 'A service must have a category'],
            enum: {
                values: ['SPACE', 'SKILL', 'CONNECT'],
                message: 'Category is either: SPACE, SKILL, CONNECT',
            },
        },
        images: [String],
        createdAt: {
            type: Date,
            default: Date.now,
            select: false,
        },
        host: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: [true, 'A service must belong to a Host.'],
        },
        // GeoJSON
        location: {
            type: {
                type: String,
                default: 'Point',
                enum: ['Point'],
            },
            coordinates: [Number], // [lng, lat]
            address: String,
        },
        metadata: {
            type: Object, // Flexible schema for "wifi", "difficulty", etc.
        },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Index for Geospatial Queries
serviceSchema.index({ location: '2dsphere' });

const Service = mongoose.model('Service', serviceSchema);

module.exports = Service;
