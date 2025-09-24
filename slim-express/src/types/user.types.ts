// TypeScript interfaces for the User model
// This file provides type definitions for TypeScript projects

export interface IUser {
  _id: string;
  email: string;
  password?: string; // Optional because it's usually excluded
  isEmailVerified: boolean;
  refreshTokens: IRefreshToken[];
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  // Optional profile fields that can be added later
  name?: string;
  profilePicture?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  height?: number; // in centimeters
  weight?: number; // in kilograms
  activityLevel?: 'sedentary' | 'lightly-active' | 'moderately-active' | 'very-active' | 'extra-active';
  goals?: Array<'weight-loss' | 'weight-gain' | 'muscle-gain' | 'maintain-weight' | 'improve-fitness' | 'improve-strength'>;
}

export interface IRefreshToken {
  token: string;
  createdAt: Date;
}

export interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
  getBMI(): string | null;
  getAge(): number | null;
  getFullProfile(): IUserProfile;
  isValidRefreshToken(token: string): boolean;
  cleanExpiredTokens(): void;
  toJSON(): Omit<IUser, 'password' | 'refreshTokens'>;
}

export interface IUserStatics {
  findByEmail(email: string): Promise<IUser | null>;
  findActiveUsers(days?: number): Promise<IUser[]>;
  findByGoal(goal: string): Promise<IUser[]>;
  getUserStats(): Promise<IUserStats>;
}

export interface IUserProfile {
  id: string;
  email: string;
  isEmailVerified: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  // Optional profile fields
  name?: string;
  profilePicture?: string;
  dateOfBirth?: Date;
  gender?: string;
  height?: number;
  weight?: number;
  activityLevel?: string;
  goals?: string[];
  bmi?: string | null;
  age?: number | null;
}

export interface IUserStats {
  totalUsers: number;
  verifiedUsers: number;
  averageAge: number;
}

// Registration/Login DTOs
export interface IUserRegistration {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface IUserLogin {
  email: string;
  password: string;
}

export interface IUserUpdate {
  name?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  height?: number;
  weight?: number;
  activityLevel?: 'sedentary' | 'lightly-active' | 'moderately-active' | 'very-active' | 'extra-active';
  goals?: Array<'weight-loss' | 'weight-gain' | 'muscle-gain' | 'maintain-weight' | 'improve-fitness' | 'improve-strength'>;
  profilePicture?: string;
}

export interface IPasswordChange {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

// Authentication response types
export interface IAuthResponse {
  message: string;
  user: IUserProfile;
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: string;
  };
}

export interface ITokenRefreshResponse {
  message: string;
  tokens: {
    accessToken: string;
    expiresIn: string;
  };
}

// Error response types
export interface IErrorResponse {
  error: string;
  message: string;
  details?: Array<{
    field: string;
    message: string;
    value: any;
  }>;
}

// Request types with user context
export interface IAuthenticatedRequest extends Request {
  user: IUser;
  userId: string;
}

// Database connection types
export interface IDBConfig {
  uri: string;
  options?: {
    useNewUrlParser?: boolean;
    useUnifiedTopology?: boolean;
    maxPoolSize?: number;
    serverSelectionTimeoutMS?: number;
    socketTimeoutMS?: number;
  };
}

// JWT payload types
export interface IJWTPayload {
  userId: string;
  type?: 'access' | 'refresh';
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string;
}

// Environment variables interface
export interface IEnvironmentVariables {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: string;
  MONGODB_URI: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  ALLOWED_ORIGINS: string;
  RATE_LIMIT_WINDOW_MS: string;
  RATE_LIMIT_MAX_REQUESTS: string;
  BCRYPT_ROUNDS: string;
}

export default IUser;
