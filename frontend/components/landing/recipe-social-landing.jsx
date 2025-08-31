import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ChefHat, Utensils, Clock, Heart, MessageSquare, Search, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const RecipeSocialLanding = () => {

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 lg:py-40 bg-gray-900 overflow-hidden">
        {/* Background Image with Dark Overlay */}
        <div className="absolute inset-0">
          <Image 
            src="/food.png" 
            alt="Food background" 
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black bg-opacity-60"></div>
        </div>
        
        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
              Share Your Culinary Creations With The World
            </h1>
            <p className="mt-4 text-lg text-gray-200 max-w-2xl mx-auto">
              Join our community of food enthusiasts to discover, share, and celebrate 
              recipes from around the globe.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link href="/signup">
                <Button className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 h-auto">
                  Create Account
                </Button>
              </Link>
              <Link href="/home">
                <Button variant="outline" className="border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-white px-6 py-3 h-auto">
                  Explore Recipes
                </Button>
              </Link>
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
          <div className="text-sm text-center">
            <p>© 2024 <a href="https://marcdejesusdev.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-amber-300">Marc De Jesus</a>. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default RecipeSocialLanding;