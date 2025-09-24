/**
 * Security Configuration and Best Practices
 * Implements security measures for the authentication system
 */

// Password strength requirements
const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  specialChars: '@$!%*?&',
  forbiddenPasswords: [
    'password',
    '12345678',
    'qwerty123',
    'admin123',
    'password123',
  ],
};

// Rate limiting configurations
const RATE_LIMITS = {
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 attempts per window
    message: 'Too many authentication attempts, please try again later',
  },
  general: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100, // 100 requests per window
    message: 'Too many requests, please try again later',
  },
  signup: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3, // 3 signups per hour per IP
    message: 'Too many signup attempts, please try again later',
  },
};

// JWT Configuration
const JWT_CONFIG = {
  accessTokenExpiry: '15m',
  refreshTokenExpiry: '7d',
  issuer: 'fitness-app',
  audience: 'fitness-app-users',
  algorithm: 'HS256',
};

// Security headers configuration
const SECURITY_HEADERS = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
};

// Account lockout configuration
const ACCOUNT_LOCKOUT = {
  maxFailedAttempts: 5,
  lockoutDuration: 30 * 60 * 1000, // 30 minutes
  resetTime: 24 * 60 * 60 * 1000, // 24 hours
};

// Email validation configuration
const EMAIL_CONFIG = {
  maxLength: 254,
  allowedDomains: [], // Empty means all domains allowed
  blockedDomains: ['tempmail.org', '10minutemail.com', 'guerrillamail.com'],
};

// Session configuration
const SESSION_CONFIG = {
  maxConcurrentSessions: 5,
  sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
  refreshTokenRotation: true,
};

// Input sanitization rules
const SANITIZATION_RULES = {
  name: {
    allowedChars: /^[a-zA-Z\s\-'\.]+$/,
    maxLength: 50,
    minLength: 2,
  },
  email: {
    maxLength: 254,
    normalize: true,
  },
};

// Validation functions
const validatePassword = (password) => {
  const errors = [];

  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    errors.push(
      `Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters long`
    );
  }

  if (password.length > PASSWORD_REQUIREMENTS.maxLength) {
    errors.push(
      `Password cannot exceed ${PASSWORD_REQUIREMENTS.maxLength} characters`
    );
  }

  if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (PASSWORD_REQUIREMENTS.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (PASSWORD_REQUIREMENTS.requireSpecialChars) {
    const specialCharRegex = new RegExp(
      `[${PASSWORD_REQUIREMENTS.specialChars.replace(
        /[.*+?^${}()|[\]\\]/g,
        '\\$&'
      )}]`
    );
    if (!specialCharRegex.test(password)) {
      errors.push(
        `Password must contain at least one special character (${PASSWORD_REQUIREMENTS.specialChars})`
      );
    }
  }

  if (
    PASSWORD_REQUIREMENTS.forbiddenPasswords.includes(password.toLowerCase())
  ) {
    errors.push('Password is too common, please choose a different password');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

const validateEmail = (email) => {
  const errors = [];

  if (email.length > EMAIL_CONFIG.maxLength) {
    errors.push(`Email cannot exceed ${EMAIL_CONFIG.maxLength} characters`);
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    errors.push('Please provide a valid email address');
  }

  const domain = email.split('@')[1]?.toLowerCase();
  if (domain && EMAIL_CONFIG.blockedDomains.includes(domain)) {
    errors.push('Email domain is not allowed');
  }

  if (
    EMAIL_CONFIG.allowedDomains.length > 0 &&
    !EMAIL_CONFIG.allowedDomains.includes(domain)
  ) {
    errors.push('Email domain is not allowed');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Security utilities
const sanitizeInput = (input, rules) => {
  if (typeof input !== 'string') return input;

  let sanitized = input.trim();

  if (rules.maxLength) {
    sanitized = sanitized.substring(0, rules.maxLength);
  }

  if (rules.allowedChars) {
    sanitized = sanitized.replace(rules.allowedChars, '');
  }

  if (rules.normalize) {
    sanitized = sanitized.toLowerCase();
  }

  return sanitized;
};

const generateSecureToken = (length = 32) => {
  const crypto = require('crypto');
  return crypto.randomBytes(length).toString('hex');
};

const hashSensitiveData = (data) => {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(data).digest('hex');
};

module.exports = {
  PASSWORD_REQUIREMENTS,
  RATE_LIMITS,
  JWT_CONFIG,
  SECURITY_HEADERS,
  ACCOUNT_LOCKOUT,
  EMAIL_CONFIG,
  SESSION_CONFIG,
  SANITIZATION_RULES,
  validatePassword,
  validateEmail,
  sanitizeInput,
  generateSecureToken,
  hashSensitiveData,
};
