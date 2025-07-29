import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '@/components/ui/Input';

describe('Input', () => {
  it('renders with default props', () => {
    render(<Input placeholder="Enter text" />);
    
    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toBeInTheDocument();
    expect(input).toHaveClass('input', 'medium');
  });

  it('renders with label', () => {
    render(<Input label="Username" placeholder="Enter username" />);
    
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByText('Username')).toHaveClass('label');
  });

  it('renders different sizes', () => {
    const { rerender } = render(<Input size="small" placeholder="Small" />);
    expect(screen.getByPlaceholderText('Small')).toHaveClass('small');

    rerender(<Input size="large" placeholder="Large" />);
    expect(screen.getByPlaceholderText('Large')).toHaveClass('large');
  });

  it('handles fullWidth prop', () => {
    render(<Input fullWidth placeholder="Full width" />);
    
    const wrapper = screen.getByPlaceholderText('Full width').closest('.inputWrapper');
    expect(wrapper).toHaveClass('fullWidth');
  });

  it('displays error message', () => {
    render(<Input error="This field is required" placeholder="Input" />);
    
    const input = screen.getByPlaceholderText('Input');
    expect(input).toHaveClass('error');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent('This field is required');
  });

  it('displays success message', () => {
    render(<Input success="Valid input" placeholder="Input" />);
    
    const input = screen.getByPlaceholderText('Input');
    expect(input).toHaveClass('success');
    expect(screen.getByText('Valid input')).toBeInTheDocument();
  });

  it('displays helper text', () => {
    render(<Input helperText="Enter your username" placeholder="Input" />);
    
    expect(screen.getByText('Enter your username')).toHaveClass('helperText');
  });

  it('renders with icons', () => {
    render(
      <Input
        leftIcon={<span data-testid="left-icon">👤</span>}
        rightIcon={<span data-testid="right-icon">🔍</span>}
        placeholder="Input"
      />
    );
    
    const input = screen.getByPlaceholderText('Input');
    expect(input).toHaveClass('hasLeftIcon', 'hasRightIcon');
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
  });

  it('handles required validation', async () => {
    const onValidation = vi.fn();
    render(
      <Input
        validation={{ required: true }}
        onValidation={onValidation}
        placeholder="Required input"
      />
    );
    
    const input = screen.getByPlaceholderText('Required input');
    
    // Focus and blur without entering text
    await userEvent.click(input);
    await userEvent.tab();
    
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('This field is required');
      expect(onValidation).toHaveBeenCalledWith(false, 'This field is required');
    });
  });

  it('handles minLength validation', async () => {
    const onValidation = vi.fn();
    render(
      <Input
        validation={{ minLength: 5 }}
        onValidation={onValidation}
        placeholder="Min length input"
      />
    );
    
    const input = screen.getByPlaceholderText('Min length input');
    
    await userEvent.type(input, 'abc');
    await userEvent.tab();
    
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Minimum length is 5 characters');
      expect(onValidation).toHaveBeenCalledWith(false, 'Minimum length is 5 characters');
    });
  });

  it('handles maxLength validation', async () => {
    const onValidation = vi.fn();
    render(
      <Input
        validation={{ maxLength: 3 }}
        onValidation={onValidation}
        placeholder="Max length input"
      />
    );
    
    const input = screen.getByPlaceholderText('Max length input');
    
    await userEvent.type(input, 'abcd');
    await userEvent.tab();
    
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Maximum length is 3 characters');
      expect(onValidation).toHaveBeenCalledWith(false, 'Maximum length is 3 characters');
    });
  });

  it('handles pattern validation', async () => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const onValidation = vi.fn();
    
    render(
      <Input
        validation={{ pattern: emailPattern }}
        onValidation={onValidation}
        placeholder="Email input"
      />
    );
    
    const input = screen.getByPlaceholderText('Email input');
    
    await userEvent.type(input, 'invalid-email');
    await userEvent.tab();
    
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Invalid format');
      expect(onValidation).toHaveBeenCalledWith(false, 'Invalid format');
    });
  });

  it('handles custom validation', async () => {
    const customValidator = (value: string) => {
      return value === 'forbidden' ? 'This value is not allowed' : null;
    };
    
    const onValidation = vi.fn();
    
    render(
      <Input
        validation={{ custom: customValidator }}
        onValidation={onValidation}
        placeholder="Custom validation input"
      />
    );
    
    const input = screen.getByPlaceholderText('Custom validation input');
    
    await userEvent.type(input, 'forbidden');
    await userEvent.tab();
    
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('This value is not allowed');
      expect(onValidation).toHaveBeenCalledWith(false, 'This value is not allowed');
    });
  });

  it('validates on change after first blur', async () => {
    const onValidation = vi.fn();
    render(
      <Input
        validation={{ required: true }}
        onValidation={onValidation}
        placeholder="Validation input"
      />
    );
    
    const input = screen.getByPlaceholderText('Validation input');
    
    // First blur to trigger touched state
    await userEvent.click(input);
    await userEvent.tab();
    
    // Clear previous calls
    onValidation.mockClear();
    
    // Now typing should trigger validation
    await userEvent.type(input, 'valid text');
    
    await waitFor(() => {
      expect(onValidation).toHaveBeenCalledWith(true, undefined);
    });
  });

  it('shows required indicator for required fields', () => {
    render(<Input label="Required Field" validation={{ required: true }} />);
    
    expect(screen.getByText('Required Field')).toHaveClass('required');
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(<Input ref={ref} placeholder="Ref input" />);
    
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLInputElement));
  });

  it('handles onChange and onBlur events', async () => {
    const onChange = vi.fn();
    const onBlur = vi.fn();
    
    render(
      <Input
        onChange={onChange}
        onBlur={onBlur}
        placeholder="Event input"
      />
    );
    
    const input = screen.getByPlaceholderText('Event input');
    
    await userEvent.type(input, 'test');
    expect(onChange).toHaveBeenCalledTimes(4); // One for each character
    
    await userEvent.tab();
    expect(onBlur).toHaveBeenCalledTimes(1);
  });
});