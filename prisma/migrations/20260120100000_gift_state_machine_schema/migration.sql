-- GS-001: Gift State Machine Schema Updates
-- Adds EXPIRED state, state transition tracking, and expiration fields

-- Create GiftState enum with EXPIRED state
CREATE TYPE "GiftState" AS ENUM ('PENDING', 'SENT', 'ACCEPTED', 'DECLINED', 'EXPIRED');

-- Add giftStateChangedAt field to Booking for tracking last state change
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "giftStateChangedAt" TIMESTAMP(3);

-- Add giftExpiresAt field to Booking for automatic expiration
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "giftExpiresAt" TIMESTAMP(3);

-- Create GiftStateTransition table for audit trail
CREATE TABLE IF NOT EXISTS "GiftStateTransition" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "fromState" "GiftState" NOT NULL,
    "toState" "GiftState" NOT NULL,
    "reason" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GiftStateTransition_pkey" PRIMARY KEY ("id")
);

-- Add foreign key constraint
ALTER TABLE "GiftStateTransition" ADD CONSTRAINT "GiftStateTransition_bookingId_fkey"
    FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create indexes for GiftStateTransition
CREATE INDEX IF NOT EXISTS "GiftStateTransition_bookingId_idx" ON "GiftStateTransition"("bookingId");
CREATE INDEX IF NOT EXISTS "GiftStateTransition_createdAt_idx" ON "GiftStateTransition"("createdAt");
CREATE INDEX IF NOT EXISTS "GiftStateTransition_fromState_idx" ON "GiftStateTransition"("fromState");
CREATE INDEX IF NOT EXISTS "GiftStateTransition_toState_idx" ON "GiftStateTransition"("toState");

-- Create index on Booking.giftExpiresAt for expiration cron queries
CREATE INDEX IF NOT EXISTS "Booking_giftExpiresAt_idx" ON "Booking"("giftExpiresAt");

-- Set giftExpiresAt for existing SENT gifts (30 days from delivery date or creation date)
-- This ensures existing gifts can be properly expired
UPDATE "Booking"
SET "giftExpiresAt" = COALESCE("giftDeliveryDate", "createdAt") + INTERVAL '30 days'
WHERE "isGift" = true
  AND "giftStatus" = 'SENT'
  AND "giftExpiresAt" IS NULL;
