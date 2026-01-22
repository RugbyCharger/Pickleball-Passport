'use client';

/**
 * Analytics Provider (E13-S1)
 *
 * Automatically tracks user sessions and page views.
 * Wraps the app to provide analytics tracking functionality.
 */

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { analytics } from '@/lib/utils/analytics';

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialized = useRef(false);
  const lastTrackedPath = useRef<string | null>(null);

  // Initialize session on mount
  useEffect(() => {
    if (!initialized.current) {
      analytics.initSession();
      initialized.current = true;
    }
  }, []);

  // Track page views on route change
  useEffect(() => {
    // Create a full path string including search params
    const fullPath = searchParams.toString()
      ? `${pathname}?${searchParams.toString()}`
      : pathname;

    // Only track if the path actually changed
    if (lastTrackedPath.current !== fullPath) {
      lastTrackedPath.current = fullPath;
      analytics.trackPageView(fullPath);
    }
  }, [pathname, searchParams]);

  return <>{children}</>;
}
