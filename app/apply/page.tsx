'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApplicationForm } from '@/components/forms/application-form';

/**
 * Application Page
 *
 * Multi-step form for potential guests to apply to Pickleball Passport
 */
export default function ApplyPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/apply/success');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="container max-w-4xl mx-auto py-12 px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Begin Your Transformation Journey
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Tell us about yourself and your goals. This helps us create the perfect experience for you.
          </p>
        </div>

        {/* Application Form */}
        <ApplicationForm onSuccess={handleSuccess} />
      </div>
    </div>
  );
}
