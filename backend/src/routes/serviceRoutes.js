const express = require('express');
const serviceController = require('../controllers/serviceController');
const authController = require('../controllers/authController');

const router = express.Router();

/**
 * @swagger
 * /api/v1/services/services-within/{distance}/center/{latlng}/unit/{unit}:
 *   get:
 *     summary: Get services within a radius
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: distance
 *         required: true
 *         schema:
 *           type: number
 *         description: Search radius
 *       - in: path
 *         name: latlng
 *         required: true
 *         schema:
 *           type: string
 *         description: "Latitude,Longitude (e.g., 31.6295,-7.9811)"
 *       - in: path
 *         name: unit
 *         required: true
 *         schema:
 *           type: string
 *           enum: [km, mi]
 *     responses:
 *       200:
 *         description: List of services within radius
 */
router
  .route('/services-within/:distance/center/:latlng/unit/:unit')
  .get(serviceController.getServicesWithin);

/**
 * @swagger
 * /api/v1/services:
 *   get:
 *     summary: Get all services
 *     tags: [Services]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [SPACE, SKILL, CONNECT]
 *         description: Filter by category
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Filter by city
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: "Sort field (e.g., price, -price for descending)"
 *       - in: query
 *         name: price[gte]
 *         schema:
 *           type: number
 *         description: Minimum price
 *       - in: query
 *         name: price[lte]
 *         schema:
 *           type: number
 *         description: Maximum price
 *       - in: query
 *         name: duration[gte]
 *         schema:
 *           type: number
 *         description: Minimum duration
 *       - in: query
 *         name: duration[lte]
 *         schema:
 *           type: number
 *         description: Maximum duration
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of results per page
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *     responses:
 *       200:
 *         description: List of services
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
 *                     services:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Service'
 *   post:
 *     summary: Create a new service
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - price
 *               - category
 *               - city
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Cours de cuisine marocaine"
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *                 example: 350
 *               category:
 *                 type: string
 *                 enum: [SPACE, SKILL, CONNECT]
 *               city:
 *                 type: string
 *                 example: "Marrakech"
 *               duration:
 *                 type: number
 *                 example: 120
 *               maxParticipants:
 *                 type: number
 *                 example: 8
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *               languages:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Service created successfully
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (host/admin only)
 */
router
  .route('/')
  .get(serviceController.getAllServices)
  .post(
    authController.protect,
    authController.restrictTo('host', 'admin', 'superadmin'),
    serviceController.createService
  );

/**
 * @swagger
 * /api/v1/services/my-services:
 *   get:
 *     summary: Get services created by the logged-in host
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Host's services
 *       401:
 *         description: Not authenticated
 */
router.get('/my-services', authController.protect, serviceController.getMyServices);

/**
 * @swagger
 * /api/v1/services/{id}:
 *   get:
 *     summary: Get a single service by ID
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Service ID
 *     responses:
 *       200:
 *         description: Service details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     service:
 *                       $ref: '#/components/schemas/Service'
 *       404:
 *         description: Service not found
 *   patch:
 *     summary: Update a service
 *     tags: [Services]
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
 *             $ref: '#/components/schemas/Service'
 *     responses:
 *       200:
 *         description: Service updated
 *       401:
 *         description: Not authenticated
 *   delete:
 *     summary: Delete a service
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Service deleted
 *       401:
 *         description: Not authenticated
 */
router
  .route('/:id')
  .get(serviceController.getOneService)
  .patch(authController.protect, serviceController.updateService)
  .delete(authController.protect, serviceController.deleteService);

module.exports = router;
