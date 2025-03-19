import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Plus } from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { Button } from '@/components/ui/button';
import RecipeList from '@/components/home/recipe-list';
import { CreateRecipeForm } from '@/components/home/create-recipe-form';

export default function Home() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [showCreateForm, setShowCreateForm] = useState(false);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <h1 className="text-3xl font-bold">Recipes</h1>
        
        {isAuthenticated && (
          <Button 
            onClick={() => setShowCreateForm(!showCreateForm)}
            className={showCreateForm ? "bg-red-500 hover:bg-red-600 text-white" : "bg-blue-500 hover:bg-blue-600 text-white"}
          >
            {showCreateForm ? "Cancel" : <><Plus className="mr-2 h-4 w-4" /> Add Recipe</>}
          </Button>
        )}
      </div>
      
      {showCreateForm && (
        <div className="mb-8 bg-white rounded-lg shadow-md p-6">
          <CreateRecipeForm 
            onSubmit={() => {
              setShowCreateForm(false);
              // Refresh recipe list will happen automatically via the RecipeList component
            }} 
            onCancel={() => setShowCreateForm(false)} 
          />
        </div>
      )}
      
      {/* Recipe List Component - handles all filtering, sorting, and pagination */}
      <RecipeList />
    </div>
  );
} 