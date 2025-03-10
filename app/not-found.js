import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChefHat } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Simple Header */}
      <header className="bg-white shadow-sm py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <ChefHat className="h-8 w-8 text-amber-500" />
            <h1 className="text-2xl font-bold text-gray-900">RecipeShare</h1>
          </Link>
        </div>
      </header>
      
      {/* Not Found Content */}
      <main className="flex-grow flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100 py-16">
        <div className="text-center px-4">
          <div className="mb-8 inline-block">
            <div className="relative">
              <ChefHat className="h-24 w-24 text-amber-500 mx-auto" />
              <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-md">
                <span className="text-xl font-bold text-gray-900">404</span>
              </div>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Recipe Not Found</h1>
          <p className="text-lg text-gray-700 mb-8 max-w-md mx-auto">
            Oops! It seems this culinary creation has gone missing from our kitchen.
          </p>
          
          <div className="space-y-4">
            <Link href="/">
              <Button className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 h-auto">
                Back to Home
              </Button>
            </Link>
            <div className="pt-2">
              <Link href="/recipes" className="text-amber-600 hover:text-amber-700 font-medium">
                Browse Popular Recipes
              </Link>
            </div>
          </div>
        </div>
      </main>
      
      {/* Simple Footer */}
      <footer className="bg-gray-900 text-gray-300 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>© 2025 RecipeShare. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}