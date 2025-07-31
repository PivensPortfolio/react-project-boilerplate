import React, { useState, useCallback, useRef } from 'react';
import type {
  UseFormOptions,
  UseFormReturn,
  FormState,
  ValidationRule,
} from '../types/form';

/**
 * Core form management hook with validation, submission, and error handling
 */
export function useForm<T extends Record<string, any>>(
  options: UseFormOptions<T>
): UseFormReturn<T> {
  const {
    initialValues,
    validationSchema = {},
    validateOnChange = true,
    validateOnBlur = true,
    onSubmit,
    onValidationError,
  } = options;

  // Form state
  const [formState, setFormState] = useState<FormState<T>>(() => ({
    values: { ...initialValues },
    errors: {},
    touched: {},
    dirty: {},
    isSubmitting: false,
    isValid: true,
    isDirty: false,
    submitCount: 0,
  }));

  // Track if component is mounted to prevent state updates after unmount
  const isMountedRef = useRef(true);

  // Validate a single field
  const validateField = useCallback(
    async (field: keyof T): Promise<string | undefined> => {
      const value = formState.values[field];
      const rules = validationSchema[field] || [];

      for (const rule of rules) {
        const error = rule(value);
        if (error) {
          return error;
        }
      }

      return undefined;
    },
    [formState.values, validationSchema]
  );

  // Validate entire form
  const validateForm = useCallback(async (): Promise<boolean> => {
    const errors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    // Validate all fields
    for (const field in formState.values) {
      const error = await validateField(field);
      if (error) {
        errors[field] = error;
        isValid = false;
      }
    }

    if (!isMountedRef.current) return isValid;

    setFormState(prev => ({
      ...prev,
      errors,
      isValid,
    }));

    if (!isValid && onValidationError) {
      onValidationError(errors);
    }

    return isValid;
  }, [formState.values, validateField, onValidationError]);

  // Set field value
  const setValue = useCallback((field: keyof T, value: T[keyof T]) => {
    if (!isMountedRef.current) return;

    setFormState(prev => {
      const newValues = { ...prev.values, [field]: value };
      const isDirty = JSON.stringify(newValues) !== JSON.stringify(initialValues);
      const fieldDirty = JSON.stringify(value) !== JSON.stringify(initialValues[field]);

      return {
        ...prev,
        values: newValues,
        dirty: { ...prev.dirty, [field]: fieldDirty },
        isDirty,
      };
    });

    // Validate on change if enabled
    if (validateOnChange) {
      setTimeout(async () => {
        const error = await validateField(field);
        if (!isMountedRef.current) return;

        setFormState(prev => ({
          ...prev,
          errors: { ...prev.errors, [field]: error },
          isValid: !error && Object.values({ ...prev.errors, [field]: error }).every(e => !e),
        }));
      }, 0);
    }
  }, [initialValues, validateOnChange, validateField]);

  // Set field error
  const setError = useCallback((field: keyof T, error: string) => {
    if (!isMountedRef.current) return;

    setFormState(prev => ({
      ...prev,
      errors: { ...prev.errors, [field]: error },
      isValid: false,
    }));
  }, []);

  // Set field touched state
  const setTouched = useCallback((field: keyof T, touched = true) => {
    if (!isMountedRef.current) return;

    setFormState(prev => ({
      ...prev,
      touched: { ...prev.touched, [field]: touched },
    }));
  }, []);

  // Clear field error
  const clearError = useCallback((field: keyof T) => {
    if (!isMountedRef.current) return;

    setFormState(prev => {
      const newErrors = { ...prev.errors };
      delete newErrors[field];

      return {
        ...prev,
        errors: newErrors,
        isValid: Object.values(newErrors).every(e => !e),
      };
    });
  }, []);

  // Handle field change
  const handleChange = useCallback(
    (field: keyof T) => (value: T[keyof T]) => {
      setValue(field, value);
    },
    [setValue]
  );

  // Handle field blur
  const handleBlur = useCallback(
    (field: keyof T) => () => {
      setTouched(field, true);

      // Validate on blur if enabled
      if (validateOnBlur) {
        setTimeout(async () => {
          const error = await validateField(field);
          if (!isMountedRef.current) return;

          setFormState(prev => ({
            ...prev,
            errors: { ...prev.errors, [field]: error },
            isValid: !error && Object.values({ ...prev.errors, [field]: error }).every(e => !e),
          }));
        }, 0);
      }
    },
    [setTouched, validateOnBlur, validateField]
  );

  // Handle form submission
  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault();
      }

      if (!isMountedRef.current) return;

      setFormState(prev => ({
        ...prev,
        isSubmitting: true,
        submitCount: prev.submitCount + 1,
      }));

      try {
        // Validate form before submission
        const isValid = await validateForm();

        if (!isValid) {
          if (!isMountedRef.current) return;
          setFormState(prev => ({ ...prev, isSubmitting: false }));
          return;
        }

        // Submit form
        await onSubmit(formState.values);

        if (!isMountedRef.current) return;

        setFormState(prev => ({
          ...prev,
          isSubmitting: false,
        }));
      } catch (error) {
        if (!isMountedRef.current) return;

        setFormState(prev => ({
          ...prev,
          isSubmitting: false,
        }));

        // Re-throw error for handling by parent component
        throw error;
      }
    },
    [formState.values, validateForm, onSubmit]
  );

  // Reset form
  const resetForm = useCallback((newValues?: Partial<T>) => {
    if (!isMountedRef.current) return;

    const resetValues = newValues ? { ...initialValues, ...newValues } : initialValues;

    setFormState({
      values: { ...resetValues },
      errors: {},
      touched: {},
      dirty: {},
      isSubmitting: false,
      isValid: true,
      isDirty: false,
      submitCount: 0,
    });
  }, [initialValues]);

  // Get field props helper
  const getFieldProps = useCallback(
    (field: keyof T) => ({
      value: formState.values[field],
      error: formState.errors[field],
      touched: formState.touched[field] || false,
      dirty: formState.dirty[field] || false,
      onChange: handleChange(field),
      onBlur: handleBlur(field),
    }),
    [formState, handleChange, handleBlur]
  );

  // Cleanup on unmount
  React.useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    // State
    values: formState.values,
    errors: formState.errors,
    touched: formState.touched,
    dirty: formState.dirty,
    isSubmitting: formState.isSubmitting,
    isValid: formState.isValid,
    isDirty: formState.isDirty,
    submitCount: formState.submitCount,

    // Field methods
    setValue,
    setError,
    setTouched,
    clearError,

    // Form methods
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    validateField,
    validateForm,

    // Utility methods
    getFieldProps,
  };
}