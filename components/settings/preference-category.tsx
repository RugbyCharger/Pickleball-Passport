'use client';

import { ReactNode } from 'react';

interface PreferenceCategoryProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function PreferenceCategory({
  title,
  description,
  children,
}: PreferenceCategoryProps) {
  return (
    <div className="mb-8">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {description && (
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        )}
      </div>
      <div className="bg-white rounded-lg border border-gray-200 divide-y">
        {children}
      </div>
    </div>
  );
}
