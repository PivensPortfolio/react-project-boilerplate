import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '../utils/test-utils';
import { useApi, useApiService, usePaginatedApi, useMutation } from '@/hooks/useApi';

// Mock ApiUtils
vi.mock('@/services', () => ({
  ApiUtils: {
    retry: vi.fn(),
    getErrorMessage: vi.fn((error) => error.message || 'An error occurred'),
  },
}));

describe('useApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with correct default state', () => {
    const mockApiFunction = vi.fn().mockResolvedValue('test data');
    const { result } = renderHook(() => useApi(mockApiFunction));

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.execute).toBe('function');
    expect(typeof result.current.reset).toBe('function');
  });

  it('executes immediately when immediate option is true', async () => {
    const mockApiFunction = vi.fn().mockResolvedValue('test data');
    const { result } = renderHook(() => useApi(mockApiFunction, { immediate: true }));

    expect(result.current.loading).toBe(true);
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toBe('test data');
      expect(mockApiFunction).toHaveBeenCalledTimes(1);
    });
  });

  it('handles successful API call', async () => {
    const mockApiFunction = vi.fn().mockResolvedValue('success data');
    const onSuccess = vi.fn();
    const { result } = renderHook(() => useApi(mockApiFunction, { onSuccess }));

    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.data).toBe('success data');
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(onSuccess).toHaveBeenCalledWith('success data');
  });

  it('handles API call errors', async () => {
    const mockError = new Error('API Error');
    const mockApiFunction = vi.fn().mockRejectedValue(mockError);
    const onError = vi.fn();
    const { result } = renderHook(() => useApi(mockApiFunction, { onError }));

    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('API Error');
    expect(onError).toHaveBeenCalledWith('API Error');
  });

  it('resets state correctly', async () => {
    const mockApiFunction = vi.fn().mockResolvedValue('test data');
    const { result } = renderHook(() => useApi(mockApiFunction));

    // Execute to get some data
    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.data).toBe('test data');

    // Reset
    act(() => {
      result.current.reset();
    });

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('passes arguments to API function', async () => {
    const mockApiFunction = vi.fn().mockResolvedValue('test data');
    const { result } = renderHook(() => useApi(mockApiFunction));

    await act(async () => {
      await result.current.execute('arg1', 'arg2', { key: 'value' });
    });

    expect(mockApiFunction).toHaveBeenCalledWith('arg1', 'arg2', { key: 'value' });
  });

  it('handles loading state correctly', async () => {
    const mockApiFunction = vi.fn().mockImplementation(() => 
      new Promise<string>((resolve) => {
        setTimeout(() => resolve('test data'), 10);
      })
    );

    const { result } = renderHook(() => useApi(mockApiFunction));

    // Start execution
    act(() => {
      result.current.execute();
    });

    expect(result.current.loading).toBe(true);

    // Wait for promise to resolve
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toBe('test data');
    });
  });
});

describe('useApiService', () => {
  it('works as a wrapper around useApi', async () => {
    const mockServiceMethod = vi.fn().mockResolvedValue('service data');
    const { result } = renderHook(() => useApiService(mockServiceMethod));

    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.data).toBe('service data');
    expect(mockServiceMethod).toHaveBeenCalledTimes(1);
  });
});

describe('usePaginatedApi', () => {
  const mockPaginatedResponse = {
    data: ['item1', 'item2'],
    meta: {
      page: 1,
      limit: 10,
      total: 20,
      totalPages: 2,
      hasNext: true,
      hasPrev: false,
    },
  };

  it('initializes with default pagination params', () => {
    const mockApiFunction = vi.fn().mockResolvedValue(mockPaginatedResponse);
    const { result } = renderHook(() => usePaginatedApi(mockApiFunction));

    expect(result.current.params).toEqual({
      page: 1,
      limit: 10,
    });
  });

  it('handles next page navigation', async () => {
    const mockApiFunction = vi.fn().mockResolvedValue(mockPaginatedResponse);
    const { result } = renderHook(() => usePaginatedApi(mockApiFunction));

    await waitFor(() => {
      expect(result.current.data).toEqual(['item1', 'item2']);
    });

    act(() => {
      result.current.nextPage();
    });

    expect(result.current.params.page).toBe(2);
  });

  it('handles previous page navigation', async () => {
    const mockApiFunction = vi.fn().mockResolvedValue({
      ...mockPaginatedResponse,
      meta: { ...mockPaginatedResponse.meta, page: 2, hasPrev: true, hasNext: false },
    });
    
    const { result } = renderHook(() => 
      usePaginatedApi(mockApiFunction, { page: 2 })
    );

    await waitFor(() => {
      expect(result.current.data).toEqual(['item1', 'item2']);
    });

    act(() => {
      result.current.prevPage();
    });

    expect(result.current.params.page).toBe(1);
  });

  it('handles go to specific page', async () => {
    const mockApiFunction = vi.fn().mockResolvedValue(mockPaginatedResponse);
    const { result } = renderHook(() => usePaginatedApi(mockApiFunction));

    await waitFor(() => {
      expect(result.current.data).toEqual(['item1', 'item2']);
    });

    act(() => {
      result.current.goToPage(3);
    });

    expect(result.current.params.page).toBe(3);
  });

  it('updates params and resets to page 1', async () => {
    const mockApiFunction = vi.fn().mockResolvedValue(mockPaginatedResponse);
    const { result } = renderHook(() => usePaginatedApi(mockApiFunction, { page: 2 }));

    await waitFor(() => {
      expect(result.current.data).toEqual(['item1', 'item2']);
    });

    act(() => {
      result.current.updateParams({ limit: 20, search: 'test' });
    });

    expect(result.current.params).toEqual({
      page: 1, // Should reset to page 1
      limit: 20,
      search: 'test',
    });
  });

  it('does not navigate when hasNext/hasPrev is false', async () => {
    const mockApiFunction = vi.fn().mockResolvedValue({
      ...mockPaginatedResponse,
      meta: { ...mockPaginatedResponse.meta, hasNext: false, hasPrev: false },
    });
    
    const { result } = renderHook(() => usePaginatedApi(mockApiFunction));

    await waitFor(() => {
      expect(result.current.data).toEqual(['item1', 'item2']);
    });

    const initialPage = result.current.params.page;

    act(() => {
      result.current.nextPage();
    });

    expect(result.current.params.page).toBe(initialPage);

    act(() => {
      result.current.prevPage();
    });

    expect(result.current.params.page).toBe(initialPage);
  });
});

describe('useMutation', () => {
  it('does not execute immediately', () => {
    const mockMutationFunction = vi.fn().mockResolvedValue('mutation result');
    const { result } = renderHook(() => useMutation(mockMutationFunction));

    expect(result.current.loading).toBe(false);
    expect(mockMutationFunction).not.toHaveBeenCalled();
  });

  it('executes mutation when mutate is called', async () => {
    const mockMutationFunction = vi.fn().mockResolvedValue('mutation result');
    const { result } = renderHook(() => useMutation(mockMutationFunction));

    await act(async () => {
      await result.current.mutate({ id: 1, name: 'test' });
    });

    expect(result.current.data).toBe('mutation result');
    expect(mockMutationFunction).toHaveBeenCalledWith({ id: 1, name: 'test' });
  });

  it('handles mutation errors', async () => {
    const mockError = new Error('Mutation Error');
    const mockMutationFunction = vi.fn().mockRejectedValue(mockError);
    const onError = vi.fn();
    const { result } = renderHook(() => useMutation(mockMutationFunction, { onError }));

    await act(async () => {
      await result.current.mutate({ id: 1 });
    });

    expect(result.current.error).toBe('Mutation Error');
    expect(onError).toHaveBeenCalledWith('Mutation Error');
  });

  it('calls onSuccess callback on successful mutation', async () => {
    const mockMutationFunction = vi.fn().mockResolvedValue('success');
    const onSuccess = vi.fn();
    const { result } = renderHook(() => useMutation(mockMutationFunction, { onSuccess }));

    await act(async () => {
      await result.current.mutate({ id: 1 });
    });

    expect(onSuccess).toHaveBeenCalledWith('success');
  });
});