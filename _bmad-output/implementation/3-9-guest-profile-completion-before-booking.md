# Story 3.9: Guest Profile Completion (Before Booking)

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a first-time guest,
I want to complete my profile,
So that my booking has all necessary information.

## Acceptance Criteria

### AC-1: Profile Completion Flow Trigger

- [ ] After trip selection (/booking/configure/trip), check if guest profile exists
- [ ] If profile incomplete/missing, redirect to `/booking/configure/profile`
- [ ] If profile complete, proceed directly to payment
- [ ] Protected route (requires Clerk authentication)
- [ ] Page displays "Step 7 of 7" progress indicator
- [ ] Page title: "Complete Your Guest Profile"
- [ ] Subtitle: "Help us personalize your transformation journey"

### AC-2: Form Fields & Structure

- [ ] First Name field:
  - Text input
  - Required with validation message
  - Minimum 2 characters
  - Label: "First Name"
  - Shows green checkmark on valid input

- [ ] Last Name field:
  - Text input
  - Required with validation message
  - Minimum 2 characters
  - Label: "Last Name"

- [ ] Age field:
  - Number input
  - Minimum: 18, Maximum: 120
  - Required with validation message
  - Label: "Age"
  - Help text: "Must be 18 or older to book"

- [ ] Location field:
  - Text input
  - Required with validation message
  - Label: "Home Location"
  - Placeholder: "City, State/Province, Country"

- [ ] Pickleball skill level:
  - Select dropdown
  - Options: "Recreational", "Intermediate", "Advanced"
  - Required with validation message
  - Label: "Pickleball Skill Level"
  - Help text: "We'll match you with players at your level"

- [ ] Pickleball frequency:
  - Text input
  - Required with validation message
  - Label: "How Often Do You Play?"
  - Placeholder: "e.g., 3x per week, 2-3 times per month"

- [ ] Dietary restrictions:
  - Multi-select checkboxes
  - Options: "None", "Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", "Nut Allergy", "Other"
  - "Other" option reveals text input for custom restrictions
  - Not required (can select "None")
  - Label: "Dietary Restrictions"

- [ ] Emergency contact section:
  - Name (text input, required)
  - Phone (tel input with validation, required)
  - Relationship (text input, required)
  - Label: "Emergency Contact"

### AC-3: Form Validation

- [ ] Client-side validation on blur
- [ ] All fields except dietary restrictions are required
- [ ] Age must be >= 18
- [ ] Phone must be valid format (E.164 or local)
- [ ] Display error messages inline below each field
- [ ] Disable submit button until all validations pass
- [ ] Show success checkmark on valid fields

### AC-4: Profile Save & Database

- [ ] tRPC mutation: `user.completeGuestProfile`
- [ ] Save to User model (update existing user record)
- [ ] Fields stored:
  - age (Int)
  - location (String)
  - pickleballSkillLevel (Enum: RECREATIONAL, INTERMEDIATE, ADVANCED)
  - pickleballFrequency (String)
  - dietaryRestrictions (String[])
  - emergencyContactName (String)
  - emergencyContactPhone (String)
  - emergencyContactRelationship (String)
  - profileCompleted (Boolean - set to true)
- [ ] Handle database errors gracefully
- [ ] Show toast notification on successful save

### AC-5: Navigation & Flow

- [ ] "Back to Trip Selection" button (routes to `/booking/configure/trip`)
- [ ] "Save & Continue to Payment" button
  - Disabled until all validations pass
  - Shows loading spinner during save
  - On success, routes to `/booking/payment`
- [ ] Back button preserves all previous selections (package, duration, accommodation, add-ons, trip)

### AC-6: State Management

- [ ] Guest profile data NOT stored in Zustand (stored in database only)
- [ ] After save, update Clerk user metadata with `profileCompleted: true`
- [ ] Use tRPC query to check if profile exists on page load
- [ ] Display pre-filled values if profile already exists

### AC-7: Empty & Loading States

- [ ] Loading state while checking if profile exists
- [ ] Loading state while submitting form
- [ ] Skeleton loader for form fields during initial load

### AC-8: Error Handling

- [ ] If profile check fails: Display error message with retry button
- [ ] If profile save fails: Show toast notification with error details
- [ ] Network errors handled gracefully with user-friendly messages
- [ ] Validation errors shown inline with red text

### AC-9: Mobile Responsiveness

- [ ] Form fields stack vertically on all screen sizes
- [ ] Input fields full width on mobile
- [ ] Touch-friendly input sizes (minimum 48px height)
- [ ] Sticky bottom navigation buttons on mobile
- [ ] Prevent zoom on input focus (iOS)

### AC-10: Accessibility

- [ ] Semantic HTML (use `<form>` element)
- [ ] ARIA labels for all form fields
- [ ] Error messages associated with inputs (aria-describedby)
- [ ] Keyboard navigation support (Tab to navigate)
- [ ] Focus indicators visible and clear
- [ ] Screen reader announces validation errors
- [ ] Proper label associations (htmlFor/id)

## Tasks / Subtasks

- [ ] Task 1: Update User model in Prisma schema (AC: 4)
  - [ ] Subtask 1.1: Add guest profile fields to User model
  - [ ] Subtask 1.2: Create PickleballSkillLevel enum
  - [ ] Subtask 1.3: Run `npx prisma db push` to update database
  - [ ] Subtask 1.4: Generate updated Prisma client

- [ ] Task 2: Create tRPC user router mutations/queries (AC: 4, 6)
  - [ ] Subtask 2.1: Add `checkProfileComplete` query to user router
  - [ ] Subtask 2.2: Add `completeGuestProfile` mutation with Zod validation
  - [ ] Subtask 2.3: Add proper TypeScript types
  - [ ] Subtask 2.4: Add to root tRPC router

- [ ] Task 3: Create GuestProfileForm component (AC: 2, 3, 9)
  - [ ] Subtask 3.1: Build form with React Hook Form + Zod validation
  - [ ] Subtask 3.2: Implement all form fields with proper types
  - [ ] Subtask 3.3: Add client-side validation logic
  - [ ] Subtask 3.4: Add accessibility attributes (ARIA, labels)
  - [ ] Subtask 3.5: Style with Tailwind (mobile-first)

- [ ] Task 4: Create profile completion page (AC: 1, 5, 7)
  - [ ] Subtask 4.1: Create `/app/booking/configure/profile/page.tsx`
  - [ ] Subtask 4.2: Add progress indicator ("Step 7 of 7")
  - [ ] Subtask 4.3: Add page title and subtitle
  - [ ] Subtask 4.4: Integrate GuestProfileForm component
  - [ ] Subtask 4.5: Add navigation buttons (Back/Save & Continue)
  - [ ] Subtask 4.6: Implement route protection with Clerk
  - [ ] Subtask 4.7: Add profile check logic on page load

- [ ] Task 5: Update navigation flow (AC: 1, 5)
  - [ ] Subtask 5.1: Update trip selector "Next" to check profile status
  - [ ] Subtask 5.2: Route to `/booking/configure/profile` if incomplete
  - [ ] Subtask 5.3: Route to `/booking/payment` if profile complete
  - [ ] Subtask 5.4: Update Clerk metadata after profile save

- [ ] Task 6: Testing & validation (AC: All)
  - [ ] Subtask 6.1: Write unit tests for GuestProfileForm component
  - [ ] Subtask 6.2: Write integration tests for profile completion flow
  - [ ] Subtask 6.3: Test form validation (all edge cases)
  - [ ] Subtask 6.4: Test database persistence
  - [ ] Subtask 6.5: Run TypeScript validation (0 errors)
  - [ ] Subtask 6.6: Test keyboard navigation and accessibility
  - [ ] Subtask 6.7: Test mobile responsiveness

## Dev Notes

### Architecture Requirements (MUST FOLLOW)

**Database Schema Update:**
- Add to User model in `prisma/schema.prisma`:
  ```prisma
  model User {
    // ... existing fields

    // Guest Profile Fields (E3-S9)
    age                          Int?
    location                     String?
    pickleballSkillLevel         PickleballSkillLevel?
    pickleballFrequency          String?
    dietaryRestrictions          String[]
    emergencyContactName         String?
    emergencyContactPhone        String?
    emergencyContactRelationship String?
    profileCompleted             Boolean  @default(false)

    // ... existing relations
  }

  enum PickleballSkillLevel {
    RECREATIONAL
    INTERMEDIATE
    ADVANCED
  }
  ```

**tRPC API Pattern:**
- Create user router in `lib/trpc/server/routers/user.ts`:
  ```typescript
  import { z } from 'zod'
  import { privateProcedure, router } from '../trpc'
  import { PickleballSkillLevel } from '@prisma/client'

  export const userRouter = router({
    checkProfileComplete: privateProcedure
      .query(async ({ ctx }) => {
        const user = await ctx.prisma.user.findUnique({
          where: { clerkUserId: ctx.userId },
          select: { profileCompleted: true }
        })
        return { profileCompleted: user?.profileCompleted ?? false }
      }),

    completeGuestProfile: privateProcedure
      .input(z.object({
        age: z.number().int().min(18).max(120),
        location: z.string().min(2),
        pickleballSkillLevel: z.nativeEnum(PickleballSkillLevel),
        pickleballFrequency: z.string().min(1),
        dietaryRestrictions: z.array(z.string()),
        emergencyContactName: z.string().min(2),
        emergencyContactPhone: z.string().min(10),
        emergencyContactRelationship: z.string().min(2),
      }))
      .mutation(async ({ ctx, input }) => {
        const user = await ctx.prisma.user.update({
          where: { clerkUserId: ctx.userId },
          data: {
            ...input,
            profileCompleted: true,
          }
        })

        // Update Clerk metadata
        await ctx.clerk.users.updateUserMetadata(ctx.userId, {
          publicMetadata: {
            profileCompleted: true
          }
        })

        return { success: true, user }
      })
  })
  ```

**Key Implementation Points:**
1. **Form Validation:** Use React Hook Form + Zod for client-side validation
2. **Type Safety:** All fields properly typed with Prisma-generated types
3. **Privacy:** Guest profile data not exposed in client-side stores
4. **Clerk Integration:** Update Clerk metadata for profile completion status
5. **Error Handling:** Graceful handling of database and network errors

### Component Patterns

**Page Structure Pattern:**
```typescript
// app/booking/configure/profile/page.tsx
import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { currentUser } from '@clerk/nextjs/server'
import GuestProfileForm from '@/components/booking/guest-profile-form'

export const metadata: Metadata = {
  title: 'Complete Your Profile | Pickleball Passport',
  description: 'Complete your guest profile before booking.'
}

export default async function ProfileCompletionPage() {
  const user = await currentUser()
  if (!user) {
    redirect('/sign-in?redirect_url=/booking/configure/profile')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12">
      {/* Page content */}
    </div>
  )
}
```

**Form Component Pattern (React Hook Form):**
```typescript
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { trpc } from '@/lib/trpc/client'
import { useRouter } from 'next/navigation'
import { PickleballSkillLevel } from '@prisma/client'

const profileSchema = z.object({
  age: z.number().int().min(18).max(120),
  location: z.string().min(2),
  pickleballSkillLevel: z.nativeEnum(PickleballSkillLevel),
  pickleballFrequency: z.string().min(1),
  dietaryRestrictions: z.array(z.string()),
  emergencyContactName: z.string().min(2),
  emergencyContactPhone: z.string().min(10),
  emergencyContactRelationship: z.string().min(2),
})

type ProfileFormData = z.infer<typeof profileSchema>

export default function GuestProfileForm() {
  const router = useRouter()

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema)
  })

  const saveMutation = trpc.user.completeGuestProfile.useMutation({
    onSuccess: () => {
      router.push('/booking/payment')
    }
  })

  const onSubmit = (data: ProfileFormData) => {
    saveMutation.mutate(data)
  }

  return <form onSubmit={handleSubmit(onSubmit)}>{/* Form fields */}</form>
}
```

### Form Libraries & Dependencies

**Required Packages:**
- `react-hook-form` - Form state management
- `@hookform/resolvers` - Zod integration for React Hook Form
- `zod` - Schema validation (already installed)

**Install if not present:**
```bash
npm install react-hook-form @hookform/resolvers
```

### File Structure & Locations

**Files to Create:**
- `lib/trpc/server/routers/user.ts` - tRPC router for user profile
- `components/booking/guest-profile-form.tsx` - Profile form component
- `app/booking/configure/profile/page.tsx` - Profile completion page

**Files to Modify:**
- `prisma/schema.prisma` - Add guest profile fields to User model
- `lib/trpc/server/routers/_app.ts` - Add user router to root router
- `components/booking/trip-selector.tsx` - Update "Next" button logic

**Database Migration:**
```bash
npx prisma db push
npx prisma generate
```

### Testing Requirements

**Unit Tests:**
- GuestProfileForm validates required fields
- GuestProfileForm shows error messages on invalid input
- GuestProfileForm disables submit until valid
- Age validation (min 18, max 120)
- Phone validation

**Integration Tests:**
- tRPC mutation saves profile to database
- Clerk metadata updated on profile save
- Profile completion redirects to payment
- Navigation flow works correctly
- Pre-filled values displayed if profile exists

**TypeScript Validation:**
- Run `npx tsc --noEmit` - must pass with 0 errors
- All components properly typed
- No `any` types used

### UI/UX Design Specifications

**Colors (from architecture):**
- Primary: Ocean Blue (#003D5C)
- Accent: Gold (#D4AF37)
- Success: Emerald (#10B981)
- Error: Red (#EF4444)
- Background: Slate-50 to White gradient

**Typography:**
- Headings: Serif (Playfair Display via Tailwind `font-serif`)
- Body: Sans-serif (Inter via Tailwind `font-sans`)

**Form Styling:**
- Input borders: `border-gray-300 focus:border-emerald-500`
- Error borders: `border-red-500`
- Input padding: `px-4 py-2`
- Label font weight: `font-medium`
- Help text: `text-sm text-gray-600`
- Error text: `text-sm text-red-600`

**Spacing:**
- Form field gap: `space-y-6`
- Section spacing: `space-y-8`
- Page padding: `py-12 px-4 sm:px-6 lg:px-8`

### Previous Story Intelligence

**From E3-S8 (Trip Selection):**
- ✅ Successfully implemented radio selection pattern
- ✅ tRPC query pattern works well for data fetching
- ✅ Zustand store integration smooth
- ✅ Navigation flow: Trip → **PROFILE** → Payment
- ✅ TypeScript validation passed

**Key Patterns to Replicate:**
1. **Form Validation:** Use React Hook Form for better developer experience
2. **Loading States:** Implement spinner while submitting
3. **Error Handling:** Clear error messages with retry options
4. **State Management:** Profile data in database, not Zustand
5. **Navigation:** Consistent Back/Next button styling

### References

**Source Documents:**
- [Epics File: Epic 3, Story 9](/_bmad-output/solutioning/epics-and-stories-Pickleball-Passport-2025-12-28.md#L887-L913)
- [Architecture: Database Schema](/_bmad-output/solutioning/architecture-Pickleball-Passport-2025-12-28.md#User Model)
- [Prisma Schema: User Model](/prisma/schema.prisma)

**Related Stories:**
- E3-S8: Trip Selection (just completed) - provides navigation entry point
- E3-S10: Booking Confirmation (depends on profile completion)

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Debug Log References

### Completion Notes List

### File List
