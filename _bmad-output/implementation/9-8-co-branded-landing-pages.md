# Story 9-8: Co-Branded Landing Pages

Status: done

## Story

As a partner,
I want to create co-branded landing pages with my club's branding,
So that I can share a personalized experience with my members.

## Acceptance Criteria

### AC-1: Landing Page Generator

- [ ] Page: `/dashboard/partner/landing-pages`
- [ ] List of existing landing pages (if any)
- [ ] "Create New Landing Page" button
- [ ] Link from partner dashboard

### AC-2: Landing Page Editor

- [ ] Create/edit landing page form
- [ ] Fields:
  - Page name/title
  - Club logo upload (optional)
  - Club colors (primary, secondary)
  - Custom headline
  - Custom subheadline
  - Club contact info (optional)
- [ ] Preview of landing page
- [ ] Save draft / Publish

### AC-3: Landing Page Display

- [ ] Public route: `/p/[partnerSlug]/[pageSlug]` or `/p/[pageId]`
- [ ] Displays Pickleball Passport content with partner branding
- [ ] Includes partner's referral code (pre-populated)
- [ ] CTA: "Apply Now" (links to application with referral code)
- [ ] Responsive design

### AC-4: Landing Page Features

- [ ] Hero section with partner branding
- [ ] Value proposition section
- [ ] Package highlights
- [ ] Testimonials (Pickleball Passport testimonials)
- [ ] FAQ section
- [ ] Application form (with referral code pre-filled)

### AC-5: Landing Page Management

- [ ] View all landing pages
- [ ] Edit existing pages
- [ ] Copy landing page link
- [ ] View analytics (views, clicks, conversions)
- [ ] Delete landing page

## Tasks / Subtasks

- [ ] Task 1: Create landing pages table in database
- [ ] Task 2: Create landing page editor page
- [ ] Task 3: Create public landing page route
- [ ] Task 4: Add image upload for club logo
- [ ] Task 5: Add landing page list page
- [ ] Task 6: Add analytics tracking
- [ ] Task 7: Add link from partner dashboard

## Dev Notes

### Database Schema

```prisma
model PartnerLandingPage {
  id            String   @id @default(cuid())
  partnerId     String
  partner       Partner  @relation(fields: [partnerId], references: [id])
  name          String
  slug          String   @unique
  isPublished   Boolean  @default(false)
  
  // Branding
  clubLogoUrl   String?
  primaryColor  String?  @default("#003D5C")
  secondaryColor String? @default("#D4AF37")
  
  // Content
  headline      String?
  subheadline   String?
  clubContact   String?
  
  // Analytics
  viewCount     Int      @default(0)
  clickCount    Int      @default(0)
  conversionCount Int    @default(0)
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@index([partnerId])
  @@index([slug])
}
```

### Landing Page Route

- Public route: `/p/[slug]` (e.g., `/p/phoenix-pickleball-club`)
- Or use ID: `/p/[id]` for simplicity

### Image Upload

- Use existing S3 upload infrastructure
- Store club logos in `/partner-logos/` bucket path

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Completion Notes

**Completed:** 2026-01-16

**Files Created:**
1. `app/(dashboard)/dashboard/partner/landing-pages/page.tsx` - Landing pages list page
2. `app/(dashboard)/dashboard/partner/landing-pages/[id]/page.tsx` - Landing page editor (handles both new and edit)
3. `app/(marketing)/p/[slug]/page.tsx` - Public landing page route

**Files Modified:**
1. `prisma/schema.prisma` - Added PartnerLandingPage model
2. `lib/trpc/server/routers/partner.ts` - Added landing page procedures:
   - getMyLandingPages
   - getLandingPage
   - getLandingPageBySlug (public)
   - createLandingPage
   - updateLandingPage
   - deleteLandingPage
   - trackLandingPageView (public)
   - trackLandingPageClick (public)
3. `app/(dashboard)/dashboard/partner/page.tsx` - Added "Landing Pages" quick action card
4. `_bmad-output/implementation/sprint-status.yaml` - Updated status to done

**Features Implemented:**
- Landing pages list page with analytics (views, clicks, conversions)
- Landing page editor with:
  - Basic info (name, slug)
  - Branding (logo URL, primary/secondary colors)
  - Content (headline, subheadline, club contact)
  - Publish/unpublish toggle
- Public landing page route at `/p/[slug]`:
  - Displays partner branding (logo, colors)
  - Custom headline/subheadline
  - Pre-filled referral code in application link
  - Tracks views and clicks
- Copy landing page link functionality
- Delete landing pages with confirmation

**Database Changes:**
- Added PartnerLandingPage model with:
  - Basic info (name, slug, isPublished)
  - Branding fields (clubLogoUrl, primaryColor, secondaryColor)
  - Content fields (headline, subheadline, clubContact)
  - Analytics fields (viewCount, clickCount, conversionCount)

**Note:** Migration needs to be created and run:
```bash
npx prisma migrate dev --name add_partner_landing_pages
```

### File List

**Files to Create:**
1. `app/(dashboard)/dashboard/partner/landing-pages/page.tsx` - List page
2. `app/(dashboard)/dashboard/partner/landing-pages/[id]/page.tsx` - Editor page
3. `app/(marketing)/p/[slug]/page.tsx` - Public landing page
4. `lib/trpc/server/routers/partner-landing-pages.ts` - tRPC router

**Files to Modify:**
1. `prisma/schema.prisma` - Add PartnerLandingPage model
2. `app/(dashboard)/dashboard/partner/page.tsx` - Add link
3. `_bmad-output/implementation/sprint-status.yaml` - Update status
