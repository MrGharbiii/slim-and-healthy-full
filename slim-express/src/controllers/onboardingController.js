const User = require('../models/User');
const { validationResult } = require('express-validator');

/**
 * Get current onboarding status and progress
 */
const getOnboardingStatus = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const onboardingStatus = user.getOnboardingStatus();

    res.status(200).json({
      success: true,
      message: 'Onboarding status retrieved successfully',
      data: onboardingStatus,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update basic information section
 */
const updateBasicInfo = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const userId = req.user.id;
    console.log('Updating basic info for user:', userId);
    console.log('Request body:', req.body);

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    console.log('User found, current basicInfo:', user.basicInfo);

    // Update basic info section
    user.updateOnboardingSection('basicInfo', req.body);

    console.log('Before save, basicInfo:', user.basicInfo);
    console.log('Modified paths:', user.modifiedPaths());

    const savedUser = await user.save();

    console.log('After save, basicInfo:', savedUser.basicInfo);

    res.status(200).json({
      success: true,
      message: 'Basic information updated successfully',
      data: {
        basicInfo: savedUser.basicInfo,
        onboardingStatus: savedUser.getOnboardingStatus(),
      },
    });
  } catch (error) {
    console.error('Error updating basic info:', error);
    next(error);
  }
};

/**
 * Update lifestyle section
 */
const updateLifestyle = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Update lifestyle section
    user.updateOnboardingSection('lifestyle', req.body);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Lifestyle information updated successfully',
      data: {
        lifestyle: user.lifestyle,
        onboardingStatus: user.getOnboardingStatus(),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update medical history section
 */
const updateMedicalHistory = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Update medical history section
    user.updateOnboardingSection('medicalHistory', req.body);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Medical history updated successfully',
      data: {
        medicalHistory: user.medicalHistory,
        onboardingStatus: user.getOnboardingStatus(),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update goals section
 */
const updateGoals = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Update goals section
    user.updateOnboardingSection('goals', req.body);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Goals updated successfully',
      data: {
        goals: user.goals,
        onboardingStatus: user.getOnboardingStatus(),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update preferences section (optional)
 */
const updatePreferences = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Update preferences section
    user.updateOnboardingSection('preferences', req.body);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Preferences updated successfully',
      data: {
        preferences: user.preferences,
        onboardingStatus: user.getOnboardingStatus(),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Complete onboarding process
 */
const completeOnboarding = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if all required sections are completed
    const requiredSections = [
      'hasBasicInfo',
      'hasLifestyle',
      'hasMedicalHistory',
      'hasGoals',
    ];
    const incompleteSections = requiredSections.filter(
      (section) => !user.dataQuality[section]
    );

    if (incompleteSections.length > 0) {
      return res.status(400).json({
        success: false,
        message:
          'Please complete all required sections before finishing onboarding',
        incompleteSections: incompleteSections.map((section) =>
          section.replace('has', '').toLowerCase()
        ),
      });
    }

    // Mark onboarding as completed
    user.onboardingCompleted = true;
    user.onboardingStep = 6;
    user.sessionInfo.completionTimestamp = new Date();
    user.sessionInfo.completionDate = new Date().toISOString().split('T')[0];
    user.sessionInfo.sectionsCompleted = requiredSections.length;

    await user.save();

    res.status(200).json({
      success: true,
      message:
        'Onboarding completed successfully! Welcome to your fitness journey.',
      data: {
        user: user.getPublicProfile(),
        onboardingStatus: user.getOnboardingStatus(),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's current profile data
 */
const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: user.getFullProfile(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Skip onboarding (set basic completed status)
 */
const skipOnboarding = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Mark onboarding as skipped but not fully completed
    user.onboardingCompleted = true;
    user.onboardingStep = 6;
    user.sessionInfo.completionTimestamp = new Date();
    user.sessionInfo.completionDate = new Date().toISOString().split('T')[0];

    await user.save();

    res.status(200).json({
      success: true,
      message:
        'Onboarding skipped. You can complete your profile anytime from settings.',
      data: {
        user: user.getPublicProfile(),
        onboardingStatus: user.getOnboardingStatus(),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update lab results section
 */
const updateLabResults = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }
    const userId = req.user.id;
    const {
      gender,
      homaIR,
      vitD,
      ferritin,
      hemoglobin,
      a1c,
      tsh,
      testosterone,
      prolactin,
      submittedAt,
    } = req.body;

    console.log('Updating lab results for user:', userId);
    console.log('Lab results data:', req.body);

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Prepare lab results data
    const labData = {
      gender,
      homaIR,
      vitD,
      ferritin,
      hemoglobin,
      a1c,
      tsh,
      testosterone,
      submittedAt: submittedAt ? new Date(submittedAt) : new Date(),
    };

    // Add prolactin if provided (required for females)
    if (prolactin !== undefined) {
      labData.prolactin = prolactin;
    }

    console.log('Prepared lab data:', labData);

    // Update the user's lab results using the updateOnboardingSection method
    user.updateOnboardingSection('labResults', labData);

    // Save the user
    await user.save();

    console.log('Lab results saved successfully');

    // Return the updated user profile
    const updatedProfile = user.getFullProfile();

    res.status(200).json({
      success: true,
      message: 'Lab results updated successfully',
      data: {
        labResults: updatedProfile.labResults,
        dataQuality: updatedProfile.dataQuality,
        profileCompleteness: updatedProfile.profileCompleteness,
        onboardingStatus: user.getOnboardingStatus(),
      },
    });
  } catch (error) {
    console.error('Error updating lab results:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err) => ({
        field: err.path,
        message: err.message,
        value: err.value,
      }));

      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'Please check your lab results data',
        details: validationErrors,
      });
    }

    next(error);
  }
};

module.exports = {
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
};
