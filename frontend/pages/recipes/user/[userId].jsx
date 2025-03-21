import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowLeft, User, ChefHat, Calendar, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import RecipeCard from '@/components/home/recipe-card';
import { useAuth } from '@/lib/auth/auth-context';
import { formatDate } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import apiClient from '@/lib/api/client';

export default function UserRecipes() {
  const router = useRouter();
  const { userId } = router.query;
  const { user: currentUser, isAuthenticated } = useAuth();
  
  // States
  const [user, setUser] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalRecipes, setTotalRecipes] = useState(0);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 9; // recipes per page
  
  // Fetch user data and recipes
  useEffect(() => {
    if (!userId) return;
    
    const fetchUserAndRecipes = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get the recipes and user data
        const response = await apiClient.recipes.getUserRecipes(userId, { page, limit });
        console.log('User recipes response:', response);
        
        // Check if the response has userData from the updated API
        if (response.userData) {
          console.log('User data from API userData field:', response.userData);
          setUser(response.userData);
        } else if (response.success && response.data && response.data.length > 0) {
          // Fallback: Extract user info from the first recipe
          const userData = response.data[0].user;
          console.log('User data extracted from recipe:', userData);
          setUser(userData);
        } else if (page === 1) {
          // If no recipes and no userData, make a separate call to get user info
          try {
            const userData = await apiClient.users.getUserProfile(userId);
            console.log('User profile data from direct API call:', userData);
            if (userData && (userData.user || userData)) {
              const userObj = userData.user || userData;
              console.log('Setting user data to:', userObj);
              setUser(userObj);
            } else {
              console.error('Failed to get valid user data');
              setError('Unable to load user profile');
            }
          } catch (profileErr) {
            console.error('Error fetching user profile:', profileErr);
            setError('User not found or has no recipes.');
          }
        } else {
          // If we're on a page with no recipes, go back to page 1
          setPage(1);
        }
        
        // Set recipes data if available
        if (response.data) {
          setRecipes(response.data);
          setTotalRecipes(response.total || 0);
          setTotalPages(Math.ceil(response.total / limit) || 1);
        } else {
          setRecipes([]);
          setTotalRecipes(0);
          setTotalPages(1);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching user recipes:', err);
        setError('Failed to load recipes. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchUserAndRecipes();
  }, [userId, page]);

  // Log the user state when it changes
  useEffect(() => {
    console.log('Current user state:', user);
  }, [user]);
  
  // Handle like/unlike recipe
  const handleToggleLike = async (recipeId) => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    try {
      const recipe = recipes.find(r => r._id === recipeId);
      const isLiked = recipe.likes?.some(like => like.user === currentUser._id);
      
      if (isLiked) {
        await apiClient.recipes.unlikeRecipe(recipeId);
      } else {
        await apiClient.recipes.likeRecipe(recipeId);
      }
      
      // Refresh recipes to update like count
      const response = await apiClient.recipes.getUserRecipes(userId, { page, limit });
      if (response.data) {
        setRecipes(response.data);
      }
    } catch (err) {
      console.error('Error liking/unliking recipe:', err);
      setError('Failed to update like. Please try again.');
    }
  };
  
  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!user || !user.name) return 'U';
    return user.name
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  // Default avatar URL
  const defaultAvatarUrl = 'https://api.dicebear.com/7.x/avataaars/svg';
  
  if (loading && page === 1) {
    return (
      <div className="container mx-auto flex h-64 items-center justify-center px-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
      </div>
    );
  }
  
  // Ensure we have a valid user name
  const userName = user && user.name ? user.name : 'This User';
  const isCurrentUser = userId === currentUser?._id;
  const profileImage = user && user.profileImage ? user.profileImage : defaultAvatarUrl;
  const joinDate = user && user.createdAt ? formatDate(user.createdAt) : 'Unknown date';
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center">
        <Button asChild variant="ghost" className="mr-4">
          <Link href="/home">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Recipes
          </Link>
        </Button>
      </div>
      
      {error ? (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : (
        <>
          <div className="mb-8">
            <div className="flex flex-col items-center md:flex-row md:items-start">
              <Avatar className="mb-4 h-24 w-24 md:mb-0 md:mr-6">
                <AvatarImage 
                  src={profileImage} 
                  alt={userName} 
                />
                <AvatarFallback className="bg-amber-100 text-amber-800 text-xl">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              
              <div>
                <h1 className="mb-2 text-center text-3xl font-bold md:text-left">{userName}'s Recipes</h1>
                <div className="flex flex-col items-center space-y-2 text-muted-foreground md:flex-row md:items-center md:space-x-4 md:space-y-0 md:text-left">
                  {user && (
                    <>
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4" />
                        <span>Joined {joinDate}</span>
                      </div>
                      <div className="flex items-center">
                        <ChefHat className="mr-2 h-4 w-4" />
                        <span>{totalRecipes} {totalRecipes === 1 ? 'recipe' : 'recipes'}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              {isCurrentUser && (
                <div className="ml-auto mt-4 md:mt-0">
                  <Button asChild className="bg-amber-500 hover:bg-amber-600">
                    <Link href="/recipes/create">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Create Recipe
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          {recipes.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
              <User className="mb-4 h-10 w-10 text-muted-foreground" />
              <h2 className="mb-2 text-xl font-semibold">No Recipes Yet</h2>
              <p className="mb-4 text-muted-foreground">
                {isCurrentUser
                  ? "You haven't shared any recipes yet. Start sharing your culinary creations!"
                  : `${userName} hasn't shared any recipes yet.`
                }
              </p>
              {isCurrentUser && (
                <Button asChild className="bg-amber-500 hover:bg-amber-600">
                  <Link href="/recipes/create">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Your First Recipe
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {recipes.map((recipe) => (
                  <RecipeCard 
                    key={recipe._id} 
                    recipe={recipe} 
                    onLike={handleToggleLike} 
                  />
                ))}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setPage(page => Math.max(page - 1, 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span className="flex items-center px-4">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPage(page => Math.min(page + 1, totalPages))}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
} 