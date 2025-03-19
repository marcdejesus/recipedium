import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  ChefHat, 
  LogOut, 
  User, 
  PlusCircle, 
  Heart, 
  Home, 
  Search, 
  BookOpen,
  Menu,
  X,
  Settings
} from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function Navbar() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Debug user state in the navbar
  useEffect(() => {
    console.log('Navbar user state:', user);
  }, [user]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!user || !user.name) return 'U';
    return user.name
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Default avatar URL
  const defaultAvatarUrl = 'https://api.dicebear.com/7.x/avataaars/svg';

  // Determine if user is authenticated for UI rendering
  const isAuthenticated = !!user && typeof user === 'object' && !!user._id;

  return (
    <nav className="border-b bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link href={isAuthenticated ? '/home' : '/'} className="flex items-center gap-2">
              <ChefHat className="h-6 w-6 text-amber-500" />
              <span className="text-xl font-bold">RecipeShare</span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center gap-1">
            {isAuthenticated ? (
              <>
                <Link href="/home" passHref>
                  <Button variant="ghost" size="sm" className={router.pathname === '/home' ? 'bg-amber-50 text-amber-700' : ''}>
                    <Home className="mr-2 h-4 w-4" />
                    Home
                  </Button>
                </Link>
                
                <Link href="/recipes/search" passHref>
                  <Button variant="ghost" size="sm" className={router.pathname === '/recipes/search' ? 'bg-amber-50 text-amber-700' : ''}>
                    <Search className="mr-2 h-4 w-4" />
                    Discover
                  </Button>
                </Link>
                
                <Link href={`/recipes/user/${user._id}`} passHref>
                  <Button variant="ghost" size="sm" className={router.pathname.startsWith('/recipes/user') ? 'bg-amber-50 text-amber-700' : ''}>
                    <BookOpen className="mr-2 h-4 w-4" />
                    My Recipes
                  </Button>
                </Link>
                
                <Link href="/favorites" passHref>
                  <Button variant="ghost" size="sm" className={router.pathname === '/favorites' ? 'bg-amber-50 text-amber-700' : ''}>
                    <Heart className="mr-2 h-4 w-4" />
                    Favorites
                  </Button>
                </Link>
                
                <div className="mx-2 h-6 border-l border-gray-200"></div>
                
                <div className="relative group">
                  <Button variant="ghost" size="sm" className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={user.profileImage || defaultAvatarUrl} alt={user.name || "User"} />
                      <AvatarFallback className="bg-amber-100 text-amber-800 text-xs">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="max-w-[100px] truncate">
                      {user.name || 'User'}
                    </span>
                  </Button>
                  
                  <div className="absolute right-0 top-full mt-1 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none hidden group-hover:block z-10">
                    <Link href="/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <User className="mr-2 h-4 w-4" />
                      Your Profile
                    </Link>
                    <Link href="/settings" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="flex w-full items-center text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                </div>
                
                <Link href="/recipes/create" passHref>
                  <Button size="sm" className="bg-amber-500 hover:bg-amber-600 ml-2">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Recipe
                  </Button>
                </Link>
              </>
            ) : loading ? (
              <div className="flex items-center text-sm text-gray-500">
                Loading...
              </div>
            ) : (
              <>
                <Link href="/login" passHref>
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/signup" passHref>
                  <Button size="sm" className="bg-amber-500 hover:bg-amber-600">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              className="p-1"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t">
          {isAuthenticated ? (
            <>
              <div className="px-3 py-2 border-b border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.profileImage || defaultAvatarUrl} alt={user.name || "User"} />
                    <AvatarFallback className="bg-amber-100 text-amber-800">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{user.name || 'User'}</span>
                </div>
              </div>
              
              <Link href="/home" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100">
                <div className="flex items-center gap-2">
                  <Home className="h-5 w-5" />
                  <span>Home</span>
                </div>
              </Link>
              
              <Link href="/recipes/search" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100">
                <div className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  <span>Discover</span>
                </div>
              </Link>
              
              <Link href={`/recipes/user/${user._id}`} className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  <span>My Recipes</span>
                </div>
              </Link>
              
              <Link href="/favorites" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100">
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  <span>Favorites</span>
                </div>
              </Link>
              
              <Link href="/recipes/create" className="block px-3 py-2 rounded-md text-base font-medium text-white bg-amber-500 hover:bg-amber-600">
                <div className="flex items-center gap-2">
                  <PlusCircle className="h-5 w-5" />
                  <span>Add Recipe</span>
                </div>
              </Link>
              
              <Link href="/profile" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  <span>Your Profile</span>
                </div>
              </Link>
              
              <button 
                onClick={handleLogout}
                className="block w-full px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-gray-100 text-left"
              >
                <div className="flex items-center gap-2">
                  <LogOut className="h-5 w-5" />
                  <span>Sign out</span>
                </div>
              </button>
            </>
          ) : loading ? (
            <div className="px-3 py-2 text-gray-500">
              Loading...
            </div>
          ) : (
            <>
              <Link href="/login" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100">
                Login
              </Link>
              <Link href="/signup" className="block px-3 py-2 rounded-md text-base font-medium text-white bg-amber-500 hover:bg-amber-600">
                Sign Up
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
} 