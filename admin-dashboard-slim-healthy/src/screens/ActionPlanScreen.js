import React, { useState } from 'react';
import './ActionPlanScreen.css';
import { usersAPI } from '../services/apiService';

// Mock data for proposed items based on profiles
const getProposedItems = (profiles) => {
  // Base items that apply to most obesity management
  const baseItems = {
    dietetique: [
      'Régime hypocalorique',
      'Contrôle des portions',
      'Alimentation équilibrée',
      'Hydratation suffisante',
      'Réduction des sucres',
      'Augmentation des fibres',
    ],
    activitePhysique: [
      'Marche quotidienne',
      'Exercices cardio',
      'Renforcement musculaire',
      'Activités aquatiques',
      'Yoga/Pilates',
      'Étirements',
    ],
    micronutrition: [
      'Vitamine D',
      'Oméga 3',
      'Probiotiques',
      'Magnésium',
      'Chrome',
      'Coenzyme Q10',
    ],
    medicaments: [
      'Metformine',
      'Inhibiteurs SGLT2',
      'Agonistes GLP-1',
      'Orlistat',
      'Liraglutide',
    ],
    intervention: [
      'Consultation nutritionniste',
      'Suivi psychologique',
      'Gastroplastie',
      'Bypass gastrique',
      'Sleeve gastrectomie',
    ],
  };

  // Add specific items based on profiles
  const profileSpecificItems = {
    'Diabète de type 2': {
      dietetique: ['Index glycémique bas', 'Comptage des glucides'],
      medicaments: ['Insuline', 'Sulfamides hypoglycémiants'],
    },
    Hypertension: {
      dietetique: ['Régime DASH', 'Réduction du sodium'],
      medicaments: ['IEC/ARA2', 'Diurétiques'],
    },
    Dyslipidémie: {
      dietetique: ['Réduction des graisses saturées', 'Stérols végétaux'],
      medicaments: ['Statines', 'Fibrates'],
    },
    'Syndrome métabolique': {
      micronutrition: ['Berbérine', 'Acide alpha-lipoïque'],
      activitePhysique: ['HIIT', 'Exercices de résistance'],
    },
  };

  // Merge base items with profile-specific items
  const finalItems = { ...baseItems };
  profiles.forEach((profile) => {
    const profileName = profile.name || profile; // Handle both object and string formats
    if (profileSpecificItems[profileName]) {
      Object.keys(profileSpecificItems[profileName]).forEach((category) => {
        if (finalItems[category]) {
          finalItems[category] = [
            ...finalItems[category],
            ...profileSpecificItems[profileName][category],
          ];
        }
      });
    }
  });

  // Remove duplicates
  Object.keys(finalItems).forEach((category) => {
    finalItems[category] = [...new Set(finalItems[category])];
  });

  return finalItems;
};

function ActionPlanScreen({ profiles, onBack, onSavePlan, userId }) {
  const [selectedItems, setSelectedItems] = useState({
    dietetique: [],
    activitePhysique: [],
    micronutrition: [],
    medicaments: [],
    intervention: [],
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const [customItemInputs, setCustomItemInputs] = useState({
    dietetique: '',
    activitePhysique: '',
    micronutrition: '',
    medicaments: '',
    intervention: '',
  });

  const proposedItems = getProposedItems(profiles || []);

  const sections = [
    {
      key: 'dietetique',
      title: 'Diététique',
      icon: '🥗',
      color: '#4CAF50',
    },
    {
      key: 'activitePhysique',
      title: 'Activité physique',
      icon: '🏃‍♂️',
      color: '#2196F3',
    },
    {
      key: 'micronutrition',
      title: 'Micronutrition/compléments',
      icon: '💊',
      color: '#FF9800',
    },
    {
      key: 'medicaments',
      title: 'Médicaments',
      icon: '💉',
      color: '#F44336',
    },
    {
      key: 'intervention',
      title: 'Intervention/chirurgie',
      icon: '🏥',
      color: '#9C27B0',
    },
  ];

  const handleItemClick = (sectionKey, item) => {
    setSelectedItems((prev) => ({
      ...prev,
      [sectionKey]: prev[sectionKey].includes(item)
        ? prev[sectionKey].filter((i) => i !== item)
        : [...prev[sectionKey], item],
    }));
  };

  const handleCustomItemChange = (sectionKey, value) => {
    setCustomItemInputs((prev) => ({
      ...prev,
      [sectionKey]: value,
    }));
  };

  const handleAddCustomItem = (sectionKey) => {
    const customItem = customItemInputs[sectionKey].trim();
    if (customItem) {
      // Add to selected items directly
      setSelectedItems((prev) => ({
        ...prev,
        [sectionKey]: [...prev[sectionKey], customItem],
      }));

      // Clear the input field
      setCustomItemInputs((prev) => ({
        ...prev,
        [sectionKey]: '',
      }));
    }
  };

  const handleSavePlan = async () => {
    // Create the plan object
    const plan = {
      profiles: profiles.map((profile) => ({
        name: profile.name,
        percentage: profile.percentage,
      })),
      items: selectedItems,
      createdAt: new Date().toISOString(),
    };

    setIsSaving(true);
    setSaveError(null);

    try {
      // Format the payload according to the expected structure
      const payload = {
        profiles: plan.profiles,
        sections: {
          dietetique: selectedItems.dietetique,
          activitePhysique: selectedItems.activitePhysique,
          micronutrition: selectedItems.micronutrition,
          medicaments: selectedItems.medicaments,
          interventions: selectedItems.intervention, // Adjusting key to match backend expectation
        },
      };

      console.log('Saving plan with payload:', payload); // Use the API to assign the plan if userId is available
      if (userId) {
        const response = await usersAPI.assignPlan(userId, payload);

        if (response.success) {
          console.log('Plan successfully assigned to user:', response.data);
          alert("Plan d'action sauvegardé et attribué avec succès!");
        } else {
          console.error('Error assigning plan:', response.message);
          setSaveError(
            `Erreur lors de l'enregistrement du plan: ${response.message}`
          );
          alert(`Erreur: ${response.message}`);
        }
      } else {
        console.log('No userId provided, plan will only be saved locally');
        alert("Plan d'action sauvegardé localement avec succès!");
      }

      // Call the onSavePlan callback from parent component
      if (onSavePlan) {
        onSavePlan(plan);
      }
    } catch (error) {
      console.error('Error saving plan:', error);
      setSaveError(`Erreur lors de l'enregistrement du plan: ${error.message}`);
      alert(`Erreur: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const getTotalSelectedItems = () => {
    return Object.values(selectedItems).reduce(
      (total, items) => total + items.length,
      0
    );
  };

  return (
    <div className="action-plan-screen">
      <div className="action-plan-header">
        {' '}
        <div className="header-top">
          <button className="back-button" onClick={onBack}>
            ← Retour
          </button>
          <h1>Constructeur de Plan d'Action</h1>
        </div>
        {profiles && profiles.length > 0 && (
          <div className="profiles-summary">
            <h3>Profils identifiés:</h3>{' '}
            <div className="profiles-tags">
              {profiles.map((profile, index) => (
                <span key={index} className="profile-tag">
                  {profile.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="action-plan-content">
        {sections.map((section) => (
          <div key={section.key} className="plan-section">
            <div
              className="section-header"
              style={{ borderColor: section.color }}
            >
              <span className="section-icon">{section.icon}</span>
              <h2 style={{ color: section.color }}>{section.title}</h2>
              <span className="selected-count">
                ({selectedItems[section.key].length} sélectionné
                {selectedItems[section.key].length !== 1 ? 's' : ''})
              </span>
            </div>

            <div className="section-content">
              <div className="proposed-items">
                <h4>Éléments proposés:</h4>
                <div className="items-grid">
                  {proposedItems[section.key]?.map((item, index) => (
                    <button
                      key={index}
                      className={`item-pill ${
                        selectedItems[section.key].includes(item)
                          ? 'selected'
                          : ''
                      }`}
                      onClick={() => handleItemClick(section.key, item)}
                      style={{
                        '--section-color': section.color,
                      }}
                    >
                      <span className="item-text">{item}</span>
                      {selectedItems[section.key].includes(item) && (
                        <span className="check-icon">✓</span>
                      )}
                    </button>
                  ))}
                </div>

                <div className="custom-item-input">
                  <h4>Ajouter un élément personnalisé:</h4>
                  <div className="custom-item-form">
                    <input
                      type="text"
                      placeholder={`Ajouter un élément personnalisé pour ${section.title}...`}
                      value={customItemInputs[section.key]}
                      onChange={(e) =>
                        handleCustomItemChange(section.key, e.target.value)
                      }
                      style={{
                        borderColor: section.color,
                      }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleAddCustomItem(section.key);
                        }
                      }}
                    />
                    <button
                      className="add-custom-item-btn"
                      onClick={() => handleAddCustomItem(section.key)}
                      style={{
                        backgroundColor: section.color,
                      }}
                      disabled={!customItemInputs[section.key].trim()}
                    >
                      Ajouter
                    </button>
                  </div>
                </div>
              </div>

              {selectedItems[section.key].length > 0 && (
                <div className="selected-items">
                  <h4>Éléments sélectionnés:</h4>
                  <div className="selected-items-list">
                    {selectedItems[section.key].map((item, index) => (
                      <div key={index} className="selected-item">
                        <span>{item}</span>
                        <button
                          className="remove-item"
                          onClick={() => handleItemClick(section.key, item)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>{' '}
      {getTotalSelectedItems() > 0 && (
        <div className="action-plan-summary">
          <div className="summary-header">
            <h3>Résumé du plan d'action</h3>
            <button
              className="save-button"
              onClick={handleSavePlan}
              disabled={getTotalSelectedItems() === 0 || isSaving}
            >
              {isSaving ? '⏳ Enregistrement...' : '💾 Sauvegarder'} (
              {getTotalSelectedItems()})
            </button>
          </div>
          {saveError && <div className="error-message">{saveError}</div>}
          <div className="summary-grid">
            {sections.map(
              (section) =>
                selectedItems[section.key].length > 0 && (
                  <div key={section.key} className="summary-section">
                    <h4 style={{ color: section.color }}>
                      {section.icon} {section.title} (
                      {selectedItems[section.key].length})
                    </h4>
                    <ul>
                      {selectedItems[section.key].map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ActionPlanScreen;
