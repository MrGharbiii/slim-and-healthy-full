import React, { useState, useEffect } from 'react';
import './ListeDemandesScreen.css'; // Reuse the existing CSS for styling base elements
import { usersAPI } from '../services/apiService';
// import { getMockUsers } from '../data/mockUsers'; // Mock data only for testing

// We'll display ALL users without any filtering

const UsersGridScreen = ({ onLogout, onDemandeClick }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12, // Increased for grid view
    total: 0,
    pages: 1,
  });

  // Search and sorting state
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Load users on component mount and when search/sort/pagination changes
  useEffect(() => {
    // Define a function to avoid the dependency warning
    const loadUsers = async () => {
      setLoading(true);
      try {
        // Call the real API endpoint to get ALL users
        const response = await usersAPI.getAll(
          pagination.page,
          pagination.limit,
          sortBy,
          sortOrder,
          search,
          false // No filtering, get ALL users
        );

        if (response.success && response.data) {
          // Helper function to check if a user has requested a plan
          const hasRequestedPlan = (user) => {
            if (!user) return false;

            // Check different possible fields for plan request status
            return (
              user.requestedPlan === true ||
              user.requestedPlan === 'true' ||
              user.planRequest === true ||
              user.planRequest === 'true' ||
              user.hasPlanRequest === true
            );
          };

          // Helper function to check if a user has an assigned plan
          const hasAssignedPlan = (user) => {
            if (!user) return false;

            // Check different possible fields for assigned plan status
            return (
              user.assignedPlan === true ||
              user.assignedPlan === 'true' ||
              user.planAssigned === true ||
              user.planAssigned === 'true' ||
              user.hasPlan === true
            );
          };

          // Sort users to put those with requestedPlan first
          const sortedUsers = [...response.data.users].sort((a, b) => {
            const aHasRequest = hasRequestedPlan(a);
            const bHasRequest = hasRequestedPlan(b);

            // If one user has requestedPlan and the other doesn't, put the one with requestedPlan first
            if (aHasRequest && !bHasRequest) return -1;
            if (!aHasRequest && bHasRequest) return 1;

            // If both have same requestedPlan status, maintain the original sorting from API
            return 0;
          });

          // Add assignedPlan property to each user if it doesn't exist
          const processedUsers = sortedUsers.map((user) => ({
            ...user,
            assignedPlan: hasAssignedPlan(user),
          }));

          setUsers(processedUsers);

          // Use pagination from API
          setPagination({
            ...response.data.pagination,
          });
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

  // Log API configuration on component mount
  useEffect(() => {
    console.log('UsersGridScreen mounted - loading all users');
  }, []);

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
  };

  // Handle sort change
  const handleSortChange = (event) => {
    const value = event.target.value;
    const [field, order] = value.split('-');
    setSortBy(field);
    setSortOrder(order);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Handle navigation to user demande details
  const handleViewDetails = (user) => {
    console.log('Viewing details for user:', user.name || user.email);

    // Get the user ID, handling different field names
    const userId = user.id || user._id;

    // For backward compatibility with mock data
    if (userId && userId.startsWith('507f')) {
      // If it's a mock user, create a fake demande object with mock ID
      const demande = {
        id: 'DEM001',
        demandeId: 'DEM001',
        userId: userId,
      };
      if (onDemandeClick) {
        onDemandeClick(demande);
      }
    } else {
      // For real API users, just pass the user ID directly to view details
      if (onDemandeClick) {
        onDemandeClick({ id: userId });
        console.log(`Viewing details for user ID: ${userId}`);
      }
    }
  };

  // Calculate days since last login
  const getDaysSinceLastLogin = (lastLoginDate) => {
    if (!lastLoginDate) return 'Jamais';

    const lastLogin = new Date(lastLoginDate);
    const today = new Date();
    const diffTime = Math.abs(today - lastLogin);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return 'Hier';
    return `Il y a ${diffDays} jours`;
  };

  // Function to fetch any user by ID and add to the grid
  // Keeping this for future use but not using it currently
  // eslint-disable-next-line no-unused-vars
  const fetchUserById = async (userId) => {
    if (!userId) return;

    setLoading(true);
    try {
      const response = await usersAPI.getById(userId);
      if (response.success && response.data) {
        const user = response.data;

        // Check if user already exists in list
        const existingIndex = users.findIndex(
          (u) => u.id === userId || u._id === userId
        );

        if (existingIndex >= 0) {
          // Replace existing user
          const updatedUsers = [...users];
          updatedUsers[existingIndex] = user;
          setUsers(updatedUsers);
        } else {
          // Add new user
          setUsers([...users, user]);
        }
      }
    } catch (err) {
      console.error(`Error fetching user ${userId}:`, err);
    } finally {
      setLoading(false);
    }
  };

  // Show loading state when first loading or reloading the data
  if (loading && users.length === 0) {
    return (
      <div className="liste-demandes-screen">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Chargement des utilisateurs depuis l'API...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="liste-demandes-screen">
      <div className="header">
        <div className="header-content">
          <h1>Tableau de Bord des Utilisateurs</h1>
          <button className="logout-button" onClick={onLogout}>
            Déconnexion
          </button>
        </div>
      </div>

      <div className="content">
        <div className="table-container user-grid-container">
          <div className="table-header">
            <h2>Liste des utilisateurs</h2>
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
              <div className="sort-container">
                <select
                  className="sort-select"
                  value={`${sortBy}-${sortOrder}`}
                  onChange={handleSortChange}
                >
                  <option value="name-asc">Nom (A-Z)</option>
                  <option value="name-desc">Nom (Z-A)</option>
                  <option value="createdAt-desc">
                    Date d'inscription (Récent)
                  </option>
                  <option value="createdAt-asc">
                    Date d'inscription (Ancien)
                  </option>
                  <option value="lastLoginAt-desc">
                    Dernière connexion (Récent)
                  </option>
                  <option value="lastLoginAt-asc">
                    Dernière connexion (Ancien)
                  </option>
                  <option value="profileCompleteness-desc">
                    Profil (Complété)
                  </option>
                  <option value="profileCompleteness-asc">
                    Profil (Incomplet)
                  </option>
                </select>
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
              <p>Erreur lors de l'appel à l'API: {error}</p>
              <p>Endpoint: /api/admin/users</p>
              <button
                onClick={() => {
                  // Reset to first page and trigger a reload
                  setPagination({ ...pagination, page: 1 });
                }}
                className="retry-button"
              >
                Réessayer
              </button>
            </div>
          )}

          {/* User Cards Grid */}
          <div className="users-grid">
            {users.map((user) => (
              <div
                key={user.id || user._id}
                className={`user-card ${
                  user.requestedPlan || user.planRequest || user.hasPlanRequest
                    ? 'requested-plan-card'
                    : ''
                }`}
              >
                <div className="user-card-header">
                  <div className="user-avatar">
                    {user.name
                      ? user.name.charAt(0).toUpperCase()
                      : user.email
                      ? user.email.charAt(0).toUpperCase()
                      : 'U'}
                  </div>
                  <div className="user-info">
                    <p className="user-email">{user.email}</p>
                    {(user.requestedPlan ||
                      user.planRequest ||
                      user.hasPlanRequest) && (
                      <span
                        className="requested-plan-badge"
                        title="L'utilisateur a demandé un plan"
                      >
                        🔔 Plan demandé
                      </span>
                    )}
                    <span
                      className={`assigned-plan-badge ${
                        user.assignedPlan ? 'yes' : 'no'
                      }`}
                      title={
                        user.assignedPlan
                          ? 'Plan déjà assigné'
                          : 'Pas de plan assigné'
                      }
                    >
                      {user.assignedPlan ? '✓ Plan assigné' : '✗ Sans plan'}
                    </span>
                  </div>
                </div>

                <div className="user-card-body">
                  <div className="user-stat">
                    <span className="stat-label">Inscrit le:</span>
                    <span className="stat-value">
                      {formatDate(user.createdAt)}
                    </span>
                  </div>

                  <div className="user-stat">
                    <span className="stat-label">Dernière connexion:</span>
                    <span className="stat-value">
                      {getDaysSinceLastLogin(user.lastLoginAt)}
                    </span>
                  </div>

                  <div className="user-stat">
                    <span className="stat-label">Onboarding:</span>
                    <span className="stat-value">
                      <span
                        className={`status-badge ${
                          user.onboardingCompleted ? 'done' : 'pending'
                        }`}
                      >
                        {user.onboardingCompleted
                          ? 'Complété'
                          : `Étape ${user.onboardingStep}/6`}
                      </span>
                    </span>
                  </div>

                  <div className="user-stat">
                    <span className="stat-label">Profil:</span>
                    <div className="stat-value">
                      <div className="progress-container">
                        <div
                          className="progress-bar"
                          style={{ width: `${user.profileCompleteness}%` }}
                        ></div>
                        <span className="progress-text">
                          {user.profileCompleteness}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="user-card-footer">
                  <span
                    className={`user-role ${user.isAdmin ? 'admin' : 'user'}`}
                  >
                    {user.isAdmin ? 'Administrateur' : 'Utilisateur'}
                  </span>
                  <button
                    className="view-details-btn"
                    onClick={() => handleViewDetails(user)}
                    title={`Voir le profil complet de ${
                      user.name || "l'utilisateur"
                    }`}
                  >
                    Voir détails
                  </button>
                </div>
              </div>
            ))}
          </div>

          {users.length === 0 && !loading && !error && (
            <div className="empty-state">
              <p>Aucun utilisateur trouvé</p>
              <p className="endpoint-info">
                /api/admin/users?page={pagination.page}&limit={pagination.limit}
                &sortBy={sortBy}&order={sortOrder}
                {search ? `&search=${search}` : ''}
              </p>
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

export default UsersGridScreen;
