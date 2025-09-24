// apiService.js - Centralized API service for the application
const API_URL = 'https://slim-express-1.onrender.com';

// Helper function for making API requests with auth token
const fetchWithAuth = async (endpoint, options = {}) => {
  // Get the access token from storage
  const accessToken =
    localStorage.getItem('accessToken') ||
    sessionStorage.getItem('accessToken');

  // Set default headers with auth token
  const headers = {
    'Content-Type': 'application/json',
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...options.headers,
  };

  // Create a safe copy of request body for logging (without sensitive data)
  let logBody = options.body ? '(request body present)' : undefined;
  try {
    if (options.body) {
      const bodyObj = JSON.parse(options.body);
      // Remove sensitive fields for logging
      if (bodyObj.password) bodyObj.password = '******';
      if (bodyObj.token) bodyObj.token = '******';
      if (bodyObj.refreshToken) bodyObj.refreshToken = '******';
      logBody = bodyObj;
    }
  } catch (e) {
    logBody = '(non-JSON body)';
  }

  // Log the API request
  console.log(
    '%c 🔄 API Request',
    'background: #4CAF50; color: white; padding: 2px 4px; border-radius: 2px;',
    {
      url: `${API_URL}${endpoint}`,
      method: options.method || 'GET',
      headers: {
        ...headers,
        Authorization: accessToken ? 'Bearer ******' : undefined,
      },
      body: logBody,
    }
  );

  try {
    console.time(`API ${options.method || 'GET'} ${endpoint}`);
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });
    console.timeEnd(`API ${options.method || 'GET'} ${endpoint}`);

    // Log response status
    console.log(
      '%c 📥 API Response Status',
      'background: #2196F3; color: white; padding: 2px 4px; border-radius: 2px;',
      {
        endpoint,
        status: response.status,
        statusText: response.statusText,
      }
    );

    // Handle 401 Unauthorized (token expired or invalid)
    if (response.status === 401) {
      // Try to refresh token
      const refreshed = await refreshToken();

      // If token refresh successful, retry the original request
      if (refreshed) {
        const newAccessToken =
          localStorage.getItem('accessToken') ||
          sessionStorage.getItem('accessToken');
        const newHeaders = {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${newAccessToken}`,
          ...options.headers,
        };

        // Retry original request with new token
        return fetch(`${API_URL}${endpoint}`, {
          ...options,
          headers: newHeaders,
        });
      } else {
        // If refresh failed, clear auth data and redirect to login
        clearAuth();
        window.location.href = '/'; // Redirect to root which shows login
        throw new Error('Authentication expired. Please log in again.');
      }
    }

    return response;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Function to attempt refreshing the token
const refreshToken = async () => {
  const refreshToken =
    localStorage.getItem('refreshToken') ||
    sessionStorage.getItem('refreshToken');

  if (!refreshToken) {
    return false;
  }

  try {
    const response = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const data = await response.json();

    if (data.success && data.token) {
      // Store the new token using the same structure as login response
      const storage = localStorage.getItem('accessToken')
        ? localStorage
        : sessionStorage;
      storage.setItem('accessToken', data.token);
      // The refresh token implementation might need to be updated based on actual backend response
      if (data.refreshToken) {
        storage.setItem('refreshToken', data.refreshToken);
      }
      return true;
    }

    return false;
  } catch (error) {
    console.error('Token refresh failed:', error);
    clearAuth();
    return false;
  }
};

// Function to clear authentication data
const clearAuth = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  sessionStorage.removeItem('user');
  sessionStorage.removeItem('accessToken');
  sessionStorage.removeItem('refreshToken');
};

// Authentication API methods
export const authAPI = {
  login: async (email, password) => {
    try {
      // Log the request details
      console.log(
        '%c 🔄 Login Request',
        'background: #4CAF50; color: white; padding: 2px 4px; border-radius: 2px;',
        {
          url: `${API_URL}/api/auth/signin`,
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: { email, password: '******' }, // Hide actual password in logs
        }
      );

      // Log the actual URL being used for debugging
      console.log('🔍 API URL:', API_URL);

      const response = await fetch(`${API_URL}/api/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      // Log response status
      console.log(
        '%c 📥 Login Response Status',
        'background: #2196F3; color: white; padding: 2px 4px; border-radius: 2px;',
        {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
        }
      );

      // Parse the JSON response
      let data;
      try {
        data = await response.json();
        // Log the response data
        console.log(
          '%c 📥 Login Response Data',
          'background: #2196F3; color: white; padding: 2px 4px; border-radius: 2px;',
          data
        );
      } catch (parseError) {
        console.error(
          '%c ❌ JSON Parse Error',
          'background: #FF9800; color: white; padding: 2px 4px; border-radius: 2px;',
          parseError
        );
        throw new Error('Failed to parse response data');
      }

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Return the standardized response structure from backend: {success, message, token, user}
      // The user object should contain the isAdmin property (boolean) to control app navigation
      // Expected format: {success: true, message: "Login successful", token: "jwt-token", user: {id, name, email, isAdmin, ...}}
      // This structure should be consistent across all auth endpoints
      return data;
    } catch (error) {
      console.error(
        '%c ❌ Login Error',
        'background: #F44336; color: white; padding: 2px 4px; border-radius: 2px;',
        error
      );
      throw error;
    }
  },

  logout: async () => {
    try {
      await fetchWithAuth('/api/auth/logout', { method: 'POST' });
      clearAuth();
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear auth data even if the API call fails
      clearAuth();
    }
  },
};

// Demandes API methods
export const demandesAPI = {
  getAll: async () => {
    const response = await fetchWithAuth('/api/demandes');
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch demandes');
    }
    return response.json();
  },

  getById: async (id) => {
    const response = await fetchWithAuth(`/api/demandes/${id}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to fetch demande ${id}`);
    }
    return response.json();
  },

  updateStatus: async (id, status) => {
    const response = await fetchWithAuth(`/api/demandes/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.message || `Failed to update status for demande ${id}`
      );
    }
    return response.json();
  },
};

// Profiles API methods
export const profilesAPI = {
  getByDemandeId: async (demandeId) => {
    const response = await fetchWithAuth(`/api/demandes/${demandeId}/profiles`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.message || `Failed to fetch profiles for demande ${demandeId}`
      );
    }
    return response.json();
  },

  analyze: async (demandeId) => {
    const response = await fetchWithAuth(`/api/demandes/${demandeId}/analyze`, {
      method: 'POST',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.message || `Failed to analyze demande ${demandeId}`
      );
    }
    return response.json();
  },
};

// Action Plans API methods
export const actionPlansAPI = {
  getByDemandeId: async (demandeId) => {
    const response = await fetchWithAuth(
      `/api/demandes/${demandeId}/action-plans`
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.message || `Failed to fetch action plans for demande ${demandeId}`
      );
    }
    return response.json();
  },

  create: async (demandeId, actionPlanData) => {
    const response = await fetchWithAuth(
      `/api/demandes/${demandeId}/action-plans`,
      {
        method: 'POST',
        body: JSON.stringify(actionPlanData),
      }
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.message || `Failed to create action plan for demande ${demandeId}`
      );
    }
    return response.json();
  },
};

// Users API methods
export const usersAPI = {
  getAll: async (
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    order = 'desc',
    search = '',
    onlyRequestedPlans = false // New parameter to filter by requestedPlan
  ) => {
    // Build query parameters
    const queryParams = new URLSearchParams();
    queryParams.append('page', page);
    queryParams.append('limit', limit);
    queryParams.append('sortBy', sortBy);
    queryParams.append('order', order);

    if (search) {
      queryParams.append('search', search);
    }

    // Add filter for requestedPlan if specified
    if (onlyRequestedPlans) {
      // Try both common field names in case the API uses a different one
      queryParams.append('requestedPlan', 'true');
      queryParams.append('planRequest', 'true');
    }

    const endpoint = `/api/admin/users?${queryParams.toString()}`;

    const response = await fetchWithAuth(endpoint);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch users');
    }

    const data = await response.json();
    console.log('Users API response:', data);

    // If the API doesn't support filtering by requestedPlan, do it client-side
    if (onlyRequestedPlans && data.success && data.data && data.data.users) {
      console.log(
        'Filtering users client-side for requestedPlan=true or other variants'
      );

      // Check if our specific user is in the results
      const specificUserId = '685f9ce079bfa07558bf3eb7';
      const specificUser = data.data.users.find((u) => {
        const userId = u.id || u._id;
        return userId === specificUserId;
      });

      if (specificUser) {
        console.log('Found target user in response:', specificUser);
        console.log(
          'Target user requestedPlan value:',
          specificUser.requestedPlan
        );
        console.log('Target user planRequest value:', specificUser.planRequest);
      } else {
        console.log(
          'Target user NOT found in response, will attempt direct fetch'
        );

        // If we don't find the specific user in the results, try to fetch directly
        try {
          this.getById(specificUserId).then((result) => {
            if (result.success && result.data) {
              console.log(
                'Direct fetch of target user successful:',
                result.data
              );
            }
          });
        } catch (err) {
          console.error('Failed to directly fetch target user:', err);
        }
      }

      // More robust filtering to handle various field names and value types
      data.data.users = data.data.users.filter((user) => {
        // Helper function to check if a value is truthy in various formats
        const isTruthy = (value) => {
          if (
            value === true ||
            value === 'true' ||
            value === 1 ||
            value === '1'
          ) {
            return true;
          }
          return false;
        };

        // Check for any field that might indicate a plan request
        return (
          isTruthy(user.requestedPlan) ||
          isTruthy(user.planRequest) ||
          isTruthy(user.hasPlanRequest)
        );
      });

      // Always include our specific user if it's not already in the filtered list
      if (
        specificUser &&
        !data.data.users.some((u) => (u.id || u._id) === specificUserId)
      ) {
        console.log('Adding target user to filtered results');
        data.data.users.push(specificUser);
      }

      if (data.data.pagination) {
        data.data.pagination.total = data.data.users.length;
      }
    }

    return data;
  },

  // Get a single user by ID
  getById: async (id) => {
    const endpoint = `/api/admin/users/${id}`;

    try {
      // Special debug for our specific user
      if (id === '685f9ce079bfa07558bf3eb7') {
        console.log('Attempting to fetch our specific user ID');
      }

      const response = await fetchWithAuth(endpoint);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Failed to fetch user with ID ${id}`);
      }

      const data = await response.json();
      console.log('User details API response:', data);

      if (id === '685f9ce079bfa07558bf3eb7' && data.success) {
        console.log('Our specific user data:', {
          id: data.data.id || data.data._id,
          requestedPlan: data.data.requestedPlan,
          planRequest: data.data.planRequest,
          hasPlanRequest: data.data.hasPlanRequest,
          assignedPlan: data.data.assignedPlan,
        });
      }

      return data;
    } catch (error) {
      console.error(`Error fetching user ${id}:`, error);
      throw error;
    }
  },

  // Assign an action plan to a user
  assignPlan: async (userId, planData) => {
    try {
      const endpoint = `/api/admin/users/${userId}/assign-plan`;

      console.log('Calling assign-plan API with data:', planData);
      const response = await fetchWithAuth(endpoint, {
        method: 'POST',
        body: JSON.stringify(planData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.message || `Failed to assign plan to user ${userId}`
        );
      }

      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error(`Error assigning plan to user ${userId}:`, error);
      return {
        success: false,
        message: error.message || 'Failed to assign action plan',
      };
    }
  },
};

// AI Prediction API - Doesn't require authentication
export const aiAPI = {
  customPredict: async (userData) => {
    try {
      console.log('Calling AI predict API with data:', userData);
      const response = await fetch(`${API_URL}/api/ai/predict/custom`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('Error making AI prediction:', error);
      return {
        success: false,
        message: error.message || 'Failed to get AI prediction',
      };
    }
  },
};

// Create the API object
const api = {
  auth: authAPI,
  demandes: demandesAPI,
  profiles: profilesAPI,
  actionPlans: actionPlansAPI,
  users: usersAPI,
  ai: aiAPI,
};

export default api;
