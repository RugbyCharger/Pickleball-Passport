-- E11-S4: Add preTripEmailsSent field to Booking
-- Tracks which pre-trip nurture emails have been sent

-- Add preTripEmailsSent column as text array with default empty array
ALTER TABLE "Booking" ADD COLUMN "preTripEmailsSent" TEXT[] DEFAULT ARRAY[]::TEXT[];
