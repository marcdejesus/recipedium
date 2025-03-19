import React, { useState, useEffect } from 'react';
import apiClient from '@/lib/api/client';
import RecipeCard from './recipe-card';
import { ChevronLeft, ChevronRight, Filter, Search } from 'lucide-react';

const RecipeList = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    sort: 'newest',
    category: '',
    diet: '',
    search: '',
  });

  // Categories and diets for filtering
  const categories = [
    'All', 'Breakfast', 'Lunch', 'Dinner', 'Dessert', 
    'Appetizer', 'Salad', 'Soup', 'Snack', 'Beverage'
  ];
  
  const diets = [
    'All', 'Vegetarian', 'Vegan', 'Gluten-Free', 
    'Dairy-Free', 'Keto', 'Paleo', 'Low-Carb'
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'most-liked', label: 'Most Liked' },
    { value: 'most-commented', label: 'Most Commented' },
  ];

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Clean up filters before sending to API
        const apiFilters = { ...filters };
        if (apiFilters.category === 'All') apiFilters.category = '';
        if (apiFilters.diet === 'All') apiFilters.diet = '';
        
        const response = await apiClient.recipes.getRecipes({
          ...apiFilters,
          page,
          limit: 9,
        });
        
        console.log('API Response:', response); // Debug log
        
        // Check the structure of the response and update accordingly
        if (Array.isArray(response)) {
          // If response is directly an array of recipes
          setRecipes(response);
          setTotalPages(Math.ceil(response.length / 9));
        } else if (response.data && Array.isArray(response.data)) {
          // If response has data property with recipes array
          setRecipes(response.data);
          setTotalPages(Math.ceil((response.total || response.data.length) / 9));
        } else if (response.recipes && Array.isArray(response.recipes)) {
          // If response has recipes property with recipes array (matches the backend structure)
          setRecipes(response.recipes);
          setTotalPages(Math.ceil((response.total || response.count || response.recipes.length) / 9));
        } else {
          // Fallback for other response structures
          console.error('Unexpected response structure:', response);
          setRecipes([]);
          setTotalPages(1);
          setError('Unexpected API response format. Please try again later.');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching recipes:', err);
        setError('Failed to load recipes. Please try again later.');
        setRecipes([]); // Ensure recipes is at least an empty array
        setTotalPages(1);
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [page, filters]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    window.scrollTo(0, 0);
  };

  const handleFilterChange = (type, value) => {
    setFilters(prev => ({ ...prev, [type]: value }));
    setPage(1);
  };

  const handleSearchChange = (e) => {
    const { value } = e.target;
    setFilters(prev => ({ ...prev, search: value }));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
  };

  if (loading && page === 1) {
    return (
      <div className="w-full py-12 text-center">
        <div className="w-16 h-16 border-4 border-t-blue-500 border-b-blue-700 border-gray-200 rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading recipes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full py-12 text-center">
        <p className="text-red-500">{error}</p>
        <button 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-8 bg-white rounded-lg shadow-md p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="w-full md:w-1/3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search recipes..."
                value={filters.search}
                onChange={handleSearchChange}
                className="w-full px-4 py-2 pr-10 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button type="submit" className="absolute right-2 top-1/2 transform -translate-y-1/2">
                <Search className="h-5 w-5 text-gray-400" />
              </button>
            </div>
          </form>
          
          <div className="flex flex-wrap gap-2 items-center">
            {/* Sort Dropdown */}
            <div className="w-full sm:w-auto">
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Category Filter */}
            <div className="w-full sm:w-auto">
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {categories.slice(1).map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Diet Filter */}
            <div className="w-full sm:w-auto">
              <select
                value={filters.diet}
                onChange={(e) => handleFilterChange('diet', e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Diets</option>
                {diets.slice(1).map(diet => (
                  <option key={diet} value={diet}>
                    {diet}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {(!recipes || recipes.length === 0) ? (
        <div className="text-center py-12">
          <p className="text-lg text-gray-600">No recipes found</p>
          <p className="text-sm text-gray-500 mt-2">Try adjusting your filters or search terms</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map(recipe => (
              <RecipeCard key={recipe._id} recipe={recipe} />
            ))}
          </div>
          
          {/* Pagination */}
          <div className="mt-8 flex justify-center">
            <div className="flex items-center space-x-2">
              <button
                disabled={page === 1}
                onClick={() => handlePageChange(page - 1)}
                className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                // Ensure we show the current page in the middle when possible
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-10 h-10 rounded-md ${
                      pageNum === page 
                        ? 'bg-blue-500 text-white' 
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                disabled={page === totalPages}
                onClick={() => handlePageChange(page + 1)}
                className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RecipeList; 