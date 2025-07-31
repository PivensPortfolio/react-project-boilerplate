import React, { useState, useCallback } from 'react';
import styles from './Input.module.css';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => string | null;
}

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  size?: 'small' | 'medium' | 'large';
  error?: string;
  success?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  validation?: ValidationRule;
  onValidation?: (isValid: boolean, error?: string) => void;
}

export const Input = React.memo(React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      size = 'medium',
      error,
      success,
      helperText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      validation,
      onValidation,
      className = '',
      required,
      onChange,
      onBlur,
      ...props
    },
    ref
  ) => {
    const [internalError, setInternalError] = useState<string>('');
    const [touched, setTouched] = useState(false);

    const validateValue = useCallback(
      (inputValue: string): string | null => {
        if (!validation) return null;

        // Required validation
        if (validation.required && !inputValue.trim()) {
          return 'This field is required';
        }

        // Skip other validations if field is empty and not required
        if (!inputValue.trim() && !validation.required) {
          return null;
        }

        // Min length validation
        if (validation.minLength && inputValue.length < validation.minLength) {
          return `Minimum length is ${validation.minLength} characters`;
        }

        // Max length validation
        if (validation.maxLength && inputValue.length > validation.maxLength) {
          return `Maximum length is ${validation.maxLength} characters`;
        }

        // Pattern validation
        if (validation.pattern && !validation.pattern.test(inputValue)) {
          return 'Invalid format';
        }

        // Custom validation
        if (validation.custom) {
          return validation.custom(inputValue);
        }

        return null;
      },
      [validation]
    );

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        
        if (validation && touched) {
          const validationError = validateValue(value);
          setInternalError(validationError || '');
          onValidation?.(validationError === null, validationError || undefined);
        }

        onChange?.(e);
      },
      [onChange, validation, validateValue, onValidation, touched]
    );

    const handleBlur = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        setTouched(true);
        
        if (validation) {
          const validationError = validateValue(e.target.value);
          setInternalError(validationError || '');
          onValidation?.(validationError === null, validationError || undefined);
        }

        onBlur?.(e);
      },
      [onBlur, validation, validateValue, onValidation]
    );

    const inputClasses = React.useMemo(() => [
      styles.input,
      styles[size],
      leftIcon && styles.hasLeftIcon,
      rightIcon && styles.hasRightIcon,
      (error || internalError) && styles.error,
      success && !error && !internalError && styles.success,
      className,
    ]
      .filter(Boolean)
      .join(' '), [size, leftIcon, rightIcon, error, internalError, success, className]);

    const wrapperClasses = React.useMemo(() => [
      styles.inputWrapper,
      fullWidth && styles.fullWidth,
    ]
      .filter(Boolean)
      .join(' '), [fullWidth]);

    const displayError = error || internalError;
    const showSuccess = success && !displayError;

    return (
      <div className={wrapperClasses}>
        {label && (
          <label className={`${styles.label} ${(required || validation?.required) ? styles.required : ''}`}>
            {label}
          </label>
        )}
        
        <div className={styles.inputContainer}>
          {leftIcon && <div className={styles.leftIcon}>{leftIcon}</div>}
          
          <input
            ref={ref}
            className={inputClasses}
            required={required || validation?.required}
            onChange={handleChange}
            onBlur={handleBlur}
            aria-invalid={!!displayError}
            aria-describedby={
              displayError
                ? `${props.id || 'input'}-error`
                : showSuccess
                ? `${props.id || 'input'}-success`
                : helperText
                ? `${props.id || 'input'}-helper`
                : undefined
            }
            {...props}
          />
          
          {rightIcon && <div className={styles.rightIcon}>{rightIcon}</div>}
        </div>

        {displayError && (
          <div
            id={`${props.id || 'input'}-error`}
            className={styles.errorMessage}
            role="alert"
          >
            <span>⚠</span>
            {displayError}
          </div>
        )}

        {showSuccess && (
          <div
            id={`${props.id || 'input'}-success`}
            className={styles.successMessage}
          >
            <span>✓</span>
            {success}
          </div>
        )}

        {helperText && !displayError && !showSuccess && (
          <div
            id={`${props.id || 'input'}-helper`}
            className={styles.helperText}
          >
            {helperText}
          </div>
        )}
      </div>
    );
  }
));

Input.displayName = 'Input';