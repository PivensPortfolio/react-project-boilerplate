/**
 * Token Manager Tests
 * Tests for JWT token management utilities
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { tokenManager, JwtPayload } from '../../src/utils/tokenManager';

// Mock jwt-decode
vi.mock('jwt-decode', () => ({
  jwtDecode: vi.fn(),
}));

import { jwtDecode } from 'jwt-decode';

describe('TokenManager', () => {
  const mockJwtDecode = vi.mocked(jwtDecode);

  // Mock JWT payload
  const mockPayload: JwtPayload = {
    sub: 'user-123',
    email: 'test@example.com',
    role: 'user',
    iat: Math.floor(Date.now() / 1000) - 300, // 5 minutes ago
    exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
  };

  const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMyIsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNjAwMDAwMDAwLCJleHAiOjE2MDAwMDM2MDB9.signature';
  const mockRefreshToken = 'refresh-token-123';

  beforeEach(() => {
    // Clear any existing timers
    vi.clearAllTimers();
    
    // Reset mocks
    mockJwtDecode.mockReset();
  });

  afterEach(() => {
    vi.clearAllTimers();
    localStorage.clear();
  });

  describe('Token Storage', () => {
    it('should store and retrieve access token', () => {
      mockJwtDecode.mockReturnValue(mockPayload);

      // Debug: Check localStorage before
      console.log('localStorage before setAccessToken:', localStorage.getItem('auth_token'));
      console.log('localStorage setItem function:', typeof localStorage.setItem);
      
      // Test localStorage directly
      localStorage.setItem('test', 'value');
      console.log('Direct localStorage test:', localStorage.getItem('test'));

      tokenManager.setAccessToken(mockToken);
      
      // Debug: Check localStorage directly
      console.log('localStorage after setAccessToken:', localStorage.getItem('auth_token'));
      
      const storedToken = tokenManager.getAccessToken();
      
      // Debug: Check what getAccessToken returns
      console.log('getAccessToken returns:', storedToken);

      expect(storedToken).toBe(mockToken);
      expect(localStorage.getItem('auth_token')).toBe(mockToken);
    });

    it('should store and retrieve refresh token', () => {
      tokenManager.setRefreshToken(mockRefreshToken);
      const storedToken = tokenManager.getRefreshToken();

      expect(storedToken).toBe(mockRefreshToken);
      expect(localStorage.getItem('refresh_token')).toBe(mockRefreshToken);
    });

    it('should throw error when storing empty access token', () => {
      expect(() => tokenManager.setAccessToken('')).toThrow('Token cannot be empty');
    });

    it('should throw error when storing empty refresh token', () => {
      expect(() => tokenManager.setRefreshToken('')).toThrow('Refresh token cannot be empty');
    });

    it('should clear all tokens', () => {
      mockJwtDecode.mockReturnValue(mockPayload);
      
      tokenManager.setAccessToken(mockToken);
      tokenManager.setRefreshToken(mockRefreshToken);
      
      tokenManager.clearTokens();
      
      expect(tokenManager.getAccessToken()).toBeNull();
      expect(tokenManager.getRefreshToken()).toBeNull();
      expect(localStorage.getItem('auth_token')).toBeNull();
      expect(localStorage.getItem('refresh_token')).toBeNull();
    });
  });

  describe('Token Validation', () => {
    it('should validate correct JWT format', () => {
      mockJwtDecode.mockReturnValue(mockPayload);
      
      const isValid = tokenManager.validateTokenFormat(mockToken);
      expect(isValid).toBe(true);
    });

    it('should reject invalid JWT format', () => {
      mockJwtDecode.mockImplementation(() => {
        throw new Error('Invalid token');
      });
      
      const isValid = tokenManager.validateTokenFormat('invalid-token');
      expect(isValid).toBe(false);
    });

    it('should reject token with wrong number of parts', () => {
      const isValid = tokenManager.validateTokenFormat('invalid.token');
      expect(isValid).toBe(false);
    });

    it('should reject empty or non-string tokens', () => {
      expect(tokenManager.validateTokenFormat('')).toBe(false);
      expect(tokenManager.validateTokenFormat(null as any)).toBe(false);
      expect(tokenManager.validateTokenFormat(undefined as any)).toBe(false);
    });
  });

  describe('Token Parsing', () => {
    it('should parse valid token correctly', () => {
      mockJwtDecode.mockReturnValue(mockPayload);
      
      const tokenInfo = tokenManager.parseToken(mockToken);
      
      expect(tokenInfo).toBeDefined();
      expect(tokenInfo!.token).toBe(mockToken);
      expect(tokenInfo!.payload).toEqual(mockPayload);
      expect(tokenInfo!.expiresAt).toBeInstanceOf(Date);
      expect(tokenInfo!.isExpired).toBe(false);
      expect(tokenInfo!.timeUntilExpiry).toBeGreaterThan(0);
    });

    it('should return null for invalid token', () => {
      mockJwtDecode.mockImplementation(() => {
        throw new Error('Invalid token');
      });
      
      const tokenInfo = tokenManager.parseToken('invalid-token');
      expect(tokenInfo).toBeNull();
    });

    it('should detect expired token', () => {
      const expiredPayload = {
        ...mockPayload,
        exp: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
      };
      mockJwtDecode.mockReturnValue(expiredPayload);
      
      const tokenInfo = tokenManager.parseToken(mockToken);
      
      expect(tokenInfo!.isExpired).toBe(true);
      expect(tokenInfo!.timeUntilExpiry).toBeLessThan(0);
    });
  });

  describe('Token Validation Status', () => {
    it('should return true for valid non-expired token', () => {
      mockJwtDecode.mockReturnValue(mockPayload);
      tokenManager.setAccessToken(mockToken);
      
      expect(tokenManager.isTokenValid()).toBe(true);
    });

    it('should return false for expired token', () => {
      const expiredPayload = {
        ...mockPayload,
        exp: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
      };
      mockJwtDecode.mockReturnValue(expiredPayload);
      tokenManager.setAccessToken(mockToken);
      
      expect(tokenManager.isTokenValid()).toBe(false);
    });

    it('should return false when no token exists', () => {
      expect(tokenManager.isTokenValid()).toBe(false);
    });
  });

  describe('Token Refresh Logic', () => {
    it('should detect when token needs refresh', () => {
      const soonToExpirePayload = {
        ...mockPayload,
        exp: Math.floor(Date.now() / 1000) + 240, // 4 minutes from now (less than 5 min threshold)
      };
      mockJwtDecode.mockReturnValue(soonToExpirePayload);
      tokenManager.setAccessToken(mockToken);
      
      expect(tokenManager.shouldRefreshToken()).toBe(true);
    });

    it('should not refresh when token has plenty of time left', () => {
      mockJwtDecode.mockReturnValue(mockPayload); // 1 hour from now
      tokenManager.setAccessToken(mockToken);
      
      expect(tokenManager.shouldRefreshToken()).toBe(false);
    });

    it('should handle refresh promise management', () => {
      const mockPromise = Promise.resolve('new-token');
      
      tokenManager.setRefreshPromise(mockPromise);
      
      expect(tokenManager.isRefreshInProgress()).toBe(true);
      expect(tokenManager.getRefreshPromise()).toBe(mockPromise);
    });
  });

  describe('User Information Extraction', () => {
    it('should extract user info from token', () => {
      mockJwtDecode.mockReturnValue(mockPayload);
      tokenManager.setAccessToken(mockToken);
      
      const userInfo = tokenManager.getCurrentUserFromToken();
      
      expect(userInfo).toEqual(mockPayload);
    });

    it('should return null when no token exists', () => {
      const userInfo = tokenManager.getCurrentUserFromToken();
      expect(userInfo).toBeNull();
    });

    it('should return null for invalid token', () => {
      mockJwtDecode.mockImplementation(() => {
        throw new Error('Invalid token');
      });
      tokenManager.setAccessToken('invalid-token');
      
      const userInfo = tokenManager.getCurrentUserFromToken();
      expect(userInfo).toBeNull();
    });
  });

  describe('Debug Information', () => {
    it('should provide comprehensive debug info for valid token', () => {
      mockJwtDecode.mockReturnValue(mockPayload);
      tokenManager.setAccessToken(mockToken);
      
      const debugInfo = tokenManager.getTokenDebugInfo();
      
      expect(debugInfo).toBeDefined();
      expect(debugInfo!.isValid).toBe(true);
      expect(debugInfo!.expiresAt).toBeDefined();
      expect(debugInfo!.timeUntilExpiry).toBeDefined();
      expect(debugInfo!.shouldRefresh).toBeDefined();
      expect(debugInfo!.userInfo).toEqual({
        id: mockPayload.sub,
        email: mockPayload.email,
        role: mockPayload.role,
      });
    });

    it('should return null debug info when no token exists', () => {
      const debugInfo = tokenManager.getTokenDebugInfo();
      expect(debugInfo).toBeNull();
    });
  });

  describe('Event Handling', () => {
    it('should schedule token refresh', () => {
      vi.useFakeTimers();
      const eventSpy = vi.spyOn(window, 'dispatchEvent');
      
      // Token that expires in 10 minutes (should schedule refresh in 5 minutes)
      const futurePayload = {
        ...mockPayload,
        exp: Math.floor(Date.now() / 1000) + 600, // 10 minutes from now
      };
      mockJwtDecode.mockReturnValue(futurePayload);
      
      tokenManager.setAccessToken(mockToken);
      
      // Fast-forward to when refresh should be triggered
      vi.advanceTimersByTime(5 * 60 * 1000 + 1000); // 5 minutes + 1 second
      
      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'auth:token-refresh-needed',
        })
      );
      
      vi.useRealTimers();
      eventSpy.mockRestore();
    });
  });
});