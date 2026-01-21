'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function UnsubscribePage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [unsubscribed, setUnsubscribed] = useState(false);

  const unsubscribeMutation = trpc.preferences.unsubscribeAllByToken.useMutation();

  useEffect(() => {
    if (token && !unsubscribed) {
      handleUnsubscribe();
    }
  }, [token]);

  const handleUnsubscribe = async () => {
    if (!token) return;

    try {
      await unsubscribeMutation.mutateAsync({ token });
      setUnsubscribed(true);
    } catch (error) {
      console.error('Unsubscribe failed:', error);
    }
  };

  if (!token) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center">
        <h1 className="text-3xl font-bold text-red-600">Invalid Link</h1>
        <p className="text-gray-600 mt-4">
          This unsubscribe link is invalid. Please use the link from your email.
        </p>
      </div>
    );
  }

  if (unsubscribeMutation.isError) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center">
        <h1 className="text-3xl font-bold text-red-600">Link Expired</h1>
        <p className="text-gray-600 mt-4">
          This unsubscribe link has expired or is invalid.
        </p>
        <p className="text-gray-600 mt-4">
          Please log in to your account to manage your preferences, or contact support.
        </p>
      </div>
    );
  }

  if (!unsubscribed && unsubscribeMutation.isPending) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center">
        <div className="animate-pulse">Unsubscribing...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-8 text-center">
      <div className="mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-green-600"
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
        <h1 className="text-3xl font-bold text-gray-900">You've Been Unsubscribed</h1>
        <p className="text-gray-600 mt-4">
          You have been unsubscribed from all optional Pickleball Passport emails.
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 mb-8">
        <h2 className="font-semibold text-gray-900 mb-2">What this means:</h2>
        <ul className="text-sm text-gray-600 space-y-2">
          <li>✓ No more marketing emails or newsletters</li>
          <li>✓ No more pre-trip or post-trip emails</li>
          <li>✓ No more alumni event invitations</li>
          <li>✓ You'll still receive booking confirmations and payment receipts</li>
        </ul>
      </div>

      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Changed your mind? You can customize which emails you receive.
        </p>
        <Link href={`/preferences?token=${token}`}>
          <Button variant="outline">Manage Detailed Preferences</Button>
        </Link>
      </div>
    </div>
  );
}
