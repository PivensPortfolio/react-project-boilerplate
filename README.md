# React Project Boilerplate

[![GitHub stars](https://img.shields.io/github/stars/YOUR_USERNAME/react-project-boilerplate?style=social)](https://github.com/YOUR_USERNAME/react-project-boilerplate/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/YOUR_USERNAME/react-project-boilerplate?style=social)](https://github.com/YOUR_USERNAME/react-project-boilerplate/network/members)
[![GitHub issues](https://img.shields.io/github/issues/YOUR_USERNAME/react-project-boilerplate)](https://github.com/YOUR_USERNAME/react-project-boilerplate/issues)
[![GitHub license](https://img.shields.io/github/license/YOUR_USERNAME/react-project-boilerplate)](https://github.com/YOUR_USERNAME/react-project-boilerplate/blob/main/LICENSE)
[![CI](https://github.com/YOUR_USERNAME/react-project-boilerplate/workflows/CI/badge.svg)](https://github.com/YOUR_USERNAME/react-project-boilerplate/actions)

A modern, production-ready React boilerplate with TypeScript, Vite, and comprehensive tooling for rapid development.

> 🎯 **Perfect for**: New React projects, prototypes, learning, and production applications
> 
> ⚡ **Quick Start**: Use this template → Clone → `npm install` → `npm run dev` → Start coding!

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm 9+
- Git
- Docker (optional, for containerized development)

### Installation

1. **Clone or extract the project:**
   ```bash
   git clone <your-repo-url>
   cd {{PROJECT_NAME}}
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:5173](http://localhost:5173)

## 🎯 Using This Template

### Option 1: GitHub Template (Recommended)
1. Click the **"Use this template"** button above
2. Create a new repository from this template
3. Clone your new repository
4. Follow the installation steps above

### Option 2: Clone Directly
```bash
git clone https://github.com/YOUR_USERNAME/react-project-boilerplate.git my-new-project
cd my-new-project
rm -rf .git
git init
npm install
npm run dev
```

### Option 3: Download ZIP
1. Click **"Code"** → **"Download ZIP"**
2. Extract the files
3. Follow the installation steps above

## 📋 Table of Contents

- [Features](#-features)
- [Project Structure](#-project-structure)
- [Available Scripts](#-available-scripts)
- [Development Guide](#-development-guide)
- [Component Library](#-component-library)
- [State Management](#-state-management)
- [API Integration](#-api-integration)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Kiro AI Integration](#-kiro-ai-integration)
- [Contributing](#-contributing)

## ✨ Features

### Core Technologies
- **React 18** with TypeScript
- **Vite** for fast development and building
- **React Router v6** for routing
- **Zustand** for state management
- **CSS Modules** for styling

### Development Tools
- **ESLint** with React, TypeScript, and accessibility rules
- **Prettier** for code formatting
- **Husky** for Git hooks
- **lint-staged** for pre-commit checks
- **Vitest** and React Testing Library for testing

### Production Features
- **Docker** support with multi-stage builds
- **GitHub Actions** CI/CD pipeline
- **Error boundaries** and error handling
- **Performance optimization** with code splitting
- **Accessibility** compliance (WCAG 2.1)

### Kiro AI Integration
- **MCP configuration** for development tools
- **Steering files** with React best practices
- **Custom hooks** for common development tasks
- **AI-assisted development** workflow

## 📁 Project Structure

```
react-project-boilerplate/
├── public/                 # Static assets
├── src/
│   ├── components/         # React components
│   │   ├── common/        # Shared components
│   │   ├── examples/      # Example components
│   │   └── ui/           # UI component library
│   ├── hooks/             # Custom React hooks
│   ├── pages/             # Page components
│   ├── services/          # API and business logic
│   ├── store/             # State management
│   ├── styles/            # Global styles and variables
│   ├── utils/             # Utility functions
│   ├── App.tsx           # Main app component
│   └── main.tsx          # App entry point
├── tests/                 # Test files and setup
├── .kiro/                # Kiro AI configuration
├── .github/              # GitHub Actions workflows
├── docker/               # Docker configuration
└── scripts/              # Build and deployment scripts
```

## 🛠 Available Scripts

### Development
```bash
npm run dev          # Start development server (port 5173)
npm run build        # Build for production
npm run preview      # Preview production build locally
```

### Code Quality
```bash
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues automatically
npm run format       # Format code with Prettier
npm run format:check # Check code formatting
npm run type-check   # Run TypeScript type checking
```

### Testing
```bash
npm run test         # Run tests in watch mode
npm run test:run     # Run tests once
npm run test:ui      # Run tests with UI interface
```

## 🔧 Development Guide

### Environment Variables

Create a `.env.local` file based on `.env.example`:

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:3001/api
VITE_APP_ENVIRONMENT=development

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_ERROR_REPORTING=false
VITE_ENABLE_DEBUG_MODE=true
```

### Adding New Components

1. Create component in appropriate directory:
   ```typescript
   // src/components/ui/MyComponent.tsx
   import React from 'react';
   import styles from './MyComponent.module.css';

   export interface MyComponentProps {
     title: string;
     onClick?: () => void;
   }

   export const MyComponent: React.FC<MyComponentProps> = ({ title, onClick }) => {
     return (
       <div className={styles.container} onClick={onClick}>
         {title}
       </div>
     );
   };
   ```

2. Create corresponding CSS module:
   ```css
   /* src/components/ui/MyComponent.module.css */
   .container {
     padding: 1rem;
     border-radius: 0.5rem;
     background-color: var(--color-background);
   }
   ```

3. Export from index file:
   ```typescript
   // src/components/ui/index.ts
   export { MyComponent } from './MyComponent';
   ```

### Custom Hooks

Create reusable hooks in the `src/hooks` directory:

```typescript
// src/hooks/useCounter.ts
import { useState, useCallback } from 'react';

export function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);

  const increment = useCallback(() => setCount(c => c + 1), []);
  const decrement = useCallback(() => setCount(c => c - 1), []);
  const reset = useCallback(() => setCount(initialValue), [initialValue]);

  return { count, increment, decrement, reset };
}
```

### API Services

Add new API services in the `src/services` directory:

```typescript
// src/services/myService.ts
import { httpClient } from './httpClient';
import type { ApiResponse } from './types';

export interface MyData {
  id: string;
  name: string;
}

export const myService = {
  getAll: (): Promise<ApiResponse<MyData[]>> =>
    httpClient.get('/my-data'),

  getById: (id: string): Promise<ApiResponse<MyData>> =>
    httpClient.get(`/my-data/${id}`),

  create: (data: Omit<MyData, 'id'>): Promise<ApiResponse<MyData>> =>
    httpClient.post('/my-data', data),
};
```

## 🎨 Component Library

### Button Component

```typescript
import { Button } from '@/components/ui';

// Basic usage
<Button onClick={handleClick}>Click me</Button>

// With variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="danger">Danger</Button>

// With sizes
<Button size="small">Small</Button>
<Button size="medium">Medium</Button>
<Button size="large">Large</Button>

// Loading state
<Button loading>Loading...</Button>

// As link
<Button as="a" href="/path">Link Button</Button>
```

### Input Component

```typescript
import { Input } from '@/components/ui';

// Basic usage
<Input
  label="Email"
  type="email"
  placeholder="Enter your email"
  onChange={handleChange}
/>

// With validation
<Input
  label="Password"
  type="password"
  validation={{
    required: true,
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/
  }}
  onValidation={(isValid, error) => console.log(isValid, error)}
/>

// With icons
<Input
  label="Search"
  leftIcon={<SearchIcon />}
  rightIcon={<ClearIcon />}
/>
```

### Modal Component

```typescript
import { Modal } from '@/components/ui';

<Modal
  isOpen={isModalOpen}
  onClose={handleClose}
  title="Confirm Action"
  size="medium"
>
  <p>Are you sure you want to continue?</p>
  <div className="modal-actions">
    <Button variant="outline" onClick={handleClose}>Cancel</Button>
    <Button variant="primary" onClick={handleConfirm}>Confirm</Button>
  </div>
</Modal>
```

## 🗄 State Management

### Using the App Store

```typescript
import { useAppStore } from '@/store';

function MyComponent() {
  const { user, theme, setUser, toggleTheme } = useAppStore();

  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={toggleTheme}>Toggle Theme</button>
      {user && <p>Welcome, {user.name}!</p>}
    </div>
  );
}
```

### Creating Custom Stores

```typescript
// src/store/myStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface MyStore {
  items: string[];
  addItem: (item: string) => void;
  removeItem: (index: number) => void;
}

export const useMyStore = create<MyStore>()(
  devtools(
    (set) => ({
      items: [],
      addItem: (item) => set((state) => ({ 
        items: [...state.items, item] 
      })),
      removeItem: (index) => set((state) => ({ 
        items: state.items.filter((_, i) => i !== index) 
      })),
    }),
    { name: 'MyStore' }
  )
);
```

## 🌐 API Integration

### Using the useApi Hook

```typescript
import { useApi } from '@/hooks';
import { userService } from '@/services';

function UserProfile({ userId }: { userId: string }) {
  const { data: user, loading, error, execute } = useApi(
    () => userService.getById(userId),
    { immediate: true }
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>{user?.name}</h1>
      <button onClick={() => execute()}>Refresh</button>
    </div>
  );
}
```

### Using Mutations

```typescript
import { useMutation } from '@/hooks';
import { userService } from '@/services';

function CreateUser() {
  const { mutate: createUser, loading, error } = useMutation(
    userService.create,
    {
      onSuccess: (user) => console.log('User created:', user),
      onError: (error) => console.error('Failed to create user:', error),
    }
  );

  const handleSubmit = (userData: CreateUserData) => {
    createUser(userData);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create User'}
      </button>
      {error && <div className="error">{error}</div>}
    </form>
  );
}
```

## 🧪 Testing

### Component Testing

```typescript
// tests/components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    render(<Button loading>Loading</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### Hook Testing

```typescript
// tests/hooks/useCounter.test.ts
import { renderHook, act } from '@testing-library/react';
import { useCounter } from '@/hooks/useCounter';

describe('useCounter', () => {
  it('initializes with default value', () => {
    const { result } = renderHook(() => useCounter());
    expect(result.current.count).toBe(0);
  });

  it('increments count', () => {
    const { result } = renderHook(() => useCounter());
    
    act(() => {
      result.current.increment();
    });
    
    expect(result.current.count).toBe(1);
  });
});
```

### API Testing with MSW

```typescript
// tests/services/userService.test.ts
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { userService } from '@/services';

const server = setupServer(
  rest.get('/api/users/:id', (req, res, ctx) => {
    return res(ctx.json({
      data: { id: '1', name: 'John Doe', email: 'john@example.com' },
      success: true,
      message: 'User retrieved successfully'
    }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('userService', () => {
  it('fetches user by id', async () => {
    const response = await userService.getById('1');
    expect(response.data.name).toBe('John Doe');
  });
});
```

## 🚀 Deployment

### Docker Deployment

```bash
# Build and run with Docker
docker build -t react-app .
docker run -p 8080:80 react-app

# Or use Docker Compose
docker-compose up --build
```

### Environment-Specific Builds

```bash
# Development build
npm run build

# Production build with environment
NODE_ENV=production npm run build

# Staging build
NODE_ENV=staging npm run build
```

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## 🤖 Kiro AI Integration

### MCP Configuration

The project includes pre-configured MCP servers in `.kiro/settings/mcp.json`:

- **React development tools**
- **TypeScript language server**
- **Testing utilities**
- **Code formatting tools**

### Steering Files

Located in `.kiro/steering/`:

- `react-best-practices.md` - React component patterns and performance tips
- `typescript-guidelines.md` - TypeScript coding standards and type definitions

### Kiro Hooks

Pre-configured hooks for common development tasks:

- **Test Runner**: Automatically run tests on file save
- **Code Formatter**: Format code with Prettier on save
- **Build Checker**: Validate build on commit

### Using Kiro for Development

1. **Component Generation**: Ask Kiro to generate new components following the project patterns
2. **Test Writing**: Use Kiro to write comprehensive tests for your components
3. **Code Review**: Leverage steering files for automated code review suggestions
4. **Refactoring**: Get AI assistance for safe code refactoring

## 🤝 Contributing

### Development Workflow

1. **Fork and clone** the repository
2. **Create a feature branch**: `git checkout -b feature/my-feature`
3. **Make changes** following the coding standards
4. **Run tests**: `npm run test`
5. **Run linting**: `npm run lint`
6. **Commit changes**: Use conventional commit format
7. **Push and create** a pull request

### Coding Standards

- **TypeScript**: Use strict type checking
- **Components**: Use functional components with TypeScript interfaces
- **Styling**: Use CSS Modules for component styles
- **Testing**: Write tests for all new components and hooks
- **Commits**: Follow conventional commit format

### Code Review Checklist

- [ ] Code follows TypeScript and React best practices
- [ ] Components are properly typed with interfaces
- [ ] Tests are written and passing
- [ ] Code is formatted with Prettier
- [ ] No ESLint warnings or errors
- [ ] Accessibility guidelines are followed
- [ ] Performance considerations are addressed

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Zustand Documentation](https://github.com/pmndrs/zustand)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [troubleshooting section](./DEPLOYMENT.md#troubleshooting) in DEPLOYMENT.md
2. Search existing [GitHub issues](https://github.com/your-repo/issues)
3. Create a new issue with detailed information
4. Use Kiro AI assistance for development questions

---

**Happy coding! 🎉**