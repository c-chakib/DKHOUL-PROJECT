const express = require('express');
const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');

const router = express.Router();

/**
 * @swagger
 * /api/v1/admin/reports:
 *   post:
 *     summary: Create a new report (authenticated users)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - targetType
 *               - targetId
 *               - reason
 *             properties:
 *               targetType:
 *                 type: string
 *                 enum: [service, user]
 *               targetId:
 *                 type: string
 *               reason:
 *                 type: string
 *                 enum: [inappropriate, fake_profile, scam, other]
 *               details:
 *                 type: string
 *     responses:
 *       201:
 *         description: Report created
 *       401:
 *         description: Not authenticated
 *   get:
 *     summary: Get all reports (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of reports
 *       403:
 *         description: Not authorized
 */

// Report creation - any authenticated user can create
router.post('/reports', authController.protect, adminController.createReport);

// Admin-only routes
router.use(authController.protect);
router.use(authController.restrictTo('admin', 'superadmin'));

/**
 * @swagger
 * /api/v1/admin/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats
 */
router.get('/stats', adminController.getDashboardStats);

/**
 * @swagger
 * /api/v1/admin/reports:
 *   get:
 *     summary: Get all reports
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of reports
 */
router.get('/reports', adminController.getAllReports);

/**
 * @swagger
 * /api/v1/admin/reports/{id}:
 *   patch:
 *     summary: Update report status
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, reviewed, resolved, dismissed]
 *               adminNotes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Report updated
 */
router.patch('/reports/:id', adminController.updateReport);

// --- GOD MODE: SUPER ADMIN ONLY ---
router.use(authController.restrictTo('superadmin'));

router.get('/users', adminController.getAllUsers);
router.delete('/users/:id', adminController.deleteUser);
router.patch('/users/:id/reset-password', adminController.resetUserPassword);

module.exports = router;
