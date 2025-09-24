const express = require('express');
const router = express.Router();
const {
  getOnboardingStatus,
  updateBasicInfo,
  updateLifestyle,
  updateMedicalHistory,
  updateGoals,
  updatePreferences,
  updateLabResults,
  completeOnboarding,
  getProfile,
  skipOnboarding,
} = require('../controllers/onboardingController');
const { authenticateToken } = require('../middleware/auth');
const {
  validateBasicInfo,
  validateLifestyle,
  validateMedicalHistory,
  validateGoals,
  validatePreferences,
  validateLabResults,
} = require('../middleware/validation');

// All onboarding routes require authentication
router.use(authenticateToken);

/**
 * @route   GET /api/onboarding/status
 * @desc    Get current onboarding status and progress
 * @access  Private
 */
router.get('/status', getOnboardingStatus);

/**
 * @route   GET /api/onboarding/profile
 * @desc    Get user's full profile data
 * @access  Private
 */
router.get('/profile', getProfile);

/**
 * @route   PUT /api/onboarding/basic-info
 * @desc    Update basic information section
 * @access  Private
 */
router.put('/basic-info', validateBasicInfo, updateBasicInfo);

/**
 * @route   PUT /api/onboarding/lifestyle
 * @desc    Update lifestyle section
 * @access  Private
 */
router.put('/lifestyle', validateLifestyle, updateLifestyle);

/**
 * @route   PUT /api/onboarding/medical-history
 * @desc    Update medical history section
 * @access  Private
 */
router.put('/medical-history', validateMedicalHistory, updateMedicalHistory);

/**
 * @route   PUT /api/onboarding/goals
 * @desc    Update goals section
 * @access  Private
 */
router.put('/goals', validateGoals, updateGoals);

/**
 * @route   PUT /api/onboarding/preferences
 * @desc    Update preferences section (optional)
 * @access  Private
 */
router.put('/preferences', validatePreferences, updatePreferences);

/**
 * @route   POST /api/onboarding/lab-results
 * @desc    Submit lab results section for analysis
 * @access  Private
 */
router.post('/lab-results', validateLabResults, updateLabResults);

/**
 * @route   POST /api/onboarding/complete
 * @desc    Complete onboarding process
 * @access  Private
 */
router.post('/complete', completeOnboarding);

/**
 * @route   POST /api/onboarding/skip
 * @desc    Skip onboarding process
 * @access  Private
 */
router.post('/skip', skipOnboarding);

module.exports = router;
