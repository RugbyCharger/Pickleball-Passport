-- AlterTable
ALTER TABLE "User" ADD COLUMN     "notificationPreferences" JSONB DEFAULT '{"emailPreTripSequence":true,"emailPostTripFollowUp":true,"emailAlumniEvents":true,"emailMarketing":false,"emailNewsletter":false,"smsEnabled":true,"inAppEnabled":true,"whatsappEnabled":true}',
ADD COLUMN     "preferenceEmailToken" TEXT,
ADD COLUMN     "preferenceEmailTokenExpiry" TIMESTAMP(3),
ADD COLUMN     "preferenceUpdatedAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "User_preferenceEmailToken_key" ON "User"("preferenceEmailToken");

-- CreateIndex
CREATE INDEX "User_preferenceEmailToken_idx" ON "User"("preferenceEmailToken");
