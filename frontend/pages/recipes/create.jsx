import React from 'react';
import { useRouter } from 'next/router';
import { CreateRecipeForm } from '@/components/home/create-recipe-form';
import { useAuth } from '@/lib/auth/auth-context';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CreateRecipePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Show nothing while checking authentication
  if (loading || !user) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
      </div>
    );
  }

  const handleSubmit = (response) => {
    if (response && response._id) {
      router.push(`/recipes/${response._id}`);
    }
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
        <h1 className="text-3xl font-bold">Create Recipe</h1>
        <p className="mt-2 text-gray-600">Share your culinary masterpiece with the community</p>
      </div>
      
      <div className="mx-auto max-w-3xl">
        <CreateRecipeForm 
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
        />
      </div>
    </div>
  );
} 