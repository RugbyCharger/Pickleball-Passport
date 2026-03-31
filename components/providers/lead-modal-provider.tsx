'use client';

import { createContext, useContext, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface LeadModalContextValue {
  openLeadModal: (tripName?: string) => void;
}

const LeadModalContext = createContext<LeadModalContextValue>({
  openLeadModal: () => {},
});

export function useLeadModal() {
  return useContext(LeadModalContext);
}

export function LeadModalProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const openLeadModal = useCallback(() => {
    const ref = searchParams.get('ref');
    router.push(ref ? `/reserve?ref=${encodeURIComponent(ref)}` : '/reserve');
  }, [router, searchParams]);

  return (
    <LeadModalContext.Provider value={{ openLeadModal }}>
      {children}
    </LeadModalContext.Provider>
  );
}
