const express = require('express');
const serviceController = require('../controllers/serviceController');
const authController = require('../controllers/authController');

const router = express.Router();

router
    .route('/services-within/:distance/center/:latlng/unit/:unit')
    .get(serviceController.getServicesWithin);

router
    .route('/')
    .get(serviceController.getAllServices)
    .post(
        authController.protect,
        authController.restrictTo('host', 'admin'),
        serviceController.createService
    );

router.route('/:id').get(serviceController.getOneService);

module.exports = router;
