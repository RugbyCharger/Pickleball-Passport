# Story 9-7: Partner Training Resources

Status: done

## Story

As a partner,
I want to access training resources and guides,
So that I can effectively promote Pickleball Passport to my members.

## Acceptance Criteria

### AC-1: Training Resources Page

- [ ] Page: `/dashboard/partner/training`
- [ ] Link from partner dashboard
- [ ] Breadcrumb navigation

### AC-2: Resource Categories

- [ ] Category sections:
  - Getting Started (onboarding guides)
  - Sales & Communication (talking points, objection handling)
  - Portal Tutorials (video walkthroughs)
  - FAQs & Support (common questions)

### AC-3: Resource Types

- [ ] PDF guides (downloadable)
- [ ] Video tutorials (embedded or links)
- [ ] FAQ articles (expandable accordions)
- [ ] Quick reference cards

### AC-4: Getting Started Resources

- [ ] "Welcome to Pickleball Passport" guide
- [ ] "How to Share Your Referral Code" tutorial
- [ ] "First 30 Days Action Plan" checklist
- [ ] Portal navigation video

### AC-5: Sales & Communication Resources

- [ ] "How to Talk About Pickleball Passport" guide
- [ ] Objection handling scripts (PDF)
- [ ] Email templates for member outreach
- [ ] Elevator pitch examples

### AC-6: Portal Tutorials

- [ ] Video: Dashboard overview
- [ ] Video: How to view referrals
- [ ] Video: How to check points balance
- [ ] Video: How to download marketing materials

### AC-7: FAQs

- [ ] Expandable FAQ section
- [ ] Topics: Referrals, Points, Rewards, Technical Support
- [ ] Search functionality (optional for MVP)

## Tasks / Subtasks

- [ ] Task 1: Create training page route
- [ ] Task 2: Create resource data structure
- [ ] Task 3: Build category sections
- [ ] Task 4: Add resource cards (PDF, video, FAQ)
- [ ] Task 5: Add video embedding (YouTube/Vimeo)
- [ ] Task 6: Add FAQ accordion
- [ ] Task 7: Add link from partner dashboard

## Dev Notes

### Resource Storage

For MVP, store resources in `/public/partner-training/`:
- PDFs: `/public/partner-training/guides/`
- Videos: Embed YouTube/Vimeo links (or host on Mux)
- FAQs: Inline content

### Resource Data Structure

```typescript
interface TrainingResource {
  id: string
  category: 'getting-started' | 'sales' | 'tutorials' | 'faq'
  title: string
  description: string
  type: 'pdf' | 'video' | 'article' | 'checklist'
  url?: string
  videoId?: string
  content?: string // For FAQs
}
```

### Video Hosting

- Option 1: YouTube (free, easy embedding)
- Option 2: Vimeo (more professional)
- Option 3: Mux (already in use for testimonials)

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Completion Notes

**Completed:** 2026-01-16

**Files Created:**
1. `app/(dashboard)/dashboard/partner/training/page.tsx` - Training resources page with category filtering, search, and resource cards
2. `lib/data/training-resources.ts` - Resource data structure with 18 resources across 4 categories

**Files Modified:**
1. `app/(dashboard)/dashboard/partner/page.tsx` - Added "Training Resources" quick action card
2. `_bmad-output/implementation/sprint-status.yaml` - Updated status to done

**Features Implemented:**
- Category tabs (All, Getting Started, Sales & Communication, Portal Tutorials, FAQs)
- Search functionality across all resources
- Resource cards with icons (PDF, Video, Article, Checklist)
- Video embedding support (YouTube/Vimeo/Mux)
- PDF download functionality
- FAQ accordion with expand/collapse
- Responsive grid layout
- Breadcrumb navigation
- Link from partner dashboard

**Resource Categories:**
- Getting Started: 4 resources (welcome guide, referral sharing, action plan, portal overview)
- Sales & Communication: 4 resources (talking points, objection handling, email templates, elevator pitches)
- Portal Tutorials: 4 videos (dashboard, referrals, points, materials)
- FAQs: 6 articles (points, payouts, manual attribution, tiers, customization, support)

**Note:** Video resources use placeholder IDs. Replace with actual YouTube/Vimeo video IDs when videos are created. PDF files should be placed in `/public/partner-training/guides/` directory.

### File List

**Files to Create:**
1. `app/(dashboard)/dashboard/partner/training/page.tsx`
2. `lib/data/training-resources.ts` (resource definitions)

**Files to Modify:**
1. `app/(dashboard)/dashboard/partner/page.tsx` - Add link
2. `_bmad-output/implementation/sprint-status.yaml` - Update status
