import React from 'react';
import './UserDashboardScreen.css';

const UserDashboardScreen = ({ onLogout }) => {
  return (
    <div className="user-dashboard-container">
      <header className="user-dashboard-header">
        <h1>Bienvenue sur Slim & Healthy</h1>
        <button onClick={onLogout} className="logout-btn">
          Déconnexion
        </button>
      </header>

      <div className="user-dashboard-content">
        <div className="app-info-card">
          <div className="app-info-icon">📱</div>
          <h2>Téléchargez notre application mobile</h2>
          <p>
            Pour commencer votre parcours de fitness et de bien-être, veuillez
            télécharger notre application mobile "Slim & Healthy".
          </p>
          <div className="app-download-buttons">
            <button className="download-btn app-store">
              <i className="fa fa-apple"></i> App Store
            </button>
            <button className="download-btn play-store">
              <i className="fa fa-android"></i> Google Play
            </button>
          </div>
        </div>

        <div className="features-section">
          <h3>Ce que notre application vous offre :</h3>
          <div className="feature-grid">
            <div className="feature-item">
              <div className="feature-icon">🏋️</div>
              <h4>Programmes d'entraînement personnalisés</h4>
              <p>Des routines adaptées à vos objectifs et à votre niveau.</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🥗</div>
              <h4>Plans nutritionnels</h4>
              <p>
                Des repas équilibrés et délicieux pour atteindre vos objectifs.
              </p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">📊</div>
              <h4>Suivi de progression</h4>
              <p>Visualisez vos résultats et restez motivé.</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">👨‍👩‍👧‍👦</div>
              <h4>Communauté active</h4>
              <p>
                Rejoignez d'autres personnes partageant les mêmes objectifs.
              </p>
            </div>
          </div>
        </div>
      </div>

      <footer className="user-dashboard-footer">
        <p>&copy; 2025 Slim & Healthy. Tous droits réservés.</p>
      </footer>
    </div>
  );
};

export default UserDashboardScreen;
