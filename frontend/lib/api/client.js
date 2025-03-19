/**
 * API client for interacting with the backend services
 */

// API base URL (use environment variable in production)
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

/**
 * Handles API requests with appropriate headers and error handling
 * 
 * @param {string} endpoint - The API endpoint to call
 * @param {Object} options - Fetch options (method, body, etc.)
 * @returns {Promise<any>} - The API response
 */
const apiRequest = async (endpoint, options = {}) => {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('authToken') : null;
  
  // Set default headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Check if response can be parsed as JSON
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = { message: 'Server returned non-JSON response' };
    }

    // Handle API errors
    if (!response.ok) {
      throw new Error(data.message || data.msg || 'An error occurred while making the request');
    }

    return data;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
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
    }),

    /**
     * Unlike a recipe
     * 
     * @param {string} id - Recipe ID
     * @returns {Promise<Object>} - Updated likes
     */
    unlikeRecipe: (id) => apiRequest(`/recipes/${id}/like`, {
      method: 'DELETE',
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
      
      return apiRequest(`/recipes/user/${userId}${queryString ? `?${queryString}` : ''}`);
    },
  },
};

export default apiClient; 