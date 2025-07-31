import React from 'react';
import { useForm, validationRules, createValidationSchema } from '../../hooks';
import { Form } from '../ui/Form';
import { FormInput } from '../ui/FormInput';
import { FormTextarea } from '../ui/FormTextarea';
import { FormSelect } from '../ui/FormSelect';
import { Button } from '../ui/Button';
import styles from './ProfileForm.module.css';

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bio: string;
  website: string;
  company: string;
  jobTitle: string;
  location: string;
  timezone: string;
}

const timezoneOptions = [
  { value: 'UTC-12', label: '(UTC-12:00) International Date Line West' },
  { value: 'UTC-11', label: '(UTC-11:00) Coordinated Universal Time-11' },
  { value: 'UTC-10', label: '(UTC-10:00) Hawaii' },
  { value: 'UTC-9', label: '(UTC-09:00) Alaska' },
  { value: 'UTC-8', label: '(UTC-08:00) Pacific Time (US & Canada)' },
  { value: 'UTC-7', label: '(UTC-07:00) Mountain Time (US & Canada)' },
  { value: 'UTC-6', label: '(UTC-06:00) Central Time (US & Canada)' },
  { value: 'UTC-5', label: '(UTC-05:00) Eastern Time (US & Canada)' },
  { value: 'UTC-4', label: '(UTC-04:00) Atlantic Time (Canada)' },
  { value: 'UTC-3', label: '(UTC-03:00) Brasilia' },
  { value: 'UTC-2', label: '(UTC-02:00) Coordinated Universal Time-02' },
  { value: 'UTC-1', label: '(UTC-01:00) Azores' },
  { value: 'UTC+0', label: '(UTC+00:00) London, Dublin, Edinburgh' },
  { value: 'UTC+1', label: '(UTC+01:00) Amsterdam, Berlin, Rome' },
  { value: 'UTC+2', label: '(UTC+02:00) Athens, Istanbul, Minsk' },
  { value: 'UTC+3', label: '(UTC+03:00) Kuwait, Riyadh, Moscow' },
  { value: 'UTC+4', label: '(UTC+04:00) Abu Dhabi, Muscat' },
  { value: 'UTC+5', label: '(UTC+05:00) Islamabad, Karachi' },
  { value: 'UTC+6', label: '(UTC+06:00) Astana, Dhaka' },
  { value: 'UTC+7', label: '(UTC+07:00) Bangkok, Hanoi, Jakarta' },
  { value: 'UTC+8', label: '(UTC+08:00) Beijing, Perth, Singapore' },
  { value: 'UTC+9', label: '(UTC+09:00) Tokyo, Seoul, Osaka' },
  { value: 'UTC+10', label: '(UTC+10:00) Eastern Australia, Guam' },
  { value: 'UTC+11', label: '(UTC+11:00) Magadan, Solomon Is.' },
  { value: 'UTC+12', label: '(UTC+12:00) Auckland, Wellington' },
];

const validationSchema = createValidationSchema<ProfileFormData>()
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
  .field('phone')
    .custom(validationRules.phone('Please enter a valid phone number'))
    .and()
  .field('bio')
    .maxLength(500, 'Bio must be no more than 500 characters')
    .and()
  .field('website')
    .custom(validationRules.url('Please enter a valid URL'))
    .and()
  .field('company')
    .maxLength(100, 'Company name must be no more than 100 characters')
    .and()
  .field('jobTitle')
    .maxLength(100, 'Job title must be no more than 100 characters')
    .and()
  .field('location')
    .maxLength(100, 'Location must be no more than 100 characters')
    .and()
  .build();

export interface ProfileFormProps {
  initialData?: Partial<ProfileFormData>;
  onSubmit: (data: ProfileFormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  error?: string;
  success?: string;
}

/**
 * Profile form example demonstrating form sections and complex validation
 */
export const ProfileForm: React.FC<ProfileFormProps> = ({
  initialData = {},
  onSubmit,
  onCancel,
  isLoading = false,
  error,
  success,
}) => {
  const form = useForm<ProfileFormData>({
    initialValues: {
      firstName: initialData.firstName || '',
      lastName: initialData.lastName || '',
      email: initialData.email || '',
      phone: initialData.phone || '',
      bio: initialData.bio || '',
      website: initialData.website || '',
      company: initialData.company || '',
      jobTitle: initialData.jobTitle || '',
      location: initialData.location || '',
      timezone: initialData.timezone || 'UTC+0',
    },
    validationSchema,
    onSubmit,
  });

  const handleCancel = () => {
    if (form.isDirty) {
      const confirmDiscard = window.confirm(
        'You have unsaved changes. Are you sure you want to discard them?'
      );
      if (!confirmDiscard) return;
    }
    
    form.resetForm();
    onCancel?.();
  };

  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileCard}>
        <div className={styles.profileHeader}>
          <h1 className={styles.profileTitle}>Edit Profile</h1>
          <p className={styles.profileSubtitle}>
            Update your personal information and preferences.
          </p>
        </div>

        <Form
          onSubmit={form.handleSubmit}
          isSubmitting={form.isSubmitting}
          error={error}
          success={success}
          showSubmitButton={false}
          className={styles.profileForm}
        >
          {/* Basic Information */}
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Basic Information</h2>
            
            <div className={styles.fieldRow}>
              <FormInput
                {...form.getFieldProps('firstName')}
                label="First Name"
                placeholder="Enter your first name"
                fullWidth
              />

              <FormInput
                {...form.getFieldProps('lastName')}
                label="Last Name"
                placeholder="Enter your last name"
                fullWidth
              />
            </div>

            <FormInput
              {...form.getFieldProps('email')}
              label="Email Address"
              type="email"
              placeholder="Enter your email"
              fullWidth
            />

            <FormInput
              {...form.getFieldProps('phone')}
              label="Phone Number"
              type="tel"
              placeholder="Enter your phone number"
              fullWidth
            />

            <FormTextarea
              {...form.getFieldProps('bio')}
              label="Bio"
              placeholder="Tell us about yourself..."
              autoResize
              minRows={3}
              maxRows={6}
              showCharCount
              maxLength={500}
              fullWidth
            />
          </div>

          {/* Professional Information */}
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Professional Information</h2>
            
            <div className={styles.fieldRow}>
              <FormInput
                {...form.getFieldProps('company')}
                label="Company"
                placeholder="Enter your company name"
                fullWidth
              />

              <FormInput
                {...form.getFieldProps('jobTitle')}
                label="Job Title"
                placeholder="Enter your job title"
                fullWidth
              />
            </div>

            <FormInput
              {...form.getFieldProps('website')}
              label="Website"
              type="url"
              placeholder="https://example.com"
              fullWidth
            />

            <FormInput
              {...form.getFieldProps('location')}
              label="Location"
              placeholder="City, Country"
              fullWidth
            />

            <FormSelect
              {...form.getFieldProps('timezone')}
              label="Timezone"
              options={timezoneOptions}
              searchable
              fullWidth
            />
          </div>

          {/* Form Actions */}
          <div className={styles.formActions}>
            {onCancel && (
              <Button
                type="button"
                variant="secondary"
                onClick={handleCancel}
                disabled={form.isSubmitting}
              >
                Cancel
              </Button>
            )}
            
            <Button
              type="button"
              variant="secondary"
              onClick={() => form.resetForm()}
              disabled={form.isSubmitting || !form.isDirty}
            >
              Reset
            </Button>

            <Button
              type="submit"
              variant="primary"
              loading={form.isSubmitting}
              disabled={!form.isValid || !form.isDirty}
              onClick={form.handleSubmit}
            >
              Save Changes
            </Button>
          </div>
        </Form>

        {/* Unsaved Changes Warning */}
        {form.isDirty && (
          <div className={styles.unsavedWarning}>
            <span>⚠</span>
            You have unsaved changes. Don't forget to save your updates!
          </div>
        )}
      </div>
    </div>
  );
};