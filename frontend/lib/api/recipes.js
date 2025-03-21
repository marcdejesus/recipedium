import { apiRequest } from './client';

export const getTopRecipes = async (limit = 3) => {
  try {
    console.log(`Fetching top ${limit} recipes by likes`);
    return await apiRequest(`/recipes?sort=-likes&limit=${limit}`);
  } catch (error) {
    console.error('Error fetching top recipes:', error);
    throw error;
  }
}; 