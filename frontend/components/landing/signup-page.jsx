'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ChefHat } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';

const SignupPage = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const router = useRouter();
  const { register } = useAuth();

  // Update the full name when first or last name changes
  const updateName = () => {
    const fullName = `${firstName} ${lastName}`.trim();
    setName(fullName);
  };
  
  const handleFirstNameChange = (e) => {
    setFirstName(e.target.value);
    updateName();
  };
  
  const handleLastNameChange = (e) => {
    setLastName(e.target.value);
    updateName();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!firstName || !lastName) {
      setError('Please enter your first and last name');
      return;
    }
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    if (!agreeTerms) {
      setError('You must agree to the terms and conditions');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      
      // Call the register method from auth context
      const result = await register({ 
        name: `${firstName} ${lastName}`,
        email,
        password
      });
      
      if (result.success) {
        // Redirect to home page on successful registration
        router.push('/home');
      } else {
        // Handle registration failure with specific message
        if (result.error?.includes('exists')) {
          setError('An account with this email already exists. Please try logging in instead.');
        } else {
          setError(result.error || 'Registration failed. Please try again.');
        }
      }
    } catch (err) {
      console.error('Signup form error:', err);
      
      // Provide more meaningful error messages based on the error type
      if (err.message?.includes('User already exists') || err.message?.includes('exists')) {
        setError('An account with this email already exists. Please try logging in instead.');
      } else if (err.message?.includes('Network') || err.message?.includes('fetch')) {
        setError('Unable to connect to the server. Please check your internet connection and try again.');
      } else if (err.message?.includes('validation') || err.message?.includes('valid')) {
        setError('Please check your information and try again. ' + err.message);
      } else {
        setError(err.message || 'Registration failed. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <ChefHat className="h-12 w-12 text-amber-500" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-amber-500 hover:text-amber-400">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="shadow-md border-0">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-2">
              <ChefHat className="h-12 w-12 text-amber-500" />
            </div>
            <CardTitle className="text-xl text-center">Join Recipedium</CardTitle>
            <CardDescription className="text-center">
              Create an account to start sharing your recipes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first-name">First name</Label>
                  <Input
                    id="first-name"
                    name="first-name"
                    type="text"
                    value={firstName}
                    onChange={handleFirstNameChange}
                    className="mt-1"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="last-name">Last name</Label>
                  <Input
                    id="last-name"
                    name="last-name"
                    type="text"
                    value={lastName}
                    onChange={handleLastNameChange}
                    className="mt-1"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1"
                  required
                  disabled={isLoading}
                />
                <p className="mt-1 text-xs text-gray-500">Must be at least 6 characters</p>
              </div>

              <div className="flex items-center">
                <Checkbox 
                  id="terms" 
                  required
                  checked={agreeTerms}
                  onCheckedChange={(checked) => setAgreeTerms(checked)}
                  disabled={isLoading}
                />
                <Label htmlFor="terms" className="ml-2 text-sm">
                  I agree to the{' '}
                  <Link href="/terms" className="text-amber-500 hover:text-amber-400">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-amber-500 hover:text-amber-400">
                    Privacy Policy
                  </Link>
                </Label>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-amber-500 hover:bg-amber-600"
                disabled={isLoading}
              >
                {isLoading ? 'Creating account...' : 'Create account'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t pt-6">
            <div className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-amber-500 hover:text-amber-400">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default SignupPage;