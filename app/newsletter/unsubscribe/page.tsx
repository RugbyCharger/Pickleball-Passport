/**
 * Newsletter Unsubscribe Page
 *
 * Handles unsubscribing from newsletter (E1-S11)
 */

import { Suspense } from 'react';
import UnsubscribeClient from './unsubscribe-client';

export const metadata = {
  title: 'Unsubscribe | The Pickleball Passport',
  description: 'Unsubscribe from newsletter',
};

interface PageProps {
  searchParams: Promise<{ email?: string; token?: string }>;
}

export default async function UnsubscribePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const email = params.email;
  const token = params.token;

  if (!email && !token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-blue-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-amber-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Missing Information
          </h1>
          <p className="text-gray-600 mb-6">
            This unsubscribe link is missing required information. Please use
            the unsubscribe link from your email.
          </p>
          <a
            href="/"
            className="inline-block bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition"
          >
            Return to Homepage
          </a>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<LoadingState />}>
      <UnsubscribeClient email={email} token={token} />
    </Suspense>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-blue-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="animate-pulse">
          <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
          <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-6"></div>
        </div>
      </div>
    </div>
  );
}
