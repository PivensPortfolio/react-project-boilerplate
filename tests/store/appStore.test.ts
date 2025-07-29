import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '../../src/store/appStore';
import type { User } from '../../src/store/types';

// Mock user data
const mockUser: User = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'user',
};

describe('AppStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useAppStore.getState().reset();
  });

  it('should have initial state', () => {
    const state = useAppStore.getState();
    
    expect(state.user).toBeNull();
    expect(state.theme).toBe('light');
    expect(state.loading).toBe(false);
  });

  it('should set user', () => {
    const { setUser } = useAppStore.getState();
    
    setUser(mockUser);
    
    const state = useAppStore.getState();
    expect(state.user).toEqual(mockUser);
  });

  it('should toggle theme', () => {
    const { toggleTheme } = useAppStore.getState();
    
    // Initial theme should be light
    expect(useAppStore.getState().theme).toBe('light');
    
    // Toggle to dark
    toggleTheme();
    expect(useAppStore.getState().theme).toBe('dark');
    
    // Toggle back to light
    toggleTheme();
    expect(useAppStore.getState().theme).toBe('light');
  });

  it('should set theme directly', () => {
    const { setTheme } = useAppStore.getState();
    
    setTheme('dark');
    expect(useAppStore.getState().theme).toBe('dark');
    
    setTheme('light');
    expect(useAppStore.getState().theme).toBe('light');
  });

  it('should set loading state', () => {
    const { setLoading } = useAppStore.getState();
    
    setLoading(true);
    expect(useAppStore.getState().loading).toBe(true);
    
    setLoading(false);
    expect(useAppStore.getState().loading).toBe(false);
  });

  it('should reset to initial state', () => {
    const { setUser, setTheme, setLoading, reset } = useAppStore.getState();
    
    // Modify state
    setUser(mockUser);
    setTheme('dark');
    setLoading(true);
    
    // Verify state is modified
    let state = useAppStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.theme).toBe('dark');
    expect(state.loading).toBe(true);
    
    // Reset
    reset();
    
    // Verify state is reset
    state = useAppStore.getState();
    expect(state.user).toBeNull();
    expect(state.theme).toBe('light');
    expect(state.loading).toBe(false);
  });
});