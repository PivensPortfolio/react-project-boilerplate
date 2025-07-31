/**
 * Protected Route Component
 * Renders children only if user is authenticated, otherwise redirects to login
 */

import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ComponentType;
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  fallback: FallbackComponent,
  redirectTo = '/login',
}) => {
  const location = useLocation();
  const { user, isAuthenticated, setUser, clearAuth } = useAuthStore();

  useEffect(() => {
    // Check authentication status on mount
    const checkAuth = async () => {
      if (authService.isAuthenticated()) {
        // If we have a valid token but no user in store, get user info
        if (!user) {
          try {
            const currentUser = await authService.getCurrentUser();
            setUser(currentUser);
          } catch (error) {
            console.error('Failed to get current user:', error);
            clearAuth();
          }
        }
      } else {
        // Clear auth state if token is invalid
        clearAuth();
      }
    };

    checkAuth();
  }, [user, setUser, clearAuth]);

  // Check authentication status
  const isAuthenticatedByService = authService.isAuthenticated();
  
  // Show loading state while checking authentication
  if (isAuthenticatedByService && !user) {
    if (FallbackComponent) {
      return <FallbackComponent />;
    }
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading...</span>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticatedByService && !isAuthenticated) {
    return (
      <Navigate
        to={redirectTo}
        state={{ from: location }}
        replace
      />
    );
  }

  // Render protected content
  return <>{children}</>;
};

export default ProtectedRoute;