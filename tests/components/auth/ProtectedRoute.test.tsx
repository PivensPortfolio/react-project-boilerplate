/**
 * Protected Route Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '../../../src/components/auth/ProtectedRoute';
import { authService } from '../../../src/services/authService';
import { useAuthStore } from '../../../src/store/authStore';

// Mock dependencies
vi.mock('../../../src/services/authService');
vi.mock('../../../src/store/authStore');

const mockAuthService = vi.mocked(authService);
const mockUseAuthStore = vi.mocked(useAuthStore);

// Test component
const TestComponent = () => <div>Protected Content</div>;
const LoginComponent = () => <div>Login Page</div>;

// Wrapper component for routing
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<LoginComponent />} />
      <Route path="/protected" element={children} />
      <Route path="/" element={children} />
    </Routes>
  </BrowserRouter>
);

describe('ProtectedRoute', () => {
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

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementations
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
    
    mockAuthService.isAuthenticated.mockReturnValue(false);
    mockAuthService.getCurrentUser.mockResolvedValue(mockUser);
  });

  it('should render children when user is authenticated', async () => {
    mockAuthService.isAuthenticated.mockReturnValue(true);
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

    render(
      <TestWrapper>
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      </TestWrapper>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should redirect to login when user is not authenticated', () => {
    mockAuthService.isAuthenticated.mockReturnValue(false);
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
      <TestWrapper>
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      </TestWrapper>
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should show loading state when authenticated but no user in store', () => {
    mockAuthService.isAuthenticated.mockReturnValue(true);
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
      <TestWrapper>
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      </TestWrapper>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should render custom fallback component when loading', () => {
    const CustomFallback = () => <div>Custom Loading</div>;
    
    mockAuthService.isAuthenticated.mockReturnValue(true);
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
      <TestWrapper>
        <ProtectedRoute fallback={CustomFallback}>
          <TestComponent />
        </ProtectedRoute>
      </TestWrapper>
    );

    expect(screen.getByText('Custom Loading')).toBeInTheDocument();
  });

  it('should redirect to custom path when specified', () => {
    mockAuthService.isAuthenticated.mockReturnValue(false);
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

    const CustomWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <BrowserRouter>
        <Routes>
          <Route path="/custom-login" element={<div>Custom Login</div>} />
          <Route path="/" element={children} />
        </Routes>
      </BrowserRouter>
    );

    render(
      <CustomWrapper>
        <ProtectedRoute redirectTo="/custom-login">
          <TestComponent />
        </ProtectedRoute>
      </CustomWrapper>
    );

    expect(screen.getByText('Custom Login')).toBeInTheDocument();
  });

  it('should fetch user data when authenticated but no user in store', async () => {
    const mockSetUser = vi.fn();
    
    mockAuthService.isAuthenticated.mockReturnValue(true);
    mockUseAuthStore.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      lastActivity: Date.now(),
      setUser: mockSetUser,
      clearAuth: vi.fn(),
      setLoading: vi.fn(),
      updateLastActivity: vi.fn(),
      checkAuthStatus: vi.fn(),
    });

    render(
      <TestWrapper>
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      </TestWrapper>
    );

    await waitFor(() => {
      expect(mockAuthService.getCurrentUser).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(mockSetUser).toHaveBeenCalledWith(mockUser);
    });
  });

  it('should clear auth when getCurrentUser fails', async () => {
    const mockClearAuth = vi.fn();
    
    mockAuthService.isAuthenticated.mockReturnValue(true);
    mockAuthService.getCurrentUser.mockRejectedValue(new Error('API Error'));
    mockUseAuthStore.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      lastActivity: Date.now(),
      setUser: vi.fn(),
      clearAuth: mockClearAuth,
      setLoading: vi.fn(),
      updateLastActivity: vi.fn(),
      checkAuthStatus: vi.fn(),
    });

    render(
      <TestWrapper>
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      </TestWrapper>
    );

    await waitFor(() => {
      expect(mockClearAuth).toHaveBeenCalled();
    });
  });
});