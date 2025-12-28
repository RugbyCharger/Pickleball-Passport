/**
 * Admin Dashboard Placeholder
 * E6-S3: Admin status update interface placeholder
 *
 * Future admin features:
 * - Update booking status
 * - Review and approve documents
 * - Manage trip assignments
 * - Send notifications to guests
 * - View analytics and reports
 */

import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Settings, Users, FileCheck, Calendar, Bell, BarChart } from 'lucide-react';

export default async function AdminDashboardPage() {
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  // TODO: Check if user has admin role
  // For now, this is a placeholder accessible to all authenticated users

  const adminFeatures = [
    {
      id: 'bookings',
      name: 'Manage Bookings',
      description: 'Update booking status, assign trips, and manage guest bookings',
      icon: Calendar,
      status: 'Coming Soon',
      features: [
        'Update booking status',
        'Assign guests to trips',
        'View booking analytics',
        'Export booking reports',
      ],
    },
    {
      id: 'documents',
      name: 'Document Review',
      description: 'Review and approve guest documents (passports, medical forms, etc.)',
      icon: FileCheck,
      status: 'Coming Soon',
      features: [
        'Review uploaded documents',
        'Approve or reject documents',
        'Request additional documents',
        'Track document compliance',
      ],
    },
    {
      id: 'guests',
      name: 'Guest Management',
      description: 'Manage guest profiles, preferences, and communication',
      icon: Users,
      status: 'Coming Soon',
      features: [
        'View all guest profiles',
        'Update guest information',
        'Track guest journey',
        'Manage emergency contacts',
      ],
    },
    {
      id: 'notifications',
      name: 'Notifications & Emails',
      description: 'Send notifications and emails to guests',
      icon: Bell,
      status: 'Coming Soon',
      features: [
        'Send bulk notifications',
        'Schedule trip reminders',
        'Customize email templates',
        'Track notification delivery',
      ],
    },
    {
      id: 'analytics',
      name: 'Analytics & Reports',
      description: 'View insights, analytics, and generate reports',
      icon: BarChart,
      status: 'Coming Soon',
      features: [
        'Booking conversion metrics',
        'Revenue analytics',
        'Guest satisfaction scores',
        'Trip capacity planning',
      ],
    },
    {
      id: 'settings',
      name: 'System Settings',
      description: 'Configure system settings, packages, and pricing',
      icon: Settings,
      status: 'Coming Soon',
      features: [
        'Manage packages and add-ons',
        'Update pricing',
        'Configure payment plans',
        'System configuration',
      ],
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Manage bookings, review documents, and configure system settings
        </p>
      </div>

      {/* Coming Soon Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <Settings className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">
              Admin Features Coming Soon
            </h3>
            <p className="text-sm text-blue-800">
              The admin dashboard is currently under development. Below is a preview
              of the features that will be available to administrators to manage the
              Pickleball Passport platform.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Access */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <a
          href="/dashboard/admin/documents"
          className="bg-white rounded-lg shadow border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileCheck className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded">
              ACTIVE
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Document Review</h3>
          <p className="text-sm text-gray-600">Review and approve guest documents</p>
        </a>

        <a
          href="/dashboard/admin/bookings"
          className="bg-white rounded-lg shadow border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded">
              ACTIVE
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Booking Management</h3>
          <p className="text-sm text-gray-600">Manage booking statuses and assignments</p>
        </a>

        <a
          href="/dashboard/admin/guests"
          className="bg-white rounded-lg shadow border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded">
              ACTIVE
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Guest Management</h3>
          <p className="text-sm text-gray-600">View and manage guest profiles</p>
        </a>

        <a
          href="/dashboard/admin/trips"
          className="bg-white rounded-lg shadow border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded">
              ACTIVE
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Trip Management</h3>
          <p className="text-sm text-gray-600">Create and manage trips</p>
        </a>

        <a
          href="/dashboard/admin/analytics"
          className="bg-white rounded-lg shadow border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <BarChart className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded">
              ACTIVE
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics Dashboard</h3>
          <p className="text-sm text-gray-600">View comprehensive business analytics</p>
        </a>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminFeatures.map((feature) => {
          const Icon = feature.icon;
          return (
            <div
              key={feature.id}
              className="bg-white rounded-lg shadow border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Icon className="h-6 w-6 text-blue-600" />
                </div>
                <span className="text-xs font-medium text-yellow-700 bg-yellow-100 px-2 py-1 rounded">
                  {feature.status}
                </span>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.name}
              </h3>
              <p className="text-sm text-gray-600 mb-4">{feature.description}</p>

              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                  Planned Features:
                </p>
                <ul className="space-y-1">
                  {feature.features.map((item, index) => (
                    <li
                      key={index}
                      className="text-sm text-gray-600 flex items-start gap-2"
                    >
                      <span className="text-blue-600 mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      {/* Implementation Timeline */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Development Roadmap
        </h3>
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-24 text-sm font-medium text-gray-700">
              Phase 1
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-900 font-medium mb-1">
                Document Review & Booking Management
              </p>
              <p className="text-sm text-gray-600">
                Core admin features for reviewing documents and managing booking
                status updates
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-24 text-sm font-medium text-gray-700">
              Phase 2
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-900 font-medium mb-1">
                Guest Management & Communications
              </p>
              <p className="text-sm text-gray-600">
                Enhanced guest profiles, bulk notifications, and email campaign tools
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-24 text-sm font-medium text-gray-700">
              Phase 3
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-900 font-medium mb-1">
                Analytics & System Configuration
              </p>
              <p className="text-sm text-gray-600">
                Advanced analytics, reporting dashboards, and system settings
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Note */}
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <p className="text-sm text-gray-600">
          Need admin access or have questions about admin features?{' '}
          <a
            href="/dashboard/support"
            className="text-blue-600 hover:text-blue-700 font-medium underline"
          >
            Contact Support
          </a>
        </p>
      </div>
    </div>
  );
}
