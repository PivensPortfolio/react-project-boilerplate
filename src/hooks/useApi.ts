import { useState, useCallback, useRef, useEffect } from 'react';
import { ApiUtils } from '../services';

export interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface ApiOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
  retries?: number;
  retryDelay?: number;
}

/**
 * Custom hook for handling API requests with loading states
 * @param apiFunction - The async function that makes the API call
 * @param options - Configuration options
 * @returns API state and execute function
 */
export function useApi<T = any>(
  apiFunction: (...args: any[]) => Promise<T>,
  options: ApiOptions = {}
): {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
} {
  const { immediate = false, onSuccess, onError, retries = 0, retryDelay = 1000 } = options;
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: immediate,
    error: null,
  });

  const cancelRef = useRef<boolean>(false);

  const execute = useCallback(
    async (...args: any[]): Promise<T | null> => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        
        // Use retry utility if retries are specified
        const result = retries > 0 
          ? await ApiUtils.retry(() => apiFunction(...args), retries, retryDelay)
          : await apiFunction(...args);
        
        if (!cancelRef.current) {
          setState(prev => ({ ...prev, data: result, loading: false }));
          onSuccess?.(result);
        }
        
        return result;
      } catch (err) {
        if (!cancelRef.current) {
          // Use ApiUtils to get user-friendly error message
          const errorMessage = err instanceof Error 
            ? ApiUtils.getErrorMessage(err)
            : ApiUtils.getErrorMessage(err);
          
          setState(prev => ({ ...prev, error: errorMessage, loading: false }));
          onError?.(errorMessage);
        }
        return null;
      }
    },
    [apiFunction, onSuccess, onError, retries, retryDelay]
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
    });
  }, []);

  // Execute immediately if requested
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  // Cleanup function to prevent state updates after unmount
  useEffect(() => {
    return () => {
      cancelRef.current = true;
    };
  }, []);

  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    execute,
    reset,
  };
}

/**
 * Hook for service-based API calls
 * Works with our centralized API services
 */
export function useApiService<T = any>(
  serviceMethod: (...args: any[]) => Promise<T>,
  options: ApiOptions = {}
): {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
} {
  return useApi<T>(serviceMethod, options);
}

/**
 * Hook for paginated API calls
 */
export function usePaginatedApi<T = any>(
  apiFunction: (params: { page: number; limit: number; [key: string]: any }) => Promise<{
    data: T[];
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }>,
  initialParams: { page?: number; limit?: number; [key: string]: any } = {}
) {
  const [params, setParams] = useState({
    page: 1,
    limit: 10,
    ...initialParams,
  });

  const { data, loading, error, execute, reset } = useApi(
    () => apiFunction(params),
    { immediate: true }
  );

  const nextPage = useCallback(() => {
    if (data?.meta.hasNext) {
      setParams(prev => ({ ...prev, page: prev.page + 1 }));
    }
  }, [data?.meta.hasNext]);

  const prevPage = useCallback(() => {
    if (data?.meta.hasPrev) {
      setParams(prev => ({ ...prev, page: prev.page - 1 }));
    }
  }, [data?.meta.hasPrev]);

  const goToPage = useCallback((page: number) => {
    setParams(prev => ({ ...prev, page }));
  }, []);

  const updateParams = useCallback((newParams: Partial<typeof params>) => {
    setParams(prev => ({ ...prev, ...newParams, page: 1 })); // Reset to first page
  }, []);

  const refetch = useCallback(() => {
    execute();
  }, [execute]);

  // Re-execute when params change
  useEffect(() => {
    execute();
  }, [params, execute]);

  return {
    data: data?.data || [],
    meta: data?.meta || null,
    loading,
    error,
    params,
    nextPage,
    prevPage,
    goToPage,
    updateParams,
    refetch,
    reset,
  };
}

/**
 * Hook for mutations (POST, PUT, DELETE)
 */
export function useMutation<T = any, TVariables = any>(
  mutationFunction: (variables: TVariables) => Promise<T>,
  options: ApiOptions = {}
) {
  const { data, loading, error, execute, reset } = useApi<T>(mutationFunction, {
    ...options,
    immediate: false, // Mutations should not execute immediately
  });

  const mutate = useCallback(
    (variables: TVariables) => execute(variables),
    [execute]
  );

  return {
    data,
    loading,
    error,
    mutate,
    reset,
  };
}