import '@testing-library/jest-dom';
import { server } from './__mocks__/server';
import { beforeAll, afterEach, afterAll, vi } from 'vitest';

// Setup MSW
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  server.resetHandlers();
  // Clear all mocks after each test
  vi.clearAllMocks();
  // Reset localStorage and sessionStorage
  localStorage.clear();
  sessionStorage.clear();
});

afterAll(() => {
  server.close();
});

// Create storage mocks that maintain state during tests
const createStorageMock = () => {
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

// Mock localStorage
const localStorageMock = createStorageMock();
Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock sessionStorage
const sessionStorageMock = createStorageMock();
Object.defineProperty(global, 'sessionStorage', {
  value: sessionStorageMock,
  writable: true,
});

// Ensure DOM environment is properly set up
if (typeof global.window === 'undefined') {
  // Create a basic window object if it doesn't exist
  Object.defineProperty(global, 'window', {
    value: {
      localStorage: localStorageMock,
      sessionStorage: sessionStorageMock,
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
      document: global.document,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
      getComputedStyle: vi.fn(() => ({
        getPropertyValue: vi.fn(),
      })),
    },
    writable: true,
    configurable: true,
  });
} else {
  // Extend existing window object
  Object.assign(global.window, {
    localStorage: localStorageMock,
    sessionStorage: sessionStorageMock,
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
  });
}

// Mock navigator
Object.defineProperty(global, 'navigator', {
  value: {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    language: 'en-US',
    languages: ['en-US', 'en'],
    onLine: true,
    cookieEnabled: true,
    platform: 'Win32',
  },
  writable: true,
});

// Mock matchMedia with proper implementation
const mockMatchMedia = vi.fn().mockImplementation((query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: mockMatchMedia,
});

// Make matchMedia available globally
global.matchMedia = mockMatchMedia;

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock fetch
global.fetch = vi.fn();

// Mock URL constructor and static methods
global.URL = class URL {
  constructor(url: string, base?: string) {
    this.href = url;
    this.origin = 'http://localhost:3000';
    this.protocol = 'http:';
    this.host = 'localhost:3000';
    this.hostname = 'localhost';
    this.port = '3000';
    this.pathname = '/';
    this.search = '';
    this.hash = '';
  }
  
  href: string;
  origin: string;
  protocol: string;
  host: string;
  hostname: string;
  port: string;
  pathname: string;
  search: string;
  hash: string;
  
  static createObjectURL = vi.fn();
  static revokeObjectURL = vi.fn();
} as any;

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  warn: vi.fn(),
  error: vi.fn(),
  log: vi.fn(),
};

// Enhance document.createElement to return elements with proper style property
const originalCreateElement = global.document.createElement;

// Create a default mock that can be overridden by individual tests
const defaultCreateElementMock = vi.fn().mockImplementation((tagName: string) => {
  let element;
  
  try {
    element = originalCreateElement.call(global.document, tagName);
  } catch (error) {
    // If the original createElement fails, create a mock element
    element = {};
  }
  
  // Ensure element is an object
  if (!element || typeof element !== 'object') {
    element = {};
  }
  
  // Create a proper style object that can be assigned to
  const styleObj = {};
  
  // Make cssText writable
  Object.defineProperty(styleObj, 'cssText', {
    writable: true,
    value: '',
  });
  
  // Add other style properties
  Object.assign(styleObj, {
    setProperty: vi.fn(),
    getPropertyValue: vi.fn(),
    removeProperty: vi.fn(),
  });
  
  // Assign the style object to the element
  Object.defineProperty(element, 'style', {
    writable: true,
    configurable: true,
    value: styleObj,
  });
  
  // Mock other common element methods
  element.appendChild = vi.fn();
  element.remove = vi.fn();
  element.addEventListener = vi.fn();
  element.removeEventListener = vi.fn();
  element.className = '';
  element.textContent = '';
  
  return element;
});

// Set up the default mock but make it configurable so tests can override it
Object.defineProperty(global.document, 'createElement', {
  writable: true,
  configurable: true,
  value: defaultCreateElementMock,
});

// Mock document.body.appendChild
if (global.document.body && !global.document.body.appendChild) {
  global.document.body.appendChild = vi.fn();
}
