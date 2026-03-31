'use client';

import { createContext, useContext, useCallback } from 'react';
import { useRouter } from 'next/navigation';

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

  const openLeadModal = useCallback(() => {
    router.push('/reserve');
  }, [router]);

  return (
    <LeadModalContext.Provider value={{ openLeadModal }}>
      {children}
    </LeadModalContext.Provider>
  );
}
