import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ChefHat, Utensils, Clock, Heart, MessageSquare, Search, PlusCircle } from 'lucide-react';
import Link from 'next/link';

const RecipeSocialLanding = () => {
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
                <Link href="/recipes">
                  <Button variant="outline" className="border-amber-500 text-amber-500 hover:bg-amber-50 px-6 py-3 h-auto">
                    Explore Recipes
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden md:block relative h-96">
              <div className="absolute -top-4 -left-4 h-64 w-64 bg-white shadow-lg rounded-lg overflow-hidden transform -rotate-6">
                <div className="h-full w-full bg-gray-200"></div>
              </div>
              <div className="absolute top-12 left-32 h-72 w-72 bg-white shadow-lg rounded-lg overflow-hidden transform rotate-3">
                <div className="h-full w-full bg-gray-200"></div>
              </div>
              <div className="absolute bottom-0 right-0 h-56 w-56 bg-white shadow-lg rounded-lg overflow-hidden transform rotate-12">
                <div className="h-full w-full bg-gray-200"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Why Join RecipeShare?</h2>
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
            {[1, 2, 3].map((card) => (
              <Card key={card} className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow">
                <div className="h-48 bg-gray-200 relative">
                  <div className="absolute bottom-3 left-3 bg-white rounded-full px-3 py-1 text-sm font-medium flex items-center">
                    <Clock className="h-4 w-4 mr-1" /> 30 mins
                  </div>
                </div>
                <CardContent className="pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-amber-500">Italian</span>
                    <div className="flex items-center space-x-1">
                      <Heart className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-500">128</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Homemade Margherita Pizza</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    A classic Italian pizza with fresh mozzarella, tomatoes, and basil on a crispy crust.
                  </p>
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-gray-200 mr-2"></div>
                    <span className="text-sm text-gray-700">Chef Isabella</span>
                  </div>
                </CardContent>
              </Card>
            ))}
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
              <h3 className="text-white font-semibold mb-4">RecipeShare</h3>
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
            <p>© 2025 RecipeShare. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default RecipeSocialLanding;