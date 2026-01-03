'use client';

/**
 * Newsletter Confirmation Client Component
 *
 * Client-side logic for subscription confirmation (E1-S11)
 */

import { useEffect, useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { toast } from 'sonner';

interface ConfirmClientProps {
  token: string;
}

export default function ConfirmClient({ token }: ConfirmClientProps) {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  const confirmMutation = trpc.newsletter.confirm.useMutation({
    onSuccess: (data) => {
      setStatus('success');
      setMessage(data.message);
      toast.success(data.message);
    },
    onError: (error) => {
      setStatus('error');
      setMessage(error.message);
      toast.error(error.message);
    },
  });

  useEffect(() => {
    // Trigger confirmation on mount
    confirmMutation.mutate({ token });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (status === 'loading') {
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

  if (status === 'error') {
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
            Confirmation Failed
          </h1>
          <p className="text-gray-600 mb-6">{message}</p>
          <div className="space-y-3">
            <a
              href="/#newsletter"
              className="block bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition"
            >
              Try Subscribing Again
            </a>
            <a
              href="/"
              className="block text-gray-600 hover:text-gray-900 transition"
            >
              Return to Homepage
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-blue-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
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
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Subscription Confirmed! 🎉
        </h1>
        <p className="text-gray-600 mb-6">{message}</p>
        <p className="text-sm text-gray-500 mb-6">
          You'll start receiving our newsletter with exclusive offers, wellness
          tips, and pickleball adventures.
        </p>
        <div className="space-y-3">
          <a
            href="/packages"
            className="block bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition"
          >
            Explore Packages
          </a>
          <a
            href="/"
            className="block text-gray-600 hover:text-gray-900 transition"
          >
            Return to Homepage
          </a>
        </div>
      </div>
    </div>
  );
}
