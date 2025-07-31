/**
 * Form management types
 */

// Validation rule function type
export type ValidationRule<T = any> = (value: T) => string | undefined;

// Validation schema for a form
export type ValidationSchema<T> = {
  [K in keyof T]?: ValidationRule<T[K]>[];
};

// Form field state
export interface FieldState {
  value: any;
  error?: string;
  touched: boolean;
  dirty: boolean;
}

// Form state
export interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  dirty: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
  submitCount: number;
}

// Form configuration options
export interface UseFormOptions<T> {
  initialValues: T;
  validationSchema?: ValidationSchema<T>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  onSubmit: (values: T) => Promise<void> | void;
  onValidationError?: (errors: Partial<Record<keyof T, string>>) => void;
}

// Form hook return type
export interface UseFormReturn<T> {
  // State
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  dirty: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
  submitCount: number;

  // Field methods
  setValue: (field: keyof T, value: T[keyof T]) => void;
  setError: (field: keyof T, error: string) => void;
  setTouched: (field: keyof T, touched?: boolean) => void;
  clearError: (field: keyof T) => void;

  // Form methods
  handleChange: (field: keyof T) => (value: T[keyof T]) => void;
  handleBlur: (field: keyof T) => () => void;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  resetForm: (newValues?: Partial<T>) => void;
  validateField: (field: keyof T) => Promise<string | undefined>;
  validateForm: () => Promise<boolean>;

  // Utility methods
  getFieldProps: (field: keyof T) => {
    value: T[keyof T];
    error?: string;
    touched: boolean;
    dirty: boolean;
    onChange: (value: T[keyof T]) => void;
    onBlur: () => void;
  };
}

// Async validation function type
export type AsyncValidationRule<T = any> = (value: T) => Promise<string | undefined>;

// Enhanced validation schema with async support
export type EnhancedValidationSchema<T> = {
  [K in keyof T]?: {
    sync?: ValidationRule<T[K]>[];
    async?: AsyncValidationRule<T[K]>[];
  };
};

// Form field component props
export interface FormFieldProps<T = any> {
  name: string;
  value: T;
  error?: string;
  touched?: boolean;
  dirty?: boolean;
  onChange: (value: T) => void;
  onBlur: () => void;
  disabled?: boolean;
  required?: boolean;
}