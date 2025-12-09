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
    
    // GeoJSON (Indispensable pour la carte)
    location: {
        type: { type: String, default: 'Point', enum: ['Point'] },
        coordinates: [Number], // [Longitude, Latitude]
        address: String
    },
    
    city: {
        type: String,
        required: true,
        enum: ['Casablanca', 'Marrakech', 'Agadir', 'Tanger', 'Fès', 'Rabat', 'Essaouira', 'Merzouga']
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

module.exports = mongoose.model('Service', serviceSchema);