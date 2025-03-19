import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Plus, X } from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { Button } from '@/components/ui/button';
import RecipeList from '@/components/home/recipe-list';
import { CreateRecipeForm } from '@/components/home/create-recipe-form';

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleFormSubmit = (response) => {
    setShowCreateForm(false);
    // Force refresh the recipe list
    if (response._id) {
      router.push(`/recipes/${response._id}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <h1 className="text-3xl font-bold">Explore Recipes</h1>
        
        {user && (
          <Button 
            onClick={() => setShowCreateForm(!showCreateForm)}
            className={showCreateForm ? "bg-red-500 hover:bg-red-600 text-white" : "bg-amber-500 hover:bg-amber-600 text-white"}
          >
            {showCreateForm ? (
              <>
                <X className="mr-2 h-4 w-4" /> Cancel
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" /> Add Recipe
              </>
            )}
          </Button>
        )}
      </div>
      
      {showCreateForm && (
        <div className="mb-8 rounded-lg border bg-white p-4 shadow-md">
          <CreateRecipeForm 
            onSubmit={handleFormSubmit}
            onCancel={() => setShowCreateForm(false)} 
          />
        </div>
      )}
      
      {/* Recipe List Component - handles all filtering, sorting, and pagination */}
      <RecipeList />
    </div>
  );
} 