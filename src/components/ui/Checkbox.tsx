import React, { useId } from 'react';
import styles from './Checkbox.module.css';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  size?: 'small' | 'medium' | 'large';
  error?: string;
  helperText?: string;
  indeterminate?: boolean;
  variant?: 'default' | 'card';
  children?: React.ReactNode;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      size = 'medium',
      error,
      helperText,
      indeterminate = false,
      variant = 'default',
      children,
      className = '',
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const checkboxId = id || generatedId;

    const checkboxClasses = [
      styles.checkbox,
      styles[size],
      styles[variant],
      error && styles.error,
      disabled && styles.disabled,
      indeterminate && styles.indeterminate,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const wrapperClasses = [
      styles.checkboxWrapper,
      variant === 'card' && styles.cardWrapper,
    ]
      .filter(Boolean)
      .join(' ');

    // Set indeterminate property on the input element
    React.useEffect(() => {
      if (ref && typeof ref === 'object' && ref.current) {
        ref.current.indeterminate = indeterminate;
      }
    }, [indeterminate, ref]);

    const content = children || label;

    return (
      <div className={wrapperClasses}>
        <div className={styles.checkboxContainer}>
          <input
            ref={ref}
            type="checkbox"
            id={checkboxId}
            className={checkboxClasses}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={
              error
                ? `${checkboxId}-error`
                : helperText
                ? `${checkboxId}-helper`
                : undefined
            }
            {...props}
          />
          
          <div className={styles.checkboxIndicator} aria-hidden="true">
            {indeterminate ? (
              <span className={styles.indeterminateIcon}>−</span>
            ) : (
              <span className={styles.checkIcon}>✓</span>
            )}
          </div>

          {content && (
            <label
              htmlFor={checkboxId}
              className={`${styles.label} ${disabled ? styles.labelDisabled : ''}`}
            >
              {content}
            </label>
          )}
        </div>

        {error && (
          <div
            id={`${checkboxId}-error`}
            className={styles.errorMessage}
            role="alert"
          >
            <span>⚠</span>
            {error}
          </div>
        )}

        {helperText && !error && (
          <div
            id={`${checkboxId}-helper`}
            className={styles.helperText}
          >
            {helperText}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';