-- E4-S8: Add reminderSentAt field to PaymentRecord
-- Tracks when the 7-day payment reminder was sent

-- Add reminderSentAt column
ALTER TABLE "PaymentRecord" ADD COLUMN "reminderSentAt" TIMESTAMP(3);

-- Add index for query performance
CREATE INDEX "PaymentRecord_reminderSentAt_idx" ON "PaymentRecord"("reminderSentAt");
