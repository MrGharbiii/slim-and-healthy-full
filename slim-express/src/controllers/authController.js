const User = require('../models/User');
const { generateToken, generateRefreshToken } = require('../middleware/auth');

// Register new user
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        error: 'User Already Exists',
        message: 'A user with this email address already exists',
      });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
    });

    await user.save();

    // Generate tokens
    const accessToken = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token to user
    user.refreshTokens.push({
      token: refreshToken,
      createdAt: new Date(),
    });
    await user.save();

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        requestedPlan: user.requestedPlan,
        assignedPlan: user.assignedPlan,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Registration Failed',
      message: 'An error occurred during registration',
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user and include password for comparison
    const user = await User.findByEmail(email).select('+password');
    if (!user) {
      return res.status(401).json({
        error: 'Invalid Credentials',
        message: 'Email or password is incorrect',
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid Credentials',
        message: 'Email or password is incorrect',
      });
    }

    // Generate tokens
    const accessToken = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token to user
    user.refreshTokens.push({
      token: refreshToken,
      createdAt: new Date(),
    });

    // Clean up old refresh tokens (keep only last 5)
    if (user.refreshTokens.length > 5) {
      user.refreshTokens = user.refreshTokens.slice(-5);
    }

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        requestedPlan: user.requestedPlan,
        assignedPlan: user.assignedPlan,
        isEmailVerified: user.isEmailVerified,
        lastLoginAt: user.lastLoginAt,
        profilePicture: user.profilePicture,
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login Failed',
      message: 'An error occurred during login',
    });
  }
};

// Signup new user (for /api/auth/signup)
const signup = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists',
      });
    }

    // Create new user (only email and password for signup)
    const user = new User({
      email,
      password,
    });

    await user.save();

    // Generate tokens
    const accessToken = generateToken(user._id);

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token: accessToken,
      user: {
        id: user._id,
        email: user.email,
        isAdmin: user.isAdmin,
        requestedPlan: user.requestedPlan,
        assignedPlan: user.assignedPlan,
        onboardingCompleted: user.onboardingCompleted,
        onboardingStep: user.onboardingStep,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during registration',
    });
  }
};

// Signin user (for /api/auth/signin)
const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user and include password for comparison
    const user = await User.findByEmail(email).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate token
    const accessToken = generateToken(user._id);

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();
    res.json({
      success: true,
      message: 'Login successful',
      token: accessToken,
      user: {
        id: user._id,
        email: user.email,
        isAdmin: user.isAdmin,
        requestedPlan: user.requestedPlan,
        assignedPlan: user.assignedPlan,
        onboardingCompleted: user.onboardingCompleted,
        onboardingStep: user.onboardingStep,
      },
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during login',
    });
  }
};

// Refresh access token
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: 'Refresh Token Required',
        message: 'Please provide a refresh token',
      });
    }

    // Verify refresh token
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET, {
      issuer: 'fitness-app',
      audience: 'fitness-app-users',
    });

    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        error: 'Invalid Token Type',
        message: 'Please provide a valid refresh token',
      });
    }

    // Find user and check if refresh token exists
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        error: 'Invalid Token',
        message: 'User no longer exists',
      });
    }

    const tokenExists = user.refreshTokens.some(
      (tokenObj) => tokenObj.token === refreshToken
    );
    if (!tokenExists) {
      return res.status(401).json({
        error: 'Invalid Refresh Token',
        message: 'Refresh token is not valid or has been revoked',
      });
    }

    // Generate new access token
    const newAccessToken = generateToken(user._id);

    res.json({
      message: 'Token refreshed successfully',
      tokens: {
        accessToken: newAccessToken,
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      },
    });
  } catch (error) {
    if (
      error.name === 'JsonWebTokenError' ||
      error.name === 'TokenExpiredError'
    ) {
      return res.status(401).json({
        error: 'Invalid Refresh Token',
        message: 'Please login again',
      });
    }

    console.error('Token refresh error:', error);
    res.status(500).json({
      error: 'Token Refresh Failed',
      message: 'An error occurred while refreshing token',
    });
  }
};

// Logout user
const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const userId = req.userId;

    if (refreshToken) {
      // Remove specific refresh token
      await User.findByIdAndUpdate(userId, {
        $pull: { refreshTokens: { token: refreshToken } },
      });
    }

    res.json({
      message: 'Logout successful',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Logout Failed',
      message: 'An error occurred during logout',
    });
  }
};

// Logout from all devices
const logoutAll = async (req, res) => {
  try {
    const userId = req.userId;

    // Remove all refresh tokens
    await User.findByIdAndUpdate(userId, {
      $set: { refreshTokens: [] },
    });

    res.json({
      message: 'Logged out from all devices successfully',
    });
  } catch (error) {
    console.error('Logout all error:', error);
    res.status(500).json({
      error: 'Logout Failed',
      message: 'An error occurred during logout',
    });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const user = req.user;

    res.json({
      message: 'Profile retrieved successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        requestedPlan: user.requestedPlan,
        assignedPlan: user.assignedPlan,
        profilePicture: user.profilePicture,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        height: user.height,
        weight: user.weight,
        activityLevel: user.activityLevel,
        goals: user.goals,
        isEmailVerified: user.isEmailVerified,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        bmi: user.getBMI(),
        age: user.getAge(),
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Profile Retrieval Failed',
      message: 'An error occurred while retrieving profile',
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const allowedUpdates = [
      'name',
      'dateOfBirth',
      'gender',
      'height',
      'weight',
      'activityLevel',
      'goals',
      'profilePicture',
    ];
    const updates = {};

    // Filter allowed updates
    Object.keys(req.body).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        error: 'No Valid Updates',
        message: 'No valid fields provided for update',
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        error: 'User Not Found',
        message: 'User does not exist',
      });
    }

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        requestedPlan: user.requestedPlan,
        assignedPlan: user.assignedPlan,
        profilePicture: user.profilePicture,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        height: user.height,
        weight: user.weight,
        activityLevel: user.activityLevel,
        goals: user.goals,
        updatedAt: user.updatedAt,
        bmi: user.getBMI(),
        age: user.getAge(),
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      error: 'Profile Update Failed',
      message: 'An error occurred while updating profile',
    });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.userId;

    // Get user with password
    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({
        error: 'User Not Found',
        message: 'User does not exist',
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        error: 'Invalid Current Password',
        message: 'The current password you entered is incorrect',
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Logout from all devices for security
    user.refreshTokens = [];
    await user.save();

    res.json({
      message: 'Password changed successfully. Please login again.',
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      error: 'Password Change Failed',
      message: 'An error occurred while changing password',
    });
  }
};

// Legacy function replaced by updatePlanStatus
// Keeping as a deprecated alias for backward compatibility
const updatePlanRequest = async (req, res) => {
  try {
    const { planRequest } = req.body;
    const userId = req.user.id;

    // Find and update user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Update the requestedPlan field instead of planRequest
    user.requestedPlan = planRequest;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Plan request status updated successfully',
      data: {
        planRequest: user.requestedPlan, // For backward compatibility
        user: {
          id: user._id,
          email: user.email,
          requestedPlan: user.requestedPlan,
          assignedPlan: user.assignedPlan,
        },
      },
    });
  } catch (error) {
    console.error('Update plan request error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while updating plan request status',
      error: error.message,
    });
  }
};

// Update plan status
const updatePlanStatus = async (req, res) => {
  try {
    const { requestedPlan, assignedPlan } = req.body;
    const userId = req.user.id;

    // Find and update user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Update plan status fields if provided
    if (requestedPlan !== undefined) {
      user.requestedPlan = requestedPlan;
    }

    if (assignedPlan !== undefined) {
      user.assignedPlan = assignedPlan;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Plan status updated successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          requestedPlan: user.requestedPlan,
          assignedPlan: user.assignedPlan,
        },
      },
    });
  } catch (error) {
    console.error('Update plan status error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while updating plan status',
      error: error.message,
    });
  }
};

/**
 * Get current user's plan
 * @route GET /api/users/plan
 */
const getUserPlan = async (req, res) => {
  try {
    const user = req.user;

    // Check if the user has an assigned plan
    if (!user.assignedPlan || !user.plan) {
      return res.status(404).json({
        success: false,
        message: 'No plan has been assigned yet',
        data: {
          requestedPlan: user.requestedPlan,
          assignedPlan: user.assignedPlan,
        },
      });
    }

    res.status(200).json({
      success: true,
      message: 'Plan retrieved successfully',
      data: {
        requestedPlan: user.requestedPlan,
        assignedPlan: user.assignedPlan,
        plan: user.plan,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving plan',
      error: error.message,
    });
  }
};

module.exports = {
  register,
  login,
  signup,
  signin,
  refreshToken,
  logout,
  logoutAll,
  getProfile,
  updateProfile,
  changePassword,
  updatePlanRequest,
  updatePlanStatus,
  getUserPlan,
};
