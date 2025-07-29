# Component API Documentation

This document provides detailed API documentation and usage examples for all components in the React Project Boilerplate.

## Table of Contents

- [UI Components](#ui-components)
  - [Button](#button)
  - [Input](#input)
  - [Modal](#modal)
  - [Loading](#loading)
- [Common Components](#common-components)
  - [ErrorBoundary](#errorboundary)
  - [Navigation](#navigation)
- [Example Components](#example-components)
  - [ApiExample](#apiexample)
  - [ErrorExample](#errorexample)

## UI Components

### Button

A versatile button component with multiple variants, sizes, and states.

#### Props

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
  as?: 'button' | 'a';
  href?: string;
}
```

#### Usage Examples

```typescript
import { Button } from '@/components/ui';

// Basic button
<Button onClick={handleClick}>Click me</Button>

// Primary button (default)
<Button variant="primary">Primary Action</Button>

// Secondary button
<Button variant="secondary">Secondary Action</Button>

// Outline button
<Button variant="outline">Outline Button</Button>

// Ghost button (minimal styling)
<Button variant="ghost">Ghost Button</Button>

// Danger button (for destructive actions)
<Button variant="danger" onClick={handleDelete}>
  Delete Item
</Button>

// Different sizes
<Button size="small">Small</Button>
<Button size="medium">Medium</Button>
<Button size="large">Large</Button>

// Loading state
<Button loading disabled>
  Processing...
</Button>

// Full width
<Button fullWidth>Full Width Button</Button>

// As link
<Button as="a" href="/dashboard" variant="primary">
  Go to Dashboard
</Button>

// With custom styling
<Button 
  className="custom-button" 
  style={{ marginTop: '1rem' }}
>
  Custom Styled
</Button>
```

#### Accessibility Features

- Proper ARIA attributes
- Keyboard navigation support
- Focus management
- Screen reader compatibility
- Disabled state handling

---

### Input

A comprehensive input component with validation, icons, and multiple states.

#### Props

```typescript
interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => string | null;
}

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  size?: 'small' | 'medium' | 'large';
  error?: string;
  success?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  validation?: ValidationRule;
  onValidation?: (isValid: boolean, error?: string) => void;
}
```

#### Usage Examples

```typescript
import { Input } from '@/components/ui';
import { SearchIcon, EyeIcon, EyeOffIcon } from '@/components/icons';

// Basic input
<Input
  label="Full Name"
  placeholder="Enter your full name"
  onChange={handleChange}
/>

// Email input with validation
<Input
  label="Email Address"
  type="email"
  validation={{
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  }}
  onValidation={(isValid, error) => {
    console.log('Email valid:', isValid, error);
  }}
/>

// Password input with custom validation
<Input
  label="Password"
  type="password"
  validation={{
    required: true,
    minLength: 8,
    custom: (value) => {
      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
        return 'Password must contain uppercase, lowercase, and number';
      }
      return null;
    }
  }}
/>

// Search input with icons
<Input
  label="Search"
  placeholder="Search users..."
  leftIcon={<SearchIcon />}
  rightIcon={<ClearIcon onClick={handleClear} />}
/>

// Input with helper text
<Input
  label="Username"
  helperText="Username must be 3-20 characters long"
  validation={{ minLength: 3, maxLength: 20 }}
/>

// Input with external error
<Input
  label="Server Validation"
  error={serverError}
  value={inputValue}
  onChange={handleChange}
/>

// Success state
<Input
  label="Verified Email"
  success="Email verified successfully!"
  value={verifiedEmail}
  readOnly
/>

// Different sizes
<Input size="small" label="Small Input" />
<Input size="medium" label="Medium Input" />
<Input size="large" label="Large Input" />

// Full width
<Input fullWidth label="Full Width Input" />

// Controlled component example
function ControlledInput() {
  const [value, setValue] = useState('');
  const [isValid, setIsValid] = useState(false);

  return (
    <Input
      label="Controlled Input"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      validation={{ required: true, minLength: 3 }}
      onValidation={setIsValid}
    />
  );
}
```

#### Validation Rules

```typescript
// Required field
validation={{ required: true }}

// Length constraints
validation={{ minLength: 3, maxLength: 50 }}

// Pattern matching
validation={{ pattern: /^[A-Za-z\s]+$/ }} // Only letters and spaces

// Custom validation
validation={{
  custom: (value) => {
    if (value.includes('admin')) {
      return 'Username cannot contain "admin"';
    }
    return null;
  }
}}

// Combined validation
validation={{
  required: true,
  minLength: 8,
  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
  custom: (value) => {
    if (value.toLowerCase().includes('password')) {
      return 'Password cannot contain the word "password"';
    }
    return null;
  }
}}
```

#### Accessibility Features

- Proper labeling and ARIA attributes
- Error announcements for screen readers
- Keyboard navigation
- Focus management
- Required field indicators

---

### Modal

A flexible modal component with portal rendering and accessibility features.

#### Props

```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  children: React.ReactNode;
  className?: string;
  overlayClassName?: string;
}
```

#### Usage Examples

```typescript
import { Modal, Button } from '@/components/ui';

// Basic modal
<Modal
  isOpen={isModalOpen}
  onClose={handleClose}
  title="Confirm Action"
>
  <p>Are you sure you want to delete this item?</p>
  <div className="modal-actions">
    <Button variant="outline" onClick={handleClose}>
      Cancel
    </Button>
    <Button variant="danger" onClick={handleConfirm}>
      Delete
    </Button>
  </div>
</Modal>

// Large modal with custom content
<Modal
  isOpen={isSettingsOpen}
  onClose={handleCloseSettings}
  title="Settings"
  size="large"
>
  <div className="settings-content">
    <h3>User Preferences</h3>
    <form onSubmit={handleSaveSettings}>
      <Input label="Display Name" />
      <Input label="Email" type="email" />
      <Button type="submit">Save Settings</Button>
    </form>
  </div>
</Modal>

// Modal without close button
<Modal
  isOpen={isProcessing}
  onClose={() => {}} // No-op
  title="Processing..."
  closeOnOverlayClick={false}
  closeOnEscape={false}
  showCloseButton={false}
>
  <div className="processing-content">
    <Loading />
    <p>Please wait while we process your request...</p>
  </div>
</Modal>

// Fullscreen modal
<Modal
  isOpen={isFullscreen}
  onClose={handleClose}
  size="fullscreen"
  title="Image Viewer"
>
  <img src={imageUrl} alt="Full size image" />
</Modal>

// Custom styled modal
<Modal
  isOpen={isCustomOpen}
  onClose={handleClose}
  className="custom-modal"
  overlayClassName="custom-overlay"
>
  <div className="custom-content">
    Custom modal content
  </div>
</Modal>
```

#### Modal Hook Example

```typescript
// Custom hook for modal state management
function useModal(initialState = false) {
  const [isOpen, setIsOpen] = useState(initialState);

  const openModal = useCallback(() => setIsOpen(true), []);
  const closeModal = useCallback(() => setIsOpen(false), []);
  const toggleModal = useCallback(() => setIsOpen(prev => !prev), []);

  return { isOpen, openModal, closeModal, toggleModal };
}

// Usage
function MyComponent() {
  const { isOpen, openModal, closeModal } = useModal();

  return (
    <>
      <Button onClick={openModal}>Open Modal</Button>
      <Modal isOpen={isOpen} onClose={closeModal} title="My Modal">
        Modal content here
      </Modal>
    </>
  );
}
```

#### Accessibility Features

- Focus trap within modal
- Escape key to close
- ARIA attributes for screen readers
- Focus restoration after close
- Overlay click to close (configurable)

---

### Loading

A customizable loading spinner component.

#### Props

```typescript
interface LoadingProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  text?: string;
  overlay?: boolean;
  className?: string;
}
```

#### Usage Examples

```typescript
import { Loading } from '@/components/ui';

// Basic loading spinner
<Loading />

// With text
<Loading text="Loading..." />

// Different sizes
<Loading size="small" />
<Loading size="medium" />
<Loading size="large" />

// Custom color
<Loading color="#007bff" />

// As overlay
<Loading overlay text="Processing your request..." />

// In a component
function DataComponent() {
  const { data, loading, error } = useApi(fetchData);

  if (loading) return <Loading text="Fetching data..." />;
  if (error) return <div>Error: {error}</div>;

  return <div>{/* render data */}</div>;
}
```

## Common Components

### ErrorBoundary

A React error boundary component that catches JavaScript errors in child components.

#### Props

```typescript
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}
```

#### Usage Examples

```typescript
import { ErrorBoundary } from '@/components/common';

// Basic usage
<ErrorBoundary>
  <MyComponent />
</ErrorBoundary>

// With custom fallback
<ErrorBoundary
  fallback={({ error, resetError }) => (
    <div className="error-fallback">
      <h2>Something went wrong</h2>
      <p>{error.message}</p>
      <button onClick={resetError}>Try again</button>
    </div>
  )}
>
  <MyComponent />
</ErrorBoundary>

// With error logging
<ErrorBoundary
  onError={(error, errorInfo) => {
    console.error('Error caught by boundary:', error, errorInfo);
    // Send to error reporting service
  }}
>
  <MyComponent />
</ErrorBoundary>
```

### Navigation

A responsive navigation component with routing support.

#### Props

```typescript
interface NavigationProps {
  className?: string;
  variant?: 'horizontal' | 'vertical';
  items?: NavigationItem[];
}

interface NavigationItem {
  label: string;
  path: string;
  icon?: React.ReactNode;
  active?: boolean;
}
```

#### Usage Examples

```typescript
import { Navigation } from '@/components/common';

// Basic navigation
<Navigation />

// With custom items
<Navigation
  items={[
    { label: 'Home', path: '/', icon: <HomeIcon /> },
    { label: 'About', path: '/about', icon: <InfoIcon /> },
    { label: 'Contact', path: '/contact', icon: <ContactIcon /> },
  ]}
/>

// Vertical navigation
<Navigation variant="vertical" />
```

## Example Components

### ApiExample

Demonstrates API integration patterns using the useApi hook.

#### Usage

```typescript
import { ApiExample } from '@/components/examples';

// Shows loading states, error handling, and data display
<ApiExample />
```

### ErrorExample

Demonstrates error handling and error boundary usage.

#### Usage

```typescript
import { ErrorExample } from '@/components/examples';

// Shows different error scenarios and recovery
<ErrorExample />
```

## Component Development Guidelines

### Creating New Components

1. **Use TypeScript interfaces** for props
2. **Forward refs** when necessary
3. **Include accessibility** attributes
4. **Use CSS Modules** for styling
5. **Write comprehensive tests**
6. **Document with JSDoc** comments

### Example Component Template

```typescript
import React from 'react';
import styles from './MyComponent.module.css';

export interface MyComponentProps {
  /** The title to display */
  title: string;
  /** Optional description */
  description?: string;
  /** Click handler */
  onClick?: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * MyComponent description
 * 
 * @example
 * ```tsx
 * <MyComponent 
 *   title="Hello World" 
 *   description="This is a description"
 *   onClick={handleClick}
 * />
 * ```
 */
export const MyComponent = React.forwardRef<HTMLDivElement, MyComponentProps>(
  ({ title, description, onClick, className = '', ...props }, ref) => {
    const classes = [styles.container, className].filter(Boolean).join(' ');

    return (
      <div
        ref={ref}
        className={classes}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        {...props}
      >
        <h2 className={styles.title}>{title}</h2>
        {description && <p className={styles.description}>{description}</p>}
      </div>
    );
  }
);

MyComponent.displayName = 'MyComponent';
```

### Testing Components

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('renders title correctly', () => {
    render(<MyComponent title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<MyComponent title="Test" onClick={handleClick} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies custom className', () => {
    render(<MyComponent title="Test" className="custom-class" />);
    expect(screen.getByText('Test').parentElement).toHaveClass('custom-class');
  });
});
```

## Styling Guidelines

### CSS Modules

- Use camelCase for class names
- Prefix with component name for clarity
- Use CSS custom properties for theming

```css
/* MyComponent.module.css */
.container {
  padding: var(--spacing-md);
  border-radius: var(--border-radius);
  background-color: var(--color-background);
}

.title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-sm);
}

.description {
  color: var(--color-text-secondary);
  line-height: var(--line-height-relaxed);
}

/* Responsive design */
@media (max-width: 768px) {
  .container {
    padding: var(--spacing-sm);
  }
}
```

### CSS Custom Properties

Available in `src/styles/variables.css`:

```css
:root {
  /* Colors */
  --color-primary: #007bff;
  --color-secondary: #6c757d;
  --color-success: #28a745;
  --color-danger: #dc3545;
  --color-warning: #ffc107;
  
  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  
  /* Typography */
  --font-size-sm: 0.875rem;
  --font-size-md: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  
  /* Border radius */
  --border-radius: 0.375rem;
  --border-radius-lg: 0.5rem;
}
```

This documentation provides comprehensive information about all components in the boilerplate, including their APIs, usage examples, and development guidelines.