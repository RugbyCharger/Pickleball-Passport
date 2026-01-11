'use client'

/**
 * Guest Task Section
 *
 * Client component for displaying and managing guest tasks on dashboard
 * Features:
 * - View tasks assigned to current user
 * - Filter by booking
 * - Mark tasks as complete
 */

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CheckSquare } from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { TaskList, StatusFilter } from '@/components/dashboard/task-list'
import { TaskStatus } from '@prisma/client'
import { toast } from 'sonner'

interface GuestTaskSectionProps {
  userId: string
}

export function GuestTaskSection({ userId }: GuestTaskSectionProps) {
  const [selectedBookingId, setSelectedBookingId] = useState<string | undefined>(undefined)
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'ALL'>('ALL')

  // Fetch user's tasks
  const {
    data: tasks,
    isLoading: tasksLoading,
    refetch: refetchTasks,
  } = trpc.task.getMyTasks.useQuery({
    bookingId: selectedBookingId,
    status: statusFilter === 'ALL' ? undefined : statusFilter,
  })

  // Fetch user's bookings for filter dropdown
  const { data: bookingsData } = trpc.booking.list.useQuery(undefined, {
    select: (data) =>
      data.map((b: { id: string; bookingReference: string }) => ({
        id: b.id,
        bookingReference: b.bookingReference,
      })),
  })

  // Mark task complete mutation
  const markComplete = trpc.task.markComplete.useMutation({
    onSuccess: () => {
      toast.success('Task marked as complete')
      refetchTasks()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to complete task')
    },
  })

  const handleMarkComplete = (taskId: string) => {
    markComplete.mutate({ id: taskId })
  }

  // Filter tasks by status locally (since API might not support all filters)
  const filteredTasks = tasks?.filter((task) => {
    if (statusFilter === 'ALL') return true
    return task.status === statusFilter
  }) || []

  // Don't show section if no tasks exist
  if (!tasksLoading && (!tasks || tasks.length === 0) && !selectedBookingId && statusFilter === 'ALL') {
    return null
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <CheckSquare className="h-5 w-5" />
          Your Tasks
        </h3>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        {/* Booking filter */}
        {bookingsData && bookingsData.length > 1 && (
          <Select
            value={selectedBookingId || 'all'}
            onValueChange={(value) =>
              setSelectedBookingId(value === 'all' ? undefined : value)
            }
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by booking" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Bookings</SelectItem>
              {bookingsData.map((booking: { id: string; bookingReference: string }) => (
                <SelectItem key={booking.id} value={booking.id}>
                  {booking.bookingReference}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Status filter */}
        <StatusFilter value={statusFilter} onChange={setStatusFilter} />
      </div>

      {/* Tasks list */}
      {tasksLoading ? (
        <Card>
          <CardContent className="py-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          </CardContent>
        </Card>
      ) : (
        <TaskList
          tasks={filteredTasks.map((task) => ({
            ...task,
            dueDate: task.dueDate ? new Date(task.dueDate) : null,
            createdAt: new Date(task.createdAt),
          }))}
          onMarkComplete={handleMarkComplete}
          isMarkingComplete={markComplete.isPending}
          showBookingReference={!selectedBookingId}
          emptyMessage="No tasks assigned to you"
        />
      )}
    </div>
  )
}
