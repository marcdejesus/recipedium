import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import SignupPage from '@/components/landing/signup-page';
import { useAuth } from '@/lib/auth/auth-context';

export default function Signup() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If user is already logged in, redirect to home
    if (!loading && user) {
      router.push('/home');
    }
  }, [user, loading, router]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  // Only show signup page if not logged in
  return <SignupPage />;
} 