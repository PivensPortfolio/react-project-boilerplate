/**
 * Authentication Hook
 * Custom hook for managing authentication state and actions
 */

import { useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/authStore';
import { useToast } from './useToast';
import type { LoginRequest, User } from '../services/types';

export interface UseAuthReturn {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: { name: string; email: string; password: string }) => Promise<void>;
  refreshToken: () => Promise<void>;
  checkAuth: () => Promise<void>;
  
  // Role checking
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  isAdmin: () => boolean;
  
  // Utility
  redirectAfterLogin: () => void;
}

export const useAuth = (): UseAuthReturn => {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  
  const {
    user,
    isAuthenticated,
    isLoading,
    setUser,
    clearAuth,
    setLoading,
    updateLastActivity,
  } = useAuthStore();

  // Login function
  const login = useCallback(async (credentials: LoginRequest) => {
    try {
      setLoading(true);
      const response = await authService.login(credentials);
      setUser(response.user);
      
      toast.success('Login successful!');
      
      // Redirect to intended page or dashboard
      redirectAfterLogin();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setUser, toast]);

  // Logout function
  const logout = useCallback(async () => {
    try {
      setLoading(true);
      await authService.logout();
      clearAuth();
      
      toast.success('Logged out successfully');
      navigate('/login', { replace: true });
    } catch (error) {
      // Even if logout API fails, clear local state
      clearAuth();
      navigate('/login', { replace: true });
      
      const message = error instanceof Error ? error.message : 'Logout failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [setLoading, clearAuth, navigate, toast]);

  // Register function
  const register = useCallback(async (userData: { name: string; email: string; password: string }) => {
    try {
      setLoading(true);
      const response = await authService.register(userData);
      setUser(response.user);
      
      toast.success('Registration successful!');
      
      // Redirect to dashboard or intended page
      redirectAfterLogin();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setUser, toast]);

  // Refresh token function
  const refreshToken = useCallback(async () => {
    try {
      const response = await authService.refreshToken();
      setUser(response.user);
      updateLastActivity();
    } catch (error) {
      // If refresh fails, logout user
      clearAuth();
      navigate('/login', { replace: true });
      throw error;
    }
  }, [setUser, updateLastActivity, clearAuth, navigate]);

  // Check authentication status
  const checkAuth = useCallback(async () => {
    try {
      if (authService.isAuthenticated()) {
        // If we have a valid token but no user in store, get user info
        if (!user) {
          setLoading(true);
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
        }
        updateLastActivity();
      } else {
        // Clear auth state if token is invalid
        clearAuth();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      clearAuth();
    } finally {
      setLoading(false);
    }
  }, [user, setUser, setLoading, clearAuth, updateLastActivity]);

  // Role checking functions
  const hasRole = useCallback((role: string): boolean => {
    return authService.hasRole(role);
  }, []);

  const hasAnyRole = useCallback((roles: string[]): boolean => {
    return authService.hasAnyRole(roles);
  }, []);

  const isAdmin = useCallback((): boolean => {
    return authService.isAdmin();
  }, []);

  // Redirect after successful login
  const redirectAfterLogin = useCallback(() => {
    const from = (location.state as any)?.from?.pathname || '/dashboard';
    navigate(from, { replace: true });
  }, [location.state, navigate]);

  // Check auth status on mount and when dependencies change
  useEffect(() => {
    checkAuth();
  }, []);

  // Set up automatic token refresh
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkTokenRefresh = () => {
      if (authService.shouldRefreshToken()) {
        refreshToken().catch(console.error);
      }
    };

    // Check token refresh every 5 minutes
    const interval = setInterval(checkTokenRefresh, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated, refreshToken]);

  // Listen for auth events from other tabs
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'auth-store') {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [checkAuth]);

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    
    // Actions
    login,
    logout,
    register,
    refreshToken,
    checkAuth,
    
    // Role checking
    hasRole,
    hasAnyRole,
    isAdmin,
    
    // Utility
    redirectAfterLogin,
  };
};

export default useAuth;