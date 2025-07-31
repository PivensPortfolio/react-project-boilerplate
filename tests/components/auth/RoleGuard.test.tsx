/**
 * Role Guard Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RoleGuard } from '../../../src/components/auth/RoleGuard';
import { authService } from '../../../src/services/authService';
import { useAuthStore } from '../../../src/store/authStore';

// Mock dependencies
vi.mock('../../../src/services/authService');
vi.mock('../../../src/store/authStore');

const mockAuthService = vi.mocked(authService);
const mockUseAuthStore = vi.mocked(useAuthStore);

// Test component
const TestComponent = () => <div>Protected Content</div>;

describe('RoleGuard', () => {
  const mockUser = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    role: 'user' as const,
    isActive: true,
    emailVerified: true,
    avatar: undefined,
    lastLoginAt: undefined,
    createdAt: '2023-01-01',
    updatedAt: '2023-01-01',
  };

  const mockAdminUser = {
    ...mockUser,
    role: 'admin' as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementations
    mockUseAuthStore.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      lastActivity: Date.now(),
      setUser: vi.fn(),
      clearAuth: vi.fn(),
      setLoading: vi.fn(),
      updateLastActivity: vi.fn(),
      checkAuthStatus: vi.fn(),
    });
    
    mockAuthService.hasRole.mockImplementation((role: string) => mockUser.role === role);
  });

  it('should render children when user has required role', () => {
    mockAuthService.hasRole.mockReturnValue(true);

    render(
      <RoleGuard requiredRole="user">
        <TestComponent />
      </RoleGuard>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should show access denied when user lacks required role', () => {
    mockAuthService.hasRole.mockReturnValue(false);

    render(
      <RoleGuard requiredRole="admin">
        <TestComponent />
      </RoleGuard>
    );

    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(screen.getByText("You don't have permission to access this resource.")).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should work with multiple roles (ANY logic)', () => {
    mockAuthService.hasRole.mockImplementation((role: string) => role === 'user');

    render(
      <RoleGuard requiredRoles={['admin', 'user']} requireAll={false}>
        <TestComponent />
      </RoleGuard>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should work with multiple roles (ALL logic)', () => {
    mockAuthService.hasRole.mockImplementation((role: string) => role === 'user');

    render(
      <RoleGuard requiredRoles={['admin', 'user']} requireAll={true}>
        <TestComponent />
      </RoleGuard>
    );

    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should render custom fallback component', () => {
    const CustomFallback = ({ missingRoles }: { missingRoles: string[] }) => (
      <div>Custom Access Denied: {missingRoles.join(', ')}</div>
    );

    mockAuthService.hasRole.mockReturnValue(false);

    render(
      <RoleGuard requiredRole="admin" fallback={CustomFallback}>
        <TestComponent />
      </RoleGuard>
    );

    expect(screen.getByText('Custom Access Denied: admin')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should call onUnauthorized callback when access is denied', () => {
    const onUnauthorized = vi.fn();
    mockAuthService.hasRole.mockReturnValue(false);

    render(
      <RoleGuard requiredRole="admin" onUnauthorized={onUnauthorized}>
        <TestComponent />
      </RoleGuard>
    );

    expect(onUnauthorized).toHaveBeenCalledWith(['admin']);
  });

  it('should render children when no roles are specified', () => {
    render(
      <RoleGuard>
        <TestComponent />
      </RoleGuard>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should show access denied when user is null', () => {
    mockUseAuthStore.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      lastActivity: Date.now(),
      setUser: vi.fn(),
      clearAuth: vi.fn(),
      setLoading: vi.fn(),
      updateLastActivity: vi.fn(),
      checkAuthStatus: vi.fn(),
    });

    render(
      <RoleGuard requiredRole="user">
        <TestComponent />
      </RoleGuard>
    );

    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(screen.getByText('Your role: None')).toBeInTheDocument();
  });

  it('should combine single role and multiple roles', () => {
    mockAuthService.hasRole.mockImplementation((role: string) => role === 'moderator');

    render(
      <RoleGuard requiredRole="admin" requiredRoles={['moderator']} requireAll={false}>
        <TestComponent />
      </RoleGuard>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should display correct role information in access denied message', () => {
    mockAuthService.hasRole.mockReturnValue(false);

    render(
      <RoleGuard requiredRoles={['admin', 'moderator']}>
        <TestComponent />
      </RoleGuard>
    );

    expect(screen.getByText('Required roles: admin, moderator')).toBeInTheDocument();
    expect(screen.getByText('Your role: user')).toBeInTheDocument();
  });
});