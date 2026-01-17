# Story 9-4: Marketing Materials Library

Status: done

## Story

As a partner,
I want to download marketing materials,
So that I can promote Pickleball Passport easily.

## Acceptance Criteria

### AC-1: Materials Page

- [ ] Page: `/dashboard/partner/materials`
- [ ] Categories: Email Templates, Flyers, Social Media, Presentation
- [ ] Category tabs or filter
- [ ] Link from partner dashboard

### AC-2: Material Display

- [ ] Each material shows:
  - Preview (thumbnail or preview text)
  - Title
  - Description
  - File format and size
  - Download button
- [ ] Grid or list layout
- [ ] Responsive design

### AC-3: Email Templates

- [ ] 3 variations (plain text + HTML)
- [ ] Preview text content
- [ ] Download as .txt and .html files
- [ ] Personalization tokens documented

### AC-4: Flyers

- [ ] PDF downloads (8.5x11, 11x17)
- [ ] Preview image
- [ ] Description of use case

### AC-5: Social Media Content

- [ ] Image + caption for Facebook, Instagram, LinkedIn
- [ ] Preview image
- [ ] Copy-to-clipboard for captions
- [ ] Download image option

### AC-6: Presentation Deck

- [ ] PowerPoint/PDF download
- [ ] Preview slides
- [ ] Description

### AC-7: Download Tracking

- [ ] Track downloads in database (optional for MVP)
- [ ] Log material type and partner ID

## Tasks / Subtasks

- [ ] Task 1: Create materials page route
- [ ] Task 2: Create material data structure
- [ ] Task 3: Build category navigation
- [ ] Task 4: Build material cards with preview
- [ ] Task 5: Add download functionality
- [ ] Task 6: Add download tracking (optional)
- [ ] Task 7: Add link from partner dashboard

## Dev Notes

### Material Storage

For MVP, store materials in `/public/partner-materials/`:
- Email templates: `/public/partner-materials/email-templates/`
- Flyers: `/public/partner-materials/flyers/`
- Social media: `/public/partner-materials/social-media/`
- Presentations: `/public/partner-materials/presentations/`

Future: Move to S3 with presigned URLs

### Material Data Structure

```typescript
interface MarketingMaterial {
  id: string
  category: 'email' | 'flyer' | 'social' | 'presentation'
  title: string
  description: string
  previewUrl?: string
  downloadUrl: string
  fileFormat: string
  fileSize?: string
  tags?: string[]
}
```

### Download Tracking (Optional)

Create `MaterialDownload` model:
```prisma
model MaterialDownload {
  id String @id @default(cuid())
  partnerId String
  materialId String
  downloadedAt DateTime @default(now())
}
```

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Completion Notes

**Implementation Date:** 2026-01-16

**What was implemented:**
1. Created marketing materials data structure (`lib/data/marketing-materials.ts`):
   - 13 materials across 4 categories (email, flyer, social, presentation)
   - Material definitions with preview URLs, download URLs, file formats

2. Created `/dashboard/partner/materials` page with:
   - Category tabs (All, Email, Flyer, Social, Presentation)
   - Material cards with preview images
   - Download functionality
   - Copy-to-clipboard for social media captions
   - Preview modal for images
   - Responsive grid layout

3. Added quick action card on partner dashboard linking to materials

**Note:** Materials are currently stored in `/public/partner-materials/` directory. For production, these should be moved to S3 with presigned URLs. Download tracking can be added later with a MaterialDownload model.

**Future Enhancements:**
- Download tracking in database
- Customization options (add club logo, contact info)
- Usage analytics for admin

### File List

**Files to Create:**
1. `app/(dashboard)/dashboard/partner/materials/page.tsx`
2. `lib/data/marketing-materials.ts` (material definitions)

**Files to Modify:**
1. `app/(dashboard)/dashboard/partner/page.tsx` - Add link
2. `_bmad-output/implementation/sprint-status.yaml` - Update status
