import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Heart, Clock, Users, ChefHat, ArrowLeft, Trash2, Send, Edit, ExternalLink, Star } from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { formatDistanceToNow } from 'date-fns';
import apiClient from '@/lib/api/client';
import { formatDate } from '@/lib/utils';

export default function RecipeDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  
  // States
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comment, setComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [commentError, setCommentError] = useState('');
  const [rating, setRating] = useState(5);
  const [editMode, setEditMode] = useState(false);
  
  // Debug auth state
  useEffect(() => {
    console.log('Recipe detail auth state:', { isAuthenticated, user, authLoading });
  }, [isAuthenticated, user, authLoading]);

  // Fetch recipe data
  useEffect(() => {
    if (!id) return;
    
    const fetchRecipe = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const recipeData = await apiClient.recipes.getRecipe(id);
        console.log('Recipe data:', recipeData);
        setRecipe(recipeData);
        
        // Wait for auth to complete before checking like status
        if (!authLoading && isAuthenticated && user) {
          console.log('Checking if user has liked recipe:', user._id);
          const hasLiked = recipeData.likes?.some(like => like.user === user._id);
          console.log('User has liked recipe:', hasLiked);
          setIsLiked(hasLiked);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching recipe:', err);
        setError('Failed to load recipe. It may have been deleted or does not exist.');
        setLoading(false);
      }
    };
    
    fetchRecipe();
  }, [id, isAuthenticated, user, authLoading]);

  // Recheck like status when authentication completes
  useEffect(() => {
    if (!recipe || authLoading) return;
    
    if (isAuthenticated && user) {
      console.log('Auth state changed, rechecking like status');
      const hasLiked = recipe.likes?.some(like => like.user === user._id);
      console.log('User has liked recipe (after auth check):', hasLiked);
      setIsLiked(hasLiked);
    }
  }, [recipe, isAuthenticated, user, authLoading]);
  
  // Handle like/unlike recipe
  const handleToggleLike = async () => {
    if (!isAuthenticated) {
      console.log('User not authenticated, redirecting to login');
      router.push(`/login?redirect=/recipes/${id}`);
      return;
    }
    
    try {
      console.log('Toggling like, current status:', isLiked);
      
      if (isLiked) {
        await apiClient.recipes.unlikeRecipe(id);
        console.log('Recipe unliked successfully');
        setIsLiked(false);
        // Update the likes count
        setRecipe(prev => ({
          ...prev,
          likesCount: (prev.likesCount || prev.likes.length) - 1,
          likes: prev.likes.filter(like => like.user !== user._id)
        }));
      } else {
        await apiClient.recipes.likeRecipe(id);
        console.log('Recipe liked successfully');
        setIsLiked(true);
        // Update the likes count
        setRecipe(prev => ({
          ...prev,
          likesCount: (prev.likesCount || prev.likes.length) + 1,
          likes: [...prev.likes, { user: user._id, createdAt: new Date() }]
        }));
      }
    } catch (err) {
      console.error('Error toggling like:', err);
      setError('Failed to update like. Please try again.');
    }
  };
  
  // Handle submitting a comment
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    if (!comment.trim()) {
      setCommentError('Comment cannot be empty');
      return;
    }
    
    try {
      setCommentError('');
      // Add loading state while submitting comment
      const submitButton = e.target.querySelector('button[type="submit"]');
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerHTML = '<div class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>';
      }
      
      await apiClient.recipes.addComment(id, { text: comment, rating });
      
      // Refresh recipe to get updated comments
      const updatedRecipe = await apiClient.recipes.getRecipe(id);
      setRecipe(updatedRecipe);
      setComment('');
      setRating(5);
      
      // Scroll to the newly added comment
      setTimeout(() => {
        const commentsSection = document.getElementById('comments-section');
        if (commentsSection) {
          commentsSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
      
      // Reset button state
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerHTML = '<svg class="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>Post Comment';
      }
    } catch (err) {
      console.error('Error adding comment:', err);
      setCommentError('Failed to add comment. Please try again.');
      
      // Reset button state on error
      const submitButton = e.target.querySelector('button[type="submit"]');
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerHTML = '<svg class="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>Post Comment';
      }
    }
  };
  
  // Handle deleting a comment
  const handleDeleteComment = async (commentId) => {
    if (!isAuthenticated) return;
    
    try {
      await apiClient.recipes.deleteComment(id, commentId);
      
      // Refresh recipe to get updated comments
      const updatedRecipe = await apiClient.recipes.getRecipe(id);
      setRecipe(updatedRecipe);
    } catch (err) {
      console.error('Error deleting comment:', err);
      setError('Failed to delete comment. Please try again.');
    }
  };
  
  // Handle deleting recipe
  const handleDeleteRecipe = async () => {
    if (!isAuthenticated || !recipe || (recipe.user._id !== user._id && user.role !== 'admin')) {
      return;
    }
    
    if (!confirm('Are you sure you want to delete this recipe? This action cannot be undone.')) {
      return;
    }
    
    try {
      await apiClient.recipes.deleteRecipe(id);
      router.push('/home');
    } catch (err) {
      console.error('Error deleting recipe:', err);
      setError('Failed to delete recipe. Please try again.');
    }
  };
  
  // Handle editing recipe
  const handleEditRecipe = () => {
    router.push(`/recipes/edit/${id}`);
  };
  
  if (loading || authLoading) {
    return (
      <div className="container mx-auto flex h-screen items-center justify-center px-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }
  
  if (error || !recipe) {
    return (
      <div className="container mx-auto flex h-screen flex-col items-center justify-center px-4">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-red-500">Error</h1>
          <p className="mb-6">{error || 'Recipe not found'}</p>
          <Button asChild>
            <Link href="/home">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Recipes
            </Link>
          </Button>
        </div>
      </div>
    );
  }
  
  const {
    title,
    description,
    ingredients,
    instructions,
    cookingTime,
    servings,
    difficulty,
    category,
    diet,
    image,
    user: recipeUser,
    comments,
    likesCount,
    commentsCount,
    createdAt,
  } = recipe;

  const canEditRecipe = isAuthenticated && user && recipeUser && user._id === recipeUser._id;
  const canDeleteRecipe = isAuthenticated && user && recipeUser && 
    (user._id === recipeUser._id || user.role === 'admin');
  
  // Default image if none provided
  const displayImage = image || '/images/default-recipe.jpg';
  // Default avatar URL for comments
  const defaultAvatarUrl = 'https://api.dicebear.com/7.x/avataaars/svg';
  
  // Get user initials for avatar fallback
  const getUserInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4 flex items-center justify-between">
        <Button asChild variant="ghost">
          <Link href="/home">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Recipes
          </Link>
        </Button>
        
        <div className="flex gap-2">
          {canEditRecipe && (
            <Button onClick={handleEditRecipe} variant="outline" size="sm">
              <Edit className="mr-2 h-4 w-4" />
              Edit Recipe
            </Button>
          )}
          
          {canDeleteRecipe && (
            <Button onClick={handleDeleteRecipe} variant="destructive" size="sm">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Recipe
            </Button>
          )}
        </div>
      </div>
      
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Recipe details */}
        <div className="lg:col-span-2">
          <div className="mb-6 overflow-hidden rounded-lg">
            <img
              src={displayImage}
              alt={title}
              className="h-[400px] w-full object-cover"
            />
          </div>
          
          <div className="mb-6">
            <h1 className="text-3xl font-bold">{title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span className="flex items-center">
                By{" "}
                <Link 
                  href={`/recipes/user/${recipeUser?._id}`}
                  className="ml-1 inline-flex items-center text-amber-600 hover:underline"
                >
                  <Avatar className="mr-1 h-5 w-5">
                    <AvatarImage 
                      src={recipeUser?.profileImage || defaultAvatarUrl} 
                      alt={recipeUser?.name || "Anonymous"} 
                    />
                    <AvatarFallback className="text-[10px]">
                      {getUserInitials(recipeUser?.name)}
                    </AvatarFallback>
                  </Avatar>
                  {recipeUser?.name || 'Anonymous'}
                </Link>
              </span>
              <span>•</span>
              <span>{formatDate(createdAt)}</span>
              <span>•</span>
              <span>{category}</span>
            </div>
          </div>
          
          <div className="mb-6 flex flex-wrap gap-4">
            <div className="flex items-center gap-2 rounded-md bg-amber-100 px-3 py-1.5 text-amber-800">
              <Clock className="h-4 w-4" />
              <span>{cookingTime} minutes</span>
            </div>
            
            <div className="flex items-center gap-2 rounded-md bg-blue-100 px-3 py-1.5 text-blue-800">
              <Users className="h-4 w-4" />
              <span>{servings} servings</span>
            </div>
            
            <div className="flex items-center gap-2 rounded-md bg-purple-100 px-3 py-1.5 text-purple-800">
              <ChefHat className="h-4 w-4" />
              <span>{difficulty}</span>
            </div>
            
            <Button
              onClick={handleToggleLike}
              variant={isLiked ? "default" : "outline"}
              size="sm"
              className={isLiked ? "bg-red-100 text-red-800 hover:bg-red-200 hover:text-red-800" : ""}
            >
              <Heart className={`mr-2 h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
              {likesCount} {likesCount === 1 ? 'Like' : 'Likes'}
            </Button>
          </div>
          
          {diet && diet.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-2 text-lg font-semibold">Dietary</h3>
              <div className="flex flex-wrap gap-2">
                {diet.map((item) => (
                  <span
                    key={item}
                    className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-800"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          <div className="mb-6">
            <h3 className="mb-2 text-lg font-semibold">Description</h3>
            <p className="text-muted-foreground">{description}</p>
          </div>
          
          <div className="mb-6">
            <h3 className="mb-2 text-lg font-semibold">Ingredients</h3>
            <ul className="ml-6 list-disc space-y-1 text-muted-foreground">
              {ingredients.map((ingredient, index) => (
                <li key={index}>{ingredient}</li>
              ))}
            </ul>
          </div>
          
          <div className="mb-6">
            <h3 className="mb-2 text-lg font-semibold">Instructions</h3>
            <ol className="ml-6 list-decimal space-y-3 text-muted-foreground">
              {instructions.map((instruction, index) => (
                <li key={index}>{instruction}</li>
              ))}
            </ol>
          </div>
          
          <Separator className="my-8" />
          
          {/* Comments section */}
          <div id="comments-section" className="mt-8">
            <h3 className="mb-4 text-xl font-semibold">Comments ({comments?.length || 0})</h3>
            
            {isAuthenticated ? (
              <div className="mb-6 rounded-lg border bg-white p-4 shadow-sm">
                <form onSubmit={handleSubmitComment}>
                  <div className="mb-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage 
                          src={user?.profileImage || defaultAvatarUrl} 
                          alt={user?.name || "You"} 
                        />
                        <AvatarFallback className="bg-amber-100 text-amber-800 text-xs">
                          {getUserInitials(user?.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">Commenting as {user?.name}</span>
                    </div>
                    <label className="mb-2 block font-medium">
                      Your comment
                    </label>
                    <Textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Share your thoughts or tips about this recipe..."
                      className="min-h-[100px]"
                    />
                    {commentError && (
                      <p className="mt-1 text-sm text-red-500">{commentError}</p>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <label className="mb-2 block font-medium">
                      Your rating
                    </label>
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setRating(value)}
                          className="text-amber-400 focus:outline-none"
                        >
                          <Star className={`h-6 w-6 ${value <= rating ? 'fill-amber-400' : ''}`} />
                        </button>
                      ))}
                      <span className="ml-2 text-sm text-muted-foreground">
                        {rating} star{rating !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  
                  <Button type="submit" className="bg-amber-500 hover:bg-amber-600">
                    <Send className="mr-2 h-4 w-4" />
                    Post Comment
                  </Button>
                </form>
              </div>
            ) : (
              <div className="mb-6 rounded-lg border bg-white p-4 shadow-sm">
                <p className="text-center">
                  <Link href={`/login?redirect=/recipes/${id}`} className="text-amber-600 hover:underline">
                    Log in
                  </Link>{" "}
                  to leave a comment
                </p>
              </div>
            )}
            
            {/* Comment list */}
            {comments && comments.length > 0 ? (
              <div className="space-y-4">
                {comments.map((comment) => {
                  // Make sure we're checking with proper user IDs
                  const userIdString = user?._id?.toString();
                  const commentUserIdString = comment.user?._id?.toString();
                  const recipeUserIdString = recipeUser?._id?.toString();
                  
                  const isCommentAuthor = isAuthenticated && userIdString === commentUserIdString;
                  const isRecipeAuthor = isAuthenticated && userIdString === recipeUserIdString;
                  const isAdmin = isAuthenticated && user?.role === 'admin';
                  const canDeleteComment = isCommentAuthor || isRecipeAuthor || isAdmin;
                  
                  console.log('Comment permissions:', {
                    userId: userIdString,
                    commentUserId: commentUserIdString,
                    recipeUserId: recipeUserIdString,
                    isCommentAuthor,
                    isRecipeAuthor,
                    isAdmin,
                    canDeleteComment
                  });
                  
                  return (
                    <div key={comment._id} className="rounded-lg border bg-white p-4 shadow-sm">
                      <div className="flex justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage 
                              src={comment.user?.profileImage || defaultAvatarUrl} 
                              alt={comment.user?.name || "Anonymous"} 
                            />
                            <AvatarFallback className="bg-amber-100 text-amber-800 text-xs">
                              {getUserInitials(comment.user?.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <Link 
                              href={`/recipes/user/${comment.user?._id}`}
                              className="font-medium hover:text-amber-600 hover:underline"
                            >
                              {comment.user?.name || "Anonymous"}
                            </Link>
                            <p className="text-xs text-gray-500">
                              {comment.createdAt && formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                              {isCommentAuthor && <span className="ml-2 rounded bg-amber-100 px-1 py-0.5 text-[10px] text-amber-800">You</span>}
                              {recipeUser?._id === comment.user?._id && <span className="ml-2 rounded bg-blue-100 px-1 py-0.5 text-[10px] text-blue-800">Author</span>}
                            </p>
                          </div>
                        </div>
                        
                        {canDeleteComment && (
                          <Button 
                            onClick={() => handleDeleteComment(comment._id)}
                            variant="ghost" 
                            size="sm"
                            className="text-red-500 hover:bg-red-50 hover:text-red-700"
                            title="Delete comment"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="mt-2">
                        {comment.rating && (
                          <div className="mb-1 flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star 
                                key={star} 
                                className={`h-4 w-4 ${star <= comment.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} 
                              />
                            ))}
                            <span className="ml-1 text-xs text-muted-foreground">
                              ({comment.rating}/5)
                            </span>
                          </div>
                        )}
                        <p className="text-gray-700">{comment.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-lg border bg-white p-6 text-center shadow-sm">
                <p className="text-gray-500">No comments yet. Be the first to share your thoughts!</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Author card */}
          <Card>
            <CardHeader>
              <CardTitle>Recipe Author</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={recipeUser?.profileImage || defaultAvatarUrl} alt={recipeUser?.name || "Anonymous"} />
                  <AvatarFallback className="bg-amber-100 text-amber-800">
                    {getUserInitials(recipeUser?.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-medium">{recipeUser?.name || "Anonymous"}</h4>
                  <Button 
                    asChild 
                    variant="link" 
                    className="h-auto p-0 text-sm text-amber-600"
                  >
                    <Link href={`/recipes/user/${recipeUser?._id}`}>
                      <ExternalLink className="mr-1 h-3 w-3" />
                      View all recipes by this chef
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recipe Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Recipe Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cooking Time:</span>
                <span>{cookingTime} minutes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Servings:</span>
                <span>{servings}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Difficulty:</span>
                <span>{difficulty}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Category:</span>
                <span>{category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Likes:</span>
                <span>{likesCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Comments:</span>
                <span>{comments?.length || 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 