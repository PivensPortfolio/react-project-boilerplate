# Contributing Guidelines

Thank you for your interest in contributing to the React Project Boilerplate! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)
- [Release Process](#release-process)

## Code of Conduct

### Our Pledge

We are committed to making participation in this project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

Examples of behavior that contributes to creating a positive environment include:

- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

### Enforcement

Instances of abusive, harassing, or otherwise unacceptable behavior may be reported by contacting the project team. All complaints will be reviewed and investigated promptly and fairly.

## Getting Started

### Prerequisites

- Node.js 18+ and npm 9+
- Git
- Code editor (VS Code recommended)
- Basic knowledge of React, TypeScript, and modern web development

### Development Setup

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/react-project-boilerplate.git
   cd react-project-boilerplate
   ```

3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/original-owner/react-project-boilerplate.git
   ```

4. **Install dependencies**:
   ```bash
   npm install
   ```

5. **Set up environment**:
   ```bash
   cp .env.example .env.local
   ```

6. **Start development server**:
   ```bash
   npm run dev
   ```

7. **Run tests** to ensure everything works:
   ```bash
   npm run test:run
   npm run lint
   npm run type-check
   ```

## Development Workflow

### Branch Strategy

We use a simplified Git flow:

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - Feature development branches
- `bugfix/*` - Bug fix branches
- `hotfix/*` - Critical production fixes

### Creating a Feature Branch

```bash
# Update your local main branch
git checkout main
git pull upstream main

# Create and switch to a new feature branch
git checkout -b feature/my-awesome-feature

# Push the branch to your fork
git push -u origin feature/my-awesome-feature
```

### Making Changes

1. **Make your changes** in logical, atomic commits
2. **Write or update tests** for your changes
3. **Update documentation** if necessary
4. **Run the test suite** to ensure nothing is broken
5. **Commit your changes** using conventional commit format

### Conventional Commits

We use [Conventional Commits](https://www.conventionalcommits.org/) for commit messages:

```bash
# Format
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]

# Examples
feat: add user authentication system
fix: resolve button loading state issue
docs: update API documentation
test: add tests for input validation
refactor: simplify error handling logic
style: fix code formatting issues
chore: update dependencies
```

#### Commit Types

- `feat` - New features
- `fix` - Bug fixes
- `docs` - Documentation changes
- `style` - Code style changes (formatting, etc.)
- `refactor` - Code refactoring
- `test` - Adding or updating tests
- `chore` - Maintenance tasks
- `perf` - Performance improvements
- `ci` - CI/CD changes

## Coding Standards

### TypeScript Guidelines

#### Type Definitions

```typescript
// Use interfaces for object shapes
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

// Use type aliases for unions and primitives
type Status = 'loading' | 'success' | 'error';
type ID = string | number;

// Use generics for reusable types
interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}
```

#### Component Props

```typescript
// Always define props interface
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  children: React.ReactNode;
}

// Use React.FC sparingly, prefer explicit typing
export const Button: React.FC<ButtonProps> = ({ variant = 'primary', ...props }) => {
  // Component implementation
};

// Preferred approach with forwardRef
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', ...props }, ref) => {
    // Component implementation
  }
);
```

#### Hooks and State

```typescript
// Type useState properly
const [user, setUser] = useState<User | null>(null);
const [loading, setLoading] = useState<boolean>(false);

// Type custom hooks
function useApi<T>(url: string): {
  data: T | null;
  loading: boolean;
  error: string | null;
} {
  // Hook implementation
}
```

### React Guidelines

#### Component Structure

```typescript
import React from 'react';
import styles from './MyComponent.module.css';

// 1. Type definitions
interface MyComponentProps {
  title: string;
  optional?: boolean;
}

// 2. Component implementation
export const MyComponent: React.FC<MyComponentProps> = ({ 
  title, 
  optional = false 
}) => {
  // 3. Hooks (in order: state, effects, custom hooks)
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Effect logic
  }, []);

  // 4. Event handlers
  const handleClick = useCallback(() => {
    setIsVisible(!isVisible);
  }, [isVisible]);

  // 5. Render logic
  return (
    <div className={styles.container}>
      <h2>{title}</h2>
      {optional && <p>Optional content</p>}
      <button onClick={handleClick}>Toggle</button>
    </div>
  );
};

// 6. Display name for debugging
MyComponent.displayName = 'MyComponent';
```

#### Performance Best Practices

```typescript
// Use React.memo for expensive components
export const ExpensiveComponent = React.memo<Props>(({ data }) => {
  return <div>{/* Expensive rendering */}</div>;
});

// Use useCallback for event handlers
const handleSubmit = useCallback((data: FormData) => {
  // Handle submission
}, [dependency]);

// Use useMemo for expensive calculations
const expensiveValue = useMemo(() => {
  return heavyCalculation(data);
}, [data]);

// Lazy load components
const LazyComponent = React.lazy(() => import('./LazyComponent'));
```

### CSS Guidelines

#### CSS Modules

```css
/* Use camelCase for class names */
.container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.primaryButton {
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  padding: var(--spacing-sm) var(--spacing-md);
}

/* Use BEM-like naming for modifiers */
.button {
  /* base styles */
}

.buttonPrimary {
  /* primary variant */
}

.buttonLarge {
  /* large size */
}
```

#### Responsive Design

```css
/* Mobile-first approach */
.container {
  padding: var(--spacing-sm);
}

/* Tablet */
@media (min-width: 768px) {
  .container {
    padding: var(--spacing-md);
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .container {
    padding: var(--spacing-lg);
  }
}
```

### Accessibility Guidelines

#### ARIA Attributes

```typescript
// Use semantic HTML first
<button onClick={handleClick}>Submit</button>

// Add ARIA when needed
<div
  role="button"
  tabIndex={0}
  aria-label="Close dialog"
  onClick={handleClose}
  onKeyDown={handleKeyDown}
>
  ×
</div>

// Form accessibility
<label htmlFor="email">Email Address</label>
<input
  id="email"
  type="email"
  aria-describedby="email-error"
  aria-invalid={hasError}
/>
{hasError && (
  <div id="email-error" role="alert">
    Please enter a valid email address
  </div>
)}
```

#### Keyboard Navigation

```typescript
const handleKeyDown = (event: React.KeyboardEvent) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    handleClick();
  }
};
```

## Testing Guidelines

### Test Structure

```typescript
// tests/components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui';

describe('Button', () => {
  // Group related tests
  describe('rendering', () => {
    it('renders with correct text', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByRole('button')).toHaveTextContent('Click me');
    });

    it('applies variant classes correctly', () => {
      render(<Button variant="primary">Primary</Button>);
      expect(screen.getByRole('button')).toHaveClass('primary');
    });
  });

  describe('interactions', () => {
    it('calls onClick when clicked', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      
      render(<Button onClick={handleClick}>Click me</Button>);
      
      await user.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('accessibility', () => {
    it('is keyboard accessible', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      
      render(<Button onClick={handleClick}>Click me</Button>);
      
      await user.tab();
      expect(screen.getByRole('button')).toHaveFocus();
      
      await user.keyboard('{Enter}');
      expect(handleClick).toHaveBeenCalled();
    });
  });
});
```

### Testing Hooks

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
  rest.get('/api/users', (req, res, ctx) => {
    return res(ctx.json({
      data: [{ id: '1', name: 'John Doe' }],
      success: true
    }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('userService', () => {
  it('fetches users successfully', async () => {
    const response = await userService.getAll();
    expect(response.data).toHaveLength(1);
    expect(response.data[0].name).toBe('John Doe');
  });
});
```

### Test Coverage

- Aim for **80%+ code coverage**
- Focus on **critical paths** and **edge cases**
- Test **user interactions** and **accessibility**
- Mock **external dependencies**

## Documentation

### Code Documentation

```typescript
/**
 * Custom hook for managing API requests with loading states
 * 
 * @param apiFunction - The async function that makes the API call
 * @param options - Configuration options for the hook
 * @returns Object containing data, loading state, error, and execute function
 * 
 * @example
 * ```typescript
 * const { data, loading, error, execute } = useApi(
 *   () => userService.getById(userId),
 *   { immediate: true }
 * );
 * ```
 */
export function useApi<T>(
  apiFunction: (...args: any[]) => Promise<T>,
  options: ApiOptions = {}
) {
  // Implementation
}
```

### README Updates

When adding new features:

1. Update the **Features** section
2. Add **usage examples**
3. Update **API documentation**
4. Include **migration notes** if needed

## Pull Request Process

### Before Submitting

1. **Sync with upstream**:
   ```bash
   git checkout main
   git pull upstream main
   git checkout feature/my-feature
   git rebase main
   ```

2. **Run all checks**:
   ```bash
   npm run lint
   npm run type-check
   npm run test:run
   npm run build
   ```

3. **Update documentation** if needed

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] New tests added for new functionality
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or breaking changes documented)
```

### Review Process

1. **Automated checks** must pass
2. **At least one approval** from maintainers
3. **All conversations resolved**
4. **Up-to-date** with main branch

## Issue Reporting

### Bug Reports

Use the bug report template:

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- OS: [e.g. iOS]
- Browser [e.g. chrome, safari]
- Version [e.g. 22]

**Additional context**
Any other context about the problem.
```

### Feature Requests

Use the feature request template:

```markdown
**Is your feature request related to a problem?**
A clear description of what the problem is.

**Describe the solution you'd like**
A clear description of what you want to happen.

**Describe alternatives you've considered**
Alternative solutions or features you've considered.

**Additional context**
Any other context or screenshots about the feature request.
```

## Release Process

### Versioning

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR** version for incompatible API changes
- **MINOR** version for backwards-compatible functionality
- **PATCH** version for backwards-compatible bug fixes

### Release Steps

1. **Update version** in `package.json`
2. **Update CHANGELOG.md**
3. **Create release PR**
4. **Tag release** after merge
5. **Publish to npm** (if applicable)
6. **Create GitHub release**

### Changelog Format

```markdown
## [1.2.0] - 2024-01-15

### Added
- New user authentication system
- Dark mode support

### Changed
- Improved button component accessibility
- Updated dependencies

### Fixed
- Fixed modal focus trap issue
- Resolved build warnings

### Deprecated
- Old API endpoints (will be removed in v2.0.0)

### Removed
- Unused utility functions

### Security
- Updated vulnerable dependencies
```

## Getting Help

- **Documentation**: Check README.md and component docs
- **Issues**: Search existing issues before creating new ones
- **Discussions**: Use GitHub Discussions for questions
- **Discord**: Join our community Discord server
- **Email**: Contact maintainers at [email]

## Recognition

Contributors will be recognized in:

- **README.md** contributors section
- **Release notes** for significant contributions
- **GitHub contributors** page
- **Annual contributor** highlights

Thank you for contributing to the React Project Boilerplate! 🎉