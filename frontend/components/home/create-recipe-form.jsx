'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus } from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import apiClient from '@/lib/api/client';
import { useRouter } from 'next/navigation';

const CATEGORIES = [
  'breakfast', 'lunch', 'dinner', 'appetizer', 'dessert', 
  'snack', 'soup', 'salad', 'side'
];

const DIETS = [
  'vegetarian', 'vegan', 'gluten-free', 'dairy-free',
  'keto', 'paleo', 'low-carb', 'high-protein'
];

const DIFFICULTIES = ['easy', 'medium', 'hard'];

export const CreateRecipeForm = ({ onSubmit, onCancel }) => {
  const { user } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    ingredients: [''],
    instructions: [''],
    cookingTime: 30,
    servings: 4,
    difficulty: 'medium',
    category: 'dinner',
    diet: [],
    image: 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?q=80&w=800&auto=format&fit=crop'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      
      const response = await apiClient.recipes.createRecipe(cleanedData);
      
      if (onSubmit) {
        onSubmit(response);
      }
      
    } catch (err) {
      console.error('Error creating recipe:', err);
      setError(err.message || 'Failed to create recipe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Create New Recipe</CardTitle>
        <CardDescription>Share your culinary creation with the community</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Recipe Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                disabled={loading}
                placeholder="e.g., Homemade Margherita Pizza"
                className="mt-1"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                disabled={loading}
                placeholder="Briefly describe your recipe..."
                className="mt-1 h-20"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cookingTime">Cooking Time (minutes)</Label>
                <Input
                  id="cookingTime"
                  name="cookingTime"
                  type="number"
                  min="1"
                  value={formData.cookingTime}
                  onChange={handleChange}
                  disabled={loading}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="servings">Servings</Label>
                <Input
                  id="servings"
                  name="servings"
                  type="number"
                  min="1"
                  value={formData.servings}
                  onChange={handleChange}
                  disabled={loading}
                  className="mt-1"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => handleSelectChange('category', value)}
                  disabled={loading}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select 
                  value={formData.difficulty} 
                  onValueChange={(value) => handleSelectChange('difficulty', value)}
                  disabled={loading}
                >
                  <SelectTrigger id="difficulty">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    {DIFFICULTIES.map((difficulty) => (
                      <SelectItem key={difficulty} value={difficulty}>
                        {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          {/* Diet Tags */}
          <div>
            <Label>Diet Tags</Label>
            <div className="flex flex-wrap gap-2 mt-1">
              {DIETS.map((diet) => (
                <Button
                  key={diet}
                  type="button"
                  onClick={() => handleDietToggle(diet)}
                  variant={formData.diet.includes(diet) ? "default" : "outline"}
                  size="sm"
                  disabled={loading}
                  className="capitalize"
                >
                  {diet}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Ingredients */}
          <div>
            <Label>Ingredients</Label>
            <div className="space-y-2 mt-1">
              {formData.ingredients.map((ingredient, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={ingredient}
                    onChange={(e) => handleIngredientChange(index, e.target.value)}
                    placeholder={`Ingredient ${index + 1}`}
                    disabled={loading}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeIngredient(index)}
                    disabled={loading || formData.ingredients.length <= 1}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addIngredient}
                disabled={loading}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-2" /> Add Ingredient
              </Button>
            </div>
          </div>
          
          {/* Instructions */}
          <div>
            <Label>Instructions</Label>
            <div className="space-y-2 mt-1">
              {formData.instructions.map((instruction, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="flex-none pt-2 text-sm text-gray-500">
                    {index + 1}.
                  </div>
                  <Textarea
                    value={instruction}
                    onChange={(e) => handleInstructionChange(index, e.target.value)}
                    placeholder={`Step ${index + 1}`}
                    disabled={loading}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeInstruction(index)}
                    disabled={loading || formData.instructions.length <= 1}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addInstruction}
                disabled={loading}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-2" /> Add Step
              </Button>
            </div>
          </div>
          
          {/* Image URL */}
          <div>
            <Label htmlFor="image">Image URL</Label>
            <Input
              id="image"
              name="image"
              value={formData.image}
              onChange={handleChange}
              disabled={loading}
              placeholder="https://example.com/image.jpg"
              className="mt-1"
            />
            <p className="text-sm text-gray-500 mt-1">
              Leave default for a placeholder image
            </p>
          </div>
          
          <div className="flex justify-end space-x-2">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Recipe'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}; 