const mongoose = require('mongoose');

const aiChatSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Chat must belong to a user']
    },
    // We store history in a format compatible with Gemini API to make re-feeding context easier
    // Gemini structure: { role: 'user' | 'model', parts: [{ text: '...' }] }
    history: [
        {
            role: {
                type: String,
                enum: ['user', 'model'],
                required: true
            },
            parts: [
                {
                    text: {
                        type: String,
                        required: true
                    }
                }
            ],
            timestamp: {
                type: Date,
                default: Date.now
            }
        }
    ],
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

// Update lastUpdated timestamp on save
// Using function without next() for Mongoose 8.x compatibility with .create()
aiChatSchema.pre('save', function () {
    this.lastUpdated = Date.now();
});

const AiChat = mongoose.model('AiChat', aiChatSchema);

module.exports = AiChat;
