'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { WaitlistModal } from '@/components/trips/waitlist-modal';

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
  const [isOpen, setIsOpen] = useState(false);
  const [tripName, setTripName] = useState('Thailand Trip');

  const openLeadModal = useCallback((name = 'Thailand Trip') => {
    setTripName(name);
    setIsOpen(true);
  }, []);

  return (
    <LeadModalContext.Provider value={{ openLeadModal }}>
      {children}
      <WaitlistModal
        open={isOpen}
        onOpenChange={setIsOpen}
        tripName={tripName}
      />
    </LeadModalContext.Provider>
  );
}
