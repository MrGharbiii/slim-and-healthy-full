const jwt = require('jsonwebtoken');
const User = require('../models/User');
const {
  generateAccessToken,
  generateRefreshToken: generateRefreshTokenUtil,
  verifyToken,
  extractTokenFromHeader,
  isValidTokenFormat,
} = require('../utils/jwt');
const { AppError } = require('./errorHandler');

// Generate JWT token (backward compatibility)
const generateToken = (userId) => {
  return generateAccessToken(userId);
};

// Generate refresh token (updated)
const generateRefreshToken = (userId) => {
  return generateRefreshTokenUtil(userId);
};

// Verify JWT token middleware
const authenticateToken = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      throw new AppError('No authentication token provided', 401, 'NO_TOKEN');
    }

    if (!isValidTokenFormat(token)) {
      throw new AppError('Invalid token format', 401, 'INVALID_TOKEN_FORMAT');
    }

    // Verify token
    const decoded = verifyToken(token, 'access');

    // Check if user still exists
    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new AppError('User no longer exists', 401, 'USER_NOT_FOUND');
    }

    // Add user to request object
    req.user = user;
    req.userId = decoded.userId;
    req.tokenId = decoded.jti;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(
        new AppError('Invalid authentication token', 401, 'INVALID_TOKEN')
      );
    }

    if (error.name === 'TokenExpiredError') {
      return next(
        new AppError('Authentication token has expired', 401, 'TOKEN_EXPIRED')
      );
    }

    next(error);
  }
};

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (token && isValidTokenFormat(token)) {
      const decoded = verifyToken(token, 'access');
      const user = await User.findById(decoded.userId);

      if (user) {
        req.user = user;
        req.userId = decoded.userId;
        req.tokenId = decoded.jti;
      }
    }

    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};

// Middleware to check if user is verified
const requireVerifiedUser = (req, res, next) => {
  if (!req.user?.isEmailVerified) {
    throw new AppError(
      'Please verify your email address to access this resource',
      403,
      'EMAIL_NOT_VERIFIED'
    );
  }
  next();
};

// Middleware to check if user is admin
const requireAdminUser = (req, res, next) => {
  if (!req.user) {
    throw new AppError(
      'Authentication required to access this resource',
      401,
      'AUTHENTICATION_REQUIRED'
    );
  }

  if (!req.user.isAdmin) {
    throw new AppError(
      'Admin privileges required to access this resource',
      403,
      'ADMIN_ACCESS_REQUIRED'
    );
  }
  next();
};

// Combined middleware for admin routes (auth + admin check)
const requireAdmin = [authenticateToken, requireAdminUser];

module.exports = {
  generateToken,
  generateRefreshToken,
  authenticateToken,
  optionalAuth,
  requireVerifiedUser,
  requireAdminUser,
  requireAdmin,
};
