const AppError = require('./appError');

/**
 * Checks if a service has available slots for a given date.
 * @param {Object} service - The service document (Mongoose model).
 * @param {String|Date} date - The requested date.
 * @returns {Object} { available: boolean, slots: number, error: String|null }
 */
exports.checkSlotAvailability = (service, date) => {
    if (!service || !date) return { available: false, slots: 0, error: 'Invalid service or date' };

    const requestedDate = new Date(date);
    requestedDate.setHours(0, 0, 0, 0);

    const slot = service.availability.find(a => {
        const slotDate = new Date(a.date);
        slotDate.setHours(0, 0, 0, 0);
        return slotDate.getTime() === requestedDate.getTime();
    });

    if (slot && slot.slots <= 0) {
        return { available: false, slots: 0, error: 'Créneau complet ou indisponible' };
    }

    // Default: if no specific slot defined in 'availability' array, use maxParticipants? 
    // Logic in controller was: "slot ? slot.slots : service.maxParticipants"
    // But wait, the controller logic was:
    // "If no availability array or slot not found, treat as available (open by default)"
    // So distinct logic: 
    // 1. Slot exists AND slots <= 0 -> Unavailable.
    // 2. Slot exists -> return slot.slots.
    // 3. Slot doesn't exist -> return service.maxParticipants.

    const slotsRemaining = slot ? slot.slots : service.maxParticipants;
    return { available: true, slots: slotsRemaining, error: null };
};

/**
 * Handles email notifications for new bookings.
 */
exports.sendNewBookingEmails = async (service, user, booking) => {
    // Requires populated service.host
    if (service && service.host) {
        const emailModule = require('./email');
        try {
            // 1. Notify Host
            await emailModule.sendNewRequestToHost(service.host, user, booking, service);
            // 2. Ack Guest
            await emailModule.sendRequestAckToGuest(user, service);
        } catch (emailErr) {
            console.error('Failed to send booking notifications:', emailErr);
        }
    }
};

/**
 * Handles email notifications for booking status updates.
 */
exports.sendStatusUpdateEmail = async (booking) => {
    // Requires populated booking.tourist and booking.service
    if (booking && booking.tourist) {
        const emailModule = require('./email');
        try {
            await emailModule.sendBookingStatusToGuest(booking.tourist, booking, booking.service);
        } catch (emailErr) {
            console.error('Failed to send status update email:', emailErr);
        }
    }
};
