import React, { ReactElement } from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';

// Types for test utilities
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'moderator';
  avatar?: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
  errors?: ValidationError[];
}

interface ValidationError {
  field: string;
  message: string;
}

interface StoredError {
  id: string;
  message: string;
  type: 'runtime' | 'api' | 'network' | 'validation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  context?: Record<string, any>;
}

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialRoute?: string;
}

const AllTheProviders: React.FC<{ children: React.ReactNode; initialRoute?: string }> = ({ 
  children, 
  initialRoute = '/' 
}) => {
  return (
    <BrowserRouter>
      {children}
    </BrowserRouter>
  );
};

export const renderWithProviders = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
): RenderResult => {
  const { initialRoute, ...renderOptions } = options;
  
  return render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders initialRoute={initialRoute}>
        {children}
      </AllTheProviders>
    ),
    ...renderOptions,
  });
};

export const renderWithRouter = (
  ui: ReactElement,
  route: string = '/'
): RenderResult => {
  return renderWithProviders(ui, { initialRoute: route });
};

// Mock factories
export const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  role: 'user',
  isActive: true,
  emailVerified: true,
  createdAt: '2023-01-01T00:00:00.000Z',
  updatedAt: '2023-01-01T00:00:00.000Z',
  ...overrides,
});

export const createMockApiResponse = <T,>(
  data: T,
  overrides: Partial<Omit<ApiResponse<T>, 'data'>> = {}
): ApiResponse<T> => ({
  data,
  message: 'Success',
  success: true,
  ...overrides,
});

export const createMockError = (overrides: Partial<StoredError> = {}): StoredError => ({
  id: '1',
  message: 'Test error',
  type: 'runtime',
  severity: 'medium',
  timestamp: new Date().toISOString(),
  ...overrides,
});

// Utility functions for testing
export const waitForLoadingToFinish = async (): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, 0));
};

export const fillForm = async (
  form: HTMLFormElement,
  data: Record<string, string>
): Promise<void> => {
  const { fireEvent } = await import('@testing-library/react');
  
  Object.entries(data).forEach(([name, value]) => {
    const input = form.querySelector(`[name="${name}"]`) as HTMLInputElement;
    if (input) {
      fireEvent.change(input, { target: { value } });
    }
  });
};

// Assertion utilities
export const expectToastMessage = async (message: string): Promise<void> => {
  const { screen } = await import('@testing-library/react');
  const { waitFor } = await import('@testing-library/react');
  
  await waitFor(() => {
    expect(screen.getByText(message)).toBeInTheDocument();
  });
};

export const expectLoadingState = (element: HTMLElement): void => {
  expect(element).toHaveAttribute('aria-busy', 'true');
};

// Mock API handlers helpers
export const createMockApiHandlers = () => {
  return {
    auth: {
      login: vi.fn(),
      logout: vi.fn(),
      refresh: vi.fn(),
      me: vi.fn(),
    },
    users: {
      list: vi.fn(),
      get: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  };
};

// Browser API mocks
export const mockLocalStorage = () => {
  const storage: Record<string, string> = {};
  
  return {
    getItem: vi.fn((key: string) => storage[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      storage[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete storage[key];
    }),
    clear: vi.fn(() => {
      Object.keys(storage).forEach(key => delete storage[key]);
    }),
    get length() {
      return Object.keys(storage).length;
    },
    key: vi.fn((index: number) => Object.keys(storage)[index] || null),
  };
};

export const mockSessionStorage = () => {
  const storage: Record<string, string> = {};
  
  return {
    getItem: vi.fn((key: string) => storage[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      storage[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete storage[key];
    }),
    clear: vi.fn(() => {
      Object.keys(storage).forEach(key => delete storage[key]);
    }),
    get length() {
      return Object.keys(storage).length;
    },
    key: vi.fn((index: number) => Object.keys(storage)[index] || null),
  };
};

export const mockWindow = () => ({
  location: {
    href: 'http://localhost:3000',
    origin: 'http://localhost:3000',
    protocol: 'http:',
    host: 'localhost:3000',
    hostname: 'localhost',
    port: '3000',
    pathname: '/',
    search: '',
    hash: '',
    assign: vi.fn(),
    replace: vi.fn(),
    reload: vi.fn(),
  },
  navigator: {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    language: 'en-US',
    languages: ['en-US', 'en'],
    onLine: true,
    cookieEnabled: true,
    platform: 'Win32',
  },
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
  getComputedStyle: vi.fn(() => ({
    getPropertyValue: vi.fn(),
  })),
  matchMedia: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

export const mockNavigator = () => ({
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  language: 'en-US',
  languages: ['en-US', 'en'],
  onLine: true,
  cookieEnabled: true,
  platform: 'Win32',
});

// Re-export testing library utilities
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';