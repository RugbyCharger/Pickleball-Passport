# Story 11-11: Email Template Management

Status: ready-for-dev

## Story

As an admin or marketing team member,
I want to manage, preview, and customize email templates through a web interface,
So that I can update email content, test changes, and maintain brand consistency without requiring developer involvement.

## Acceptance Criteria

### AC-1: Email Template Library (Admin Interface)

- [ ] Admin page: `/admin/communication/email-templates`
- [ ] List all email templates with:
  - Template name and description
  - Category (Transactional, Marketing, Notifications)
  - Last updated date
  - Status (Active, Draft, Archived)
  - Actions: Preview, Edit, Duplicate, Archive
- [ ] Filter templates by:
  - Category (Transactional, Marketing, Notifications, Partner)
  - Status (Active, Draft, Archived)
  - Search by name or content
- [ ] Sort by: Name, Last Updated, Category

### AC-2: Template Editor Interface

- [ ] Page: `/admin/communication/email-templates/[templateId]/edit`
- [ ] WYSIWYG editor for email content with:
  - Rich text formatting (bold, italic, lists, headings)
  - Variable insertion ({{guestName}}, {{bookingReference}}, etc.)
  - Link insertion with tracking
  - Image upload and management
  - Button customization (CTA buttons)
- [ ] Split view: Code editor (HTML) + Visual preview
- [ ] Template metadata fields:
  - Name
  - Description
  - Subject line (with variable support)
  - Preheader text
  - Category dropdown
  - Status toggle (Active/Draft)
- [ ] Variable reference panel showing available variables for template type

### AC-3: Template Preview & Testing

- [ ] Live preview panel (desktop + mobile views)
- [ ] Test email functionality:
  - "Send Test Email" button
  - Enter recipient email address
  - Sample data auto-populated for variables
  - Option to customize test data
- [ ] Preview with different variable combinations
- [ ] HTML/Plain text view toggle
- [ ] Mobile responsiveness check

### AC-4: Template Variable System

- [ ] Define variable sets for each template type:
  - **Booking Templates**: {{guestName}}, {{bookingReference}}, {{tripName}}, {{tripDates}}, {{totalAmount}}, {{packageDetails}}
  - **Payment Templates**: {{paymentAmount}}, {{paymentMethod}}, {{nextPaymentDate}}, {{remainingBalance}}
  - **Partner Templates**: {{partnerName}}, {{pointsEarned}}, {{currentTier}}, {{referralName}}, {{commissionAmount}}
  - **Admin Templates**: {{bookingCount}}, {{totalRevenue}}, {{alertType}}, {{guestDetails}}
- [ ] Variable syntax: `{{variableName}}` (double curly braces)
- [ ] Fallback values for missing variables
- [ ] Conditional blocks: `{{#if variable}}...{{/if}}`
- [ ] Loops for lists: `{{#each items}}...{{/each}}`

### AC-5: Base Template Management

- [ ] Manage base template (header, footer, branding)
- [ ] Edit global template elements:
  - Logo
  - Brand colors (primary, secondary, accent)
  - Header content
  - Footer content (links, social media, unsubscribe)
  - Typography settings (font family, sizes)
- [ ] All templates inherit from base template
- [ ] Preview base template changes across all templates

### AC-6: Template Version History

- [ ] Track template version history
- [ ] View previous versions:
  - Timestamp
  - Editor name
  - Changes summary
- [ ] Compare versions (side-by-side diff)
- [ ] Restore previous version
- [ ] Limit: Keep last 10 versions per template

### AC-7: Template Categories & Organization

- [ ] Predefined categories:
  - **Transactional**: Booking confirmation, payment receipt, password reset
  - **Marketing**: Pre-trip nurture, post-trip follow-up, alumni engagement
  - **Notifications**: Admin alerts, partner notifications
  - **System**: Welcome, account verification
- [ ] Custom tags for additional organization
- [ ] Template duplication (create new from existing)
- [ ] Template archiving (hide from active list, retain data)

### AC-8: SendGrid Integration

- [ ] Sync templates with SendGrid dynamic templates
- [ ] Options:
  - Use code-based templates (current approach)
  - Use SendGrid dynamic templates (upload HTML to SendGrid)
- [ ] For MVP: Export template HTML for SendGrid upload
- [ ] Export button: Download HTML file
- [ ] Copy HTML to clipboard button
- [ ] Instructions for uploading to SendGrid

### AC-9: Template Analytics Dashboard

- [ ] View template performance metrics:
  - Sent count (last 30 days)
  - Open rate
  - Click-through rate (CTR)
  - Unsubscribe rate
  - Bounce rate
- [ ] Link to SendGrid analytics for detailed insights
- [ ] Display metrics per template on template list
- [ ] Sort templates by performance metrics

### AC-10: Email Design System

- [ ] Component library for email templates:
  - Hero section (image + headline + CTA)
  - Text block (paragraph with formatting)
  - Button (primary, secondary, text styles)
  - Image block (with caption)
  - Social media links
  - Footer
  - Divider/Spacer
- [ ] Drag-and-drop component insertion (future enhancement)
- [ ] For MVP: Insert component code snippets

### AC-11: Template Validation & Testing

- [ ] Pre-send validation:
  - Check all variables have sample data
  - Validate HTML structure
  - Check for broken links
  - Verify CTA buttons exist
  - Subject line length check (<50 chars recommended)
- [ ] Email client compatibility check (basic HTML validation)
- [ ] Spam score check (basic keyword analysis)
- [ ] Plain text version auto-generation
- [ ] Accessibility check (alt text for images, semantic HTML)

### AC-12: Permissions & Workflow

- [ ] Role-based access control:
  - **Admin**: Full access (create, edit, delete, publish)
  - **Marketing**: Edit and preview (cannot publish)
  - **Developer**: Full access
- [ ] Draft/Publish workflow:
  - Create template → Save as Draft
  - Preview and test
  - Publish (makes template active)
- [ ] Require approval for transactional template changes (future)

### AC-13: Integration with Existing Templates

- [ ] Import existing code-based templates into management system
- [ ] Map current template files to database records:
  - `lib/email/templates/booking-confirmation.ts` → DB record
  - Parse variables from template code
  - Extract subject, HTML, text content
- [ ] Maintain backward compatibility with code-based templates
- [ ] Migration script to populate database with existing templates

### AC-14: Testing & Quality Assurance

- [ ] Unit tests for template rendering
- [ ] Integration tests for template CRUD operations
- [ ] Test variable substitution
- [ ] Test email sending with custom templates
- [ ] Verify SendGrid integration
- [ ] Test template versioning (save, restore)
- [ ] Test permissions (admin vs marketing roles)
- [ ] Verify analytics data display

## Implementation Details

### Files to Create

1. **app/admin/communication/email-templates/page.tsx** (NEW)
   - Template library list view
   - Filter and search functionality
   - Template card grid with actions

2. **app/admin/communication/email-templates/[templateId]/edit/page.tsx** (NEW)
   - Template editor interface
   - WYSIWYG editor integration
   - Preview panel (desktop/mobile)
   - Test email functionality

3. **app/admin/communication/email-templates/[templateId]/preview/page.tsx** (NEW)
   - Full-screen template preview
   - Variable data customization for preview

4. **app/admin/communication/email-templates/base/page.tsx** (NEW)
   - Base template editor
   - Global branding settings
   - Preview across all templates

5. **components/admin/email-templates/template-editor.tsx** (NEW)
   - Rich text editor component
   - Variable insertion toolbar
   - Code/visual toggle

6. **components/admin/email-templates/variable-panel.tsx** (NEW)
   - List available variables
   - Click to insert into editor
   - Example data display

7. **components/admin/email-templates/preview-panel.tsx** (NEW)
   - Live preview with sample data
   - Desktop/mobile toggle
   - HTML/Plain text toggle

8. **components/admin/email-templates/test-email-dialog.tsx** (NEW)
   - Modal for sending test email
   - Recipient email input
   - Sample data customization

9. **lib/email/template-renderer.ts** (NEW)
   - Variable substitution engine
   - Conditional block rendering
   - Loop rendering
   - Handlebars-style syntax support

10. **lib/email/template-validator.ts** (NEW)
    - Validate template HTML structure
    - Check for broken links
    - Variable validation
    - Spam score calculation

11. **lib/email/base-template-manager.ts** (NEW)
    - Manage base template (header/footer)
    - Apply base template to content templates
    - Global branding settings

12. **lib/trpc/server/routers/email-template.ts** (NEW)
    - tRPC router for template management
    - Mutations: create, update, delete, duplicate, archive
    - Queries: getAll, getById, getByCategory
    - Version management

### Files to Modify

1. **prisma/schema.prisma**
   - Add `EmailTemplate` model:
     - `id`, `name`, `description`, `category`, `status`
     - `subjectLine`, `preheaderText`, `htmlContent`, `textContent`
     - `variables` (JSON - list of available variables)
     - `baseTemplateId` (relation to base template)
     - `createdBy`, `updatedBy`, `createdAt`, `updatedAt`
   - Add `EmailTemplateVersion` model (version history)
   - Add `EmailTemplateAnalytics` model (metrics tracking)
   - Migration: `npx prisma migrate dev --name add-email-templates`

2. **lib/email/sendgrid.ts**
   - Add function: `renderTemplate(templateId, variables)`
   - Fetch template from database
   - Substitute variables
   - Return rendered HTML and text

3. **lib/trpc/server/routers/admin.ts**
   - Import email-template router
   - Add to admin router: `emailTemplates: emailTemplateRouter`

4. **app/admin/communication/layout.tsx** (NEW or modify existing)
   - Navigation tabs: Email Templates, WhatsApp Groups, Broadcast
   - Shared layout for communication section

### Database Schema

```typescript
// prisma/schema.prisma

model EmailTemplate {
  id          String   @id @default(cuid())
  name        String   // "Booking Confirmation Email"
  slug        String   @unique // "booking-confirmation"
  description String?  // "Sent after guest completes booking"
  category    EmailTemplateCategory
  status      EmailTemplateStatus @default(DRAFT)

  // Content
  subjectLine    String  // "Your Pickleball Passport Booking Confirmed!"
  preheaderText  String? // Preview text shown in inbox
  htmlContent    String  @db.Text // Full HTML content
  textContent    String  @db.Text // Plain text version
  variables      Json    // ["guestName", "bookingReference", "tripName"]

  // Branding
  baseTemplateId String?
  baseTemplate   EmailTemplate? @relation("TemplateToBase", fields: [baseTemplateId], references: [id])
  childTemplates EmailTemplate[] @relation("TemplateToBase")

  // Metadata
  createdBy String
  updatedBy String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  versions EmailTemplateVersion[]
  analytics EmailTemplateAnalytics?

  @@index([category])
  @@index([status])
}

enum EmailTemplateCategory {
  TRANSACTIONAL   // Booking, payment, account
  MARKETING       // Pre-trip, post-trip, promotions
  NOTIFICATIONS   // Admin alerts, partner notifications
  SYSTEM          // Welcome, verification, password reset
}

enum EmailTemplateStatus {
  DRAFT    // In progress, not live
  ACTIVE   // Published and in use
  ARCHIVED // No longer in use
}

model EmailTemplateVersion {
  id         String   @id @default(cuid())
  templateId String
  template   EmailTemplate @relation(fields: [templateId], references: [id], onDelete: Cascade)

  versionNumber Int      // 1, 2, 3...
  content       Json     // Snapshot of template at this version
  changesSummary String? // What changed in this version
  createdBy     String
  createdAt     DateTime @default(now())

  @@index([templateId])
  @@unique([templateId, versionNumber])
}

model EmailTemplateAnalytics {
  id         String   @id @default(cuid())
  templateId String   @unique
  template   EmailTemplate @relation(fields: [templateId], references: [id], onDelete: Cascade)

  // Metrics (last 30 days)
  sentCount      Int @default(0)
  openCount      Int @default(0)
  clickCount     Int @default(0)
  bounceCount    Int @default(0)
  unsubscribeCount Int @default(0)

  // Calculated rates
  openRate       Float? // openCount / sentCount
  clickRate      Float? // clickCount / sentCount
  bounceRate     Float? // bounceCount / sentCount
  unsubscribeRate Float? // unsubscribeCount / sentCount

  lastUpdatedAt DateTime @updatedAt

  @@index([templateId])
}
```

### Template Renderer

```typescript
// lib/email/template-renderer.ts
import Handlebars from 'handlebars';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';

interface TemplateVariables {
  [key: string]: any;
}

/**
 * Render email template with variable substitution
 */
export async function renderEmailTemplate(
  templateId: string,
  variables: TemplateVariables
): Promise<{ html: string; text: string; subject: string }> {
  // Fetch template from database
  const template = await db.emailTemplate.findUnique({
    where: { id: templateId },
    include: { baseTemplate: true },
  });

  if (!template) {
    throw new Error(`Email template not found: ${templateId}`);
  }

  if (template.status !== 'ACTIVE') {
    logger.warn({ templateId }, 'Attempting to use non-active template');
  }

  // Apply base template if exists
  let htmlContent = template.htmlContent;
  if (template.baseTemplate) {
    htmlContent = applyBaseTemplate(
      template.baseTemplate.htmlContent,
      htmlContent
    );
  }

  // Compile templates with Handlebars
  const htmlTemplate = Handlebars.compile(htmlContent);
  const textTemplate = Handlebars.compile(template.textContent);
  const subjectTemplate = Handlebars.compile(template.subjectLine);

  // Render with variables
  const html = htmlTemplate(variables);
  const text = textTemplate(variables);
  const subject = subjectTemplate(variables);

  return { html, text, subject };
}

/**
 * Apply base template (header/footer) to content
 */
function applyBaseTemplate(baseHtml: string, contentHtml: string): string {
  // Replace {{content}} placeholder in base with actual content
  return baseHtml.replace('{{content}}', contentHtml);
}

/**
 * Validate template has all required variables
 */
export function validateTemplateVariables(
  requiredVariables: string[],
  providedVariables: TemplateVariables
): { valid: boolean; missing: string[] } {
  const missing = requiredVariables.filter(
    (varName) => !(varName in providedVariables)
  );

  return {
    valid: missing.length === 0,
    missing,
  };
}
```

### tRPC Router for Template Management

```typescript
// lib/trpc/server/routers/email-template.ts
import { z } from 'zod';
import { router, protectedProcedure, adminProcedure } from '../trpc';
import { db } from '@/lib/db';
import { TRPCError } from '@trpc/server';

export const emailTemplateRouter = router({
  /**
   * Get all email templates (with optional filtering)
   */
  getAll: adminProcedure
    .input(
      z.object({
        category: z.enum(['TRANSACTIONAL', 'MARKETING', 'NOTIFICATIONS', 'SYSTEM']).optional(),
        status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const { category, status, search } = input;

      const templates = await db.emailTemplate.findMany({
        where: {
          category,
          status,
          ...(search && {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
            ],
          }),
        },
        include: {
          analytics: true,
        },
        orderBy: {
          updatedAt: 'desc',
        },
      });

      return templates;
    }),

  /**
   * Get single template by ID
   */
  getById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const template = await db.emailTemplate.findUnique({
        where: { id: input.id },
        include: {
          baseTemplate: true,
          versions: {
            orderBy: { versionNumber: 'desc' },
            take: 10,
          },
          analytics: true,
        },
      });

      if (!template) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Email template not found',
        });
      }

      return template;
    }),

  /**
   * Create new email template
   */
  create: adminProcedure
    .input(
      z.object({
        name: z.string(),
        slug: z.string(),
        description: z.string().optional(),
        category: z.enum(['TRANSACTIONAL', 'MARKETING', 'NOTIFICATIONS', 'SYSTEM']),
        subjectLine: z.string(),
        preheaderText: z.string().optional(),
        htmlContent: z.string(),
        textContent: z.string(),
        variables: z.array(z.string()),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const template = await db.emailTemplate.create({
        data: {
          ...input,
          createdBy: ctx.user.id,
          updatedBy: ctx.user.id,
          status: 'DRAFT',
        },
      });

      return template;
    }),

  /**
   * Update email template
   */
  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
        category: z.enum(['TRANSACTIONAL', 'MARKETING', 'NOTIFICATIONS', 'SYSTEM']).optional(),
        status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).optional(),
        subjectLine: z.string().optional(),
        preheaderText: z.string().optional(),
        htmlContent: z.string().optional(),
        textContent: z.string().optional(),
        variables: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...updateData } = input;

      // Save current version to history before updating
      const currentTemplate = await db.emailTemplate.findUnique({
        where: { id },
        include: { versions: true },
      });

      if (!currentTemplate) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Email template not found',
        });
      }

      // Create version snapshot
      await db.emailTemplateVersion.create({
        data: {
          templateId: id,
          versionNumber: currentTemplate.versions.length + 1,
          content: {
            subjectLine: currentTemplate.subjectLine,
            htmlContent: currentTemplate.htmlContent,
            textContent: currentTemplate.textContent,
          },
          createdBy: ctx.user.id,
        },
      });

      // Update template
      const updated = await db.emailTemplate.update({
        where: { id },
        data: {
          ...updateData,
          updatedBy: ctx.user.id,
        },
      });

      return updated;
    }),

  /**
   * Duplicate email template
   */
  duplicate: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const original = await db.emailTemplate.findUnique({
        where: { id: input.id },
      });

      if (!original) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Email template not found',
        });
      }

      const duplicate = await db.emailTemplate.create({
        data: {
          name: `${original.name} (Copy)`,
          slug: `${original.slug}-copy-${Date.now()}`,
          description: original.description,
          category: original.category,
          status: 'DRAFT',
          subjectLine: original.subjectLine,
          preheaderText: original.preheaderText,
          htmlContent: original.htmlContent,
          textContent: original.textContent,
          variables: original.variables,
          baseTemplateId: original.baseTemplateId,
          createdBy: ctx.user.id,
          updatedBy: ctx.user.id,
        },
      });

      return duplicate;
    }),

  /**
   * Send test email with template
   */
  sendTestEmail: adminProcedure
    .input(
      z.object({
        templateId: z.string(),
        recipientEmail: z.string().email(),
        testVariables: z.record(z.any()),
      })
    )
    .mutation(async ({ input }) => {
      const { templateId, recipientEmail, testVariables } = input;

      // Import template renderer and email sender
      const { renderEmailTemplate } = await import('@/lib/email/template-renderer');
      const { sendEmail } = await import('@/lib/email/sendgrid');

      const { html, text, subject } = await renderEmailTemplate(
        templateId,
        testVariables
      );

      await sendEmail({
        to: recipientEmail,
        subject: `[TEST] ${subject}`,
        html,
        text,
      });

      return { success: true };
    }),
});
```

### Admin Template Editor Component

```typescript
// components/admin/email-templates/template-editor.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { api } from '@/lib/trpc/client';
import { VariablePanel } from './variable-panel';
import { PreviewPanel } from './preview-panel';
import { TestEmailDialog } from './test-email-dialog';

export function TemplateEditor({ templateId }: { templateId?: string }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('TRANSACTIONAL');
  const [subjectLine, setSubjectLine] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [textContent, setTextContent] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [showTestDialog, setShowTestDialog] = useState(false);

  // Load existing template if editing
  const { data: template } = api.emailTemplate.getById.useQuery(
    { id: templateId! },
    { enabled: !!templateId }
  );

  const saveTemplate = api.emailTemplate.update.useMutation();

  const handleSave = async (status: 'DRAFT' | 'ACTIVE') => {
    await saveTemplate.mutateAsync({
      id: templateId!,
      name,
      category,
      subjectLine,
      htmlContent,
      textContent,
      status,
    });

    alert('Template saved successfully!');
  };

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Editor Column */}
      <div className="col-span-7">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Template Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <Select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="TRANSACTIONAL">Transactional</option>
              <option value="MARKETING">Marketing</option>
              <option value="NOTIFICATIONS">Notifications</option>
              <option value="SYSTEM">System</option>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Subject Line</label>
            <Input
              value={subjectLine}
              onChange={(e) => setSubjectLine(e.target.value)}
              placeholder="Your Booking Confirmed! {{guestName}}"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">HTML Content</label>
            <Textarea
              value={htmlContent}
              onChange={(e) => setHtmlContent(e.target.value)}
              rows={20}
              className="font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Plain Text Version</label>
            <Textarea
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              rows={10}
              className="font-mono text-sm"
            />
          </div>

          <div className="flex gap-3">
            <Button onClick={() => handleSave('DRAFT')} variant="outline">
              Save as Draft
            </Button>
            <Button onClick={() => handleSave('ACTIVE')}>
              Publish
            </Button>
            <Button onClick={() => setShowPreview(!showPreview)} variant="outline">
              Toggle Preview
            </Button>
            <Button onClick={() => setShowTestDialog(true)} variant="outline">
              Send Test Email
            </Button>
          </div>
        </div>
      </div>

      {/* Sidebar Column */}
      <div className="col-span-5 space-y-6">
        {/* Variable Panel */}
        <VariablePanel
          category={category}
          onInsertVariable={(variable) => {
            setHtmlContent((prev) => prev + `{{${variable}}}`);
          }}
        />

        {/* Preview Panel */}
        {showPreview && (
          <PreviewPanel
            htmlContent={htmlContent}
            testVariables={{
              guestName: 'John Doe',
              bookingReference: 'PBP-12345',
              tripName: 'Thailand Transformation',
            }}
          />
        )}
      </div>

      {/* Test Email Dialog */}
      {showTestDialog && (
        <TestEmailDialog
          templateId={templateId}
          onClose={() => setShowTestDialog(false)}
        />
      )}
    </div>
  );
}
```

### Testing Checklist

- [ ] Can create new email template
- [ ] Can edit existing template
- [ ] Can duplicate template
- [ ] Can archive template
- [ ] Variable substitution works correctly
- [ ] Preview shows accurate rendered output
- [ ] Test email sends successfully
- [ ] Version history tracks changes
- [ ] Can restore previous version
- [ ] Base template applies to all child templates
- [ ] Analytics data displays correctly
- [ ] Filter and search work
- [ ] Permissions enforce admin-only access
- [ ] HTML validation catches errors
- [ ] Plain text auto-generation works
- [ ] SendGrid export functionality works

## Dev Notes

### Architecture Compliance

**Database-Driven Templates:**
- Store all templates in database (Prisma)
- Version control for template changes
- Analytics tracking per template
- Base template inheritance system

**Template Rendering:**
- Use Handlebars for variable substitution
- Support conditional blocks and loops
- Maintain backward compatibility with code-based templates
- Plain text auto-generation from HTML

**Admin Interface:**
- Rich WYSIWYG editor (TipTap or similar)
- Live preview with sample data
- Test email functionality
- Version history and comparison

**Error Handling:**
- Validate templates before saving
- Check for broken variables
- Spam score warnings
- Email client compatibility checks

### Library & Framework Requirements

**New Dependencies:**
```bash
npm install handlebars  # Template engine for variable substitution
npm install @tiptap/react @tiptap/starter-kit  # WYSIWYG editor
npm install juice  # Inline CSS for email compatibility
npm install html-to-text  # Auto-generate plain text from HTML
```

**Existing Dependencies (Reuse):**
- SendGrid - Already installed
- Prisma - Already installed
- tRPC - Already installed
- Tailwind CSS - Already installed

### Integration Points

1. **Existing Email Templates (High Priority)**
   - Location: `lib/email/templates/*.ts`
   - Action: Migrate to database records
   - Script: Create migration script to populate EmailTemplate table
   - Status: Migration needed

2. **Email Sending (High Priority)**
   - Location: `lib/email/sendgrid.ts`
   - Modification: Use `renderEmailTemplate()` for database templates
   - Fallback: Code-based templates if template not in database
   - Status: Service update needed

3. **Admin Dashboard (Medium Priority)**
   - Location: `/admin` dashboard
   - Action: Add "Email Templates" section to navigation
   - Status: Navigation update needed

### Previous Story Intelligence

**From Story 11-2 (Booking Confirmation Email):**
- Existing email template structure
- SendGrid integration pattern
- Variable substitution needs

**From Story 11-4 (Pre-Trip Email Sequence):**
- Multiple email templates with scheduling
- Nurture sequence pattern
- Template reuse opportunities

**From Story 11-5 (Payment Receipt Email):**
- Payment-related templates
- Receipt generation pattern

**From Story 11-8 (Admin Email Alerts):**
- Admin-focused templates
- Alert template structure

**From Story 11-9 (Partner Notification System):**
- Partner email templates
- Multi-audience template management

**Key Patterns to Follow:**
1. Database-driven content management
2. Version control for safety
3. WYSIWYG editing for non-developers
4. Test email functionality
5. Analytics integration
6. Role-based access control

### Email Template Best Practices

**Design:**
- Mobile-first responsive design
- Max width: 600px for desktop email clients
- Inline CSS (use `juice` package)
- Fallback fonts for email clients
- High contrast for accessibility

**Content:**
- Clear, scannable content
- Strong call-to-action buttons
- Personalization with variables
- Plain text fallback always

**Deliverability:**
- Avoid spam trigger words
- Include unsubscribe link
- Use verified sender domain
- Test across email clients (Litmus/Email on Acid)

**Performance:**
- Optimize images (compress, use CDN)
- Minimize HTML/CSS bloat
- Fast loading for mobile

### References

**Architecture:**
- [Architecture Doc](../../solutioning/architecture-Pickleball-Passport-2025-12-28.md) - Communication system and admin tools

**Previous Stories:**
- [Story 11-2](./11-2-booking-confirmation-email.md) - Booking email template
- [Story 11-4](./11-4-pre-trip-email-sequence.md) - Email sequence templates
- [Story 11-5](./11-5-payment-receipt-email.md) - Payment email template
- [Story 11-8](./11-8-admin-email-alerts.md) - Admin alert templates
- [Story 11-9](./11-9-partner-notification-system.md) - Partner email templates

**Existing Code:**
- `lib/email/sendgrid.ts` - SendGrid service
- `lib/email/templates/*.ts` - Existing email templates
- `lib/email/templates/base.ts` - Base template system

**External Documentation:**
- Handlebars: https://handlebarsjs.com/
- TipTap: https://tiptap.dev/
- SendGrid Dynamic Templates: https://docs.sendgrid.com/ui/sending-email/how-to-send-an-email-with-dynamic-templates

## Dependencies

- E11-S1: SendGrid Integration (done) ✅ - Email sending infrastructure
- E11-S2: Booking Confirmation Email (done) ✅ - Example template structure
- E5-S7: Admin Dashboard (done) ✅ - Admin interface foundation

## Story Points

3 points

**Breakdown:**
- Database schema & models (0.5 pt) - EmailTemplate, Version, Analytics models
- Template editor UI (1 pt) - Admin interface with WYSIWYG editor
- Template renderer (0.5 pt) - Handlebars integration, variable substitution
- tRPC router (0.5 pt) - CRUD operations, test email sending
- Migration script (0.25 pt) - Import existing templates
- Testing & polish (0.25 pt) - Unit tests, integration verification

## Priority

P2 - Medium

**Rationale:**
- Enables non-developers to manage email content
- Reduces developer dependency for content updates
- Improves brand consistency and testing
- Not critical for MVP (code-based templates work)
- High value for marketing team autonomy
- Can be implemented incrementally (start with read-only, add editing later)
- Future-proofs email management as business scales
