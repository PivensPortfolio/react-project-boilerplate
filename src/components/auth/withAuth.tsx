/**
 * Higher-Order Component for Authentication
 * Wraps components with authentication and role-based access control
 */

import React from 'react';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleGuard } from './RoleGuard';

interface WithAuthOptions {
  requireAuth?: boolean;
  requiredRole?: string;
  requiredRoles?: string[];
  requireAll?: boolean;
  redirectTo?: string;
  fallback?: React.ComponentType;
  unauthorizedFallback?: React.ComponentType<{ missingRoles: string[] }>;
}

/**
 * HOC that adds authentication and role-based access control to a component
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: WithAuthOptions = {}
) {
  const {
    requireAuth = true,
    requiredRole,
    requiredRoles = [],
    requireAll = false,
    redirectTo = '/login',
    fallback,
    unauthorizedFallback,
  } = options;

  const WrappedComponent: React.FC<P> = (props) => {
    // If authentication is not required, render component directly
    if (!requireAuth) {
      return <Component {...props} />;
    }

    // If no roles are specified, just check authentication
    if (!requiredRole && requiredRoles.length === 0) {
      return (
        <ProtectedRoute redirectTo={redirectTo} fallback={fallback}>
          <Component {...props} />
        </ProtectedRoute>
      );
    }

    // Check both authentication and roles
    return (
      <ProtectedRoute redirectTo={redirectTo} fallback={fallback}>
        <RoleGuard
          requiredRole={requiredRole}
          requiredRoles={requiredRoles}
          requireAll={requireAll}
          fallback={unauthorizedFallback}
        >
          <Component {...props} />
        </RoleGuard>
      </ProtectedRoute>
    );
  };

  // Set display name for debugging
  WrappedComponent.displayName = `withAuth(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

/**
 * Convenience HOCs for common use cases
 */

// Require authentication only
export const withAuthRequired = <P extends object>(
  Component: React.ComponentType<P>,
  redirectTo?: string
) => withAuth(Component, { requireAuth: true, redirectTo });

// Require admin role
export const withAdminRequired = <P extends object>(
  Component: React.ComponentType<P>
) => withAuth(Component, { requireAuth: true, requiredRole: 'admin' });

// Require moderator or admin role
export const withModeratorRequired = <P extends object>(
  Component: React.ComponentType<P>
) => withAuth(Component, { 
  requireAuth: true, 
  requiredRoles: ['admin', 'moderator'],
  requireAll: false 
});

// Allow public access (no auth required)
export const withPublicAccess = <P extends object>(
  Component: React.ComponentType<P>
) => withAuth(Component, { requireAuth: false });

export default withAuth;