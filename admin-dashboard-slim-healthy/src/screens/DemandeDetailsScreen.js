import React, { useState, useEffect } from 'react';
import './DemandeDetailsScreen.css';
import { getDemandeById } from '../data/mockData';
import { usersAPI, aiAPI } from '../services/apiService';

// Helper function to calculate age from birth date
const calculateAge = (birthDateString) => {
  if (!birthDateString) return 30; // Default age
  try {
    const birthDate = new Date(birthDateString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    // Adjust age if birthday hasn't occurred yet this year
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  } catch (e) {
    console.error('Error calculating age:', e);
    return 30; // Default age if calculation fails
  }
};

const DemandeDetailsScreen = ({
  demandeId,
  onBack,
  onNavigateToActionPlan,
}) => {
  const [demande, setDemande] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCorrection, setShowCorrection] = useState(false);
  const [selectedProfiles, setSelectedProfiles] = useState([]);
  const [aiPrediction, setAiPrediction] = useState(null);
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [predictionError, setPredictionError] = useState(null);

  // Helper function to safely extract data from nested objects
  const getNestedValue = (obj, path, defaultValue = 'N/A') => {
    if (!obj) return defaultValue;

    // Handle dot notation paths like "basicInfo.name"
    const keys = path.split('.');
    let value = obj;

    for (const key of keys) {
      if (value === undefined || value === null) return defaultValue;
      value = value[key];
    }

    return value !== undefined && value !== null ? value : defaultValue;
  };

  // Fetch user details from API if the ID is not a mock ID
  useEffect(() => {
    const fetchUserData = async () => {
      // Clear any previous error
      setError(null);

      // If the demandeId starts with DEM, it's a mock ID - use mock data
      if (demandeId && demandeId.toString().startsWith('DEM')) {
        const mockDemande = getDemandeById(demandeId);
        setDemande(mockDemande);
        setLoading(false);
      } else {
        // Otherwise, fetch from API
        try {
          setLoading(true);
          console.log(`Fetching user data for ID: ${demandeId}`);
          const response = await usersAPI.getById(demandeId);

          if (response && response.success) {
            // Map API user data to our demande format for display compatibility
            const userData = response.data;

            // Create a demande object from user data - handle both MongoDB and regular ID formats
            const mappedDemande = {
              id: userData.id || userData._id,
              demandeId: userData.id || userData._id,
              userId: userData.id || userData._id,
              userName: getNestedValue(
                userData,
                'basicInfo.name',
                userData.name || 'Utilisateur'
              ),
              userEmail: userData.email,
              age:
                userData.age ||
                calculateAge(getNestedValue(userData, 'basicInfo.dateOfBirth')),
              poid: getNestedValue(userData, 'basicInfo.weight', 75),
              taille: getNestedValue(userData, 'basicInfo.height', 175),
              dateSubmission: userData.createdAt || new Date().toISOString(),
              status: userData.onboardingCompleted ? 'done' : 'pending',
              sexe:
                getNestedValue(
                  userData,
                  'basicInfo.gender',
                  getNestedValue(userData, 'medicalHistory.gender')
                ) === 'Femme'
                  ? 'F'
                  : 'M',
              profession: getNestedValue(
                userData,
                'basicInfo.profession',
                'Non spécifié'
              ),
              nbEnfants: getNestedValue(
                userData,
                'basicInfo.numberOfChildren',
                0
              ),

              // Medical history
              dt2:
                userData.medicalHistory?.personalMedicalHistory?.diabetesDT2 ||
                'non',
              dt1:
                userData.medicalHistory?.personalMedicalHistory?.diabetesDT1 ||
                'non',
              sas:
                userData.medicalHistory?.personalMedicalHistory?.sleepApnea ||
                'non',
              hypothyroidie:
                userData.medicalHistory?.personalMedicalHistory
                  ?.hypothyroidism || 'non',
              sopk:
                userData.medicalHistory?.femaleSpecificAttributes?.sopk ||
                'non',
              contraceptionHormonale:
                userData.medicalHistory?.femaleSpecificAttributes
                  ?.contraception || 'non',

              // Lifestyle
              activite: mapActivityLevel(userData.basicInfo?.activityLevel),
              tabac:
                userData.lifestyle?.smoking === 'non_smoker' ? 'non' : 'oui',
              alcool:
                userData.lifestyle?.alcohol === 'no_consumption'
                  ? 'non'
                  : 'oui',
              troubleSommeil:
                userData.lifestyle?.sleepQuality === 'poor' ? 'oui' : 'non',
              niveauStress: mapStressLevel(userData.lifestyle?.stressLevel),

              // Measurements
              p0: userData.basicInfo?.weight,
              mg0: userData.basicInfo?.initialFatMass,
              mm0: userData.basicInfo?.initialMuscleMass,
              objectifMG: userData.basicInfo?.fatMassTarget,
              objectifMM: userData.basicInfo?.muscleMassTarget,
              waistCircumference: userData.basicInfo?.waistCircumference,
              hipCircumference: userData.basicInfo?.hipCircumference,
              waterRetentionPercentage:
                userData.basicInfo?.waterRetentionPercentage,

              // Schedule
              wakeUpTime: userData.lifestyle?.wakeUpTime,
              sleepTime: userData.lifestyle?.sleepTime,
              workSchedule: 'office',

              // Exercise
              exerciseFrequency: userData.lifestyle?.exerciseFrequency,
              exerciseTime: [userData.lifestyle?.exerciseTime],
              favoriteActivities: userData.lifestyle?.favoriteActivities,
              workoutDuration: userData.preferences?.workoutDuration,
              equipmentAccess: userData.preferences?.equipmentAccess,
              workoutIntensity: userData.preferences?.workoutIntensity,

              // Diet
              dietaryRestrictions: userData.preferences?.dietaryRestrictions,
              foodAllergies: userData.preferences?.foodAllergies,
              cookingFrequency: userData.preferences?.cookingFrequency,

              // Additional
              terrainFamilial: formatFamilyHistory(
                userData.medicalHistory?.familyHistory
              ),
              troublePsy:
                userData.medicalHistory?.personalMedicalHistory
                  ?.psychologicalIssues === 'yes'
                  ? 'Oui'
                  : 'Non',
              traitements: userData.medicalHistory?.medications,
              ttMedical:
                userData.medicalHistory?.treatmentHistory?.medicalTreatment ===
                'yes'
                  ? 'Oui'
                  : 'Non',

              // Store the original API user data for reference
              apiUserData: userData,
            };

            setDemande(mappedDemande);
          } else {
            setError('Erreur lors de la récupération des données utilisateur');
          }
        } catch (err) {
          console.error('Error fetching user details:', err);
          setError(err.message || 'Erreur lors de la récupération des données');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserData();
  }, [demandeId]);

  // Fetch prediction from AI when user data is loaded
  useEffect(() => {
    const fetchPrediction = async () => {
      if (!demande) return;

      setPredictionLoading(true);
      setPredictionError(null);

      try {
        // Define required fields for the prediction API based on documentation
        // Required fields that must be present
        const requiredFields = ['Sexe', 'Age', 'Taille', 'P0', 'TSH'];

        // All possible fields including optional ones
        const allPossibleFields = [
          // Required fields
          'Sexe',
          'Age',
          'Taille',
          'P0',
          'TSH',

          // Medical conditions
          'DT1',
          'DT2',
          'SAS',
          'Hypothyroidie',
          'SOPK',
          'troubles digestif',
          'trouble du sommeil',

          // Lifestyle & Demographics
          'profession',
          'Nb enfants',
          'niveau de stress',
          'Psychothérapie',
          'activité',
          'régimes antérieures',
          'Tabac',
          'alcool',
          'Nombre de séance sport/semaine',
          'Travail posté',

          // Female-specific
          'contraception hormonale',
          'accouchement / avortement< 2 ans',
          'Menopause/Peri',

          // Treatment history
          'traitement anti-obésité antérieur',

          // Body composition
          'MG0',
          'MM0',
          'OBJECTIF MG',
          'Objectif MM',

          // Text fields
          'terrain familial',
          'trouble psy',
          'traitements',
          'TT medical',
        ];

        // Helper function to validate and normalize values based on field type
        const validateField = (field, value) => {
          // Handle numeric fields
          if (
            [
              'Age',
              'Taille',
              'P0',
              'TSH',
              'Nb enfants',
              'MG0',
              'MM0',
              'OBJECTIF MG',
              'Objectif MM',
              'Nombre de séance sport/semaine',
            ].includes(field)
          ) {
            const num = Number(value);
            if (isNaN(num)) return getDefaultForField(field);

            // Range validations
            switch (field) {
              case 'Age':
                return Math.max(18, Math.min(80, num));
              case 'Taille':
                return Math.max(140, Math.min(200, num));
              case 'P0':
                return Math.max(40, Math.min(200, num));
              case 'TSH':
                return Math.max(0.1, Math.min(15.0, num));
              case 'Nb enfants':
                return Math.max(0, Math.min(10, num));
              case 'MG0':
                return Math.max(5, Math.min(60, num));
              case 'MM0':
                return Math.max(20, Math.min(80, num));
              case 'OBJECTIF MG':
                return Math.max(0, Math.min(30, num));
              case 'Objectif MM':
                return Math.max(0, Math.min(20, num));
              case 'Nombre de séance sport/semaine':
                return Math.max(0, Math.min(10, num));
              default:
                return num;
            }
          }

          // Handle string fields with specific possible values
          switch (field) {
            case 'Sexe':
              return ['M', 'F'].includes(value) ? value : 'M';
            case 'niveau de stress':
              return ['faible', 'moyen', 'élevé'].includes(value)
                ? value
                : 'faible';
            case 'activité':
              return ['sédentaire', 'modérée', 'sportif'].includes(value)
                ? value
                : 'sédentaire';
            case 'profession':
              return [
                'etudiant',
                'employé',
                'sans emploi',
                'retraité',
                'cadre',
                'ouvrier',
              ].includes(value)
                ? value
                : 'cadre';
            case 'traitement anti-obésité antérieur':
              return [
                'non',
                'sleeve',
                'liposuccion',
                'ballon gastrique',
                'anneau gastrique',
              ].includes(value)
                ? value
                : 'non';
            // Default case for boolean fields (oui/non)
            default:
              return ['oui', 'non'].includes(value) ? value : 'non';
          }
        };

        // Helper function to get default values
        const getDefaultForField = (field) => {
          switch (field) {
            case 'Sexe':
              return 'M';
            case 'Age':
              return 35;
            case 'Taille':
              return 170;
            case 'P0':
              return 75;
            case 'TSH':
              return 2.5;
            case 'niveau de stress':
              return 'faible';
            case 'activité':
              return 'sédentaire';
            case 'profession':
              return 'cadre';
            case 'Nb enfants':
              return 0;
            case 'MG0':
              return 25;
            case 'MM0':
              return 25;
            case 'OBJECTIF MG':
              return 20;
            case 'Objectif MM':
              return 5;
            case 'Nombre de séance sport/semaine':
              return 0;
            case 'traitement anti-obésité antérieur':
              return 'non';
            // Boolean fields default to "non"
            default:
              return 'non';
          }
        };

        // Map demande data to prediction fields with validation
        const fieldMap = {
          Sexe: demande.sexe,
          Age: demande.age,
          profession: demande.profession,
          'Nb enfants': demande.nbEnfants,
          DT1: demande.dt1,
          DT2: demande.dt2,
          SAS: demande.sas,
          Hypothyroidie: demande.hypothyroidie,
          SOPK: demande.sopk,
          'troubles digestif': demande.troublesDigestifs,
          'trouble du sommeil': demande.troubleSommeil,
          'contraception hormonale': demande.contraceptionHormonale,
          'accouchement / avortement< 2 ans': demande.accouchementRecent,
          'Menopause/Peri': demande.menopause,
          'niveau de stress': demande.niveauStress,
          Psychothérapie: demande.psychotherapie,
          'traitement anti-obésité antérieur': demande.traitementAntiObesite,
          activité: demande.activite,
          'régimes antérieures': demande.regimeAnterieur,
          Tabac: demande.tabac,
          alcool: demande.alcool,
          'Nombre de séance sport/semaine': demande.seancesSport,
          'Travail posté': demande.travailPoste,
          Taille: demande.taille,
          P0: demande.p0 || demande.poid, // Support both field names
          MG0: demande.mg0,
          MM0: demande.mm0,
          'OBJECTIF MG': demande.objectifMG,
          'Objectif MM': demande.objectifMM,
          TSH: demande.tsh,
          'terrain familial': demande.terrainFamilial,
          'trouble psy': demande.troublePsy,
          traitements: demande.traitements,
          'TT medical': demande.ttMedical,
        };

        // Create the final payload ensuring required fields are present and all values are valid
        const predictionPayload = {};

        // First handle required fields
        requiredFields.forEach((field) => {
          predictionPayload[field] = validateField(field, fieldMap[field]);
        });

        // Then add optional fields if they exist in the user data
        allPossibleFields.forEach((field) => {
          if (
            !requiredFields.includes(field) &&
            fieldMap[field] !== undefined
          ) {
            predictionPayload[field] = validateField(field, fieldMap[field]);
          }
        });

        console.log('Calling AI prediction with data:', predictionPayload);

        // Call the AI prediction API
        const response = await aiAPI.customPredict(predictionPayload);

        if (response.success) {
          console.log('AI prediction result:', response.data);
          setAiPrediction(response.data);

          // If the prediction API returns profiles, you can map them to existing format
          // This depends on your API response format
          if (response.data && response.data.profiles) {
            // Map API profile data to expected format if needed
          }
        } else {
          setPredictionError(response.message || 'Failed to get prediction');
        }
      } catch (err) {
        console.error('Error fetching prediction:', err);
        setPredictionError(err.message || 'Error fetching prediction');
      } finally {
        setPredictionLoading(false);
      }
    };

    fetchPrediction();
  }, [demande]);

  // Helper functions to map API values to display values
  const mapActivityLevel = (level) => {
    const mapping = {
      sedentary: 'sédentaire',
      'lightly-active': 'légère',
      'moderately-active': 'modérée',
      'very-active': 'sportif',
      'super-active': 'très sportif',
    };
    return mapping[level] || 'modérée';
  };

  const mapStressLevel = (level) => {
    if (!level) return 'moyen';
    const numLevel = Number(level);
    if (numLevel <= 3) return 'faible';
    if (numLevel <= 7) return 'moyen';
    return 'élevé';
  };

  const formatFamilyHistory = (familyHistory) => {
    if (!familyHistory) return 'Aucune information';

    const history = [];
    if (familyHistory.heartDisease === 'yes')
      history.push('Maladies cardiovasculaires');
    if (familyHistory.diabetes === 'yes') history.push('Diabète');
    if (familyHistory.obesity === 'yes') history.push('Obésité');
    if (familyHistory.thyroidIssues === 'yes')
      history.push('Problèmes thyroïdiens');

    return history.length > 0 ? history.join(', ') : 'Aucune information';
  };

  // Show loading state
  if (loading) {
    return (
      <div className="demande-details-screen">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Chargement des données utilisateur...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !demande) {
    return (
      <div className="demande-details-screen">
        <div className="error-container">
          <h1>Demande non trouvée</h1>
          <p>{error || "Impossible de trouver les détails de l'utilisateur"}</p>
          <button onClick={onBack} className="back-button">
            Retour à la liste
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatYesNo = (value) => {
    return value === 'oui' ? 'Oui' : 'Non';
  };

  const formatProfession = (profession) => {
    const professions = {
      etudiant: 'Étudiant',
      employé: 'Employé',
      'sans emploi': 'Sans emploi',
      retraité: 'Retraité',
      cadre: 'Cadre',
      ouvrier: 'Ouvrier',
    };
    return professions[profession] || profession;
  };

  const formatActivite = (activite) => {
    const activites = {
      sédentaire: 'Sédentaire',
      modérée: 'Modérée',
      sportif: 'Sportif',
    };
    return activites[activite] || activite;
  };

  const formatStress = (stress) => {
    const levels = {
      faible: 'Faible',
      moyen: 'Moyen',
      élevé: 'Élevé',
    };
    return levels[stress] || stress;
  };

  const formatWorkSchedule = (schedule) => {
    const schedules = {
      office: 'Travail de Bureau',
      remote: 'Télétravail',
      shift: 'Travail par Équipes',
      student: 'Étudiant',
      retired: 'Retraité',
    };
    return schedules[schedule] || schedule;
  };

  const formatExerciseFrequency = (freq) => {
    const frequencies = {
      0: 'Jamais',
      '1-2': '1-2 fois par semaine',
      '3-4': '3-4 fois par semaine',
      '5-6': '5-6 fois par semaine',
      '7+': '7+ fois par semaine (Quotidien)',
    };
    return frequencies[freq] || freq;
  };
  const formatCookingFrequency = (freq) => {
    const frequencies = {
      never: 'Jamais (Plats à emporter et repas préparés)',
      rarely: 'Rarement (1-2 fois par semaine)',
      sometimes: 'Parfois (3-4 fois par semaine)',
      often: 'Souvent (La plupart des jours)',
    };
    return frequencies[freq] || freq;
  };

  // Helper function to convert profile names to CSS class names
  const getProfileClassName = (profileName) => {
    const profileClassMap = {
      iatrogene: 'iatrogene',
      metabolique: 'metabolique',
      hormonal: 'hormonal',
      psychologique: 'psychologique',
      digestif: 'digestif',
    };

    // Normalize the profile name to lowercase and remove accents
    const normalized = profileName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    return profileClassMap[normalized] || normalized;
  };

  // Define profile data with percentages - use AI prediction if available
  const profileData =
    aiPrediction && aiPrediction.data && aiPrediction.data.predictions
      ? aiPrediction.data.predictions.map((prediction) => ({
          name:
            prediction.profile.charAt(0).toUpperCase() +
            prediction.profile.slice(1), // Capitalize profile name
          percentage: parseFloat(prediction.percentage.replace('%', '')), // Convert "47.6%" to 47.6
          className: getProfileClassName(prediction.profile),
        }))
      : [
          { name: 'Métabolique', percentage: 0, className: 'metabolique' },
          { name: 'Iatrogène', percentage: 0, className: 'iatrogene' },
          { name: 'Hormonal', percentage: 0, className: 'hormonal' },
          { name: 'Psychologique', percentage: 0, className: 'psychologique' },
          { name: 'Digestif', percentage: 0, className: 'digestif' },
        ];

  // Sort profiles by percentage in descending order
  const sortedProfileData = [...profileData].sort(
    (a, b) => b.percentage - a.percentage
  );

  // Find profiles with more than 50%
  const primaryProfiles = sortedProfileData.filter(
    (profile) => profile.percentage > 50
  );

  // If no profiles are above 50%, use the highest one
  const finalPrimaryProfiles =
    primaryProfiles.length > 0
      ? primaryProfiles
      : [
          sortedProfileData.reduce((max, profile) =>
            profile.percentage > max.percentage ? profile : max
          ),
        ];

  // Generate description based on primary profiles
  const getProfileDescription = (profiles) => {
    if (profiles.length === 1) {
      const descriptions = {
        Métabolique:
          "Votre analyse de profil d'obésité indique une composante métabolique prédominante.",
        Iatrogène:
          "Votre profil suggère une obésité d'origine iatrogène, liée aux traitements médicaux.",
        Hormonal:
          "Votre analyse révèle une composante hormonale dominante dans votre profil d'obésité.",
        Psychologique:
          'Votre profil indique une composante psychologique prédominante.',
        Digestif:
          'Votre analyse montre une composante digestive dominante dans votre profil.',
      };
      return descriptions[profiles[0].name] || 'Analyse de profil en cours.';
    } else {
      const profileNames = profiles.map((p) => p.name).join(', ');
      return `Votre analyse révèle plusieurs composantes prédominantes : ${profileNames}. Cette combinaison nécessite une approche thérapeutique multidisciplinaire.`;
    }
  };
  // Handler functions
  const handleAcceptPrediction = () => {
    console.log('Prediction accepted:', finalPrimaryProfiles);
    if (onNavigateToActionPlan) {
      onNavigateToActionPlan(finalPrimaryProfiles);
    } else {
      alert("Prédiction acceptée! Navigation vers l'écran suivant...");
    }
  };

  const handleCorrectPrediction = () => {
    setShowCorrection(true);
    setSelectedProfiles([]);
  };

  const handleProfileToggle = (profile) => {
    setSelectedProfiles((prev) => {
      const isSelected = prev.some((p) => p.name === profile.name);
      if (isSelected) {
        return prev.filter((p) => p.name !== profile.name);
      } else {
        return [...prev, profile];
      }
    });
  };
  const handleSaveCorrection = () => {
    if (selectedProfiles.length === 0) {
      alert('Veuillez sélectionner au moins un profil.');
      return;
    }
    console.log('Corrected profiles:', selectedProfiles);
    const correctedProfileNames = selectedProfiles.map((p) => p.name);

    if (onNavigateToActionPlan) {
      onNavigateToActionPlan(correctedProfileNames);
    } else {
      alert(
        `Correction sauvegardée! Profils sélectionnés: ${correctedProfileNames.join(
          ', '
        )}`
      );
    }
    setShowCorrection(false);
  };

  const handleCancelCorrection = () => {
    setShowCorrection(false);
    setSelectedProfiles([]);
  };

  return (
    <div className="demande-details-screen">
      <div className="header">
        <div className="header-content">
          <button onClick={onBack} className="back-button">
            ← Retour à la liste
          </button>
          <div className="header-info">
            <h1>Détails de la demande {demande.id}</h1>
            <div className="header-meta">
              <span className={`status-badge ${demande.status}`}>
                {demande.status === 'pending' ? 'En attente' : 'Terminé'}
              </span>
              <span className="date">
                Soumise le {formatDate(demande.dateSubmission)}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="content-all">
        <div className="content">
          <div className="details-container">
            {/* Personal Information Section */}
            <div className="section">
              <h2 className="section-title">Informations Personnelles</h2>
              <div className="section-content">
                <div className="field-group">
                  <div className="field">
                    <label>Sexe</label>
                    <span className="value">
                      {demande.sexe === 'F' ? 'Féminin' : 'Masculin'}
                    </span>
                  </div>
                  <div className="field">
                    <label>Âge</label>
                    <span className="value">{demande.age} ans</span>
                  </div>
                  <div className="field">
                    <label>Profession</label>
                    <span className="value">
                      {formatProfession(demande.profession)}
                    </span>
                  </div>
                  <div className="field">
                    <label>Nombre d'enfants</label>
                    <span className="value">{demande.nbEnfants}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Physical Measurements Section */}
            <div className="section">
              <h2 className="section-title">Mesures Physiques</h2>
              <div className="section-content">
                <div className="field-group">
                  <div className="field">
                    <label>Taille</label>
                    <span className="value">{demande.taille} cm</span>
                  </div>
                  <div className="field">
                    <label>Poids initial (P0)</label>
                    <span className="value">{demande.p0} kg</span>
                  </div>
                  <div className="field">
                    <label>Masse grasse initiale (MG0)</label>
                    <span className="value">{demande.mg0}%</span>
                  </div>
                  <div className="field">
                    <label>Masse musculaire initiale (MM0)</label>
                    <span className="value">{demande.mm0}%</span>
                  </div>
                  <div className="field">
                    <label>Tour de taille</label>
                    <span className="value">
                      {demande.waistCircumference} cm
                    </span>
                  </div>
                  <div className="field">
                    <label>Tour de hanches</label>
                    <span className="value">{demande.hipCircumference} cm</span>
                  </div>
                  <div className="field">
                    <label>Rétention d'eau</label>
                    <span className="value">
                      {demande.waterRetentionPercentage}
                    </span>
                  </div>
                  <div className="field">
                    <label>TSH</label>
                    <span className="value">{demande.tsh}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Objectives Section */}
            <div className="section">
              <h2 className="section-title">Objectifs</h2>
              <div className="section-content">
                <div className="field-group">
                  <div className="field">
                    <label>Objectif Masse Grasse</label>
                    <span className="value">{demande.objectifMG}%</span>
                  </div>
                  <div className="field">
                    <label>Objectif Masse Musculaire</label>
                    <span className="value">{demande.objectifMM}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Medical History Section */}
            <div className="section">
              <h2 className="section-title">Antécédents Médicaux</h2>
              <div className="section-content">
                <div className="field-group">
                  <div className="field">
                    <label>Diabète Type 2 (DT2)</label>
                    <span className="value">{formatYesNo(demande.dt2)}</span>
                  </div>
                  <div className="field">
                    <label>Diabète Type 1 (DT1)</label>
                    <span className="value">{formatYesNo(demande.dt1)}</span>
                  </div>
                  <div className="field">
                    <label>Syndrome d'Apnée du Sommeil (SAS)</label>
                    <span className="value">{formatYesNo(demande.sas)}</span>
                  </div>
                  <div className="field">
                    <label>Hypothyroïdie</label>
                    <span className="value">
                      {formatYesNo(demande.hypothyroidie)}
                    </span>
                  </div>
                  <div className="field">
                    <label>SOPK</label>
                    <span className="value">{formatYesNo(demande.sopk)}</span>
                  </div>
                  <div className="field">
                    <label>Contraception hormonale</label>
                    <span className="value">
                      {formatYesNo(demande.contraceptionHormonale)}
                    </span>
                  </div>
                  <div className="field">
                    <label>Accouchement/Avortement &lt; 2 ans</label>
                    <span className="value">
                      {formatYesNo(demande.accouchementAvortement2ans)}
                    </span>
                  </div>
                  <div className="field">
                    <label>Ménopause/Péri-ménopause</label>
                    <span className="value">
                      {formatYesNo(demande.menopausePeri)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Health & Wellness Section */}
            <div className="section">
              <h2 className="section-title">Santé & Bien-être</h2>
              <div className="section-content">
                <div className="field-group">
                  <div className="field">
                    <label>Troubles digestifs</label>
                    <span className="value">
                      {formatYesNo(demande.troublesDigestifs)}
                    </span>
                  </div>
                  <div className="field">
                    <label>Troubles du sommeil</label>
                    <span className="value">
                      {formatYesNo(demande.troubleSommeil)}
                    </span>
                  </div>
                  <div className="field">
                    <label>Niveau de stress</label>
                    <span className="value">
                      {formatStress(demande.niveauStress)}
                    </span>
                  </div>
                  <div className="field">
                    <label>Psychothérapie</label>
                    <span className="value">
                      {formatYesNo(demande.psychotherapie)}
                    </span>
                  </div>
                  <div className="field">
                    <label>Traitement anti-obésité antérieur</label>
                    <span className="value">
                      {demande.traitementAntiObesiteAnterieur === 'non'
                        ? 'Non'
                        : demande.traitementAntiObesiteAnterieur}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Lifestyle Section */}
            <div className="section">
              <h2 className="section-title">Mode de Vie</h2>
              <div className="section-content">
                <div className="field-group">
                  <div className="field">
                    <label>Niveau d'activité</label>
                    <span className="value">
                      {formatActivite(demande.activite)}
                    </span>
                  </div>
                  <div className="field">
                    <label>Régimes antérieurs</label>
                    <span className="value">
                      {formatYesNo(demande.regimesAnterieures)}
                    </span>
                  </div>
                  <div className="field">
                    <label>Tabac</label>
                    <span className="value">{formatYesNo(demande.tabac)}</span>
                  </div>
                  <div className="field">
                    <label>Alcool</label>
                    <span className="value">{formatYesNo(demande.alcool)}</span>
                  </div>
                  <div className="field">
                    <label>Séances de sport par semaine</label>
                    <span className="value">
                      {demande.nombreSeanceSportSemaine}
                    </span>
                  </div>
                  <div className="field">
                    <label>Travail posté</label>
                    <span className="value">
                      {formatYesNo(demande.travailPoste)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Schedule Section */}
            <div className="section">
              <h2 className="section-title">Horaires</h2>
              <div className="section-content">
                <div className="field-group">
                  <div className="field">
                    <label>Heure de réveil</label>
                    <span className="value">{demande.wakeUpTime}</span>
                  </div>
                  <div className="field">
                    <label>Heure de coucher</label>
                    <span className="value">{demande.sleepTime}</span>
                  </div>
                  <div className="field">
                    <label>Type de travail</label>
                    <span className="value">
                      {formatWorkSchedule(demande.workSchedule)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Exercise Preferences Section */}
            <div className="section">
              <h2 className="section-title">Préférences d'Exercice</h2>
              <div className="section-content">
                <div className="field-group">
                  <div className="field">
                    <label>Fréquence d'exercice</label>
                    <span className="value">
                      {formatExerciseFrequency(demande.exerciseFrequency)}
                    </span>
                  </div>
                  <div className="field">
                    <label>Moments préférés</label>
                    <span className="value">
                      {demande.exerciseTime?.join(', ')}
                    </span>
                  </div>
                  <div className="field">
                    <label>Activités favorites</label>
                    <span className="value">
                      {demande.favoriteActivities?.join(', ')}
                    </span>
                  </div>
                  <div className="field">
                    <label>Durée d'entraînement</label>
                    <span className="value">
                      {demande.workoutDuration} minutes
                    </span>
                  </div>
                  <div className="field">
                    <label>Accès équipement</label>
                    <span className="value">
                      {demande.equipmentAccess?.join(', ')}
                    </span>
                  </div>
                  <div className="field">
                    <label>Intensité préférée</label>
                    <span className="value">{demande.workoutIntensity}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Dietary Preferences Section */}
            <div className="section">
              <h2 className="section-title">Préférences Alimentaires</h2>
              <div className="section-content">
                <div className="field-group">
                  <div className="field">
                    <label>Restrictions alimentaires</label>
                    <span className="value">
                      {demande.dietaryRestrictions?.join(', ') || 'Aucune'}
                    </span>
                  </div>
                  <div className="field">
                    <label>Allergies alimentaires</label>
                    <span className="value">{demande.foodAllergies}</span>
                  </div>
                  <div className="field">
                    <label>Fréquence de cuisine</label>
                    <span className="value">
                      {formatCookingFrequency(demande.cookingFrequency)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information Section */}
            <div className="section">
              <h2 className="section-title">Informations Complémentaires</h2>
              <div className="section-content">
                <div className="field-group">
                  <div className="field full-width">
                    <label>Terrain familial</label>
                    <span className="value">{demande.terrainFamilial}</span>
                  </div>
                  <div className="field full-width">
                    <label>Troubles psychologiques</label>
                    <span className="value">{demande.troublePsy}</span>
                  </div>
                  <div className="field full-width">
                    <label>Traitements</label>
                    <span className="value">{demande.traitements}</span>
                  </div>
                  <div className="field full-width">
                    <label>Traitement médical</label>
                    <span className="value">{demande.ttMedical}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="prediction-container">
          <div className="prediction-header">
            <h2>🔬 Analyse Prédictive</h2>
            <p className="prediction-subtitle">
              Profil d'obésité basé sur l'analyse des données
            </p>
            {predictionLoading && (
              <div className="prediction-loading">
                <div className="loading-spinner small"></div>
                <p>Calcul de la prédiction en cours...</p>
              </div>
            )}
            {predictionError && (
              <div className="prediction-error">
                <p>Erreur: {predictionError}</p>
                <button
                  className="retry-button"
                  onClick={() => {
                    setPredictionError(null);
                    // Retry prediction with minimal required fields
                    const retryPrediction = async () => {
                      setPredictionLoading(true);

                      try {
                        // Create minimal payload with just the required fields
                        const minimalPayload = {
                          Sexe: demande.sexe || 'M',
                          Age: demande.age || 35,
                          Taille: demande.taille || 170,
                          P0: demande.p0 || demande.poid || 75,
                          TSH: demande.tsh || 2.5,
                        };

                        console.log(
                          'Retrying prediction with minimal data:',
                          minimalPayload
                        );
                        const response = await aiAPI.customPredict(
                          minimalPayload
                        );

                        if (response.success) {
                          console.log('AI prediction result:', response.data);
                          setAiPrediction(response);
                        } else {
                          setPredictionError(
                            response.message || 'Échec de la prédiction'
                          );
                        }
                      } catch (error) {
                        console.error('Error retrying prediction:', error);
                        setPredictionError(
                          error.message ||
                            'Erreur lors de la nouvelle tentative'
                        );
                      } finally {
                        setPredictionLoading(false);
                      }
                    };

                    retryPrediction();
                  }}
                >
                  Réessayer
                </button>
              </div>
            )}
            {aiPrediction && (
              <div className="ai-prediction">
                <h3>Résultat de l'Analyse par IA</h3>
                <div className="ai-prediction-result">
                  <p>
                    Analyse basée sur{' '}
                    {aiPrediction.data?.predictions?.length || 0} profils
                    identifiés.
                  </p>
                  <p>
                    Date d'analyse:{' '}
                    {new Date(aiPrediction.data?.analysisDate).toLocaleString(
                      'fr-FR'
                    )}
                  </p>
                  {/* Uncomment for debugging 
                  <details>
                    <summary>Données brutes</summary>
                    <pre>{JSON.stringify(aiPrediction, null, 2)}</pre>
                  </details>
                  */}
                </div>
              </div>
            )}
          </div>{' '}
          {/* Primary Profile */}
          <div className="primary-profile">
            <h3>
              {finalPrimaryProfiles.length === 1
                ? 'Profil Principal'
                : 'Profils Principaux'}
              :{' '}
              {finalPrimaryProfiles.map((profile, index) => (
                <span key={index}>
                  <span className={`profile-type ${profile.className}`}>
                    {profile.name} ({profile.percentage}%)
                  </span>
                  {index < finalPrimaryProfiles.length - 1 && ', '}
                </span>
              ))}
            </h3>
            <p className="profile-description">
              {getProfileDescription(finalPrimaryProfiles)}
            </p>
          </div>{' '}
          {/* Profile Distribution */}
          <div className="profile-distribution">
            <h4>Distribution des Profils</h4>
            <div className="profile-bars">
              {sortedProfileData.map((profile, index) => (
                <div key={index} className="profile-bar">
                  <div className="bar-label">
                    <span className="profile-name">{profile.name}</span>
                    <span className="profile-percentage">
                      {profile.percentage}%
                    </span>
                  </div>{' '}
                  <div className="bar-container">
                    <div
                      className={`bar-fill ${profile.className}`}
                      style={{ width: `${profile.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Correction UI */}
          {showCorrection && (
            <div className="correction-container">
              <h4>Corriger la prédiction</h4>
              <p className="correction-instruction">
                Sélectionnez le ou les profils que vous considérez comme
                corrects :
              </p>
              <div className="correction-profiles">
                {sortedProfileData.map((profile, index) => (
                  <div
                    key={index}
                    className={`correction-profile ${
                      selectedProfiles.some((p) => p.name === profile.name)
                        ? 'selected'
                        : ''
                    }`}
                    onClick={() => handleProfileToggle(profile)}
                  >
                    <div className="correction-profile-content">
                      <span className={`profile-badge ${profile.className}`}>
                        {profile.name}
                      </span>
                      <span className="correction-percentage">
                        {profile.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="correction-actions">
                <button
                  className="correction-save-btn"
                  onClick={handleSaveCorrection}
                  disabled={selectedProfiles.length === 0}
                >
                  Sauvegarder
                </button>
                <button
                  className="correction-cancel-btn"
                  onClick={handleCancelCorrection}
                >
                  Annuler
                </button>
              </div>
            </div>
          )}
          {/* Action Buttons */}
          {!showCorrection && (
            <div className="prediction-actions">
              <button
                className="accept-prediction-btn"
                onClick={handleAcceptPrediction}
              >
                ✓ Accepter la prédiction
              </button>
              <button
                className="correct-prediction-btn"
                onClick={handleCorrectPrediction}
              >
                ✏️ Corriger la prédiction
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DemandeDetailsScreen;
