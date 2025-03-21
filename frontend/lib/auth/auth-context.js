'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import apiClient from '@/lib/api/client';
import { useRouter } from 'next/router';

// Create the authentication context
const AuthContext = createContext({
  user: null,
  token: null,
  loading: true,
  isAuthenticated: false,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  error: null,
  updateUser: (userData) => {},
});

/**
 * AuthProvider component for managing authentication state
 * 
 * @param {Object} props - Component props
 * @returns {JSX.Element} - Authentication provider
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  // Initialize auth state on app load
  useEffect(() => {
    initAuth(setUser, setToken, setIsAuthenticated, setLoading);
  }, []);

  /**
   * Register a new user
   * 
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} - Registration result
   */
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Call the register API
      const result = await apiClient.auth.register(userData);
      
      // Store the token
      if (result && result.token) {
        localStorage.setItem('authToken', result.token);
        setToken(result.token);
        
        // Set user from registration response
        if (result.user) {
          setUser(result.user);
          setIsAuthenticated(true);
          console.log('User registered successfully:', result.user);
        } else {
          // If user not in response, fetch it
          const userData = await apiClient.auth.getCurrentUser();
          if (userData && (userData.user || userData._id)) {
            const user = userData.user || userData;
            setUser(user);
            setIsAuthenticated(true);
            console.log('User data retrieved after registration:', user);
          } else {
            throw new Error('Failed to get user data after registration');
          }
        }

        return { success: true };
      } else {
        throw new Error('Registration failed: No token received');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed. Please try again.');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Log in a user
   * 
   * @param {Object} credentials - User login credentials
   * @returns {Promise<Object>} - Login result
   */
  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      
      // Call the login API
      const result = await apiClient.auth.login(credentials);
      
      // Check if we have a token in the response
      if (!result || !result.token) {
        throw new Error('No token received from server');
      }
      
      // Store the token in localStorage for persistence
      localStorage.setItem('authToken', result.token);
      
      // Update state
      setToken(result.token);
      
      // Set the user if available in the response
      if (result.user) {
        setUser(result.user);
        setIsAuthenticated(true);
        console.log('User logged in successfully:', result.user);
      } else {
        // If user data not in the login response, fetch it
        const userData = await apiClient.auth.getCurrentUser();
        if (userData && (userData.user || userData._id)) {
          const user = userData.user || userData;
          setUser(user);
          setIsAuthenticated(true);
          console.log('User data retrieved after login:', user);
        } else {
          throw new Error('Failed to get user data after login');
        }
      }
      
      return { success: true };
    } catch (err) {
      console.error('Login error:', err);
      localStorage.removeItem('authToken');
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      setError(err.message || 'Login failed. Please check your credentials.');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Log out the current user
   */
  const logout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    router.push('/login');
  };

  // Update user data in context
  const updateUser = (userData) => {
    setUser(userData);
  };

  // Update auth context value
  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook for using the authentication context
 * 
 * @returns {Object} - Authentication context value
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

// Initialize auth state on app load
export function initAuth(setUser, setToken, setIsAuthenticated, setLoading) {
  setLoading(true);
  
  const token = localStorage.getItem('authToken');
  console.log('Auth init - token exists:', !!token);
  
  if (!token) {
    console.log('No token found, auth initialization complete');
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    setLoading(false);
    return;
  }
  
  // Token exists, validate with backend
  apiClient.auth.getCurrentUser()
    .then(userData => {
      if (userData && (userData.user || userData._id)) {
        // Handle both formats - either data with user property or direct user object
        const user = userData.user || userData;
        console.log('Auth initialized successfully, user:', user);
        setUser(user);
        setToken(token);
        setIsAuthenticated(true);
      } else {
        console.error('Auth init failed - invalid user data:', userData);
        localStorage.removeItem('authToken');
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
      }
    })
    .catch(err => {
      console.error('Auth init error:', err);
      localStorage.removeItem('authToken');
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
    })
    .finally(() => {
      setLoading(false);
    });
} 