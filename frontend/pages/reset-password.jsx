import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChefHat } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/lib/auth/auth-context';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const router = useRouter();
  const { resetPassword } = useAuth();
  
  // Extract the token from the URL query parameters
  useEffect(() => {
    if (router.query.token) {
      setToken(router.query.token);
    }
  }, [router.query]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      setError('Please enter both password and confirmation');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    if (!token) {
      setError('Reset token is missing. Please use the link from the email.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      
      // Call the resetPassword method from auth context
      const result = await resetPassword(token, password);
      
      if (result.success) {
        // Show success message
        setSuccess(true);
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setError(result.error || 'Failed to reset password. Please try again or request a new reset link.');
      }
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please try again or request a new reset link.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mb-6 flex flex-col items-center">
          <ChefHat className="h-8 w-8 text-amber-500 mb-2" />
          <h1 className="text-2xl font-bold text-gray-900">
            Set your new password
          </h1>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="shadow-md border-0">
          <CardHeader>
            <CardTitle className="text-xl text-center">Reset Password</CardTitle>
            <CardDescription className="text-center">
              Please enter your new password
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
            
            {success ? (
              <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                <p className="font-medium">Password reset successful!</p>
                <p className="mt-1">Your password has been changed. You will be redirected to the login page shortly.</p>
              </div>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <Label htmlFor="password">New Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1"
                    required
                    disabled={isLoading}
                    minLength={8}
                  />
                </div>
                
                <div>
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mt-1"
                    required
                    disabled={isLoading}
                    minLength={8}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-amber-500 hover:bg-amber-600"
                  disabled={isLoading || !token}
                >
                  {isLoading ? 'Processing...' : 'Reset Password'}
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter className="flex justify-center border-t pt-6">
            <div className="text-sm text-gray-600">
              <Link href="/login" className="font-medium text-amber-500 hover:text-amber-400">
                Back to login
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 