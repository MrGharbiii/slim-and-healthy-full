import React, { useState, useEffect } from 'react';
import './ListeDemandesScreen.css'; // Reuse the existing CSS for now
import { usersAPI } from '../services/apiService';
import { getMockUsers } from '../data/mockUsers'; // Import mock data for testing

const UsersListScreen = ({ onLogout }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });

  // Search and sorting state
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Fetch users from API
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await usersAPI.getAll(
        pagination.page,
        pagination.limit,
        sortBy,
        sortOrder,
        search
      );

      if (response.success && response.data) {
        setUsers(response.data.users);
        setPagination(response.data.pagination);
      } else {
        setError('Erreur lors de la récupération des utilisateurs');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(
        err.message || 'Erreur lors de la récupération des utilisateurs'
      );
    } finally {
      setLoading(false);
    }
  };

  // Load users on component mount and when search/sort/pagination changes
  useEffect(() => {
    // Define a function to avoid the dependency warning
    const loadUsers = async () => {
      setLoading(true);
      try {
        // MOCK DATA OPTION: Uncomment the following line and comment out the API call
        // to use mock data instead of making an actual API call
        // const response = getMockUsers(pagination.page, pagination.limit, sortBy, sortOrder, search);

        const response = await usersAPI.getAll(
          pagination.page,
          pagination.limit,
          sortBy,
          sortOrder,
          search
        );

        if (response.success && response.data) {
          setUsers(response.data.users);
          setPagination(response.data.pagination);
        } else {
          setError('Erreur lors de la récupération des utilisateurs');
        }
      } catch (err) {
        console.error('Error fetching users:', err);
        setError(
          err.message || 'Erreur lors de la récupération des utilisateurs'
        );
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [pagination.page, pagination.limit, sortBy, sortOrder, search]);

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.pages) {
      setPagination({ ...pagination, page: newPage });
    }
  };

  // Handle search input
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  // Handle search submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPagination({ ...pagination, page: 1 }); // Reset to first page when searching
    fetchUsers();
  };

  // Handle sort change
  const handleSortChange = (field) => {
    // If already sorting by this field, toggle the order
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Default to descending for new sort field
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading && users.length === 0) {
    return (
      <div className="liste-demandes-screen">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Chargement des utilisateurs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="liste-demandes-screen">
      <div className="header">
        <div className="header-content">
          <h1>Gestion des Utilisateurs</h1>
          <button className="logout-button" onClick={onLogout}>
            Déconnexion
          </button>
        </div>
      </div>

      <div className="content">
        <div className="table-container">
          <div className="table-header">
            <h2>Liste des Utilisateurs</h2>
            <div className="table-actions">
              <div className="search-container">
                <form onSubmit={handleSearchSubmit}>
                  <input
                    type="text"
                    placeholder="Rechercher par nom ou email..."
                    value={search}
                    onChange={handleSearchChange}
                    className="search-input"
                  />
                  <button type="submit" className="search-button">
                    🔍
                  </button>
                </form>
              </div>
              <div className="stats">
                <span className="stat-item">
                  Total: <strong>{pagination.total}</strong>
                </span>
                <span className="stat-item">
                  Page:{' '}
                  <strong>
                    {pagination.page} / {pagination.pages}
                  </strong>
                </span>
              </div>
            </div>
          </div>

          {error && (
            <div className="error-message">
              <p>{error}</p>
              <button onClick={fetchUsers} className="retry-button">
                Réessayer
              </button>
            </div>
          )}

          <div className="table-wrapper">
            <table className="demandes-table">
              <thead>
                <tr>
                  <th onClick={() => handleSortChange('id')}>
                    ID {sortBy === 'id' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSortChange('name')}>
                    Nom {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSortChange('email')}>
                    Email{' '}
                    {sortBy === 'email' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSortChange('createdAt')}>
                    Inscrit le{' '}
                    {sortBy === 'createdAt' &&
                      (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSortChange('lastLoginAt')}>
                    Dernière connexion{' '}
                    {sortBy === 'lastLoginAt' &&
                      (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSortChange('onboardingCompleted')}>
                    Onboarding{' '}
                    {sortBy === 'onboardingCompleted' &&
                      (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSortChange('profileCompleteness')}>
                    Profil{' '}
                    {sortBy === 'profileCompleteness' &&
                      (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="demande-row">
                    <td className="id-cell">
                      <span className="id-badge">
                        {user.id.substring(0, 8)}...
                      </span>
                    </td>
                    <td>{user.name || 'N/A'}</td>
                    <td>{user.email}</td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td>{formatDate(user.lastLoginAt)}</td>
                    <td>
                      <span
                        className={`status-badge ${
                          user.onboardingCompleted ? 'done' : 'pending'
                        }`}
                      >
                        {user.onboardingCompleted
                          ? 'Complété'
                          : `Étape ${user.onboardingStep}/6`}
                      </span>
                    </td>
                    <td>
                      <div className="progress-container">
                        <div
                          className="progress-bar"
                          style={{ width: `${user.profileCompleteness}%` }}
                        ></div>
                        <span className="progress-text">
                          {user.profileCompleteness}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && !loading && !error && (
            <div className="empty-state">
              <p>Aucun utilisateur trouvé</p>
            </div>
          )}

          {/* Pagination controls */}
          {pagination.pages > 1 && (
            <div className="pagination-controls">
              <button
                onClick={() => handlePageChange(1)}
                disabled={pagination.page === 1}
                className="page-button"
              >
                &laquo;
              </button>
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="page-button"
              >
                &lsaquo;
              </button>

              {/* Page numbers */}
              {[...Array(pagination.pages)].map((_, i) => {
                // Only show pages close to current page
                if (
                  i === 0 ||
                  i === pagination.pages - 1 ||
                  (i >= pagination.page - 2 && i <= pagination.page + 2)
                ) {
                  return (
                    <button
                      key={i}
                      onClick={() => handlePageChange(i + 1)}
                      className={`page-button ${
                        pagination.page === i + 1 ? 'active' : ''
                      }`}
                    >
                      {i + 1}
                    </button>
                  );
                } else if (
                  (i === pagination.page - 3 && pagination.page > 3) ||
                  (i === pagination.page + 3 &&
                    pagination.page < pagination.pages - 3)
                ) {
                  // Show ellipsis for skipped pages
                  return (
                    <span key={i} className="page-ellipsis">
                      ...
                    </span>
                  );
                } else {
                  return null;
                }
              })}

              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="page-button"
              >
                &rsaquo;
              </button>
              <button
                onClick={() => handlePageChange(pagination.pages)}
                disabled={pagination.page === pagination.pages}
                className="page-button"
              >
                &raquo;
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UsersListScreen;
