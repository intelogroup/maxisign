const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.get('/test', authController.testConnection);

// Get access token using client credentials
router.get('/token', authController.getAccessToken);

// Test PDF Embed API key configuration
router.get('/test-embed', authController.testEmbedApiKey);

module.exports = router;
