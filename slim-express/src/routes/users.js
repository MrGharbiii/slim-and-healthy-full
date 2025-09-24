const express = require('express');
const router = express.Router();

// Import controllers and middleware
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const {
  validateRegistration,
  validateLogin,
  validateProfileUpdate,
  validatePasswordChange,
  validatePlanRequest,
} = require('../middleware/validation');

// Authentication routes (public)
router.post('/register', validateRegistration, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/refresh-token', authController.refreshToken);

// Protected routes (require authentication)
router.use(authenticateToken);

// User profile routes
router.get('/profile', authController.getProfile);
router.put('/profile', validateProfileUpdate, authController.updateProfile);
router.post(
  '/change-password',
  validatePasswordChange,
  authController.changePassword
);

// Plan routes
router.get('/plan', authController.getUserPlan);

// Plan request route
router.put(
  '/plan-request',
  validatePlanRequest,
  authController.updatePlanRequest
);

// Logout routes
router.post('/logout', authController.logout);
router.post('/logout-all', authController.logoutAll);

module.exports = router;
