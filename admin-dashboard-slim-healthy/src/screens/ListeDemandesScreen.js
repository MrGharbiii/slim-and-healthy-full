import React, { useState, useEffect } from 'react';
import './ListeDemandesScreen.css';
import { getAllDemandes } from '../data/mockData';

const ListeDemandesScreen = ({ onLogout, onDemandeClick }) => {
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock data for demonstration
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockDemandes = [
        {
          id: 'DEM001',
          age: 25,
          poid: 70,
          taille: 175,
          dateSubmission: '2025-06-20',
          status: 'pending',
        },
        {
          id: 'DEM002',
          age: 32,
          poid: 85,
          taille: 180,
          dateSubmission: '2025-06-19',
          status: 'done',
        },
        {
          id: 'DEM003',
          age: 28,
          poid: 65,
          taille: 165,
          dateSubmission: '2025-06-18',
          status: 'pending',
        },
        {
          id: 'DEM004',
          age: 45,
          poid: 90,
          taille: 185,
          dateSubmission: '2025-06-17',
          status: 'done',
        },
        {
          id: 'DEM005',
          age: 23,
          poid: 55,
          taille: 160,
          dateSubmission: '2025-06-16',
          status: 'pending',
        },
        {
          id: 'DEM006',
          age: 37,
          poid: 75,
          taille: 170,
          dateSubmission: '2025-06-15',
          status: 'done',
        },
        {
          id: 'DEM007',
          age: 29,
          poid: 68,
          taille: 172,
          dateSubmission: '2025-06-14',
          status: 'pending',
        },
        {
          id: 'DEM008',
          age: 41,
          poid: 82,
          taille: 178,
          dateSubmission: '2025-06-13',
          status: 'done',
        },
      ];
      setDemandes(mockDemandes);
      setLoading(false);
    }, 1000);
  }, []);

  const handleRowClick = (demande) => {
    console.log('Demande clicked:', demande);
    if (onDemandeClick) {
      onDemandeClick(demande);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="liste-demandes-screen">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Chargement des demandes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="liste-demandes-screen">
      <div className="header">
        <div className="header-content">
          <h1>Liste des Demandes</h1>
          <button className="logout-button" onClick={onLogout}>
            Déconnexion
          </button>
        </div>
      </div>

      <div className="content">
        <div className="table-container">
          <div className="table-header">
            <h2>Demandes en attente</h2>
            <div className="stats">
              <span className="stat-item">
                Total: <strong>{demandes.length}</strong>
              </span>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="demandes-table">
              <thead>
                {' '}
                <tr>
                  <th>ID</th>
                  <th>Âge</th>
                  <th>Poids (kg)</th>
                  <th>Taille (cm)</th>
                  <th>Date de soumission</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {demandes.map((demande) => (
                  <tr
                    key={demande.id}
                    className="demande-row"
                    onClick={() => handleRowClick(demande)}
                  >
                    {' '}
                    <td className="id-cell">
                      <span className="id-badge">{demande.id}</span>
                    </td>
                    <td>{demande.age} ans</td>
                    <td>{demande.poid} kg</td>
                    <td>{demande.taille} cm</td>
                    <td>{formatDate(demande.dateSubmission)}</td>
                    <td>
                      <span className={`status-badge ${demande.status}`}>
                        {demande.status === 'pending'
                          ? 'En attente'
                          : 'Terminé'}
                      </span>
                    </td>
                    <td>
                      <button className="view-button">Voir détails</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {demandes.length === 0 && (
            <div className="empty-state">
              <p>Aucune demande trouvée</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListeDemandesScreen;
