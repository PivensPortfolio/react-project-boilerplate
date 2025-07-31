import React from 'react';
import { Input, InputProps } from './Input';
import type { FormFieldProps } from '../../types/form';

export interface FormInputProps extends Omit<InputProps, 'value' | 'onChange' | 'onBlur' | 'error'>, FormFieldProps<string> {
  showError?: boolean;
}

/**
 * Form-integrated Input component that works with useForm hook
 */
export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
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
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    };

    const handleBlur = () => {
      onBlur();
    };

    // Only show error if field has been touched and showError is true
    const displayError = showError && touched && error ? error : undefined;

    return (
      <Input
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

FormInput.displayName = 'FormInput';