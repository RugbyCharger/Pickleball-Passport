'use client'

/**
 * Admin Tasks Client Component
 *
 * Client-side component for admin task management
 */

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Plus, Pencil, Trash2, Calendar, AlertTriangle, AlertCircle, Minus } from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import {
  TaskList,
  PriorityFilter,
  StatusFilter,
  Task,
} from '@/components/dashboard/task-list'
import { TaskPriority, TaskStatus } from '@prisma/client'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Booking {
  id: string
  bookingReference: string
  user: {
    id: string
    email: string
    guestProfile: {
      firstName: string
      lastName: string
    } | null
  }
}

interface AdminTasksClientProps {
  bookings: Booking[]
}

export function AdminTasksClient({ bookings }: AdminTasksClientProps) {
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'ALL'>('ALL')
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'ALL'>('ALL')
  const [selectedBookingId, setSelectedBookingId] = useState<string | undefined>(undefined)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  // Fetch tasks
  const {
    data: tasksData,
    isLoading,
    refetch,
  } = trpc.task.getTasks.useQuery({
    bookingId: selectedBookingId,
    status: statusFilter === 'ALL' ? undefined : statusFilter,
    priority: priorityFilter === 'ALL' ? undefined : priorityFilter,
  })

  // Fetch task counts
  const { data: counts } = trpc.task.getCounts.useQuery()

  // Create task mutation
  const createTask = trpc.task.create.useMutation({
    onSuccess: () => {
      toast.success('Task created successfully')
      setIsCreateOpen(false)
      refetch()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create task')
    },
  })

  // Update task mutation
  const updateTask = trpc.task.update.useMutation({
    onSuccess: () => {
      toast.success('Task updated successfully')
      setEditingTask(null)
      refetch()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update task')
    },
  })

  // Delete task mutation
  const deleteTask = trpc.task.delete.useMutation({
    onSuccess: () => {
      toast.success('Task deleted successfully')
      refetch()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete task')
    },
  })

  // Mark complete mutation
  const markComplete = trpc.task.markComplete.useMutation({
    onSuccess: () => {
      toast.success('Task marked as complete')
      refetch()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to complete task')
    },
  })

  const tasks = tasksData?.tasks || []

  return (
    <div className="space-y-6">
      {/* Stats */}
      {counts && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{counts.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{counts.pending}</div>
            </CardContent>
          </Card>
          <Card className="border-red-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-600 flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" />
                Urgent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{counts.urgent}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-600">
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{counts.completed}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Actions & Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <CreateTaskDialog
            bookings={bookings}
            open={isCreateOpen}
            onOpenChange={setIsCreateOpen}
            onSubmit={(data) => createTask.mutate(data)}
            isSubmitting={createTask.isPending}
          />
        </div>

        <div className="flex flex-wrap gap-4">
          {/* Booking filter */}
          <Select
            value={selectedBookingId || 'all'}
            onValueChange={(value) =>
              setSelectedBookingId(value === 'all' ? undefined : value)
            }
          >
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Filter by booking" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Bookings</SelectItem>
              {bookings.map((booking) => (
                <SelectItem key={booking.id} value={booking.id}>
                  {booking.bookingReference} -{' '}
                  {booking.user.guestProfile
                    ? `${booking.user.guestProfile.firstName} ${booking.user.guestProfile.lastName}`
                    : booking.user.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Priority filter */}
          <div>
            <PriorityFilter value={priorityFilter} onChange={setPriorityFilter} />
          </div>

          {/* Status filter */}
          <div>
            <StatusFilter value={statusFilter} onChange={setStatusFilter} />
          </div>
        </div>
      </div>

      {/* Tasks list */}
      {isLoading ? (
        <Card>
          <CardContent className="py-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {tasks.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h4 className="font-semibold mb-2">No Tasks Found</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Create a task to get started
                </p>
                <Button onClick={() => setIsCreateOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Task
                </Button>
              </CardContent>
            </Card>
          ) : (
            tasks.map((task) => (
              <AdminTaskCard
                key={task.id}
                task={{
                  ...task,
                  dueDate: task.dueDate ? new Date(task.dueDate) : null,
                  createdAt: new Date(task.createdAt),
                }}
                onEdit={() =>
                  setEditingTask({
                    ...task,
                    dueDate: task.dueDate ? new Date(task.dueDate) : null,
                    createdAt: new Date(task.createdAt),
                  })
                }
                onDelete={() => deleteTask.mutate({ id: task.id })}
                onMarkComplete={() => markComplete.mutate({ id: task.id })}
                isDeleting={deleteTask.isPending}
              />
            ))
          )}
        </div>
      )}

      {/* Edit Task Dialog */}
      {editingTask && (
        <EditTaskDialog
          task={editingTask}
          bookings={bookings}
          open={!!editingTask}
          onOpenChange={(open) => !open && setEditingTask(null)}
          onSubmit={(data) => updateTask.mutate({ id: editingTask.id, ...data })}
          isSubmitting={updateTask.isPending}
        />
      )}
    </div>
  )
}

/**
 * Create Task Dialog
 */
interface CreateTaskDialogProps {
  bookings: Booking[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: {
    title: string
    description?: string
    priority: TaskPriority
    bookingId?: string
    assignedToUserId?: string
    dueDate?: string
  }) => void
  isSubmitting: boolean
}

function CreateTaskDialog({
  bookings,
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: CreateTaskDialogProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('NORMAL')
  const [bookingId, setBookingId] = useState<string>('')
  const [dueDate, setDueDate] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const selectedBooking = bookings.find((b) => b.id === bookingId)

    onSubmit({
      title,
      description: description || undefined,
      priority,
      bookingId: bookingId || undefined,
      assignedToUserId: selectedBooking?.user.id,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
    })

    // Reset form
    setTitle('')
    setDescription('')
    setPriority('NORMAL')
    setBookingId('')
    setDueDate('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>
              Create a task and assign it to a guest booking
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Upload passport copy"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Additional details about the task..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={priority}
                  onValueChange={(value) => setPriority(value as TaskPriority)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="URGENT">
                      <span className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        Urgent
                      </span>
                    </SelectItem>
                    <SelectItem value="IMPORTANT">
                      <span className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                        Important
                      </span>
                    </SelectItem>
                    <SelectItem value="NORMAL">
                      <span className="flex items-center gap-2">
                        <Minus className="h-4 w-4 text-gray-600" />
                        Normal
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="booking">Assign to Booking</Label>
              <Select value={bookingId} onValueChange={setBookingId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a booking (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {bookings.map((booking) => (
                    <SelectItem key={booking.id} value={booking.id}>
                      {booking.bookingReference} -{' '}
                      {booking.user.guestProfile
                        ? `${booking.user.guestProfile.firstName} ${booking.user.guestProfile.lastName}`
                        : booking.user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !title.trim()}>
              {isSubmitting ? 'Creating...' : 'Create Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Edit Task Dialog
 */
interface EditTaskDialogProps {
  task: Task
  bookings: Booking[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: {
    title?: string
    description?: string | null
    priority?: TaskPriority
    status?: TaskStatus
    dueDate?: string | null
  }) => void
  isSubmitting: boolean
}

function EditTaskDialog({
  task,
  bookings,
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: EditTaskDialogProps) {
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description || '')
  const [priority, setPriority] = useState<TaskPriority>(task.priority)
  const [status, setStatus] = useState<TaskStatus>(task.status)
  const [dueDate, setDueDate] = useState(
    task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      title,
      description: description || null,
      priority,
      status,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>Update task details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title *</Label>
              <Input
                id="edit-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={priority}
                  onValueChange={(value) => setPriority(value as TaskPriority)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                    <SelectItem value="IMPORTANT">Important</SelectItem>
                    <SelectItem value="NORMAL">Normal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={status}
                  onValueChange={(value) => setStatus(value as TaskStatus)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-dueDate">Due Date</Label>
              <Input
                id="edit-dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !title.trim()}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Admin Task Card with edit/delete actions
 */
interface AdminTaskCardProps {
  task: Task
  onEdit: () => void
  onDelete: () => void
  onMarkComplete: () => void
  isDeleting: boolean
}

function AdminTaskCard({
  task,
  onEdit,
  onDelete,
  onMarkComplete,
  isDeleting,
}: AdminTaskCardProps) {
  const priorityConfig = {
    URGENT: { className: 'bg-red-100 text-red-800 border-red-200', icon: AlertTriangle },
    IMPORTANT: { className: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: AlertCircle },
    NORMAL: { className: 'bg-gray-100 text-gray-600 border-gray-200', icon: Minus },
  }

  const statusConfig = {
    PENDING: { className: 'bg-gray-100 text-gray-600', label: 'Pending' },
    IN_PROGRESS: { className: 'bg-blue-100 text-blue-800', label: 'In Progress' },
    COMPLETED: { className: 'bg-green-100 text-green-800', label: 'Completed' },
  }

  const PriorityIcon = priorityConfig[task.priority].icon
  const isCompleted = task.status === 'COMPLETED'

  return (
    <Card className={cn(isCompleted && 'opacity-60')}>
      <CardContent className="py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2 mb-2">
              <h4 className={cn('font-medium', isCompleted && 'line-through text-muted-foreground')}>
                {task.title}
              </h4>
              <Badge variant="outline" className={priorityConfig[task.priority].className}>
                <PriorityIcon className="h-3 w-3 mr-1" />
                {task.priority}
              </Badge>
              <Badge variant="outline" className={statusConfig[task.status].className}>
                {statusConfig[task.status].label}
              </Badge>
            </div>

            {task.description && (
              <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
            )}

            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              {task.dueDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Due: {new Date(task.dueDate).toLocaleDateString()}
                </span>
              )}
              {task.booking && <span>Booking: {task.booking.bookingReference}</span>}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {!isCompleted && (
              <Button variant="outline" size="sm" onClick={onMarkComplete}>
                Complete
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              disabled={isDeleting}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
