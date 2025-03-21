import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ChefHat, Utensils, Clock, Heart, MessageSquare, Search, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import apiClient from '@/lib/api/client';
import Image from 'next/image';

const RecipeSocialLanding = () => {
  const [topRecipes, setTopRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to format likes count
  const formatLikes = (likes) => {
    if (!likes && likes !== 0) return '0';
    return likes.toString();
  };

  useEffect(() => {
    const fetchTopRecipes = async () => {
      setLoading(true);
      try {
        console.log('About to fetch top recipes'); // Debug log
        const data = await apiClient.topRecipes.getTopByLikes(3);
        console.log('Fetched top recipes data:', data);
        
        // Determine where the recipes are in the response
        let recipes = [];
        if (data && data.recipes && Array.isArray(data.recipes)) {
          recipes = data.recipes;
        } else if (data && Array.isArray(data)) {
          recipes = data;
        }
        
        // Use recipes or fallback to empty array
        setTopRecipes(recipes.length > 0 ? recipes : getFallbackRecipes());
        setError(null);
      } catch (error) {
        console.error('Error fetching top recipes:', error);
        setError(error.message);
        setTopRecipes(getFallbackRecipes()); // Use fallback recipes on error
      } finally {
        setLoading(false);
      }
    };

    fetchTopRecipes();
  }, []);

  // Fallback recipes for when API fails
  const getFallbackRecipes = () => {
    return [
      {
        _id: 'fallback1',
        title: 'Delicious Homemade Pizza',
        description: 'Classic homemade pizza with fresh ingredients and a crispy crust.',
        imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591',
        cookTimeMinutes: 45,
        cuisineType: 'Italian',
        likes: 128,
        user: { name: 'Pizza Lover' }
      },
      {
        _id: 'fallback2',
        title: 'Vegetable Curry',
        description: 'Hearty vegetable curry with aromatic spices and coconut milk.',
        imageUrl: 'https://images.unsplash.com/photo-1505253758473-96b7015fcd40',
        cookTimeMinutes: 30,
        cuisineType: 'Indian',
        likes: 97,
        user: { name: 'Spice Master' }
      },
      {
        _id: 'fallback3',
        title: 'Chocolate Chip Cookies',
        description: 'Soft and chewy chocolate chip cookies with a hint of vanilla.',
        imageUrl: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e',
        cookTimeMinutes: 25,
        cuisineType: 'Dessert',
        likes: 152,
        user: { name: 'Sweet Tooth' }
      }
    ];
  };

  // Get the top 3 recipes or fewer if not available
  const topThreeRecipes = topRecipes.slice(0, 3);

  // Helper function to get recipe image or fallback
  const getRecipeImage = (recipe) => {
    return recipe?.image || '/images/recipe-placeholder.jpg';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-amber-50 to-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                Share Your Culinary Creations With The World
              </h1>
              <p className="mt-4 text-lg text-gray-700">
                Join our community of food enthusiasts to discover, share, and celebrate 
                recipes from around the globe.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link href="/signup">
                  <Button className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 h-auto">
                    Create Account
                  </Button>
                </Link>
                <Link href="/home">
                  <Button variant="outline" className="border-amber-500 text-amber-500 hover:bg-amber-50 px-6 py-3 h-auto">
                    Explore Recipes
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden md:block relative h-96">
              {topRecipes.length > 0 ? (
                <>
                  <div className="absolute -top-4 -left-4 h-64 w-64 bg-white shadow-lg rounded-lg overflow-hidden transform -rotate-6">
                    <div className="h-full w-full relative">
                      <Image 
                        src={getRecipeImage(topRecipes[0])} 
                        alt={topRecipes[0]?.title || 'Popular recipe'} 
                        fill
                        className="object-cover" 
                      />
                    </div>
                  </div>
                  <div className="absolute top-12 left-32 h-72 w-72 bg-white shadow-lg rounded-lg overflow-hidden transform rotate-3">
                    <div className="h-full w-full relative">
                      <Image 
                        src={getRecipeImage(topRecipes[1] || topRecipes[0])} 
                        alt={(topRecipes[1] || topRecipes[0])?.title || 'Popular recipe'} 
                        fill
                        className="object-cover" 
                      />
                    </div>
                  </div>
                  <div className="absolute bottom-0 right-0 h-56 w-56 bg-white shadow-lg rounded-lg overflow-hidden transform rotate-12">
                    <div className="h-full w-full relative">
                      <Image 
                        src={getRecipeImage(topRecipes[2] || topRecipes[0])} 
                        alt={(topRecipes[2] || topRecipes[0])?.title || 'Popular recipe'} 
                        fill
                        className="object-cover" 
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="absolute -top-4 -left-4 h-64 w-64 bg-white shadow-lg rounded-lg overflow-hidden transform -rotate-6">
                    <div className="h-full w-full bg-gray-200"></div>
                  </div>
                  <div className="absolute top-12 left-32 h-72 w-72 bg-white shadow-lg rounded-lg overflow-hidden transform rotate-3">
                    <div className="h-full w-full bg-gray-200"></div>
                  </div>
                  <div className="absolute bottom-0 right-0 h-56 w-56 bg-white shadow-lg rounded-lg overflow-hidden transform rotate-12">
                    <div className="h-full w-full bg-gray-200"></div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Why Join Recipedium?</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Our platform is designed to connect food lovers and make cooking more enjoyable
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="p-3 bg-amber-100 rounded-full">
                    <PlusCircle className="h-6 w-6 text-amber-500" />
                  </div>
                  <h3 className="mt-4 text-xl font-medium text-gray-900">Share Your Recipes</h3>
                  <p className="mt-2 text-gray-600">
                    Upload your favorite dishes with photos, ingredients, and step-by-step instructions
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="p-3 bg-amber-100 rounded-full">
                    <Utensils className="h-6 w-6 text-amber-500" />
                  </div>
                  <h3 className="mt-4 text-xl font-medium text-gray-900">Discover New Dishes</h3>
                  <p className="mt-2 text-gray-600">
                    Explore thousands of recipes from around the world and expand your culinary horizons
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="p-3 bg-amber-100 rounded-full">
                    <MessageSquare className="h-6 w-6 text-amber-500" />
                  </div>
                  <h3 className="mt-4 text-xl font-medium text-gray-900">Connect With Others</h3>
                  <p className="mt-2 text-gray-600">
                    Follow friends, exchange cooking tips, and receive feedback on your creations
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Popular Recipes Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Popular This Week</h2>
            <Link href="/recipes">
              <Button variant="link" className="text-amber-500">View all recipes</Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              // Loading state
              Array(3).fill(0).map((_, i) => (
                <Card key={i} className="overflow-hidden border-0 shadow-md animate-pulse">
                  <div className="h-48 bg-gray-200 relative"></div>
                  <CardContent className="pt-4">
                    <div className="h-4 bg-gray-200 rounded mb-2 w-1/4"></div>
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-3 w-3/4"></div>
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-gray-200 mr-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : error ? (
              // Error state
              <div className="col-span-3 py-8 text-center">
                <p className="text-red-500">{error}</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    setLoading(true);
                    setError(null);
                    apiClient.topRecipes.getTopByLikes(3)
                      .then(data => {
                        // Handle the API response format
                        let recipes = [];
                        if (data && data.recipes && Array.isArray(data.recipes)) {
                          recipes = data.recipes;
                        } else if (data && Array.isArray(data)) {
                          recipes = data;
                        }
                        setTopRecipes(recipes.length > 0 ? recipes : getFallbackRecipes());
                        setLoading(false);
                      })
                      .catch(err => {
                        setError(err.message);
                        setTopRecipes(getFallbackRecipes());
                        setLoading(false);
                      });
                  }}
                >
                  Try Again
                </Button>
              </div>
            ) : topRecipes.length > 0 ? (
              // Recipes display
              topRecipes.map((recipe) => (
                <Link href={`/recipes/${recipe._id}`} key={recipe._id || recipe.id}>
                  <Card className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="h-48 bg-gray-200 relative">
                      {recipe.image && (
                        <Image 
                          src={recipe.image} 
                          alt={recipe.title} 
                          fill
                          className="object-cover" 
                        />
                      )}
                      <div className="absolute bottom-3 left-3 bg-white rounded-full px-3 py-1 text-sm font-medium flex items-center">
                        <Clock className="h-4 w-4 mr-1" /> {recipe.cookTimeMinutes || '30'} mins
                      </div>
                    </div>
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-amber-500">{recipe.cuisineType || 'Mixed'}</span>
                        <div className="flex items-center space-x-1">
                          <Heart className="h-4 w-4 text-red-500" />
                          <span className="text-sm text-gray-500">{formatLikes(recipe.likes)}</span>
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{recipe.title}</h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {recipe.description || 'A delicious recipe to try out.'}
                      </p>
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-gray-200 mr-2 relative">
                          {recipe.user && recipe.user.profilePicture && (
                            <Image 
                              src={recipe.user.profilePicture} 
                              alt={recipe.user.name || 'Chef'} 
                              fill
                              className="object-cover rounded-full" 
                            />
                          )}
                        </div>
                        <span className="text-sm text-gray-700">
                          {recipe.user && typeof recipe.user === 'object' ? recipe.user.name || 'Chef' : 'Chef'}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              // No recipes found
              <div className="col-span-3 py-8 text-center">
                <p className="text-gray-500">No popular recipes found.</p>
                <Link href="/recipes/new">
                  <Button className="mt-4 bg-amber-500 hover:bg-amber-600 text-white">
                    Add Your Recipe
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-amber-500 to-orange-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Culinary Journey?</h2>
          <p className="max-w-2xl mx-auto mb-8 text-amber-50">
            Join thousands of food enthusiasts already sharing and discovering new recipes every day.
          </p>
          <Link href="/signup">
            <Button className="bg-white text-amber-500 hover:bg-amber-50 px-8 py-3 h-auto font-medium">
              Sign Up For Free
            </Button>
          </Link>
          <p className="mt-4 text-sm text-amber-50">No credit card required. Start sharing in minutes.</p>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-semibold mb-4">Recipedium</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white">About Us</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Press</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Discover</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white">Popular Recipes</a></li>
                <li><a href="#" className="hover:text-white">Browse Categories</a></li>
                <li><a href="#" className="hover:text-white">Featured Chefs</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Community</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white">Guidelines</a></li>
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 text-sm text-center">
            <p>© 2025 Recipedium. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default RecipeSocialLanding;