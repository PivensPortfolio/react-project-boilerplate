# TypeScript Guidelines

This steering file provides TypeScript development guidelines for this React project.

## Type Definitions

### Interface vs Type

- Use `interface` for object shapes that might be extended
- Use `type` for unions, primitives, and computed types
- Prefer interfaces for React component props

```tsx
// Good - Interface for extensible object shapes
interface UserProps {
  name: string;
  email: string;
}

interface AdminProps extends UserProps {
  permissions: string[];
}

// Good - Type for unions and computed types
type Status = 'loading' | 'success' | 'error';
type UserKeys = keyof UserProps;
```

### Naming Conventions

- Use PascalCase for interfaces and types
- Prefix interfaces with 'I' only when necessary for disambiguation
- Use descriptive names that indicate the purpose

```tsx
// Good
interface ButtonProps {
  variant: 'primary' | 'secondary';
  size: 'small' | 'medium' | 'large';
}

// Avoid generic names
interface Props {
  // Too generic
  data: any; // Avoid 'any'
}
```

### Component Props

- Always type component props explicitly
- Use optional properties with default values appropriately
- Avoid using `any` - use `unknown` if type is truly unknown

```tsx
interface ComponentProps {
  title: string;
  description?: string;
  onClick: (id: string) => void;
  children?: React.ReactNode;
}

export const Component: React.FC<ComponentProps> = ({
  title,
  description = '',
  onClick,
  children,
}) => {
  // Component implementation
};
```

### State and Hooks

- Type useState with explicit generic when initial value is null/undefined
- Type custom hooks return values
- Use proper types for useEffect dependencies

```tsx
// State typing
const [user, setUser] = useState<User | null>(null);
const [loading, setLoading] = useState(false); // Type inferred

// Custom hook typing
const useApi = <T>(url: string): {
  data: T | null;
  loading: boolean;
  error: string | null;
} => {
  // Hook implementation
};
```

### API and Data Types

- Define clear interfaces for API responses
- Use generic types for reusable API patterns
- Type async functions properly

```tsx
interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

const fetchUser = async (id: string): Promise<ApiResponse<User>> => {
  // API call implementation
};
```

### Event Handlers

- Use proper event types for DOM events
- Type custom event handlers clearly

```tsx
interface FormProps {
  onSubmit: (data: FormData) => void;
  onChange: (field: string, value: string) => void;
}

const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
  event.preventDefault();
  // Handle click
};

const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = event.target;
  // Handle change
};
```

### Utility Types

- Leverage TypeScript utility types for common patterns
- Create custom utility types for project-specific needs

```tsx
// Using built-in utility types
type PartialUser = Partial<User>;
type UserEmail = Pick<User, 'email'>;
type UserWithoutId = Omit<User, 'id'>;

// Custom utility types
type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
type RequiredProps<T> = Required<Pick<T, keyof T>>;
```

### Error Handling

- Type errors appropriately
- Use discriminated unions for error states

```tsx
type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string };

const [state, setState] = useState<AsyncState<User>>({ status: 'idle' });
```

### Best Practices

- Enable strict mode in tsconfig.json
- Use `noImplicitAny` and `strictNullChecks`
- Avoid `any` - use `unknown` or proper types
- Use type assertions sparingly and with type guards
- Prefer type narrowing over type assertions

```tsx
// Good - Type narrowing
if (typeof value === 'string') {
  // TypeScript knows value is string here
  console.log(value.toUpperCase());
}

// Good - Type guard
const isUser = (obj: unknown): obj is User => {
  return typeof obj === 'object' && obj !== null && 'id' in obj && 'name' in obj;
};

// Avoid - Type assertion without checking
const user = data as User; // Risky
```

### Import/Export Types

- Use `import type` for type-only imports
- Export types alongside implementations when appropriate

```tsx
import type { User } from './types';
import { fetchUser } from './api';

export type { User };
export { fetchUser };
```
