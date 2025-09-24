// mockData.js - Comprehensive mock data for demandes
export const mockDemandesData = {
  DEM001: {
    id: 'DEM001',
    age: 25,
    poid: 70,
    taille: 175,
    dateSubmission: '2025-06-20',
    status: 'pending',

    // Personal Information
    sexe: 'F',
    profession: 'etudiant',
    nbEnfants: 0,

    // Medical History
    dt2: 'non',
    dt1: 'non',
    sas: 'non',
    hypothyroidie: 'non',
    sopk: 'oui',
    contraceptionHormonale: 'oui',
    accouchementAvortement2ans: 'non',
    menopausePeri: 'non',
    troublesDigestifs: 'oui',
    troubleSommeil: 'oui',
    niveauStress: 'moyen',
    psychotherapie: 'non',
    traitementAntiObesiteAnterieur: 'non',

    // Lifestyle
    activite: 'modérée',
    regimesAnterieures: 'oui',
    tabac: 'non',
    alcool: 'oui',
    nombreSeanceSportSemaine: 2,
    travailPoste: 'non',

    // Body Measurements
    p0: 70,
    mg0: 25,
    mm0: 45,
    objectifMG: 20,
    objectifMM: 50,
    tsh: 2.5,
    waistCircumference: 75,
    hipCircumference: 95,
    waterRetentionPercentage: '15%',

    // Schedule
    wakeUpTime: '07:00 AM',
    sleepTime: '11:00 PM',
    workSchedule: 'student',

    // Exercise Preferences
    exerciseFrequency: '1-2',
    exerciseTime: ['morning', 'evening'],
    favoriteActivities: ['yoga', 'walking', 'swimming'],
    workoutDuration: '30-45',
    equipmentAccess: ['home', 'outdoors'],
    workoutIntensity: 'medium',

    // Dietary Preferences
    dietaryRestrictions: ['vegetarian', 'gluten-free'],
    foodAllergies: 'Noix, lactose',
    cookingFrequency: 'often',

    // Free Text Fields
    terrainFamilial: 'Diabète type 2 chez la mère',
    troublePsy: 'Anxiété légère',
    traitements: 'Pilule contraceptive',
    ttMedical: 'Aucun traitement en cours',
  },

  DEM002: {
    id: 'DEM002',
    age: 32,
    poid: 85,
    taille: 180,
    dateSubmission: '2025-06-19',
    status: 'done',

    // Personal Information
    sexe: 'M',
    profession: 'cadre',
    nbEnfants: 2,

    // Medical History
    dt2: 'non',
    dt1: 'non',
    sas: 'oui',
    hypothyroidie: 'non',
    sopk: 'non',
    contraceptionHormonale: 'non',
    accouchementAvortement2ans: 'non',
    menopausePeri: 'non',
    troublesDigestifs: 'non',
    troubleSommeil: 'oui',
    niveauStress: 'élevé',
    psychotherapie: 'oui',
    traitementAntiObesiteAnterieur: 'non',

    // Lifestyle
    activite: 'sédentaire',
    regimesAnterieures: 'oui',
    tabac: 'oui',
    alcool: 'oui',
    nombreSeanceSportSemaine: 1,
    travailPoste: 'oui',

    // Body Measurements
    p0: 85,
    mg0: 22,
    mm0: 63,
    objectifMG: 15,
    objectifMM: 68,
    tsh: 3.2,
    waistCircumference: 95,
    hipCircumference: 105,
    waterRetentionPercentage: '18%',

    // Schedule
    wakeUpTime: '06:30 AM',
    sleepTime: '12:30 AM',
    workSchedule: 'office',

    // Exercise Preferences
    exerciseFrequency: '1-2',
    exerciseTime: ['evening'],
    favoriteActivities: ['gym', 'running'],
    workoutDuration: '45-60',
    equipmentAccess: ['gym'],
    workoutIntensity: 'high',

    // Dietary Preferences
    dietaryRestrictions: ['keto'],
    foodAllergies: 'Aucune',
    cookingFrequency: 'rarely',

    // Free Text Fields
    terrainFamilial: 'Obésité familiale côté paternel',
    troublePsy: 'Stress professionnel',
    traitements: 'Aucun',
    ttMedical: 'Suivi pour apnée du sommeil',
  },
};

export const getAllDemandes = () => {
  return Object.values(mockDemandesData);
};

export const getDemandeById = (id) => {
  return mockDemandesData[id] || null;
};
