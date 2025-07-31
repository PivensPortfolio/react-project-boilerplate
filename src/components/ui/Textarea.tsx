import React, { useState, useCallback, useRef, useEffect } from 'react';
import styles from './Textarea.module.css';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => string | null;
}

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  success?: string;
  helperText?: string;
  fullWidth?: boolean;
  autoResize?: boolean;
  minRows?: number;
  maxRows?: number;
  showCharCount?: boolean;
  validation?: ValidationRule;
  onValidation?: (isValid: boolean, error?: string) => void;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      success,
      helperText,
      fullWidth = false,
      autoResize = false,
      minRows = 3,
      maxRows = 10,
      showCharCount = false,
      validation,
      onValidation,
      className = '',
      required,
      maxLength,
      onChange,
      onBlur,
      style,
      ...props
    },
    ref
  ) => {
    const [internalError, setInternalError] = useState<string>('');
    const [touched, setTouched] = useState(false);
    const [charCount, setCharCount] = useState(0);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Merge refs
    const mergedRef = useCallback(
      (node: HTMLTextAreaElement) => {
        textareaRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref]
    );

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

    const adjustHeight = useCallback(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = 'auto';
      
      // Calculate the new height
      const lineHeight = parseInt(getComputedStyle(textarea).lineHeight, 10) || 20;
      const currentMinRows = minRows;
      const currentMaxRows = maxRows;
      const minHeight = lineHeight * currentMinRows;
      const maxHeight = lineHeight * currentMaxRows;
      const newHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight);
      
      textarea.style.height = `${newHeight}px`;
    }, [minRows, maxRows]);

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setCharCount(value.length);
        
        if (validation && touched) {
          const validationError = validateValue(value);
          setInternalError(validationError || '');
          onValidation?.(validationError === null, validationError || undefined);
        }

        onChange?.(e);
        
        // Adjust height after state update
        if (autoResize) {
          requestAnimationFrame(() => {
            const textarea = textareaRef.current;
            if (!textarea) return;
            textarea.style.height = 'auto';
            const lineHeight = parseInt(getComputedStyle(textarea).lineHeight, 10) || 20;
            const minHeight = lineHeight * minRows;
            const maxHeight = lineHeight * maxRows;
            const newHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight);
            textarea.style.height = `${newHeight}px`;
          });
        }
      },
      [onChange, validation, validateValue, onValidation, touched, autoResize]
    );

    const handleBlur = useCallback(
      (e: React.FocusEvent<HTMLTextAreaElement>) => {
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

    // Initialize character count and height
    useEffect(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        setCharCount(textarea.value.length);
        if (autoResize) {
          adjustHeight();
        }
      }
    }, [autoResize]); // Remove adjustHeight from dependencies

    // Adjust height when content changes externally
    useEffect(() => {
      if (autoResize) {
        adjustHeight();
      }
    }, [props.value, autoResize]); // Remove adjustHeight from dependencies

    const textareaClasses = [
      styles.textarea,
      (error || internalError) && styles.error,
      success && !error && !internalError && styles.success,
      autoResize && styles.autoResize,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const wrapperClasses = [
      styles.textareaWrapper,
      fullWidth && styles.fullWidth,
    ]
      .filter(Boolean)
      .join(' ');

    const displayError = error || internalError;
    const showSuccess = success && !displayError;
    const effectiveMaxLength = maxLength || validation?.maxLength;

    const textareaStyle = {
      ...style,
      ...(autoResize && {
        minHeight: `${(parseInt(getComputedStyle(document.documentElement).fontSize, 10) || 16) * 1.5 * minRows}px`,
        resize: 'none' as const,
      }),
    };

    return (
      <div className={wrapperClasses}>
        {label && (
          <label className={`${styles.label} ${(required || validation?.required) ? styles.required : ''}`}>
            {label}
          </label>
        )}
        
        <div className={styles.textareaContainer}>
          <textarea
            ref={mergedRef}
            className={textareaClasses}
            required={required || validation?.required}
            maxLength={effectiveMaxLength}
            onChange={handleChange}
            onBlur={handleBlur}
            rows={autoResize ? minRows : props.rows || minRows}
            style={textareaStyle}
            aria-invalid={!!displayError}
            aria-describedby={
              displayError
                ? `${props.id || 'textarea'}-error`
                : showSuccess
                ? `${props.id || 'textarea'}-success`
                : helperText
                ? `${props.id || 'textarea'}-helper`
                : undefined
            }
            {...props}
          />
        </div>

        <div className={styles.textareaFooter}>
          <div className={styles.messages}>
            {displayError && (
              <div
                id={`${props.id || 'textarea'}-error`}
                className={styles.errorMessage}
                role="alert"
              >
                <span>⚠</span>
                {displayError}
              </div>
            )}

            {showSuccess && (
              <div
                id={`${props.id || 'textarea'}-success`}
                className={styles.successMessage}
              >
                <span>✓</span>
                {success}
              </div>
            )}

            {helperText && !displayError && !showSuccess && (
              <div
                id={`${props.id || 'textarea'}-helper`}
                className={styles.helperText}
              >
                {helperText}
              </div>
            )}
          </div>

          {(showCharCount || effectiveMaxLength) && (
            <div className={styles.charCount}>
              <span className={effectiveMaxLength && charCount > effectiveMaxLength ? styles.charCountError : ''}>
                {charCount}
                {effectiveMaxLength && ` / ${effectiveMaxLength}`}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';