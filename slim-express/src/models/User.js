const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    // Core Authentication
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters long'],
      select: false,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    requestedPlan: {
      type: Boolean,
      default: false,
    },
    assignedPlan: {
      type: Boolean,
      default: false,
    },
    // User's detailed plan
    plan: {
      profiles: [
        {
          name: String,
          percentage: Number,
        },
      ],
      sections: {
        dietetique: [String],
        activitePhysique: [String],
        micronutrition: [String],
        medicaments: [String],
        interventions: [String],
      },
      assignedAt: {
        type: Date,
        default: null,
      },
    },
    refreshTokens: [
      {
        token: String,
        createdAt: {
          type: Date,
          default: Date.now,
          expires: 604800, // 7 days in seconds
        },
      },
    ],
    lastLoginAt: Date,

    // Onboarding Progress
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },
    onboardingStep: {
      type: Number,
      default: 0, // 0 = not started, 1-5 = steps, 6 = completed
    },
    profileCompleteness: {
      type: Number,
      default: 0, // Percentage (0-100)
    },

    // DEPRECATED: Legacy Plan Request Status (use requestedPlan instead)
    planRequest: {
      type: Boolean,
      default: false,
    },

    // Session Info
    sessionInfo: {
      completionTimestamp: Date,
      completionDate: String,
      totalXPEarned: { type: Number, default: 0 },
      userLevel: { type: Number, default: 1 },
      sectionsCompleted: { type: Number, default: 0 },
      completionRate: String,
    },

    // Basic Info
    basicInfo: {
      name: {
        type: String,
        trim: true,
        minlength: [2, 'Name must be at least 2 characters long'],
        maxlength: [50, 'Name cannot exceed 50 characters'],
      },
      dateOfBirth: Date,
      height: {
        type: Number,
        min: [50, 'Height must be at least 50 cm'],
        max: [300, 'Height cannot exceed 300 cm'],
      },
      heightUnit: {
        type: String,
        enum: ['cm', 'ft'],
        default: 'cm',
      },
      weight: {
        type: Number,
        min: [20, 'Weight must be at least 20 kg'],
        max: [500, 'Weight cannot exceed 500 kg'],
      },
      weightUnit: {
        type: String,
        enum: ['kg', 'lbs'],
        default: 'kg',
      },
      activityLevel: {
        type: String,
        enum: [
          'sedentary',
          'lightly-active',
          'lightly_active',
          'moderately-active',
          'moderately_active',
          'very-active',
          'very_active',
          'extra-active',
          'extra_active',
        ],
      },
      city: String,
      profession: String,
      gender: {
        type: String,
        enum: ['male', 'female', 'other', 'Homme', 'Femme', 'Other'],
      },
      waistCircumference: Number,
      waistUnit: {
        type: String,
        enum: ['cm', 'in'],
        default: 'cm',
      },
      hipCircumference: Number,
      hipUnit: {
        type: String,
        enum: ['cm', 'in'],
        default: 'cm',
      },
      smoking: {
        type: String,
        enum: ['non_smoker', 'occasional_smoker', 'regular_smoker'],
      },
      alcohol: {
        type: String,
        enum: [
          'no_alcohol',
          'occasional_consumption',
          'regular_consumption',
          'excessive_consumption',
        ],
      },
      initialFatMass: Number,
      initialMuscleMass: Number,
      fatMassTarget: Number,
      muscleMassTarget: Number,
      waterRetentionPercentage: String,
      numberOfChildren: Number,
      completedAt: Date,
    },

    // Lifestyle
    lifestyle: {
      wakeUpTime: String,
      sleepTime: String,
      workSchedule: {
        type: String,
        enum: ['office', 'remote', 'hybrid', 'shift', 'flexible'],
      },
      exerciseFrequency: {
        type: String,
        enum: ['0', '1-2', '3-4', '5-6', '7+'],
      },
      exerciseTime: {
        type: String,
        enum: ['morning', 'afternoon', 'evening', 'night'],
      },
      favoriteActivities: [String],
      stressLevel: {
        type: Number,
        min: 1,
        max: 10,
      },
      sleepHours: {
        type: Number,
        min: 3,
        max: 12,
      },
      sleepQuality: {
        type: String,
        enum: ['poor', 'fair', 'good', 'excellent'],
      },
      completedAt: Date,
    },

    // Medical History
    medicalHistory: {
      chronicConditions: [String],
      medications: String,
      allergies: String,
      physicalLimitations: String,
      avoidAreas: [String],
      gender: {
        type: String,
        enum: ['Homme', 'Femme', 'Other'],
      },
      femaleSpecificAttributes: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
      },
      personalMedicalHistory: {
        diabetes: {
          type: String,
          enum: ['yes', 'no', 'unknown'],
          default: 'unknown',
        },
        diabetesDT1: {
          type: String,
          enum: ['yes', 'no', 'unknown'],
          default: 'unknown',
        },
        diabetesDT2: {
          type: String,
          enum: ['yes', 'no', 'unknown'],
          default: 'unknown',
        },
        obesity: {
          type: String,
          enum: ['yes', 'no', 'unknown'],
          default: 'unknown',
        },
        hypothyroidism: {
          type: String,
          enum: ['yes', 'no', 'unknown'],
          default: 'unknown',
        },
        sleepApnea: {
          type: String,
          enum: ['yes', 'no', 'unknown'],
          default: 'unknown',
        },
        psychologicalIssues: {
          type: String,
          enum: ['yes', 'no', 'unknown'],
          default: 'unknown',
        },
        psychologicalIssuesDetails: String,
        digestiveIssues: {
          type: String,
          enum: ['yes', 'no', 'unknown'],
          default: 'unknown',
        },
        gastricBalloon: {
          type: String,
          enum: ['yes', 'no', 'unknown'],
          default: 'unknown',
        },
        bariatricSurgery: {
          type: String,
          enum: ['yes', 'no', 'unknown'],
          default: 'unknown',
        },
        otherHealthIssues: String,
        sexualDysfunction: {
          type: mongoose.Schema.Types.Mixed, // Can be string or array
          default: 'unknown',
        },
        waterRetentionPercentage: String,
      },
      familyHistory: {
        heartDisease: {
          type: String,
          enum: ['yes', 'no', 'unknown'],
          default: 'unknown',
        },
        diabetes: {
          type: String,
          enum: ['yes', 'no', 'unknown'],
          default: 'unknown',
        },
        obesity: {
          type: String,
          enum: ['yes', 'no', 'unknown'],
          default: 'unknown',
        },
        thyroidIssues: {
          type: String,
          enum: ['yes', 'no', 'unknown'],
          default: 'unknown',
        },
      },
      treatmentHistory: {
        medicalTreatment: {
          type: String,
          enum: ['yes', 'no', 'unknown'],
          default: 'unknown',
        },
        psychotherapy: {
          type: String,
          enum: ['yes', 'no', 'unknown'],
          default: 'unknown',
        },
        priorObesityTreatments: String,
      },
      completedAt: Date,
    }, // Goals
    goals: {
      primaryGoal: {
        type: [String],
        enum: [
          'weightLoss', // Perte de Poids
          'muscleGain', // Prise de Muscle
          'endurance', // Endurance
          'generalHealth', // Santé Générale
          'strength', // Force
          'performance', // Performance
          'fertility', // Fertility
          // Keep old values for backward compatibility
          'weight-loss',
          'weight-gain',
          'muscle-gain',
          'maintain-weight',
          'flexibility',
        ],
        default: [],
      },
      secondaryGoals: {
        type: [String],
        enum: [
          'betterSleep', // Meilleur Sommeil
          'stressReduction', // Réduction du Stress
          'flexibility', // Flexibilité
          'balance', // Équilibre
          'energyBoost', // Boost d'Énergie
        ],
        default: [],
      },
      completedAt: Date,
    },
    preferences: {
      cookingFrequency: {
        type: String,
        enum: ['never', 'rarely', 'sometimes', 'often', 'daily'],
      },
      dietaryRestrictions: {
        type: [String], // Accept any array of strings
        default: [],
      },
      equipmentAccess: {
        type: [String],
        enum: ['home', 'gym', 'outdoors'],
      },
      foodAllergies: {
        type: String,
        default: '',
      },
      workoutDuration: {
        type: String,
        enum: ['15', '30', '45', '60+'],
      },
      workoutIntensity: {
        type: String,
        enum: ['low', 'medium', 'high'],
      },
      completedAt: Date,
    }, // Lab Results Analysis
    labResults: {
      gender: {
        type: String,
        enum: ['Male', 'Female', 'Homme', 'Femme'],
      },
      homaIR: {
        type: Number,
        min: [0, 'HOMA-IR must be a positive number'],
      },
      vitD: {
        type: Number,
        min: [0, 'Vitamin D must be a positive number'],
      },
      ferritin: {
        type: Number,
        min: [0, 'Ferritin must be a positive number'],
      },
      hemoglobin: {
        type: Number,
        min: [0, 'Hemoglobin must be a positive number'],
      },
      a1c: {
        type: Number,
        min: [0, 'A1C must be a positive number'],
      },
      tsh: {
        type: Number,
        min: [0, 'TSH must be a positive number'],
      },
      testosterone: {
        type: Number,
        min: [0, 'Testosterone must be a positive number'],
      },
      prolactin: {
        type: Number,
        min: [0, 'Prolactin must be a positive number'],
        // Required only for females - validation handled in middleware
      },
      submittedAt: {
        type: Date,
        default: Date.now,
      },
      completedAt: Date,
    },

    dataQuality: {
      hasBasicInfo: { type: Boolean, default: false },
      hasLifestyle: { type: Boolean, default: false },
      hasMedicalHistory: { type: Boolean, default: false },
      hasGoals: { type: Boolean, default: false },
      hasPreferences: { type: Boolean, default: false },
      hasLabResults: { type: Boolean, default: false },
      completenessScore: { type: String, default: '0%' },
    },

    // AI Analysis Results
    aiAnalysis: {
      lastPrediction: {
        predictions: [
          {
            profile: String,
            probability: Number,
            percentage: String,
          },
        ],
        inputData: mongoose.Schema.Types.Mixed,
        timestamp: Date,
        userId: mongoose.Schema.Types.ObjectId,
      },
      predictionHistory: [
        {
          predictions: [
            {
              profile: String,
              probability: Number,
              percentage: String,
            },
          ],
          timestamp: Date,
          dataQuality: String,
        },
      ],
      lastUpdate: Date,
      totalPredictions: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ lastLoginAt: -1 });
userSchema.index({ isEmailVerified: 1 });
userSchema.index({ isAdmin: 1 });
userSchema.index({ onboardingCompleted: 1 });
userSchema.index({ onboardingStep: 1 });
userSchema.index({ 'refreshTokens.token': 1 }); // For token validation
userSchema.index(
  { 'refreshTokens.createdAt': 1 },
  { expireAfterSeconds: 604800 }
); // TTL index for refresh tokens

// Compound indexes for complex queries
userSchema.index({ email: 1, isEmailVerified: 1 });
userSchema.index({ onboardingCompleted: 1, onboardingStep: 1 });

// Hash password before saving
userSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    // Hash password with cost of 12
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error);
  }
});

// Update profile completeness and data quality before saving
userSchema.pre('save', function (next) {
  console.log('Pre-save middleware triggered');
  console.log('Modified paths:', this.modifiedPaths());

  // Ensure email is always lowercase
  if (this.isModified('email')) {
    this.email = this.email.toLowerCase();
  }

  // Update data quality flags
  this.dataQuality.hasBasicInfo = !!(
    this.basicInfo?.name &&
    this.basicInfo?.dateOfBirth &&
    this.basicInfo?.height &&
    this.basicInfo?.weight
  );

  console.log('Basic info check:', {
    name: this.basicInfo?.name,
    dateOfBirth: this.basicInfo?.dateOfBirth,
    height: this.basicInfo?.height,
    weight: this.basicInfo?.weight,
    hasBasicInfo: this.dataQuality.hasBasicInfo,
  });

  this.dataQuality.hasLifestyle = !!(
    this.lifestyle?.wakeUpTime &&
    this.lifestyle?.sleepTime &&
    this.lifestyle?.exerciseFrequency
  );
  this.dataQuality.hasMedicalHistory = !!this.medicalHistory?.gender;
  this.dataQuality.hasGoals = !!(
    this.goals?.primaryGoal &&
    Array.isArray(this.goals.primaryGoal) &&
    this.goals.primaryGoal.length > 0
  );
  this.dataQuality.hasPreferences = !!(
    this.preferences?.workoutDuration ||
    this.preferences?.equipmentAccess?.length ||
    this.preferences?.workoutIntensity ||
    this.preferences?.dietaryRestrictions?.length ||
    this.preferences?.cookingFrequency
  );

  this.dataQuality.hasLabResults = !!(
    this.labResults?.homaIR &&
    this.labResults?.vitD &&
    this.labResults?.ferritin &&
    this.labResults?.hemoglobin &&
    this.labResults?.a1c &&
    this.labResults?.tsh &&
    this.labResults?.testosterone
  );

  // Calculate profile completeness
  const sections = [
    'hasBasicInfo',
    'hasLifestyle',
    'hasMedicalHistory',
    'hasGoals',
    'hasPreferences',
  ];
  const completedSections = sections.filter(
    (section) => this.dataQuality[section]
  ).length;
  this.profileCompleteness = Math.round(
    (completedSections / sections.length) * 100
  );
  this.dataQuality.completenessScore = `${this.profileCompleteness}%`;

  // Update onboarding status
  if (this.profileCompleteness === 100 && !this.onboardingCompleted) {
    this.onboardingCompleted = true;
    this.onboardingStep = 6;
  }

  console.log('Pre-save middleware completed, dataQuality:', this.dataQuality);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Get user's BMI
userSchema.methods.getBMI = function () {
  if (!this.basicInfo?.weight || !this.basicInfo?.height) return null;
  const heightInMeters = this.basicInfo.height / 100;
  return (this.basicInfo.weight / (heightInMeters * heightInMeters)).toFixed(1);
};

// Get user's age
userSchema.methods.getAge = function () {
  if (!this.basicInfo?.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.basicInfo.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
};

// Get onboarding status
userSchema.methods.getOnboardingStatus = function () {
  return {
    completed: this.onboardingCompleted,
    step: this.onboardingStep,
    completeness: this.profileCompleteness,
    sectionsCompleted: {
      basicInfo: this.dataQuality.hasBasicInfo,
      lifestyle: this.dataQuality.hasLifestyle,
      medicalHistory: this.dataQuality.hasMedicalHistory,
      goals: this.dataQuality.hasGoals,
      preferences: this.dataQuality.hasPreferences,
      labResults: this.dataQuality.hasLabResults,
    },
  };
};

// Update specific onboarding section
userSchema.methods.updateOnboardingSection = function (sectionName, data) {
  console.log(`Updating ${sectionName} with data:`, data);

  if (!this[sectionName]) {
    this[sectionName] = {};
  }

  // Clean and validate the data before assignment
  const cleanData = {};
  Object.keys(data).forEach((key) => {
    if (data[key] !== undefined && data[key] !== null) {
      cleanData[key] = data[key];
    }
  });

  console.log(`Clean data for ${sectionName}:`, cleanData);

  // Use Object.assign to merge the data
  Object.assign(this[sectionName], cleanData);
  this[sectionName].completedAt = new Date();

  console.log(`Updated ${sectionName}:`, this[sectionName]);

  // Mark the section as modified for Mongoose
  this.markModified(sectionName);
  // Update onboarding step based on completed sections
  const stepMapping = {
    basicInfo: 1,
    lifestyle: 2,
    medicalHistory: 3,
    goals: 4,
    preferences: 5,
    labResults: 6,
  };

  if (
    stepMapping[sectionName] &&
    this.onboardingStep < stepMapping[sectionName]
  ) {
    this.onboardingStep = stepMapping[sectionName];
  }
};

// Transform output (remove sensitive data)
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.refreshTokens;
  delete userObject.__v;
  return userObject;
};

// Get public profile (minimal data for frontend)
userSchema.methods.getPublicProfile = function () {
  return {
    id: this._id,
    email: this.email,
    isEmailVerified: this.isEmailVerified,
    onboardingCompleted: this.onboardingCompleted,
    onboardingStep: this.onboardingStep,
    profileCompleteness: this.profileCompleteness,
    basicInfo: {
      name: this.basicInfo?.name,
    },
    createdAt: this.createdAt,
    lastLoginAt: this.lastLoginAt,
  };
};

// Get full profile for authenticated user
userSchema.methods.getFullProfile = function () {
  return {
    id: this._id,
    email: this.email,
    isEmailVerified: this.isEmailVerified,
    onboardingCompleted: this.onboardingCompleted,
    onboardingStep: this.onboardingStep,
    profileCompleteness: this.profileCompleteness,
    sessionInfo: this.sessionInfo,
    basicInfo: this.basicInfo,
    lifestyle: this.lifestyle,
    medicalHistory: this.medicalHistory,
    goals: this.goals,
    preferences: this.preferences,
    labResults: this.labResults,
    dataQuality: this.dataQuality,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    lastLoginAt: this.lastLoginAt,
    bmi: this.getBMI(),
    age: this.getAge(),
  };
};

// Refresh token management
userSchema.methods.isValidRefreshToken = function (token) {
  return this.refreshTokens.some(
    (tokenObj) =>
      tokenObj.token === token &&
      new Date() < new Date(tokenObj.createdAt.getTime() + 604800000) // 7 days
  );
};

userSchema.methods.cleanExpiredTokens = function () {
  const now = new Date();
  this.refreshTokens = this.refreshTokens.filter(
    (tokenObj) => new Date(tokenObj.createdAt.getTime() + 604800000) > now
  );
};

// Static method to find by email
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Find users by onboarding status
userSchema.statics.findByOnboardingStatus = function (completed = true) {
  return this.find({
    onboardingCompleted: completed,
  }).select('-password -refreshTokens');
};

// Find users by completion step
userSchema.statics.findByOnboardingStep = function (step) {
  return this.find({
    onboardingStep: step,
  }).select('-password -refreshTokens');
};

// Additional static methods
userSchema.statics.findActiveUsers = function (days = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return this.find({
    lastLoginAt: { $gte: cutoffDate },
  }).select('-password -refreshTokens');
};

userSchema.statics.getUserStats = async function () {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        verifiedUsers: {
          $sum: { $cond: ['$isEmailVerified', 1, 0] },
        },
        completedOnboarding: {
          $sum: { $cond: ['$onboardingCompleted', 1, 0] },
        },
        averageCompleteness: {
          $avg: '$profileCompleteness',
        },
      },
    },
  ]);

  return (
    stats[0] || {
      totalUsers: 0,
      verifiedUsers: 0,
      completedOnboarding: 0,
      averageCompleteness: 0,
    }
  );
};

module.exports = mongoose.model('User', userSchema);
