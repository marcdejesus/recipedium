import React from 'react';
import { useRouter } from 'next/router';
import { Plus, ChefHat } from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { Button } from '@/components/ui/button';
import RecipeList from '@/components/home/recipe-list';

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();

  const handleAddRecipe = () => {
    router.push('/recipes/create');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-2">
          <ChefHat className="h-7 w-7 text-amber-500" />
          <h1 className="text-3xl font-bold">Explore Recipes</h1>
        </div>
      </div>
      
      {/* Recipe List Component - handles all filtering, sorting, and pagination */}
      <RecipeList />
    </div>
  );
} 