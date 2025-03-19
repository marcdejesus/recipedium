import React from 'react';
import { AuthProvider } from '@/lib/auth/auth-context';
import { Navbar } from '@/components/navigation/navbar';
import '../styles/globals.css';

export default function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col antialiased">
        <Navbar />
        <main className="flex-1">
          <Component {...pageProps} />
        </main>
      </div>
    </AuthProvider>
  );
} 