# Authentication System Documentation

## Overview

This fitness app backend provides a comprehensive authentication system with secure user registration, login, and session management. The system implements industry best practices for security, validation, and error handling.

## Features

### ✅ Core Authentication

- **User Registration** (`POST /api/auth/signup`)
- **User Login** (`POST /api/auth/signin`)
- **JWT Token Management** (Access & Refresh tokens)
- **Secure Password Hashing** (bcrypt with configurable rounds)
- **Email Validation** with format and domain checking
- **Password Strength Validation** with multiple requirements

### ✅ Security Features

- **Rate Limiting** (configurable per endpoint)
- **Input Validation** (express-validator with custom rules)
- **XSS Protection** (helmet.js security headers)
- **CORS Configuration** (React Native friendly)
- **Error Handling** (comprehensive error responses)
- **Token Security** (JWT with issuer/audience validation)

### ✅ Advanced Features

- **Account Lockout** protection against brute force
- **Secure Token Generation** with unique IDs
- **Environment-based Configuration**
- **Comprehensive Logging**
- **Health Check Endpoints**

## API Endpoints

### Authentication Routes (`/api/auth`)

#### 1. User Signup

```http
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "onboardingCompleted": false,
    "onboardingStep": 0
  }
}
```

#### 2. User Signin

```http
POST /api/auth/signin
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "onboardingCompleted": false,
    "onboardingStep": 0
  }
}
```

#### 3. Refresh Token

```http
POST /api/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Validation Rules

### Password Requirements

- **Minimum Length:** 8 characters
- **Maximum Length:** 128 characters
- **Must Include:**
  - At least one uppercase letter (A-Z)
  - At least one lowercase letter (a-z)
  - At least one number (0-9)
  - At least one special character (@$!%\*?&)
- **Forbidden:** Common passwords (password, 123456, etc.)

### Email Requirements

- **Valid Format:** RFC 5322 compliant
- **Maximum Length:** 254 characters
- **Domain Validation:** Configurable allowed/blocked domains
- **Normalization:** Automatic lowercase conversion

## Security Configuration

### Rate Limiting

```javascript
// Authentication endpoints
auth: {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 attempts per window
}

// General API endpoints
general: {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per window
}

// Signup endpoint
signup: {
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 3, // 3 signups per hour per IP
}
```

### JWT Configuration

```javascript
{
  accessTokenExpiry: '15m',
  refreshTokenExpiry: '7d',
  issuer: 'fitness-app',
  audience: 'fitness-app-users',
  algorithm: 'HS256'
}
```

## Error Handling

### Standard Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE",
  "details": {} // Optional additional information
}
```

### Common Error Codes

- `VALIDATION_ERROR` - Input validation failed
- `DUPLICATE_ENTRY` - Email already exists
- `INVALID_TOKEN` - JWT token is invalid
- `TOKEN_EXPIRED` - JWT token has expired
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `EMAIL_NOT_VERIFIED` - Account not verified
- `INVALID_CREDENTIALS` - Wrong email/password

## Environment Variables

### Required Variables

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/fitness-app

# JWT Security
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Server
PORT=3000
NODE_ENV=development

# Security
BCRYPT_ROUNDS=12
```

### Optional Variables

```bash
# CORS
ALLOWED_ORIGINS=http://localhost:19006,exp://localhost:19000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=debug
LOG_FILE=logs/app.log
```

## Usage Examples

### Frontend Integration (React Native/JavaScript)

#### Signup

```javascript
const signup = async (email, password, confirmPassword) => {
  try {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        confirmPassword,
      }),
    });

    const data = await response.json();

    if (data.success) {
      // Store token securely
      await AsyncStorage.setItem('authToken', data.token);
      return data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Signup error:', error);
    throw error;
  }
};
```

#### Signin

```javascript
const signin = async (email, password) => {
  try {
    const response = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

    if (data.success) {
      // Store token securely
      await AsyncStorage.setItem('authToken', data.token);
      return data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Signin error:', error);
    throw error;
  }
};
```

#### Authenticated Requests

```javascript
const makeAuthenticatedRequest = async (url, options = {}) => {
  const token = await AsyncStorage.getItem('authToken');

  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
};
```

## Testing

### Manual Testing with cURL

#### Signup

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!",
    "confirmPassword": "TestPass123!"
  }'
```

#### Signin

```bash
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }'
```

#### Protected Route (with token)

```bash
curl -X GET http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

## Security Best Practices Implemented

1. **Password Security**

   - Strong password requirements
   - Secure hashing with bcrypt
   - Configurable salt rounds

2. **Token Security**

   - Short-lived access tokens (15 minutes)
   - Longer refresh tokens (7 days)
   - Token rotation support
   - Unique token IDs (JTI)

3. **Input Validation**

   - Server-side validation for all inputs
   - XSS protection
   - SQL injection prevention
   - Input sanitization

4. **Rate Limiting**

   - Per-endpoint rate limits
   - IP-based throttling
   - Progressive delays

5. **Error Handling**
   - No sensitive information in errors
   - Consistent error format
   - Proper HTTP status codes

## Monitoring and Logging

The system includes comprehensive logging for:

- Authentication attempts (success/failure)
- Rate limit violations
- Token generation and validation
- Security events
- API usage patterns

## Onboarding API Endpoints

### Onboarding Routes (`/api/onboarding`)

All onboarding endpoints require authentication (JWT token in Authorization header).

#### 1. Get Onboarding Status

```http
GET /api/onboarding/status
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Onboarding status retrieved successfully",
  "data": {
    "completed": false,
    "step": 1,
    "completeness": 25,
    "sectionsCompleted": {
      "basicInfo": true,
      "lifestyle": false,
      "medicalHistory": false,
      "goals": false,
      "preferences": false
    }
  }
}
```

#### 2. Get Full User Profile

```http
GET /api/onboarding/profile
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "isEmailVerified": false,
    "onboardingCompleted": false,
    "onboardingStep": 1,
    "profileCompleteness": 25,
    "sessionInfo": {
      "completionTimestamp": null,
      "completionDate": null,
      "totalXPEarned": 0,
      "userLevel": 1,
      "sectionsCompleted": 1,
      "completionRate": "25%"
    },
    "basicInfo": {
      "name": "John Doe",
      "dateOfBirth": "1990-05-15",
      "height": 175,
      "weight": 70,
      "gender": "male",
      "location": "New York",
      "completedAt": "2024-01-15T10:30:00.000Z"
    },
    "lifestyle": {
      "sleepHours": null,
      "exerciseFrequency": null,
      "stressLevel": null,
      "completedAt": null
    },
    "medicalHistory": {
      "conditions": [],
      "medications": [],
      "allergies": [],
      "familyHistory": [],
      "completedAt": null
    },
    "goals": {
      "primary": null,
      "targetWeight": null,
      "timeframe": null,
      "completedAt": null
    },
    "preferences": {
      "workoutDuration": null,
      "equipmentAccess": [],
      "workoutIntensity": null,
      "dietaryRestrictions": [],
      "foodAllergies": "",
      "cookingFrequency": null,
      "completedAt": null
    },
    "dataQuality": {
      "hasBasicInfo": true,
      "hasLifestyle": false,
      "hasMedicalHistory": false,
      "hasGoals": false,
      "hasPreferences": false,
      "completenessScore": "25%"
    },
    "createdAt": "2024-01-15T09:00:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### 3. Update Basic Information

```http
PUT /api/onboarding/basic-info
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "John Doe",
  "dateOfBirth": "1990-05-15",
  "height": 175,
  "weight": 70,
  "gender": "male",
  "location": "New York"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Basic information updated successfully",
  "data": {
    "basicInfo": {
      "name": "John Doe",
      "dateOfBirth": "1990-05-15",
      "height": 175,
      "weight": 70,
      "gender": "male",
      "location": "New York",
      "completedAt": "2024-01-15T10:30:00.000Z"
    },
    "onboardingStatus": {
      "completed": false,
      "step": 1,
      "completeness": 25,
      "sectionsCompleted": {
        "basicInfo": true,
        "lifestyle": false,
        "medicalHistory": false,
        "goals": false,
        "preferences": false
      }
    }
  }
}
```

#### 4. Update Lifestyle Information

```http
PUT /api/onboarding/lifestyle
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "sleepHours": 7,
  "exerciseFrequency": "3-4 times per week",
  "stressLevel": "moderate",
  "smoking": "non_smoker",
  "alcohol": "occasional_consumption"
}
```

#### 5. Update Medical History

```http
PUT /api/onboarding/medical-history
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "conditions": ["hypertension"],
  "medications": ["lisinopril"],
  "allergies": ["peanuts"],
  "familyHistory": ["diabetes", "heart disease"],
  "injuries": []
}
```

#### 6. Update Goals

```http
PUT /api/onboarding/goals
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "primary": "weight_loss",
  "targetWeight": 65,
  "timeframe": "6 months",
  "specificGoals": ["lose 10kg", "improve cardiovascular health"],
  "motivations": ["health", "confidence"]
}
```

#### 7. Update Preferences (Optional)

```http
PUT /api/onboarding/preferences
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "workoutDuration": "30",
  "equipmentAccess": ["home", "gym"],
  "workoutIntensity": "medium",
  "dietaryRestrictions": ["vegetarian", "gluten-free"],
  "foodAllergies": "Nuts, shellfish",
  "cookingFrequency": "often"
}
```

**Field Descriptions:**

- `workoutDuration` (optional): Duration preference - "15", "30", "45", "60+"
- `equipmentAccess` (optional): Array of equipment access - ["home", "gym", "outdoors"]
- `workoutIntensity` (optional): Intensity preference - "low", "medium", "high"
- `dietaryRestrictions` (optional): Array of dietary restrictions - ["none", "vegetarian", "vegan", "gluten-free", "keto", "mediterranean", "intermittentFasting", "restrictive", "hyperproteic", "if", "yoyoEffect", "diabetic", "lowCarb", "paleo", "dukan", "atkins", "other"]
- `otherDietaryRegime` (optional): String for custom dietary regime when "other" is selected (max 200 chars)
- `foodAllergies` (optional): String describing food allergies (max 500 chars)
- `cookingFrequency` (optional): How often user cooks - "never", "rarely", "sometimes", "often", "daily"

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Preferences updated successfully",
  "data": {
    "preferences": {
      "workoutDuration": "30",
      "equipmentAccess": ["home", "gym"],
      "workoutIntensity": "medium",
      "dietaryRestrictions": ["vegetarian", "gluten-free"],
      "foodAllergies": "Nuts, shellfish",
      "cookingFrequency": "often",
      "completedAt": "2024-01-15T10:25:00.000Z"
    },
    "onboardingStatus": {
      "completed": false,
      "step": 5,
      "completeness": 100,
      "sectionsCompleted": {
        "basicInfo": true,
        "lifestyle": true,
        "medicalHistory": true,
        "goals": true,
        "preferences": true
      }
    }
  }
}
```

#### 8. Complete Onboarding

```http
POST /api/onboarding/complete
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Onboarding completed successfully! Welcome to your fitness journey.",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "isEmailVerified": false,
      "onboardingCompleted": true,
      "onboardingStep": 6,
      "profileCompleteness": 100,
      "basicInfo": {
        "name": "John Doe"
      },
      "createdAt": "2024-01-15T09:00:00.000Z",
      "lastLoginAt": "2024-01-15T10:30:00.000Z"
    },
    "onboardingStatus": {
      "completed": true,
      "step": 6,
      "completeness": 100,
      "sectionsCompleted": {
        "basicInfo": true,
        "lifestyle": true,
        "medicalHistory": true,
        "goals": true,
        "preferences": true
      }
    }
  }
}
```

#### 9. Skip Onboarding

```http
POST /api/onboarding/skip
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Onboarding skipped. You can complete your profile anytime from settings.",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "isEmailVerified": false,
      "onboardingCompleted": true,
      "onboardingStep": 6,
      "profileCompleteness": 0,
      "basicInfo": {
        "name": null
      },
      "createdAt": "2024-01-15T09:00:00.000Z",
      "lastLoginAt": "2024-01-15T10:30:00.000Z"
    },
    "onboardingStatus": {
      "completed": true,
      "step": 6,
      "completeness": 0,
      "sectionsCompleted": {
        "basicInfo": false,
        "lifestyle": false,
        "medicalHistory": false,
        "goals": false,
        "preferences": false
      }
    }
  }
}
```

### Health Check Routes (`/api/health`)

#### 1. Basic Health Check

```http
GET /api/health
```

**Response (200 OK):**

```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "environment": "development"
}
```

#### 2. Detailed Health Check

```http
GET /api/health/detailed
```

**Response (200 OK):**

```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "environment": "development",
  "services": {
    "database": "connected",
    "redis": "not_configured",
    "api": "operational"
  },
  "system": {
    "uptime": "2h 15m 30s",
    "memory": "45.2 MB",
    "cpu": "12%"
  }
}
```

#### 3. Database Health Check

```http
GET /api/health/database
```

**Response (200 OK):**

```json
{
  "status": "OK",
  "database": "connected",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "stats": {
    "totalUsers": 150,
    "activeUsers": 45,
    "completedOnboarding": 120
  }
}
```

## Validation Rules for Onboarding

### Basic Information Validation

- **Name:** 2-50 characters, letters and spaces only
- **Date of Birth:** Valid date, age 13-120 years
- **Height:** 50-300 cm
- **Weight:** 20-500 kg
- **Gender:** "male", "female", "other", "prefer_not_to_say"

### Lifestyle Validation

- **Sleep Hours:** 1-24 hours
- **Exercise Frequency:** Predefined options
- **Stress Level:** "low", "moderate", "high"
- **Smoking:** "non_smoker", "occasional_smoker", "regular_smoker"
- **Alcohol:** "no_alcohol", "occasional_consumption", "regular_consumption", "excessive_consumption"

### Medical History Validation

- **Conditions:** Array of predefined medical conditions
- **Medications:** Array of medication names
- **Allergies:** Array of allergen names
- **Family History:** Array of hereditary conditions

### Goals Validation

- **Primary Goal:** "weight_loss", "weight_gain", "muscle_building", "general_fitness", "endurance"
- **Target Weight:** Number (if applicable)
- **Timeframe:** "1 month", "3 months", "6 months", "1 year", "long_term"

## Frontend Integration for Onboarding

### Onboarding Flow Example

```javascript
// 1. Check onboarding status after login
const checkOnboardingStatus = async () => {
  const response = await fetch('/api/onboarding/status', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json();

  if (!data.data.completed) {
    // Navigate to onboarding screen
    navigation.navigate('Onboarding', { step: data.data.step });
  } else {
    // Navigate to main app
    navigation.navigate('Dashboard');
  }
};

// 2. Update onboarding section
const updateBasicInfo = async (basicInfo) => {
  const response = await fetch('/api/onboarding/basic-info', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(basicInfo),
  });

  const data = await response.json();

  if (data.success) {
    // Move to next step
    setOnboardingStep(data.data.onboardingStatus.step + 1);
  }
};

// 3. Complete onboarding
const completeOnboarding = async () => {
  const response = await fetch('/api/onboarding/complete', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (data.success) {
    // Navigate to dashboard
    navigation.navigate('Dashboard');
  }
};
```

## Complete Preferences Endpoint Examples

### Example 1: Fitness Enthusiast Profile

```http
PUT /api/onboarding/preferences
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "workoutDuration": "60+",
  "equipmentAccess": ["gym", "home"],
  "workoutIntensity": "high",
  "dietaryRestrictions": ["none"],
  "foodAllergies": "",
  "cookingFrequency": "daily"
}
```

### Example 2: Beginner Home Workout Profile

```http
PUT /api/onboarding/preferences
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "workoutDuration": "15",
  "equipmentAccess": ["home"],
  "workoutIntensity": "low",
  "dietaryRestrictions": ["vegetarian"],
  "foodAllergies": "Dairy products",
  "cookingFrequency": "sometimes"
}
```

### Example 3: Outdoor Activity Enthusiast

```http
PUT /api/onboarding/preferences
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "workoutDuration": "45",
  "equipmentAccess": ["outdoors", "home"],
  "workoutIntensity": "medium",
  "dietaryRestrictions": ["keto"],
  "cookingFrequency": "often"
}
```

### Example 4: User with Custom Dietary Regime

```http
PUT /api/onboarding/preferences
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "workoutDuration": "30",
  "equipmentAccess": ["home"],
  "workoutIntensity": "medium",
  "dietaryRestrictions": ["intermittentFasting", "diabetic"],
  "otherDietaryRegime": "",
  "foodAllergies": "Gluten sensitivity, dairy intolerance",
  "cookingFrequency": "daily"
}
```

### Example 5: User with Other Dietary Regime

```http
PUT /api/onboarding/preferences
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "workoutDuration": "45",
  "equipmentAccess": ["gym", "home"],
  "workoutIntensity": "high",
  "dietaryRestrictions": ["other"],
  "otherDietaryRegime": "Carnivore diet with organ meats",
  "foodAllergies": "",
  "cookingFrequency": "daily"
}
```

### Validation Rules

- All fields are optional
- `workoutDuration`: Must be one of ["15", "30", "45", "60+"]
- `equipmentAccess`: Array with values from ["home", "gym", "outdoors"]
- `workoutIntensity`: Must be one of ["low", "medium", "high"]
- `dietaryRestrictions`: Array with values from ["none", "vegetarian", "vegan", "gluten-free", "keto", "mediterranean", "intermittentFasting", "restrictive", "hyperproteic", "if", "yoyoEffect", "diabetic", "lowCarb", "paleo", "dukan", "atkins", "other"]
- `otherDietaryRegime`: String up to 200 characters for custom dietary regime
- `foodAllergies`: String up to 500 characters
- `cookingFrequency`: Must be one of ["never", "rarely", "sometimes", "often", "daily"]

## Future Enhancements

- [ ] Email verification system
- [ ] Password reset functionality
- [ ] Two-factor authentication (2FA)
- [ ] OAuth integration (Google, Facebook)
- [ ] Session management dashboard
- [ ] Advanced security monitoring
- [ ] Account recovery mechanisms

## Support

For questions or issues with the authentication system, please check the error logs and ensure all environment variables are properly configured.

## Admin API Endpoints

### Admin Routes (`/api/admin`)

All admin routes require authentication and admin privileges. Users must have `isAdmin: true` in their profile to access these endpoints.

#### Authentication Headers

```javascript
{
  "Authorization": "Bearer your_jwt_access_token_here"
}
```

#### 1. Get All Users

**Endpoint:** `GET /api/admin/users`

**Description:** Get a paginated list of all users with filtering and search capabilities.

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 10, max: 100)
- `search` (optional): Search by name or email
- `sortBy` (optional): Sort field - `createdAt`, `updatedAt`, `lastLoginAt`, `email`, `profileCompleteness`
- `sortOrder` (optional): Sort direction - `asc` or `desc`
- `verified` (optional): Filter by email verification - `true` or `false`
- `onboardingCompleted` (optional): Filter by onboarding status - `true` or `false`
- `isAdmin` (optional): Filter by admin status - `true` or `false`

**Example Request:**

```bash
GET /api/admin/users?page=1&limit=20&search=john&sortBy=createdAt&sortOrder=desc&verified=true
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": {
    "users": [
      {
        "id": "507f1f77bcf86cd799439011",
        "email": "john.doe@example.com",
        "isEmailVerified": true,
        "isAdmin": false,
        "onboardingCompleted": true,
        "onboardingStep": 6,
        "profileCompleteness": 100,
        "basicInfo": {
          "name": "John Doe",
          "dateOfBirth": "1990-01-15T00:00:00.000Z",
          "gender": "male"
        },
        "createdAt": "2024-01-15T09:00:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z",
        "lastLoginAt": "2024-01-15T10:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalUsers": 87,
      "hasNextPage": true,
      "hasPrevPage": false,
      "limit": 20
    },
    "statistics": {
      "totalUsers": 87,
      "verifiedUsers": 65,
      "completedOnboarding": 42,
      "averageCompleteness": 73.5
    }
  }
}
```

#### 2. Get User Details

**Endpoint:** `GET /api/admin/users/:id`

**Description:** Get comprehensive details about a specific user.

**Parameters:**

- `id`: User ID (MongoDB ObjectId)

**Example Request:**

```bash
GET /api/admin/users/507f1f77bcf86cd799439011
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "User details retrieved successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "email": "john.doe@example.com",
    "isEmailVerified": true,
    "isAdmin": false,
    "onboardingCompleted": true,
    "onboardingStep": 6,
    "profileCompleteness": 100,
    "sessionInfo": {
      "completionTimestamp": "2024-01-15T10:30:00.000Z",
      "totalXPEarned": 150,
      "userLevel": 2,
      "sectionsCompleted": 5,
      "completionRate": "100%"
    },
    "basicInfo": {
      "name": "John Doe",
      "dateOfBirth": "1990-01-15T00:00:00.000Z",
      "height": 180,
      "weight": 75,
      "gender": "male",
      "city": "New York",
      "completedAt": "2024-01-15T09:30:00.000Z"
    },
    "lifestyle": {
      "wakeUpTime": "07:00",
      "sleepTime": "23:00",
      "exerciseFrequency": "3-4",
      "stressLevel": 4,
      "sleepHours": 8,
      "completedAt": "2024-01-15T09:45:00.000Z"
    },
    "medicalHistory": {
      "chronicConditions": [],
      "medications": "",
      "allergies": "",
      "completedAt": "2024-01-15T10:00:00.000Z"
    },
    "goals": {
      "primaryGoal": "weightLoss",
      "targetWeight": 70,
      "timeframe": "6months",
      "completedAt": "2024-01-15T10:15:00.000Z"
    },
    "preferences": {
      "workoutDuration": "45",
      "equipmentAccess": ["gym"],
      "workoutIntensity": "medium",
      "dietaryRestrictions": ["none"],
      "cookingFrequency": "often",
      "completedAt": "2024-01-15T10:30:00.000Z"
    },
    "dataQuality": {
      "hasBasicInfo": true,
      "hasLifestyle": true,
      "hasMedicalHistory": true,
      "hasGoals": true,
      "hasPreferences": true,
      "completenessScore": "100%"
    },
    "createdAt": "2024-01-15T09:00:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "lastLoginAt": "2024-01-15T10:00:00.000Z",
    "bmi": "23.1",
    "age": 34
  }
}
```

#### 3. Update User Admin Status

**Endpoint:** `PATCH /api/admin/users/:id/admin-status`

**Description:** Grant or revoke admin privileges for a user.

**Parameters:**

- `id`: User ID (MongoDB ObjectId)

**Request Body:**

```json
{
  "isAdmin": true
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "User admin status granted successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "email": "john.doe@example.com",
    "isAdmin": true
  }
}
```

#### 4. Get User Statistics

**Endpoint:** `GET /api/admin/stats`

**Description:** Get comprehensive user statistics and analytics.

**Example Request:**

```bash
GET /api/admin/stats
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "User statistics retrieved successfully",
  "data": {
    "overall": {
      "totalUsers": 87,
      "verifiedUsers": 65,
      "completedOnboarding": 42,
      "averageCompleteness": 73.5
    },
    "onboardingSteps": [
      { "step": 0, "count": 15 },
      { "step": 1, "count": 12 },
      { "step": 2, "count": 8 },
      { "step": 3, "count": 6 },
      { "step": 4, "count": 4 },
      { "step": 6, "count": 42 }
    ],
    "recentActivity": {
      "recentRegistrations": 23,
      "activeUsers": 56
    },
    "verification": {
      "verified": 65,
      "unverified": 22
    }
  }
}
```

#### 5. Delete User

**Endpoint:** `DELETE /api/admin/users/:id`

**Description:** Delete a user account. Admins cannot delete their own account.

**Parameters:**

- `id`: User ID (MongoDB ObjectId)

**Success Response (200):**

```json
{
  "success": true,
  "message": "User deleted successfully",
  "data": {
    "deletedUserId": "507f1f77bcf86cd799439011"
  }
}
```

### Admin Authentication

To access admin endpoints, a user must:

1. **Be authenticated** - Have a valid JWT access token
2. **Have admin privileges** - Have `isAdmin: true` in their user profile

### Error Responses

**401 Unauthorized - No Authentication:**

```json
{
  "success": false,
  "message": "No authentication token provided",
  "error": "NO_TOKEN"
}
```

**403 Forbidden - Not Admin:**

```json
{
  "success": false,
  "message": "Admin privileges required to access this resource",
  "error": "ADMIN_ACCESS_REQUIRED"
}
```

**404 Not Found - User Not Found:**

```json
{
  "success": false,
  "message": "User not found"
}
```

**400 Bad Request - Invalid Parameters:**

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "id",
      "message": "Invalid user ID format"
    }
  ]
}
```

### Usage Examples

#### Get All Users with Filtering

```javascript
// Get verified users who completed onboarding, sorted by recent activity
fetch(
  '/api/admin/users?verified=true&onboardingCompleted=true&sortBy=lastLoginAt&sortOrder=desc&limit=50',
  {
    headers: {
      Authorization: 'Bearer your_jwt_token',
      'Content-Type': 'application/json',
    },
  }
);
```

#### Search Users

```javascript
// Search for users by name or email
fetch('/api/admin/users?search=john&page=1&limit=20', {
  headers: {
    Authorization: 'Bearer your_jwt_token',
  },
});
```

#### Grant Admin Access

```javascript
// Make a user an admin
fetch('/api/admin/users/507f1f77bcf86cd799439011/admin-status', {
  method: 'PATCH',
  headers: {
    Authorization: 'Bearer your_jwt_token',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ isAdmin: true }),
});
```
