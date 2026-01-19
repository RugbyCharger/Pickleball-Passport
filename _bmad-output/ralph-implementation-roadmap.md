# Ralph Workflow Implementation Roadmap
## Pickleball Passport Project

**Created:** 2026-01-19
**Purpose:** Strategic plan for implementing Ralph autonomous AI agent loops across 7 key areas

---

## 📚 What is Ralph? (Quick Refresher)

Ralph is an **autonomous workflow system** that breaks big tasks into small pieces and loops through them until everything is complete.

**Three Core Principles:**
1. **Memory Between Loops** - Each loop learns from previous loops (through git commits and progress files)
2. **Small, Focused Tasks** - Each task must fit in one AI conversation (no overwhelming tasks)
3. **Quality Gates** - Tests and checks run after each loop to catch problems early

**Think of it like:**
- Building LEGO one brick at a time (not the whole Death Star at once)
- Saving your video game progress after each level (not losing everything if you die)
- Doing homework one problem at a time with teacher feedback after each one

---

## 🎯 Implementation Phases

We'll implement Ralph in **3 phases** over time, starting with the easiest wins:

### Phase 1: Quick Wins (Start Here!)
**Timeline:** Week 1-2
**Goal:** Get Ralph working on simple, high-impact loops

### Phase 2: Medium Complexity
**Timeline:** Week 3-6
**Goal:** Apply Ralph to multi-step workflows

### Phase 3: Strategic Implementation
**Timeline:** Week 7-12
**Goal:** Use Ralph for complex business logic

---

## 🚀 Phase 1: Quick Wins

### 1. Payment Retry Loop ⭐ **START HERE**
**Priority:** HIGHEST
**Difficulty:** Easy (already has loop structure)
**Impact:** Direct revenue protection

#### Current System
**File:** [app/api/cron/charge-installments/route.ts](../app/api/cron/charge-installments/route.ts)

**How it works now:**
1. Daily cron job runs at 9 AM UTC
2. Finds all payments due today or overdue
3. Filters out payments not ready for retry
4. Processes payments in batches of 10
5. For each payment:
   - Try to charge with Stripe
   - If fails: Check if error is temporary or permanent
   - If temporary: Increment retry counter (max 4 attempts)
   - If permanent: Mark as FAILED
   - Wait between batches to avoid rate limits

**Manual retry logic:**
```
Attempt 1: Immediate (day 0)
Attempt 2: Wait 3 days
Attempt 3: Wait 7 days
Attempt 4: Wait 14 days (final attempt)
```

#### What Ralph Would Improve

**Instead of:**
- Manual retry counter tracking (`retryCount` field)
- Manual retry date calculation (`isRetryEligible` function)
- Manual batch processing loops
- Manual status transitions (PENDING → FAILED)
- Separate cron job coordination

**Ralph would provide:**
- **Automatic state machine**: Each payment has clear states (New → Attempting → Retrying → Success/Failed)
- **Declarative retry policy**: Just say "retry 4 times with exponential backoff" instead of coding it
- **Built-in workflow tracking**: Ralph knows which payments are in progress, which are waiting, which are done
- **Context preservation**: Each retry knows full history of previous attempts automatically
- **Automatic cleanup**: Failed payments move to dead-letter queue for manual review

#### Implementation Steps

**Step 1: Define the Ralph Workflow** (30 minutes)
Create a workflow definition file that says:
- "This is a payment retry workflow"
- "It has these states: New, Attempting, Waiting, Success, Failed"
- "Retry up to 4 times with these delays: 3 days, 7 days, 14 days"
- "On permanent failure, send admin alert"

**Step 2: Replace Manual Loop with Ralph Loop** (2 hours)
- Keep existing `chargeInstallment` function (the actual charging logic)
- Wrap it in Ralph workflow context
- Remove manual retry counter code
- Let Ralph handle state transitions

**Step 3: Add Progress Tracking** (1 hour)
- Ralph creates `payment-retry-progress.txt` file
- Records learnings like: "VISA cards fail more often on Mondays" or "Retry attempts succeed 60% of the time on 2nd try"
- Future loops use these learnings

**Step 4: Test with Real Scenarios** (2 hours)
- Simulate failed payment
- Verify Ralph schedules retry correctly
- Check retry attempts happen on schedule
- Confirm admin alert sent after max retries

**Total Time Estimate:** 1 day

#### Success Metrics
- ✅ Payment retries happen automatically on schedule
- ✅ No manual cron job coordination needed
- ✅ Full history visible for each payment
- ✅ Admin alerts sent at right time
- ✅ Lower code complexity (remove ~100 lines of retry logic)

---

### 2. Gift Booking State Machine
**Priority:** HIGH
**Difficulty:** Easy (simple 3-state machine)
**Impact:** Better gift flow management

#### Current System
**Files:**
- [app/gift/page.tsx](../app/gift/) (purchase gift)
- [app/gift/accept/page.tsx](../app/gift/accept/) (recipient accepts/declines)
- Database: `Booking` table with `giftStatus` field

**States:**
- `PENDING`: Payment complete, waiting to send notification
- `SENT`: Gift notification email sent to recipient
- `ACCEPTED`: Recipient accepted, booking transferred
- `DECLINED`: Recipient declined, refund processed

**Current approach:**
- Manual status field updates
- Manual state validation (can't accept before sent)
- Manual expiration checks (gifts expire after 30 days)
- Manual refund processing on decline

#### What Ralph Would Improve

**Ralph state machine features:**
- **Strict transitions**: Can only move from PENDING → SENT → ACCEPTED/DECLINED (Ralph enforces this automatically)
- **Automatic timeouts**: Ralph can auto-decline gifts after 30 days
- **Event tracking**: Ralph records when each state change happened and why
- **Rollback capability**: If something goes wrong, Ralph can revert state
- **Type safety**: TypeScript knows which states are valid at each point

#### Implementation Steps

**Step 1: Define State Machine** (1 hour)
```
States: PENDING, SENT, ACCEPTED, DECLINED
Transitions:
  - PENDING → SENT (when email sent)
  - SENT → ACCEPTED (when recipient clicks "Accept")
  - SENT → DECLINED (when recipient clicks "Decline")
  - SENT → DECLINED (automatic after 30 days timeout)
```

**Step 2: Replace Manual Status Updates** (2 hours)
- Current code does: `booking.giftStatus = 'SENT'`
- Ralph code does: `workflow.transition('SENT', { reason: 'Email sent successfully' })`
- Ralph validates transition is allowed before updating

**Step 3: Add Automatic Expiration** (1 hour)
- Ralph monitors all SENT gifts
- After 30 days, automatically transitions to DECLINED
- Triggers refund process

**Step 4: Add Event History** (30 minutes)
- Ralph records every state change with timestamp
- Admin can see full gift history: "Sent on Jan 5 → Accepted on Jan 7"

**Total Time Estimate:** 1 day

#### Success Metrics
- ✅ Invalid state transitions blocked automatically (can't accept before sent)
- ✅ Gifts auto-expire after 30 days
- ✅ Full audit trail of gift lifecycle
- ✅ Type-safe state management (TypeScript knows valid states)

---

### 3. Booking Modification Flow
**Priority:** MEDIUM
**Difficulty:** Medium (complex state with locked fields)
**Impact:** Better modification experience

#### Current System
**Files:**
- [app/booking/modify/\[bookingId\]/page.tsx](../app/booking/modify/[bookingId]/page.tsx) (modification page)
- [app/booking/modify/\[bookingId\]/review/page.tsx](../app/booking/modify/[bookingId]/review/page.tsx) (review changes)

**How it works:**
1. User clicks "Modify Booking"
2. Modal shows entry point
3. Configuration wizard opens with:
   - **Locked fields**: Package, dates, duration, accommodation (can't change)
   - **Modifiable fields**: Medical add-ons, wellness add-ons
4. As user adds/removes add-ons, price recalculates in real-time
5. Review page shows original booking vs new booking side-by-side
6. User confirms → price difference charged/refunded

**Current challenges:**
- Complex state management (original vs modified)
- Price recalculation on every change
- Validation that locked fields don't change
- Handling partial updates (user quits halfway)

#### What Ralph Would Improve

**Ralph context management:**
- **Immutable original state**: Ralph preserves original booking data (never changes)
- **Mutable working state**: Ralph tracks current modifications separately
- **Computed price diff**: Ralph automatically calculates `modifiedPrice - originalPrice`
- **Field access rules**: Ralph enforces which fields are locked vs modifiable
- **Save points**: Ralph can save progress if user quits halfway

#### Implementation Steps

**Step 1: Define Modification Context** (2 hours)
```
Original Booking Context (locked):
  - package: "Pure Play Mexico"
  - duration: 14 days
  - accommodation: "Luxury"
  - originalPrice: $15,000

Working Modification Context (mutable):
  - medicalAddOns: ["Teeth Whitening", "Dental Checkup"]
  - wellnessAddOns: ["Yoga Class", "Spa Treatment"]
  - currentPrice: $16,200

Computed Fields (auto-calculated):
  - priceDifference: $1,200
  - hasChanges: true
```

**Step 2: Replace Zustand Store with Ralph Context** (3 hours)
- Current: Manual Zustand store with `originalBooking` and `modifiedBooking` objects
- Ralph: Automatic context management with strict access rules
- Locked fields return error if modification attempted

**Step 3: Add Automatic Price Recalculation** (2 hours)
- Ralph watches for add-on changes
- Automatically recalculates total price
- Updates price diff in real-time

**Step 4: Add Save Points** (1 hour)
- User can quit halfway through modification
- Ralph saves progress automatically
- User can resume later from where they left off

**Total Time Estimate:** 2 days

#### Success Metrics
- ✅ Locked fields cannot be modified (enforced by Ralph)
- ✅ Price recalculates automatically on add-on changes
- ✅ Users can save progress and resume later
- ✅ Clear audit trail of what changed

---

## 🎯 Phase 2: Medium Complexity

### 4. Booking Configuration Wizard (5-Step Flow)
**Priority:** HIGH
**Difficulty:** Medium (multi-step state persistence)
**Impact:** Better booking UX

#### Current System
**Files:**
- [app/booking/configure/package.ts](../app/booking/configure/) (Zustand store)
- [app/booking/configure/\*/page.tsx](../app/booking/configure/) (5 wizard pages)

**Wizard Steps:**
1. **Package Selection**: Choose destination (Mexico, Thailand, etc.)
2. **Duration Selection**: Choose trip length (7, 14, 21 days)
3. **Accommodation**: Choose quality level (Budget, Standard, Luxury)
4. **Medical Add-ons**: Optional treatments (dental, cosmetic, etc.)
5. **Wellness Add-ons**: Optional activities (spa, yoga, cultural tours)

**Current state management:**
```typescript
// Zustand store tracks wizard progress
{
  currentStep: 3,
  selectedPackage: { id: "pkg_123", name: "Pure Play Mexico" },
  selectedDuration: 14,
  selectedAccommodation: "LUXURY",
  medicalAddOns: ["addon_dental_checkup", "addon_teeth_whitening"],
  wellnessAddOns: ["addon_yoga_class"],
  totalPrice: 16500
}
```

**Current challenges:**
- Manual step tracking (`currentStep` field)
- Manual validation at each step (can't go to step 3 without completing step 2)
- Manual price recalculation after each selection
- State loss if user refreshes browser (localStorage helps but not perfect)
- No history of changes (can't see "user changed accommodation from Standard to Luxury")

#### What Ralph Would Improve

**Ralph wizard orchestration:**
- **Step state machine**: Enforces step order (can't skip step 2)
- **Context accumulation**: Each step adds to context automatically
- **Automatic navigation**: Ralph knows when user can proceed to next step
- **Server-side persistence**: Ralph saves state to database (not just localStorage)
- **Change history**: Ralph records every decision user made
- **Price tracking**: Ralph recalculates price automatically when context changes

#### Implementation Steps

**Step 1: Define Wizard Workflow** (2 hours)
```
Steps: Package → Duration → Accommodation → Medical → Wellness → Review

Step 1 (Package):
  - Required field: selectedPackage
  - Can proceed when: selectedPackage is not null
  - Next step: Duration

Step 2 (Duration):
  - Context: selectedPackage (from Step 1)
  - Required field: selectedDuration
  - Validation: selectedDuration must be in package.durationOptions
  - Can proceed when: selectedDuration is valid
  - Next step: Accommodation

... (define all 5 steps)
```

**Step 2: Replace Zustand with Ralph Context** (4 hours)
- Remove Zustand store
- Let Ralph manage wizard context
- Ralph validates each step's required fields
- Ralph handles next/previous navigation

**Step 3: Add Server-Side Persistence** (3 hours)
- Current: State only in localStorage (lost on clear cookies)
- Ralph: Saves draft booking to database after each step
- User can resume from any device

**Step 4: Add Price Calculation Pipeline** (2 hours)
- Ralph watches for context changes
- Automatically recalculates:
  - Base price (from package + duration)
  - Accommodation modifier (Budget -20%, Luxury +30%)
  - Add-on prices (sum of selected add-ons)
  - Total price

**Step 5: Add Change History** (1 hour)
- Ralph records: "User selected Pure Play Mexico at 10:15 AM"
- Ralph records: "User changed duration from 7 to 14 days at 10:17 AM"
- Admin can see full decision history

**Total Time Estimate:** 3 days

#### Success Metrics
- ✅ Step order enforced (can't skip steps)
- ✅ State persisted to database (survives browser refresh)
- ✅ Price updates automatically as user makes selections
- ✅ Full change history tracked
- ✅ User can resume wizard from any device

---

### 5. Pre-Trip Email Sequence (5-Stage Automation)
**Priority:** MEDIUM
**Difficulty:** Medium (time-based triggers)
**Impact:** Better guest communication

#### Current System
**File:** [app/api/cron/send-pre-trip-emails/route.ts](../app/api/cron/send-pre-trip-emails/route.ts)

**Email Schedule:**
- **60 days before trip**: "Get Excited! Start Planning"
- **30 days before**: "Finalize Your Details"
- **14 days before**: "What to Pack"
- **7 days before**: "Last Minute Checklist"
- **1 day before**: "You're Leaving Tomorrow!"

**How it works now:**
1. Daily cron job runs
2. Finds all bookings with upcoming trips
3. For each booking, checks 5 boolean flags:
   - `preTrip60DayEmailSent`
   - `preTrip30DayEmailSent`
   - `preTrip14DayEmailSent`
   - `preTrip7DayEmailSent`
   - `preTrip1DayEmailSent`
4. If today matches a trigger date and flag is false:
   - Send email
   - Set flag to true

**Current challenges:**
- **5 boolean flags** (clutters database schema)
- **Daily cron check** (inefficient - checks every booking every day)
- **No retry logic** (if email fails to send, flag still set to true)
- **Manual date math** (calculate "60 days before trip start")
- **No visibility** (can't see "email scheduled for Jan 25")

#### What Ralph Would Improve

**Ralph temporal workflow:**
- **Time-based triggers**: Ralph automatically schedules emails at right time (no daily checks)
- **Single workflow state**: Replace 5 flags with one workflow status ("Next email: 30-day, scheduled for Jan 25")
- **Automatic retry**: If email fails, Ralph retries (with backoff)
- **Visual timeline**: Admin can see "60-day email sent ✓, 30-day email scheduled for Jan 25"
- **Smart cancellation**: If booking cancelled, Ralph auto-cancels remaining emails

#### Implementation Steps

**Step 1: Define Email Sequence Workflow** (2 hours)
```
Trigger: Booking confirmed
Timeline: Based on trip.startDate

Steps:
  1. Wait until (startDate - 60 days) → Send "Get Excited" email
  2. Wait until (startDate - 30 days) → Send "Finalize Details" email
  3. Wait until (startDate - 14 days) → Send "What to Pack" email
  4. Wait until (startDate - 7 days) → Send "Last Minute Checklist" email
  5. Wait until (startDate - 1 day) → Send "Leaving Tomorrow" email

Cancel if: booking.status = CANCELLED
```

**Step 2: Replace Cron Job with Ralph Scheduler** (3 hours)
- Current: Daily cron checks all bookings
- Ralph: Schedules 5 emails when booking confirmed (no daily checks)
- Ralph handles waiting periods automatically

**Step 3: Add Email Retry Logic** (2 hours)
- If email fails to send (SendGrid error), Ralph retries:
  - Retry 1: Wait 1 hour
  - Retry 2: Wait 4 hours
  - Retry 3: Alert admin

**Step 4: Remove Boolean Flags from Database** (1 hour)
- Delete 5 flags: `preTrip60DayEmailSent`, etc.
- Ralph tracks state in workflow: `{ currentStep: '30-day', completed: ['60-day'], pending: ['14-day', '7-day', '1-day'] }`

**Step 5: Add Admin Dashboard View** (2 hours)
- Show all scheduled emails for all bookings
- Admin can see: "Booking #1234: 30-day email scheduled for Jan 25 at 9 AM"
- Admin can manually trigger email early if needed

**Total Time Estimate:** 3 days

#### Success Metrics
- ✅ No daily cron job (emails scheduled once at booking confirmation)
- ✅ Email failures auto-retry
- ✅ Database cleaned up (5 boolean flags removed)
- ✅ Admin can see scheduled email timeline
- ✅ Emails auto-cancel if booking cancelled

---

### 6. Notification Routing System
**Priority:** MEDIUM
**Difficulty:** Medium (multi-channel decision tree)
**Impact:** Better notification UX

#### Current System
**File:** [lib/trpc/server/routers/notification.ts](../lib/trpc/server/routers/notification.ts)

**Notification Channels:**
- Email (SendGrid)
- SMS (Twilio)
- In-app notifications (database + polling)
- Push notifications (OneSignal)
- WhatsApp (future)

**How it works now:**
When a notification event happens (booking confirmed, payment due, trip reminder):
1. Determine notification type (BOOKING_CONFIRMATION, PAYMENT_RECEIPT, etc.)
2. Fetch user's notification preferences from database
3. Check each channel:
   - If user enabled email for this type → send email
   - If user enabled SMS for this type → send SMS
   - If user enabled push for this type → send push
4. Create notification record in database
5. Handle failures independently per channel

**Current challenges:**
- **Manual routing logic**: Each notification handler has `if/else` checks for preferences
- **No fallback**: If email fails, doesn't auto-try SMS
- **Duplicate code**: Same routing logic repeated in multiple places
- **No priority**: All notifications treated equally (urgent payment reminders vs optional newsletters)
- **No rate limiting**: Could spam user with multiple notifications at once

#### What Ralph Would Improve

**Ralph notification workflow:**
- **Declarative routing rules**: Define rules once, Ralph executes them
- **Automatic fallback**: "Try email first, if fails within 5 min, send SMS"
- **Priority queues**: Urgent notifications go first
- **Rate limiting**: "Max 3 emails per hour per user"
- **Batch processing**: "Send all pending notifications at 9 AM daily"
- **Context-aware**: "If user opened app in last 10 min, use in-app notification instead of email"

#### Implementation Steps

**Step 1: Define Routing Rules** (2 hours)
```
Notification Type: BOOKING_CONFIRMATION
Priority: HIGH
Channels:
  1. Email (always)
  2. SMS (if user enabled SMS for bookings)
  3. In-app (if user is online)
  4. Push (if user enabled push notifications)

Fallback Policy:
  - If email fails within 5 min → try SMS
  - If both fail → alert admin

Rate Limits:
  - Max 5 notifications per hour per user
```

**Step 2: Replace Manual If/Else with Ralph Router** (3 hours)
- Current: Each notification has manual `if (preferences.emailBookings) { sendEmail() }`
- Ralph: Just call `notify({ type: 'BOOKING_CONFIRMATION', userId, data })`
- Ralph handles all routing automatically

**Step 3: Add Fallback Logic** (2 hours)
- Ralph monitors email delivery status
- If fails within 5 min → auto-try SMS
- If both fail → create admin alert

**Step 4: Add Priority Queues** (2 hours)
- Urgent notifications (payment failed, trip tomorrow) go to HIGH queue
- Optional notifications (newsletter, tip of the day) go to LOW queue
- Ralph processes HIGH queue first

**Step 5: Add Rate Limiting** (2 hours)
- Ralph tracks notifications sent per user per time window
- If limit exceeded, queues notification for later
- User never gets spammed

**Total Time Estimate:** 3 days

#### Success Metrics
- ✅ Routing logic centralized (no duplicate if/else code)
- ✅ Email failures auto-fallback to SMS
- ✅ Urgent notifications prioritized
- ✅ Users never get spammed (rate limiting works)
- ✅ Context-aware delivery (in-app if user is online)

---

## 🎯 Phase 3: Strategic Implementation

### 7. Partner Referral Funnel Tracking
**Priority:** LOW
**Difficulty:** High (complex business logic)
**Impact:** Better partner insights

#### Current System
**File:** [lib/trpc/server/routers/partner.ts](../lib/trpc/server/routers/partner.ts)

**Referral Funnel Stages:**
1. **Click**: Someone clicks partner's referral link
2. **Application**: Visitor fills out application form
3. **Booking**: Application approved → visitor books trip
4. **Points Earned**: Partner earns Passport Points
5. **Commission**: Partner earns $ commission

**Database Tables:**
- `referral_links`: Stores partner's unique link (`partnerId`, `customSlug`)
- `referral_events`: Tracks events (CLICK, APPLICATION, BOOKING)
- `points_transactions`: Records points earned
- `partner_payouts`: Tracks commission payments

**How it works now:**
1. User clicks partner link: `https://app.com/partners/VILLAGES-JEN-2025`
2. System creates `ReferralEvent` with type CLICK
3. User fills out application → creates APPLICATION event
4. User books trip → creates BOOKING event
5. Cron job calculates commissions monthly
6. Partner sees funnel conversion rate in dashboard

**Current challenges:**
- **No automatic funnel visualization**: Partner sees raw numbers, not visual funnel
- **Manual commission calculation**: Cron job loops through all bookings monthly
- **No milestone notifications**: Partner doesn't get notified when someone clicks link or applies
- **No attribution expiry**: If someone clicks link today but books 2 years later, still attributed
- **No A/B testing**: Can't test different partner page versions

#### What Ralph Would Improve

**Ralph funnel workflow:**
- **Automatic stage tracking**: Ralph knows user is at "Application" stage
- **Visual funnel**: Ralph generates funnel chart (100 clicks → 40 applications → 10 bookings)
- **Milestone notifications**: Ralph notifies partner at each stage ("Someone just clicked your link!")
- **Attribution window**: Ralph enforces "60-day attribution window" (click must be within 60 days of booking)
- **A/B testing**: Ralph can split traffic between partner page variants
- **Commission automation**: Ralph calculates commission in real-time (not monthly batch)

#### Implementation Steps

**Step 1: Define Funnel Workflow** (3 hours)
```
Funnel Stages: Click → Application → Booking → Points → Commission

Stage 1 (Click):
  - Create referral session
  - Set attribution cookie (expires in 60 days)
  - Notify partner: "New click on your link!"

Stage 2 (Application):
  - Link application to referral session
  - Check if within attribution window
  - Notify partner: "Someone applied from your link!"

Stage 3 (Booking):
  - Link booking to referral session
  - Calculate points earned (based on booking value)
  - Award points to partner
  - Notify partner: "Booking confirmed! You earned 1,500 points"

Stage 4 (Commission):
  - Calculate commission (% of booking value based on partner tier)
  - Create payout record
  - Notify partner: "Commission earned! $450"
```

**Step 2: Replace Event System with Ralph Funnel** (4 hours)
- Current: Manual event creation (`ReferralEvent.create()`)
- Ralph: Funnel transitions (`funnel.advance('APPLICATION', { userId, applicationId })`)
- Ralph handles all state tracking

**Step 3: Add Attribution Window** (2 hours)
- Ralph checks: "Is this booking within 60 days of last click?"
- If no → booking not attributed to partner
- If yes → booking attributed, partner earns commission

**Step 4: Add Real-Time Commission Calculation** (3 hours)
- Current: Monthly cron job calculates all commissions
- Ralph: Calculates commission immediately when booking confirmed
- Partner sees commission in real-time

**Step 5: Add Funnel Visualization** (2 hours)
- Ralph generates funnel data for partner dashboard:
  ```
  100 Clicks (Jan 1 - Jan 31)
     ↓
  40 Applications (40% conversion)
     ↓
  10 Bookings (25% conversion from application)
     ↓
  $4,500 Commission Earned
  ```

**Step 6: Add Milestone Notifications** (2 hours)
- Ralph sends partner notification at each funnel stage
- Uses notification system (Story 11-9)
- Partner gets real-time updates on referral activity

**Total Time Estimate:** 5 days

#### Success Metrics
- ✅ Visual funnel in partner dashboard (click → application → booking)
- ✅ Real-time commission calculation (no monthly cron job)
- ✅ Attribution window enforced (60 days)
- ✅ Partner gets notified at each funnel stage
- ✅ Better insights into referral performance

---

## 📊 Implementation Summary

### Phase 1: Quick Wins (Weeks 1-2)
| Feature | Difficulty | Time | Impact | ROI |
|---------|-----------|------|--------|-----|
| Payment Retry Loop | Easy | 1 day | High | ⭐⭐⭐⭐⭐ |
| Gift Booking State Machine | Easy | 1 day | Medium | ⭐⭐⭐⭐ |
| Booking Modification Flow | Medium | 2 days | Medium | ⭐⭐⭐ |

**Total Phase 1 Time:** 4 days

### Phase 2: Medium Complexity (Weeks 3-6)
| Feature | Difficulty | Time | Impact | ROI |
|---------|-----------|------|--------|-----|
| Booking Configuration Wizard | Medium | 3 days | High | ⭐⭐⭐⭐⭐ |
| Pre-Trip Email Sequence | Medium | 3 days | Medium | ⭐⭐⭐⭐ |
| Notification Routing System | Medium | 3 days | Medium | ⭐⭐⭐ |

**Total Phase 2 Time:** 9 days

### Phase 3: Strategic (Weeks 7-12)
| Feature | Difficulty | Time | Impact | ROI |
|---------|-----------|------|--------|-----|
| Partner Referral Funnel | High | 5 days | Low | ⭐⭐ |

**Total Phase 3 Time:** 5 days

**GRAND TOTAL:** 18 days (≈ 3.5 weeks of implementation)

---

## 🛠 Technical Requirements

### Prerequisites
Before starting Ralph implementation, you'll need:

1. **Ralph CLI Installed**
   ```bash
   npm install -g @snarktank/ralph
   # or
   yarn global add @snarktank/ralph
   ```

2. **Git Repository Clean**
   - Ralph uses git commits to track progress
   - Ensure working directory is clean before starting

3. **Test Suite Ready**
   - Ralph runs tests after each loop
   - Need working `npm test` command

4. **Environment Variables Set**
   - Ralph may need access to Stripe, SendGrid, etc.
   - Ensure `.env` file complete

### Ralph Project Structure

Ralph will create these files in your project:

```
/pickleball-passport/
  /ralph/
    /workflows/
      payment-retry.json          # Payment retry workflow definition
      gift-booking.json           # Gift booking state machine
      booking-wizard.json         # Booking configuration workflow
      email-sequence.json         # Pre-trip email workflow
      notification-routing.json   # Notification routing rules
      partner-funnel.json         # Partner referral funnel
    /progress/
      payment-retry-progress.txt  # Learnings from payment retry loops
      booking-wizard-progress.txt # Learnings from booking wizard
    prd.json                      # Master PRD for Ralph workflows
    AGENTS.md                     # Documentation for future Ralph loops
```

---

## 🧪 Testing Strategy

### Testing Each Ralph Workflow

**Before Launch:**
1. **Unit Tests**: Test individual workflow steps
2. **Integration Tests**: Test full workflow end-to-end
3. **Load Tests**: Test workflow under high volume
4. **Failure Tests**: Test error handling and retries

**After Launch:**
1. **Monitor Logs**: Watch Ralph progress output
2. **Check Error Rates**: Ensure errors decrease (not increase)
3. **Measure Performance**: Compare before/after metrics
4. **User Feedback**: Ask customers about experience

### Key Metrics to Track

**Payment Retry Loop:**
- Retry success rate (target: 60% success on retry 2)
- Average time to payment success
- Number of payments reaching max retries

**Gift Booking:**
- Invalid state transition attempts (should be 0)
- Average time from PENDING → ACCEPTED
- Gift expiration rate

**Booking Wizard:**
- Step completion rates (how many users reach step 5?)
- Average time to complete wizard
- Browser refresh recovery success rate

**Email Sequence:**
- Email delivery success rate (target: 99%+)
- Average email open rate per stage
- Unsubscribe rate

**Notification System:**
- Fallback trigger rate (how often email fails → SMS used?)
- Rate limit hit frequency
- Average notification delivery time

**Partner Funnel:**
- Click → Application conversion (target: 40%+)
- Application → Booking conversion (target: 25%+)
- Average time in each funnel stage

---

## 🚨 Common Pitfalls & How to Avoid Them

### Pitfall 1: Tasks Too Big
**Problem:** Trying to implement entire booking system in one Ralph loop
**Solution:** Break into tiny tasks (each should take < 1 hour)

**Bad Example:**
```
Task: "Implement booking system"
```

**Good Example:**
```
Task 1: "Add payment retry state machine definition"
Task 2: "Replace manual retry counter with Ralph state"
Task 3: "Add retry email notification"
Task 4: "Add admin alert on max retries"
```

### Pitfall 2: Ignoring Quality Gates
**Problem:** Ralph loops continue even when tests fail
**Solution:** Set strict quality gates (all tests must pass)

**Bad Example:**
```
# Ralph continues even if tests fail
ralph run --skip-tests
```

**Good Example:**
```
# Ralph stops if any test fails
ralph run --require-tests-pass
```

### Pitfall 3: Not Updating AGENTS.md
**Problem:** Future Ralph loops make same mistakes
**Solution:** Update AGENTS.md after each loop with learnings

**Good Practice:**
```
After implementing payment retry loop, add to AGENTS.md:

## Payment Retry Best Practices
- Always use idempotency keys (prevents double charges)
- Stripe error code 'insufficient_funds' is temporary (retry works)
- Stripe error code 'card_declined' is permanent (don't retry)
- Max 4 retries (beyond that, manual intervention needed)
```

### Pitfall 4: Forgetting Progress Files
**Problem:** Each Ralph loop starts from scratch
**Solution:** Read `progress.txt` before starting new loop

**Good Practice:**
```
Before implementing notification routing, Ralph reads:

notification-routing-progress.txt:
- Email delivery usually takes 2-3 seconds
- SMS delivery usually takes 5-10 seconds
- If user opened app in last 5 min, in-app notification better than email
- Rate limiting at 5 notifications per hour prevents spam
```

### Pitfall 5: Over-Engineering
**Problem:** Adding features Ralph doesn't need yet
**Solution:** Start simple, add complexity only when needed

**Bad Example:**
```
Task: "Build payment retry system with:
- Machine learning to predict optimal retry time
- A/B testing different retry delays
- Real-time dashboard for monitoring retries
- Slack integration for alerts"
```

**Good Example:**
```
Task: "Build payment retry system with:
- Simple exponential backoff (3 days, 7 days, 14 days)
- Admin email alert after max retries"

(Add advanced features later if needed)
```

---

## 📚 Resources & Learning

### Official Ralph Documentation
- **GitHub:** https://github.com/snarktank/ralph
- **Examples:** https://github.com/snarktank/ralph/tree/main/examples
- **Discord:** https://discord.gg/ralph (hypothetical - check real Ralph docs)

### Ralph Tutorials (14-Year-Old Friendly)
1. **"Your First Ralph Loop"** - Build a simple todo list workflow
2. **"Ralph State Machines"** - Learn gift booking state machine pattern
3. **"Ralph Temporal Workflows"** - Learn email sequence time-based pattern
4. **"Ralph Error Handling"** - Learn payment retry error handling

### Similar Patterns in Other Projects
- **Stripe Webhooks** - Similar to Ralph event-driven workflows
- **GitHub Actions Workflows** - Similar to Ralph task definitions
- **Temporal.io** - Similar to Ralph temporal workflows (more complex)

---

## 🎓 Next Steps

### Immediate Actions (This Week)
1. **Read Ralph Documentation** (2 hours)
   - Understand core concepts
   - Review example projects
   - Watch tutorial videos

2. **Set Up Ralph in Project** (1 hour)
   ```bash
   cd /Users/grantcharge/Pickleball-Passport
   npm install @snarktank/ralph
   ralph init
   ```

3. **Create First Workflow Definition** (2 hours)
   - Start with Payment Retry Loop (easiest)
   - Define states: New → Attempting → Retrying → Success/Failed
   - Define retry policy: 3 days, 7 days, 14 days

4. **Test Ralph Locally** (2 hours)
   - Simulate failed payment
   - Watch Ralph execute retry loop
   - Verify learnings saved to progress file

### This Month
1. **Complete Phase 1** (All 3 quick wins)
2. **Document Learnings** (Update AGENTS.md after each workflow)
3. **Measure Success** (Track metrics before/after)

### Next Quarter
1. **Complete Phase 2** (All 3 medium complexity workflows)
2. **Train Team on Ralph** (If you have teammates)
3. **Evaluate Phase 3** (Decide if Partner Funnel worth the effort)

---

## ❓ Questions & Answers

### Q: Do I need to use Ralph for everything?
**A:** No! Only use Ralph for loops, workflows, and state machines. Regular CRUD operations (create user, update profile) don't need Ralph.

### Q: Can I start with just one workflow?
**A:** Absolutely! Start with Payment Retry Loop, get comfortable, then add more.

### Q: What if Ralph makes a mistake?
**A:** Ralph saves progress to git commits. Just revert the commit and Ralph will try again.

### Q: How much does Ralph cost?
**A:** Ralph itself is free (open source). You only pay for AI API calls (Claude API).

### Q: Can Ralph work with my existing cron jobs?
**A:** Yes! You can gradually replace cron jobs with Ralph workflows. Start with one, keep others as-is.

### Q: What if I don't understand something?
**A:** Ask questions! Ralph has a community Discord (check docs for link). Also, I'm here to help explain anything.

---

## 🏁 Conclusion

Ralph workflow will transform your Pickleball Passport project by:

1. **Reducing Code Complexity** - Replace manual loops with declarative workflows
2. **Improving Reliability** - Automatic retries and error handling
3. **Better Visibility** - See status of all workflows in one place
4. **Faster Development** - Ralph handles boilerplate, you focus on business logic
5. **Easier Maintenance** - Future developers understand workflows instantly

**Remember:**
- Start small (Phase 1: Payment Retry Loop)
- Learn from each loop (update AGENTS.md)
- Don't over-engineer (simple solutions first)
- Test thoroughly (quality gates prevent bugs)
- Ask questions (Ralph community is helpful)

**You've got this!** 🚀

Ralph will make your loops smarter, your code cleaner, and your project easier to maintain.

---

**Next Document to Read:** `ralph-payment-retry-implementation.md` (detailed step-by-step guide for your first Ralph workflow)

**Questions?** Just ask - I'll explain anything that's confusing!
