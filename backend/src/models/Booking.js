const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    tourist: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Booking must belong to a tourist']
    },
    service: {
        type: mongoose.Schema.ObjectId,
        ref: 'Service',
        required: [true, 'Booking must belong to a service']
    },
    price: {
        type: Number,
        required: [true, 'Booking must have a price']
    },
    status: {
        type: String,
        enum: ['pending', 'paid', 'cancelled'],
        default: 'pending'
    },
    paymentIntentId: {
        type: String
    },
    bookingDate: Date,
    time: String,
    guests: { type: Number, default: 1 },
    duration: { type: Number, default: 1 }
}, {
    timestamps: true
});

// Pre-populate tourist and service info when querying
// Pre-populate tourist and service info when querying
bookingSchema.pre(/^find/, async function () {
    this.populate({
        path: 'tourist',
        select: 'name email'
    }).populate({
        path: 'service',
        select: 'title price host'
    });
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
