require('@testing-library/jest-dom');

// Polyfills for Next.js Edge Runtime APIs
const { TextEncoder, TextDecoder } = require('util')
const { ReadableStream, WritableStream, TransformStream } = require('stream/web')

global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder
global.ReadableStream = ReadableStream  
global.WritableStream = WritableStream
global.TransformStream = TransformStream

// Mock Request and Response for Next.js server APIs
// Using defineProperty to properly set readonly properties
global.Request = class MockRequest {
  constructor(url, options = {}) {
    Object.defineProperty(this, 'url', { value: url, writable: false })
    Object.defineProperty(this, 'method', { value: options.method || 'GET', writable: false })
    Object.defineProperty(this, 'headers', { value: new Map(Object.entries(options.headers || {})), writable: false })
    Object.defineProperty(this, 'body', { value: options.body, writable: false })
  }
  
  json() {
    return Promise.resolve(JSON.parse(this.body || '{}'))
  }
}

global.Response = class MockResponse {
  constructor(body, options = {}) {
    Object.defineProperty(this, 'body', { value: body, writable: false })
    Object.defineProperty(this, 'status', { value: options.status || 200, writable: false })
    Object.defineProperty(this, 'headers', { value: new Map(Object.entries(options.headers || {})), writable: false })
  }
  
  json() {
    return Promise.resolve(JSON.parse(this.body || '{}'))
  }
}

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    };
  },
}));

// Mock Next.js navigation (App Router)
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      refresh: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      prefetch: jest.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return '/';
  },
}));

// Mock window.matchMedia (only in browser environment)
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
  
  // Mock IndexedDB for PWA tests
  global.indexedDB = {
    open: jest.fn().mockReturnValue({
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      result: {
        createObjectStore: jest.fn(),
        transaction: jest.fn().mockReturnValue({
          objectStore: jest.fn().mockReturnValue({
            add: jest.fn(),
            get: jest.fn(),
            put: jest.fn(),
            delete: jest.fn(),
            clear: jest.fn(),
            getAll: jest.fn(),
          }),
        }),
      },
    }),
    deleteDatabase: jest.fn(),
  };
}

// Global test environment setup
global.fetch = jest.fn();

// Set up environment variables for tests
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-key-for-testing-only';
// Use a valid PostgreSQL URL format for Prisma tests (even if not connected)
// Integration tests that need a real DB should be run separately
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/zemo_test';

// Cleanup after each test
afterEach(() => {
  jest.clearAllMocks();
});
