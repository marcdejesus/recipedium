import React, { useState, useEffect } from 'react';
import apiClient, { apiRequest } from '@/lib/api/client';
import RecipeCard from './recipe-card';
import { ChevronLeft, ChevronRight, Filter, Search, RefreshCw, PlusCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth/auth-context';

const RecipeList = () => {
  const { user } = useAuth();
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
    'Appetizer', 'Salad', 'Soup', 'Snack', 'Side'
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
    fetchRecipes();
  }, [page, filters]);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Clean up filters before sending to API
      const apiFilters = { ...filters };
      if (apiFilters.category === 'All') apiFilters.category = '';
      if (apiFilters.diet === 'All') apiFilters.diet = '';
      
      // Sorting
      let sortQuery = '';
      if (apiFilters.sort === 'newest') sortQuery = '-createdAt';
      else if (apiFilters.sort === 'oldest') sortQuery = 'createdAt';
      else if (apiFilters.sort === 'most-liked') sortQuery = '-likesCount';
      else if (apiFilters.sort === 'most-commented') sortQuery = '-commentsCount';
      
      console.log('Fetching recipes with sort:', sortQuery);
      console.log('Filters:', apiFilters);
      
      // Make the API call with custom parameters
      let response;
      
      if (apiFilters.search || apiFilters.category || apiFilters.diet) {
        // If we have filters, use a direct API request to include all parameters
        let url = `/recipes?page=${page}&limit=9&sort=${sortQuery}`;
        
        if (apiFilters.category) url += `&category=${apiFilters.category}`;
        if (apiFilters.diet) url += `&diet=${apiFilters.diet}`;
        if (apiFilters.search) url += `&search=${encodeURIComponent(apiFilters.search)}`;
        
        console.log('Fetching recipes with URL:', url);
        response = await apiRequest(url, {
          credentials: 'omit' // Explicitly omit credentials to fix CORS issues
        });
      } else {
        // If no filters, use the getAll method which is simpler
        response = await apiClient.recipes.getAll(page, 9, sortQuery);
      }
      
      if (response && response.recipes) {
        setRecipes(response.recipes);
        // Calculate total pages
        const total = response.pagination ? 
          Math.ceil(response.count / 9) : 
          Math.ceil(response.recipes.length / 9);
        setTotalPages(total || 1);
      } else {
        setRecipes([]);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Error fetching recipes:', err);
      setError('Failed to load recipes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFilterChange = (name, value) => {
    setFilters({
      ...filters,
      [name]: value
    });
    setPage(1); // Reset to first page when filters change
  };

  const handleSearchChange = (e) => {
    setFilters({
      ...filters,
      search: e.target.value
    });
  };

  const handleLikeRecipe = async (recipeId) => {
    try {
      if (!user) {
        // Redirect to login or show message
        return;
      }
      
      const recipe = recipes.find(r => r._id === recipeId);
      if (!recipe) return;
      
      const isLiked = recipe.likes?.some(like => like.user === user._id);
      
      if (isLiked) {
        await apiClient.recipes.unlikeRecipe(recipeId);
      } else {
        await apiClient.recipes.likeRecipe(recipeId);
      }
      
      // Refresh recipes to show updated likes
      fetchRecipes();
    } catch (err) {
      console.error('Error liking recipe:', err);
    }
  };

  return (
    <div>
      {/* Filters */}
      <div className="mb-6 rounded-lg border bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          <div className="flex-1 space-y-1">
            <Label htmlFor="search">Search</Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input 
                id="search"
                placeholder="Search recipes..." 
                className="pl-8"
                value={filters.search}
                onChange={handleSearchChange}
              />
            </div>
          </div>
          
          <div className="w-full space-y-1 md:w-40">
            <Label htmlFor="category">Category</Label>
            <Select 
              value={filters.category} 
              onValueChange={(value) => handleFilterChange('category', value)}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category.toLowerCase()}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-full space-y-1 md:w-40">
            <Label htmlFor="diet">Diet</Label>
            <Select 
              value={filters.diet} 
              onValueChange={(value) => handleFilterChange('diet', value)}
            >
              <SelectTrigger id="diet">
                <SelectValue placeholder="All Diets" />
              </SelectTrigger>
              <SelectContent>
                {diets.map((diet) => (
                  <SelectItem key={diet} value={diet.toLowerCase()}>
                    {diet}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-full space-y-1 md:w-40">
            <Label htmlFor="sort">Sort By</Label>
            <Select 
              value={filters.sort} 
              onValueChange={(value) => handleFilterChange('sort', value)}
            >
              <SelectTrigger id="sort">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="h-10" 
              onClick={() => fetchRecipes()} 
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            {user && (
              <Button
                className="h-10 bg-amber-500 hover:bg-amber-600"
                onClick={() => window.location.href = '/recipes/create'}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                New Recipe
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
          {error}
        </div>
      )}
      
      {/* Recipe Grid */}
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="aspect-[4/5] animate-pulse rounded-lg bg-gray-200"></div>
          ))}
        </div>
      ) : recipes.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {recipes.map((recipe) => (
            <RecipeCard 
              key={recipe._id} 
              recipe={recipe} 
              onLike={handleLikeRecipe} 
            />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border bg-white p-8 text-center">
          <h3 className="text-lg font-medium">No recipes found</h3>
          <p className="mt-2 text-gray-500">Try adjusting your search or filters.</p>
        </div>
      )}
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1 || loading}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="text-sm">
            Page {page} of {totalPages}
          </div>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages || loading}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default RecipeList; 