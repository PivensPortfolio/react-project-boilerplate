import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useToast } from '../../src/hooks/useToast';

// Mock the toast store
const mockAddToast = vi.fn();
const mockRemoveToast = vi.fn();
const mockClearToasts = vi.fn();
const mockToasts: any[] = [];

vi.mock('../../src/store/toastStore', () => ({
  useToastStore: vi.fn(() => ({
    toasts: mockToasts,
    addToast: mockAddToast,
    removeToast: mockRemoveToast,
    clearToasts: mockClearToasts,
  })),
}));

describe('useToast Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns toast state and methods', () => {
    const { result } = renderHook(() => useToast());

    expect(result.current).toHaveProperty('toasts');
    expect(result.current).toHaveProperty('addToast');
    expect(result.current).toHaveProperty('removeToast');
    expect(result.current).toHaveProperty('clearToasts');
    expect(result.current).toHaveProperty('success');
    expect(result.current).toHaveProperty('error');
    expect(result.current).toHaveProperty('warning');
    expect(result.current).toHaveProperty('info');
  });

  it('calls addToast with correct parameters for success', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.success('Success message');
    });

    expect(mockAddToast).toHaveBeenCalledWith({
      message: 'Success message',
      type: 'success',
    });
  });

  it('calls addToast with correct parameters for error', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.error('Error message');
    });

    expect(mockAddToast).toHaveBeenCalledWith({
      message: 'Error message',
      type: 'error',
      duration: 7000, // Errors stay longer by default
    });
  });

  it('calls addToast with correct parameters for warning', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.warning('Warning message');
    });

    expect(mockAddToast).toHaveBeenCalledWith({
      message: 'Warning message',
      type: 'warning',
    });
  });

  it('calls addToast with correct parameters for info', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.info('Info message');
    });

    expect(mockAddToast).toHaveBeenCalledWith({
      message: 'Info message',
      type: 'info',
    });
  });

  it('accepts custom options', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.success('Success message', { 
        duration: 3000,
        dismissible: false 
      });
    });

    expect(mockAddToast).toHaveBeenCalledWith({
      message: 'Success message',
      type: 'success',
      duration: 3000,
      dismissible: false,
    });
  });

  it('calls addToast with custom type and options', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.addToast('Custom message', 'warning', { 
        duration: 2000 
      });
    });

    expect(mockAddToast).toHaveBeenCalledWith({
      message: 'Custom message',
      type: 'warning',
      duration: 2000,
    });
  });

  it('calls removeToast with correct id', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.removeToast('toast-id');
    });

    expect(mockRemoveToast).toHaveBeenCalledWith('toast-id');
  });

  it('calls clearToasts', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.clearToasts();
    });

    expect(mockClearToasts).toHaveBeenCalled();
  });

  it('memoizes callback functions', () => {
    const { result, rerender } = renderHook(() => useToast());

    const firstRender = {
      success: result.current.success,
      error: result.current.error,
      warning: result.current.warning,
      info: result.current.info,
      addToast: result.current.addToast,
    };

    rerender();

    expect(result.current.success).toBe(firstRender.success);
    expect(result.current.error).toBe(firstRender.error);
    expect(result.current.warning).toBe(firstRender.warning);
    expect(result.current.info).toBe(firstRender.info);
    expect(result.current.addToast).toBe(firstRender.addToast);
  });
});