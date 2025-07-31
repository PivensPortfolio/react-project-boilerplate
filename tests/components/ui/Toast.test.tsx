import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { Toast } from '../../../src/components/ui/Toast/Toast';
import type { Toast as ToastType } from '../../../src/types/toast';

// Mock the CSS import to avoid issues in test environment
vi.mock('../../../src/components/ui/Toast/Toast.css', () => ({}));

describe('Toast Component', () => {
  const mockOnRemove = vi.fn();

  const defaultToast: ToastType = {
    id: 'test-toast',
    message: 'Test message',
    type: 'info',
    duration: 5000,
    dismissible: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders toast with correct message and type', () => {
    render(<Toast toast={defaultToast} onRemove={mockOnRemove} />);
    
    expect(screen.getByText('Test message')).toBeInTheDocument();
    expect(screen.getByTestId('toast-info')).toBeInTheDocument();
  });

  it('renders success toast with correct styling', () => {
    const successToast: ToastType = {
      ...defaultToast,
      type: 'success',
    };

    render(<Toast toast={successToast} onRemove={mockOnRemove} />);
    
    const toastElement = screen.getByTestId('toast-success');
    expect(toastElement).toHaveClass('toast--success');
  });

  it('renders error toast with correct styling', () => {
    const errorToast: ToastType = {
      ...defaultToast,
      type: 'error',
    };

    render(<Toast toast={errorToast} onRemove={mockOnRemove} />);
    
    const toastElement = screen.getByTestId('toast-error');
    expect(toastElement).toHaveClass('toast--error');
  });

  it('renders warning toast with correct styling', () => {
    const warningToast: ToastType = {
      ...defaultToast,
      type: 'warning',
    };

    render(<Toast toast={warningToast} onRemove={mockOnRemove} />);
    
    const toastElement = screen.getByTestId('toast-warning');
    expect(toastElement).toHaveClass('toast--warning');
  });

  it('shows close button when dismissible', () => {
    render(<Toast toast={defaultToast} onRemove={mockOnRemove} />);
    
    expect(screen.getByLabelText('Close notification')).toBeInTheDocument();
  });

  it('hides close button when not dismissible', () => {
    const nonDismissibleToast: ToastType = {
      ...defaultToast,
      dismissible: false,
    };

    render(<Toast toast={nonDismissibleToast} onRemove={mockOnRemove} />);
    
    expect(screen.queryByLabelText('Close notification')).not.toBeInTheDocument();
  });

  it('calls onRemove when close button is clicked', async () => {
    render(<Toast toast={defaultToast} onRemove={mockOnRemove} />);
    
    const closeButton = screen.getByLabelText('Close notification');
    fireEvent.click(closeButton);

    // Wait for the animation delay
    vi.advanceTimersByTime(300);
    
    await waitFor(() => {
      expect(mockOnRemove).toHaveBeenCalledWith('test-toast');
    });
  });

  it('calls onRemove when Escape key is pressed', async () => {
    render(<Toast toast={defaultToast} onRemove={mockOnRemove} />);
    
    const toastElement = screen.getByTestId('toast-info');
    fireEvent.keyDown(toastElement, { key: 'Escape' });

    // Wait for the animation delay
    vi.advanceTimersByTime(300);
    
    await waitFor(() => {
      expect(mockOnRemove).toHaveBeenCalledWith('test-toast');
    });
  });

  it('auto-removes after duration', async () => {
    const shortDurationToast: ToastType = {
      ...defaultToast,
      duration: 1000,
    };

    render(<Toast toast={shortDurationToast} onRemove={mockOnRemove} />);
    
    // Fast-forward time to trigger auto-removal
    vi.advanceTimersByTime(1000);
    
    // Wait for the animation delay
    vi.advanceTimersByTime(300);
    
    await waitFor(() => {
      expect(mockOnRemove).toHaveBeenCalledWith('test-toast');
    });
  });

  it('does not auto-remove when duration is 0', () => {
    const persistentToast: ToastType = {
      ...defaultToast,
      duration: 0,
    };

    render(<Toast toast={persistentToast} onRemove={mockOnRemove} />);
    
    // Fast-forward time
    vi.advanceTimersByTime(10000);
    
    expect(mockOnRemove).not.toHaveBeenCalled();
  });

  it('has proper accessibility attributes', () => {
    render(<Toast toast={defaultToast} onRemove={mockOnRemove} />);
    
    const toastElement = screen.getByTestId('toast-info');
    expect(toastElement).toHaveAttribute('role', 'alert');
    expect(toastElement).toHaveAttribute('aria-live', 'polite');
    expect(toastElement).toHaveAttribute('aria-label', 'info notification: Test message');
    expect(toastElement).toHaveAttribute('tabIndex', '0');
  });

  it('displays correct icons for different types', () => {
    const types: Array<{ type: ToastType['type']; expectedIcon: string }> = [
      { type: 'success', expectedIcon: '✓' },
      { type: 'error', expectedIcon: '✕' },
      { type: 'warning', expectedIcon: '⚠' },
      { type: 'info', expectedIcon: 'ℹ' },
    ];

    types.forEach(({ type, expectedIcon }) => {
      const { unmount } = render(
        <Toast 
          toast={{ ...defaultToast, type }} 
          onRemove={mockOnRemove} 
        />
      );
      
      // Look specifically for the icon in the toast__icon element
      const iconElement = document.querySelector('.toast__icon');
      expect(iconElement).toHaveTextContent(expectedIcon);
      unmount();
    });
  });
});