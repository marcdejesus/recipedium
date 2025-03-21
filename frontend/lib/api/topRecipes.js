/**
 * API client for recipe-related endpoints
 */
import apiRequest from './client';

/**
 * Get top recipes by likes
 * 
 * @param {number} limit - Number of recipes to return
 * @returns {Promise<Array>} - Array of top recipes
 */
const getTopByLikes = async (limit = 3) => {
  console.log(`Fetching top ${limit} recipes by likes`);
  return apiRequest(`/recipes?sort=-likes&limit=${limit}`);
};

/**
 * Get top recipes by recent date
 * 
 * @param {number} limit - Number of recipes to return
 * @returns {Promise<Array>} - Array of recent recipes
 */
const getTopByRecent = async (limit = 3) => {
  return apiRequest(`/recipes?sort=-createdAt&limit=${limit}`);
};

/**
 * Get featured recipes 
 * 
 * @param {number} limit - Number of recipes to return
 * @returns {Promise<Array>} - Array of featured recipes
 */
const getFeatured = async (limit = 3) => {
  return apiRequest(`/recipes?featured=true&limit=${limit}`);
};

export default {
  getTopByLikes,
  getTopByRecent,
  getFeatured
}; 