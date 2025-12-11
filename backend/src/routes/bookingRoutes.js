const express = require('express');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     PaymentIntent:
 *       type: object
 *       properties:
 *         clientSecret:
 *           type: string
 *         bookingId:
 *           type: string
 */

// Protect all routes
router.use(authController.protect);

/**
 * @swagger
 * /api/v1/bookings/check-availability:
 *   post:
 *     summary: Check if a date is available for booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - serviceId
 *               - date
 *             properties:
 *               serviceId:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Availability status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 available:
 *                   type: boolean
 *                 slotsRemaining:
 *                   type: integer
 */
router.post('/check-availability', bookingController.checkAvailability);

/**
 * @swagger
 * /api/v1/bookings/create-intent:
 *   post:
 *     summary: Create a Stripe payment intent
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - serviceId
 *               - price
 *             properties:
 *               serviceId:
 *                 type: string
 *                 description: ID of the service to book
 *               price:
 *                 type: number
 *                 description: Price in MAD
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Booking date (optional)
 *     responses:
 *       200:
 *         description: Payment intent created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 clientSecret:
 *                   type: string
 *                 bookingId:
 *                   type: string
 *       400:
 *         description: Missing required fields
 *       404:
 *         description: Service not found
 */
router.post('/create-intent', bookingController.createPaymentIntent);

/**
 * @swagger
 * /api/v1/bookings/confirm/{bookingId}:
 *   patch:
 *     summary: Confirm booking after successful payment
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking confirmed
 *       404:
 *         description: Booking not found
 */
router.patch('/confirm/:bookingId', bookingController.confirmBooking);

/**
 * @swagger
 * /api/v1/bookings/my-bookings:
 *   get:
 *     summary: Get current user's bookings
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's bookings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 results:
 *                   type: integer
 *                 data:
 *                   type: object
 *                   properties:
 *                     bookings:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Booking'
 */
router.get('/my-bookings', bookingController.getMyBookings);

/**
 * @swagger
 * /api/v1/bookings/host-bookings:
 *   get:
 *     summary: Get bookings received by the current user (Host)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of bookings for host's services
 */
router.get('/host-bookings', authController.restrictTo('host', 'admin', 'superadmin'), bookingController.getHostBookings);

/**
 * @swagger
 * /api/v1/bookings/{id}/status:
 *   patch:
 *     summary: Update booking status (Accept/Reject)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [confirmed, cancelled]
 *     responses:
 *       200:
 *         description: Status updated
 *       403:
 *         description: Not authorized
 */
router.patch('/:id/status', authController.restrictTo('host', 'admin', 'superadmin'), bookingController.updateBookingStatus);

/**
 * @swagger
 * /api/v1/bookings/{id}:
 *   get:
 *     summary: Get single booking by ID
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking details
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Booking not found
 */
router.get('/:id', bookingController.getBooking);

/**
 * @swagger
 * /api/v1/bookings:
 *   get:
 *     summary: Get all bookings (Admin only)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All bookings
 *       403:
 *         description: Not authorized
 */
router.get('/', authController.restrictTo('admin', 'superadmin'), bookingController.getAllBookings);

module.exports = router;
