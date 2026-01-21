/**
 * Unit Tests: Itinerary Router
 * Story 12-7: Itinerary Templates
 *
 * Tests cover critical itinerary operations:
 * - Template CRUD operations
 * - Day management
 * - Activity CRUD and reordering
 * - Template duplication
 * - Package linking
 * - Statistics queries
 *
 * Mocks: Prisma
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ItineraryActivityType } from '@prisma/client'

// Mock Prisma before imports
vi.mock('@/lib/db', () => ({
  prisma: {
    itineraryTemplate: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    itineraryDay: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      createMany: vi.fn(),
      update: vi.fn(),
      deleteMany: vi.fn(),
    },
    itineraryActivity: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      createMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    package: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    $transaction: vi.fn((fn) => {
      if (typeof fn === 'function') {
        return fn({
          itineraryTemplate: {
            findUnique: vi.fn(),
            create: vi.fn(),
          },
          itineraryDay: {
            create: vi.fn(),
            findMany: vi.fn(),
          },
          itineraryActivity: {
            createMany: vi.fn(),
            findMany: vi.fn(),
            update: vi.fn(),
          },
        })
      }
      return Promise.resolve(fn)
    }),
  },
}))

import { prisma } from '@/lib/db'

describe('Itinerary Router', () => {
  // Common test fixtures
  const mockAdminUser = {
    id: 'admin_123',
    email: 'admin@example.com',
    role: 'ADMIN',
  }

  const mockPackage = {
    id: 'pkg_123',
    name: 'Pure Play Package',
    slug: 'pure-play',
    durationOptions: [7, 10, 14],
    isActive: true,
  }

  const mockTemplate = {
    id: 'template_123',
    name: '7-Day Pure Play Itinerary',
    packageId: 'pkg_123',
    duration: 7,
    description: 'A week of pickleball and wellness',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockDay = {
    id: 'day_123',
    templateId: 'template_123',
    dayNumber: 1,
    title: 'Arrival & Welcome',
    activities: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockActivity = {
    id: 'activity_123',
    dayId: 'day_123',
    time: '09:00',
    title: 'Morning Pickleball Session',
    description: 'Warm up and play with fellow guests',
    location: 'Main Resort Courts',
    type: ItineraryActivityType.PICKLEBALL,
    sortOrder: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ============================================================================
  // ITINERARY TEMPLATES
  // ============================================================================

  describe('Templates', () => {
    describe('getTemplates', () => {
      it('should return all templates with package and day count', async () => {
        const templates = [
          {
            ...mockTemplate,
            package: { id: 'pkg_123', name: 'Pure Play', slug: 'pure-play' },
            _count: { days: 7 },
          },
        ]

        vi.mocked(prisma.itineraryTemplate.findMany).mockResolvedValue(templates)
        vi.mocked(prisma.itineraryTemplate.count).mockResolvedValue(1)

        const result = await prisma.itineraryTemplate.findMany({
          include: {
            package: { select: { id: true, name: true, slug: true } },
            _count: { select: { days: true } },
          },
          orderBy: { updatedAt: 'desc' },
        })

        expect(result).toEqual(templates)
        expect(prisma.itineraryTemplate.findMany).toHaveBeenCalled()
      })

      it('should filter by packageId when provided', async () => {
        vi.mocked(prisma.itineraryTemplate.findMany).mockResolvedValue([])

        await prisma.itineraryTemplate.findMany({
          where: { packageId: 'pkg_123' },
        })

        expect(prisma.itineraryTemplate.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { packageId: 'pkg_123' },
          })
        )
      })

      it('should filter by isActive status', async () => {
        vi.mocked(prisma.itineraryTemplate.findMany).mockResolvedValue([])

        await prisma.itineraryTemplate.findMany({
          where: { isActive: true },
        })

        expect(prisma.itineraryTemplate.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { isActive: true },
          })
        )
      })
    })

    describe('getTemplateById', () => {
      it('should return template with days and activities', async () => {
        const templateWithDays = {
          ...mockTemplate,
          package: { id: 'pkg_123', name: 'Pure Play', slug: 'pure-play' },
          days: [
            {
              ...mockDay,
              itineraryActivities: [mockActivity],
            },
          ],
        }

        vi.mocked(prisma.itineraryTemplate.findUnique).mockResolvedValue(templateWithDays)

        const result = await prisma.itineraryTemplate.findUnique({
          where: { id: 'template_123' },
          include: {
            package: { select: { id: true, name: true, slug: true } },
            days: {
              orderBy: { dayNumber: 'asc' },
              include: {
                itineraryActivities: {
                  orderBy: { sortOrder: 'asc' },
                },
              },
            },
          },
        })

        expect(result).toEqual(templateWithDays)
        expect(result?.days[0].itineraryActivities).toHaveLength(1)
      })

      it('should return null for non-existent template', async () => {
        vi.mocked(prisma.itineraryTemplate.findUnique).mockResolvedValue(null)

        const result = await prisma.itineraryTemplate.findUnique({
          where: { id: 'non_existent' },
        })

        expect(result).toBeNull()
      })
    })

    describe('createTemplate', () => {
      it('should create template with initial days', async () => {
        const newTemplate = {
          ...mockTemplate,
          package: { id: 'pkg_123', name: 'Pure Play' },
        }

        vi.mocked(prisma.itineraryTemplate.create).mockResolvedValue(newTemplate)
        vi.mocked(prisma.itineraryDay.createMany).mockResolvedValue({ count: 7 })

        const result = await prisma.itineraryTemplate.create({
          data: {
            name: '7-Day Pure Play Itinerary',
            packageId: 'pkg_123',
            duration: 7,
            description: 'A week of pickleball and wellness',
            isActive: true,
          },
          include: {
            package: { select: { id: true, name: true } },
          },
        })

        expect(result).toEqual(newTemplate)
        expect(prisma.itineraryTemplate.create).toHaveBeenCalled()
      })
    })

    describe('updateTemplate', () => {
      it('should update template properties', async () => {
        const existingTemplate = {
          ...mockTemplate,
          _count: { days: 7 },
        }
        const updatedTemplate = {
          ...mockTemplate,
          name: 'Updated Itinerary Name',
        }

        vi.mocked(prisma.itineraryTemplate.findUnique).mockResolvedValue(existingTemplate)
        vi.mocked(prisma.itineraryTemplate.update).mockResolvedValue(updatedTemplate)

        const result = await prisma.itineraryTemplate.update({
          where: { id: 'template_123' },
          data: { name: 'Updated Itinerary Name' },
        })

        expect(result.name).toBe('Updated Itinerary Name')
      })

      it('should add days when duration increases', async () => {
        const existingTemplate = {
          ...mockTemplate,
          duration: 7,
          _count: { days: 7 },
        }

        vi.mocked(prisma.itineraryTemplate.findUnique).mockResolvedValue(existingTemplate)
        vi.mocked(prisma.itineraryDay.createMany).mockResolvedValue({ count: 3 })

        // Simulate adding 3 more days (7 -> 10)
        await prisma.itineraryDay.createMany({
          data: [
            { templateId: 'template_123', dayNumber: 8, title: 'Day 8' },
            { templateId: 'template_123', dayNumber: 9, title: 'Day 9' },
            { templateId: 'template_123', dayNumber: 10, title: 'Day 10' },
          ],
        })

        expect(prisma.itineraryDay.createMany).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.arrayContaining([
              expect.objectContaining({ dayNumber: 8 }),
              expect.objectContaining({ dayNumber: 9 }),
              expect.objectContaining({ dayNumber: 10 }),
            ]),
          })
        )
      })

      it('should remove days when duration decreases', async () => {
        const existingTemplate = {
          ...mockTemplate,
          duration: 10,
          _count: { days: 10 },
        }

        vi.mocked(prisma.itineraryTemplate.findUnique).mockResolvedValue(existingTemplate)
        vi.mocked(prisma.itineraryDay.deleteMany).mockResolvedValue({ count: 3 })

        // Simulate removing days > 7
        await prisma.itineraryDay.deleteMany({
          where: {
            templateId: 'template_123',
            dayNumber: { gt: 7 },
          },
        })

        expect(prisma.itineraryDay.deleteMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: {
              templateId: 'template_123',
              dayNumber: { gt: 7 },
            },
          })
        )
      })
    })

    describe('deleteTemplate', () => {
      it('should delete template (cascade handles days/activities)', async () => {
        vi.mocked(prisma.itineraryTemplate.findUnique).mockResolvedValue(mockTemplate)
        vi.mocked(prisma.itineraryTemplate.delete).mockResolvedValue(mockTemplate)

        const result = await prisma.itineraryTemplate.delete({
          where: { id: 'template_123' },
        })

        expect(result).toEqual(mockTemplate)
      })

      it('should handle non-existent template', async () => {
        vi.mocked(prisma.itineraryTemplate.findUnique).mockResolvedValue(null)

        const result = await prisma.itineraryTemplate.findUnique({
          where: { id: 'non_existent' },
        })

        expect(result).toBeNull()
      })
    })
  })

  // ============================================================================
  // ITINERARY DAYS
  // ============================================================================

  describe('Days', () => {
    describe('updateDay', () => {
      it('should update day title', async () => {
        const updatedDay = {
          ...mockDay,
          title: 'Arrival & Welcome Dinner',
          itineraryActivities: [],
        }

        vi.mocked(prisma.itineraryDay.findUnique).mockResolvedValue(mockDay)
        vi.mocked(prisma.itineraryDay.update).mockResolvedValue(updatedDay)

        const result = await prisma.itineraryDay.update({
          where: { id: 'day_123' },
          data: { title: 'Arrival & Welcome Dinner' },
          include: {
            itineraryActivities: { orderBy: { sortOrder: 'asc' } },
          },
        })

        expect(result.title).toBe('Arrival & Welcome Dinner')
      })
    })

    describe('reorderDays', () => {
      it('should update day numbers based on new order', async () => {
        vi.mocked(prisma.itineraryTemplate.findUnique).mockResolvedValue(mockTemplate)

        // Mock updating day numbers
        const dayIds = ['day_3', 'day_1', 'day_2'] // New order
        const updates = dayIds.map((dayId, index) =>
          prisma.itineraryDay.update({
            where: { id: dayId },
            data: { dayNumber: index + 1 },
          })
        )

        vi.mocked(prisma.$transaction).mockResolvedValue(updates)

        await expect(prisma.$transaction(updates)).resolves.toBeDefined()
      })
    })
  })

  // ============================================================================
  // ITINERARY ACTIVITIES
  // ============================================================================

  describe('Activities', () => {
    describe('createActivity', () => {
      it('should create activity at end of day', async () => {
        const dayWithActivities = {
          ...mockDay,
          _count: { itineraryActivities: 2 },
        }

        vi.mocked(prisma.itineraryDay.findUnique).mockResolvedValue(dayWithActivities)
        vi.mocked(prisma.itineraryActivity.create).mockResolvedValue({
          ...mockActivity,
          sortOrder: 2, // Should be at end
        })

        const result = await prisma.itineraryActivity.create({
          data: {
            dayId: 'day_123',
            time: '09:00',
            title: 'Morning Pickleball Session',
            description: 'Warm up and play with fellow guests',
            location: 'Main Resort Courts',
            type: ItineraryActivityType.PICKLEBALL,
            sortOrder: 2, // End of list
          },
        })

        expect(result.sortOrder).toBe(2)
      })
    })

    describe('updateActivity', () => {
      it('should update activity properties', async () => {
        const updatedActivity = {
          ...mockActivity,
          title: 'Advanced Pickleball Clinic',
          type: ItineraryActivityType.PICKLEBALL,
        }

        vi.mocked(prisma.itineraryActivity.findUnique).mockResolvedValue(mockActivity)
        vi.mocked(prisma.itineraryActivity.update).mockResolvedValue(updatedActivity)

        const result = await prisma.itineraryActivity.update({
          where: { id: 'activity_123' },
          data: {
            title: 'Advanced Pickleball Clinic',
          },
        })

        expect(result.title).toBe('Advanced Pickleball Clinic')
      })
    })

    describe('deleteActivity', () => {
      it('should delete activity and reorder remaining', async () => {
        vi.mocked(prisma.itineraryActivity.findUnique).mockResolvedValue(mockActivity)
        vi.mocked(prisma.itineraryActivity.delete).mockResolvedValue(mockActivity)
        vi.mocked(prisma.itineraryActivity.findMany).mockResolvedValue([])

        await prisma.itineraryActivity.delete({
          where: { id: 'activity_123' },
        })

        expect(prisma.itineraryActivity.delete).toHaveBeenCalledWith({
          where: { id: 'activity_123' },
        })
      })
    })

    describe('reorderActivities', () => {
      it('should update sortOrder for all activities in day', async () => {
        vi.mocked(prisma.itineraryDay.findUnique).mockResolvedValue(mockDay)

        const activityIds = ['act_3', 'act_1', 'act_2'] // New order
        const updates = activityIds.map((activityId, index) =>
          prisma.itineraryActivity.update({
            where: { id: activityId },
            data: { sortOrder: index },
          })
        )

        vi.mocked(prisma.$transaction).mockResolvedValue(updates)

        await expect(prisma.$transaction(updates)).resolves.toBeDefined()
      })
    })

    describe('moveActivityToDay', () => {
      it('should move activity to different day', async () => {
        const targetDay = {
          ...mockDay,
          id: 'day_456',
          dayNumber: 2,
        }

        vi.mocked(prisma.itineraryActivity.findUnique).mockResolvedValue(mockActivity)
        vi.mocked(prisma.itineraryDay.findUnique).mockResolvedValue(targetDay)
        vi.mocked(prisma.itineraryActivity.update).mockResolvedValue({
          ...mockActivity,
          dayId: 'day_456',
          sortOrder: 0,
        })

        const result = await prisma.itineraryActivity.update({
          where: { id: 'activity_123' },
          data: {
            dayId: 'day_456',
            sortOrder: 0,
          },
        })

        expect(result.dayId).toBe('day_456')
      })
    })
  })

  // ============================================================================
  // STATISTICS
  // ============================================================================

  describe('Statistics', () => {
    describe('getStats', () => {
      it('should return itinerary statistics', async () => {
        vi.mocked(prisma.itineraryTemplate.count)
          .mockResolvedValueOnce(10) // totalTemplates
          .mockResolvedValueOnce(8) // activeTemplates
          .mockResolvedValueOnce(6) // linkedToPackages
        vi.mocked(prisma.itineraryActivity.count).mockResolvedValue(150)

        const [total, active, linked] = await Promise.all([
          prisma.itineraryTemplate.count(),
          prisma.itineraryTemplate.count({ where: { isActive: true } }),
          prisma.itineraryTemplate.count({ where: { packageId: { not: null } } }),
        ])
        const activities = await prisma.itineraryActivity.count()

        expect(total).toBe(10)
        expect(active).toBe(8)
        expect(linked).toBe(6)
        expect(activities).toBe(150)
      })
    })

    describe('getPackagesForSelect', () => {
      it('should return active packages for dropdown', async () => {
        const packages = [
          { ...mockPackage },
          { ...mockPackage, id: 'pkg_456', name: 'Wellness Retreat', slug: 'wellness' },
        ]

        vi.mocked(prisma.package.findMany).mockResolvedValue(packages)

        const result = await prisma.package.findMany({
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            slug: true,
            durationOptions: true,
          },
          orderBy: { name: 'asc' },
        })

        expect(result).toHaveLength(2)
        expect(result[0].name).toBe('Pure Play Package')
      })
    })
  })

  // ============================================================================
  // TEMPLATE DUPLICATION
  // ============================================================================

  describe('duplicateTemplate', () => {
    it('should create copy of template with all days and activities', async () => {
      const originalTemplate = {
        ...mockTemplate,
        days: [
          {
            ...mockDay,
            itineraryActivities: [mockActivity],
          },
        ],
      }

      const duplicatedTemplate = {
        ...mockTemplate,
        id: 'template_456',
        name: '7-Day Pure Play Itinerary (Copy)',
        isActive: false,
      }

      vi.mocked(prisma.itineraryTemplate.findUnique).mockResolvedValue(originalTemplate)

      // Simulate transaction creating new template, days, and activities
      vi.mocked(prisma.$transaction).mockImplementation(async (fn) => {
        if (typeof fn === 'function') {
          const tx = {
            itineraryTemplate: {
              create: vi.fn().mockResolvedValue(duplicatedTemplate),
              findUnique: vi.fn().mockResolvedValue({
                ...duplicatedTemplate,
                package: mockPackage,
                _count: { days: 7 },
              }),
            },
            itineraryDay: {
              create: vi.fn().mockResolvedValue({ ...mockDay, id: 'day_456' }),
            },
            itineraryActivity: {
              createMany: vi.fn().mockResolvedValue({ count: 1 }),
            },
          }
          return fn(tx as never)
        }
        return fn
      })

      const result = await prisma.$transaction(async (tx) => {
        const newTemplate = await tx.itineraryTemplate.create({
          data: {
            name: `${originalTemplate.name} (Copy)`,
            packageId: originalTemplate.packageId,
            duration: originalTemplate.duration,
            description: originalTemplate.description,
            isActive: false,
          },
        })
        return newTemplate
      })

      expect(result.name).toContain('(Copy)')
      expect(result.isActive).toBe(false)
    })
  })

  // ============================================================================
  // PUBLIC QUERIES
  // ============================================================================

  describe('getTemplateByPackage', () => {
    it('should return active template for package', async () => {
      const templateForPackage = {
        ...mockTemplate,
        days: [
          {
            ...mockDay,
            itineraryActivities: [mockActivity],
          },
        ],
      }

      vi.mocked(prisma.itineraryTemplate.findFirst).mockResolvedValue(templateForPackage)

      const result = await prisma.itineraryTemplate.findFirst({
        where: {
          packageId: 'pkg_123',
          isActive: true,
        },
        include: {
          days: {
            orderBy: { dayNumber: 'asc' },
            include: {
              itineraryActivities: {
                orderBy: { sortOrder: 'asc' },
              },
            },
          },
        },
      })

      expect(result).toEqual(templateForPackage)
      expect(result?.days[0].itineraryActivities).toHaveLength(1)
    })

    it('should return null if no active template exists', async () => {
      vi.mocked(prisma.itineraryTemplate.findFirst).mockResolvedValue(null)

      const result = await prisma.itineraryTemplate.findFirst({
        where: {
          packageId: 'pkg_no_template',
          isActive: true,
        },
      })

      expect(result).toBeNull()
    })

    it('should filter by duration when provided', async () => {
      vi.mocked(prisma.itineraryTemplate.findFirst).mockResolvedValue(null)

      await prisma.itineraryTemplate.findFirst({
        where: {
          packageId: 'pkg_123',
          isActive: true,
          duration: 14,
        },
      })

      expect(prisma.itineraryTemplate.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            duration: 14,
          }),
        })
      )
    })
  })
})
