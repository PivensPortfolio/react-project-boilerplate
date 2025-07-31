import React from 'react';
import { useForm, validationRules, createValidationSchema } from '../../hooks';
import { Form } from '../ui/Form';
import { FormInput } from '../ui/FormInput';
import { FormCheckbox } from '../ui/FormCheckbox';
import { Link } from '../ui/Link';
import styles from './LoginForm.module.css';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

const validationSchema = createValidationSchema<LoginFormData>()
  .field('email')
    .required('Email is required')
    .email('Please enter a valid email address')
    .and()
  .field('password')
    .required('Password is required')
    .minLength(6, 'Password must be at least 6 characters')
    .and()
  .build();

export interface LoginFormProps {
  onSubmit: (data: LoginFormData) => Promise<void>;
  isLoading?: boolean;
  error?: string;
}

/**
 * Login form example demonstrating form validation and submission
 */
export const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  isLoading = false,
  error,
}) => {
  const form = useForm<LoginFormData>({
    initialValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
    validationSchema,
    onSubmit,
  });

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.loginHeader}>
          <h1 className={styles.loginTitle}>Sign In</h1>
          <p className={styles.loginSubtitle}>
            Welcome back! Please sign in to your account.
          </p>
        </div>

        <Form
          onSubmit={form.handleSubmit}
          isSubmitting={form.isSubmitting}
          error={error}
          submitText="Sign In"
          submitFullWidth
          className={styles.loginForm}
        >
          <FormInput
            {...form.getFieldProps('email')}
            label="Email Address"
            type="email"
            placeholder="Enter your email"
            autoComplete="email"
            fullWidth
          />

          <FormInput
            {...form.getFieldProps('password')}
            label="Password"
            type="password"
            placeholder="Enter your password"
            autoComplete="current-password"
            fullWidth
          />

          <div className={styles.formOptions}>
            <FormCheckbox
              {...form.getFieldProps('rememberMe')}
              label="Remember me"
            />

            <Link href="/forgot-password" variant="secondary" size="small">
              Forgot password?
            </Link>
          </div>
        </Form>

        <div className={styles.loginFooter}>
          <p className={styles.signupPrompt}>
            Don't have an account?{' '}
            <Link href="/signup" variant="primary">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};