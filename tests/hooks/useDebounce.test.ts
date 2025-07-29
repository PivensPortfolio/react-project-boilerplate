import { renderHook, act } from '@testing-library/react';
import { useDebounce, useDebouncedCallback, useDebouncedSearch } from '../../src/hooks/useDebounce';

// Mock timers
vi.useFakeTimers();

describe('useDebounce', () => {
  afterEach(() => {
    vi.clearAllTimers();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));
    
    expect(result.current).toBe('initial');
  });

  it('should debounce value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    expect(result.current).toBe('initial');

    // Change value
    rerender({ value: 'updated', delay: 500 });
    expect(result.current).toBe('initial'); // Should still be initial

    // Fast forward time
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe('updated');
  });

  it('should reset timer on rapid changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    // First change
    rerender({ value: 'change1', delay: 500 });
    
    // Advance time partially
    act(() => {
      vi.advanceTimersByTime(300);
    });
    
    // Second change before first completes
    rerender({ value: 'change2', delay: 500 });
    
    // Advance time to complete first timer
    act(() => {
      vi.advanceTimersByTime(300);
    });
    
    expect(result.current).toBe('initial'); // Should still be initial
    
    // Advance remaining time
    act(() => {
      vi.advanceTimersByTime(200);
    });
    
    expect(result.current).toBe('change2');
  });
});

describe('useDebouncedCallback', () => {
  afterEach(() => {
    vi.clearAllTimers();
  });

  it('should debounce callback execution', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 500));

    // Call multiple times rapidly
    act(() => {
      result.current('arg1');
      result.current('arg2');
      result.current('arg3');
    });

    expect(callback).not.toHaveBeenCalled();

    // Advance time
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('arg3');
  });
});

describe('useDebouncedSearch', () => {
  afterEach(() => {
    vi.clearAllTimers();
  });

  it('should return debounced search term and searching state', () => {
    const { result, rerender } = renderHook(
      ({ searchTerm }) => useDebouncedSearch(searchTerm, 300),
      { initialProps: { searchTerm: '' } }
    );

    expect(result.current.debouncedSearchTerm).toBe('');
    expect(result.current.isSearching).toBe(false);

    // Update search term
    rerender({ searchTerm: 'test' });
    
    expect(result.current.debouncedSearchTerm).toBe('');
    expect(result.current.isSearching).toBe(true);

    // Advance time
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current.debouncedSearchTerm).toBe('test');
    expect(result.current.isSearching).toBe(false);
  });
});