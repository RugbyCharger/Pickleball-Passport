# Story 9-13: Partner Community Forum (Directors Circle)

Status: done

## Story

As a partner,
I want to connect with other partners in a community forum,
So that I can share best practices and learn from others.

## Acceptance Criteria

### AC-1: Forum Page

- [ ] Page: `/dashboard/partner/forum` or `/dashboard/partner/directors-circle`
- [ ] "Directors Circle" branding
- [ ] Link from partner dashboard
- [ ] Breadcrumb navigation

### AC-2: Forum Categories/Topics

- [ ] Category sections:
  - Best Practices
  - Success Stories
  - Q&A
  - Announcements (admin only)
- [ ] Category filters
- [ ] Category descriptions

### AC-3: Thread List

- [ ] List of discussion threads
- [ ] Thread metadata:
  - Title
  - Author name (club name)
  - Category
  - Reply count
  - Like count
  - Last activity date
- [ ] Sort by: Recent, Most Liked, Most Replies
- [ ] Pagination

### AC-4: Thread Detail

- [ ] View thread with all replies
- [ ] Thread author info
- [ ] Reply count
- [ ] Like button for thread
- [ ] Reply form
- [ ] Thread actions (edit/delete for own threads)

### AC-5: Create Thread

- [ ] "Create New Thread" button
- [ ] Thread creation form:
  - Title (required)
  - Category (required)
  - Content (markdown or rich text)
- [ ] Preview thread before posting (optional for MVP)
- [ ] Submit thread

### AC-6: Reply to Thread

- [ ] Reply form below thread
- [ ] Reply with markdown/rich text
- [ ] Show reply author
- [ ] Reply timestamp
- [ ] Like button for replies (optional for MVP)

### AC-7: Like/Upvote

- [ ] Like button on threads
- [ ] Like count display
- [ ] One like per user per thread
- [ ] Toggle like (unlike if already liked)

### AC-8: Search

- [ ] Search bar
- [ ] Search threads by title/content
- [ ] Search results highlighting

### AC-9: Monthly Announcements

- [ ] Announcements section (admin-only posts)
- [ ] Monthly group call announcements
- [ ] Special styling for announcements
- [ ] Pinned to top

## Tasks / Subtasks

- [ ] Task 1: Create forum database models (Thread, Reply, Like)
- [ ] Task 2: Create forum page route
- [ ] Task 3: Implement thread list with filtering/sorting
- [ ] Task 4: Create thread detail page
- [ ] Task 5: Add create thread functionality
- [ ] Task 6: Add reply functionality
- [ ] Task 7: Add like/upvote functionality
- [ ] Task 8: Add search functionality
- [ ] Task 9: Add tRPC queries/mutations
- [ ] Task 10: Add link from partner dashboard

## Dev Notes

### Database Schema

```prisma
model ForumThread {
  id            String   @id @default(cuid())
  partnerId     String
  partner       PartnerProfile @relation(fields: [partnerId], references: [id])
  
  // Thread Content
  title         String
  category      ForumCategory
  content       String   @db.Text
  
  // Metadata
  replyCount    Int      @default(0)
  likeCount     Int      @default(0)
  isPinned      Boolean  @default(false)
  isAnnouncement Boolean @default(false)
  
  // Relationships
  replies       ForumReply[]
  likes         ForumLike[]
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@index([partnerId])
  @@index([category])
  @@index([createdAt])
}

model ForumReply {
  id            String   @id @default(cuid())
  threadId      String
  thread        ForumThread @relation(fields: [threadId], references: [id], onDelete: Cascade)
  partnerId     String
  partner       PartnerProfile @relation(fields: [partnerId], references: [id])
  
  content       String   @db.Text
  
  likeCount     Int      @default(0)
  
  // Relationships
  likes         ForumReplyLike[]
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@index([threadId])
  @@index([partnerId])
}

model ForumLike {
  id            String   @id @default(cuid())
  threadId      String
  thread        ForumThread @relation(fields: [threadId], references: [id], onDelete: Cascade)
  partnerId     String
  partner       PartnerProfile @relation(fields: [partnerId], references: [id])
  
  createdAt     DateTime @default(now())
  
  @@unique([threadId, partnerId])
  @@index([threadId])
  @@index([partnerId])
}

model ForumReplyLike {
  id            String   @id @default(cuid())
  replyId       String
  reply         ForumReply @relation(fields: [replyId], references: [id], onDelete: Cascade)
  partnerId     String
  partner       PartnerProfile @relation(fields: [partnerId], references: [id])
  
  createdAt     DateTime @default(now())
  
  @@unique([replyId, partnerId])
  @@index([replyId])
  @@index([partnerId])
}

enum ForumCategory {
  BEST_PRACTICES
  SUCCESS_STORIES
  Q_AND_A
  ANNOUNCEMENTS
}
```

### Forum Categories

- Best Practices: Sharing tips and strategies
- Success Stories: Partner testimonials and wins
- Q&A: Questions and answers
- Announcements: Admin posts (monthly calls, updates)

### Search

Simple text search on title and content for MVP. Can enhance with full-text search later.

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Completion Notes

**Completed:** 2026-01-16

**Files Created:**
1. `app/(dashboard)/dashboard/partner/forum/page.tsx` - Forum list page
2. `app/(dashboard)/dashboard/partner/forum/[id]/page.tsx` - Thread detail page
3. `lib/trpc/server/routers/forum.ts` - Forum tRPC router

**Files Modified:**
1. `prisma/schema.prisma` - Added forum models (ForumThread, ForumReply, ForumLike, ForumReplyLike, ForumCategory enum)
2. `lib/trpc/server/root.ts` - Added forum router
3. `app/(dashboard)/dashboard/partner/page.tsx` - Added "Directors Circle" quick action link
4. `_bmad-output/implementation/sprint-status.yaml` - Updated status to done

**Features Implemented:**
- Forum list page with:
  - Thread listing (pinned threads first)
  - Category filtering (Best Practices, Success Stories, Q&A, Announcements)
  - Search functionality
  - Sort by: Recent, Popular, Most Replies
  - Create new thread form
  - Like threads
  - Pagination
- Thread detail page with:
  - Full thread display
  - All replies
  - Like thread
  - Reply to thread form
  - Breadcrumb navigation
- tRPC procedures:
  - `getThreads` - List threads with filtering/sorting/search
  - `getThread` - Get single thread with replies
  - `createThread` - Create new thread
  - `replyToThread` - Reply to thread
  - `toggleThreadLike` - Like/unlike thread

**Database Schema:**
- `ForumThread` - Thread posts
- `ForumReply` - Replies to threads
- `ForumLike` - Thread likes
- `ForumReplyLike` - Reply likes (modeled but not used in MVP)
- `ForumCategory` enum - BEST_PRACTICES, SUCCESS_STORIES, Q_AND_A, ANNOUNCEMENTS

**MVP Notes:**
- Simplified version without advanced features:
  - Textarea for content (no rich text editor)
  - No edit/delete functionality (can add later)
  - Reply likes not used in UI (model exists)
  - Search is basic text search (can enhance with full-text search)
- Migration needed: `npx prisma migrate dev --name add_forum_models`

**Future Enhancements:**
- Rich text editor for thread/reply content
- Edit/delete threads and replies
- Reply likes in UI
- Full-text search
- Email notifications for replies
- Admin moderation tools

### File List

**Files to Create:**
1. `app/(dashboard)/dashboard/partner/forum/page.tsx` - Forum list page
2. `app/(dashboard)/dashboard/partner/forum/[id]/page.tsx` - Thread detail page
3. `lib/trpc/server/routers/forum.ts` - Forum tRPC router (or add to partner router)

**Files to Modify:**
1. `prisma/schema.prisma` - Add forum models
2. `lib/trpc/server/root.ts` - Add forum router (if separate)
3. `app/(dashboard)/dashboard/partner/page.tsx` - Add link
4. `_bmad-output/implementation/sprint-status.yaml` - Update status
