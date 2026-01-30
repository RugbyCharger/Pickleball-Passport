# Phase 17: Testimonial Workflow - Research

**Researched:** 2026-01-30
**Domain:** User-generated content moderation and testimonial management
**Confidence:** HIGH

## Summary

Phase 17 requires implementing a complete testimonial workflow system covering guest submission, admin moderation, and public display. Significant infrastructure already exists from Epic 12-5 (shipped in a previous milestone), including:

- Complete database schema (`GuestTestimonial` model with all required fields)
- Full tRPC API (`guestTestimonialRouter` with all CRUD operations)
- Admin moderation UI at `/dashboard/admin/cms/testimonials`
- Submission form component (`TestimonialSubmissionForm`)
- Mobile app testimonial screen
- Public display gallery component

The existing implementation follows industry-standard moderation workflow best practices with five states: PENDING → APPROVED → PUBLISHED (happy path), with REJECTED and EDIT_REQUESTED as alternate states. The system supports text, video, before/after photos, and combined testimonials with GDPR consent tracking.

**Primary recommendation:** Leverage existing Epic 12-5 implementation. Focus on integration work (linking submission forms to user dashboards, ensuring mobile app integration works, verifying public display), edge case handling, and any missing guest-facing features.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Prisma | 5.22.0 | Database ORM with GuestTestimonial model | Already integrated, schema defined |
| tRPC | 11.8.1 | Type-safe API with guestTestimonialRouter | Existing router with all procedures |
| React Hook Form | Latest | Form validation in submission component | Already used in existing form |
| Zod | Latest | Schema validation for testimonial inputs | Integrated with tRPC procedures |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Supabase Storage | Current | File storage for photos/videos | For actual file uploads (placeholder exists) |
| Mux | N/A | Video transcoding (optional) | If video testimonials need optimization |
| SendGrid | Integrated | Email notifications for moderation workflow | Already configured for rejection/edit request emails |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom moderation UI | Third-party UGC platform | Existing custom UI provides full control and is already built |
| Direct file uploads | URL-only submissions | Photos/videos require storage integration (Supabase already chosen) |

**Installation:**
```bash
# Core dependencies already installed
# Only needed if adding new features beyond existing implementation
npm install @supabase/storage-js  # If not already installed
```

## Architecture Patterns

### Recommended Project Structure
```
app/
├── (dashboard)/dashboard/
│   ├── admin/cms/testimonials/     # Admin moderation (EXISTS)
│   └── testimonials/                # Guest submission page (NEEDS INTEGRATION)
├── (marketing)/testimonials/        # Public display page (EXISTS)
components/
└── testimonials/
    ├── testimonial-submission-form.tsx  # Submission form (EXISTS)
    └── testimonial-gallery.tsx          # Public gallery (EXISTS)
lib/
├── trpc/server/routers/
│   └── guest-testimonial.ts         # Full API router (EXISTS)
└── storage/
    └── testimonial-storage.ts       # File upload helpers (EXISTS)
mobile/
└── app/(app)/alumni/
    └── testimonial.tsx              # Mobile submission (EXISTS)
```

### Pattern 1: Five-State Moderation Workflow
**What:** Industry-standard content moderation with five states
**When to use:** For all user-generated content requiring review
**Example:**
```typescript
// Existing schema from prisma/schema.prisma
enum GuestTestimonialStatus {
  PENDING        // Submitted, awaiting review
  APPROVED       // Approved by admin, ready to publish
  PUBLISHED      // Live on website
  REJECTED       // Rejected by admin (with reason)
  EDIT_REQUESTED // Admin requested changes from guest
}

// State transitions (from existing tRPC router)
PENDING → APPROVED (admin approves)
APPROVED → PUBLISHED (admin publishes)
PUBLISHED → APPROVED (admin unpublishes)
PENDING → REJECTED (admin rejects with reason)
PENDING → EDIT_REQUESTED (admin requests edits)
EDIT_REQUESTED → PENDING (guest resubmits)
```

### Pattern 2: Type-Safe Testimonial Submission
**What:** Multiple submission types with conditional validation
**When to use:** When users can submit different media types
**Example:**
```typescript
// From existing testimonial-submission-form.tsx
enum GuestTestimonialType {
  TEXT          // Written testimonial only
  VIDEO         // Video testimonial
  BEFORE_AFTER  // Before/after photos with text
  COMBINED      // Video + photos + text
}

// Validation logic (from guest-testimonial.ts)
if (input.type === 'TEXT' && !input.content) {
  throw new TRPCError({ code: 'BAD_REQUEST', message: 'Text content is required' });
}
if (input.type === 'VIDEO' && !input.videoUrl) {
  throw new TRPCError({ code: 'BAD_REQUEST', message: 'Video URL is required' });
}
if (input.type === 'BEFORE_AFTER' && (!input.beforePhotoUrl || !input.afterPhotoUrl)) {
  throw new TRPCError({ code: 'BAD_REQUEST', message: 'Both photos required' });
}
```

### Pattern 3: GDPR Consent Tracking
**What:** Explicit consent tracking with timestamp and IP address
**When to use:** When collecting user-generated content for marketing
**Example:**
```typescript
// From existing schema
consentGiven: boolean       // Required before submission
consentTimestamp: DateTime  // When consent was given
consentIpAddress: string    // IP address at time of consent

// Admin UI shows consent status (from admin page.tsx)
{selectedTestimonial.consentGiven ? (
  <CheckCircle2 className="h-4 w-4 text-green-500" />
  <span>Consent given {consentTimestamp}</span>
) : (
  <XCircle className="h-4 w-4 text-red-500" />
  <span>No consent recorded</span>
)}
```

### Pattern 4: Email Notifications for Workflow Actions
**What:** Automated emails at key workflow transitions
**When to use:** For moderation workflows requiring guest interaction
**Example:**
```typescript
// From existing guest-testimonial.ts router

// Rejection notification
await sendEmail({
  to: testimonial.guest.email,
  subject: 'Update on Your Testimonial Submission',
  html: baseEmailTemplate({
    title: 'Testimonial Update',
    content: `
      <p>Unfortunately, we are unable to publish your testimonial.</p>
      <p><strong>Reason:</strong> ${input.reason}</p>
    `
  })
});

// Edit request notification
await sendEmail({
  to: testimonial.guest.email,
  subject: 'Action Required: Please Update Your Testimonial',
  html: baseEmailTemplate({
    title: 'Edit Request',
    content: `
      <p>Before we can publish, we need updates:</p>
      <div>${input.notes}</div>
      <a href="${appUrl}/dashboard/testimonials">Update Testimonial</a>
    `
  })
});
```

### Anti-Patterns to Avoid
- **Auto-publishing without moderation:** Always require admin review before going live (existing workflow enforces this)
- **Insufficient consent tracking:** Track timestamp, IP, and explicit checkbox (existing schema has all fields)
- **Allowing edits after publication:** Lock published testimonials to prevent post-approval changes (existing router enforces state rules)
- **Missing rejection reasons:** Always require admin to provide feedback for rejected content (existing UI enforces 10-char minimum)

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Moderation UI | Custom admin panel from scratch | **Existing implementation** at `/dashboard/admin/cms/testimonials` | Fully functional UI with filtering, queue counts, preview, and all actions |
| Testimonial submission form | Basic HTML form | **Existing component** `TestimonialSubmissionForm` | Type-safe validation, file handling, consent tracking all implemented |
| File uploads | Custom upload handler | Existing `testimonial-storage.ts` with validation | File size limits, type validation, error handling already defined |
| tRPC API procedures | New router | **Existing router** `guestTestimonialRouter` | Complete CRUD operations, all moderation actions, public queries implemented |
| Email templates | Plain text emails | Existing `baseEmailTemplate` helper | Branded templates with proper formatting |
| State machine validation | Manual state checks | Existing tRPC mutations with state validation | Enforces valid transitions (e.g., can't reject published testimonials) |

**Key insight:** Epic 12-5 delivered a production-ready testimonial system. The actual implementation work for Phase 17 is primarily integration and verification, not building from scratch.

## Existing Implementation Analysis

### What Already Exists (HIGH confidence)

**Database Schema** (from `prisma/schema.prisma`):
- Complete `GuestTestimonial` model with all required fields
- Proper enums: `GuestTestimonialType`, `GuestTestimonialStatus`
- GDPR consent fields: `consentGiven`, `consentTimestamp`, `consentIpAddress`
- Moderation fields: `status`, `reviewedAt`, `reviewedBy`, `rejectionReason`, `editRequestNotes`
- Display fields: `isFeatured`, `sortOrder`, `publishedAt`
- Relations to User (guest), optional Booking link

**tRPC API Router** (from `lib/trpc/server/routers/guest-testimonial.ts`):
- **Guest procedures:** `submit`, `myTestimonials`, `updateSubmission`
- **Admin procedures:** `listAll`, `getQueueCounts`, `getById`, `approve`, `publish`, `unpublish`, `reject`, `requestEdits`, `toggleFeatured`, `updateSortOrder`, `delete`
- **Public procedures:** `getPublished`, `getFeatured`
- Email notifications for rejection and edit requests
- Complete input validation with Zod schemas

**Admin UI** (from `app/(dashboard)/dashboard/admin/cms/testimonials/page.tsx`):
- Full moderation dashboard with status filter cards
- Queue counts display (pending, approved, published, rejected, edit requested)
- Search and filter functionality
- Master-detail layout (list + detail panel)
- Action buttons based on current state
- Preview dialog showing public display
- Dialogs for reject/request edits with required notes

**Submission Form Component** (from `components/testimonials/testimonial-submission-form.tsx`):
- Multi-type support (TEXT, VIDEO, BEFORE_AFTER, COMBINED)
- File upload handling (video, before/after photos)
- Form validation with React Hook Form + Zod
- GDPR consent checkbox with detailed disclosure
- Success/submission state UI
- File validation helpers from `testimonial-storage.ts`

**Public Display** (from `app/(marketing)/testimonials/page.tsx`):
- Uses `TestimonialGallery` component
- Filters and pagination
- Public query via `getPublished` tRPC procedure

**Mobile App** (from `mobile/app/(app)/alumni/testimonial.tsx`):
- Alumni-gated submission screen
- Prevents duplicate pending submissions
- Uses `TestimonialForm` component
- Integrates with same tRPC API

### What Needs to Be Built (MEDIUM confidence)

**Guest-facing dashboard page:**
- Route at `/dashboard/testimonials` for logged-in guests
- View own testimonials with status
- Edit capability for EDIT_REQUESTED status
- Link to submission form
- Status explanations (pending review, approved, published, rejected with reason)

**Integration points:**
- Verify mobile app `TestimonialForm` component exists and works
- Ensure file upload to Supabase Storage is connected (current implementation has placeholder)
- Link submission form to guest dashboard
- Add "Share Your Story" CTA in post-trip email sequence

**Optional enhancements:**
- Video thumbnail generation via Mux (if video testimonials are prioritized)
- Automated testimonial request in post-trip email (3-day follow-up)
- Guest notification when testimonial is published

### Migration/Setup Required

**None** - Schema already exists in production database. All models and enums are defined.

If Supabase Storage buckets don't exist:
```sql
-- Create storage bucket for testimonial media
INSERT INTO storage.buckets (id, name, public)
VALUES ('testimonials', 'testimonials', true);

-- Set up RLS policies for testimonials bucket
CREATE POLICY "Authenticated users can upload testimonial media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'testimonials');

CREATE POLICY "Public can view published testimonial media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'testimonials');
```

## Common Pitfalls

### Pitfall 1: Allowing Unreviewed Content to Go Live
**What goes wrong:** Testimonials auto-publish without admin review, risking inappropriate content
**Why it happens:** Developers skip moderation workflow to simplify implementation
**How to avoid:** Existing workflow enforces PENDING → APPROVED → PUBLISHED states. Never bypass.
**Warning signs:** If testimonials appear on public page immediately after submission, state machine is broken

### Pitfall 2: Missing GDPR Consent
**What goes wrong:** Using testimonials without explicit consent exposes legal risk
**Why it happens:** Adding consent checkbox as afterthought, not requiring it
**How to avoid:** Existing form requires `consentGiven: true` before submission. Zod validation enforces this.
**Warning signs:** If checkbox is optional or submission succeeds without consent

### Pitfall 3: File Upload Security Gaps
**What goes wrong:** Users upload malicious files or files that break storage limits
**Why it happens:** Insufficient client and server-side validation
**How to avoid:** Use existing `validateTestimonialFile` from `testimonial-storage.ts`. Enforces file size limits (200MB video, 10MB photos) and MIME type validation.
**Warning signs:** If large files succeed or unexpected file types are stored

### Pitfall 4: Orphaned Media Files
**What goes wrong:** Deleted testimonials leave photos/videos in storage, wasting space
**Why it happens:** Deletion mutations don't clean up associated media files
**How to avoid:** When deleting testimonial, check for `videoUrl`, `beforePhotoUrl`, `afterPhotoUrl` and delete from storage
**Warning signs:** Storage bucket size grows indefinitely despite testimonial deletions

### Pitfall 5: State Transition Validation Gaps
**What goes wrong:** Invalid state transitions (e.g., rejecting already published content)
**Why it happens:** Missing validation in mutation handlers
**How to avoid:** Existing router validates state before transitions. Preserve these checks:
```typescript
// Example from reject mutation
if (testimonial.status !== 'PENDING') {
  throw new TRPCError({
    code: 'BAD_REQUEST',
    message: 'Only pending testimonials can be rejected.',
  });
}
```
**Warning signs:** If admin UI allows illogical actions (reject published, approve rejected)

### Pitfall 6: Poor Mobile Experience
**What goes wrong:** Submission form doesn't work well on mobile
**Why it happens:** Desktop-first design with large file uploads
**How to avoid:** Mobile app has native `TestimonialForm`. For web, test responsive design with actual photo uploads on phones.
**Warning signs:** High abandonment rate on mobile devices, file upload failures

### Pitfall 7: No Guest Feedback Loop
**What goes wrong:** Guests don't know what happened to their submission
**Why it happens:** Missing email notifications or dashboard view
**How to avoid:** Existing router sends rejection and edit request emails. Add published notification too.
**Warning signs:** Guest support tickets asking "What happened to my testimonial?"

## Code Examples

Verified patterns from existing implementation:

### Submit Testimonial (Guest)
```typescript
// From lib/trpc/server/routers/guest-testimonial.ts
const testimonial = await ctx.db.guestTestimonial.create({
  data: {
    guestId: ctx.user.id,
    type: input.type as GuestTestimonialType,
    content: input.content,
    videoUrl: input.videoUrl,
    beforePhotoUrl: input.beforePhotoUrl,
    afterPhotoUrl: input.afterPhotoUrl,
    guestName: input.guestName,
    guestLocation: input.guestLocation,
    packageType: input.packageType,
    tripDate: input.tripDate ? new Date(input.tripDate) : null,
    bookingId: input.bookingId,
    consentGiven: true,
    consentTimestamp: new Date(),
    consentIpAddress: input.consentIpAddress,
    status: 'PENDING',
  },
});
```

### Approve Testimonial (Admin)
```typescript
// From guest-testimonial.ts
const updated = await ctx.db.guestTestimonial.update({
  where: { id: input.id },
  data: {
    status: 'APPROVED',
    reviewedAt: new Date(),
    reviewedBy: ctx.user.id,
    rejectionReason: null, // Clear any previous rejection
  },
});
```

### Request Edits (Admin)
```typescript
// From guest-testimonial.ts
const updated = await ctx.db.guestTestimonial.update({
  where: { id: input.id },
  data: {
    status: 'EDIT_REQUESTED',
    reviewedAt: new Date(),
    reviewedBy: ctx.user.id,
    editRequestNotes: input.notes,
  },
});

// Send email notification
await sendEmail({
  to: testimonial.guest.email,
  subject: 'Action Required: Please Update Your Testimonial',
  html: baseEmailTemplate({
    title: 'Edit Request',
    content: `
      <p>Before we can publish, we need updates:</p>
      <div>${input.notes}</div>
      <a href="${appUrl}/dashboard/testimonials">Update Testimonial</a>
    `
  })
});
```

### Query Published Testimonials (Public)
```typescript
// From guest-testimonial.ts
const testimonials = await ctx.db.guestTestimonial.findMany({
  where: {
    status: 'PUBLISHED' as GuestTestimonialStatus,
    ...(type && { type }),
    ...(packageType && { packageType }),
  },
  orderBy: sortBy === 'featured'
    ? [
        { isFeatured: 'desc' },
        { sortOrder: 'asc' },
        { publishedAt: 'desc' }
      ]
    : [{ publishedAt: 'desc' }],
  take: limit,
  skip: offset,
  select: {
    id: true,
    type: true,
    content: true,
    videoUrl: true,
    videoThumbnail: true,
    beforePhotoUrl: true,
    afterPhotoUrl: true,
    guestName: true,
    guestLocation: true,
    packageType: true,
    tripDate: true,
    isFeatured: true,
    publishedAt: true,
  },
});
```

### File Validation
```typescript
// From lib/storage/testimonial-storage.ts
export const TESTIMONIAL_FILE_LIMITS = {
  VIDEO_MAX_SIZE: 200 * 1024 * 1024, // 200MB
  PHOTO_MAX_SIZE: 10 * 1024 * 1024,  // 10MB
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/quicktime', 'video/webm'],
  ALLOWED_PHOTO_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
};

export function validateTestimonialFile(
  file: { size: number; type: string },
  fileType: 'video' | 'photo'
): { valid: boolean; error?: string } {
  if (fileType === 'video') {
    if (file.size > TESTIMONIAL_FILE_LIMITS.VIDEO_MAX_SIZE) {
      return { valid: false, error: 'Video must be under 200MB' };
    }
    if (!TESTIMONIAL_FILE_LIMITS.ALLOWED_VIDEO_TYPES.includes(file.type)) {
      return { valid: false, error: 'Video must be MP4, MOV, or WebM' };
    }
  } else {
    if (file.size > TESTIMONIAL_FILE_LIMITS.PHOTO_MAX_SIZE) {
      return { valid: false, error: 'Photo must be under 10MB' };
    }
    if (!TESTIMONIAL_FILE_LIMITS.ALLOWED_PHOTO_TYPES.includes(file.type)) {
      return { valid: false, error: 'Photo must be JPEG, PNG, or WebP' };
    }
  }
  return { valid: true };
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Three-state workflow (draft, approved, published) | Five-state workflow (pending, approved, published, rejected, edit_requested) | 2024-2025 | Better guest feedback loop with edit requests vs. hard rejections |
| Auto-publish UGC | Mandatory admin review | Ongoing (GDPR/DSA compliance) | Legal compliance, brand protection |
| Email-only notifications | In-app dashboard + email | 2025-2026 | Better guest visibility into submission status |
| Manual file uploads | Direct-to-storage with signed URLs | 2024+ | Reduced server load, better scalability |

**Deprecated/outdated:**
- **Auto-publishing testimonials:** Regulatory requirements (EU DSA, US state laws) now mandate review for public-facing UGC
- **Cookie-based consent:** GDPR requires explicit opt-in with timestamp and IP tracking (existing schema has this)
- **Single media type:** Modern testimonial systems support video, photos, and text combinations (existing schema supports all)

## Open Questions

Things that couldn't be fully resolved:

1. **File Upload Implementation Status**
   - What we know: `testimonial-storage.ts` exists with validation helpers, form has upload handlers
   - What's unclear: Whether Supabase Storage buckets are configured and upload endpoints are functional
   - Recommendation: Verify Supabase bucket exists, test file upload flow end-to-end. If not working, implement signed URL upload pattern.

2. **Video Processing**
   - What we know: Schema has `videoUrl`, `videoAssetId`, `videoThumbnail` fields suggesting Mux integration was considered
   - What's unclear: Whether Mux is actually integrated or if it's just URL storage
   - Recommendation: For MVP, accept video URLs only (YouTube, Vimeo). For future enhancement, integrate Mux for hosted videos with automatic thumbnail generation.

3. **Mobile App TestimonialForm Component**
   - What we know: Mobile screen imports `TestimonialForm` from `components/alumni/TestimonialForm`
   - What's unclear: Whether this component exists (not in search results)
   - Recommendation: Verify component exists. If not, create React Native version of web submission form using same tRPC mutations.

4. **Post-Trip Email Integration**
   - What we know: Post-trip email sequence exists (Phase 15), testimonials are a logical follow-up
   - What's unclear: Whether testimonial request is part of automated sequence
   - Recommendation: Add testimonial request to 7-day post-trip email with direct link to submission form.

5. **Testimonial Incentives**
   - What we know: No schema fields for rewards/incentives
   - What's unclear: Whether there's a referral points bonus for published testimonials
   - Recommendation: Consider adding `pointsAwarded` field and granting referral points when testimonial is published (gamification).

## Sources

### Primary (HIGH confidence)
- **Project codebase:**
  - `prisma/schema.prisma` - GuestTestimonial model definition (lines 1599-1678)
  - `lib/trpc/server/routers/guest-testimonial.ts` - Complete API router
  - `app/(dashboard)/dashboard/admin/cms/testimonials/page.tsx` - Admin moderation UI
  - `components/testimonials/testimonial-submission-form.tsx` - Guest submission form
  - `app/(marketing)/testimonials/page.tsx` - Public display page
  - `mobile/app/(app)/alumni/testimonial.tsx` - Mobile app screen
  - `lib/storage/testimonial-storage.ts` - File validation helpers

### Secondary (MEDIUM confidence)
- [I Tried 25 Testimonial Software Platforms (These 9 Work Best in 2026)](https://wiserreview.com/blog/testimonial-software/) - Modern testimonial management best practices
- [How to Build a Creative Approval Process That Actually Works](https://www.cloudcampaign.com/smm-tips/creative-approval-process) - Workflow optimization patterns
- [8 Best Outsourced Content Moderation Services (2026 Guide)](https://getstream.io/blog/content-moderation-services/) - Moderation workflow trends
- [Content Moderation: The Definitive 2026 Guide](https://www.webpurify.com/blog/content-moderation-definitive-guide/) - UGC moderation state machines
- [Guide to Moderating User Generated Content](https://curator.io/blog/moderating-user-generated-content) - Pre/post moderation approaches
- [2026 Content Moderation Trends Shaping the Future](https://getstream.io/blog/content-moderation-trends/) - AI-human hybrid workflows
- [Moderation workflows in Optimizely Community API](https://docs.developers.optimizely.com/content-management-system/v1.4.0-community-api/docs/moderation-workflows) - Workflow state definitions

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already integrated and in use
- Architecture: HIGH - Complete implementation exists in codebase
- Pitfalls: HIGH - Based on existing code patterns and industry best practices
- Existing implementation: HIGH - Full feature set verified in codebase
- Integration gaps: MEDIUM - Some uncertainty about file upload and mobile component status

**Research date:** 2026-01-30
**Valid until:** 30 days (2026-03-01) - Testimonial workflow patterns are stable, but verify any new GDPR/DSA compliance requirements
