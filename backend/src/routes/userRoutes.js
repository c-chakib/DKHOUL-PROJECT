const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const { upload, resizeAndOptimize } = require('../middlewares/uploadMiddleware');

const router = express.Router();

// All routes below this are protected
router.use(authController.protect);

// Current User Routes
router.get('/me', userController.getMe);
router.patch('/updateMe', upload.single('photo'), resizeAndOptimize, userController.updateMe);
router.patch('/updateMyPassword', userController.updateMyPassword);
router.delete('/deleteMe', userController.deleteMe);

// Admin only routes
router.get('/', authController.restrictTo('admin', 'superadmin'), userController.getAllUsers);
router.patch('/:id', authController.restrictTo('admin', 'superadmin'), userController.updateUser); // New Route

module.exports = router;
