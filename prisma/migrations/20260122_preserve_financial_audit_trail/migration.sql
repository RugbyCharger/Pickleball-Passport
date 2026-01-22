-- P1-002: Preserve Financial Audit Trail
-- This migration prevents cascade deletion of financial records (Payment, PaymentRecord, RefundLog)
-- and adds soft delete capability to Booking model.

-- Step 1: Add soft delete column to Booking
ALTER TABLE "Booking" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- Step 2: Add index for efficient soft delete filtering
CREATE INDEX "Booking_deletedAt_idx" ON "Booking"("deletedAt");

-- Step 3: Change Payment foreign key from CASCADE to RESTRICT
-- Drop existing constraint
ALTER TABLE "Payment" DROP CONSTRAINT IF EXISTS "Payment_bookingId_fkey";
-- Add new constraint with RESTRICT
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_bookingId_fkey"
    FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Step 4: Change PaymentRecord foreign key from CASCADE to RESTRICT
ALTER TABLE "PaymentRecord" DROP CONSTRAINT IF EXISTS "PaymentRecord_bookingId_fkey";
ALTER TABLE "PaymentRecord" ADD CONSTRAINT "PaymentRecord_bookingId_fkey"
    FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Step 5: Change RefundLog foreign key from CASCADE to RESTRICT
ALTER TABLE "RefundLog" DROP CONSTRAINT IF EXISTS "RefundLog_paymentId_fkey";
ALTER TABLE "RefundLog" ADD CONSTRAINT "RefundLog_paymentId_fkey"
    FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
