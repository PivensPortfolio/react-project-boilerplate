/**
 * Dashboard Page Component
 * Protected page that shows user dashboard
 */

import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { RoleGuard } from '../components/auth/RoleGuard';

export const DashboardPage: React.FC = () => {
  const { user, hasRole, isAdmin } = useAuth();

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
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.name}!
          </h1>
          <p className="mt-2 text-gray-600">
            Here's what's happening with your account today.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Account Overview */}
          <Card>
            <div className="px-6 py-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Account Status</h3>
                  <p className="text-sm text-gray-600">
                    Your account is {user.isActive ? 'active' : 'inactive'}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Email verified:</span>
                  <span className={user.emailVerified ? 'text-green-600' : 'text-yellow-600'}>
                    {user.emailVerified ? 'Yes' : 'Pending'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-gray-500">Role:</span>
                  <span className="text-gray-900 capitalize">{user.role}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card>
            <div className="px-6 py-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
                  <p className="text-sm text-gray-600">
                    Common tasks and shortcuts
                  </p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <Button variant="outline" size="small" className="w-full">
                  Update Profile
                </Button>
                <Button variant="outline" size="small" className="w-full">
                  Change Password
                </Button>
                <Button variant="outline" size="small" className="w-full">
                  View Activity
                </Button>
              </div>
            </div>
          </Card>

          {/* Recent Activity */}
          <Card>
            <div className="px-6 py-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
                  <p className="text-sm text-gray-600">
                    Your latest actions
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <div className="text-sm text-gray-600">
                  <p>• Logged in today</p>
                  <p>• Profile updated 2 days ago</p>
                  <p>• Password changed 1 week ago</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Role-based content */}
        <div className="mt-8 space-y-6">
          {/* Admin-only section */}
          <RoleGuard requiredRole="admin">
            <Card>
              <div className="px-6 py-4 bg-red-50 border-l-4 border-red-400">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Admin Panel
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>You have administrator privileges. Use them responsibly.</p>
                    </div>
                    <div className="mt-4">
                      <div className="flex space-x-2">
                        <Button variant="danger" size="small">
                          Manage Users
                        </Button>
                        <Button variant="outline" size="small">
                          System Settings
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </RoleGuard>

          {/* Moderator or Admin section */}
          <RoleGuard requiredRoles={['admin', 'moderator']} requireAll={false}>
            <Card>
              <div className="px-6 py-4 bg-yellow-50 border-l-4 border-yellow-400">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Moderation Tools
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>You have moderation privileges for content management.</p>
                    </div>
                    <div className="mt-4">
                      <div className="flex space-x-2">
                        <Button variant="primary" size="small">
                          Review Content
                        </Button>
                        <Button variant="outline" size="small">
                          Moderation Log
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </RoleGuard>

          {/* Regular user section */}
          <Card>
            <div className="px-6 py-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Getting Started
              </h3>
              <div className="prose text-sm text-gray-600">
                <p>
                  Welcome to your dashboard! Here you can manage your account, 
                  view your activity, and access various features based on your role.
                </p>
                <ul className="mt-4 space-y-2">
                  <li>• Update your profile information in the Profile section</li>
                  <li>• Change your password for better security</li>
                  <li>• View your account status and verification details</li>
                  {hasRole('admin') && <li>• Access admin tools for user management</li>}
                  {hasRole('moderator') && <li>• Use moderation tools for content review</li>}
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;