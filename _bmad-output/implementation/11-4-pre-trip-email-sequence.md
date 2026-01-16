# Story 11.4: Pre-Trip Nurture Email Sequence

Status: done

## Story

As a booked guest,
I want to receive helpful emails leading up to my trip,
So that I'm well-prepared and excited for my transformation journey.

## Acceptance Criteria

### AC-1: Email Sequence Timeline

- [x] 60 days before: "Your Transformation Journey Begins Soon!" (excitement, prep overview)
- [x] 30 days before: "Time to Book Your Flights" (flight booking tips, visa info)
- [x] 14 days before: "Complete Your Pre-Trip Checklist" (document reminders, packing start)
- [x] 7 days before: "What to Pack for Thailand" (detailed packing list, weather tips)
- [x] 1 day before: "Departing Tomorrow! Final Reminders" (arrival info, emergency contacts)

### AC-2: Email Content Requirements

- [x] Each email is distinct with specific, actionable content
- [x] Excitement-building tone throughout the sequence
- [x] Clear CTAs linking to member portal
- [x] Guest's first name personalization
- [x] Trip details (dates, package, destination)
- [x] Mobile-responsive design

### AC-3: Database Tracking

- [x] Add `preTripEmailsSent` field to Booking model (String array)
- [x] Track which emails have been sent: ["60_DAYS", "30_DAYS", "14_DAYS", "7_DAYS", "1_DAY"]
- [x] Prevent duplicate sends
- [x] Create Prisma migration

### AC-4: Cron Job Implementation

- [x] New endpoint: `GET /api/cron/send-pre-trip-emails`
- [x] Secured with CRON_SECRET
- [x] Daily execution (7 AM UTC, before payment reminders)
- [x] Query bookings by trip.startDate for each milestone
- [x] Process in batches (max 100 per milestone)
- [x] Non-blocking: email failures don't stop processing

### AC-5: Eligibility Rules

- [x] Only CONFIRMED bookings
- [x] Only bookings with assigned tripId
- [x] Skip cancelled bookings
- [x] Skip gift bookings that haven't been accepted
- [x] Skip if email already sent for that milestone

### AC-6: Error Handling

- [x] Log email failures with context
- [x] Don't mark as sent if email fails
- [x] Continue processing other bookings on failure
- [x] Return summary with success/error counts

## Tasks / Subtasks

- [x] Task 1: Database Schema Update (AC: 3)
  - [x] Add preTripEmailsSent field to Booking model
  - [x] Create Prisma migration
  - [x] Regenerate Prisma client

- [x] Task 2: Email Templates (AC: 1, 2)
  - [x] Create lib/email/templates/pre-trip-sequence.ts
  - [x] Implement 60-day email (excitement, prep overview)
  - [x] Implement 30-day email (flights, visa)
  - [x] Implement 14-day email (checklist, documents)
  - [x] Implement 7-day email (packing list)
  - [x] Implement 1-day email (final reminders)

- [x] Task 3: Pre-Trip Email Service (AC: 4, 5, 6)
  - [x] Create lib/email/send-pre-trip-emails.ts
  - [x] Query bookings for each milestone
  - [x] Send appropriate email for each
  - [x] Update preTripEmailsSent after successful send

- [x] Task 4: Cron Endpoint (AC: 4)
  - [x] Create app/api/cron/send-pre-trip-emails/route.ts
  - [x] Verify CRON_SECRET authorization
  - [x] Call service and return summary

- [x] Task 5: Vercel Cron Configuration
  - [x] Add to vercel.json (7 AM UTC, before other jobs)

## Dev Notes

### Email Milestone Constants

```typescript
export const PRE_TRIP_MILESTONES = {
  SIXTY_DAYS: { key: '60_DAYS', daysBeforeTrip: 60 },
  THIRTY_DAYS: { key: '30_DAYS', daysBeforeTrip: 30 },
  FOURTEEN_DAYS: { key: '14_DAYS', daysBeforeTrip: 14 },
  SEVEN_DAYS: { key: '7_DAYS', daysBeforeTrip: 7 },
  ONE_DAY: { key: '1_DAY', daysBeforeTrip: 1 },
} as const
```

### Query Logic

```typescript
// For each milestone, find bookings where:
// trip.startDate - today = milestone days
// AND booking.status = 'CONFIRMED'
// AND booking.tripId is not null
// AND milestone key NOT in preTripEmailsSent
```

### Schema Change

```prisma
model Booking {
  // ... existing fields ...
  
  // E11-S4: Pre-Trip Email Sequence
  preTripEmailsSent String[] @default([]) // ["60_DAYS", "30_DAYS", etc.]
}
```

### Dependencies

- E11-S1: SendGrid Integration (done)
- E11-S2: Booking Confirmation Email (done) - email pattern
- E3: Booking System (done) - Booking model

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Completion Notes

**Implementation Date:** 2026-01-16

**What was implemented:**
1. Added `preTripEmailsSent` field to `Booking` model (String array)
2. Created migration: `prisma/migrations/20260116100000_add_pre_trip_emails_sent/migration.sql`
3. Created 5 email templates in `lib/email/templates/pre-trip-sequence.ts`:
   - 60 days: Excitement & prep overview
   - 30 days: Flight booking & visa info
   - 14 days: Checklist & documents
   - 7 days: Packing list & weather tips
   - 1 day: Final reminders & arrival info
4. Created service: `lib/email/send-pre-trip-emails.ts`
5. Created cron endpoint: `app/api/cron/send-pre-trip-emails/route.ts`
6. Updated `vercel.json` with cron schedule (7 AM UTC daily)

**Cron schedule:**
- Pre-trip emails: 7 AM UTC daily
- Payment reminders: 8 AM UTC daily
- Payment charges: 9 AM UTC daily

**Post-deployment steps required:**
1. Run migration: `npx prisma migrate deploy`
2. Regenerate Prisma client: `npx prisma generate`

**Testing notes:**
- Manual trigger: `curl -H "Authorization: Bearer $CRON_SECRET" https://yourdomain.com/api/cron/send-pre-trip-emails`

### File List

**Files to Create:**
1. `lib/email/templates/pre-trip-sequence.ts`
2. `lib/email/send-pre-trip-emails.ts`
3. `app/api/cron/send-pre-trip-emails/route.ts`
4. `prisma/migrations/YYYYMMDD_add_pre_trip_emails_sent/migration.sql`

**Files to Modify:**
1. `prisma/schema.prisma` - Add preTripEmailsSent field
2. `vercel.json` - Add cron schedule
3. `sprint-status.yaml` - Update status
