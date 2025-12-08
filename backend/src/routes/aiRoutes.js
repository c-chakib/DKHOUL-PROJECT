const express = require('express');
const authController = require('../controllers/authController');
const aiController = require('../controllers/aiController');

const router = express.Router();

// Protect routes -> Only logged in users (Hosts) should generate content
router.use(authController.protect);

// Generate Description (for Hosts)
router.post('/generate-description', aiController.generateDescription);

// Chat with Guide (for everyone)
router.post('/chat', aiController.chatWithGuide);

module.exports = router;
