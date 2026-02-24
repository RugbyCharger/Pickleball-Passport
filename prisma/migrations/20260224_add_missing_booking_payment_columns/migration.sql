-- Create missing enums
CREATE TYPE "PaymentPlan" AS ENUM ('FULL', 'INSTALLMENT_4', 'FINANCING');
CREATE TYPE "GiftStatus" AS ENUM ('PENDING', 'SENT', 'ACCEPTED', 'DECLINED');
CREATE TYPE "GiftState" AS ENUM ('PENDING', 'SENT', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'CANCELLED');
CREATE TYPE "TaskPriority" AS ENUM ('URGENT', 'IMPORTANT', 'NORMAL');
CREATE TYPE "TaskStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED');
CREATE TYPE "GuestReferralStatus" AS ENUM ('CLICKED', 'SIGNED_UP', 'BOOKED', 'COMPLETED');

-- Add missing columns to Booking
ALTER TABLE "Booking"
  ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'USD',
  ADD COLUMN "utmSource" TEXT,
  ADD COLUMN "utmMedium" TEXT,
  ADD COLUMN "utmCampaign" TEXT,
  ADD COLUMN "paymentPlan" "PaymentPlan" NOT NULL DEFAULT 'FULL',
  ADD COLUMN "stripeCustomerId" TEXT,
  ADD COLUMN "isCompanionBooking" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "primaryBookingId" TEXT,
  ADD COLUMN "accommodationShared" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "guestFirstName" TEXT,
  ADD COLUMN "guestLastName" TEXT,
  ADD COLUMN "guestEmail" TEXT,
  ADD COLUMN "guestPhone" TEXT,
  ADD COLUMN "guestDateOfBirth" TEXT,
  ADD COLUMN "guestPassportNumber" TEXT,
  ADD COLUMN "guestDietaryNotes" TEXT,
  ADD COLUMN "isGift" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "giftPurchaserId" TEXT,
  ADD COLUMN "giftRecipientEmail" TEXT,
  ADD COLUMN "giftRecipientName" TEXT,
  ADD COLUMN "giftRecipientPhone" TEXT,
  ADD COLUMN "giftMessage" TEXT,
  ADD COLUMN "giftDeliveryDate" TIMESTAMP(3),
  ADD COLUMN "giftAcceptedAt" TIMESTAMP(3),
  ADD COLUMN "giftStatus" "GiftStatus" NOT NULL DEFAULT 'PENDING',
  ADD COLUMN "giftAcceptanceToken" TEXT,
  ADD COLUMN "giftStateChangedAt" TIMESTAMP(3),
  ADD COLUMN "giftExpiresAt" TIMESTAMP(3),
  ADD COLUMN "preTripEmailsSent" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "postTripEmailsSent" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "whatsappInvitationSentAt" TIMESTAMP(3),
  ADD COLUMN "whatsappGroupJoinedAt" TIMESTAMP(3),
  ADD COLUMN "whatsappInvitationStatus" TEXT DEFAULT 'pending',
  ADD COLUMN "whatsappMilestonesSent" JSONB,
  ADD COLUMN "showInTravelersList" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "deletedAt" TIMESTAMP(3);

-- Add unique constraint on giftAcceptanceToken
CREATE UNIQUE INDEX "Booking_giftAcceptanceToken_key" ON "Booking"("giftAcceptanceToken");

-- Add missing currency column to Payment
ALTER TABLE "Payment"
  ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'USD';

-- Create Task table (referenced from Booking)
CREATE TABLE "Task" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "priority" "TaskPriority" NOT NULL DEFAULT 'NORMAL',
  "status" "TaskStatus" NOT NULL DEFAULT 'PENDING',
  "dueDate" TIMESTAMP(3),
  "bookingId" TEXT,
  "assignedToUserId" TEXT,
  "createdByUserId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- Create GiftStateTransition table
CREATE TABLE "GiftStateTransition" (
  "id" TEXT NOT NULL,
  "bookingId" TEXT NOT NULL,
  "fromState" "GiftState" NOT NULL,
  "toState" "GiftState" NOT NULL,
  "reason" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "GiftStateTransition_pkey" PRIMARY KEY ("id")
);

-- Add foreign keys
ALTER TABLE "Task" ADD CONSTRAINT "Task_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "GiftStateTransition" ADD CONSTRAINT "GiftStateTransition_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Add indexes
CREATE INDEX "Task_bookingId_idx" ON "Task"("bookingId");
CREATE INDEX "GiftStateTransition_bookingId_idx" ON "GiftStateTransition"("bookingId");
CREATE INDEX "Booking_deletedAt_idx" ON "Booking"("deletedAt");
