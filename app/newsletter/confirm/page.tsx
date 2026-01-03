/**
 * Newsletter Confirmation Page
 *
 * Handles subscription confirmation via email token (E1-S11)
 */

import { Suspense } from 'react';
import ConfirmClient from './confirm-client';

export const metadata = {
  title: 'Confirm Subscription | Pickleball Passport',
  description: 'Confirm your newsletter subscription',
};

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function ConfirmPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const token = params.token;

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-blue-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Invalid Confirmation Link
          </h1>
          <p className="text-gray-600 mb-6">
            This confirmation link is missing required information. Please check
            your email and click the confirmation link again.
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
      <ConfirmClient token={token} />
    </Suspense>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-blue-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
          <svg
            className="w-8 h-8 text-emerald-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Confirming Your Subscription...
        </h1>
        <p className="text-gray-600">Please wait a moment.</p>
      </div>
    </div>
  );
}
