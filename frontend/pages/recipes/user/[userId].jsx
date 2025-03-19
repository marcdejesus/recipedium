import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowLeft, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RecipeCard } from '@/components/home/recipe-card';
import { useAuth } from '@/lib/auth/auth-context';
import { formatDate } from '@/lib/utils';
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
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 12; // recipes per page
  
  // Fetch user data and recipes
  useEffect(() => {
    if (!userId) return;
    
    const fetchUserAndRecipes = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // First get the recipes, which will include the user info
        const response = await apiClient.recipes.getUserRecipes(userId, { page, limit });
        
        if (response.recipes.length > 0) {
          // Extract user info from the first recipe
          const userData = response.recipes[0].user;
          setUser(userData);
        } else if (page === 1) {
          // If no recipes are found on the first page, make a separate call to get user info
          try {
            // This call might not exist in your API, so you might need to add it
            // or handle the case where a user has no recipes differently
            const userData = await apiClient.auth.getUserProfile(userId);
            setUser(userData);
          } catch (profileErr) {
            console.error('Error fetching user profile:', profileErr);
            setError('User not found or has no recipes.');
          }
        }
        
        setRecipes(response.recipes);
        setTotalPages(Math.ceil(response.total / limit));
        setLoading(false);
      } catch (err) {
        console.error('Error fetching user recipes:', err);
        setError('Failed to load recipes. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchUserAndRecipes();
  }, [userId, page]);
  
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
      setRecipes(response.recipes);
    } catch (err) {
      console.error('Error liking/unliking recipe:', err);
      setError('Failed to update like. Please try again.');
    }
  };
  
  if (loading && page === 1) {
    return (
      <div className="container mx-auto flex h-64 items-center justify-center px-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }
  
  const userName = user?.name || 'This User';
  
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
        <div className="rounded-md bg-red-50 p-4 text-red-800">
          {error}
        </div>
      ) : (
        <>
          <div className="mb-8 flex flex-col items-center md:flex-row md:items-start">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary text-4xl text-primary-foreground md:mb-0 md:mr-6">
              {userName.charAt(0)}
            </div>
            
            <div>
              <h1 className="mb-2 text-center text-3xl font-bold md:text-left">{userName}'s Recipes</h1>
              {user && (
                <p className="text-center text-muted-foreground md:text-left">
                  Member since {formatDate(user.createdAt)}
                </p>
              )}
            </div>
          </div>
          
          {recipes.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
              <User className="mb-4 h-10 w-10 text-muted-foreground" />
              <h2 className="mb-2 text-xl font-semibold">No Recipes Yet</h2>
              <p className="mb-4 text-muted-foreground">
                {userId === currentUser?._id 
                  ? "You haven't shared any recipes yet. Start sharing your culinary creations!"
                  : `${userName} hasn't shared any recipes yet.`
                }
              </p>
              {userId === currentUser?._id && (
                <Button asChild>
                  <Link href="/home">Add Your First Recipe</Link>
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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