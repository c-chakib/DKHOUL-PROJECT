const Stripe = require('stripe');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const AppError = require('../utils/appError');
const { sendBookingConfirmation } = require('../utils/email');
const { checkSlotAvailability, sendNewBookingEmails, sendStatusUpdateEmail } = require('../utils/bookingUtils');

const stripeKey = process.env.STRIPE_SECRET_KEY;
if (!stripeKey) {
    console.warn('STRIPE_SECRET_KEY not found in environment variables!. Payment features will fail.'.red);
}
const stripe = stripeKey ? Stripe(stripeKey) : null;

/**
 * Check availability for a date before booking
 */
exports.checkAvailability = async (req, res, next) => {
    try {
        const { serviceId, date } = req.body;

        if (!serviceId || !date) {
            return next(new AppError('Please provide serviceId and date', 400));
        }

        const service = await Service.findById(serviceId);
        if (!service) {
            return next(new AppError('Service not found', 404));
        }

        const availability = checkSlotAvailability(service, date);

        if (!availability.available) {
            return res.status(200).json({
                status: 'success',
                available: false,
                message: availability.error
            });
        }

        res.status(200).json({
            status: 'success',
            available: true,
            slotsRemaining: availability.slots
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Create Payment Intent with availability check
 */
exports.createPaymentIntent = async (req, res, next) => {
    try {
        const { serviceId, price, date, time, guests, duration } = req.body;

        if (!serviceId || !price) {
            return next(new AppError('Please provide serviceId and price', 400));
        }

        const service = await Service.findById(serviceId);
        if (!service) {
            return next(new AppError('Service not found', 404));
        }

        // Check availability if date is provided
        if (date) {
            const availability = checkSlotAvailability(service, date);
            if (!availability.available) {
                return next(new AppError(availability.error || 'Créneau complet ou indisponible', 400));
            }
        }

        // 1. Create Stripe PaymentIntent
        // Amount must be in cents/centimes for Stripe
        const amount = Math.round(price * 100);

        // console.log(`Creating payment intent for ${amount} MAD (centimes)`);

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: 'mad',
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                serviceId: serviceId,
                userId: req.user.id,
                date: date || '',
                time: time || '',
                guests: guests || 1
            }
        });

        // 2. Create Booking in DB (Pending)
        const newBooking = await Booking.create({
            tourist: req.user.id,
            service: serviceId,
            price: price,
            status: 'pending',
            paymentIntentId: paymentIntent.id,
            bookingDate: date || null,
            time: time || null,
            guests: guests || 1,
            duration: duration || 1
        });

        // 3. Send Client Secret to Frontend
        // 3. Send Client Secret to Frontend

        const fullService = await Service.findById(serviceId).populate('host');

        if (fullService) {
             await sendNewBookingEmails(fullService, req.user, newBooking);
        }

        res.status(200).json({
            status: 'success',
            clientSecret: paymentIntent.client_secret,
            bookingId: newBooking._id
        });

    } catch (error) {
        console.error('Stripe Error:', error);
        next(new AppError(`Payment processing failed: ${error.message}`, 500));
    }
};

/**
 * Confirm booking and decrement availability slot
 */
exports.confirmBooking = async (req, res, next) => {
    try {
        const { bookingId } = req.params;

        const booking = await Booking.findById(bookingId)
            .populate('service')
            .populate('tourist');

        if (!booking) {
            return next(new AppError('Booking not found', 404));
        }

        // Update booking status
        // DO NOT Change this to 'confirmed', this endpoint is called AFTER stripe payment success 
        // Logic: Paid -> Pending (Waiting for Host Approval)
        // OR: Paid -> Confirmed (Auto-confirm)
        // As per new requirements: Host Must Manually Accept.
        // So after payment, status is 'pending' (default) but paymentStatus is 'paid'.

        booking.paymentStatus = 'paid';
        // booking.status remains 'pending' by default or we enforce it
        booking.status = 'pending';

        await booking.save();

        // Decrement availability slot if date was specified
        if (booking.bookingDate && booking.service) {
            const service = await Service.findById(booking.service._id);
            const requestedDate = new Date(booking.bookingDate);
            requestedDate.setHours(0, 0, 0, 0);

            const slotIndex = service.availability.findIndex(a => {
                const slotDate = new Date(a.date);
                slotDate.setHours(0, 0, 0, 0);
                return slotDate.getTime() === requestedDate.getTime();
            });

            if (slotIndex !== -1 && service.availability[slotIndex].slots > 0) {
                service.availability[slotIndex].slots -= 1;
                await service.save();
                // console.log(`Decremented slot for ${service.title} on ${booking.bookingDate}`);
            }
        }

        // Send confirmation email (Can be 'Payment Received, waiting for host' or similar)
        if (booking.tourist && booking.service) {
            // MOVED TO updateBookingStatus (When host explicitly accepts)
            // Prevent sending "Confirmed" email while status is still 'pending'
            // await sendBookingConfirmation(booking.tourist, booking, booking.service);
            // console.log('Skipping immediate confirmation email - waiting for Host Approval.');
        }

        res.status(200).json({
            status: 'success',
            message: 'Booking paid and pending approval',
            data: { booking }
        });

    } catch (error) {
        next(error);
    }
};

exports.getMyBookings = async (req, res, next) => {
    try {
        // Find bookings where current user is tourist.
        const bookings = await Booking.find({ tourist: req.user.id })
            .populate({
                path: 'service',
                populate: { path: 'host' }
            })
            .sort('-createdAt');

        res.status(200).json({
            status: 'success',
            results: bookings.length,
            data: {
                bookings
            }
        });
    } catch (err) {
        next(err);
    }
};

/**
 * NEW: Get bookings for services hosted by the current user
 */
exports.getHostBookings = async (req, res, next) => {
    try {
        // 1. Find all services owned by host
        const services = await Service.find({ host: req.user.id });
        const serviceIds = services.map(s => s._id);

        // 2. Find bookings for these services
        const bookings = await Booking.find({ service: { $in: serviceIds } })
            .populate('tourist', 'name email photo')
            .populate('service', 'title price images')
            .sort('-createdAt');

        res.status(200).json({
            status: 'success',
            results: bookings.length,
            data: {
                bookings
            }
        });
    } catch (err) {
        next(err);
    }
};

/**
 * NEW: Update Booking Status (Accept/Reject)
 */
exports.updateBookingStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'confirmed' or 'cancelled'

        if (!['confirmed', 'cancelled'].includes(status)) {
            return next(new AppError('Invalid status. Use confirmed or cancelled', 400));
        }

        const booking = await Booking.findById(id).populate('service');
        if (!booking) {
            return next(new AppError('Booking not found', 404));
        }

        // Verify that the current user is the host of the service
        // booking.service is populated, so check booking.service.host
        // Note: service.host might be an ID or populated object depending on Service model schema, 
        // usually in Mongoose refs are IDs unless populated. 
        // Let's check Service model ID comparison.

        // We need to ensure we compare strings
        if (booking.service.host.toString() !== req.user.id) {
            return next(new AppError('You are not authorized to manage this booking', 403));
        }

        booking.status = status;

        // If cancelled, logic for refund could go here (Stripe Refund API)
        if (status === 'cancelled') {
            booking.paymentStatus = 'refunded'; // Mark as refunded in DB for now
            // TODO: Trigger Stripe Refund
        }

        await booking.save();

        // --- EMAIL STATUS NOTIFICATION ---
        const fullBooking = await Booking.findById(id).populate('tourist').populate('service');
        await sendStatusUpdateEmail(fullBooking);

        res.status(200).json({
            status: 'success',
            data: {
                booking
            }
        });

    } catch (err) {
        next(err);
    }
};

exports.getAllBookings = async (req, res, next) => {
    try {
        const bookings = await Booking.find();
        res.status(200).json({
            status: 'success',
            results: bookings.length,
            data: {
                bookings
            }
        });
    } catch (_err) {
        next(new AppError('No bookings found', 404));
    }
};

/**
 * Get single booking by ID
 */
exports.getBooking = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate({
                path: 'service',
                populate: { path: 'host' }
            })
            .populate('tourist');

        if (!booking) {
            return next(new AppError('No booking found with that ID', 404));
        }

        // Access Control
        // Depending on population, IDs might be objects or strings
        const userId = req.user.id;
        const touristId = booking.tourist._id ? booking.tourist._id.toString() : booking.tourist.toString();

        let hostId = null;
        if (booking.service && booking.service.host) {
            hostId = booking.service.host._id ? booking.service.host._id.toString() : booking.service.host.toString();
        }

        const isTourist = touristId === userId;
        const isHost = hostId === userId;
        const isAdmin = ['admin', 'superadmin'].includes(req.user.role);

        if (!isTourist && !isHost && !isAdmin) {
            return next(new AppError('You do not have permission to view this booking', 403));
        }

        res.status(200).json({
            status: 'success',
            data: {
                booking
            }
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Delete booking (Cleanup)
 */
exports.deleteBooking = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return next(new AppError('No booking found', 404));
        }

        // Check ownership (Only tourist or admin can delete)
        // Host might want to hide it, but deletion removes it for both.
        // For now, allow tourist to delete their own booking log.
        if (booking.tourist.toString() !== req.user.id && !['admin', 'superadmin'].includes(req.user.role)) {
            return next(new AppError('Not authorized to delete this booking', 403));
        }

        await Booking.findByIdAndDelete(req.params.id);

        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (err) {
        next(err);
    }
};
