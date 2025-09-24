const User = require('../models/User');
const aiService = require('../services/aiService');

class AIController {
  /**
   * Get AI prediction for a specific user
   * Uses user ID from URL parameters instead of authentication
   */
  async getUserPrediction(req, res) {
    try {
      const userId = req.params.userId;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required',
        });
      }

      // Get complete user data
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      // Check if user has minimum required data
      const hasRequiredData = this.validateUserDataForPrediction(user);
      if (!hasRequiredData.valid) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient user data for AI prediction',
          missingData: hasRequiredData.missing,
          hint: 'Please complete your profile, especially basic info and lab results.',
        });
      }

      // Get AI prediction
      const predictionResult = await aiService.predictForUser(user);

      if (!predictionResult.success) {
        return res.status(500).json({
          success: false,
          message: 'Failed to get AI prediction',
          error: predictionResult.error,
        });
      }

      // Store prediction in user's profile (optional)
      await this.storePredictionResult(userId, predictionResult.data);

      res.status(200).json({
        success: true,
        message: 'AI prediction generated successfully',
        data: {
          predictions: predictionResult.data.predictions,
          analysisDate: predictionResult.data.timestamp,
          dataCompleteness: this.calculateDataCompleteness(user),
        },
      });
    } catch (error) {
      console.error('AI prediction error:', error);
      res.status(500).json({
        success: false,
        message: 'An error occurred while generating AI prediction',
        error:
          process.env.NODE_ENV === 'development'
            ? error.message
            : 'Internal server error',
      });
    }
  }

  /**
   * Get AI prediction with custom data
   * Allows manual input of data for prediction
   */
  async getCustomPrediction(req, res) {
    try {
      const customData = req.body;

      // Validate custom data
      if (!customData || Object.keys(customData).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No prediction data provided',
        });
      }

      // Get AI prediction with custom data
      const predictionResult = await aiService.getPrediction(customData);

      res.status(200).json({
        success: true,
        message: 'Custom AI prediction generated successfully',
        data: {
          predictions: predictionResult.predictions,
          inputData: customData,
          analysisDate: new Date(),
        },
      });
    } catch (error) {
      console.error('Custom AI prediction error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate custom AI prediction',
        error: error.message,
      });
    }
  }

  /**
   * Get AI prediction for user after onboarding completion
   * Uses user ID from URL parameters
   */
  async getOnboardingPrediction(req, res) {
    try {
      const userId = req.params.userId;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required',
        });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      // Check if onboarding is completed
      if (!user.onboardingCompleted) {
        return res.status(400).json({
          success: false,
          message: 'Onboarding must be completed before AI analysis',
          currentStep: user.onboardingStep,
        });
      }

      // Get prediction
      const predictionResult = await aiService.predictForUser(user);

      if (!predictionResult.success) {
        // Return warning instead of error for onboarding flow
        return res.status(200).json({
          success: true,
          message: 'Onboarding completed, but AI prediction not available',
          warning: predictionResult.error,
          data: {
            predictions: [],
            needsMoreData: true,
          },
        });
      }

      // Mark that user has received AI analysis
      user.sessionInfo.totalXPEarned += 50; // Bonus XP for AI analysis
      await user.save();

      res.status(200).json({
        success: true,
        message: 'AI analysis completed for your profile',
        data: {
          predictions: predictionResult.data.predictions,
          analysisDate: predictionResult.data.timestamp,
          bonusXP: 50,
        },
      });
    } catch (error) {
      console.error('Onboarding AI prediction error:', error);
      res.status(500).json({
        success: false,
        message: 'An error occurred during AI analysis',
        error:
          process.env.NODE_ENV === 'development'
            ? error.message
            : 'Internal server error',
      });
    }
  }

  /**
   * Get AI service health status
   */
  async getAIServiceHealth(req, res) {
    try {
      // Simple health check with minimal data
      const testPayload = {
        Sexe: 'M',
        Age: 30,
        Taille: 175,
        P0: 70,
        TSH: 2.5,
      };

      const startTime = Date.now();
      await aiService.getPrediction(testPayload);
      const responseTime = Date.now() - startTime;

      res.status(200).json({
        success: true,
        message: 'AI service is healthy',
        data: {
          status: 'online',
          responseTime: `${responseTime}ms`,
          endpoint: process.env.AI_API_URL || 'http://127.0.0.1:8000',
          timestamp: new Date(),
        },
      });
    } catch (error) {
      res.status(503).json({
        success: false,
        message: 'AI service is unavailable',
        data: {
          status: 'offline',
          error: error.message,
          endpoint: process.env.AI_API_URL || 'http://127.0.0.1:8000',
          timestamp: new Date(),
        },
      });
    }
  }

  /**
   * Validate if user has minimum required data for AI prediction
   */
  validateUserDataForPrediction(user) {
    const missing = [];

    // Check required fields
    if (!user.basicInfo?.gender) missing.push('gender');
    if (!user.basicInfo?.dateOfBirth) missing.push('date of birth');
    if (!user.basicInfo?.height) missing.push('height');
    if (!user.basicInfo?.weight) missing.push('weight');
    if (!user.labResults?.tsh) missing.push('TSH lab result');

    return {
      valid: missing.length === 0,
      missing,
    };
  }

  /**
   * Calculate data completeness for better predictions
   */
  calculateDataCompleteness(user) {
    const fields = [
      'basicInfo.gender',
      'basicInfo.dateOfBirth',
      'basicInfo.height',
      'basicInfo.weight',
      'basicInfo.profession',
      'basicInfo.numberOfChildren',
      'basicInfo.smoking',
      'basicInfo.alcohol',
      'labResults.tsh',
      'lifestyle.stressLevel',
      'lifestyle.exerciseFrequency',
      'medicalHistory.personalMedicalHistory.diabetes',
      'medicalHistory.personalMedicalHistory.hypothyroidism',
    ];

    let completedFields = 0;
    fields.forEach((field) => {
      const value = field.split('.').reduce((obj, key) => obj?.[key], user);
      if (value !== undefined && value !== null && value !== '') {
        completedFields++;
      }
    });

    const percentage = Math.round((completedFields / fields.length) * 100);
    return {
      percentage,
      completedFields,
      totalFields: fields.length,
      quality: percentage >= 80 ? 'high' : percentage >= 60 ? 'medium' : 'low',
    };
  }

  /**
   * Store prediction result in user's profile
   */
  async storePredictionResult(userId, predictionData) {
    try {
      await User.findByIdAndUpdate(userId, {
        $set: {
          'aiAnalysis.lastPrediction': predictionData,
          'aiAnalysis.lastUpdate': new Date(),
        },
      });
    } catch (error) {
      console.error('Error storing prediction result:', error);
      // Don't throw error, just log it
    }
  }
}

module.exports = new AIController();
