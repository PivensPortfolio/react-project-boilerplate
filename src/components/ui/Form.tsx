import React from 'react';
import { Button } from './Button';
import { Alert } from './Alert';
import styles from './Form.module.css';

export interface FormProps extends Omit<React.FormHTMLAttributes<HTMLFormElement>, 'onSubmit'> {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void> | void;
  isSubmitting?: boolean;
  submitText?: string;
  submitVariant?: 'primary' | 'secondary' | 'danger' | 'success';
  submitSize?: 'small' | 'medium' | 'large';
  submitFullWidth?: boolean;
  showSubmitButton?: boolean;
  error?: string;
  success?: string;
  disabled?: boolean;
  children: React.ReactNode;
}

/**
 * Form component with built-in submission handling, loading states, and error display
 */
export const Form: React.FC<FormProps> = ({
  onSubmit,
  isSubmitting = false,
  submitText = 'Submit',
  submitVariant = 'primary',
  submitSize = 'medium',
  submitFullWidth = false,
  showSubmitButton = true,
  error,
  success,
  disabled = false,
  children,
  className = '',
  ...props
}) => {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting || disabled) return;
    
    try {
      await onSubmit(e);
    } catch (err) {
      // Error handling is managed by the parent component
      console.error('Form submission error:', err);
    }
  };

  const formClasses = [
    styles.form,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <form
      className={formClasses}
      onSubmit={handleSubmit}
      noValidate
      {...props}
    >
      {/* Form content */}
      <div className={styles.formContent}>
        {children}
      </div>

      {/* Error message */}
      {error && (
        <div className={styles.formMessage}>
          <Alert type="error" title="Form Error">
            {error}
          </Alert>
        </div>
      )}

      {/* Success message */}
      {success && (
        <div className={styles.formMessage}>
          <Alert type="success" title="Success">
            {success}
          </Alert>
        </div>
      )}

      {/* Submit button */}
      {showSubmitButton && (
        <div className={styles.formActions}>
          <Button
            type="submit"
            variant={submitVariant}
            size={submitSize}
            fullWidth={submitFullWidth}
            loading={isSubmitting}
            disabled={disabled || isSubmitting}
          >
            {submitText}
          </Button>
        </div>
      )}
    </form>
  );
};

Form.displayName = 'Form';