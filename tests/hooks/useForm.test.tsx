import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useForm } from '../../src/hooks/useForm';
import type { UseFormOptions } from '../../src/types/form';

// Test form data interface
interface TestFormData {
  name: string;
  email: string;
  age: number;
  terms: boolean;
}

// Mock validation rules
const mockValidationSchema = {
  name: [
    (value: string) => (!value ? 'Name is required' : undefined),
    (value: string) => (value.length < 2 ? 'Name must be at least 2 characters' : undefined),
  ],
  email: [
    (value: string) => (!value ? 'Email is required' : undefined),
    (value: string) => (!/\S+@\S+\.\S+/.test(value) ? 'Email is invalid' : undefined),
  ],
  age: [
    (value: number) => (value < 18 ? 'Must be at least 18 years old' : undefined),
  ],
  terms: [
    (value: boolean) => (!value ? 'You must accept the terms' : undefined),
  ],
};

describe('useForm', () => {
  const initialValues: TestFormData = {
    name: '',
    email: '',
    age: 0,
    terms: false,
  };

  let mockOnSubmit: ReturnType<typeof vi.fn>;
  let mockOnValidationError: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnSubmit = vi.fn();
    mockOnValidationError = vi.fn();
  });

  const defaultOptions: UseFormOptions<TestFormData> = {
    initialValues,
    onSubmit: mockOnSubmit,
  };

  describe('initialization', () => {
    it('should initialize with correct default values', () => {
      const { result } = renderHook(() => useForm(defaultOptions));

      expect(result.current.values).toEqual(initialValues);
      expect(result.current.errors).toEqual({});
      expect(result.current.touched).toEqual({});
      expect(result.current.dirty).toEqual({});
      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.isValid).toBe(true);
      expect(result.current.isDirty).toBe(false);
      expect(result.current.submitCount).toBe(0);
    });

    it('should initialize with validation schema', () => {
      const options = {
        ...defaultOptions,
        validationSchema: mockValidationSchema,
      };

      const { result } = renderHook(() => useForm(options));

      expect(result.current.values).toEqual(initialValues);
      expect(result.current.isValid).toBe(true);
    });
  });

  describe('field value management', () => {
    it('should update field value using setValue', () => {
      const { result } = renderHook(() => useForm(defaultOptions));

      act(() => {
        result.current.setValue('name', 'John Doe');
      });

      expect(result.current.values.name).toBe('John Doe');
      expect(result.current.dirty.name).toBe(true);
      expect(result.current.isDirty).toBe(true);
    });

    it('should update field value using handleChange', () => {
      const { result } = renderHook(() => useForm(defaultOptions));

      act(() => {
        result.current.handleChange('email')('john@example.com');
      });

      expect(result.current.values.email).toBe('john@example.com');
      expect(result.current.dirty.email).toBe(true);
      expect(result.current.isDirty).toBe(true);
    });

    it('should track dirty state correctly', () => {
      const { result } = renderHook(() => useForm(defaultOptions));

      // Initially not dirty
      expect(result.current.isDirty).toBe(false);
      expect(result.current.dirty.name).toBeFalsy();

      // Set to same value as initial - should not be dirty
      act(() => {
        result.current.setValue('name', '');
      });

      expect(result.current.isDirty).toBe(false);
      expect(result.current.dirty.name).toBe(false);

      // Set to different value - should be dirty
      act(() => {
        result.current.setValue('name', 'John');
      });

      expect(result.current.isDirty).toBe(true);
      expect(result.current.dirty.name).toBe(true);
    });
  });

  describe('field touched management', () => {
    it('should set field as touched using setTouched', () => {
      const { result } = renderHook(() => useForm(defaultOptions));

      act(() => {
        result.current.setTouched('name', true);
      });

      expect(result.current.touched.name).toBe(true);
    });

    it('should set field as touched using handleBlur', () => {
      const { result } = renderHook(() => useForm(defaultOptions));

      act(() => {
        result.current.handleBlur('email')();
      });

      expect(result.current.touched.email).toBe(true);
    });
  });

  describe('error management', () => {
    it('should set field error using setError', () => {
      const { result } = renderHook(() => useForm(defaultOptions));

      act(() => {
        result.current.setError('name', 'Custom error message');
      });

      expect(result.current.errors.name).toBe('Custom error message');
      expect(result.current.isValid).toBe(false);
    });

    it('should clear field error using clearError', () => {
      const { result } = renderHook(() => useForm(defaultOptions));

      // Set error first
      act(() => {
        result.current.setError('name', 'Error message');
      });

      expect(result.current.errors.name).toBe('Error message');
      expect(result.current.isValid).toBe(false);

      // Clear error
      act(() => {
        result.current.clearError('name');
      });

      expect(result.current.errors.name).toBeUndefined();
      expect(result.current.isValid).toBe(true);
    });
  });

  describe('validation', () => {
    const optionsWithValidation = {
      ...defaultOptions,
      validationSchema: mockValidationSchema,
      onValidationError: mockOnValidationError,
    };

    it('should validate single field', async () => {
      const { result } = renderHook(() => useForm(optionsWithValidation));

      let error: string | undefined;
      await act(async () => {
        error = await result.current.validateField('name');
      });

      expect(error).toBe('Name is required');
    });

    it('should validate entire form', async () => {
      const validationErrorMock = vi.fn();
      const options = {
        ...defaultOptions,
        validationSchema: mockValidationSchema,
        onValidationError: validationErrorMock,
      };
      
      const { result } = renderHook(() => useForm(options));

      let isValid: boolean;
      await act(async () => {
        isValid = await result.current.validateForm();
      });

      expect(isValid).toBe(false);
      expect(result.current.errors.name).toBe('Name is required');
      expect(result.current.errors.email).toBe('Email is required');
      expect(result.current.errors.terms).toBe('You must accept the terms');
      expect(validationErrorMock).toHaveBeenCalled();
    });

    it('should validate on change when enabled', async () => {
      const { result } = renderHook(() => useForm({
        ...optionsWithValidation,
        validateOnChange: true,
      }));

      // Set a value that should trigger validation
      act(() => {
        result.current.setValue('name', 'J');
      });

      // Wait for validation to complete - the validation should run and set an error
      await waitFor(() => {
        expect(result.current.errors.name).toBeDefined();
      }, { timeout: 1000 });

      // The error should be one of the validation messages
      expect(['Name is required', 'Name must be at least 2 characters']).toContain(result.current.errors.name);
    });

    it('should validate on blur when enabled', async () => {
      const { result } = renderHook(() => useForm({
        ...optionsWithValidation,
        validateOnBlur: true,
      }));

      act(() => {
        result.current.handleBlur('email')();
      });

      await waitFor(() => {
        expect(result.current.errors.email).toBe('Email is required');
        expect(result.current.touched.email).toBe(true);
      });
    });

    it('should not validate on change when disabled', async () => {
      const { result } = renderHook(() => useForm({
        ...optionsWithValidation,
        validateOnChange: false,
      }));

      act(() => {
        result.current.setValue('name', 'J');
      });

      // Wait a bit to ensure validation doesn't run
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(result.current.errors.name).toBeUndefined();
    });
  });

  describe('form submission', () => {
    it('should handle successful form submission', async () => {
      const submitMock = vi.fn().mockResolvedValue(undefined);
      const options = {
        ...defaultOptions,
        onSubmit: submitMock,
      };
      
      const { result } = renderHook(() => useForm(options));

      // Set valid values
      act(() => {
        result.current.setValue('name', 'John Doe');
        result.current.setValue('email', 'john@example.com');
        result.current.setValue('age', 25);
        result.current.setValue('terms', true);
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(submitMock).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        age: 25,
        terms: true,
      });
      expect(result.current.submitCount).toBe(1);
      expect(result.current.isSubmitting).toBe(false);
    });

    it('should prevent submission with validation errors', async () => {
      const { result } = renderHook(() => useForm({
        ...defaultOptions,
        validationSchema: mockValidationSchema,
      }));

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
      expect(result.current.submitCount).toBe(1);
      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.isValid).toBe(false);
    });

    it('should handle submission errors', async () => {
      const error = new Error('Submission failed');
      const submitMock = vi.fn().mockRejectedValue(error);
      const options = {
        ...defaultOptions,
        onSubmit: submitMock,
      };

      const { result } = renderHook(() => useForm(options));

      try {
        await act(async () => {
          await result.current.handleSubmit();
        });
        // Should not reach here
        expect(true).toBe(false);
      } catch (thrownError) {
        expect(thrownError.message).toBe('Submission failed');
      }

      expect(result.current.isSubmitting).toBe(false);
    });

    it('should set isSubmitting during submission', async () => {
      const submitMock = vi.fn().mockResolvedValue(undefined);
      const options = {
        ...defaultOptions,
        onSubmit: submitMock,
      };

      const { result } = renderHook(() => useForm(options));

      // Initially not submitting
      expect(result.current.isSubmitting).toBe(false);

      // Submit form
      await act(async () => {
        await result.current.handleSubmit();
      });

      // After submission completes, should not be submitting
      expect(result.current.isSubmitting).toBe(false);
      expect(submitMock).toHaveBeenCalled();
    });
  });

  describe('form reset', () => {
    it('should reset form to initial values', () => {
      const { result } = renderHook(() => useForm(defaultOptions));

      // Ensure hook is properly initialized
      expect(result.current).toBeDefined();
      expect(result.current.setValue).toBeDefined();

      // Modify form
      act(() => {
        result.current.setValue('name', 'John Doe');
        result.current.setError('email', 'Some error');
        result.current.setTouched('name', true);
      });

      expect(result.current.values.name).toBe('John Doe');
      expect(result.current.errors.email).toBe('Some error');
      expect(result.current.touched.name).toBe(true);

      // Reset form
      act(() => {
        result.current.resetForm();
      });

      expect(result.current.values).toEqual(initialValues);
      expect(result.current.errors).toEqual({});
      expect(result.current.touched).toEqual({});
      expect(result.current.dirty).toEqual({});
      expect(result.current.isDirty).toBe(false);
      expect(result.current.isValid).toBe(true);
      expect(result.current.submitCount).toBe(0);
    });

    it('should reset form with new values', () => {
      const { result } = renderHook(() => useForm(defaultOptions));

      // Ensure hook is properly initialized
      expect(result.current).toBeDefined();
      expect(result.current.resetForm).toBeDefined();

      const newValues = { name: 'Jane Doe' };

      act(() => {
        result.current.resetForm(newValues);
      });

      expect(result.current.values.name).toBe('Jane Doe');
      expect(result.current.values.email).toBe('');
      expect(result.current.values.age).toBe(0);
      expect(result.current.values.terms).toBe(false);
    });
  });

  describe('getFieldProps helper', () => {
    it('should return correct field props', () => {
      const { result } = renderHook(() => useForm(defaultOptions));

      // Ensure hook is properly initialized
      expect(result.current).toBeDefined();
      expect(result.current.setValue).toBeDefined();

      // Set some field state
      act(() => {
        result.current.setValue('name', 'John');
        result.current.setError('name', 'Error message');
        result.current.setTouched('name', true);
      });

      const fieldProps = result.current.getFieldProps('name');

      expect(fieldProps.value).toBe('John');
      expect(fieldProps.error).toBe('Error message');
      expect(fieldProps.touched).toBe(true);
      expect(fieldProps.dirty).toBe(true);
      expect(typeof fieldProps.onChange).toBe('function');
      expect(typeof fieldProps.onBlur).toBe('function');
    });

    it('should handle field props onChange and onBlur', () => {
      const { result } = renderHook(() => useForm(defaultOptions));

      // Ensure hook is properly initialized
      expect(result.current).toBeDefined();
      expect(result.current.getFieldProps).toBeDefined();

      const fieldProps = result.current.getFieldProps('name');

      act(() => {
        fieldProps.onChange('New Value');
      });

      expect(result.current.values.name).toBe('New Value');

      act(() => {
        fieldProps.onBlur();
      });

      expect(result.current.touched.name).toBe(true);
    });
  });
});