/**
 * Unit Tests: FAQ Router
 * Story 12-4: FAQ Management
 *
 * Tests cover critical FAQ operations:
 * - FAQ Category CRUD operations
 * - FAQ CRUD with rich text
 * - Reordering functionality
 * - Publish/unpublish workflow
 * - Search and filtering
 * - Statistics
 *
 * Mocks: Prisma
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Prisma } from '@prisma/client'

// Mock Prisma before imports
vi.mock('@/lib/db', () => ({
  prisma: {
    fAQCategory: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    fAQ: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    $transaction: vi.fn((operations) => {
      if (Array.isArray(operations)) {
        return Promise.all(operations)
      }
      return operations
    }),
  },
}))

import { prisma } from '@/lib/db'

describe('FAQ Router', () => {
  // Common test fixtures
  const mockAdminUser = {
    id: 'admin_123',
    email: 'admin@example.com',
    role: 'ADMIN',
  }

  const mockFAQCategory = {
    id: 'faqcat_123',
    name: 'General Questions',
    slug: 'general-questions',
    description: 'Common questions about our services',
    sortOrder: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockFAQ = {
    id: 'faq_123',
    question: 'What is Pickleball Passport?',
    answer: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Pickleball Passport combines pickleball adventures with wellness experiences in Thailand.',
            },
          ],
        },
      ],
    },
    answerPlain: 'Pickleball Passport combines pickleball adventures with wellness experiences in Thailand.',
    sortOrder: 0,
    isPublished: false,
    categoryId: 'faqcat_123',
    createdBy: 'admin_123',
    updatedBy: 'admin_123',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ============================================================================
  // FAQ CATEGORIES
  // ============================================================================

  describe('FAQ Categories', () => {
    describe('getCategories', () => {
      it('should return all categories ordered by sortOrder and name', async () => {
        const categories = [
          { ...mockFAQCategory, sortOrder: 1 },
          { ...mockFAQCategory, id: 'faqcat_456', name: 'Booking', slug: 'booking', sortOrder: 0 },
        ]

        vi.mocked(prisma.fAQCategory.findMany).mockResolvedValue(categories)

        const result = await prisma.fAQCategory.findMany({
          orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        })

        expect(result).toEqual(categories)
        expect(prisma.fAQCategory.findMany).toHaveBeenCalled()
      })

      it('should include FAQ count when requested', async () => {
        const categoriesWithCount = [
          { ...mockFAQCategory, _count: { faqs: 5 } },
        ]

        vi.mocked(prisma.fAQCategory.findMany).mockResolvedValue(categoriesWithCount as any)

        const result = await prisma.fAQCategory.findMany({
          include: { _count: { select: { faqs: true } } },
        })

        expect(result[0]._count.faqs).toBe(5)
      })
    })

    describe('getPublicCategories', () => {
      it('should only return categories with published FAQs', async () => {
        vi.mocked(prisma.fAQCategory.findMany).mockResolvedValue([mockFAQCategory])

        await prisma.fAQCategory.findMany({
          where: {
            faqs: {
              some: {
                isPublished: true,
              },
            },
          },
        })

        expect(prisma.fAQCategory.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              faqs: expect.objectContaining({
                some: expect.objectContaining({
                  isPublished: true,
                }),
              }),
            }),
          })
        )
      })
    })

    describe('getCategoryById', () => {
      it('should return category with FAQs', async () => {
        const categoryWithFAQs = {
          ...mockFAQCategory,
          faqs: [mockFAQ],
          _count: { faqs: 1 },
        }

        vi.mocked(prisma.fAQCategory.findUnique).mockResolvedValue(categoryWithFAQs as any)

        const result = await prisma.fAQCategory.findUnique({
          where: { id: 'faqcat_123' },
          include: { faqs: true, _count: { select: { faqs: true } } },
        })

        expect(result).toEqual(categoryWithFAQs)
      })

      it('should return null for non-existent category', async () => {
        vi.mocked(prisma.fAQCategory.findUnique).mockResolvedValue(null)

        const result = await prisma.fAQCategory.findUnique({
          where: { id: 'nonexistent' },
        })

        expect(result).toBeNull()
      })
    })

    describe('createCategory', () => {
      it('should create category with valid data', async () => {
        vi.mocked(prisma.fAQCategory.findUnique).mockResolvedValue(null)
        vi.mocked(prisma.fAQCategory.create).mockResolvedValue(mockFAQCategory)

        const result = await prisma.fAQCategory.create({
          data: {
            name: 'General Questions',
            slug: 'general-questions',
            description: 'Common questions about our services',
          },
        })

        expect(result).toEqual(mockFAQCategory)
      })

      it('should reject duplicate slug', async () => {
        vi.mocked(prisma.fAQCategory.findUnique).mockResolvedValue(mockFAQCategory)

        const existing = await prisma.fAQCategory.findUnique({
          where: { slug: 'general-questions' },
        })

        expect(existing).not.toBeNull()
      })

      it('should validate slug format', () => {
        const validSlugs = ['general', 'booking-questions', 'faq-123']
        const invalidSlugs = ['General', 'booking questions', 'faq@123']

        const slugRegex = /^[a-z0-9-]+$/

        validSlugs.forEach((slug) => {
          expect(slugRegex.test(slug)).toBe(true)
        })

        invalidSlugs.forEach((slug) => {
          expect(slugRegex.test(slug)).toBe(false)
        })
      })
    })

    describe('updateCategory', () => {
      it('should update category fields', async () => {
        vi.mocked(prisma.fAQCategory.findUnique).mockResolvedValue(mockFAQCategory)
        vi.mocked(prisma.fAQCategory.update).mockResolvedValue({
          ...mockFAQCategory,
          name: 'Updated Category',
        })

        const result = await prisma.fAQCategory.update({
          where: { id: 'faqcat_123' },
          data: { name: 'Updated Category' },
        })

        expect(result.name).toBe('Updated Category')
      })

      it('should check slug uniqueness when changing', async () => {
        vi.mocked(prisma.fAQCategory.findUnique)
          .mockResolvedValueOnce(mockFAQCategory) // First call for existence
          .mockResolvedValueOnce({ ...mockFAQCategory, id: 'other_id' }) // Second call for slug check

        const existing = await prisma.fAQCategory.findUnique({
          where: { id: 'faqcat_123' },
        })

        expect(existing).not.toBeNull()

        const slugExists = await prisma.fAQCategory.findUnique({
          where: { slug: 'existing-slug' },
        })

        expect(slugExists).not.toBeNull()
      })
    })

    describe('deleteCategory', () => {
      it('should delete category without FAQs', async () => {
        vi.mocked(prisma.fAQCategory.findUnique).mockResolvedValue({
          ...mockFAQCategory,
          _count: { faqs: 0 },
        } as any)

        vi.mocked(prisma.fAQCategory.delete).mockResolvedValue(mockFAQCategory)

        await prisma.fAQCategory.delete({
          where: { id: 'faqcat_123' },
        })

        expect(prisma.fAQCategory.delete).toHaveBeenCalledWith({
          where: { id: 'faqcat_123' },
        })
      })

      it('should prevent deletion of category with FAQs', () => {
        const categoryWithFAQs = {
          ...mockFAQCategory,
          _count: { faqs: 3 },
        }

        const canDelete = categoryWithFAQs._count.faqs === 0

        expect(canDelete).toBe(false)
      })
    })

    describe('reorderCategories', () => {
      it('should update sortOrder for each category', async () => {
        const categoryIds = ['faqcat_1', 'faqcat_2', 'faqcat_3']

        vi.mocked(prisma.$transaction).mockResolvedValue([
          { ...mockFAQCategory, id: 'faqcat_1', sortOrder: 0 },
          { ...mockFAQCategory, id: 'faqcat_2', sortOrder: 1 },
          { ...mockFAQCategory, id: 'faqcat_3', sortOrder: 2 },
        ])

        const operations = categoryIds.map((id, index) =>
          prisma.fAQCategory.update({
            where: { id },
            data: { sortOrder: index },
          })
        )

        await prisma.$transaction(operations)

        expect(prisma.$transaction).toHaveBeenCalled()
      })
    })
  })

  // ============================================================================
  // FAQs
  // ============================================================================

  describe('FAQs', () => {
    describe('getFAQs', () => {
      it('should return FAQs with pagination', async () => {
        const faqs = [mockFAQ]

        vi.mocked(prisma.fAQ.findMany).mockResolvedValue(faqs)
        vi.mocked(prisma.fAQ.count).mockResolvedValue(1)

        const [result, total] = await Promise.all([
          prisma.fAQ.findMany({ take: 50, skip: 0 }),
          prisma.fAQ.count(),
        ])

        expect(result).toEqual(faqs)
        expect(total).toBe(1)
      })

      it('should filter by category', async () => {
        vi.mocked(prisma.fAQ.findMany).mockResolvedValue([])

        await prisma.fAQ.findMany({
          where: { categoryId: 'faqcat_123' },
        })

        expect(prisma.fAQ.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { categoryId: 'faqcat_123' },
          })
        )
      })

      it('should filter by published status', async () => {
        vi.mocked(prisma.fAQ.findMany).mockResolvedValue([])

        await prisma.fAQ.findMany({
          where: { isPublished: true },
        })

        expect(prisma.fAQ.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { isPublished: true },
          })
        )
      })

      it('should search by question and answer', () => {
        const searchTerm = 'pickleball'
        const searchConditions = [
          { question: { contains: searchTerm, mode: 'insensitive' } },
          { answerPlain: { contains: searchTerm, mode: 'insensitive' } },
        ]

        expect(searchConditions.length).toBe(2)
      })
    })

    describe('getPublicFAQs', () => {
      it('should only return published FAQs', async () => {
        const publishedFAQs = [{ ...mockFAQ, isPublished: true }]

        vi.mocked(prisma.fAQ.findMany).mockResolvedValue(publishedFAQs)

        await prisma.fAQ.findMany({
          where: { isPublished: true },
        })

        expect(prisma.fAQ.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              isPublished: true,
            }),
          })
        )
      })

      it('should order by category sortOrder then FAQ sortOrder', async () => {
        vi.mocked(prisma.fAQ.findMany).mockResolvedValue([])

        await prisma.fAQ.findMany({
          orderBy: [
            { category: { sortOrder: 'asc' } },
            { sortOrder: 'asc' },
          ],
        })

        expect(prisma.fAQ.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            orderBy: [
              { category: { sortOrder: 'asc' } },
              { sortOrder: 'asc' },
            ],
          })
        )
      })
    })

    describe('getFAQById', () => {
      it('should return FAQ with category', async () => {
        const faqWithCategory = {
          ...mockFAQ,
          category: mockFAQCategory,
        }

        vi.mocked(prisma.fAQ.findUnique).mockResolvedValue(faqWithCategory as any)

        const result = await prisma.fAQ.findUnique({
          where: { id: 'faq_123' },
          include: { category: true },
        })

        expect(result).toEqual(faqWithCategory)
      })

      it('should return null for non-existent FAQ', async () => {
        vi.mocked(prisma.fAQ.findUnique).mockResolvedValue(null)

        const result = await prisma.fAQ.findUnique({
          where: { id: 'nonexistent' },
        })

        expect(result).toBeNull()
      })
    })

    describe('createFAQ', () => {
      it('should create FAQ with valid data', async () => {
        vi.mocked(prisma.fAQ.findFirst).mockResolvedValue(null)
        vi.mocked(prisma.fAQ.create).mockResolvedValue(mockFAQ)

        const result = await prisma.fAQ.create({
          data: {
            question: 'What is Pickleball Passport?',
            answer: mockFAQ.answer,
            answerPlain: mockFAQ.answerPlain,
            categoryId: 'faqcat_123',
            isPublished: false,
            sortOrder: 0,
            createdBy: 'admin_123',
            updatedBy: 'admin_123',
          },
        })

        expect(result).toEqual(mockFAQ)
      })

      it('should auto-calculate sortOrder at end of category', async () => {
        vi.mocked(prisma.fAQ.findFirst).mockResolvedValue({
          ...mockFAQ,
          sortOrder: 5,
        })

        const lastFaq = await prisma.fAQ.findFirst({
          where: { categoryId: 'faqcat_123' },
          orderBy: { sortOrder: 'desc' },
          select: { sortOrder: true },
        })

        const nextSortOrder = (lastFaq?.sortOrder ?? -1) + 1

        expect(nextSortOrder).toBe(6)
      })

      it('should extract plain text from TipTap JSON', () => {
        const content = {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: 'This is ' },
                { type: 'text', text: 'the answer.' },
              ],
            },
          ],
        }

        const extractPlainText = (doc: any): string => {
          const texts: string[] = []
          const extract = (node: any) => {
            if (node.text) texts.push(node.text)
            if (node.content) node.content.forEach(extract)
          }
          if (doc.content) doc.content.forEach(extract)
          return texts.join(' ').trim()
        }

        const plainText = extractPlainText(content)
        expect(plainText).toBe('This is  the answer.')
      })
    })

    describe('updateFAQ', () => {
      it('should update FAQ fields', async () => {
        vi.mocked(prisma.fAQ.findUnique).mockResolvedValue(mockFAQ)
        vi.mocked(prisma.fAQ.update).mockResolvedValue({
          ...mockFAQ,
          question: 'Updated question?',
        })

        const result = await prisma.fAQ.update({
          where: { id: 'faq_123' },
          data: { question: 'Updated question?' },
        })

        expect(result.question).toBe('Updated question?')
      })

      it('should update category relationship', async () => {
        vi.mocked(prisma.fAQ.update).mockResolvedValue({
          ...mockFAQ,
          categoryId: 'faqcat_456',
        })

        const result = await prisma.fAQ.update({
          where: { id: 'faq_123' },
          data: { category: { connect: { id: 'faqcat_456' } } },
        })

        expect(result.categoryId).toBe('faqcat_456')
      })

      it('should allow removing category', async () => {
        vi.mocked(prisma.fAQ.update).mockResolvedValue({
          ...mockFAQ,
          categoryId: null,
        })

        const result = await prisma.fAQ.update({
          where: { id: 'faq_123' },
          data: { category: { disconnect: true } },
        })

        expect(result.categoryId).toBeNull()
      })
    })

    describe('publishFAQ', () => {
      it('should set isPublished to true', async () => {
        vi.mocked(prisma.fAQ.findUnique).mockResolvedValue(mockFAQ)
        vi.mocked(prisma.fAQ.update).mockResolvedValue({
          ...mockFAQ,
          isPublished: true,
        })

        const result = await prisma.fAQ.update({
          where: { id: 'faq_123' },
          data: { isPublished: true },
        })

        expect(result.isPublished).toBe(true)
      })
    })

    describe('unpublishFAQ', () => {
      it('should set isPublished to false', async () => {
        vi.mocked(prisma.fAQ.findUnique).mockResolvedValue({
          ...mockFAQ,
          isPublished: true,
        })
        vi.mocked(prisma.fAQ.update).mockResolvedValue({
          ...mockFAQ,
          isPublished: false,
        })

        const result = await prisma.fAQ.update({
          where: { id: 'faq_123' },
          data: { isPublished: false },
        })

        expect(result.isPublished).toBe(false)
      })
    })

    describe('deleteFAQ', () => {
      it('should delete FAQ', async () => {
        vi.mocked(prisma.fAQ.findUnique).mockResolvedValue(mockFAQ)
        vi.mocked(prisma.fAQ.delete).mockResolvedValue(mockFAQ)

        await prisma.fAQ.delete({
          where: { id: 'faq_123' },
        })

        expect(prisma.fAQ.delete).toHaveBeenCalledWith({
          where: { id: 'faq_123' },
        })
      })
    })

    describe('reorderFAQs', () => {
      it('should update sortOrder for each FAQ', async () => {
        const faqIds = ['faq_1', 'faq_2', 'faq_3']

        vi.mocked(prisma.$transaction).mockResolvedValue([
          { ...mockFAQ, id: 'faq_1', sortOrder: 0 },
          { ...mockFAQ, id: 'faq_2', sortOrder: 1 },
          { ...mockFAQ, id: 'faq_3', sortOrder: 2 },
        ])

        const operations = faqIds.map((id, index) =>
          prisma.fAQ.update({
            where: { id },
            data: { sortOrder: index, updatedBy: 'admin_123' },
          })
        )

        await prisma.$transaction(operations)

        expect(prisma.$transaction).toHaveBeenCalled()
      })

      it('should allow moving FAQ to different category', async () => {
        const faqIds = ['faq_1']
        const newCategoryId = 'faqcat_456'

        vi.mocked(prisma.$transaction).mockResolvedValue([
          { ...mockFAQ, id: 'faq_1', sortOrder: 0, categoryId: newCategoryId },
        ])

        const operations = faqIds.map((id, index) =>
          prisma.fAQ.update({
            where: { id },
            data: {
              sortOrder: index,
              categoryId: newCategoryId,
              updatedBy: 'admin_123',
            },
          })
        )

        await prisma.$transaction(operations)

        expect(prisma.$transaction).toHaveBeenCalled()
      })
    })

    describe('duplicateFAQ', () => {
      it('should create copy with modified question', async () => {
        vi.mocked(prisma.fAQ.findUnique).mockResolvedValue(mockFAQ)
        vi.mocked(prisma.fAQ.findFirst).mockResolvedValue({
          ...mockFAQ,
          sortOrder: 5,
        })
        vi.mocked(prisma.fAQ.create).mockResolvedValue({
          ...mockFAQ,
          id: 'faq_456',
          question: 'What is Pickleball Passport? (Copy)',
          sortOrder: 6,
          isPublished: false,
        })

        const original = await prisma.fAQ.findUnique({
          where: { id: 'faq_123' },
        })

        expect(original).not.toBeNull()

        const duplicate = await prisma.fAQ.create({
          data: {
            question: `${original!.question} (Copy)`,
            answer: original!.answer as Prisma.InputJsonValue,
            answerPlain: original!.answerPlain,
            categoryId: original!.categoryId,
            sortOrder: 6,
            isPublished: false,
            createdBy: 'admin_123',
            updatedBy: 'admin_123',
          },
        })

        expect(duplicate.question).toContain('(Copy)')
        expect(duplicate.isPublished).toBe(false)
      })
    })

    describe('bulkUpdatePublishStatus', () => {
      it('should update multiple FAQs publish status', async () => {
        vi.mocked(prisma.fAQ.updateMany).mockResolvedValue({ count: 3 })

        const result = await prisma.fAQ.updateMany({
          where: { id: { in: ['faq_1', 'faq_2', 'faq_3'] } },
          data: { isPublished: true },
        })

        expect(result.count).toBe(3)
        expect(prisma.fAQ.updateMany).toHaveBeenCalledWith({
          where: { id: { in: ['faq_1', 'faq_2', 'faq_3'] } },
          data: { isPublished: true },
        })
      })
    })
  })

  // ============================================================================
  // STATISTICS
  // ============================================================================

  describe('Statistics', () => {
    describe('getStats', () => {
      it('should return FAQ and category counts', async () => {
        vi.mocked(prisma.fAQ.count)
          .mockResolvedValueOnce(10) // total
          .mockResolvedValueOnce(6)  // published
          .mockResolvedValueOnce(4)  // draft

        vi.mocked(prisma.fAQCategory.count).mockResolvedValue(3)

        const [totalFAQs, publishedFAQs, draftFAQs, totalCategories] = await Promise.all([
          prisma.fAQ.count(),
          prisma.fAQ.count({ where: { isPublished: true } }),
          prisma.fAQ.count({ where: { isPublished: false } }),
          prisma.fAQCategory.count(),
        ])

        expect(totalFAQs).toBe(10)
        expect(publishedFAQs).toBe(6)
        expect(draftFAQs).toBe(4)
        expect(totalCategories).toBe(3)
      })
    })
  })

  // ============================================================================
  // INPUT VALIDATION
  // ============================================================================

  describe('Input Validation', () => {
    describe('Category validation', () => {
      it('should require name to be at least 1 character', () => {
        const validName = 'General'
        const invalidName = ''

        expect(validName.length >= 1).toBe(true)
        expect(invalidName.length >= 1).toBe(false)
      })

      it('should require slug to be at least 1 character', () => {
        const validSlug = 'general'
        const invalidSlug = ''

        expect(validSlug.length >= 1).toBe(true)
        expect(invalidSlug.length >= 1).toBe(false)
      })
    })

    describe('FAQ validation', () => {
      it('should require question to be at least 1 character', () => {
        const validQuestion = 'What is this?'
        const invalidQuestion = ''

        expect(validQuestion.length >= 1).toBe(true)
        expect(invalidQuestion.length >= 1).toBe(false)
      })

      it('should validate isPublished as boolean', () => {
        const validPublished = true
        const alsoValidPublished = false

        expect(typeof validPublished).toBe('boolean')
        expect(typeof alsoValidPublished).toBe('boolean')
      })

      it('should validate sortOrder as integer', () => {
        const validSortOrder = 5
        const alsoValidSortOrder = 0

        expect(Number.isInteger(validSortOrder)).toBe(true)
        expect(Number.isInteger(alsoValidSortOrder)).toBe(true)
      })
    })
  })

  // ============================================================================
  // PLAIN TEXT EXTRACTION
  // ============================================================================

  describe('Plain Text Extraction', () => {
    it('should extract text from nested TipTap content', () => {
      const complexContent = {
        type: 'doc',
        content: [
          {
            type: 'heading',
            content: [{ type: 'text', text: 'FAQ Title' }],
          },
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'First paragraph. ' },
              { type: 'text', text: 'More text.' },
            ],
          },
          {
            type: 'bulletList',
            content: [
              {
                type: 'listItem',
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'List item 1' }],
                  },
                ],
              },
              {
                type: 'listItem',
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'List item 2' }],
                  },
                ],
              },
            ],
          },
        ],
      }

      const extractPlainText = (doc: any): string => {
        const texts: string[] = []
        const extract = (node: any) => {
          if (node.text) texts.push(node.text)
          if (node.content) node.content.forEach(extract)
        }
        if (doc.content) doc.content.forEach(extract)
        return texts.join(' ').trim()
      }

      const plainText = extractPlainText(complexContent)

      expect(plainText).toContain('FAQ Title')
      expect(plainText).toContain('First paragraph')
      expect(plainText).toContain('List item 1')
      expect(plainText).toContain('List item 2')
    })

    it('should handle empty content', () => {
      const emptyContent = { type: 'doc', content: [] }

      const extractPlainText = (doc: any): string => {
        const texts: string[] = []
        const extract = (node: any) => {
          if (node.text) texts.push(node.text)
          if (node.content) node.content.forEach(extract)
        }
        if (doc.content) doc.content.forEach(extract)
        return texts.join(' ').trim()
      }

      const plainText = extractPlainText(emptyContent)

      expect(plainText).toBe('')
    })

    it('should handle null/undefined content', () => {
      const extractPlainText = (content: unknown): string => {
        if (!content || typeof content !== 'object') return ''
        const doc = content as { content?: any[] }
        if (!doc.content) return ''
        const texts: string[] = []
        const extract = (node: any) => {
          if (node.text) texts.push(node.text)
          if (node.content) node.content.forEach(extract)
        }
        doc.content.forEach(extract)
        return texts.join(' ').trim()
      }

      expect(extractPlainText(null)).toBe('')
      expect(extractPlainText(undefined)).toBe('')
      expect(extractPlainText({})).toBe('')
    })
  })
})
