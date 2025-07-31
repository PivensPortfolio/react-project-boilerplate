/**
 * Profile Page Component
 * Allows users to view and update their profile information
 */

import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useForm } from '../hooks/useForm';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Alert } from '../components/ui/Alert';
import { Card } from '../components/ui/Card';
import { authService } from '../services/authService';

interface ProfileFormData {
  name: string;
  email: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const [profileSuccess, setProfileSuccess] = useState<string>('');
  const [profileError, setProfileError] = useState<string>('');
  const [passwordSuccess, setPasswordSuccess] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');

  // Profile form
  const profileForm = useForm<ProfileFormData>({
    initialValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
    validationSchema: {
      name: {
        required: true,
        minLength: 2,
      },
      email: {
        required: true,
        email: true,
      },
    },
    onSubmit: async (formData) => {
      try {
        setProfileError('');
        setProfileSuccess('');
        
        // TODO: Implement profile update API call
        console.log('Profile update:', formData);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setProfileSuccess('Profile updated successfully!');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Profile update failed';
        setProfileError(message);
      }
    },
  });

  // Password form
  const passwordForm = useForm<PasswordFormData>({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validationSchema: {
      currentPassword: {
        required: true,
      },
      newPassword: {
        required: true,
        minLength: 8,
        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        patternMessage: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      },
      confirmPassword: {
        required: true,
        custom: (value, formValues) => {
          if (value !== formValues.newPassword) {
            return 'Passwords do not match';
          }
          return null;
        },
      },
    },
    onSubmit: async (formData) => {
      try {
        setPasswordError('');
        setPasswordSuccess('');
        
        await authService.changePassword(formData.currentPassword, formData.newPassword);
        
        setPasswordSuccess('Password changed successfully!');
        passwordForm.resetForm();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Password change failed';
        setPasswordError(message);
      }
    },
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="mt-2 text-gray-600">
            Manage your account settings and preferences.
          </p>
        </div>

        <div className="space-y-8">
          {/* Profile Information */}
          <Card>
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Profile Information
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Update your account's profile information and email address.
              </p>
            </div>

            <div className="px-6 py-4">
              {profileSuccess && (
                <Alert type="success" className="mb-4">
                  {profileSuccess}
                </Alert>
              )}
              {profileError && (
                <Alert type="error" className="mb-4">
                  {profileError}
                </Alert>
              )}

              <form onSubmit={profileForm.handleSubmit} className="space-y-4">
                <Input
                  label="Full name"
                  type="text"
                  name="name"
                  value={profileForm.values.name}
                  onChange={(value) => profileForm.handleChange('name', value)}
                  error={profileForm.errors.name}
                  required
                />

                <Input
                  label="Email address"
                  type="email"
                  name="email"
                  value={profileForm.values.email}
                  onChange={(value) => profileForm.handleChange('email', value)}
                  error={profileForm.errors.email}
                  required
                />

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    loading={profileForm.isSubmitting}
                    disabled={profileForm.isSubmitting}
                  >
                    {profileForm.isSubmitting ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </div>
          </Card>

          {/* Change Password */}
          <Card>
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Change Password
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Update your password to keep your account secure.
              </p>
            </div>

            <div className="px-6 py-4">
              {passwordSuccess && (
                <Alert type="success" className="mb-4">
                  {passwordSuccess}
                </Alert>
              )}
              {passwordError && (
                <Alert type="error" className="mb-4">
                  {passwordError}
                </Alert>
              )}

              <form onSubmit={passwordForm.handleSubmit} className="space-y-4">
                <Input
                  label="Current password"
                  type="password"
                  name="currentPassword"
                  value={passwordForm.values.currentPassword}
                  onChange={(value) => passwordForm.handleChange('currentPassword', value)}
                  error={passwordForm.errors.currentPassword}
                  required
                  autoComplete="current-password"
                />

                <Input
                  label="New password"
                  type="password"
                  name="newPassword"
                  value={passwordForm.values.newPassword}
                  onChange={(value) => passwordForm.handleChange('newPassword', value)}
                  error={passwordForm.errors.newPassword}
                  required
                  autoComplete="new-password"
                  helperText="Must be at least 8 characters with uppercase, lowercase, and number"
                />

                <Input
                  label="Confirm new password"
                  type="password"
                  name="confirmPassword"
                  value={passwordForm.values.confirmPassword}
                  onChange={(value) => passwordForm.handleChange('confirmPassword', value)}
                  error={passwordForm.errors.confirmPassword}
                  required
                  autoComplete="new-password"
                />

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    loading={passwordForm.isSubmitting}
                    disabled={passwordForm.isSubmitting}
                  >
                    {passwordForm.isSubmitting ? 'Changing...' : 'Change Password'}
                  </Button>
                </div>
              </form>
            </div>
          </Card>

          {/* Account Information */}
          <Card>
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Account Information
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                View your account details and status.
              </p>
            </div>

            <div className="px-6 py-4">
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">User ID</dt>
                  <dd className="mt-1 text-sm text-gray-900">{user.id}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Role</dt>
                  <dd className="mt-1 text-sm text-gray-900 capitalize">{user.role}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Account Status</dt>
                  <dd className="mt-1">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email Verified</dt>
                  <dd className="mt-1">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.emailVerified 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user.emailVerified ? 'Verified' : 'Pending'}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Member Since</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </dd>
                </div>
                {user.lastLoginAt && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Last Login</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(user.lastLoginAt).toLocaleString()}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </Card>

          {/* Danger Zone */}
          <Card>
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-red-900">
                Danger Zone
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Irreversible and destructive actions.
              </p>
            </div>

            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    Sign out of all devices
                  </h3>
                  <p className="text-sm text-gray-600">
                    This will sign you out of all devices and invalidate all sessions.
                  </p>
                </div>
                <Button
                  variant="danger"
                  onClick={logout}
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;