/**
 * Auth Service Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { authService } from '../../src/services/authService';

describe('AuthService', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('Authentication State', () => {
    it('should return false when not authenticated', () => {
      expect(authService.isAuthenticated()).toBe(false);
    });

    it('should return true when token exists', () => {
      localStorage.setItem('auth_token', 'test-token');
      expect(authService.isAuthenticated()).toBe(true);
    });

    it('should return null when no user is stored', () => {
      expect(authService.getStoredUser()).toBeNull();
    });

    it('should return user when stored', () => {
      const user = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user' as const,
        isActive: true,
        emailVerified: true,
        createdAt: '2023-01-01',
        updatedAt: '2023-01-01'
      };
      
      localStorage.setItem('user', JSON.stringify(user));
      expect(authService.getStoredUser()).toEqual(user);
    });
  });

  describe('Role Checking', () => {
    beforeEach(() => {
      const user = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'admin' as const,
        isActive: true,
        emailVerified: true,
        createdAt: '2023-01-01',
        updatedAt: '2023-01-01'
      };
      
      localStorage.setItem('user', JSON.stringify(user));
    });

    it('should return true for correct role', () => {
      expect(authService.hasRole('admin')).toBe(true);
    });

    it('should return false for incorrect role', () => {
      expect(authService.hasRole('user')).toBe(false);
    });

    it('should return true for admin check', () => {
      expect(authService.isAdmin()).toBe(true);
    });
  });

  describe('Role Checking - Non-admin User', () => {
    beforeEach(() => {
      const user = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user' as const,
        isActive: true,
        emailVerified: true,
        createdAt: '2023-01-01',
        updatedAt: '2023-01-01'
      };
      
      localStorage.setItem('user', JSON.stringify(user));
    });

    it('should return false for admin check', () => {
      expect(authService.isAdmin()).toBe(false);
    });

    it('should return true for user role', () => {
      expect(authService.hasRole('user')).toBe(true);
    });
  });
});