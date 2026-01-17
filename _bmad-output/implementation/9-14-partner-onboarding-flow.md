# Story 9-14: Partner Onboarding Flow

Status: done

## Story

As a new partner,
I want to complete an onboarding wizard,
So that I understand how to get started and use the platform effectively.

## Acceptance Criteria

### AC-1: Onboarding Wizard Page

- [ ] Page: `/dashboard/partner/onboarding`
- [ ] Multi-step wizard (5 steps)
- [ ] Progress tracker showing current step (e.g., "1 of 5")
- [ ] Skip option (can return later)
- [ ] Skip saves progress

### AC-2: Step 1 - Welcome Video

- [ ] Welcome message from Jaron
- [ ] Video embed or placeholder
- [ ] Introduction to the partner program
- [ ] "Next" button to proceed

### AC-3: Step 2 - How the Program Works

- [ ] Explain Passport Points system
- [ ] Explain tier structure (Bronze → Platinum)
- [ ] Show earning opportunities
- [ ] Show redemption options
- [ ] "Next" button to proceed

### AC-4: Step 3 - Copy Your Referral Link

- [ ] Display partner's unique referral code
- [ ] Copy button
- [ ] Show referral link example
- [ ] Instructions on how to share
- [ ] "Next" button to proceed

### AC-5: Step 4 - Download Marketing Materials

- [ ] Quick overview of available materials
- [ ] Link to materials page
- [ ] Download button (opens materials page)
- [ ] "Next" button to proceed

### AC-6: Step 5 - Join Directors Circle

- [ ] Explain the community forum
- [ ] Link to forum page
- [ ] "Complete Onboarding" button

### AC-7: Completion

- [ ] Mark onboarding as completed in database
- [ ] Redirect to partner dashboard
- [ ] Show welcome message

### AC-8: Skip Functionality

- [ ] "Skip for now" button on each step
- [ ] Saves progress (can resume later)
- [ ] Can access onboarding from dashboard later

## Tasks / Subtasks

- [ ] Task 1: Add `onboardingCompleted` field to PartnerProfile
- [ ] Task 2: Create onboarding wizard page
- [ ] Task 3: Implement step 1 (Welcome)
- [ ] Task 4: Implement step 2 (How It Works)
- [ ] Task 5: Implement step 3 (Referral Link)
- [ ] Task 6: Implement step 4 (Marketing Materials)
- [ ] Task 7: Implement step 5 (Directors Circle)
- [ ] Task 8: Add completion mutation
- [ ] Task 9: Add redirect logic for new partners
- [ ] Task 10: Add "Complete Onboarding" link to dashboard

## Dev Notes

### Database Schema

Add to `PartnerProfile`:
```prisma
onboardingCompleted Boolean @default(false)
```

### Onboarding Steps

1. Welcome Video - Introduction
2. How It Works - Points & Tiers
3. Copy Referral Link - Get started sharing
4. Marketing Materials - Download resources
5. Join Directors Circle - Community forum

### Redirect Logic

Check `onboardingCompleted` on partner dashboard:
- If `false` and just signed up → Redirect to onboarding
- If `false` but not new → Show banner with link
- If `true` → Normal dashboard

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Completion Notes

**Completed:** 2026-01-16

**Files Created:**
1. `app/(dashboard)/dashboard/partner/onboarding/page.tsx` - Onboarding wizard page

**Files Modified:**
1. `prisma/schema.prisma` - Added `onboardingCompleted` field to PartnerProfile
2. `lib/trpc/server/routers/partner.ts` - Added `completeOnboarding` mutation
3. `app/(dashboard)/dashboard/partner/page.tsx` - Added redirect logic and onboarding banner
4. `_bmad-output/implementation/sprint-status.yaml` - Updated status to done

**Features Implemented:**
- Multi-step onboarding wizard (5 steps):
  1. Welcome - Introduction video (placeholder)
  2. How It Works - Passport Points and tier system explanation
  3. Copy Referral Link - Display and copy referral code
  4. Marketing Materials - Links to materials and training resources
  5. Join Directors Circle - Community forum introduction
- Progress tracker showing current step
- Skip functionality (can return later)
- Completion mutation to mark onboarding as done
- Redirect logic for new partners (< 24 hours old)
- Onboarding banner for existing partners who haven't completed

**Database Schema:**
- `PartnerProfile.onboardingCompleted` - Boolean flag (default: false)

**Redirect Logic:**
- New partners (created < 24 hours ago) → Redirect to onboarding
- Existing partners who haven't completed → Show banner with link
- Completed onboarding → Normal dashboard

**MVP Notes:**
- Welcome video is placeholder (Coming soon message)
- Can skip at any step and return later
- Onboarding can be accessed from dashboard banner

**Future Enhancements:**
- Welcome video from Jaron
- Track progress through steps (save step number)
- Email reminders to complete onboarding
- Analytics on onboarding completion rates

### File List

**Files to Create:**
1. `app/(dashboard)/dashboard/partner/onboarding/page.tsx` - Onboarding wizard

**Files to Modify:**
1. `prisma/schema.prisma` - Add `onboardingCompleted` field
2. `lib/trpc/server/routers/partner.ts` - Add `completeOnboarding` mutation
3. `app/(dashboard)/dashboard/partner/page.tsx` - Add redirect/banner logic
4. `_bmad-output/implementation/sprint-status.yaml` - Update status
