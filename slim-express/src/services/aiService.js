const axios = require('axios');

class AIService {
  constructor() {
    this.aiBaseUrl = 'https://profile-prediction-api.onrender.com';
    this.timeout = parseInt(process.env.AI_API_TIMEOUT) || 30000; // 30 seconds
  }

  /**
   * Transform user data from Slim Backend format to AI model format
   * @param {Object} userData - User data from database
   * @returns {Object} - Formatted data for AI model
   */
  transformUserDataToAIFormat(userData) {
    const aiPayload = {};

    // Required fields
    if (userData.basicInfo?.gender) {
      aiPayload.Sexe =
        userData.basicInfo.gender === 'male' ||
        userData.basicInfo.gender === 'Homme'
          ? 'M'
          : 'F';
    }

    if (userData.basicInfo?.dateOfBirth) {
      aiPayload.Age = this.calculateAge(userData.basicInfo.dateOfBirth);
    }

    if (userData.basicInfo?.height) {
      aiPayload.Taille = userData.basicInfo.height;
    }

    if (userData.basicInfo?.weight) {
      aiPayload.P0 = userData.basicInfo.weight;
    }

    if (userData.labResults?.tsh) {
      aiPayload.TSH = userData.labResults.tsh;
    }

    // Optional fields
    if (userData.basicInfo?.profession) {
      aiPayload.profession = this.mapProfession(userData.basicInfo.profession);
    }

    if (userData.basicInfo?.numberOfChildren !== undefined) {
      aiPayload['Nb enfants'] = userData.basicInfo.numberOfChildren;
    }

    // Medical conditions
    if (userData.medicalHistory?.personalMedicalHistory) {
      const medHistory = userData.medicalHistory.personalMedicalHistory;

      if (medHistory.diabetesDT2) {
        aiPayload.DT2 = medHistory.diabetesDT2 === 'yes' ? 'oui' : 'non';
      }

      if (medHistory.diabetesDT1) {
        aiPayload.DT1 = medHistory.diabetesDT1 === 'yes' ? 'oui' : 'non';
      }

      if (medHistory.sleepApnea) {
        aiPayload.SAS = medHistory.sleepApnea === 'yes' ? 'oui' : 'non';
      }

      if (medHistory.hypothyroidism) {
        aiPayload.Hypothyroidie =
          medHistory.hypothyroidism === 'yes' ? 'oui' : 'non';
      }

      if (medHistory.digestiveIssues) {
        aiPayload['troubles digestif'] =
          medHistory.digestiveIssues === 'yes' ? 'oui' : 'non';
      }
    }

    // Lifestyle factors
    if (userData.lifestyle?.sleepQuality) {
      aiPayload['trouble du sommeil'] =
        userData.lifestyle.sleepQuality === 'poor' ? 'oui' : 'non';
    }

    if (userData.lifestyle?.stressLevel) {
      aiPayload['niveau de stress'] = this.mapStressLevel(
        userData.lifestyle.stressLevel
      );
    }

    if (userData.basicInfo?.activityLevel) {
      aiPayload.activité = this.mapActivityLevel(
        userData.basicInfo.activityLevel
      );
    }

    if (userData.basicInfo?.smoking) {
      aiPayload.Tabac =
        userData.basicInfo.smoking !== 'non_smoker' ? 'oui' : 'non';
    }

    if (userData.basicInfo?.alcohol) {
      aiPayload.alcool =
        userData.basicInfo.alcohol !== 'no_alcohol' ? 'oui' : 'non';
    }

    if (userData.lifestyle?.exerciseFrequency) {
      aiPayload['Nombre de séance sport/semaine'] = this.mapExerciseFrequency(
        userData.lifestyle.exerciseFrequency
      );
    }

    // Body composition
    if (userData.basicInfo?.initialFatMass) {
      aiPayload.MG0 = userData.basicInfo.initialFatMass;
    }

    if (userData.basicInfo?.initialMuscleMass) {
      aiPayload.MM0 = userData.basicInfo.initialMuscleMass;
    }

    if (userData.basicInfo?.fatMassTarget) {
      aiPayload['OBJECTIF MG'] = userData.basicInfo.fatMassTarget;
    }

    if (userData.basicInfo?.muscleMassTarget) {
      aiPayload['Objectif MM'] = userData.basicInfo.muscleMassTarget;
    }

    // Medical history text fields
    if (userData.medicalHistory?.medications) {
      aiPayload.traitements = userData.medicalHistory.medications;
    }

    return aiPayload;
  }

  /**
   * Calculate age from date of birth
   */
  calculateAge(dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }

  /**
   * Map profession to AI model format
   */
  mapProfession(profession) {
    const professionMap = {
      student: 'etudiant',
      employee: 'employé',
      unemployed: 'sans emploi',
      retired: 'retraité',
      manager: 'cadre',
      worker: 'ouvrier',
    };

    return professionMap[profession?.toLowerCase()] || 'employé';
  }

  /**
   * Map stress level to AI model format
   */
  mapStressLevel(stressLevel) {
    if (typeof stressLevel === 'number') {
      if (stressLevel <= 3) return 'faible';
      if (stressLevel <= 7) return 'moyen';
      return 'élevé';
    }

    const stressMap = {
      low: 'faible',
      moderate: 'moyen',
      high: 'élevé',
    };

    return stressMap[stressLevel?.toLowerCase()] || 'moyen';
  }

  /**
   * Map activity level to AI model format
   */
  mapActivityLevel(activityLevel) {
    const activityMap = {
      sedentary: 'sédentaire',
      'lightly-active': 'modérée',
      'moderately-active': 'modérée',
      'very-active': 'sportif',
      'extra-active': 'sportif',
    };

    return activityMap[activityLevel?.toLowerCase()] || 'sédentaire';
  }

  /**
   * Map exercise frequency to weekly sessions
   */
  mapExerciseFrequency(frequency) {
    const frequencyMap = {
      0: 0,
      '1-2': 2,
      '3-4': 4,
      '5-6': 6,
      '7+': 7,
    };

    return frequencyMap[frequency] || 0;
  }

  /**
   * Validate required fields for AI prediction
   */
  validateRequiredFields(aiPayload) {
    const required = ['Sexe', 'Age', 'Taille', 'P0', 'TSH'];
    const missing = required.filter((field) => !aiPayload[field]);

    if (missing.length > 0) {
      throw new Error(
        `Missing required fields for AI prediction: ${missing.join(', ')}`
      );
    }

    // Validate ranges
    if (aiPayload.Age < 18 || aiPayload.Age > 80) {
      throw new Error('Age must be between 18 and 80 years');
    }

    if (aiPayload.TSH < 0.1 || aiPayload.TSH > 15.0) {
      throw new Error('TSH must be between 0.1 and 15.0');
    }
  }

  /**
   * Call AI prediction endpoint
   * @param {Object} aiPayload - Formatted data for AI model
   * @returns {Object} - AI prediction result
   */
  async getPrediction(aiPayload) {
    try {
      console.log(
        '🤖 Calling AI service with payload:',
        JSON.stringify(aiPayload, null, 2)
      );

      this.validateRequiredFields(aiPayload);

      const response = await axios.post(
        `${this.aiBaseUrl}/predict`,
        aiPayload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: this.timeout,
        }
      );

      console.log('🎯 AI service response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ AI service error:', error.message);

      if (error.response) {
        throw new Error(
          `AI service error: ${error.response.status} - ${
            error.response.data?.detail || error.response.statusText
          }`
        );
      } else if (error.request) {
        throw new Error(
          'AI service is not responding. Please try again later.'
        );
      } else {
        throw new Error(`AI service error: ${error.message}`);
      }
    }
  }

  /**
   * Get prediction for a user
   * @param {Object} userData - Complete user data from database
   * @returns {Object} - AI prediction result with metadata
   */
  async predictForUser(userData) {
    try {
      const aiPayload = this.transformUserDataToAIFormat(userData);
      const prediction = await this.getPrediction(aiPayload);

      return {
        success: true,
        data: {
          predictions: prediction.predictions,
          inputData: aiPayload,
          timestamp: new Date(),
          userId: userData._id,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date(),
        userId: userData._id,
      };
    }
  }
}

module.exports = new AIService();
