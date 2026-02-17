'use client';

/**
 * Newsletter Unsubscribe Client Component
 *
 * Client-side logic for unsubscribing (E1-S11)
 */

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { toast } from 'sonner';

interface UnsubscribeClientProps {
  email?: string;
  token?: string;
}

export default function UnsubscribeClient({ email, token }: UnsubscribeClientProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const unsubscribeMutation = trpc.newsletter.unsubscribe.useMutation({
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

  const handleUnsubscribe = () => {
    setStatus('loading');
    unsubscribeMutation.mutate({ email, token });
  };

  // Idle state - confirmation form
  if (status === 'idle') {
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
            Confirm Unsubscribe
          </h1>
          <p className="text-gray-600 mb-6">
            Are you sure you want to unsubscribe from The Pickleball Passport
            newsletter?
            {email && (
              <span className="block mt-2 font-semibold text-gray-900">
                {email}
              </span>
            )}
          </p>
          <p className="text-sm text-gray-500 mb-6">
            You'll no longer receive updates about exclusive offers, wellness
            tips, and pickleball adventures.
          </p>
          <div className="space-y-3">
            <button
              onClick={handleUnsubscribe}
              className="w-full bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition"
            >
              Unsubscribe
            </button>
            <a
              href="/"
              className="block text-gray-600 hover:text-gray-900 transition"
            >
              Cancel (Keep Subscription)
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-blue-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
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
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Processing...
          </h1>
          <p className="text-gray-600">Please wait a moment.</p>
        </div>
      </div>
    );
  }

  // Error state
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
            Unsubscribe Failed
          </h1>
          <p className="text-gray-600 mb-6">{message}</p>
          <div className="space-y-3">
            <button
              onClick={handleUnsubscribe}
              className="w-full bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-700 transition"
            >
              Try Again
            </button>
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
          Successfully Unsubscribed
        </h1>
        <p className="text-gray-600 mb-6">{message}</p>
        <p className="text-sm text-gray-500 mb-6">
          You will no longer receive marketing emails from The Pickleball Passport.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
          <h3 className="font-semibold text-blue-900 mb-2">Changed your mind?</h3>
          <p className="text-sm text-blue-700">
            You can resubscribe anytime by visiting our website and signing up again.
          </p>
        </div>
        <div className="space-y-3">
          <a
            href="/#newsletter"
            className="block bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition"
          >
            Resubscribe
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
