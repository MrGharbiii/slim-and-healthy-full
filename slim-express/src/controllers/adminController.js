const User = require('../models/User');
const { validationResult } = require('express-validator');

/**
 * Get all users with pagination, search, and filtering
 * @route GET /api/admin/users
 */
const getAllUsers = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      verified = '',
      onboardingCompleted = '',
      isAdmin = '',
    } = req.query;

    // Build search query
    const query = {};

    // Search by name or email
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { 'basicInfo.name': { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by email verification status
    if (verified !== '') {
      query.isEmailVerified = verified === 'true';
    }

    // Filter by onboarding completion
    if (onboardingCompleted !== '') {
      query.onboardingCompleted = onboardingCompleted === 'true';
    }

    // Filter by admin status
    if (isAdmin !== '') {
      query.isAdmin = isAdmin === 'true';
    }

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const users = await User.find(query)
      .select('-password -refreshTokens')
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Get total count for pagination
    const totalUsers = await User.countDocuments(query);
    const totalPages = Math.ceil(totalUsers / limitNum);

    // Get overall statistics
    const stats = await User.getUserStats();

    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: {
        users: users.map((user) => ({
          id: user._id,
          email: user.email,
          isEmailVerified: user.isEmailVerified,
          isAdmin: user.isAdmin,
          requestedPlan: user.requestedPlan, // Add this line
          assignedPlan: user.assignedPlan,
          onboardingCompleted: user.onboardingCompleted,
          onboardingStep: user.onboardingStep,
          profileCompleteness: user.profileCompleteness,
          basicInfo: {
            name: user.basicInfo?.name || null,
            dateOfBirth: user.basicInfo?.dateOfBirth || null,
            gender: user.basicInfo?.gender || null,
          },
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          lastLoginAt: user.lastLoginAt,
        })),
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalUsers,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
          limit: limitNum,
        },
        statistics: stats,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get detailed information about a specific user
 * @route GET /api/admin/users/:id
 */
const getUserDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('-password -refreshTokens');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Get full profile data
    const userDetails = {
      id: user._id,
      email: user.email,
      isEmailVerified: user.isEmailVerified,
      isAdmin: user.isAdmin,
      onboardingCompleted: user.onboardingCompleted,
      onboardingStep: user.onboardingStep,
      profileCompleteness: user.profileCompleteness,
      requestedPlan: user.requestedPlan,
      assignedPlan: user.assignedPlan,
      plan: user.plan || null,

      // Session info
      sessionInfo: user.sessionInfo,

      // Detailed profile sections
      basicInfo: user.basicInfo,
      lifestyle: user.lifestyle,
      medicalHistory: user.medicalHistory,
      goals: user.goals,
      preferences: user.preferences,

      // Data quality metrics
      dataQuality: user.dataQuality,

      // Timestamps
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLoginAt: user.lastLoginAt,

      // Calculated fields
      bmi: user.getBMI ? user.getBMI() : null,
      age: user.getAge ? user.getAge() : null,
    };

    res.status(200).json({
      success: true,
      message: 'User details retrieved successfully',
      data: userDetails,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user admin status
 * @route PATCH /api/admin/users/:id/admin-status
 */
const updateUserAdminStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isAdmin } = req.body;

    if (typeof isAdmin !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isAdmin must be a boolean value',
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { isAdmin },
      { new: true, runValidators: true }
    ).select('-password -refreshTokens');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: `User admin status ${
        isAdmin ? 'granted' : 'revoked'
      } successfully`,
      data: {
        id: user._id,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user plan status
 * @route PATCH /api/admin/users/:id/plan-status
 */
const updateUserPlanStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { assignedPlan } = req.body;

    if (typeof assignedPlan !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'assignedPlan must be a boolean value',
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { assignedPlan },
      { new: true, runValidators: true }
    ).select('-password -refreshTokens');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Plan status updated successfully',
      data: {
        id: user._id,
        email: user.email,
        requestedPlan: user.requestedPlan,
        assignedPlan: user.assignedPlan,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user statistics and analytics
 * @route GET /api/admin/stats
 */
const getUserStats = async (req, res, next) => {
  try {
    // Get overall statistics
    const overallStats = await User.getUserStats();

    // Get users by onboarding step
    const onboardingSteps = await User.aggregate([
      {
        $group: {
          _id: '$onboardingStep',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Get recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentRegistrations = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });

    // Get active users (logged in within last 30 days)
    const activeUsers = await User.countDocuments({
      lastLoginAt: { $gte: thirtyDaysAgo },
    });

    // Get verification statistics
    const verificationStats = await User.aggregate([
      {
        $group: {
          _id: '$isEmailVerified',
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      message: 'User statistics retrieved successfully',
      data: {
        overall: overallStats,
        onboardingSteps: onboardingSteps.map((step) => ({
          step: step._id,
          count: step.count,
        })),
        recentActivity: {
          recentRegistrations,
          activeUsers,
        },
        verification: {
          verified: verificationStats.find((v) => v._id === true)?.count || 0,
          unverified:
            verificationStats.find((v) => v._id === false)?.count || 0,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a user (soft delete - deactivate)
 * @route DELETE /api/admin/users/:id
 */
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (req.user.id === id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account',
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Instead of deleting, we can deactivate the account
    // For this implementation, we'll actually delete the user
    // In production, you might want to implement soft delete
    await User.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
      data: {
        deletedUserId: id,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Assign a detailed plan to a user
 * @route POST /api/admin/users/:id/assign-plan
 */
const assignPlanToUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { profiles, sections } = req.body;

    // Validate the plan data structure
    if (!profiles || !Array.isArray(profiles) || profiles.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Profiles array is required and must not be empty',
      });
    }

    if (!sections || typeof sections !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Sections object is required',
      });
    }

    // Validate that all required sections exist
    const requiredSections = [
      'dietetique',
      'activitePhysique',
      'micronutrition',
      'medicaments',
      'interventions',
    ];

    const missingSections = requiredSections.filter(
      (section) => !sections[section]
    );
    if (missingSections.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required sections: ${missingSections.join(', ')}`,
      });
    }

    // Find the user and update with the new plan
    const user = await User.findByIdAndUpdate(
      id,
      {
        plan: {
          profiles,
          sections,
          assignedAt: new Date(),
        },
        assignedPlan: true, // Also update the assignedPlan flag
      },
      { new: true, runValidators: true }
    ).select('-password -refreshTokens');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Plan assigned to user successfully',
      data: {
        id: user._id,
        email: user.email,
        requestedPlan: user.requestedPlan,
        assignedPlan: user.assignedPlan,
        plan: user.plan,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserDetails,
  updateUserAdminStatus,
  updateUserPlanStatus,
  getUserStats,
  deleteUser,
  assignPlanToUser,
};
