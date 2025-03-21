import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { CreateRecipeForm } from '@/components/home/create-recipe-form';
import { useAuth } from '@/lib/auth/auth-context';
import { ChevronLeft, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import apiClient from '@/lib/api/client';

export default function EditRecipePage() {
  const router = useRouter();
  const { id } = router.query;
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Debug auth state
  useEffect(() => {
    console.log('Edit recipe auth state:', { isAuthenticated, user, authLoading });
  }, [isAuthenticated, user, authLoading]);

  // Fetch recipe data
  useEffect(() => {
    if (!id) return;
    
    const fetchRecipe = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const recipeData = await apiClient.recipes.getRecipe(id);
        console.log('Recipe data for editing:', recipeData);
        
        setRecipe(recipeData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching recipe for editing:', err);
        setError('Failed to load recipe. It may have been deleted or does not exist.');
        setLoading(false);
      }
    };
    
    fetchRecipe();
  }, [id]);

  // Redirect if not authenticated or not recipe owner
  useEffect(() => {
    // Wait until auth is loaded and recipe is loaded
    if (authLoading || loading) return;
    
    if (!isAuthenticated) {
      console.log('User not authenticated, redirecting to login');
      router.push(`/login?redirect=/recipes/edit/${id}`);
      return;
    }
    
    // Check if user is recipe owner
    if (recipe && user && recipe.user && recipe.user._id !== user._id && user.role !== 'admin') {
      console.log('User not authorized to edit this recipe');
      router.push(`/recipes/${id}`);
      return;
    }
  }, [authLoading, loading, isAuthenticated, user, recipe, router, id]);

  const handleSubmit = async (response) => {
    if (response && response._id) {
      router.push(`/recipes/${response._id}`);
    }
  };
  
  // Show loading state
  if (loading || authLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
      </div>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold text-red-600">Error</h1>
          <p className="mt-2 text-gray-700">{error}</p>
          <Button 
            onClick={() => router.back()} 
            className="mt-4"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }
  
  // Show nothing if unauthorized or recipe not found
  if (!recipe || !user) {
    return null;
  }

  // Create a modified version of the recipe for the form
  const formData = {
    ...recipe,
    // Ensure these are the right format
    ingredients: recipe.ingredients || [''],
    instructions: recipe.instructions || [''],
    diet: recipe.diet || []
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => router.back()}
          className="mb-4"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Edit Recipe</h1>
        <p className="mt-2 text-gray-600">Update your recipe details</p>
      </div>
      
      <div className="mx-auto max-w-3xl">
        <EditRecipeForm 
          recipe={formData}
          recipeId={id}
          onSubmit={handleSubmit}
          onCancel={() => router.push(`/recipes/${id}`)}
        />
      </div>
    </div>
  );
}

// Component for editing a recipe, based on CreateRecipeForm
const EditRecipeForm = ({ recipe, recipeId, onSubmit, onCancel }) => {
  const { user } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    title: recipe.title || '',
    description: recipe.description || '',
    ingredients: recipe.ingredients || [''],
    instructions: recipe.instructions || [''],
    cookingTime: recipe.cookingTime || 30,
    servings: recipe.servings || 4,
    difficulty: recipe.difficulty || 'medium',
    category: recipe.category || 'dinner',
    diet: recipe.diet || [],
    image: recipe.image || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?q=80&w=800&auto=format&fit=crop'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Same handlers as in CreateRecipeForm
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSelectChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleDietToggle = (diet) => {
    const currentDiets = [...formData.diet];
    
    if (currentDiets.includes(diet)) {
      // Remove diet if already selected
      setFormData({
        ...formData,
        diet: currentDiets.filter(d => d !== diet)
      });
    } else {
      // Add diet if not already selected
      setFormData({
        ...formData,
        diet: [...currentDiets, diet]
      });
    }
  };

  const handleIngredientChange = (index, value) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index] = value;
    
    setFormData({
      ...formData,
      ingredients: newIngredients
    });
  };

  const addIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, '']
    });
  };

  const removeIngredient = (index) => {
    if (formData.ingredients.length <= 1) return;
    
    const newIngredients = [...formData.ingredients];
    newIngredients.splice(index, 1);
    
    setFormData({
      ...formData,
      ingredients: newIngredients
    });
  };

  const handleInstructionChange = (index, value) => {
    const newInstructions = [...formData.instructions];
    newInstructions[index] = value;
    
    setFormData({
      ...formData,
      instructions: newInstructions
    });
  };

  const addInstruction = () => {
    setFormData({
      ...formData,
      instructions: [...formData.instructions, '']
    });
  };

  const removeInstruction = (index) => {
    if (formData.instructions.length <= 1) return;
    
    const newInstructions = [...formData.instructions];
    newInstructions.splice(index, 1);
    
    setFormData({
      ...formData,
      instructions: newInstructions
    });
  };

  const validateForm = () => {
    if (!formData.title) return 'Title is required';
    if (!formData.ingredients[0]) return 'At least one ingredient is required';
    if (!formData.instructions[0]) return 'At least one instruction is required';
    
    // Remove any empty ingredients or instructions
    const filteredIngredients = formData.ingredients.filter(i => i.trim());
    const filteredInstructions = formData.instructions.filter(i => i.trim());
    
    if (filteredIngredients.length === 0) return 'At least one ingredient is required';
    if (filteredInstructions.length === 0) return 'At least one instruction is required';
    
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate the form
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    // Clean up the data before sending
    const cleanedData = {
      ...formData,
      ingredients: formData.ingredients.filter(i => i.trim()),
      instructions: formData.instructions.filter(i => i.trim()),
      cookingTime: parseInt(formData.cookingTime, 10),
      servings: parseInt(formData.servings, 10)
    };
    
    try {
      setLoading(true);
      setError('');
      
      // Use updateRecipe instead of createRecipe
      const response = await apiClient.recipes.updateRecipe(recipeId, cleanedData);
      console.log('Recipe updated successfully:', response);
      
      if (onSubmit) {
        onSubmit(response);
      }
      
    } catch (err) {
      console.error('Error updating recipe:', err);
      setError(err.message || 'Failed to update recipe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Constants
  const CATEGORIES = [
    'breakfast', 'lunch', 'dinner', 'appetizer', 'dessert', 
    'snack', 'soup', 'salad', 'side'
  ];

  const DIETS = [
    'vegetarian', 'vegan', 'gluten-free', 'dairy-free',
    'keto', 'paleo', 'low-carb', 'high-protein'
  ];

  const DIFFICULTIES = ['easy', 'medium', 'hard'];

  return (
    <div className="w-full border rounded-lg shadow-sm">
      <div className="border-b p-4 md:p-6">
        <h2 className="text-xl font-semibold">Edit Recipe</h2>
        <p className="text-sm text-gray-500">Update your recipe details</p>
      </div>
      <div className="p-4 md:p-6">
        {error && (
          <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium">Recipe Title</label>
              <input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                disabled={loading}
                placeholder="e.g., Homemade Margherita Pizza"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                disabled={loading}
                placeholder="Briefly describe your recipe..."
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 h-20"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="cookingTime" className="block text-sm font-medium">Cooking Time (minutes)</label>
                <input
                  id="cookingTime"
                  name="cookingTime"
                  type="number"
                  min="1"
                  value={formData.cookingTime}
                  onChange={handleChange}
                  disabled={loading}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="servings" className="block text-sm font-medium">Servings</label>
                <input
                  id="servings"
                  name="servings"
                  type="number"
                  min="1"
                  value={formData.servings}
                  onChange={handleChange}
                  disabled={loading}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium">Category</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  disabled={loading}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="difficulty" className="block text-sm font-medium">Difficulty</label>
                <select
                  id="difficulty"
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleChange}
                  disabled={loading}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  {DIFFICULTIES.map((difficulty) => (
                    <option key={difficulty} value={difficulty}>
                      {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          {/* Diet Tags */}
          <div>
            <label className="block text-sm font-medium">Diet Tags</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {DIETS.map((diet) => (
                <button
                  key={diet}
                  type="button"
                  onClick={() => handleDietToggle(diet)}
                  disabled={loading}
                  className={`px-3 py-1 text-sm rounded-full capitalize ${
                    formData.diet.includes(diet)
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-gray-100 text-gray-800 border border-gray-300'
                  }`}
                >
                  {diet}
                </button>
              ))}
            </div>
          </div>
          
          {/* Ingredients */}
          <div>
            <label className="block text-sm font-medium">Ingredients</label>
            <div className="space-y-2 mt-1">
              {formData.ingredients.map((ingredient, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    value={ingredient}
                    onChange={(e) => handleIngredientChange(index, e.target.value)}
                    placeholder={`Ingredient ${index + 1}`}
                    disabled={loading}
                    className="flex-1 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeIngredient(index)}
                    disabled={loading || formData.ingredients.length <= 1}
                    className="p-2 text-gray-500 hover:text-red-500"
                    aria-label="Remove ingredient"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addIngredient}
                disabled={loading}
                className="mt-2 flex items-center text-sm text-amber-600 hover:text-amber-800"
              >
                <Plus className="h-4 w-4 mr-1" /> Add Ingredient
              </button>
            </div>
          </div>
          
          {/* Instructions */}
          <div>
            <label className="block text-sm font-medium">Instructions</label>
            <div className="space-y-2 mt-1">
              {formData.instructions.map((instruction, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="flex-none pt-2 text-sm text-gray-500">
                    {index + 1}.
                  </div>
                  <textarea
                    value={instruction}
                    onChange={(e) => handleInstructionChange(index, e.target.value)}
                    placeholder={`Step ${index + 1}`}
                    disabled={loading}
                    className="flex-1 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 min-h-[80px]"
                  />
                  <button
                    type="button"
                    onClick={() => removeInstruction(index)}
                    disabled={loading || formData.instructions.length <= 1}
                    className="p-2 text-gray-500 hover:text-red-500"
                    aria-label="Remove instruction"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addInstruction}
                disabled={loading}
                className="mt-2 flex items-center text-sm text-amber-600 hover:text-amber-800"
              >
                <Plus className="h-4 w-4 mr-1" /> Add Step
              </button>
            </div>
          </div>
          
          {/* Image URL */}
          <div>
            <label htmlFor="image" className="block text-sm font-medium">Image URL</label>
            <input
              id="image"
              name="image"
              value={formData.image}
              onChange={handleChange}
              disabled={loading}
              placeholder="https://example.com/image.jpg"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty for default placeholder image
            </p>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4 border-t">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
            )}
            <button 
              type="submit" 
              disabled={loading}
              className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 