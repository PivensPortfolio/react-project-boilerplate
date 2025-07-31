/**
 * Authentication Provider
 * Provides authentication context and handles auth state synchronization
 */

import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useAuth, UseAuthReturn } from '../../hooks/useAuth';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';

interface AuthProviderProps {
  children: ReactNode;
}

// Create auth context
const AuthContext = createContext<UseAuthReturn | null>(null);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const auth = useAuth();
  const { setUser, clearAuth } = useAuthStore();

  useEffect(() => {
    // Initialize auth state on app start
    const initializeAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          // Get user info from token or API
          const tokenUser = authService.getCurrentUserFromToken();
          if (tokenUser) {
            // Convert token payload to User object and get full user data
            try {
              const fullUser = await authService.getCurrentUser();
              setUser(fullUser);
            } catch (error) {
              // If API call fails, use token data
              console.warn('Failed to get full user data, using token data:', error);
              setUser({
                id: tokenUser.sub,
                email: tokenUser.email,
                role: tokenUser.role as 'admin' | 'user' | 'moderator',
                name: '', // Will be updated when API is available
                avatar: undefined,
                isActive: true,
                emailVerified: true,
                createdAt: '',
                updatedAt: '',
              });
            }
          }
        } else {
          clearAuth();
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        clearAuth();
      }
    };

    initializeAuth();
  }, [setUser, clearAuth]);

  // Set up auth event listeners
  useEffect(() => {
    const handleAuthLogin = (event: CustomEvent) => {
      const { user } = event.detail;
      setUser(user);
    };

    const handleAuthLogout = () => {
      clearAuth();
    };

    const handleTokenRefresh = (event: CustomEvent) => {
      const { user } = event.detail;
      setUser(user);
    };

    const handleAuthRegister = (event: CustomEvent) => {
      const { user } = event.detail;
      setUser(user);
    };

    // Add event listeners
    window.addEventListener('auth:login', handleAuthLogin as EventListener);
    window.addEventListener('auth:logout', handleAuthLogout);
    window.addEventListener('auth:token-refreshed', handleTokenRefresh as EventListener);
    window.addEventListener('auth:register', handleAuthRegister as EventListener);

    // Cleanup
    return () => {
      window.removeEventListener('auth:login', handleAuthLogin as EventListener);
      window.removeEventListener('auth:logout', handleAuthLogout);
      window.removeEventListener('auth:token-refreshed', handleTokenRefresh as EventListener);
      window.removeEventListener('auth:register', handleAuthRegister as EventListener);
    };
  }, [setUser, clearAuth]);

  // Handle automatic logout on token expiration
  useEffect(() => {
    const handleTokenExpiration = () => {
      if (!authService.isAuthenticated()) {
        clearAuth();
      }
    };

    // Check token validity every minute
    const interval = setInterval(handleTokenExpiration, 60 * 1000);

    return () => clearInterval(interval);
  }, [clearAuth]);

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuthContext = (): UseAuthReturn => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

export default AuthProvider;