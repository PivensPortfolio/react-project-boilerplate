# React Best Practices

This steering file provides guidelines for React development in this project.

## Component Guidelines

### Functional Components

- Always use functional components with hooks instead of class components
- Use TypeScript interfaces for props and state
- Keep components small and focused on a single responsibility

### Component Structure

```tsx
interface ComponentProps {
  // Define props with clear types
  title: string;
  isVisible?: boolean;
  onAction?: () => void;
}

export const Component: React.FC<ComponentProps> = ({ title, isVisible = true, onAction }) => {
  // Component logic here
  return <div>{/* JSX here */}</div>;
};
```

### Hooks Usage

- Use built-in hooks (useState, useEffect, useContext) appropriately
- Create custom hooks for reusable logic
- Follow the rules of hooks (only call at top level, only in React functions)
- Use useCallback and useMemo for performance optimization when needed

### State Management

- Use local state (useState) for component-specific state
- Use Zustand store for global application state
- Avoid prop drilling - use context or global state for deeply nested data

### Event Handling

- Use arrow functions for event handlers to maintain proper `this` binding
- Prefer inline handlers for simple operations
- Extract complex event handlers to separate functions

### Styling

- Use CSS Modules for component-specific styles
- Follow BEM naming convention for CSS classes
- Use CSS custom properties for theme variables
- Prefer semantic HTML elements

### Performance

- Use React.memo for expensive components that re-render frequently
- Implement proper key props for list items
- Avoid creating objects/functions in render methods
- Use lazy loading for large components

### Accessibility

- Always include proper ARIA attributes
- Ensure keyboard navigation works
- Use semantic HTML elements
- Test with screen readers
- Maintain proper color contrast ratios

### Error Handling

- Use Error Boundaries for component error catching
- Handle async operations with proper error states
- Provide meaningful error messages to users

### Testing

- Write unit tests for all components
- Test user interactions, not implementation details
- Use React Testing Library for component testing
- Mock external dependencies appropriately

## File Organization

- Group related components in folders
- Use index.ts files for clean imports
- Keep component files focused and under 200 lines
- Separate concerns (components, hooks, utils, types)
