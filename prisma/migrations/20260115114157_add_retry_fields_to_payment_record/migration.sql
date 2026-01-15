-- AlterTable
ALTER TABLE "PaymentRecord" ADD COLUMN     "retryCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastAttemptAt" TIMESTAMP(3),
ADD COLUMN     "failureReason" TEXT;
