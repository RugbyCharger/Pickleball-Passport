-- Drop all overly permissive "Dev Access" RLS policies
-- These policies used USING(true) which bypassed security
-- Service role automatically bypasses RLS, so no replacement policies needed

-- Tables with "Dev Access" policy (20 tables)
DROP POLICY IF EXISTS "Dev Access" ON "AddOn";
DROP POLICY IF EXISTS "Dev Access" ON "Application";
DROP POLICY IF EXISTS "Dev Access" ON "Booking";
DROP POLICY IF EXISTS "Dev Access" ON "BookingAddOn";
DROP POLICY IF EXISTS "Dev Access" ON "Document";
DROP POLICY IF EXISTS "Dev Access" ON "GuestProfile";
DROP POLICY IF EXISTS "Dev Access" ON "Itinerary";
DROP POLICY IF EXISTS "Dev Access" ON "Message";
DROP POLICY IF EXISTS "Dev Access" ON "NewsletterSubscriber";
DROP POLICY IF EXISTS "Dev Access" ON "Notification";
DROP POLICY IF EXISTS "Dev Access" ON "Package";
DROP POLICY IF EXISTS "Dev Access" ON "PartnerProfile";
DROP POLICY IF EXISTS "Dev Access" ON "PartnerReferral";
DROP POLICY IF EXISTS "Dev Access" ON "Payment";
DROP POLICY IF EXISTS "Dev Access" ON "RefundLog";
DROP POLICY IF EXISTS "Dev Access" ON "ReminderHistory";
DROP POLICY IF EXISTS "Dev Access" ON "SupportTicket";
DROP POLICY IF EXISTS "Dev Access" ON "Testimonial";
DROP POLICY IF EXISTS "Dev Access" ON "Trip";
DROP POLICY IF EXISTS "Dev Access" ON "User";
DROP POLICY IF EXISTS "Dev Access" ON "WebhookEvent";

-- Tables with duplicate "Allow all for development" policy (2 tables)
DROP POLICY IF EXISTS "Allow all for development" ON "Package";
DROP POLICY IF EXISTS "Allow all for development" ON "Trip";
