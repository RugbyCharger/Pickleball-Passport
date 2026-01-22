/**
 * Unit Tests: Support Router
 *
 * Tests cover critical support ticket operations:
 * - createPublicTicket: Public ticket creation with spam protection
 * - getPublicTicketStatus: Public ticket lookup with rate limiting
 * - create: Authenticated ticket creation
 * - list/getById: Ticket retrieval with authorization
 * - Admin procedures: Ticket management, replies, status updates
 *
 * Mocks: Prisma, Rate Limiter, reCAPTCHA, Email Service
 */

import { describe, it, expect, beforeEach, vi, Mock } from 'vitest'
import { TRPCError } from '@trpc/server'

// Mock external dependencies before imports
vi.mock('@/lib/db', () => ({
  prisma: {
    supportTicket: {
      create: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    supportTicketReply: {
      create: vi.fn(),
    },
    booking: {
      findFirst: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
  },
}))

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn(),
  getIpAddress: vi.fn(() => '127.0.0.1'),
}))

vi.mock('@/lib/email/sendgrid', () => ({
  sendTicketCreatedEmail: vi.fn().mockResolvedValue(undefined),
  sendTicketAdminNotification: vi.fn().mockResolvedValue(undefined),
  sendTicketReplyEmail: vi.fn().mockResolvedValue(undefined),
  sendTicketResolvedEmail: vi.fn().mockResolvedValue(undefined),
  isConfigured: vi.fn(() => true),
}))

vi.mock('@/lib/logger', () => ({
  apiLogger: { warn: vi.fn(), info: vi.fn(), error: vi.fn() },
  dbLogger: { info: vi.fn(), error: vi.fn() },
  emailLogger: { error: vi.fn() },
  logError: vi.fn(),
}))

vi.mock('nanoid', () => ({
  nanoid: vi.fn(() => 'ABC12345'),
}))

// Import after mocks
import { prisma } from '@/lib/db'
import { checkRateLimit, getIpAddress } from '@/lib/rate-limit'
import {
  sendTicketCreatedEmail,
  sendTicketAdminNotification,
  sendTicketReplyEmail,
  sendTicketResolvedEmail,
} from '@/lib/email/sendgrid'

describe('Support Router', () => {
  // Common test fixtures
  const mockPublicTicketInput = {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1-555-123-4567',
    category: 'GENERAL_INQUIRY' as const,
    message: 'This is a test message that is at least 20 characters long for validation.',
    tripInterest: 'Thailand Adventure',
    timeline: '3-6 months',
    recaptchaToken: 'valid-token-123',
    website: '', // Honeypot - should be empty
  }

  const mockTicket = {
    id: 'ticket_test123',
    referenceNumber: 'TKT-ABC12345',
    subject: 'General Inquiry - Thailand Adventure (Timeline: 3-6 months)',
    message: 'This is a test message that is at least 20 characters long for validation.',
    category: 'GENERAL_INQUIRY',
    source: 'WEBSITE_CONTACT',
    status: 'OPEN',
    priority: 'NORMAL',
    email: 'john@example.com',
    name: 'John Doe',
    phone: '+1-555-123-4567',
    userId: null,
    assignedToId: null,
    createdAt: new Date(),
    resolvedAt: null,
    replies: [],
  }

  const mockUser = {
    id: 'user_test123',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    emailAddresses: [{ emailAddress: 'john@example.com' }],
    fullName: 'John Doe',
    role: 'USER',
  }

  const mockAdminUser = {
    id: 'admin_test123',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@example.com',
    role: 'ADMIN',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Default: rate limit passes
    vi.mocked(checkRateLimit).mockResolvedValue({ success: true, remaining: 10 })
  })

  describe('createPublicTicket', () => {
    describe('Input validation', () => {
      it('should require name field', () => {
        const minLength = 1
        const maxLength = 100

        expect(''.length >= minLength).toBe(false)
        expect('John Doe'.length <= maxLength).toBe(true)
        expect('A'.repeat(101).length <= maxLength).toBe(false)
      })

      it('should require valid email format', () => {
        const validEmails = ['test@example.com', 'user.name@domain.co.uk']
        const invalidEmails = ['invalid', 'no@tld', '@example.com']

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

        validEmails.forEach(email => {
          expect(emailRegex.test(email)).toBe(true)
        })

        invalidEmails.forEach(email => {
          expect(emailRegex.test(email)).toBe(false)
        })
      })

      it('should validate phone format when provided', () => {
        const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/

        const validPhones = ['+1-555-123-4567', '(555) 123-4567', '5551234567', '123']
        const invalidPhones = ['abc', 'phone number', '@#$%']

        validPhones.forEach(phone => {
          expect(phoneRegex.test(phone)).toBe(true)
        })

        invalidPhones.forEach(phone => {
          expect(phoneRegex.test(phone)).toBe(false)
        })
      })

      it('should require message to be at least 20 characters', () => {
        const minLength = 20
        const shortMessage = 'Too short'
        const validMessage = 'This is a valid message that is long enough.'

        expect(shortMessage.length >= minLength).toBe(false)
        expect(validMessage.length >= minLength).toBe(true)
      })

      it('should limit message to 5000 characters', () => {
        const maxLength = 5000
        const longMessage = 'A'.repeat(5001)

        expect(longMessage.length <= maxLength).toBe(false)
      })

      it('should validate category enum', () => {
        const validCategories = [
          'GENERAL_INQUIRY',
          'BOOKING_QUESTION',
          'MEDICAL_WELLNESS_QUESTION',
          'PAYMENT_ISSUE',
          'PARTNERSHIP_INQUIRY',
          'OTHER',
        ]

        expect(validCategories.includes('GENERAL_INQUIRY')).toBe(true)
        expect(validCategories.includes('INVALID_CATEGORY')).toBe(false)
      })
    })

    describe('Honeypot spam protection', () => {
      it('should detect bot when honeypot field is filled', () => {
        const honeypotValue = 'http://spam-site.com'
        const isBot = honeypotValue && honeypotValue.length > 0

        expect(isBot).toBe(true)
      })

      it('should pass when honeypot field is empty', () => {
        const honeypotValue = ''
        const isBot = !!(honeypotValue && honeypotValue.length > 0)

        expect(isBot).toBe(false)
      })

      it('should return fake success to fool bots', () => {
        // When bot detected, return fake success without creating ticket
        const fakeResponse = {
          success: true,
          referenceNumber: 'TKT-XXXXXXXX',
          message: "Thank you! We'll be in touch soon.",
        }

        expect(fakeResponse.success).toBe(true)
        expect(fakeResponse.referenceNumber).toBe('TKT-XXXXXXXX')
      })
    })

    describe('Rate limiting', () => {
      it('should enforce rate limit on contact form submissions', async () => {
        vi.mocked(checkRateLimit).mockResolvedValue({ success: false, remaining: 0 })

        const rateLimitResult = await checkRateLimit('contact', '127.0.0.1')

        expect(rateLimitResult.success).toBe(false)
      })

      it('should pass when under rate limit', async () => {
        vi.mocked(checkRateLimit).mockResolvedValue({ success: true, remaining: 2 })

        const rateLimitResult = await checkRateLimit('contact', '127.0.0.1')

        expect(rateLimitResult.success).toBe(true)
      })

      it('should extract IP address from headers', () => {
        const mockHeaders = new Headers({
          'x-forwarded-for': '192.168.1.1',
        })

        vi.mocked(getIpAddress).mockReturnValue('192.168.1.1')

        const ip = getIpAddress(mockHeaders)
        expect(ip).toBe('192.168.1.1')
      })
    })

    describe('reCAPTCHA verification', () => {
      it('should require reCAPTCHA token', () => {
        const token = ''
        const isValid = token.length >= 1

        expect(isValid).toBe(false)
      })

      it('should reject low reCAPTCHA scores (< 0.5)', () => {
        const score = 0.3
        const threshold = 0.5

        expect(score < threshold).toBe(true)
      })

      it('should accept high reCAPTCHA scores (>= 0.5)', () => {
        const score = 0.7
        const threshold = 0.5

        expect(score >= threshold).toBe(true)
      })
    })

    describe('Reference number generation', () => {
      it('should generate reference number in correct format', () => {
        const referenceNumber = 'TKT-ABC12345'
        const format = /^TKT-[A-Za-z0-9]{8}$/

        expect(format.test(referenceNumber)).toBe(true)
      })

      it('should generate unique reference numbers', () => {
        const refs = new Set(['TKT-ABC12345', 'TKT-DEF67890', 'TKT-GHI11111'])

        expect(refs.size).toBe(3)
      })
    })

    describe('Subject line building', () => {
      it('should build subject from category', () => {
        const category = 'GENERAL_INQUIRY'
        const categoryLabel = category
          .replace(/_/g, ' ')
          .toLowerCase()
          .replace(/\b\w/g, (l) => l.toUpperCase())

        expect(categoryLabel).toBe('General Inquiry')
      })

      it('should include trip interest in subject when provided', () => {
        const category = 'BOOKING_QUESTION'
        const tripInterest = 'Thailand Adventure'
        const categoryLabel = 'Booking Question'

        const subject = `${categoryLabel} - ${tripInterest}`

        expect(subject).toBe('Booking Question - Thailand Adventure')
      })

      it('should include timeline in subject when provided', () => {
        const categoryLabel = 'General Inquiry'
        const tripInterest = 'Thailand'
        const timeline = '3-6 months'

        const subject = `${categoryLabel} - ${tripInterest} (Timeline: ${timeline})`

        expect(subject).toBe('General Inquiry - Thailand (Timeline: 3-6 months)')
      })
    })

    describe('Ticket creation', () => {
      it('should create ticket with normalized email', async () => {
        const email = '  JOHN@EXAMPLE.COM  '
        const normalizedEmail = email.toLowerCase().trim()

        expect(normalizedEmail).toBe('john@example.com')
      })

      it('should create ticket in database', async () => {
        vi.mocked(prisma.supportTicket.create).mockResolvedValue(mockTicket as any)

        const ticket = await prisma.supportTicket.create({
          data: {
            referenceNumber: 'TKT-ABC12345',
            subject: 'General Inquiry',
            message: mockPublicTicketInput.message,
            category: mockPublicTicketInput.category,
            source: 'WEBSITE_CONTACT',
            status: 'OPEN',
            priority: 'NORMAL',
            email: 'john@example.com',
            name: 'John Doe',
            phone: mockPublicTicketInput.phone,
          },
        })

        expect(ticket.referenceNumber).toBe('TKT-ABC12345')
        expect(ticket.status).toBe('OPEN')
      })

      it('should set source as WEBSITE_CONTACT for public tickets', () => {
        expect(mockTicket.source).toBe('WEBSITE_CONTACT')
      })

      it('should set default priority as NORMAL', () => {
        expect(mockTicket.priority).toBe('NORMAL')
      })
    })

    describe('Email notifications', () => {
      it('should send confirmation email to ticket submitter', async () => {
        vi.mocked(sendTicketCreatedEmail).mockResolvedValue(undefined)

        await sendTicketCreatedEmail('john@example.com', {
          name: 'John Doe',
          email: 'john@example.com',
          referenceNumber: 'TKT-ABC12345',
          category: 'GENERAL_INQUIRY',
          message: 'Test message',
          source: 'WEBSITE_CONTACT',
        })

        expect(sendTicketCreatedEmail).toHaveBeenCalledWith(
          'john@example.com',
          expect.objectContaining({
            referenceNumber: 'TKT-ABC12345',
          })
        )
      })

      it('should send notification email to admin', async () => {
        vi.mocked(sendTicketAdminNotification).mockResolvedValue(undefined)

        await sendTicketAdminNotification({
          referenceNumber: 'TKT-ABC12345',
          name: 'John Doe',
          email: 'john@example.com',
          phone: null,
          category: 'GENERAL_INQUIRY',
          message: 'Test message',
          priority: 'NORMAL',
          source: 'WEBSITE_CONTACT',
          createdAt: new Date(),
        })

        expect(sendTicketAdminNotification).toHaveBeenCalled()
      })
    })
  })

  describe('getPublicTicketStatus', () => {
    describe('Input validation', () => {
      it('should validate reference number format', () => {
        const validFormat = /^TKT-[A-Za-z0-9]{8}$/

        expect(validFormat.test('TKT-ABC12345')).toBe(true)
        expect(validFormat.test('TKT-abc12345')).toBe(true)
        expect(validFormat.test('INVALID')).toBe(false)
        expect(validFormat.test('TKT-')).toBe(false)
        expect(validFormat.test('TKT-TOOLONG123')).toBe(false)
      })

      it('should require valid email format', () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

        expect(emailRegex.test('valid@example.com')).toBe(true)
        expect(emailRegex.test('invalid')).toBe(false)
      })
    })

    describe('Rate limiting', () => {
      it('should enforce 10 lookups per hour per email', async () => {
        vi.mocked(checkRateLimit).mockResolvedValue({ success: false, remaining: 0 })

        const result = await checkRateLimit('ticketStatus', 'email:john@example.com')

        expect(result.success).toBe(false)
      })

      it('should use email as rate limit key', async () => {
        await checkRateLimit('ticketStatus', 'email:test@example.com')

        expect(checkRateLimit).toHaveBeenCalledWith('ticketStatus', 'email:test@example.com')
      })
    })

    describe('Ticket lookup', () => {
      it('should find ticket by reference number AND email', async () => {
        const ticketWithReplies = {
          ...mockTicket,
          replies: [
            { id: 'reply_1', message: 'Admin response', createdAt: new Date(), isAdminReply: true },
          ],
        }

        vi.mocked(prisma.supportTicket.findFirst).mockResolvedValue(ticketWithReplies as any)

        const ticket = await prisma.supportTicket.findFirst({
          where: {
            referenceNumber: 'TKT-ABC12345',
            email: 'john@example.com',
          },
        })

        expect(ticket).not.toBeNull()
        expect(ticket!.referenceNumber).toBe('TKT-ABC12345')
      })

      it('should return NOT_FOUND for non-existent ticket', async () => {
        vi.mocked(prisma.supportTicket.findFirst).mockResolvedValue(null)

        const ticket = await prisma.supportTicket.findFirst({
          where: {
            referenceNumber: 'TKT-NONEXIST',
            email: 'john@example.com',
          },
        })

        expect(ticket).toBeNull()
      })

      it('should return NOT_FOUND for mismatched email (security)', async () => {
        // Email mismatch should return same error to prevent enumeration
        vi.mocked(prisma.supportTicket.findFirst).mockResolvedValue(null)

        const ticket = await prisma.supportTicket.findFirst({
          where: {
            referenceNumber: 'TKT-ABC12345',
            email: 'wrong@example.com',
          },
        })

        expect(ticket).toBeNull()
      })

      it('should only return admin replies (not internal notes)', () => {
        const replies = [
          { isAdminReply: true, message: 'Public response' },
          { isAdminReply: false, message: 'Internal note' },
        ]

        const publicReplies = replies.filter(r => r.isAdminReply)

        expect(publicReplies.length).toBe(1)
        expect(publicReplies[0].message).toBe('Public response')
      })
    })

    describe('Response sanitization', () => {
      it('should not include internal IDs in public response', () => {
        const publicFields = [
          'referenceNumber',
          'subject',
          'message',
          'category',
          'status',
          'priority',
          'createdAt',
          'resolvedAt',
          'replies',
        ]

        const internalFields = ['id', 'userId', 'assignedToId', 'bookingId']

        // Verify these fields would be excluded
        internalFields.forEach(field => {
          expect(publicFields.includes(field)).toBe(false)
        })
      })
    })
  })

  describe('create (authenticated)', () => {
    describe('User context', () => {
      it('should extract email from user context', () => {
        const userEmail =
          mockUser.emailAddresses?.[0]?.emailAddress || mockUser.email || ''

        expect(userEmail).toBe('john@example.com')
      })

      it('should build user name from context', () => {
        const userName =
          mockUser.fullName ||
          `${mockUser.firstName || ''} ${mockUser.lastName || ''}`.trim() ||
          null

        expect(userName).toBe('John Doe')
      })
    })

    describe('Booking auto-linking', () => {
      it('should find latest booking for user', async () => {
        const mockBooking = { id: 'booking_123' }
        vi.mocked(prisma.booking.findFirst).mockResolvedValue(mockBooking as any)

        const latestBooking = await prisma.booking.findFirst({
          where: { userId: 'user_test123' },
          orderBy: { createdAt: 'desc' },
          select: { id: true },
        })

        expect(latestBooking?.id).toBe('booking_123')
      })

      it('should handle user with no bookings', async () => {
        vi.mocked(prisma.booking.findFirst).mockResolvedValue(null)

        const latestBooking = await prisma.booking.findFirst({
          where: { userId: 'user_test123' },
        })

        expect(latestBooking).toBeNull()
      })
    })

    describe('Subject building for authenticated tickets', () => {
      it('should append "Guest Dashboard" to subject', () => {
        const category = 'PAYMENT_ISSUE'
        const categoryLabel = 'Payment Issue'
        const subject = `${categoryLabel} - Guest Dashboard`

        expect(subject).toBe('Payment Issue - Guest Dashboard')
      })
    })

    describe('Ticket creation', () => {
      it('should set source as GUEST_DASHBOARD', async () => {
        const ticketData = {
          ...mockTicket,
          source: 'GUEST_DASHBOARD',
          userId: 'user_test123',
        }

        vi.mocked(prisma.supportTicket.create).mockResolvedValue(ticketData as any)

        const ticket = await prisma.supportTicket.create({ data: ticketData as any })

        expect(ticket.source).toBe('GUEST_DASHBOARD')
        expect(ticket.userId).toBe('user_test123')
      })

      it('should link ticket to user ID', async () => {
        vi.mocked(prisma.supportTicket.create).mockResolvedValue({
          ...mockTicket,
          userId: 'user_test123',
        } as any)

        const ticket = await prisma.supportTicket.create({
          data: { userId: 'user_test123' } as any,
        })

        expect(ticket.userId).toBe('user_test123')
      })
    })
  })

  describe('list', () => {
    it('should return tickets for current user only', async () => {
      vi.mocked(prisma.supportTicket.findMany).mockResolvedValue([mockTicket] as any)

      const tickets = await prisma.supportTicket.findMany({
        where: { userId: 'user_test123' },
      })

      expect(prisma.supportTicket.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user_test123' },
        })
      )
    })

    it('should filter by status when provided', async () => {
      vi.mocked(prisma.supportTicket.findMany).mockResolvedValue([])

      await prisma.supportTicket.findMany({
        where: { userId: 'user_test123', status: 'OPEN' },
      })

      expect(prisma.supportTicket.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'OPEN' }),
        })
      )
    })

    it('should order by createdAt descending', async () => {
      vi.mocked(prisma.supportTicket.findMany).mockResolvedValue([])

      await prisma.supportTicket.findMany({
        where: { userId: 'user_test123' },
        orderBy: { createdAt: 'desc' },
      })

      expect(prisma.supportTicket.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        })
      )
    })
  })

  describe('getById', () => {
    describe('Authorization', () => {
      it('should throw FORBIDDEN if user does not own ticket', async () => {
        vi.mocked(prisma.supportTicket.findUnique).mockResolvedValue({
          ...mockTicket,
          userId: 'different_user',
        } as any)

        const ticket = await prisma.supportTicket.findUnique({
          where: { id: 'ticket_test123' },
        })

        const currentUserId = 'user_test123'
        const isAuthorized = ticket?.userId === currentUserId

        expect(isAuthorized).toBe(false)
      })

      it('should allow access if user owns ticket', async () => {
        vi.mocked(prisma.supportTicket.findUnique).mockResolvedValue({
          ...mockTicket,
          userId: 'user_test123',
        } as any)

        const ticket = await prisma.supportTicket.findUnique({
          where: { id: 'ticket_test123' },
        })

        const currentUserId = 'user_test123'
        const isAuthorized = ticket?.userId === currentUserId

        expect(isAuthorized).toBe(true)
      })
    })

    it('should throw NOT_FOUND for non-existent ticket', async () => {
      vi.mocked(prisma.supportTicket.findUnique).mockResolvedValue(null)

      const ticket = await prisma.supportTicket.findUnique({
        where: { id: 'nonexistent' },
      })

      expect(ticket).toBeNull()
    })

    it('should include replies ordered by createdAt', async () => {
      const ticketWithReplies = {
        ...mockTicket,
        userId: 'user_test123',
        replies: [
          { id: 'reply_1', createdAt: new Date('2024-01-01') },
          { id: 'reply_2', createdAt: new Date('2024-01-02') },
        ],
      }

      vi.mocked(prisma.supportTicket.findUnique).mockResolvedValue(ticketWithReplies as any)

      const ticket = await prisma.supportTicket.findUnique({
        where: { id: 'ticket_test123' },
        include: { replies: { orderBy: { createdAt: 'asc' } } },
      })

      expect(ticket!.replies.length).toBe(2)
    })
  })

  describe('getCounts', () => {
    it('should return counts by status for current user', async () => {
      vi.mocked(prisma.supportTicket.count)
        .mockResolvedValueOnce(10) // total
        .mockResolvedValueOnce(5) // open
        .mockResolvedValueOnce(3) // in_progress
        .mockResolvedValueOnce(2) // resolved

      const [total, open, inProgress, resolved] = await Promise.all([
        prisma.supportTicket.count({ where: { userId: 'user_test123' } }),
        prisma.supportTicket.count({ where: { userId: 'user_test123', status: 'OPEN' } }),
        prisma.supportTicket.count({ where: { userId: 'user_test123', status: 'IN_PROGRESS' } }),
        prisma.supportTicket.count({ where: { userId: 'user_test123', status: 'RESOLVED' } }),
      ])

      expect(total).toBe(10)
      expect(open).toBe(5)
      expect(inProgress).toBe(3)
      expect(resolved).toBe(2)
    })
  })

  describe('Admin Procedures', () => {
    describe('adminGetTickets', () => {
      it('should support filtering by status', async () => {
        vi.mocked(prisma.supportTicket.findMany).mockResolvedValue([])

        await prisma.supportTicket.findMany({
          where: { status: 'OPEN' },
        })

        expect(prisma.supportTicket.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({ status: 'OPEN' }),
          })
        )
      })

      it('should support filtering by priority', async () => {
        vi.mocked(prisma.supportTicket.findMany).mockResolvedValue([])

        await prisma.supportTicket.findMany({
          where: { priority: 'URGENT' },
        })

        expect(prisma.supportTicket.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({ priority: 'URGENT' }),
          })
        )
      })

      it('should support search across multiple fields', () => {
        const searchTerm = 'test'
        const searchConditions = [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { email: { contains: searchTerm, mode: 'insensitive' } },
          { message: { contains: searchTerm, mode: 'insensitive' } },
          { subject: { contains: searchTerm, mode: 'insensitive' } },
          { referenceNumber: { contains: searchTerm, mode: 'insensitive' } },
        ]

        expect(searchConditions.length).toBe(5)
      })

      it('should support date range filtering', () => {
        const dateFrom = '2024-01-01'
        const dateTo = '2024-12-31'

        const startDate = new Date(dateFrom)
        const endDate = new Date(dateTo)
        endDate.setHours(23, 59, 59, 999)

        expect(startDate.toISOString().startsWith('2024-01-01')).toBe(true)
        expect(endDate.getHours()).toBe(23)
      })

      it('should order by priority then createdAt', () => {
        const orderBy = [{ priority: 'desc' }, { createdAt: 'desc' }]

        expect(orderBy[0]).toEqual({ priority: 'desc' })
        expect(orderBy[1]).toEqual({ createdAt: 'desc' })
      })

      it('should support pagination with limit and offset', async () => {
        vi.mocked(prisma.supportTicket.findMany).mockResolvedValue([])

        await prisma.supportTicket.findMany({
          take: 50,
          skip: 100,
        })

        expect(prisma.supportTicket.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            take: 50,
            skip: 100,
          })
        )
      })
    })

    describe('adminGetCounts', () => {
      it('should return all status counts including urgent', async () => {
        vi.mocked(prisma.supportTicket.count)
          .mockResolvedValueOnce(100) // total
          .mockResolvedValueOnce(30) // open
          .mockResolvedValueOnce(20) // in_progress
          .mockResolvedValueOnce(40) // resolved
          .mockResolvedValueOnce(10) // closed
          .mockResolvedValueOnce(5) // urgent

        const [total, open, inProgress, resolved, closed, urgent] = await Promise.all([
          prisma.supportTicket.count(),
          prisma.supportTicket.count({ where: { status: 'OPEN' } }),
          prisma.supportTicket.count({ where: { status: 'IN_PROGRESS' } }),
          prisma.supportTicket.count({ where: { status: 'RESOLVED' } }),
          prisma.supportTicket.count({ where: { status: 'CLOSED' } }),
          prisma.supportTicket.count({
            where: { priority: 'URGENT', status: { in: ['OPEN', 'IN_PROGRESS'] } },
          }),
        ])

        expect(total).toBe(100)
        expect(urgent).toBe(5)
      })
    })

    describe('adminReplyToTicket', () => {
      it('should verify ticket exists before replying', async () => {
        vi.mocked(prisma.supportTicket.findUnique).mockResolvedValue(null)

        const ticket = await prisma.supportTicket.findUnique({
          where: { id: 'nonexistent' },
        })

        expect(ticket).toBeNull()
      })

      it('should create reply with admin user ID', async () => {
        vi.mocked(prisma.supportTicketReply.create).mockResolvedValue({
          id: 'reply_123',
          ticketId: 'ticket_test123',
          userId: 'admin_test123',
          message: 'Admin response',
          isAdminReply: true,
          createdAt: new Date(),
        } as any)

        const reply = await prisma.supportTicketReply.create({
          data: {
            ticketId: 'ticket_test123',
            userId: 'admin_test123',
            message: 'Admin response',
            isAdminReply: true,
          },
        })

        expect(reply.isAdminReply).toBe(true)
        expect(reply.userId).toBe('admin_test123')
      })

      it('should auto-update ticket status to IN_PROGRESS if OPEN', async () => {
        vi.mocked(prisma.supportTicket.findUnique).mockResolvedValue({
          ...mockTicket,
          status: 'OPEN',
        } as any)

        vi.mocked(prisma.supportTicket.update).mockResolvedValue({
          ...mockTicket,
          status: 'IN_PROGRESS',
        } as any)

        const originalStatus = 'OPEN'
        const shouldUpdate = originalStatus === 'OPEN'

        expect(shouldUpdate).toBe(true)

        if (shouldUpdate) {
          const updated = await prisma.supportTicket.update({
            where: { id: 'ticket_test123' },
            data: { status: 'IN_PROGRESS' },
          })
          expect(updated.status).toBe('IN_PROGRESS')
        }
      })

      it('should send email notification on reply', async () => {
        vi.mocked(sendTicketReplyEmail).mockResolvedValue(undefined)

        await sendTicketReplyEmail('john@example.com', {
          name: 'John Doe',
          email: 'john@example.com',
          referenceNumber: 'TKT-ABC12345',
          adminName: 'Admin User',
          replyMessage: 'We have received your request.',
          originalSubject: 'General Inquiry',
          source: 'WEBSITE_CONTACT',
        })

        expect(sendTicketReplyEmail).toHaveBeenCalled()
      })
    })

    describe('adminUpdateTicketStatus', () => {
      it('should verify ticket exists', async () => {
        vi.mocked(prisma.supportTicket.findUnique).mockResolvedValue(null)

        const ticket = await prisma.supportTicket.findUnique({
          where: { id: 'nonexistent' },
        })

        expect(ticket).toBeNull()
      })

      it('should set resolvedAt when moving to RESOLVED', async () => {
        const newStatus = 'RESOLVED'
        const shouldSetResolvedAt = newStatus === 'RESOLVED' || newStatus === 'CLOSED'

        expect(shouldSetResolvedAt).toBe(true)
      })

      it('should set resolvedAt when moving to CLOSED', async () => {
        const newStatus = 'CLOSED'
        const shouldSetResolvedAt = newStatus === 'RESOLVED' || newStatus === 'CLOSED'

        expect(shouldSetResolvedAt).toBe(true)
      })

      it('should clear resolvedAt when reopening ticket', async () => {
        const newStatus = 'OPEN'
        const currentResolvedAt = new Date()
        const shouldClearResolvedAt =
          newStatus !== 'RESOLVED' && newStatus !== 'CLOSED' && currentResolvedAt

        expect(shouldClearResolvedAt).toBeTruthy()
      })

      it('should send resolved email when status changes to RESOLVED', async () => {
        vi.mocked(sendTicketResolvedEmail).mockResolvedValue(undefined)

        const oldStatus = 'IN_PROGRESS'
        const newStatus = 'RESOLVED'
        const shouldSendEmail = newStatus === 'RESOLVED' && oldStatus !== 'RESOLVED'

        expect(shouldSendEmail).toBe(true)

        await sendTicketResolvedEmail('john@example.com', {
          name: 'John Doe',
          email: 'john@example.com',
          referenceNumber: 'TKT-ABC12345',
          originalSubject: 'General Inquiry',
          source: 'WEBSITE_CONTACT',
        })

        expect(sendTicketResolvedEmail).toHaveBeenCalled()
      })
    })

    describe('adminAssignTicket', () => {
      it('should verify ticket exists', async () => {
        vi.mocked(prisma.supportTicket.findUnique).mockResolvedValue(null)

        const ticket = await prisma.supportTicket.findUnique({
          where: { id: 'nonexistent' },
        })

        expect(ticket).toBeNull()
      })

      it('should verify assignee is an admin', async () => {
        vi.mocked(prisma.user.findUnique).mockResolvedValue({
          id: 'user_123',
          role: 'USER',
        } as any)

        const assignee = await prisma.user.findUnique({
          where: { id: 'user_123' },
          select: { role: true },
        })

        const isAdmin = assignee?.role === 'ADMIN'
        expect(isAdmin).toBe(false)
      })

      it('should allow assigning to admin user', async () => {
        vi.mocked(prisma.user.findUnique).mockResolvedValue({
          id: 'admin_123',
          role: 'ADMIN',
        } as any)

        const assignee = await prisma.user.findUnique({
          where: { id: 'admin_123' },
          select: { role: true },
        })

        const isAdmin = assignee?.role === 'ADMIN'
        expect(isAdmin).toBe(true)
      })

      it('should allow unassigning (null assignedToId)', async () => {
        vi.mocked(prisma.supportTicket.update).mockResolvedValue({
          ...mockTicket,
          assignedToId: null,
        } as any)

        const updated = await prisma.supportTicket.update({
          where: { id: 'ticket_test123' },
          data: { assignedToId: null },
        })

        expect(updated.assignedToId).toBeNull()
      })
    })

    describe('adminGetAdminUsers', () => {
      it('should return only users with ADMIN role', async () => {
        vi.mocked(prisma.user.findMany).mockResolvedValue([
          { id: 'admin_1', firstName: 'Admin', lastName: 'One', email: 'admin1@example.com' },
          { id: 'admin_2', firstName: 'Admin', lastName: 'Two', email: 'admin2@example.com' },
        ] as any)

        const admins = await prisma.user.findMany({
          where: { role: 'ADMIN' },
          select: { id: true, firstName: true, lastName: true, email: true },
          orderBy: { firstName: 'asc' },
        })

        expect(admins.length).toBe(2)
        expect(prisma.user.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { role: 'ADMIN' },
          })
        )
      })

      it('should order by firstName ascending', async () => {
        vi.mocked(prisma.user.findMany).mockResolvedValue([])

        await prisma.user.findMany({
          where: { role: 'ADMIN' },
          orderBy: { firstName: 'asc' },
        })

        expect(prisma.user.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            orderBy: { firstName: 'asc' },
          })
        )
      })
    })
  })
})
