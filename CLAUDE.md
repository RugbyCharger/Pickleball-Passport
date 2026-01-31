# Pickleball Passport - Agent Instructions

This file contains project-specific instructions and learnings for AI agents working on this codebase.

## Project Overview

Pickleball Passport is a Next.js 14 application for organizing and managing pickleball trips to Thailand. It uses:
- **Framework:** Next.js 14 with App Router
- **Database:** Supabase (PostgreSQL) with Prisma ORM
- **Auth:** Clerk
- **Styling:** Tailwind CSS + shadcn/ui
- **API:** tRPC for type-safe APIs
- **Email:** SendGrid
- **SMS:** Twilio
- **Payments:** Stripe
- **Storage:** Supabase Storage

## Key Directories

```
src/
├── app/                    # Next.js App Router pages
├── components/             # React components
│   ├── ui/                 # shadcn/ui components
│   └── [feature]/          # Feature-specific components
├── lib/
│   ├── trpc/               # tRPC router and procedures
│   ├── email/              # Email templates and sending
│   ├── sms/                # SMS sending utilities
│   └── supabase/           # Supabase client
├── server/                 # Server-side code
└── types/                  # TypeScript types
```

## Coding Patterns

### tRPC Procedures
- All API routes use tRPC for type safety
- Admin routes require `adminProcedure` for authentication
- Use `protectedProcedure` for authenticated user routes

### File Uploads
- Use Supabase Storage with signed URLs
- Generate unique filenames with UUID
- Set appropriate content types

### Email Templates
- Templates live in `lib/email/templates/`
- Use React Email for rendering
- All emails should have plain text fallback

## Learnings & Gotchas

<!--
The compound-engineering skill will automatically add learnings here.
Format:
### [Date] - [Topic]
- Learning point
- Gotcha discovered
-->

## Recent Patterns Discovered

<!--
Patterns discovered during development that should be followed.
The nightly compound review will populate this section.
-->

---

*This file is automatically updated by the nightly compound review process.*
*Last updated: 2026-01-31*
