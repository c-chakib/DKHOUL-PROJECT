const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    host: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: {
        type: String,
        required: true,
        enum: ['SKILL', 'SPACE', 'CONNECT']
    },
    images: {
        type: [String],
        required: true,
        validate: {
            validator: (v) => v.length <= 4,
            message: 'Max 4 images'
        }
    },
    location: {
        type: { type: String, default: 'Point', enum: ['Point'] },
        coordinates: [Number],
        address: String
    },
    city: {
        type: String,
        required: true,
        enum: ['Casablanca', 'Marrakech', 'Agadir', 'Tanger', 'Fès', 'Rabat', 'Essaouira', 'Merzouga']
    },
    duration: { type: Number },
    maxParticipants: { type: Number, default: 10 },
    languages: { type: [String] },
    included: { type: [String], default: [] },
    requirements: { type: [String], default: [] },
    availability: [{
        date: Date,
        slots: { type: Number, default: 10 }
    }],
    metadata: Object,
    rating: { type: Number, default: 0 }
}, { timestamps: true });

serviceSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Service', serviceSchema);