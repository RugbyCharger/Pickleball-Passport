# Production Deployment Guide - E4-S4 Webhook Handler

## Overview

This guide covers deploying the Stripe Webhook Handler (E4-S4) to production. The implementation adds idempotent webhook event processing, refund handling, and dispute management.

**Status:** Ready for Production Deployment
**Completed:** 2026-01-02
**Story:** E4-S4 (Stripe Webhook Handler)

---

## Pre-Deployment Checklist

### ✅ Development Complete

- [x] WebhookEvent model created in Prisma schema
- [x] Payment model updated with refund tracking fields
- [x] Schema applied to development database
- [x] Idempotent event processing implemented
- [x] Refund handler (charge.refunded)
- [x] Dispute handlers (charge.dispute.created, charge.dispute.closed)
- [x] Refund confirmation email template
- [x] TypeScript validation passed (0 errors)
- [x] Code committed to GitHub (commits: 9b012b4, 2ae2f58)

### 📋 Pre-Deployment Requirements

Before deploying to production, ensure:

1. **Access to Production Environment**
   - Production hosting dashboard access
   - Database admin credentials
   - Stripe production mode access

2. **Backup Database** (CRITICAL)
   - Create production database backup before migration
   - Document restore procedure
   - Test backup restore process

3. **Environment Variables Ready**
   - STRIPE_WEBHOOK_SECRET (will be generated during setup)
   - DATABASE_URL (production)
   - DIRECT_URL (production)
   - SENDGRID_API_KEY
   - SENDGRID_FROM_EMAIL

---

## Step 1: Database Migration

### Option A: Using Prisma Migrate (Recommended for Production)

If you haven't created a migration yet, create one from the schema:

```bash
# In development, create the migration
npx prisma migrate dev --name add-webhook-event-tracking

# This will create a migration file in prisma/migrations/
# Commit this migration file to Git
git add prisma/migrations/
git commit -m "chore: Add Prisma migration for webhook event tracking"
git push origin main
```

Then in production:

```bash
# Deploy the migration to production
npx prisma migrate deploy
```

### Option B: Using Prisma DB Push (Quick Alternative)

If you want to apply the schema directly without creating a migration:

```bash
# Apply schema to production database
npx prisma db push

# Generate Prisma client
npx prisma generate
```

⚠️ **Warning:** `db push` is simpler but doesn't create migration history. Use `migrate deploy` for production best practices.

### Verify Migration

After running the migration, verify the tables exist:

```sql
-- Check WebhookEvent table
SELECT * FROM "WebhookEvent" LIMIT 1;

-- Check Payment table has new columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'Payment'
AND column_name IN ('refundedAmount', 'stripeRefundId');
```

Expected results:
- WebhookEvent table exists with columns: id, stripeEventId, type, processed, processedAt, createdAt
- Payment table has refundedAmount (integer) and stripeRefundId (text)

---

## Step 2: Configure Stripe Webhook Endpoint

### 2.1 Add Webhook Endpoint in Stripe Dashboard

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Switch to **Production Mode** (toggle in top right)
3. Click **"Add endpoint"**
4. Enter your production endpoint URL:
   ```
   https://yourdomain.com/api/webhooks/stripe
   ```
   *(Replace `yourdomain.com` with your actual production domain)*

### 2.2 Select Webhook Events

Select the following events to listen for:

**Existing Events (Already Implemented):**
- ✅ `payment_intent.succeeded` - Payment completed
- ✅ `payment_intent.payment_failed` - Payment failed
- ✅ `payment_intent.canceled` - Payment canceled

**New Events (E4-S4):**
- ✅ `charge.refunded` - Refund processed
- ✅ `charge.dispute.created` - Payment disputed
- ✅ `charge.dispute.closed` - Dispute resolved

### 2.3 Get Webhook Signing Secret

1. After adding the endpoint, click on it to view details
2. Click **"Reveal"** next to **Signing secret**
3. Copy the secret (starts with `whsec_...`)
4. Add to your production environment variables:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_your_production_secret_here
   ```

### 2.4 Verify Endpoint Configuration

In the Stripe Dashboard:
- Endpoint URL shows your production domain
- Status shows "Enabled"
- All 6 events are selected
- Signing secret is revealed and copied

---

## Step 3: Update Environment Variables

### Required Environment Variables

Add/verify these variables in your production environment:

```bash
# Database (should already be set)
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# Stripe Production Keys
STRIPE_SECRET_KEY=sk_live_...  # Production secret key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...  # Production publishable key
STRIPE_WEBHOOK_SECRET=whsec_...  # From Step 2.3

# SendGrid (should already be set)
SENDGRID_API_KEY=SG...
SENDGRID_FROM_EMAIL=hello@pickleballpassport.com

# Clerk (should already be set)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
```

### Verify Environment Variables

After deployment, test that environment variables are loaded:

```bash
# SSH into production server (if applicable)
# Or check hosting dashboard environment variables

# Verify Stripe webhook secret is set
echo $STRIPE_WEBHOOK_SECRET
# Should output: whsec_...
```

---

## Step 4: Deploy Code to Production

### 4.1 Pull Latest Code

Ensure production has the latest code:

```bash
# Pull from main branch
git pull origin main

# Verify you have commits: 9b012b4, 2ae2f58
git log --oneline -5
```

Expected commits:
- `2ae2f58` - chore: Apply database schema for E4-S4 webhook event tracking
- `9b012b4` - feat: Implement E4-S4 (Stripe Webhook Handler)

### 4.2 Install Dependencies

```bash
npm install
```

### 4.3 Build for Production

```bash
# TypeScript validation
npx tsc --noEmit

# Build Next.js app
npm run build
```

Expected output:
- ✅ TypeScript: 0 errors
- ✅ Build: Successful (no errors)

### 4.4 Restart Application

Restart your production server to apply changes:

```bash
# Example (depends on your hosting)
pm2 restart pickleball-passport

# Or trigger a redeploy in your hosting dashboard
# (Vercel, Netlify, Railway, etc.)
```

---

## Step 5: Test Webhook in Production

### 5.1 Test with Stripe Dashboard

1. Go to [Stripe Dashboard → Events](https://dashboard.stripe.com/test/events)
2. Switch to **Production Mode**
3. Click **"Send test webhook"**
4. Select your webhook endpoint
5. Choose event: `charge.refunded`
6. Click **"Send test webhook"**

### 5.2 Verify Webhook Processing

Check your application logs for:

```
[Stripe Webhook] Received event: evt_... (charge.refunded)
[Stripe Webhook] Event evt_... processed successfully in X ms
```

### 5.3 Verify Database

Check WebhookEvent record was created:

```sql
SELECT * FROM "WebhookEvent"
ORDER BY "createdAt" DESC
LIMIT 5;
```

Expected result:
- Record exists with `stripeEventId` matching the event ID
- `type` = "charge.refunded"
- `processed` = true

### 5.4 Test All Event Types

Repeat the test for all event types:
- ✅ `payment_intent.succeeded`
- ✅ `payment_intent.payment_failed`
- ✅ `payment_intent.canceled`
- ✅ `charge.refunded`
- ✅ `charge.dispute.created`
- ✅ `charge.dispute.closed`

### 5.5 Test Idempotency

1. Go to Stripe Dashboard → Events
2. Find a recent event
3. Click **"Resend webhook"**
4. Check logs - should show: "Event already processed, skipping"
5. Verify database - only ONE WebhookEvent record for that event ID

---

## Step 6: Monitor Production

### 6.1 Stripe Dashboard Monitoring

Monitor webhook delivery in Stripe Dashboard:
1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click on your production endpoint
3. View **"Recent deliveries"**
4. Check for:
   - ✅ Successful deliveries (200 OK responses)
   - ❌ Failed deliveries (need investigation)

### 6.2 Application Logs

Monitor application logs for:
- Webhook event processing messages
- Error logs (if any)
- Performance metrics (processing duration)

### 6.3 Database Monitoring

Periodically check:
- WebhookEvent table growth (should match Stripe events)
- Payment refund records (verify refundedAmount populated)
- Booking cancellations (triggered by refunds)

### 6.4 Email Delivery

Check SendGrid dashboard:
- Refund confirmation emails sent successfully
- No bounces or spam reports
- Open rates and delivery rates

---

## Rollback Plan

If issues occur after deployment, follow this rollback procedure:

### 1. Disable Webhook Endpoint

1. Go to Stripe Dashboard → Webhooks
2. Click on your production endpoint
3. Click **"Disable endpoint"**
4. This stops new events from being sent

### 2. Revert Code (If Needed)

```bash
# Revert to previous commit
git revert HEAD

# Or checkout previous commit
git checkout <previous-commit-hash>

# Rebuild and redeploy
npm run build
pm2 restart pickleball-passport
```

### 3. Rollback Database (If Needed)

⚠️ **Warning:** Only rollback database if absolutely necessary. This may cause data loss.

```sql
-- Drop WebhookEvent table
DROP TABLE "WebhookEvent";

-- Remove Payment columns
ALTER TABLE "Payment"
DROP COLUMN "refundedAmount",
DROP COLUMN "stripeRefundId";
```

### 4. Re-enable Webhook (After Fix)

1. Fix the issue
2. Redeploy code
3. Re-enable webhook in Stripe Dashboard
4. Test with test events

---

## Post-Deployment Verification

### ✅ Deployment Checklist

- [ ] Database migration applied successfully
- [ ] Prisma client regenerated in production
- [ ] Stripe webhook endpoint created and enabled
- [ ] All 6 webhook events selected
- [ ] STRIPE_WEBHOOK_SECRET added to production environment
- [ ] Code deployed to production
- [ ] Application restarted
- [ ] Test webhooks sent from Stripe Dashboard
- [ ] WebhookEvent records created in database
- [ ] Idempotency tested (duplicate events ignored)
- [ ] Logs showing successful webhook processing
- [ ] No errors in production logs
- [ ] SendGrid emails sending successfully

### 🎯 Success Criteria

Production deployment is successful when:
1. ✅ Stripe webhook endpoint responds with 200 OK
2. ✅ WebhookEvent records created for each event
3. ✅ Duplicate events are ignored (idempotency works)
4. ✅ Refund events update Payment and Booking status
5. ✅ Refund confirmation emails are sent
6. ✅ No errors in application logs
7. ✅ All TypeScript validation passes

---

## Troubleshooting

### Problem: Webhook Signature Verification Fails

**Symptoms:**
- Stripe shows "400 Bad Request" or "401 Unauthorized"
- Logs show: "Webhook signature verification failed"

**Solution:**
1. Verify STRIPE_WEBHOOK_SECRET is set correctly
2. Ensure you're using PRODUCTION webhook secret (not test mode)
3. Check Stripe API version matches: `2025-12-15.clover`
4. Verify raw request body is used (not parsed JSON)

### Problem: Events Processed Multiple Times

**Symptoms:**
- Duplicate refunds or booking cancellations
- Multiple WebhookEvent records for same event ID

**Solution:**
1. Check WebhookEvent model exists in database
2. Verify unique constraint on stripeEventId column
3. Check `checkEventProcessed()` is called before processing
4. Verify database transaction completes successfully

### Problem: Emails Not Sending

**Symptoms:**
- Webhook processes successfully but no email sent
- Email errors in logs

**Solution:**
1. Verify SENDGRID_API_KEY is set in production
2. Check SENDGRID_FROM_EMAIL is configured
3. Check SendGrid dashboard for bounces/spam reports
4. Verify email template exists and renders correctly

### Problem: Refund Not Updating Booking

**Symptoms:**
- Payment status updated to REFUNDED
- Booking status still CONFIRMED (should be CANCELLED)

**Solution:**
1. Check if refund is full refund (amount_refunded >= payment.amount)
2. Verify booking status is CONFIRMED (not already CANCELLED)
3. Check database transaction completed successfully
4. Verify Trip.currentBookings was decremented

---

## Additional Resources

### Stripe Documentation
- [Webhook Best Practices](https://stripe.com/docs/webhooks/best-practices)
- [charge.refunded Event](https://stripe.com/docs/api/events/types#event_types-charge.refunded)
- [Webhook Signature Verification](https://stripe.com/docs/webhooks/signatures)

### Internal Documentation
- E4-S4 Story File: `_bmad-output/implementation/4-4-webhook-handler.md`
- Webhook Route: `app/api/webhooks/stripe/route.ts`
- Email Template: `lib/email/templates/refund-confirmation.ts`
- Prisma Schema: `prisma/schema.prisma`

### Support Contacts
- Stripe Support: https://support.stripe.com
- SendGrid Support: https://support.sendgrid.com
- Internal Team: admin@pickleballpassport.com

---

## Next Steps After Deployment

Once production deployment is complete and verified:

1. **Monitor for 48 Hours**
   - Watch webhook delivery success rate
   - Monitor application logs for errors
   - Check database for data integrity

2. **Real-World Testing**
   - Process a test refund in production mode
   - Verify refund confirmation email received
   - Confirm booking cancelled and trip capacity updated

3. **Set Up Alerts**
   - Webhook failure alerts (Stripe Dashboard)
   - Application error alerts (logging service)
   - Email delivery failure alerts (SendGrid)

4. **Document Operational Procedures**
   - How to handle webhook failures
   - How to manually process missed events
   - How to rotate webhook signing secret

5. **Consider Next High-Impact Stories**
   - E4-S8: Receipt Generation (triggered by payment_intent.succeeded)
   - E11-S5: Payment Receipt Email (email template)
   - E1-S7: Trust & Safety Section (marketing content)

---

**Deployment Owner:** Development Team
**Last Updated:** 2026-01-02
**Version:** 1.0.0
