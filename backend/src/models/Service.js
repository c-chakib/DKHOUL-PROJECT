const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    title: {
        fr: { type: String },
        en: { type: String },
        ar: { type: String }
    },
    host: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
    description: {
        fr: { type: String },
        en: { type: String },
        ar: { type: String }
    },
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

    // GeoJSON (Indispensable pour la carte)
    location: {
        type: { type: String, default: 'Point', enum: ['Point'] },
        coordinates: [Number], // [Longitude, Latitude]
        address: String
    },

    city: {
        type: String,
        required: true,
        enum: ['Casablanca', 'Marrakech', 'Agadir', 'Tanger', 'Fès', 'Rabat', 'Essaouira', 'Merzouga', 'Chefchaouen', 'Ouarzazate']
    },

    duration: { type: Number, required: true }, // En minutes
    maxParticipants: { type: Number, default: 10 },

    // 👇 LE NOUVEAU CHAMP CRUCIAL
    timeSlots: {
        type: [String], // Format "HH:mm" ex: ["09:00", "14:00"]
        required: true,
        default: ["09:00", "14:00"]
    },

    languages: { type: [String], enum: ['Darija', 'Français', 'Anglais', 'Espagnol'] },
    included: { type: [String], default: [] },
    requirements: { type: [String], default: [] },

    // On garde availability pour gérer les jours fériés ou exceptions plus tard
    availability: [{
        date: Date,
        slots: { type: Number, default: 10 }
    }],

    metadata: Object,
    rating: { type: Number, default: 0 }
}, { timestamps: true });

serviceSchema.index({ location: '2dsphere' });
serviceSchema.index({ price: 1 });
serviceSchema.index({ category: 1 });
serviceSchema.index({ city: 1 });
serviceSchema.index({ host: 1 });
serviceSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Service', serviceSchema);