# Testing Setup

This project uses Vitest as the testing framework with React Testing Library for component testing
and MSW for API mocking.

## Test Structure

```
tests/
├── __mocks__/           # MSW handlers and server setup
├── components/          # Component tests
│   ├── ui/             # UI component tests
│   └── common/         # Common component tests
├── hooks/              # Custom hook tests
├── services/           # Service layer tests
├── store/              # State management tests
├── utils/              # Utility function tests
├── setup.ts            # Test setup and configuration
└── README.md           # This file
```

## Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:ui

# Run tests once
npm run test:run

# Run specific test file
npx vitest run tests/components/ui/Button.test.tsx
```

## Test Configuration

- **Framework**: Vitest with jsdom environment
- **Component Testing**: React Testing Library
- **API Mocking**: MSW (Mock Service Worker)
- **Setup**: Global test setup in `tests/setup.ts`
- **Timeout**: 5 seconds per test
- **Pool**: Fork pool with single fork for memory efficiency

## Test Coverage

The test suite covers:

### Components

- ✅ Button component (variants, sizes, states, accessibility)
- ✅ Input component (validation, states, events)
- ✅ Loading component (variants, sizes, accessibility)
- ✅ Modal component (states, focus management, accessibility)
- ✅ Navigation component (routing, active states)

### Hooks

- ✅ useApi (API calls, loading states, error handling)
- ✅ useLocalStorage (persistence, updates, error handling)
- ✅ useDebounce (delay functionality)
- ✅ useMediaQuery (responsive design, breakpoints)

### Services

- ✅ HTTP Client (requests, interceptors, error handling)
- ✅ API Service (CRUD operations, error handling)
- ✅ Auth Service (login, logout, token management)

### Store

- ✅ App Store (state management, actions)
- ✅ Store Hooks (selectors, updates)

### Utils

- ✅ Common utilities (string manipulation, array operations)
- ✅ Validation utilities
- ✅ Formatting utilities

## MSW Setup

API mocking is configured with MSW handlers in `tests/__mocks__/handlers.ts`. The server is
automatically started/stopped in the test setup.

## Best Practices

1. **Accessibility**: Tests include accessibility checks using `getByRole`
2. **User Events**: Use `@testing-library/user-event` for realistic interactions
3. **Async Testing**: Proper handling of async operations with `waitFor`
4. **CSS Modules**: Tests work with CSS module class names
5. **Error Boundaries**: Tests include error handling scenarios
6. **Memory Management**: Configuration optimized to prevent memory issues

## Troubleshooting

If tests hang or have memory issues:

1. Run tests individually: `npx vitest run path/to/test.tsx`
2. Check for infinite loops in useEffect hooks
3. Ensure proper cleanup in test teardown
4. Use the single fork configuration for memory efficiency
