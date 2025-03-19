'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import apiClient from '@/lib/api/client';

// Create the authentication context
const AuthContext = createContext({
  user: null,
  token: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  error: null,
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

  // Initialize auth state from localStorage on component mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check if we have a token in localStorage
        const storedToken = localStorage.getItem('authToken');
        
        if (!storedToken) {
          setLoading(false);
          return;
        }

        // Set token state
        setToken(storedToken);
        
        try {
          // Fetch user data with the token
          const userData = await apiClient.auth.getCurrentUser();
          
          if (userData && userData.user) {
            setUser(userData.user);
          } else if (userData && userData.data) {
            setUser(userData.data);
          } else if (userData && typeof userData === 'object' && userData._id) {
            // If userData is an object with _id, it's likely the user object itself
            setUser(userData);
            console.log('Setting user directly from response:', userData);
          } else {
            console.warn('User data not found in response:', userData);
            // If no user data, consider token invalid
            localStorage.removeItem('authToken');
            setToken(null);
          }
        } catch (apiError) {
          console.error('API error during auth initialization:', apiError);
          // Clear token on auth error (e.g. 401 Unauthorized)
          localStorage.removeItem('authToken');
          setToken(null);
          setUser(null);
          
          if (apiError.message.includes('token') || apiError.message.includes('authorization')) {
            setError('Session expired. Please log in again.');
          } else {
            setError('Error connecting to server. Please try again later.');
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        // If there's an error, clear potentially invalid token
        localStorage.removeItem('authToken');
        setToken(null);
        setUser(null);
        setError('Session expired. Please log in again.');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
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
      localStorage.setItem('authToken', result.token);
      setToken(result.token);
      
      // Fetch the user data
      const userResponse = await apiClient.auth.getCurrentUser();
      setUser(userResponse.data);
      
      return result;
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
      throw err;
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
        throw new Error('Invalid response received from server. Please try again.');
      }
      
      // Store the token
      localStorage.setItem('authToken', result.token);
      setToken(result.token);
      
      // Set user directly from the login response if available
      if (result.user) {
        setUser(result.user);
      } else {
        try {
          // Fallback: Fetch the user data if not provided in login response
          const userResponse = await apiClient.auth.getCurrentUser();
          if (userResponse && userResponse.user) {
            setUser(userResponse.user);
          } else if (userResponse && userResponse.data) {
            setUser(userResponse.data);
          } else if (userResponse) {
            // If userResponse is an object but doesn't have user or data property,
            // it might be the user object itself
            setUser(userResponse);
          } else {
            console.warn('User data not found in response:', userResponse);
          }
        } catch (userError) {
          console.error('Error fetching user data:', userError);
          // Continue with login flow even if user fetch fails
        }
      }
      
      return result;
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please check your credentials.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Log out the current user
   */
  const logout = () => {
    // Clear token from localStorage
    localStorage.removeItem('authToken');
    
    // Reset state
    setToken(null);
    setUser(null);
  };

  // Context value with auth state and methods
  const contextValue = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    error,
  };

  return (
    <AuthContext.Provider value={contextValue}>
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