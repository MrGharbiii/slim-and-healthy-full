const express = require('express');
const router = express.Router();

// Import controllers and middleware
const authController = require('../controllers/authController');
const { validateSignup, validateSignin } = require('../middleware/validation');

// Authentication routes (public)
router.post('/signup', validateSignup, authController.signup);
router.post('/signin', validateSignin, authController.signin);

// Additional auth routes
router.post('/refresh-token', authController.refreshToken);

module.exports = router;
