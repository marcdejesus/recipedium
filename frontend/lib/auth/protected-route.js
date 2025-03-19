'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './auth-context';

/**
 * Higher-order component for protecting routes that require authentication
 * 
 * @param {React.ComponentType} Component - The component to protect
 * @returns {React.FC} - Protected component
 */
export const withAuth = (Component) => {
  const ProtectedRoute = (props) => {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      // If not loading and no user, redirect to login
      if (!loading && !user) {
        router.replace('/login');
      }
    }, [loading, user, router]);

    // Don't render anything while checking authentication
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      );
    }

    // If user is authenticated, render the component
    return user ? <Component {...props} /> : null;
  };

  return ProtectedRoute;
};

/**
 * Hook for redirecting unauthenticated users
 * 
 * @param {string} redirectTo - Path to redirect to if not authenticated
 */
export const useProtectedRoute = (redirectTo = '/login') => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace(redirectTo);
    }
  }, [user, loading, router, redirectTo]);

  return { user, loading };
}; 