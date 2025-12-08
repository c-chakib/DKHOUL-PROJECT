const express = require('express');
const authController = require('../controllers/authController');
const chatController = require('../controllers/chatController');

const router = express.Router();

// Protect all routes
router.use(authController.protect);

router.get('/history/:userId', chatController.getHistory);
router.get('/contacts', chatController.getChatUsers); // Helper to find people to chat with

module.exports = router;
