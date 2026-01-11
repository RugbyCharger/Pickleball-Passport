'use client'

/**
 * Task List Component
 *
 * Displays tasks with priority badges sorted by priority then due date
 * Features:
 * - Priority badges (red=URGENT, yellow=IMPORTANT, gray=NORMAL)
 * - Task status indicators
 * - Linked booking reference
 * - Mark complete action
 */

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Calendar, CheckCircle2, Circle, Clock, AlertTriangle, AlertCircle, Minus } from 'lucide-react'
import { TaskPriority, TaskStatus } from '@prisma/client'
import { cn } from '@/lib/utils'

export interface Task {
  id: string
  title: string
  description: string | null
  priority: TaskPriority
  status: TaskStatus
  dueDate: Date | null
  createdAt: Date
  booking: {
    id: string
    bookingReference: string
  } | null
}

interface TaskListProps {
  tasks: Task[]
  onMarkComplete?: (taskId: string) => void
  isMarkingComplete?: boolean
  showBookingReference?: boolean
  emptyMessage?: string
}

/**
 * Get priority badge styling
 */
function getPriorityBadge(priority: TaskPriority) {
  switch (priority) {
    case 'URGENT':
      return {
        className: 'bg-red-100 text-red-800 border-red-200',
        icon: AlertTriangle,
        label: 'Urgent',
      }
    case 'IMPORTANT':
      return {
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: AlertCircle,
        label: 'Important',
      }
    case 'NORMAL':
    default:
      return {
        className: 'bg-gray-100 text-gray-600 border-gray-200',
        icon: Minus,
        label: 'Normal',
      }
  }
}

/**
 * Get status styling
 */
function getStatusBadge(status: TaskStatus) {
  switch (status) {
    case 'COMPLETED':
      return {
        className: 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircle2,
        label: 'Completed',
      }
    case 'IN_PROGRESS':
      return {
        className: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: Clock,
        label: 'In Progress',
      }
    case 'PENDING':
    default:
      return {
        className: 'bg-gray-100 text-gray-600 border-gray-200',
        icon: Circle,
        label: 'Pending',
      }
  }
}

/**
 * Format date for display
 */
function formatDueDate(date: Date | null): string | null {
  if (!date) return null
  const d = new Date(date)
  const now = new Date()
  const diffDays = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''}`
  if (diffDays === 0) return 'Due today'
  if (diffDays === 1) return 'Due tomorrow'
  if (diffDays <= 7) return `Due in ${diffDays} days`
  return d.toLocaleDateString()
}

/**
 * Check if task is overdue
 */
function isOverdue(dueDate: Date | null): boolean {
  if (!dueDate) return false
  return new Date(dueDate) < new Date()
}

export function TaskList({
  tasks,
  onMarkComplete,
  isMarkingComplete = false,
  showBookingReference = true,
  emptyMessage = 'No tasks found',
}: TaskListProps) {
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null)

  const handleMarkComplete = async (taskId: string) => {
    if (!onMarkComplete) return
    setCompletingTaskId(taskId)
    try {
      await onMarkComplete(taskId)
    } finally {
      setCompletingTaskId(null)
    }
  }

  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <CheckCircle2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h4 className="font-semibold mb-2">All Caught Up!</h4>
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => {
        const priorityBadge = getPriorityBadge(task.priority)
        const statusBadge = getStatusBadge(task.status)
        const PriorityIcon = priorityBadge.icon
        const dueDateText = formatDueDate(task.dueDate)
        const taskIsOverdue = isOverdue(task.dueDate) && task.status !== 'COMPLETED'
        const isCompleted = task.status === 'COMPLETED'
        const isLoading = completingTaskId === task.id || isMarkingComplete

        return (
          <Card
            key={task.id}
            className={cn(
              'transition-all',
              isCompleted && 'opacity-60',
              taskIsOverdue && 'border-red-200 bg-red-50/50'
            )}
          >
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                {/* Checkbox for completing tasks */}
                {onMarkComplete && !isCompleted && (
                  <div className="pt-0.5">
                    <Checkbox
                      checked={false}
                      disabled={isLoading}
                      onCheckedChange={() => handleMarkComplete(task.id)}
                      aria-label={`Mark "${task.title}" as complete`}
                    />
                  </div>
                )}

                {/* Completed checkmark */}
                {isCompleted && (
                  <div className="pt-0.5">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </div>
                )}

                {/* Task content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4
                      className={cn(
                        'font-medium text-sm',
                        isCompleted && 'line-through text-muted-foreground'
                      )}
                    >
                      {task.title}
                    </h4>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Priority badge */}
                      <Badge
                        variant="outline"
                        className={cn('text-xs', priorityBadge.className)}
                      >
                        <PriorityIcon className="h-3 w-3 mr-1" />
                        {priorityBadge.label}
                      </Badge>
                    </div>
                  </div>

                  {/* Description */}
                  {task.description && (
                    <p
                      className={cn(
                        'text-sm text-muted-foreground mb-2',
                        isCompleted && 'line-through'
                      )}
                    >
                      {task.description}
                    </p>
                  )}

                  {/* Meta info */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    {/* Due date */}
                    {dueDateText && (
                      <span
                        className={cn(
                          'flex items-center gap-1',
                          taskIsOverdue && 'text-red-600 font-medium'
                        )}
                      >
                        <Calendar className="h-3 w-3" />
                        {dueDateText}
                      </span>
                    )}

                    {/* Booking reference */}
                    {showBookingReference && task.booking && (
                      <span className="flex items-center gap-1">
                        Booking: {task.booking.bookingReference}
                      </span>
                    )}

                    {/* Status badge (only show if not pending) */}
                    {task.status !== 'PENDING' && (
                      <Badge
                        variant="outline"
                        className={cn('text-xs', statusBadge.className)}
                      >
                        {statusBadge.label}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

/**
 * Priority Filter Component
 */
interface PriorityFilterProps {
  value: TaskPriority | 'ALL'
  onChange: (value: TaskPriority | 'ALL') => void
}

const priorityOptions: { value: TaskPriority | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'URGENT', label: 'Urgent' },
  { value: 'IMPORTANT', label: 'Important' },
  { value: 'NORMAL', label: 'Normal' },
]

export function PriorityFilter({ value, onChange }: PriorityFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {priorityOptions.map((option) => (
        <Button
          key={option.value}
          variant={value === option.value ? 'default' : 'outline'}
          size="sm"
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  )
}

/**
 * Status Filter Component
 */
interface StatusFilterProps {
  value: TaskStatus | 'ALL'
  onChange: (value: TaskStatus | 'ALL') => void
}

const statusOptions: { value: TaskStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
]

export function StatusFilter({ value, onChange }: StatusFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {statusOptions.map((option) => (
        <Button
          key={option.value}
          variant={value === option.value ? 'default' : 'outline'}
          size="sm"
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  )
}
