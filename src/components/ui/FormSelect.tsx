import React from 'react';
import { Select, SelectProps } from './Select';
import type { FormFieldProps } from '../../types/form';

export interface FormSelectProps extends Omit<SelectProps, 'value' | 'onChange' | 'onBlur' | 'error'>, FormFieldProps<string> {
  showError?: boolean;
}

/**
 * Form-integrated Select component that works with useForm hook
 */
export const FormSelect = React.forwardRef<HTMLSelectElement, FormSelectProps>(
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
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      onChange(e.target.value);
    };

    const handleBlur = () => {
      onBlur();
    };

    // Only show error if field has been touched and showError is true
    const displayError = showError && touched && error ? error : undefined;

    return (
      <Select
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

FormSelect.displayName = 'FormSelect';