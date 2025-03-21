/**
 * API client for interacting with the backend services
 */

// API base URL (use environment variable in production)
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

/**
 * Generic API request function
 * 
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} - Response data
 */
const apiRequest = async (endpoint, options = {}) => {
  try {
    // Default headers
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    // Get auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      headers.Authorization = `Bearer ${token}`;
      console.log(`Adding auth token to request for ${endpoint}`);
    } else {
      console.log(`No auth token available for request to ${endpoint}`);
    }

    // Prepare fetch options
    const fetchOptions = {
      ...options,
      headers
    };

    // Make the request
    const response = await fetch(`${API_URL}${endpoint}`, fetchOptions);
    
    // Log response status for debugging
    console.log(`API call to ${endpoint}: ${response.status} ${response.statusText}`);
    
    // Check if the response is ok
    if (!response.ok) {
      // Try to parse error details if available
      let errorDetail = '';
      try {
        const errorData = await response.json();
        errorDetail = errorData.msg || errorData.message || JSON.stringify(errorData);
      } catch (e) {
        // If error response cannot be parsed, use status text
        errorDetail = response.statusText;
      }
      
      throw new Error(`${response.status} ${errorDetail}`);
    }

    // Parse response
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API request error:', error);
    // Enhance error message with more details
    throw new Error(error.message || 'An error occurred while making the request');
  }
};

/**
 * API client with methods for different endpoints
 */
const apiClient = {
  // Authentication
  auth: {
    /**
     * Register a new user
     * 
     * @param {Object} userData - User registration data
     * @returns {Promise<Object>} - Registration response with token
     */
    register: (userData) => apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

    /**
     * Login a user
     * 
     * @param {Object} credentials - User login credentials
     * @returns {Promise<Object>} - Login response with token
     */
    login: (credentials) => apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }).then(response => {
      // Log successful login response for debugging
      console.log('Login API response:', response);
      return response;
    }),

    /**
     * Get the current user profile
     * 
     * @returns {Promise<Object>} - Current user data
     */
    getCurrentUser: () => apiRequest('/auth/me', {
      method: 'GET',
    }).then(response => {
      // Log successful response for debugging
      console.log('getCurrentUser response:', response);
      return response;
    }),

    /**
     * Get user profile
     * 
     * @param {string} userId - User ID
     * @returns {Promise<Object>} - User profile data
     */
    getUserProfile: (userId) => apiRequest(`/users/${userId}`, {
      method: 'GET',
    }),
  },

  // Users
  users: {
    /**
     * Get user profile by ID
     * 
     * @param {string} userId - User ID
     * @returns {Promise<Object>} - User profile data
     */
    getUserProfile: (userId) => apiRequest(`/users/${userId}`, {
      method: 'GET',
    }),

    /**
     * Update user profile
     * 
     * @param {string} userId - User ID
     * @param {Object} profileData - Updated profile data
     * @returns {Promise<Object>} - Updated user profile
     */
    updateUserProfile: (userId, profileData) => apiRequest(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    }),

    /**
     * Update user password
     * 
     * @param {string} userId - User ID
     * @param {Object} passwordData - Password data
     * @returns {Promise<Object>} - Updated user info
     */
    updateUserPassword: (userId, passwordData) => apiRequest(`/users/${userId}/password`, {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    }),

    /**
     * Delete user account
     * 
     * @param {string} userId - User ID
     * @returns {Promise<Object>} - Deletion response
     */
    deleteUserAccount: (userId) => apiRequest(`/users/${userId}`, {
      method: 'DELETE',
    }),
  },

  // Recipes
  recipes: {
    /**
     * Get all recipes with filters and sorting
     * 
     * @param {Object} params - Query parameters for filtering and sorting
     * @returns {Promise<Object>} - List of recipes with pagination
     */
    getRecipes: (params = {}) => {
      // Convert params object to query string
      const queryString = Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&');
      
      return apiRequest(`/recipes${queryString ? `?${queryString}` : ''}`);
    },

    /**
     * Get a single recipe by ID
     * 
     * @param {string} id - Recipe ID
     * @returns {Promise<Object>} - Recipe data
     */
    getRecipe: (id) => apiRequest(`/recipes/${id}`),

    /**
     * Create a new recipe
     * 
     * @param {Object} recipeData - Recipe data
     * @returns {Promise<Object>} - Created recipe
     */
    createRecipe: (recipeData) => apiRequest('/recipes', {
      method: 'POST',
      body: JSON.stringify(recipeData),
    }),

    /**
     * Update a recipe
     * 
     * @param {string} id - Recipe ID
     * @param {Object} recipeData - Updated recipe data
     * @returns {Promise<Object>} - Updated recipe
     */
    updateRecipe: (id, recipeData) => apiRequest(`/recipes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(recipeData),
    }),

    /**
     * Delete a recipe
     * 
     * @param {string} id - Recipe ID
     * @returns {Promise<Object>} - Deletion response
     */
    deleteRecipe: (id) => apiRequest(`/recipes/${id}`, {
      method: 'DELETE',
    }),

    /**
     * Like a recipe
     * 
     * @param {string} id - Recipe ID
     * @returns {Promise<Object>} - Updated likes
     */
    likeRecipe: (id) => apiRequest(`/recipes/${id}/like`, {
      method: 'POST',
    }).then(response => {
      console.log('Like recipe response:', response);
      return response;
    }),

    /**
     * Unlike a recipe
     * 
     * @param {string} id - Recipe ID
     * @returns {Promise<Object>} - Updated likes
     */
    unlikeRecipe: (id) => apiRequest(`/recipes/${id}/like`, {
      method: 'DELETE',
    }).then(response => {
      console.log('Unlike recipe response:', response);
      return response;
    }),

    /**
     * Add a comment to a recipe
     * 
     * @param {string} id - Recipe ID
     * @param {Object} commentData - Comment data
     * @returns {Promise<Object>} - Updated comments
     */
    addComment: (id, commentData) => apiRequest(`/recipes/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify(commentData),
    }).then(response => {
      console.log('Add comment response:', response);
      return response;
    }),

    /**
     * Delete a comment from a recipe
     * 
     * @param {string} recipeId - Recipe ID
     * @param {string} commentId - Comment ID
     * @returns {Promise<Object>} - Updated comments
     */
    deleteComment: (recipeId, commentId) => apiRequest(`/recipes/${recipeId}/comments/${commentId}`, {
      method: 'DELETE',
    }),

    /**
     * Get recipes by user ID
     * 
     * @param {string} userId - User ID
     * @param {Object} params - Pagination parameters
     * @returns {Promise<Object>} - User's recipes
     */
    getUserRecipes: (userId, params = {}) => {
      // Convert params object to query string
      const queryString = Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&');
      
      return apiRequest(`/recipes/user/${userId}${queryString ? `?${queryString}` : ''}`)
        .then(response => {
          console.log('getUserRecipes complete response:', response);
          return response;
        })
        .catch(error => {
          console.error('Error fetching user recipes:', error);
          // Return a structured error response
          return {
            success: false,
            data: [],
            total: 0,
            error: error.message
          };
        });
    },
    
    /**
     * Get recipes liked by the current user
     * 
     * @param {Object} params - Pagination parameters
     * @returns {Promise<Object>} - Liked recipes
     */
    getLikedRecipes: (params = {}) => {
      // Convert params object to query string
      const queryString = Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&');
      
      console.log('getLikedRecipes queryString:', queryString);  
      
      return apiRequest(`/recipes/liked${queryString ? `?${queryString}` : ''}`)
        .then(response => {
          console.log('getLikedRecipes complete response:', response);
          
          // The backend might not return data in the expected format
          // Make sure we return a consistently structured response
          if (!response.recipes && Array.isArray(response)) {
            // If it's just an array, format it properly
            return {
              recipes: response,
              count: response.length,
              pagination: {
                page: parseInt(params.page) || 1,
                pages: Math.ceil(response.length / (parseInt(params.limit) || 10))
              }
            };
          }
          
          return response;
        })
        .catch(error => {
          console.error('Error in getLikedRecipes:', error);
          // Return an empty result structure instead of throwing
          return {
            recipes: [],
            count: 0,
            pagination: {
              page: 1,
              pages: 0
            },
            error: error.message
          };
        });
    },
  },

  // Admin
  admin: {
    /**
     * Get all users with pagination
     * 
     * @param {Object} params - Query parameters for pagination and search
     * @returns {Promise<Object>} - List of users with pagination
     */
    getUsers: (params = {}) => {
      // Convert params object to query string
      const queryString = Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&');
      
      return apiRequest(`/admin/users${queryString ? `?${queryString}` : ''}`);
    },

    /**
     * Promote a user to admin
     * 
     * @param {string} userId - User ID
     * @returns {Promise<Object>} - Updated user data
     */
    promoteUser: (userId) => apiRequest(`/admin/users/${userId}/promote`, {
      method: 'PUT'
    }),

    /**
     * Demote an admin to regular user
     * 
     * @param {string} userId - User ID
     * @returns {Promise<Object>} - Updated user data
     */
    demoteUser: (userId) => apiRequest(`/admin/users/${userId}/demote`, {
      method: 'PUT'
    }),

    /**
     * Ban a user
     * 
     * @param {string} userId - User ID
     * @returns {Promise<Object>} - Updated user data
     */
    banUser: (userId) => apiRequest(`/admin/users/${userId}/ban`, {
      method: 'PUT'
    }),

    /**
     * Get application analytics data
     * 
     * @returns {Promise<Object>} - Analytics data
     */
    getAnalytics: () => apiRequest('/admin/analytics'),

    /**
     * Get reported recipes
     * 
     * @param {Object} params - Query parameters for pagination
     * @returns {Promise<Object>} - List of reported recipes
     */
    getReportedRecipes: (params = {}) => {
      // Convert params object to query string
      const queryString = Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&');
      
      return apiRequest(`/admin/reported-recipes${queryString ? `?${queryString}` : ''}`);
    },

    /**
     * Approve a reported recipe
     * 
     * @param {string} reportId - Report ID
     * @returns {Promise<Object>} - Updated report data
     */
    approveReport: (reportId) => apiRequest(`/admin/reported-recipes/${reportId}/approve`, {
      method: 'PUT'
    }),

    /**
     * Reject a reported recipe
     * 
     * @param {string} reportId - Report ID
     * @returns {Promise<Object>} - Updated report data
     */
    rejectReport: (reportId) => apiRequest(`/admin/reported-recipes/${reportId}/reject`, {
      method: 'PUT'
    })
  },

  // Top Recipes
  topRecipes: {
    /**
     * Get top recipes sorted by likes
     * 
     * @param {number} limit - Number of recipes to return
     * @returns {Promise<Object>} - Top recipes by likes
     */
    getTopByLikes: (limit = 3) => apiRequest(`/recipes?sort=-likes&limit=${limit}`),
  }
};

export default apiClient; 