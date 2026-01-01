/**
 * Refund Modal Component - E4-S9
 *
 * Admin UI for processing full and partial refunds
 * Features:
 * - Full/partial refund toggle
 * - Amount validation
 * - Reason selection
 * - Notes field
 * - Booking summary display
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle, DollarSign, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface RefundModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: {
    id: string;
    amount: number; // in cents
    refundedAmount?: number | null; // in cents
    status: string;
  };
  booking: {
    bookingReference: string;
    packageName: string;
    status: string;
  };
}

export function RefundModal({
  open,
  onOpenChange,
  payment,
  booking,
}: RefundModalProps) {
  const router = useRouter();
  const [refundType, setRefundType] = useState<'full' | 'partial'>('full');
  const [partialAmount, setPartialAmount] = useState('');
  const [reason, setReason] = useState<string>('');
  const [notes, setNotes] = useState('');

  const alreadyRefunded = payment.refundedAmount || 0;
  const remainingAmount = payment.amount - alreadyRefunded;

  // tRPC mutation for processing refund
  const processRefundMutation = trpc.admin.processRefund.useMutation({
    onSuccess: (data) => {
      toast.success(
        `Refund processed successfully: $${data.refundAmount / 100} ${
          data.isFullRefund ? '(Full)' : '(Partial)'
        }`
      );
      onOpenChange(false);
      router.refresh();
    },
    onError: (error) => {
      toast.error(`Failed to process refund: ${error.message}`);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!reason) {
      toast.error('Please select a refund reason');
      return;
    }

    if (refundType === 'partial') {
      const amountInCents = Math.round(parseFloat(partialAmount) * 100);
      if (isNaN(amountInCents) || amountInCents <= 0) {
        toast.error('Please enter a valid refund amount');
        return;
      }
      if (amountInCents > remainingAmount) {
        toast.error(
          `Refund amount cannot exceed remaining amount ($${remainingAmount / 100})`
        );
        return;
      }
    }

    // Process refund
    const refundAmount =
      refundType === 'full'
        ? undefined // Full refund
        : Math.round(parseFloat(partialAmount) * 100);

    await processRefundMutation.mutateAsync({
      paymentId: payment.id,
      amount: refundAmount,
      reason: reason as any,
      notes: notes || undefined,
    });
  };

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Process Refund</DialogTitle>
            <DialogDescription>
              Issue a refund for booking {booking.bookingReference}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Booking Summary */}
            <div className="rounded-lg border p-4 space-y-2 bg-muted/50">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Package:</span>
                <span className="font-medium">{booking.packageName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Payment Amount:</span>
                <span className="font-medium">{formatCurrency(payment.amount)}</span>
              </div>
              {alreadyRefunded > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Already Refunded:</span>
                  <span className="font-medium text-destructive">
                    -{formatCurrency(alreadyRefunded)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm pt-2 border-t">
                <span className="font-semibold">Remaining Amount:</span>
                <span className="font-bold">{formatCurrency(remainingAmount)}</span>
              </div>
            </div>

            {/* Warning for booking cancellation */}
            {refundType === 'full' && booking.status === 'CONFIRMED' && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <div className="flex gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                  <p className="text-sm text-amber-900">
                    Full refund will cancel this booking and free up the trip spot.
                  </p>
                </div>
              </div>
            )}

            {/* Refund Type - Using custom radio buttons */}
            <div className="space-y-3">
              <Label>Refund Type</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="full"
                    name="refundType"
                    value="full"
                    checked={refundType === 'full'}
                    onChange={(e) => setRefundType(e.target.value as 'full')}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="full" className="font-normal cursor-pointer">
                    Full Refund ({formatCurrency(remainingAmount)})
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="partial"
                    name="refundType"
                    value="partial"
                    checked={refundType === 'partial'}
                    onChange={(e) => setRefundType(e.target.value as 'partial')}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="partial" className="font-normal cursor-pointer">
                    Partial Refund
                  </Label>
                </div>
              </div>
            </div>

            {/* Partial Amount Input */}
            {refundType === 'partial' && (
              <div className="space-y-2">
                <Label htmlFor="amount">Refund Amount</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={(remainingAmount / 100).toFixed(2)}
                    value={partialAmount}
                    onChange={(e) => setPartialAmount(e.target.value)}
                    className="pl-9"
                    placeholder="0.00"
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Maximum: {formatCurrency(remainingAmount)}
                </p>
              </div>
            )}

            {/* Refund Reason */}
            <div className="space-y-2">
              <Label htmlFor="reason">Refund Reason *</Label>
              <Select value={reason} onValueChange={setReason} required>
                <SelectTrigger id="reason">
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="REQUESTED_BY_CUSTOMER">
                    Requested by Customer
                  </SelectItem>
                  <SelectItem value="EVENT_CANCELLED">Event Cancelled</SelectItem>
                  <SelectItem value="DUPLICATE">Duplicate Charge</SelectItem>
                  <SelectItem value="FRAUDULENT">Fraudulent</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Admin Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any internal notes about this refund..."
                rows={3}
              />
            </div>

            {/* Refund Timeline Notice */}
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <p className="text-xs text-blue-900">
                Refunds typically appear in the customer's account within 5-10 business
                days, depending on their bank.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={processRefundMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={processRefundMutation.isPending}
            >
              {processRefundMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Process Refund{' '}
                  {refundType === 'full'
                    ? formatCurrency(remainingAmount)
                    : partialAmount
                    ? formatCurrency(Math.round(parseFloat(partialAmount) * 100))
                    : ''}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
