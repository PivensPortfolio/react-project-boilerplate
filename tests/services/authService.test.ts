/**
 * Auth Service Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { authService } from '../../src/services/authService';
import { httpClient } from '../../src/services/httpClient';
import { tokenManager } from '../../src/utils/tokenManager';
import type { LoginRequest, LoginResponse, User } from '../../src/services/types';

// Mock dependencies
vi.mock('../../src/services/httpClient');
vi.mock('../../src/utils/tokenManager');

const mockHttpClient = vi.mocked(httpClient);
const mockTokenManager = vi.mocked(tokenManager);

describe('AuthService', () => {
  const mockUser: User = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    role: 'user',
    isActive: true,
    emailVerified: true,
    avatar: undefined,
    lastLoginAt: undefined,
    createdAt: '2023-01-01',
    updatedAt: '2023-01-01'
  };

  const mockLoginResponse: LoginResponse = {
    user: mockUser,
    token: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    expiresIn: 3600,
  };

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    
    // Reset all mocks
    vi.clearAllMocks();
    
    // Setup default mock implementations
    mockTokenManager.isTokenValid.mockReturnValue(false);
    mockTokenManager.getAccessToken.mockReturnValue(null);
    mockTokenManager.getCurrentUserFromToken.mockReturnValue(null);
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Authentication State', () => {
    it('should return false when not authenticated', () => {
      mockTokenManager.isTokenValid.mockReturnValue(false);
      expect(authService.isAuthenticated()).toBe(false);
    });

    it('should return true when token is valid', () => {
      mockTokenManager.isTokenValid.mockReturnValue(true);
      expect(authService.isAuthenticated()).toBe(true);
    });

    it('should return null when no user is stored', () => {
      expect(authService.getStoredUser()).toBeNull();
    });

    it('should return user when stored', () => {
      localStorage.setItem('user', JSON.stringify(mockUser));
      expect(authService.getStoredUser()).toEqual(mockUser);
    });

    it('should get current user from token', () => {
      const tokenPayload = {
        sub: '1',
        email: 'test@example.com',
        role: 'user',
        iat: 1234567890,
        exp: 1234567890 + 3600,
      };
      
      mockTokenManager.getCurrentUserFromToken.mockReturnValue(tokenPayload);
      
      const user = authService.getCurrentUserFromToken();
      expect(user).toEqual({
        id: '1',
        email: 'test@example.com',
        role: 'user',
        name: '',
        avatar: undefined,
        isActive: true,
        emailVerified: true,
        createdAt: '',
        updatedAt: '',
      });
    });
  });

  describe('Role Checking', () => {
    it('should check role from token payload', () => {
      const tokenPayload = {
        sub: '1',
        email: 'test@example.com',
        role: 'admin',
        iat: 1234567890,
        exp: 1234567890 + 3600,
      };
      
      mockTokenManager.getCurrentUserFromToken.mockReturnValue(tokenPayload);
      
      expect(authService.hasRole('admin')).toBe(true);
      expect(authService.hasRole('user')).toBe(false);
      expect(authService.isAdmin()).toBe(true);
    });

    it('should return false when no token exists', () => {
      mockTokenManager.getCurrentUserFromToken.mockReturnValue(null);
      
      expect(authService.hasRole('admin')).toBe(false);
      expect(authService.isAdmin()).toBe(false);
    });

    it('should check multiple roles', () => {
      const tokenPayload = {
        sub: '1',
        email: 'test@example.com',
        role: 'moderator',
        iat: 1234567890,
        exp: 1234567890 + 3600,
      };
      
      mockTokenManager.getCurrentUserFromToken.mockReturnValue(tokenPayload);
      
      expect(authService.hasAnyRole(['admin', 'moderator'])).toBe(true);
      expect(authService.hasAnyRole(['admin', 'user'])).toBe(false);
    });
  });

  describe('Login', () => {
    it('should login successfully and store tokens', async () => {
      const credentials: LoginRequest = {
        email: 'test@example.com',
        password: 'password123',
      };

      mockHttpClient.post.mockResolvedValue({
        success: true,
        data: mockLoginResponse,
        message: 'Login successful',
        timestamp: new Date().toISOString(),
      });

      const result = await authService.login(credentials);

      expect(mockHttpClient.post).toHaveBeenCalledWith('/auth/login', credentials);
      expect(mockTokenManager.setAccessToken).toHaveBeenCalledWith(mockLoginResponse.token);
      expect(mockTokenManager.setRefreshToken).toHaveBeenCalledWith(mockLoginResponse.refreshToken);
      expect(mockHttpClient.setAuthToken).toHaveBeenCalledWith(mockLoginResponse.token);
      expect(result).toEqual(mockLoginResponse);
    });

    it('should handle login failure', async () => {
      const credentials: LoginRequest = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      mockHttpClient.post.mockRejectedValue(new Error('Invalid credentials'));

      await expect(authService.login(credentials)).rejects.toThrow('Invalid credentials');
      expect(mockTokenManager.setAccessToken).not.toHaveBeenCalled();
    });
  });

  describe('Logout', () => {
    it('should logout successfully and clear tokens', async () => {
      mockHttpClient.post.mockResolvedValue({
        success: true,
        data: null,
        message: 'Logout successful',
        timestamp: new Date().toISOString(),
      });

      await authService.logout();

      expect(mockHttpClient.post).toHaveBeenCalledWith('/auth/logout', {}, { skipErrorHandling: true });
      expect(mockTokenManager.clearTokens).toHaveBeenCalled();
      expect(mockHttpClient.clearAuthToken).toHaveBeenCalled();
    });

    it('should clear tokens even if API call fails', async () => {
      mockHttpClient.post.mockRejectedValue(new Error('Network error'));

      await authService.logout();

      expect(mockTokenManager.clearTokens).toHaveBeenCalled();
      expect(mockHttpClient.clearAuthToken).toHaveBeenCalled();
    });
  });

  describe('Token Refresh', () => {
    it('should refresh token successfully', async () => {
      mockTokenManager.getRefreshToken.mockReturnValue('mock-refresh-token');
      mockHttpClient.post.mockResolvedValue({
        success: true,
        data: mockLoginResponse,
        message: 'Token refreshed',
        timestamp: new Date().toISOString(),
      });

      const result = await authService.refreshToken();

      expect(mockHttpClient.post).toHaveBeenCalledWith('/auth/refresh', {
        refreshToken: 'mock-refresh-token',
      }, { skipErrorHandling: false });
      expect(mockTokenManager.setAccessToken).toHaveBeenCalledWith(mockLoginResponse.token);
      expect(result).toEqual(mockLoginResponse);
    });

    it('should throw error when no refresh token available', async () => {
      mockTokenManager.getRefreshToken.mockReturnValue(null);

      await expect(authService.refreshToken()).rejects.toThrow('No refresh token available');
    });
  });

  describe('Token Management', () => {
    it('should get access token', () => {
      mockTokenManager.getAccessToken.mockReturnValue('mock-token');
      
      const token = authService.getAccessToken();
      expect(token).toBe('mock-token');
    });

    it('should check if token should refresh', () => {
      mockTokenManager.shouldRefreshToken.mockReturnValue(true);
      
      const shouldRefresh = authService.shouldRefreshToken();
      expect(shouldRefresh).toBe(true);
    });

    it('should get token debug info', () => {
      const debugInfo = { isValid: true, expiresAt: '2023-01-01T00:00:00Z' };
      mockTokenManager.getTokenDebugInfo.mockReturnValue(debugInfo);
      
      const result = authService.getTokenDebugInfo();
      expect(result).toEqual(debugInfo);
    });
  });
});