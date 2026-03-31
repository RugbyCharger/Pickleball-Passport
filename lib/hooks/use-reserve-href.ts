'use client';

import { useSearchParams } from 'next/navigation';

/**
 * Returns the /reserve URL with the current ref parameter preserved.
 * Used by all components that link to /reserve so partner attribution
 * follows the user through to the GHL form.
 */
export function useReserveHref(): string {
  const searchParams = useSearchParams();
  const ref = searchParams.get('ref');
  return ref ? `/reserve?ref=${encodeURIComponent(ref)}` : '/reserve';
}
