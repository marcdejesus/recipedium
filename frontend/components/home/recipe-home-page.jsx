import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChefHat, LogOut, Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';

const RecipeHomePage = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock recipe data until we implement the backend fetch
  const mockRecipes = [
    {
      id: '1',
      title: 'Homemade Pizza',
      description: 'Classic Italian pizza with a crispy crust and fresh toppings.',
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=500&auto=format&fit=crop',
      category: 'italian',
      diet: ['vegetarian'],
      cookingTime: 45,
      difficulty: 'medium',
      user: {
        name: 'Maria Silva'
      }
    },
    {
      id: '2',
      title: 'Thai Green Curry',
      description: 'Authentic Thai green curry with vegetables and coconut milk.',
      image: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?q=80&w=500&auto=format&fit=crop',
      category: 'thai',
      diet: ['gluten-free'],
      cookingTime: 30,
      difficulty: 'easy',
      user: {
        name: 'John Doe'
      }
    },
    {
      id: '3',
      title: 'Protein Smoothie Bowl',
      description: 'Nutrient-packed smoothie bowl with fruits, nuts, and protein powder.',
      image: 'https://images.unsplash.com/photo-1577805947697-89e18249d767?q=80&w=500&auto=format&fit=crop',
      category: 'breakfast',
      diet: ['high-protein', 'vegetarian'],
      cookingTime: 10,
      difficulty: 'easy',
      user: {
        name: 'Alex Johnson'
      }
    }
  ];

  useEffect(() => {
    // Check if user is authenticated
    if (!user) {
      router.push('/login');
      return;
    }

    // In a real app, we would fetch recipes from the backend
    // For now, we'll use mock data
    setTimeout(() => {
      setRecipes(mockRecipes);
      setLoading(false);
    }, 500);
  }, [user, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/home" className="flex items-center">
                <ChefHat className="h-8 w-8 text-amber-500" />
                <span className="ml-2 text-xl font-bold text-gray-900">RecipeShare</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="focus:ring-amber-500 focus:border-amber-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="Search recipes..."
                />
              </div>
              <Button className="bg-amber-500 hover:bg-amber-600">
                <Plus className="h-5 w-5 mr-1" /> New Recipe
              </Button>
              <Button onClick={handleLogout} variant="outline" className="border-gray-300">
                <LogOut className="h-5 w-5 mr-1" /> Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.name || 'Chef'}!</h1>
          <p className="text-gray-600">Discover delicious recipes shared by our community.</p>
        </div>

        {/* Categories */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Popular Categories</h2>
          <div className="flex space-x-4 overflow-x-auto pb-2">
            {['Italian', 'Chinese', 'Mexican', 'Thai', 'Breakfast', 'Dessert', 'Vegetarian', 'High-Protein'].map((category) => (
              <Button key={category} variant="outline" className="border-gray-300 rounded-full">
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Recipes Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Latest Recipes</h2>
          
          {loading ? (
            <div className="text-center py-10">
              <p className="text-gray-500">Loading recipes...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recipes.map((recipe) => (
                <Card key={recipe.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={recipe.image} 
                      alt={recipe.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <CardTitle className="text-lg">{recipe.title}</CardTitle>
                      <div className="flex items-center">
                        <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                          {recipe.difficulty}
                        </span>
                      </div>
                    </div>
                    <CardDescription>{recipe.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                        {recipe.category}
                      </span>
                      {recipe.diet.map((diet) => (
                        <span key={diet} className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                          {diet}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0 flex justify-between">
                    <div className="text-sm text-gray-500">
                      By {recipe.user.name} • {recipe.cookingTime} min
                    </div>
                    <Button variant="ghost" className="text-amber-500 hover:text-amber-600 hover:bg-amber-50 p-0">
                      View Recipe
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default RecipeHomePage; 