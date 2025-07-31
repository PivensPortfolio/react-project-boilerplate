import React from 'react';
import { Textarea, TextareaProps } from './Textarea';
import type { FormFieldProps } from '../../types/form';

export interface FormTextareaProps extends Omit<TextareaProps, 'value' | 'onChange' | 'onBlur' | 'error'>, FormFieldProps<string> {
  showError?: boolean;
}

/**
 * Form-integrated Textarea component that works with useForm hook
 */
export const FormTextarea = React.forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  (
    {
      name,
      value,
      error,
      touched,
      dirty,
      onChange,
      onBlur,
      disabled,
      required,
      showError = true,
      ...props
    },
    ref
  ) => {
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value);
    };

    const handleBlur = () => {
      onBlur();
    };

    // Only show error if field has been touched and showError is true
    const displayError = showError && touched && error ? error : undefined;

    return (
      <Textarea
        ref={ref}
        value={value || ''}
        onChange={handleChange}
        onBlur={handleBlur}
        error={displayError}
        disabled={disabled}
        required={required}
        {...props}
      />
    );
  }
);

FormTextarea.displayName = 'FormTextarea';