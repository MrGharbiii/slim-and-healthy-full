const express = require('express');
const router = express.Router();

// Import controllers and middleware
const aiController = require('../controllers/aiController');
const { authenticateToken } = require('../middleware/auth');
const { validateAICustomPrediction } = require('../middleware/validation');

// Special middleware to ensure localhost:3001 is always allowed for AI routes
router.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin === 'http://localhost:3001') {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3001');
    res.header(
      'Access-Control-Allow-Methods',
      'GET,PUT,POST,DELETE,PATCH,OPTIONS'
    );
    res.header(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-Requested-With'
    );
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  next();
});

/**
 * @route   GET /api/ai/predict/:userId
 * @desc    Get AI prediction for specific user using their profile data
 * @access  Public (no auth required)
 */
router.get('/predict/:userId', aiController.getUserPrediction);

/**
 * @route   POST /api/ai/predict/custom
 * @desc    Get AI prediction with custom data payload
 * @access  Public (no auth required)
 */
router.post(
  '/predict/custom',
  validateAICustomPrediction,
  aiController.getCustomPrediction
);

/**
 * @route   POST /api/ai/predict/onboarding/:userId
 * @desc    Get AI prediction after onboarding completion
 * @access  Public (no auth required)
 */
router.post(
  '/predict/onboarding/:userId',
  aiController.getOnboardingPrediction
);

/**
 * @route   GET /api/ai/health
 * @desc    Check AI service health status
 * @access  Public (no auth required)
 */
router.get('/health', aiController.getAIServiceHealth);

module.exports = router;
