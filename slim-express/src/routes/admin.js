const express = require('express');
const router = express.Router();

// Import controllers and middleware
const adminController = require('../controllers/adminController');
const { requireAdmin } = require('../middleware/auth');
const { body, param, query } = require('express-validator');

// Validation middleware for admin routes
const validateUserId = [
  param('id').isMongoId().withMessage('Invalid user ID format'),
];

const validateAdminStatusUpdate = [
  param('id').isMongoId().withMessage('Invalid user ID format'),
  body('isAdmin').isBoolean().withMessage('isAdmin must be a boolean value'),
];

const validatePlanStatusUpdate = [
  param('id').isMongoId().withMessage('Invalid user ID format'),
  body('assignedPlan')
    .isBoolean()
    .withMessage('assignedPlan must be a boolean value'),
];

const validatePlanAssignment = [
  param('id').isMongoId().withMessage('Invalid user ID format'),
  body('profiles').isArray().withMessage('Profiles must be an array'),
  body('profiles.*.name')
    .isString()
    .withMessage('Profile name must be a string'),
  body('profiles.*.percentage')
    .isNumeric()
    .withMessage('Profile percentage must be a number'),
  body('sections').isObject().withMessage('Sections must be an object'),
  body('sections.dietetique')
    .isArray()
    .withMessage('Diététique must be an array'),
  body('sections.activitePhysique')
    .isArray()
    .withMessage('Activité physique must be an array'),
  body('sections.micronutrition')
    .isArray()
    .withMessage('Micronutrition must be an array'),
  body('sections.medicaments')
    .isArray()
    .withMessage('Médicaments must be an array'),
  body('sections.interventions')
    .isArray()
    .withMessage('Interventions must be an array'),
];

const validateUserQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('sortBy')
    .optional()
    .isIn([
      'createdAt',
      'updatedAt',
      'lastLoginAt',
      'email',
      'profileCompleteness',
    ])
    .withMessage('Invalid sort field'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
];

// Apply admin authentication to all routes
router.use(requireAdmin);

/**
 * @route   GET /api/admin/users
 * @desc    Get all users with pagination and filtering
 * @access  Admin only
 * @params  Query parameters:
 *          - page: Page number (default: 1)
 *          - limit: Results per page (default: 10, max: 100)
 *          - search: Search by name or email
 *          - sortBy: Sort field (createdAt, updatedAt, lastLoginAt, email, profileCompleteness)
 *          - sortOrder: Sort direction (asc, desc)
 *          - verified: Filter by email verification (true/false)
 *          - onboardingCompleted: Filter by onboarding status (true/false)
 *          - isAdmin: Filter by admin status (true/false)
 */
router.get('/users', validateUserQuery, adminController.getAllUsers);

/**
 * @route   GET /api/admin/users/:id
 * @desc    Get detailed information about a specific user
 * @access  Admin only
 */
router.get('/users/:id', validateUserId, adminController.getUserDetails);

/**
 * @route   PATCH /api/admin/users/:id/admin-status
 * @desc    Update user admin status
 * @access  Admin only
 */
router.patch(
  '/users/:id/admin-status',
  validateAdminStatusUpdate,
  adminController.updateUserAdminStatus
);

/**
 * @route   PATCH /api/admin/users/:id/plan-status
 * @desc    Update user's plan status (assignedPlan)
 * @access  Admin only
 */
router.patch(
  '/users/:id/plan-status',
  validatePlanStatusUpdate,
  adminController.updateUserPlanStatus
);

/**
 * @route   POST /api/admin/users/:id/assign-plan
 * @desc    Assign a detailed plan to a user
 * @access  Admin only
 */
router.post(
  '/users/:id/assign-plan',
  validatePlanAssignment,
  adminController.assignPlanToUser
);

/**
 * @route   GET /api/admin/stats
 * @desc    Get user statistics and analytics
 * @access  Admin only
 */
router.get('/stats', adminController.getUserStats);

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete a user account
 * @access  Admin only
 */
router.delete('/users/:id', validateUserId, adminController.deleteUser);

module.exports = router;
