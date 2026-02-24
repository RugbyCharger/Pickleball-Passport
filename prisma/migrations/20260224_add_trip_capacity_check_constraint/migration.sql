-- Add CHECK constraint to prevent Trip.currentBookings from going negative
-- This prevents double-fired refund webhooks or admin cancel + Stripe refund
-- from pushing the counter below zero.
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_currentBookings_non_negative" CHECK ("currentBookings" >= 0);
