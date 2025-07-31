import React from 'react';
import { useForm, validationRules, createValidationSchema } from '../../hooks';
import { Form } from '../ui/Form';
import { FormInput } from '../ui/FormInput';
import { FormSelect } from '../ui/FormSelect';
import { FormCheckbox } from '../ui/FormCheckbox';
import { Link } from '../ui/Link';
import styles from './RegistrationForm.module.css';

interface RegistrationFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  dateOfBirth: string;
  country: string;
  agreeToTerms: boolean;
  subscribeNewsletter: boolean;
}

const countryOptions = [
  { value: 'us', label: 'United States' },
  { value: 'ca', label: 'Canada' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'de', label: 'Germany' },
  { value: 'fr', label: 'France' },
  { value: 'jp', label: 'Japan' },
  { value: 'au', label: 'Australia' },
];

const validationSchema = createValidationSchema<RegistrationFormData>()
  .field('firstName')
    .required('First name is required')
    .minLength(2, 'First name must be at least 2 characters')
    .and()
  .field('lastName')
    .required('Last name is required')
    .minLength(2, 'Last name must be at least 2 characters')
    .and()
  .field('email')
    .required('Email is required')
    .email('Please enter a valid email address')
    .and()
  .field('password')
    .required('Password is required')
    .custom(validationRules.password({
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
    }))
    .and()
  .field('confirmPassword')
    .required('Please confirm your password')
    .custom((value, formValues) => {
      if (formValues?.password !== value) {
        return 'Passwords do not match';
      }
      return undefined;
    })
    .and()
  .field('dateOfBirth')
    .required('Date of birth is required')
    .custom(validationRules.minAge(13, 'You must be at least 13 years old'))
    .and()
  .field('country')
    .required('Please select your country')
    .and()
  .field('agreeToTerms')
    .custom((value: boolean) => {
      if (!value) {
        return 'You must agree to the terms and conditions';
      }
      return undefined;
    })
    .and()
  .build();

export interface RegistrationFormProps {
  onSubmit: (data: RegistrationFormData) => Promise<void>;
  isLoading?: boolean;
  error?: string;
}

/**
 * Registration form example demonstrating complex validation and form structure
 */
export const RegistrationForm: React.FC<RegistrationFormProps> = ({
  onSubmit,
  isLoading = false,
  error,
}) => {
  const form = useForm<RegistrationFormData>({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      dateOfBirth: '',
      country: '',
      agreeToTerms: false,
      subscribeNewsletter: false,
    },
    validationSchema,
    onSubmit,
  });

  return (
    <div className={styles.registrationContainer}>
      <div className={styles.registrationCard}>
        <div className={styles.registrationHeader}>
          <h1 className={styles.registrationTitle}>Create Account</h1>
          <p className={styles.registrationSubtitle}>
            Join us today! Please fill in the information below.
          </p>
        </div>

        <Form
          onSubmit={form.handleSubmit}
          isSubmitting={form.isSubmitting}
          error={error}
          submitText="Create Account"
          submitFullWidth
          className={styles.registrationForm}
        >
          {/* Personal Information Section */}
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Personal Information</h2>
            
            <div className={styles.fieldRow}>
              <FormInput
                {...form.getFieldProps('firstName')}
                label="First Name"
                placeholder="Enter your first name"
                autoComplete="given-name"
                fullWidth
              />

              <FormInput
                {...form.getFieldProps('lastName')}
                label="Last Name"
                placeholder="Enter your last name"
                autoComplete="family-name"
                fullWidth
              />
            </div>

            <FormInput
              {...form.getFieldProps('dateOfBirth')}
              label="Date of Birth"
              type="date"
              autoComplete="bday"
              fullWidth
            />

            <FormSelect
              {...form.getFieldProps('country')}
              label="Country"
              placeholder="Select your country"
              options={countryOptions}
              searchable
              fullWidth
            />
          </div>

          {/* Account Information Section */}
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Account Information</h2>
            
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
              placeholder="Create a strong password"
              autoComplete="new-password"
              helperText="Password must contain at least 8 characters with uppercase, lowercase, numbers, and special characters"
              fullWidth
            />

            <FormInput
              {...form.getFieldProps('confirmPassword')}
              label="Confirm Password"
              type="password"
              placeholder="Confirm your password"
              autoComplete="new-password"
              fullWidth
            />
          </div>

          {/* Terms and Preferences */}
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Terms & Preferences</h2>
            
            <FormCheckbox
              {...form.getFieldProps('agreeToTerms')}
              label={
                <span>
                  I agree to the{' '}
                  <Link href="/terms" variant="primary" size="small">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" variant="primary" size="small">
                    Privacy Policy
                  </Link>
                </span>
              }
            />

            <FormCheckbox
              {...form.getFieldProps('subscribeNewsletter')}
              label="Subscribe to our newsletter for updates and promotions"
            />
          </div>
        </Form>

        <div className={styles.registrationFooter}>
          <p className={styles.loginPrompt}>
            Already have an account?{' '}
            <Link href="/login" variant="primary">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};