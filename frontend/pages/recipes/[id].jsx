import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Heart, Clock, Users, ChefHat, ArrowLeft, Trash2, Send } from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import apiClient from '@/lib/api/client';
import { formatDate } from '@/lib/utils';

export default function RecipeDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { user, isAuthenticated } = useAuth();
  
  // States
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comment, setComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [commentError, setCommentError] = useState('');
  
  // Fetch recipe data
  useEffect(() => {
    if (!id) return;
    
    const fetchRecipe = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const recipeData = await apiClient.recipes.getRecipe(id);
        setRecipe(recipeData);
        
        // Check if current user has liked this recipe
        if (isAuthenticated && user) {
          setIsLiked(recipeData.likes?.some(like => like.user === user._id));
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching recipe:', err);
        setError('Failed to load recipe. It may have been deleted or does not exist.');
        setLoading(false);
      }
    };
    
    fetchRecipe();
  }, [id, isAuthenticated, user]);
  
  // Handle like/unlike recipe
  const handleToggleLike = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    try {
      if (isLiked) {
        await apiClient.recipes.unlikeRecipe(id);
        setIsLiked(false);
        // Update the likes count
        setRecipe({
          ...recipe,
          likesCount: recipe.likesCount - 1,
          likes: recipe.likes.filter(like => like.user !== user._id)
        });
      } else {
        await apiClient.recipes.likeRecipe(id);
        setIsLiked(true);
        // Update the likes count
        setRecipe({
          ...recipe,
          likesCount: recipe.likesCount + 1,
          likes: [...recipe.likes, { user: user._id, createdAt: new Date() }]
        });
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
      await apiClient.recipes.addComment(id, { text: comment });
      
      // Refresh recipe to get updated comments
      const updatedRecipe = await apiClient.recipes.getRecipe(id);
      setRecipe(updatedRecipe);
      setComment('');
    } catch (err) {
      console.error('Error adding comment:', err);
      setCommentError('Failed to add comment. Please try again.');
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
  
  if (loading) {
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

  const canDeleteRecipe = isAuthenticated && 
    (user._id === recipeUser._id || user.role === 'admin');
  
  // Default image if none provided
  const displayImage = image || '/images/default-recipe.jpg';
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4 flex items-center justify-between">
        <Button asChild variant="ghost">
          <Link href="/home">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Recipes
          </Link>
        </Button>
        
        {canDeleteRecipe && (
          <Button onClick={handleDeleteRecipe} variant="destructive" size="sm">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Recipe
          </Button>
        )}
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
              <span>By {recipeUser?.name || 'Anonymous'}</span>
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
          <div className="mt-8">
            <h3 className="mb-4 text-xl font-semibold">
              Comments ({commentsCount || 0})
            </h3>
            
            {isAuthenticated ? (
              <form onSubmit={handleSubmitComment} className="mb-6">
                <div className="flex gap-2">
                  <Input
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1"
                  />
                  <Button type="submit">
                    <Send className="mr-2 h-4 w-4" />
                    Post
                  </Button>
                </div>
                {commentError && (
                  <p className="mt-2 text-sm text-red-500">{commentError}</p>
                )}
              </form>
            ) : (
              <div className="mb-6 rounded-md bg-muted p-4 text-center">
                <p className="mb-2">Please login to add a comment</p>
                <Button asChild size="sm">
                  <Link href="/login">Login</Link>
                </Button>
              </div>
            )}
            
            {comments && comments.length > 0 ? (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <Card key={comment._id}>
                    <CardHeader className="pb-2 pt-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-semibold">
                          {comment.userName || 'Anonymous'}
                        </CardTitle>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2 pt-0">
                      <p className="text-sm">{comment.text}</p>
                    </CardContent>
                    {(isAuthenticated && (user._id === comment.user || user.role === 'admin')) && (
                      <CardFooter className="flex justify-end pt-0">
                        <Button
                          onClick={() => handleDeleteComment(comment._id)}
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-xs text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="mr-1 h-3 w-3" />
                          Delete
                        </Button>
                      </CardFooter>
                    )}
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">No comments yet. Be the first to comment!</p>
            )}
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-4 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About the Chef</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    {recipeUser?.name?.charAt(0) || 'A'}
                  </div>
                  <div>
                    <p className="font-medium">{recipeUser?.name || 'Anonymous'}</p>
                    <p className="text-xs text-muted-foreground">
                      Member since {formatDate(recipeUser?.createdAt || createdAt)}
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" className="w-full">
                  <Link href={`/recipes/user/${recipeUser?._id}`}>
                    View All Recipes
                  </Link>
                </Button>
              </CardFooter>
            </Card>
            
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
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 