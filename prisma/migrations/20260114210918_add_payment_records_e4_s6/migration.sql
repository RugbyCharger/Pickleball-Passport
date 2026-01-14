-- CreateEnum
CREATE TYPE "PaymentRecordStatus" AS ENUM ('PAID', 'PENDING', 'FAILED');

-- AlterTable: Add stripeCustomerId to User
ALTER TABLE "User" ADD COLUMN "stripeCustomerId" TEXT;

-- CreateTable: PaymentRecord for installment tracking
CREATE TABLE "PaymentRecord" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "status" "PaymentRecordStatus" NOT NULL DEFAULT 'PENDING',
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paidDate" TIMESTAMP(3),
    "percentage" INTEGER,
    "installmentNumber" INTEGER,
    "stripePaymentIntentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PaymentRecord_stripePaymentIntentId_key" ON "PaymentRecord"("stripePaymentIntentId");

-- CreateIndex
CREATE INDEX "PaymentRecord_bookingId_idx" ON "PaymentRecord"("bookingId");

-- CreateIndex
CREATE INDEX "PaymentRecord_status_idx" ON "PaymentRecord"("status");

-- CreateIndex
CREATE INDEX "PaymentRecord_dueDate_idx" ON "PaymentRecord"("dueDate");

-- CreateIndex
CREATE INDEX "PaymentRecord_stripePaymentIntentId_idx" ON "PaymentRecord"("stripePaymentIntentId");

-- CreateIndex: Add index for User stripeCustomerId
CREATE INDEX "User_stripeCustomerId_idx" ON "User"("stripeCustomerId");

-- AddForeignKey
ALTER TABLE "PaymentRecord" ADD CONSTRAINT "PaymentRecord_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
