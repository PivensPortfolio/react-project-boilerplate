/**
 * Authentication Components Export
 */

export { ProtectedRoute } from './ProtectedRoute';
export { RoleGuard } from './RoleGuard';
export { AuthProvider, useAuthContext } from './AuthProvider';
export { 
  withAuth, 
  withAuthRequired, 
  withAdminRequired, 
  withModeratorRequired, 
  withPublicAccess 
} from './withAuth';

export type { default as ProtectedRouteProps } from './ProtectedRoute';
export type { default as RoleGuardProps } from './RoleGuard';