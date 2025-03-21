import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { useAuth } from '@/lib/auth/auth-context';

// Dynamically import the RecipeSocialLanding component with no SSR
// This ensures it only loads on the client side, avoiding server fetch issues
const RecipeSocialLanding = dynamic(
  () => import('@/components/landing/recipe-social-landing'),
  { ssr: false }
);

export default function Landing() {
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

  // Only show landing page if not logged in
  return (
    <>
      <Head>
        <title>Recipedium - Share Your Recipes with the World</title>
        <meta
          name="description"
          content="Discover and share recipes with food enthusiasts from around the world. Join our community today."
        />
      </Head>
      <RecipeSocialLanding />
    </>
  );
} 