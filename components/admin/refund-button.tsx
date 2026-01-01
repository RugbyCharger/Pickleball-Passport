/**
 * Refund Button Component - E4-S9
 *
 * Trigger button for the refund modal
 * Displays in admin booking/payment views
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DollarSign } from 'lucide-react';
import { RefundModal } from './refund-modal';

interface RefundButtonProps {
  payment: {
    id: string;
    amount: number;
    refundedAmount?: number | null;
    status: string;
  };
  booking: {
    bookingReference: string;
    packageName: string;
    status: string;
  };
  variant?: 'default' | 'outline' | 'destructive' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function RefundButton({
  payment,
  booking,
  variant = 'outline',
  size = 'sm',
  className,
}: RefundButtonProps) {
  const [showModal, setShowModal] = useState(false);

  // Only show button for successful payments
  if (payment.status !== 'SUCCEEDED') {
    return null;
  }

  // Check if there's remaining amount to refund
  const alreadyRefunded = payment.refundedAmount || 0;
  const remainingAmount = payment.amount - alreadyRefunded;

  if (remainingAmount <= 0) {
    return (
      <Button variant="ghost" size={size} disabled className={className}>
        Fully Refunded
      </Button>
    );
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setShowModal(true)}
        className={className}
      >
        <DollarSign className="h-4 w-4 mr-2" />
        Process Refund
      </Button>

      <RefundModal
        open={showModal}
        onOpenChange={setShowModal}
        payment={payment}
        booking={booking}
      />
    </>
  );
}
