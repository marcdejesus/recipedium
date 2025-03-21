import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/lib/auth/auth-context';
import apiClient from '@/lib/api/client';
import RecipeCard from '@/components/home/recipe-card';
import { ChevronLeft, ChevronRight, Filter, Search, RefreshCw, Heart } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export default function FavoritesPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
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

  // Log auth state changes
  useEffect(() => {
    console.log('Favorites page - Auth state:', { user, isAuthenticated, authLoading });
  }, [user, isAuthenticated, authLoading]);

  // Redirect if not authenticated - only after auth state has loaded
  useEffect(() => {
    if (!authLoading && (!user || !user._id)) {
      console.log('Not authenticated, redirecting to login');
      router.push('/login?redirect=favorites');
    }
  }, [user, authLoading, router]);

  // Fetch liked recipes when page or filters change - only if authenticated
  useEffect(() => {
    if (authLoading) return; // Wait for auth to load
    
    // Check if user exists instead of relying on isAuthenticated flag
    if (!user || !user._id) return; // Don't fetch if not authenticated
    
    console.log('Fetching liked recipes - user is authenticated with ID:', user._id);
    
    let isMounted = true; // Track if component is mounted
    
    const fetchData = async () => {
      try {
        // Only set states if component is still mounted
        if (isMounted) setLoading(true);
        
        const response = await apiClient.recipes.getLikedRecipes({
          page,
          limit: 9,
          sort: filters.sort === 'newest' ? '-createdAt' : 
                filters.sort === 'oldest' ? 'createdAt' : 
                filters.sort === 'most-liked' ? '-likesCount' : 
                filters.sort === 'most-commented' ? '-commentsCount' : '-createdAt',
          category: filters.category === 'All' ? '' : filters.category,
          diet: filters.diet === 'All' ? '' : filters.diet,
          search: filters.search
        });
        
        // Only update state if component is still mounted
        if (!isMounted) return;
        
        console.log('Liked recipes response:', response);
        
        if (response && response.recipes) {
          setRecipes(response.recipes);
          const total = response.pagination ? 
            Math.ceil(response.count / 9) : 
            Math.ceil(response.recipes.length / 9);
          setTotalPages(total || 1);
        } else {
          setRecipes([]);
          setTotalPages(1);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching liked recipes:', err);
          setError(`Failed to load your favorite recipes: ${err.message}`);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    fetchData();
    
    // Cleanup function to handle unmounting during data fetch
    return () => {
      isMounted = false;
    };
    
  }, [page, filters, user, authLoading]);

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
        router.push('/login');
        return;
      }
      
      const recipe = recipes.find(r => r._id === recipeId);
      if (!recipe) return;
      
      // Check if user has already liked this recipe
      const isLiked = recipe.likes?.some(like => like.user === user._id);
      
      setLoading(true);
      
      if (isLiked) {
        await apiClient.recipes.unlikeRecipe(recipeId);
        
        // Immediately update UI by removing the recipe from the list
        setRecipes(prevRecipes => prevRecipes.filter(r => r._id !== recipeId));
      } else {
        await apiClient.recipes.likeRecipe(recipeId);
      }
      
      // Refresh the entire list to ensure it's up to date
      const response = await apiClient.recipes.getLikedRecipes({
        page,
        limit: 9,
        sort: filters.sort === 'newest' ? '-createdAt' : 
              filters.sort === 'oldest' ? 'createdAt' : 
              filters.sort === 'most-liked' ? '-likesCount' : 
              filters.sort === 'most-commented' ? '-commentsCount' : '-createdAt',
        category: filters.category === 'All' ? '' : filters.category,
        diet: filters.diet === 'All' ? '' : filters.diet,
        search: filters.search
      });
      
      if (response && response.recipes) {
        setRecipes(response.recipes);
        const total = response.pagination ? 
          Math.ceil(response.count / 9) : 
          Math.ceil(response.recipes.length / 9);
        setTotalPages(total || 1);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error liking/unliking recipe:', err);
      setError('Failed to update like status. Please try again.');
      setLoading(false);
    }
  };

  // Show loading indicator while authentication state is loading
  if (authLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
          <span className="ml-2">Loading authentication...</span>
        </div>
      </div>
    );
  }

  // If fully loaded and no user, show a message instead of redirecting immediately
  if (!authLoading && (!user || !user._id)) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <h3 className="text-xl font-semibold">Please log in to view your favorites</h3>
          <Button 
            onClick={() => router.push('/login')}
            className="mt-6 bg-amber-500 hover:bg-amber-600"
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Favorite Recipes</h1>
        <p className="text-gray-600 mt-2">Recipes you've liked and saved for later</p>
      </div>
      
      {/* Filters */}
      <div className="mb-6 rounded-lg border bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          <div className="flex-1 space-y-1">
            <Label htmlFor="search">Search</Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input 
                id="search"
                placeholder="Search favorites..." 
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
          
          <div>
            <Button 
              variant="outline" 
              onClick={() => fetchLikedRecipes()} 
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
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
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
        </div>
      ) : (
        recipes.length === 0 ? (
          // No favorites found
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Heart className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold">No favorites yet</h3>
            <p className="text-gray-500 mt-2 max-w-md">
              You haven't liked any recipes yet. Browse recipes and click the heart icon to add them to your favorites.
            </p>
            <Button 
              onClick={() => router.push('/')}
              className="mt-6 bg-amber-500 hover:bg-amber-600"
            >
              Browse Recipes
            </Button>
          </div>
        ) : (
          // Recipe grid
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe._id}
                recipe={recipe}
                onLike={handleLikeRecipe}
              />
            ))}
          </div>
        )
      )}
      
      {/* Pagination */}
      {recipes.length > 0 && totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <span className="text-sm">
              Page {page} of {totalPages}
            </span>
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 