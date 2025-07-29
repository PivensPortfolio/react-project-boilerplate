import { vi } from 'vitest';

/**
 * Test utilities to help with common testing patterns and avoid timeouts
 */

export const createMockLocalStorage = () => {
  const store: Record<string, string> = {};
  
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
    key: vi.fn((index: number) => Object.keys(store)[index] || null),
    get length() {
      return Object.keys(store).length;
    },
  };
};

export const mockConsole = () => {
  const originalConsole = { ...console };
  
  const mocks = {
    log: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
    group: vi.fn(),
    groupEnd: vi.fn(),
    groupCollapsed: vi.fn(),
  };
  
  Object.assign(console, mocks);
  
  return {
    mocks,
    restore: () => Object.assign(console, originalConsole),
  };
};

export const mockWindow = (overrides: Partial<Window> = {}) => {
  const originalWindow = { ...window };
  
  Object.assign(window, {
    location: {
      href: 'http://localhost:3000',
      reload: vi.fn(),
      ...overrides.location,
    },
    navigator: {
      onLine: true,
      userAgent: 'test-agent',
      ...overrides.navigator,
    },
    ...overrides,
  });
  
  return {
    restore: () => Object.assign(window, originalWindow),
  };
};

export const createErrorBoundaryTest = (Component: React.ComponentType) => {
  const ThrowError: React.FC<{ shouldThrow?: boolean }> = ({ shouldThrow = true }) => {
    if (shouldThrow) {
      throw new Error('Test error');
    }
    return <div>No error</div>;
  };
  
  return { ThrowError };
};

export const waitForTimeout = (ms: number = 100) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const createAsyncTest = <T>(
  testFn: () => Promise<T>,
  timeout: number = 5000
): Promise<T> => {
  return Promise.race([
    testFn(),
    new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error(`Test timed out after ${timeout}ms`)), timeout)
    ),
  ]);
};