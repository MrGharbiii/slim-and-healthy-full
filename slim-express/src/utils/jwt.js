const jwt = require('jsonwebtoken');
const crypto = require('crypto');

/**
 * JWT Utility Functions for Authentication
 * Provides secure token generation, verification, and management
 */

// Generate JWT access token with security enhancements
const generateAccessToken = (userId, options = {}) => {
  const payload = {
    userId,
    type: 'access',
    jti: crypto.randomUUID(), // Unique token ID for tracking
  };

  const tokenOptions = {
    expiresIn: options.expiresIn || process.env.JWT_EXPIRES_IN || '15m',
    issuer: process.env.JWT_ISSUER || 'fitness-app',
    audience: process.env.JWT_AUDIENCE || 'fitness-app-users',
    subject: userId.toString(),
    algorithm: 'HS256',
  };

  return jwt.sign(payload, process.env.JWT_SECRET, tokenOptions);
};

// Generate JWT refresh token
const generateRefreshToken = (userId, options = {}) => {
  const payload = {
    userId,
    type: 'refresh',
    jti: crypto.randomUUID(),
  };

  const tokenOptions = {
    expiresIn: options.expiresIn || process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    issuer: process.env.JWT_ISSUER || 'fitness-app',
    audience: process.env.JWT_AUDIENCE || 'fitness-app-users',
    subject: userId.toString(),
    algorithm: 'HS256',
  };

  return jwt.sign(payload, process.env.JWT_SECRET, tokenOptions);
};

// Verify JWT token with enhanced security
const verifyToken = (token, expectedType = 'access') => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: process.env.JWT_ISSUER || 'fitness-app',
      audience: process.env.JWT_AUDIENCE || 'fitness-app-users',
      algorithms: ['HS256'],
    });

    // Verify token type
    if (decoded.type !== expectedType) {
      throw new Error(
        `Invalid token type. Expected ${expectedType}, got ${decoded.type}`
      );
    }

    return decoded;
  } catch (error) {
    throw error;
  }
};

// Decode token without verification (for inspection)
const decodeToken = (token) => {
  try {
    return jwt.decode(token, { complete: true });
  } catch (error) {
    return null;
  }
};

// Check if token is expired
const isTokenExpired = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) return true;

    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};

// Get token expiration time
const getTokenExpiration = (token) => {
  try {
    const decoded = jwt.decode(token);
    return decoded?.exp ? new Date(decoded.exp * 1000) : null;
  } catch (error) {
    return null;
  }
};

// Generate token pair (access + refresh)
const generateTokenPair = (userId) => {
  const accessToken = generateAccessToken(userId);
  const refreshToken = generateRefreshToken(userId);

  return {
    accessToken,
    refreshToken,
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  };
};

// Extract token from authorization header
const extractTokenFromHeader = (authHeader) => {
  if (!authHeader) return null;

  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return authHeader;
};

// Validate token format
const isValidTokenFormat = (token) => {
  if (!token || typeof token !== 'string') return false;

  // JWT tokens have 3 parts separated by dots
  const parts = token.split('.');
  return parts.length === 3;
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  decodeToken,
  isTokenExpired,
  getTokenExpiration,
  generateTokenPair,
  extractTokenFromHeader,
  isValidTokenFormat,
};
