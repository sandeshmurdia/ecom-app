import React, { createContext, useContext, useState, useEffect } from 'react';
import attemptTracker from '../utils/attemptTracker';
import { useSnackbar } from './SnackbarContext';

// Create authentication context for managing user state
const AuthContext = createContext();

// Custom hook to use authentication context
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Authentication provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError } = useSnackbar();

  // Check for existing user session on app load
  useEffect(() => {
    const savedUser = localStorage.getItem('ecommerce_user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('ecommerce_user');
      }
    }
    setLoading(false);
  }, []);

  // Login function with realistic validation and error handling - implements fail/success pattern
  const login = async (email, password) => {
    let didShowError = false;
    try {
      setLoading(true);
      
      // Check if fail mode is enabled from navbar checkbox
      const failModeEnabled = attemptTracker.getFailMode();
      
      // Simulate API call delay for realistic UX
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Basic validation
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      
      if (!email.includes('@')) {
        throw new Error('Please enter a valid email address');
      }
      
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      // Generate error based on checkbox flag in navbar
      if (failModeEnabled) {
        // Make a real API call that will fail
        showError(`Login failed. Please try again.`);
        didShowError = true;
        
        // Make the API call that will fail
        await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        
        // If we reach here, the API call succeeded (which shouldn't happen), but we still want to fail
        throw new Error(`Login failed. Please try again.`);
      }

      // For demo purposes, accept any valid email/password combination
      // In a real app, this would be an API call to your backend
      const userData = {
        id: Date.now(),
        email,
        name: email.split('@')[0], // Use email prefix as name for demo
        createdAt: new Date().toISOString(),
      };

      // Save user data to localStorage for persistence
      localStorage.setItem('ecommerce_user', JSON.stringify(userData));
      
      setUser(userData);
      setIsAuthenticated(true);
      
      // Show success message only if we reach here (fail mode is disabled)
      showSuccess(`Login successful! Welcome back.`);
      
      return { success: true, user: userData };
    } catch (error) {
      // Reason: callers (e.g. `Login.jsx`) rely on `login()` rejecting on failure to prevent navigation.
      // We still show a snackbar for UX consistency, but only once in fail-mode paths.
      const message = error?.message || 'Login failed. Please try again.';
      if (!didShowError) {
        showError(message);
      }
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Signup function with comprehensive validation - implements fail/success pattern
  const signup = async (name, email, password, confirmPassword) => {
    try {
      setLoading(true);
      
      // Check if fail mode is enabled from navbar checkbox
      const failModeEnabled = attemptTracker.getFailMode();
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Comprehensive validation
      if (!name || !email || !password || !confirmPassword) {
        throw new Error('All fields are required');
      }
      
      if (name.length < 2) {
        throw new Error('Name must be at least 2 characters long');
      }
      
      if (!email.includes('@')) {
        throw new Error('Please enter a valid email address');
      }
      
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }
      
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }

      // Generate error based on checkbox flag in navbar
      if (failModeEnabled) {
        // Make a real API call that will fail
        showError(`Signup failed. Please try again.`);
        
        // Make the API call that will fail
        await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, confirmPassword })
        });
        
        // If we reach here, the API call succeeded (which shouldn't happen), but we still want to fail
        throw new Error(`Signup failed. Please try again.`);
      }

      // Check if user already exists (simulate database check)
      const existingUser = localStorage.getItem('ecommerce_user');
      if (existingUser) {
        const parsedUser = JSON.parse(existingUser);
        if (parsedUser.email === email) {
          throw new Error('User with this email already exists');
        }
      }

      // Create new user
      const userData = {
        id: Date.now(),
        name,
        email,
        createdAt: new Date().toISOString(),
      };

      // Save user data
      localStorage.setItem('ecommerce_user', JSON.stringify(userData));
      
      setUser(userData);
      setIsAuthenticated(true);
      
      // Show success message only if we reach here (fail mode is disabled)
      showSuccess(`Account created successfully! Welcome ${name}.`);
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function - implements fail/success pattern with streaming support
  const logout = async () => {
    // Check if fail mode is enabled from navbar checkbox
    const failModeEnabled = attemptTracker.getFailMode();
    
    // Generate error based on checkbox flag in navbar
    if (failModeEnabled) {
      // Make a real API call that will fail
      const errorMessage = `Failed to logout. Please try again.`;
      showError(errorMessage);
      
      // Make the API call that will fail
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      // If we reach here, the API call succeeded (which shouldn't happen), but we still want to fail
      throw new Error(errorMessage);
    }
    
    // Success - logout (only reaches here if fail mode is disabled)
    localStorage.removeItem('ecommerce_user');
    setUser(null);
    setIsAuthenticated(false);
    
    // Show success message
    showSuccess('Logged out successfully!');
  };

  // Context value object
  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    signup,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
