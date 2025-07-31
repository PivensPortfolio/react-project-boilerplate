import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '../utils/test-utils';
import { useUser, useTheme, useLoading, useAuth } from '../../src/store/hooks';
import { useAppStore } from '../../src/store/appStore';
import type { User } from '../../src/store/types';

// Mock user data
const mockUser: User = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'user',
};

const mockAdmin: User = {
  id: '2',
  name: 'Jane Admin',
  email: 'jane@example.com',
  role: 'admin',
};

describe('Store Hooks', () => {
  beforeEach(() => {
    // Reset store before each test
    useAppStore.getState().reset();
  });

  describe('useUser', () => {
    it('should return user state and actions', () => {
      const { result } = renderHook(() => useUser());
      
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isAdmin).toBe(false);
      expect(typeof result.current.setUser).toBe('function');
    });

    it('should update user state', () => {
      const { result } = renderHook(() => useUser());
      
      act(() => {
        result.current.setUser(mockUser);
      });
      
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.isAdmin).toBe(false);
    });

    it('should detect admin user', () => {
      const { result } = renderHook(() => useUser());
      
      act(() => {
        result.current.setUser(mockAdmin);
      });
      
      expect(result.current.isAdmin).toBe(true);
    });
  });

  describe('useTheme', () => {
    it('should return theme state and actions', () => {
      const { result } = renderHook(() => useTheme());
      
      expect(result.current.theme).toBe('light');
      expect(result.current.isDark).toBe(false);
      expect(result.current.isLight).toBe(true);
      expect(typeof result.current.setTheme).toBe('function');
      expect(typeof result.current.toggleTheme).toBe('function');
    });

    it('should toggle theme', () => {
      const { result } = renderHook(() => useTheme());
      
      act(() => {
        result.current.toggleTheme();
      });
      
      expect(result.current.theme).toBe('dark');
      expect(result.current.isDark).toBe(true);
      expect(result.current.isLight).toBe(false);
    });

    it('should set theme directly', () => {
      const { result } = renderHook(() => useTheme());
      
      act(() => {
        result.current.setTheme('dark');
      });
      
      expect(result.current.theme).toBe('dark');
    });
  });

  describe('useLoading', () => {
    it('should return loading state and actions', () => {
      const { result } = renderHook(() => useLoading());
      
      expect(result.current.loading).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(typeof result.current.setLoading).toBe('function');
    });

    it('should update loading state', () => {
      const { result } = renderHook(() => useLoading());
      
      act(() => {
        result.current.setLoading(true);
      });
      
      expect(result.current.loading).toBe(true);
      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('useAuth', () => {
    it('should provide authentication utilities', () => {
      const { result } = renderHook(() => useAuth());
      
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isAdmin).toBe(false);
      expect(typeof result.current.login).toBe('function');
      expect(typeof result.current.logout).toBe('function');
    });

    it('should login user', () => {
      const { result } = renderHook(() => useAuth());
      
      act(() => {
        result.current.login(mockUser);
      });
      
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should logout user', () => {
      const { result } = renderHook(() => useAuth());
      
      // First login
      act(() => {
        result.current.login(mockUser);
      });
      
      expect(result.current.isAuthenticated).toBe(true);
      
      // Then logout
      act(() => {
        result.current.logout();
      });
      
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });
});