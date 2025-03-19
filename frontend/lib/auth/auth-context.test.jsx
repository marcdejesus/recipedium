import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from './auth-context';
import apiClient from '@/lib/api/client';

// Mock the API client
jest.mock('@/lib/api/client', () => ({
  auth: {
    login: jest.fn(),
    register: jest.fn(),
    getCurrentUser: jest.fn()
  }
}));

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value;
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Test component that uses the auth context
const TestComponent = () => {
  const { user, token, loading, login, register, logout, error } = useAuth();
  
  return (
    <div>
      <div data-testid="loading">{loading.toString()}</div>
      <div data-testid="user">{JSON.stringify(user)}</div>
      <div data-testid="token">{token || 'no-token'}</div>
      <div data-testid="error">{error || 'no-error'}</div>
      <button onClick={() => login({ email: 'test@example.com', password: 'password' })}>Login</button>
      <button onClick={() => register({ name: 'Test User', email: 'test@example.com', password: 'password' })}>Register</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  it('provides initial auth state', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Initially loading should be true
    expect(screen.getByTestId('loading').textContent).toBe('true');
    
    // After initialization loading should be false
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
    
    // Initial state with no user or token
    expect(screen.getByTestId('user').textContent).toBe('null');
    expect(screen.getByTestId('token').textContent).toBe('no-token');
    expect(screen.getByTestId('error').textContent).toBe('no-error');
  });

  it('loads user from localStorage token on initialization', async () => {
    // Setup stored token
    localStorageMock.getItem.mockReturnValueOnce('fake-token');
    
    // Setup API response
    const mockUser = { _id: '123', name: 'Test User', email: 'test@example.com' };
    apiClient.auth.getCurrentUser.mockResolvedValueOnce({ data: mockUser });
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // After initialization, user data should be loaded
    await waitFor(() => {
      expect(screen.getByTestId('token').textContent).toBe('fake-token');
      expect(screen.getByTestId('user').textContent).toBe(JSON.stringify(mockUser));
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
    
    // Verify API call was made with token
    expect(apiClient.auth.getCurrentUser).toHaveBeenCalledTimes(1);
  });

  it('handles login successfully', async () => {
    // Setup API response for login
    const mockLoginResponse = { token: 'new-token' };
    apiClient.auth.login.mockResolvedValueOnce(mockLoginResponse);
    
    // Setup API response for getCurrentUser after login
    const mockUser = { _id: '123', name: 'Test User', email: 'test@example.com' };
    apiClient.auth.getCurrentUser.mockResolvedValueOnce({ data: mockUser });
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
    
    // Perform login
    const user = userEvent.setup();
    await user.click(screen.getByText('Login'));
    
    // Verify login API call
    expect(apiClient.auth.login).toHaveBeenCalledWith({ 
      email: 'test@example.com', 
      password: 'password' 
    });
    
    // Should show loading while logging in
    expect(screen.getByTestId('loading').textContent).toBe('true');
    
    // After login completes, state should be updated
    await waitFor(() => {
      expect(screen.getByTestId('token').textContent).toBe('new-token');
      expect(screen.getByTestId('user').textContent).toBe(JSON.stringify(mockUser));
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
    
    // Verify localStorage was updated
    expect(localStorageMock.setItem).toHaveBeenCalledWith('authToken', 'new-token');
  });

  it('handles login errors', async () => {
    // Setup API to throw an error
    const errorMessage = 'Invalid credentials';
    apiClient.auth.login.mockRejectedValueOnce(new Error(errorMessage));
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
    
    // Perform login that will fail
    const user = userEvent.setup();
    await user.click(screen.getByText('Login'));
    
    // After error, error state should be updated
    await waitFor(() => {
      expect(screen.getByTestId('error').textContent).toBe(errorMessage);
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
    
    // User and token should still be null
    expect(screen.getByTestId('user').textContent).toBe('null');
    expect(screen.getByTestId('token').textContent).toBe('no-token');
  });

  it('handles registration successfully', async () => {
    // Setup API response for register
    const mockRegisterResponse = { token: 'register-token' };
    apiClient.auth.register.mockResolvedValueOnce(mockRegisterResponse);
    
    // Setup API response for getCurrentUser after registration
    const mockUser = { _id: '123', name: 'Test User', email: 'test@example.com' };
    apiClient.auth.getCurrentUser.mockResolvedValueOnce({ data: mockUser });
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
    
    // Perform registration
    const user = userEvent.setup();
    await user.click(screen.getByText('Register'));
    
    // Verify register API call
    expect(apiClient.auth.register).toHaveBeenCalledWith({ 
      name: 'Test User',
      email: 'test@example.com', 
      password: 'password' 
    });
    
    // After registration completes, state should be updated
    await waitFor(() => {
      expect(screen.getByTestId('token').textContent).toBe('register-token');
      expect(screen.getByTestId('user').textContent).toBe(JSON.stringify(mockUser));
    });
    
    // Verify localStorage was updated
    expect(localStorageMock.setItem).toHaveBeenCalledWith('authToken', 'register-token');
  });

  it('handles logout correctly', async () => {
    // Setup initial authenticated state
    localStorageMock.getItem.mockReturnValueOnce('existing-token');
    const mockUser = { _id: '123', name: 'Test User', email: 'test@example.com' };
    apiClient.auth.getCurrentUser.mockResolvedValueOnce({ data: mockUser });
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Wait for initial auth state to be loaded
    await waitFor(() => {
      expect(screen.getByTestId('token').textContent).toBe('existing-token');
      expect(screen.getByTestId('user').textContent).toBe(JSON.stringify(mockUser));
    });
    
    // Perform logout
    const user = userEvent.setup();
    await user.click(screen.getByText('Logout'));
    
    // After logout, state should be reset
    expect(screen.getByTestId('user').textContent).toBe('null');
    expect(screen.getByTestId('token').textContent).toBe('no-token');
    
    // Verify localStorage item was removed
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('authToken');
  });

  it('handles expired or invalid tokens', async () => {
    // Setup stored token
    localStorageMock.getItem.mockReturnValueOnce('invalid-token');
    
    // Setup API to throw an error for invalid token
    apiClient.auth.getCurrentUser.mockRejectedValueOnce(new Error('Invalid token'));
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // After initialization with invalid token
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
      expect(screen.getByTestId('user').textContent).toBe('null');
      expect(screen.getByTestId('token').textContent).toBe('no-token');
      expect(screen.getByTestId('error').textContent).toBe('Session expired. Please log in again.');
    });
    
    // Verify localStorage token was removed
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('authToken');
  });
}); 