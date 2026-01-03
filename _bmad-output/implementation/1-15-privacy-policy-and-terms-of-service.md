# Story 1.15: Privacy Policy & Terms of Service

Status: completed

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a site visitor,
I want to read the privacy policy and terms of service,
So that I understand how my data is used and the legal terms of the service.

## Acceptance Criteria

### AC-1: Privacy Policy Page Route and Layout

- [ ] Create page route: `/privacy`
- [ ] Use Next.js App Router structure: `/app/(marketing)/privacy/page.tsx`
- [ ] Page includes proper metadata (title, description, Open Graph tags)
- [ ] Breadcrumb navigation: Home > Privacy Policy
- [ ] Mobile-responsive layout (mobile-first design)
- [ ] WCAG AA accessibility compliance (color contrast, keyboard navigation)
- [ ] Last Updated date displayed prominently at top of page

### AC-2: Terms of Service Page Route and Layout

- [ ] Create page route: `/terms`
- [ ] Use Next.js App Router structure: `/app/(marketing)/terms/page.tsx`
- [ ] Page includes proper metadata (title, description, Open Graph tags)
- [ ] Breadcrumb navigation: Home > Terms of Service
- [ ] Mobile-responsive layout (mobile-first design)
- [ ] WCAG AA accessibility compliance (color contrast, keyboard navigation)
- [ ] Last Updated date displayed prominently at top of page

### AC-3: Markdown Content Structure

- [ ] Create content directory: `/content/legal/`
- [ ] Create Privacy Policy markdown file: `/content/legal/privacy-policy.md`
- [ ] Create Terms of Service markdown file: `/content/legal/terms-of-service.md`
- [ ] Markdown files include YAML frontmatter with:
  - `title`: Page title
  - `lastUpdated`: Date string (YYYY-MM-DD format)
  - `description`: Meta description for SEO
- [ ] Use GitHub Flavored Markdown (GFM) for tables, strikethrough, etc.
- [ ] Content is easily editable by non-developers

### AC-4: Privacy Policy Content Requirements

- [ ] **GDPR Compliance Section:**
  - Data subject rights (access, rectification, erasure, portability)
  - Legal basis for processing (consent, contract, legitimate interest)
  - Data protection officer contact (if applicable)
  - EU-specific provisions
- [ ] **CCPA Compliance Section:**
  - Right to know what data is collected
  - Right to delete personal information
  - Right to opt-out of sale of personal information
  - Non-discrimination for exercising rights
- [ ] **Data Collection Section:**
  - Types of personal data collected (name, email, phone, payment info, medical info)
  - How data is collected (forms, cookies, analytics)
  - Purpose of data collection
- [ ] **Cookie Policy Section:**
  - Types of cookies used (essential, analytics, marketing)
  - How to manage cookie preferences
  - Third-party cookies (Google Analytics, Stripe, etc.)
- [ ] **Third-Party Services Section:**
  - List of third-party services with links to their privacy policies:
    - Stripe (payments)
    - SendGrid (emails)
    - Google Analytics
    - Clerk (authentication)
    - Google reCAPTCHA
  - Data sharing practices
- [ ] **Data Retention Section:**
  - How long data is stored
  - Criteria for retention periods
- [ ] **Contact Information:**
  - Email for privacy inquiries
  - Physical address (if applicable)

### AC-5: Terms of Service Content Requirements

- [ ] **Booking Terms Section:**
  - How bookings are made and confirmed
  - Deposit requirements (typically 25% non-refundable)
  - Full payment timeline (30 days before departure)
  - What's included in packages
  - Booking modifications
- [ ] **Cancellation Policy Section:**
  - Cancellation timeline and refund percentages:
    - 30+ days: 80% refund (minus deposit)
    - 14-30 days: 50% refund
    - Under 14 days: Non-refundable
  - Refund processing time (14 business days)
  - Rescheduling policy (first reschedule free, subsequent $250 fee)
- [ ] **Liability & Disclaimers Section:**
  - Medical procedure disclaimers
  - Travel risks acknowledgment
  - Force majeure provisions
  - Insurance requirements
  - Limitation of liability
- [ ] **Dispute Resolution Section:**
  - Governing law (specify jurisdiction)
  - Arbitration clause (if applicable)
  - Dispute resolution process
  - Contact for disputes
- [ ] **User Responsibilities Section:**
  - Accurate information requirement
  - Medical disclosure requirements
  - Visa and travel document responsibilities
  - Behavior expectations
- [ ] **Intellectual Property:**
  - Website content ownership
  - Trademark notices
- [ ] **Changes to Terms:**
  - How users are notified of changes
  - Effective date of changes

### AC-6: Markdown Rendering Component

- [ ] Use existing `react-markdown` package (already installed)
- [ ] Use `remark-gfm` plugin for GitHub Flavored Markdown support (already installed)
- [ ] Create reusable `LegalPageLayout` component or use inline rendering
- [ ] Style markdown content with Tailwind Typography classes:
  - Headings with proper hierarchy (h1, h2, h3)
  - Lists with proper spacing
  - Links styled with brand colors (#003D5C)
  - Tables styled for readability
- [ ] Table of contents with anchor links to sections
- [ ] Smooth scroll behavior for anchor links

### AC-7: SEO & Metadata

- [ ] Privacy Policy metadata:
  - Title: "Privacy Policy | Pickleball Passport"
  - Description: "Learn how Pickleball Passport protects your privacy. Our policy covers GDPR, CCPA compliance, data collection, cookies, and third-party services."
  - Open Graph image: Generic legal/privacy image
- [ ] Terms of Service metadata:
  - Title: "Terms of Service | Pickleball Passport"
  - Description: "Review Pickleball Passport's terms of service including booking policies, cancellation terms, liability disclaimers, and dispute resolution."
  - Open Graph image: Generic legal/terms image
- [ ] Structured data (JSON-LD) for WebPage schema
- [ ] Canonical URLs:
  - `https://pickleballpassport.com/privacy`
  - `https://pickleballpassport.com/terms`
- [ ] Robots: index, follow (legal pages should be indexable)

### AC-8: Footer Integration

- [ ] Verify footer links to Privacy Policy and Terms of Service work
- [ ] Links should be in the "Legal" column of the footer
- [ ] Links open in same tab (not new window)

### AC-9: Loading & Error States

- [ ] Show loading skeleton while markdown is being processed
- [ ] Handle file not found errors gracefully (404 page)
- [ ] Server-side render for SEO (no client-side markdown loading)

---

## Tasks / Subtasks

- [x] Task 1: Create Content Directory and Markdown Files (AC: 3, 4, 5)
  - [x] Subtask 1.1: Create `/content/legal/` directory
  - [x] Subtask 1.2: Create `privacy-policy.md` with YAML frontmatter
  - [x] Subtask 1.3: Write Privacy Policy content (GDPR, CCPA, cookies, third-party services)
  - [x] Subtask 1.4: Create `terms-of-service.md` with YAML frontmatter
  - [x] Subtask 1.5: Write Terms of Service content (booking, cancellation, liability, disputes)

- [x] Task 2: Create Privacy Policy Page (AC: 1, 6, 7, 9)
  - [x] Subtask 2.1: Create `/app/(marketing)/privacy/page.tsx`
  - [x] Subtask 2.2: Read markdown file using Node.js `fs` module (server component)
  - [x] Subtask 2.3: Parse YAML frontmatter using `gray-matter` package
  - [x] Subtask 2.4: Render markdown with `react-markdown` and `remark-gfm`
  - [x] Subtask 2.5: Add page metadata (title, description, Open Graph)
  - [x] Subtask 2.6: Add breadcrumb navigation
  - [x] Subtask 2.7: Display last updated date
  - [x] Subtask 2.8: Add table of contents with anchor links

- [x] Task 3: Create Terms of Service Page (AC: 2, 6, 7, 9)
  - [x] Subtask 3.1: Create `/app/(marketing)/terms/page.tsx`
  - [x] Subtask 3.2: Read markdown file using Node.js `fs` module (server component)
  - [x] Subtask 3.3: Parse YAML frontmatter using `gray-matter` package
  - [x] Subtask 3.4: Render markdown with `react-markdown` and `remark-gfm`
  - [x] Subtask 3.5: Add page metadata (title, description, Open Graph)
  - [x] Subtask 3.6: Add breadcrumb navigation
  - [x] Subtask 3.7: Display last updated date
  - [x] Subtask 3.8: Add table of contents with anchor links

- [x] Task 4: Styling and Typography (AC: 1, 2, 6)
  - [x] Subtask 4.1: Style markdown content with Tailwind prose classes
  - [x] Subtask 4.2: Ensure brand colors are used for links and headings
  - [x] Subtask 4.3: Style tables for mobile responsiveness
  - [x] Subtask 4.4: Add smooth scroll behavior for anchor links
  - [x] Subtask 4.5: Test on mobile devices (iPhone, Android)

- [x] Task 5: Footer Integration Verification (AC: 8)
  - [x] Subtask 5.1: Verify footer already has Privacy Policy and Terms links
  - [x] Subtask 5.2: Update footer links if needed (should already exist from E1-S14)
  - [x] Subtask 5.3: Test navigation from footer to both pages

- [x] Task 6: Accessibility and Testing (AC: 1, 2)
  - [x] Subtask 6.1: Validate heading hierarchy (h1 > h2 > h3)
  - [x] Subtask 6.2: Test keyboard navigation for anchor links
  - [x] Subtask 6.3: Validate color contrast meets WCAG AA standards
  - [x] Subtask 6.4: TypeScript compilation validation (`npx tsc --noEmit`)
  - [x] Subtask 6.5: Production build test (`npm run build`)

---

## Dev Notes

### Architecture Requirements (MUST FOLLOW)

**Next.js App Router Pattern:**
- Privacy page: `/app/(marketing)/privacy/page.tsx` (server component for SEO)
- Terms page: `/app/(marketing)/terms/page.tsx` (server component for SEO)
- Use marketing route group: `(marketing)` for consistent styling with other marketing pages
- Server components read markdown at build/request time (no client-side loading)

**Markdown Processing:**
- Use `gray-matter` package for YAML frontmatter parsing
- Use `react-markdown` for markdown rendering (already installed)
- Use `remark-gfm` plugin for GitHub Flavored Markdown (already installed)
- Server-side processing ensures SEO friendliness

**Content Directory Pattern:**
- Store legal markdown files in `/content/legal/` directory
- Easy to update by non-developers (just edit markdown files)
- YAML frontmatter for metadata (title, lastUpdated, description)

**Styling Pattern (Tailwind Typography):**
- Use `@tailwindcss/typography` prose classes for markdown styling
- Install plugin if not already present: `npm install @tailwindcss/typography`
- Configure in `tailwind.config.js` under plugins

---

### Reference Files & Patterns

**1. Package Detail Page (Markdown Rendering Reference):**
- **File:** `/components/marketing/package-detail-client.tsx`
- **Pattern:** Uses ReactMarkdown with remark-gfm for rendering package descriptions
- **Key Learnings:**
  ```typescript
  import ReactMarkdown from 'react-markdown';
  import remarkGfm from 'remark-gfm';

  // In component:
  <ReactMarkdown remarkPlugins={[remarkGfm]}>
    {description}
  </ReactMarkdown>
  ```

**2. Trust & Safety Page (Static Content Reference):**
- **File:** `/app/(marketing)/trust-and-safety/page.tsx`
- **Pattern:** Comprehensive metadata, hero section, content sections
- **Key Learnings:**
  - Uses brand colors (#003D5C ocean blue, #D4AF37 gold)
  - Comprehensive SEO metadata with Open Graph and Twitter cards
  - Server component for static content
  - Card-based layout for organized information

**3. Server Component Markdown Loading Pattern:**
```typescript
// app/(marketing)/privacy/page.tsx
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Metadata } from 'next';

// Read markdown file at build time
const getPrivacyContent = () => {
  const filePath = path.join(process.cwd(), 'content/legal/privacy-policy.md');
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const { data: frontmatter, content } = matter(fileContents);
  return { frontmatter, content };
};

export const metadata: Metadata = {
  title: 'Privacy Policy | Pickleball Passport',
  description: 'Learn how Pickleball Passport protects your privacy...',
  // ... other metadata
};

export default function PrivacyPolicyPage() {
  const { frontmatter, content } = getPrivacyContent();

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#003D5C] to-[#005580] text-white py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl font-serif font-bold mb-2">{frontmatter.title}</h1>
          <p className="text-blue-100">Last Updated: {frontmatter.lastUpdated}</p>
        </div>
      </section>

      {/* Content Section */}
      <article className="max-w-4xl mx-auto px-4 py-12">
        <div className="prose prose-lg max-w-none prose-headings:text-[#003D5C] prose-a:text-[#003D5C] prose-a:hover:text-[#D4AF37]">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content}
          </ReactMarkdown>
        </div>
      </article>
    </main>
  );
}
```

**4. YAML Frontmatter Pattern for Markdown Files:**
```markdown
---
title: Privacy Policy
lastUpdated: 2026-01-03
description: Learn how Pickleball Passport protects your privacy and handles your personal data.
---

# Privacy Policy

This Privacy Policy describes how Pickleball Passport ("we", "us", "our")...
```

**5. Table of Contents Generation Pattern:**
```typescript
// Extract headings from markdown for TOC
const extractHeadings = (content: string) => {
  const headingRegex = /^#{2}\s+(.+)$/gm;
  const headings: { text: string; slug: string }[] = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const text = match[1];
    const slug = text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
    headings.push({ text, slug });
  }

  return headings;
};

// Custom heading renderer with anchor IDs
const components = {
  h2: ({ children }) => {
    const slug = String(children).toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
    return <h2 id={slug} className="scroll-mt-20">{children}</h2>;
  },
};
```

---

### Project Structure Notes

**File Locations:**
- Privacy page: `/app/(marketing)/privacy/page.tsx` (NEW)
- Terms page: `/app/(marketing)/terms/page.tsx` (NEW)
- Content directory: `/content/legal/` (NEW)
- Privacy markdown: `/content/legal/privacy-policy.md` (NEW)
- Terms markdown: `/content/legal/terms-of-service.md` (NEW)

**Dependencies to Add:**
```bash
# gray-matter for YAML frontmatter parsing
npm install gray-matter

# Tailwind Typography plugin (if not installed)
npm install @tailwindcss/typography
```

**Tailwind Config Update (if typography not configured):**
```javascript
// tailwind.config.js
module.exports = {
  // ... existing config
  plugins: [
    require('@tailwindcss/typography'),
    // ... other plugins
  ],
}
```

---

### Content Guidelines

**Privacy Policy Structure (Recommended):**
1. Introduction
2. Information We Collect
   - Personal Information
   - Medical Information
   - Payment Information
   - Automatically Collected Data
3. How We Use Your Information
4. Cookies and Tracking Technologies
5. Third-Party Services
6. Data Retention
7. Your Rights (GDPR/CCPA)
8. Data Security
9. International Data Transfers
10. Children's Privacy
11. Changes to This Policy
12. Contact Us

**Terms of Service Structure (Recommended):**
1. Acceptance of Terms
2. Services Description
3. User Accounts
4. Booking and Payment
   - Deposits
   - Full Payment
   - Payment Methods
5. Cancellation and Refunds
6. Rescheduling
7. Medical Disclaimers
8. Travel Responsibilities
9. Liability Limitations
10. Indemnification
11. Intellectual Property
12. Dispute Resolution
13. Governing Law
14. Severability
15. Changes to Terms
16. Contact Information

---

### Security Considerations

**1. No Sensitive Data in Markdown:**
- Don't include real email addresses in markdown (use placeholders)
- Use environment variables for actual contact info if needed
- Review content for accidental exposure of internal processes

**2. Content Updates:**
- Update lastUpdated date whenever content changes
- Consider version history in git for audit trail
- Review with legal counsel before publishing

---

### Common Pitfalls to Avoid

**1. DON'T use client components for legal pages:**
   - Server components are better for SEO
   - Markdown should be processed server-side
   - Legal pages need to be fully crawlable

**2. DON'T forget to install gray-matter:**
   - Required for YAML frontmatter parsing
   - Without it, metadata extraction will fail

**3. DON'T skip the typography plugin:**
   - Prose classes require @tailwindcss/typography
   - Without it, markdown will be unstyled

**4. DON'T hardcode dates in JSX:**
   - Use frontmatter lastUpdated field
   - Makes updates easier and more consistent

**5. DON'T forget anchor IDs for headings:**
   - Required for table of contents navigation
   - Use consistent slug generation

**6. DON'T copy legal content from other sites:**
   - Content should be original or properly licensed
   - Consider legal templates or professional review

---

### Testing Requirements

**Manual Testing Checklist:**

1. **Privacy Policy Page:**
   - [ ] Navigate to `/privacy`
   - [ ] Page loads without errors
   - [ ] Last Updated date is visible
   - [ ] All sections are rendered correctly
   - [ ] Table of contents links work (scroll to section)
   - [ ] Links to third-party privacy policies work
   - [ ] Page is accessible via footer link

2. **Terms of Service Page:**
   - [ ] Navigate to `/terms`
   - [ ] Page loads without errors
   - [ ] Last Updated date is visible
   - [ ] All sections are rendered correctly
   - [ ] Table of contents links work (scroll to section)
   - [ ] Page is accessible via footer link

3. **Mobile Responsiveness:**
   - [ ] Both pages display correctly on mobile (375px)
   - [ ] Text is readable without horizontal scrolling
   - [ ] Tables (if any) are scrollable or responsive
   - [ ] Touch targets are accessible

4. **SEO Validation:**
   - [ ] Check page source for metadata
   - [ ] Open Graph tags present
   - [ ] Canonical URLs correct
   - [ ] Headings have proper hierarchy

5. **Accessibility:**
   - [ ] Heading hierarchy is correct (h1 > h2 > h3)
   - [ ] Links have descriptive text
   - [ ] Color contrast meets WCAG AA
   - [ ] Keyboard navigation works for anchor links

6. **Build & TypeScript Validation:**
   - [ ] Run `npx tsc --noEmit` -> 0 errors
   - [ ] Run `npm run build` -> build succeeds
   - [ ] No console errors in browser

---

### Previous Story Intelligence

**Key Learnings from Trust & Safety Page (E1-S7):**
- Static content pages use comprehensive metadata
- Brand colors: #003D5C (ocean blue), #D4AF37 (gold)
- Hero section with gradient background
- Card-based layout for organized information
- External links with proper rel attributes

**Key Learnings from Contact Form (E1-S13):**
- Marketing pages use `(marketing)` route group
- Proper SEO metadata with Open Graph and Twitter cards
- Mobile-first responsive design
- Toast notifications for user feedback

**Quality Workflow Established:**
- Story -> Implementation -> Code Review -> Fixes
- TypeScript validation required before completion
- Production build testing catches integration issues

---

### Related Stories & Dependencies

**Dependencies (All Complete):**
- E1-S14 (Footer): Footer exists with Legal column (Privacy Policy, Terms of Service links)
- react-markdown: Already installed (v10.1.0)
- remark-gfm: Already installed

**Related Stories:**
- E1-S7 (Trust & Safety): Similar static content page with comprehensive legal/policy information
- E1-S14 (Footer): Contains links to Privacy Policy and Terms of Service

**Potential Blockers:**
- gray-matter package needs to be installed for frontmatter parsing
- @tailwindcss/typography plugin may need to be installed for prose styling

---

### Git Intelligence

**Commit Message Pattern:**
```
feat: Implement E1-S15 Privacy Policy & Terms of Service

- Create /privacy and /terms pages with markdown content
- Add GDPR, CCPA, cookie policy, third-party services sections
- Add booking terms, cancellation policy, liability sections
- Use gray-matter for frontmatter, react-markdown for rendering
- Include table of contents with anchor navigation
```

---

## Dev Agent Record

### Agent Model Used

(To be filled during implementation)

### Debug Log References

(To be filled during implementation)

### Completion Notes List

**Story Creation Summary (2026-01-03):**
- Analyzed existing patterns from trust-and-safety page and contact form
- Confirmed react-markdown and remark-gfm already installed
- Story follows markdown content approach per epics document requirements
- Comprehensive content structure for both GDPR/CCPA and booking terms

**Key Discoveries:**
1. react-markdown v10.1.0 already installed
2. remark-gfm already installed
3. Trust & Safety page provides styling reference
4. Footer already has Legal column (needs link verification)

**Files to Create (6 new):**
1. `/content/legal/privacy-policy.md` - Privacy policy markdown content
2. `/content/legal/terms-of-service.md` - Terms of service markdown content
3. `/app/(marketing)/privacy/page.tsx` - Privacy policy page
4. `/app/(marketing)/terms/page.tsx` - Terms of service page

**Dependencies to Install:**
1. `gray-matter` - For YAML frontmatter parsing
2. `@tailwindcss/typography` - For prose styling (if not already installed)

**Files to Potentially Modify:**
1. `tailwind.config.js` (or `.ts`) - Add typography plugin if needed
2. Footer component - Verify links are correct

**Total Files Impacted:** 4-6 files (4 new, 0-2 modified)

---

## Sources

**Legal Content References:**
- [GDPR Official Text](https://gdpr.eu/)
- [CCPA Official Text](https://oag.ca.gov/privacy/ccpa)
- [Stripe Privacy Policy](https://stripe.com/privacy)
- [SendGrid Privacy Policy](https://sendgrid.com/policies/privacy/)
- [Clerk Privacy Policy](https://clerk.com/legal/privacy)
- [Google Analytics Privacy](https://policies.google.com/privacy)
- [Google reCAPTCHA Terms](https://policies.google.com/privacy)

**Technical References:**
- [react-markdown Documentation](https://github.com/remarkjs/react-markdown)
- [gray-matter Documentation](https://github.com/jonschlinkert/gray-matter)
- [Tailwind Typography Plugin](https://tailwindcss.com/docs/typography-plugin)
