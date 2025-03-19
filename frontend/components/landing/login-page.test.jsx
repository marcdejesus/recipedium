import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from './login-page';
import { useAuth } from '@/lib/auth/auth-context';
import { useRouter } from 'next/navigation';

// Mock the auth context
jest.mock('@/lib/auth/auth-context', () => ({
  useAuth: jest.fn()
}));

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}));

describe('LoginPage Component', () => {
  // Setup common mocks
  const mockLogin = jest.fn();
  const mockRouter = { push: jest.fn() };
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default auth mock implementation
    useAuth.mockReturnValue({
      login: mockLogin,
      loading: false
    });
    
    // Default router mock implementation
    useRouter.mockReturnValue(mockRouter);
  });

  it('renders login form correctly', () => {
    render(<LoginPage />);
    
    // Check for form elements
    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/remember me/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    
    // Check for links
    expect(screen.getByRole('link', { name: /sign up/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /forgot password/i })).toBeInTheDocument();
  });

  it('handles form input changes', async () => {
    render(<LoginPage />);
    
    const user = userEvent.setup();
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const rememberMeCheckbox = screen.getByLabelText(/remember me/i);
    
    // Type in email and password
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    
    // Click remember me checkbox
    await user.click(rememberMeCheckbox);
    
    // Verify input values
    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
    expect(rememberMeCheckbox).toBeChecked();
  });

  it('submits the form with correct credentials', async () => {
    render(<LoginPage />);
    
    const user = userEvent.setup();
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    // Fill in form
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    
    // Submit form
    await user.click(submitButton);
    
    // Check if login was called with correct credentials
    expect(mockLogin).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    });
    
    // Should redirect to home page on successful login
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/home');
    });
  });

  it('shows error when form is submitted with empty fields', async () => {
    render(<LoginPage />);
    
    const user = userEvent.setup();
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    // Submit empty form
    await user.click(submitButton);
    
    // Should show validation error
    expect(screen.getByText(/please enter both email and password/i)).toBeInTheDocument();
    
    // Login should not be called
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('shows error message when login fails', async () => {
    // Setup mock to simulate login failure
    const errorMessage = 'Invalid credentials';
    mockLogin.mockRejectedValueOnce(new Error(errorMessage));
    
    render(<LoginPage />);
    
    const user = userEvent.setup();
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    // Fill in form
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    
    // Submit form
    await user.click(submitButton);
    
    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('disables form elements during submission', async () => {
    // Setup mock to delay login resolution
    mockLogin.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(<LoginPage />);
    
    const user = userEvent.setup();
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const rememberMeCheckbox = screen.getByLabelText(/remember me/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    // Fill in form
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    
    // Submit form
    await user.click(submitButton);
    
    // Form elements should be disabled during submission
    expect(emailInput).toBeDisabled();
    expect(passwordInput).toBeDisabled();
    expect(rememberMeCheckbox).toBeDisabled();
    expect(submitButton).toBeDisabled();
    
    // Button text should indicate loading
    expect(screen.getByText(/signing in/i)).toBeInTheDocument();
    
    // After submission completes, form should be enabled again
    await waitFor(() => {
      expect(screen.getByText(/sign in/i)).toBeInTheDocument();
      expect(emailInput).not.toBeDisabled();
    });
  });

  it('navigates to signup page when signup link is clicked', async () => {
    render(<LoginPage />);
    
    const user = userEvent.setup();
    const signupLink = screen.getByRole('link', { name: /sign up/i });
    
    // Click signup link
    await user.click(signupLink);
    
    // Link should have the correct href
    expect(signupLink).toHaveAttribute('href', '/signup');
  });
}); 