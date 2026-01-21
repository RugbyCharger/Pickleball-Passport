'use client';

/**
 * WhatsApp Groups Section
 * E11-S10: WhatsApp Group Chat Integration
 *
 * Client-side wrapper component for displaying WhatsApp group cards
 * on the guest dashboard. Only shown when bookings have active groups.
 */

import { WhatsAppGroupCard } from '@/components/guest/whatsapp-group-card';

interface WhatsAppGroupsSectionProps {
  bookingIds: string[];
}

export function WhatsAppGroupsSection({ bookingIds }: WhatsAppGroupsSectionProps) {
  // Don't render section if no bookings have WhatsApp groups
  if (bookingIds.length === 0) {
    return null;
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Trip WhatsApp Groups</h3>
      <div className="grid gap-4 md:grid-cols-2">
        {bookingIds.map((bookingId) => (
          <WhatsAppGroupCard key={bookingId} bookingId={bookingId} />
        ))}
      </div>
    </div>
  );
}
