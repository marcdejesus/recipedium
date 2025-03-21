/**
 * API client for interacting with the backend services
 */

// API base URL (use environment variable in production)
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://recipediumapi.netlify.app';

// Remove any trailing slash to prevent double slashes
const getBaseUrl = () => {
  const baseUrl = API_URL;
  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
};

console.log('API URL:', API_URL); // For debugging

/**
 * Fetch with timeout to prevent long waiting times
 * 
 * @param {string} url - URL to fetch
 * @param {Object} options - Fetch options
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<Response>} - Fetch response
 */
const fetchWithTimeout = async (url, options, timeout = 10000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

/**
 * Retry a function multiple times
 * 
 * @param {Function} fn - Function to retry
 * @param {number} retries - Number of retries
 * @param {number} delay - Delay between retries in milliseconds
 * @returns {Promise<any>} - Result of the function
 */
const retry = async (fn, retries = 3, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 1) throw error;
    await new Promise(resolve => setTimeout(resolve, delay));
    console.log(`Retrying request... (${retries - 1} attempts left)`);
    return retry(fn, retries - 1, delay);
  }
};

/**
 * Generic API request function
 * 
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} - Response data
 */
export const apiRequest = async (endpoint, options = {}) => {
  try {
    // Ensure endpoint starts with a slash if needed
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    
    // Get base URL without trailing slash
    const baseUrl = getBaseUrl();
    
    // Add /api prefix to the endpoint path
    const apiPath = `/api${normalizedEndpoint}`;
    
    // Build the full URL
    const url = `${baseUrl}${apiPath}`;
    
    // Default headers
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    // Get auth token if available
    let token;
    try {
      token = localStorage.getItem('authToken');
    } catch (e) {
      console.log('Unable to access localStorage');
    }
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
      console.log(`Adding auth token to request for ${endpoint}`);
    } else {
      console.log(`No auth token available for request to ${endpoint}`);
    }

    // Prepare fetch options - Removing credentials: 'include' by default
    const fetchOptions = {
      ...options,
      headers
    };

    // Log the request details for debugging
    console.log(`Making request to: ${url}`, fetchOptions);

    // Make the request with retry and timeout
    const response = await retry(() => 
      fetchWithTimeout(url, fetchOptions, 15000)
    );
    
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

    // Parse response - handle possible HTML responses
    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        return data;
      } else {
        // If not JSON, try to get text and log a warning
        const text = await response.text();
        console.warn('Response was not JSON format. Content type:', contentType);
        // Try to extract useful information from HTML if possible
        return { success: false, message: 'Invalid response format', status: response.status };
      }
    } catch (error) {
      console.error('Error parsing response:', error);
      throw new Error('Failed to parse response');
    }
  } catch (error) {
    console.error('API request error:', error);
    // Enhance error message with more details
    throw new Error(error.message || 'An error occurred while making the request');
  }
};

// Import modules only after exporting apiRequest
// This prevents circular dependencies
const topRecipesModule = () => import('./topRecipes').then(mod => mod.default);

// Define basic recipes operations
const recipes = {
  getAll: (page = 1, limit = 10, sort = '-createdAt') => 
    apiRequest(`/recipes?page=${page}&limit=${limit}&sort=${sort}`, {
      credentials: 'omit' // Explicitly omit credentials to fix CORS issues
    }),
  
  // Add getRecipes as an alias for getAll for compatibility
  getRecipes: (page = 1, limit = 10, sort = '-createdAt') => 
    apiRequest(`/recipes?page=${page}&limit=${limit}&sort=${sort}`, {
      credentials: 'omit' // Explicitly omit credentials to fix CORS issues
    }),
  
  getById: (id) => apiRequest(`/recipes/${id}`, {
    credentials: 'omit' // Explicitly omit credentials to fix CORS issues
  }),
  
  create: (data) => apiRequest('/recipes', {
    method: 'POST',
    body: JSON.stringify(data),
    credentials: 'omit' // Explicitly omit credentials to fix CORS issues
  }),
  
  update: (id, data) => apiRequest(`/recipes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
    credentials: 'omit' // Explicitly omit credentials to fix CORS issues
  }),
  
  delete: (id) => apiRequest(`/recipes/${id}`, {
    method: 'DELETE',
    credentials: 'omit' // Explicitly omit credentials to fix CORS issues
  }),
  
  search: (query, page = 1, limit = 10) => 
    apiRequest(`/recipes/search?q=${query}&page=${page}&limit=${limit}`, {
      credentials: 'omit' // Explicitly omit credentials to fix CORS issues
    })
};

// Define basic auth operations
const auth = {
  login: (credentials) => apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
    credentials: 'omit' // Explicitly omit credentials to prevent CORS issues
  }),
  
  signup: (userData) => apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
    credentials: 'omit' // Explicitly omit credentials to prevent CORS issues
  }),

  // Alias register to signup for compatibility
  register: (userData) => apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
    credentials: 'omit' // Explicitly omit credentials to prevent CORS issues
  }),
  
  verifyToken: () => apiRequest('/auth/me', {
    credentials: 'omit' // Explicitly omit credentials to prevent CORS issues
  }),
  
  logout: () => {
    localStorage.removeItem('authToken');
    return Promise.resolve();
  }
};

// Define basic user operations
const users = {
  getProfile: (userId) => apiRequest(`/users/${userId}`, {
    credentials: 'omit' // Explicitly omit credentials to fix CORS issues
  }),
  
  updateProfile: (userId, data) => apiRequest(`/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
    credentials: 'omit' // Explicitly omit credentials to fix CORS issues
  }),
  
  getFavorites: (userId) => apiRequest(`/users/${userId}/favorites`, {
    credentials: 'omit' // Explicitly omit credentials to fix CORS issues
  }),
  
  addFavorite: (userId, recipeId) => apiRequest(`/users/${userId}/favorites`, {
    method: 'POST',
    body: JSON.stringify({ recipeId }),
    credentials: 'omit' // Explicitly omit credentials to fix CORS issues
  }),
  
  removeFavorite: (userId, recipeId) => apiRequest(`/users/${userId}/favorites/${recipeId}`, {
    method: 'DELETE',
    credentials: 'omit' // Explicitly omit credentials to fix CORS issues
  })
};

// Define topRecipes directly in client.js to avoid circular dependencies
const topRecipes = {
  getTopByLikes: async (limit = 3) => {
    console.log(`Fetching top ${limit} recipes by likes`);
    return apiRequest(`/recipes?sort=-likes&limit=${limit}`, {
      credentials: 'omit' // Explicitly omit credentials to fix CORS issues
    });
  },
  
  getTopByRecent: async (limit = 3) => {
    return apiRequest(`/recipes?sort=-createdAt&limit=${limit}`, {
      credentials: 'omit' // Explicitly omit credentials to fix CORS issues
    });
  },
  
  getFeatured: async (limit = 3) => {
    return apiRequest(`/recipes?featured=true&limit=${limit}`, {
      credentials: 'omit' // Explicitly omit credentials to fix CORS issues
    });
  }
};

// Export the API client
const apiClient = {
  recipes,
  auth,
  users,
  topRecipes
};

export default apiClient; 