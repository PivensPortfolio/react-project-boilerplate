/**
 * Role Guard Component
 * Renders children only if user has required role(s)
 */

import React from 'react';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole?: string;
  requiredRoles?: string[];
  requireAll?: boolean; // If true, user must have ALL roles; if false, user needs ANY role
  fallback?: React.ComponentType<{ missingRoles: string[] }>;
  onUnauthorized?: (missingRoles: string[]) => void;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  requiredRole,
  requiredRoles = [],
  requireAll = false,
  fallback: FallbackComponent,
  onUnauthorized,
}) => {
  const { user } = useAuthStore();

  // Combine single role and multiple roles
  const rolesToCheck = requiredRole 
    ? [requiredRole, ...requiredRoles]
    : requiredRoles;

  if (rolesToCheck.length === 0) {
    console.warn('RoleGuard: No roles specified');
    return <>{children}</>;
  }

  // Check if user has required roles
  const hasRequiredRoles = () => {
    if (!user) {
      return false;
    }

    if (requireAll) {
      // User must have ALL specified roles
      return rolesToCheck.every(role => authService.hasRole(role));
    } else {
      // User must have ANY of the specified roles
      return rolesToCheck.some(role => authService.hasRole(role));
    }
  };

  const userHasAccess = hasRequiredRoles();

  if (!userHasAccess) {
    const userRoles = user?.role ? [user.role] : [];
    const missingRoles = rolesToCheck.filter(role => !userRoles.includes(role));

    // Call unauthorized callback if provided
    if (onUnauthorized) {
      onUnauthorized(missingRoles);
    }

    // Render fallback component if provided
    if (FallbackComponent) {
      return <FallbackComponent missingRoles={missingRoles} />;
    }

    // Default unauthorized message
    return (
      <div className="flex flex-col items-center justify-center min-h-64 p-8 text-center">
        <div className="mb-4">
          <svg
            className="w-16 h-16 text-red-500 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Access Denied
        </h2>
        <p className="text-gray-600 mb-4">
          You don't have permission to access this resource.
        </p>
        <div className="text-sm text-gray-500">
          <p>Required role{rolesToCheck.length > 1 ? 's' : ''}: {rolesToCheck.join(', ')}</p>
          <p>Your role: {user?.role || 'None'}</p>
        </div>
      </div>
    );
  }

  // User has required roles, render children
  return <>{children}</>;
};

export default RoleGuard;