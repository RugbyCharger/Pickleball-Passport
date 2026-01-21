/**
 * Admin Itinerary Template Editor
 * Story 12-7: Itinerary Templates
 *
 * Visual day-by-day editor featuring:
 * - Drag-and-drop activity reordering
 * - Activity CRUD operations
 * - Day title editing
 * - Package linking
 * - Template settings
 */

'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc/client';
import {
  Save,
  Loader2,
  ArrowLeft,
  Plus,
  Trash2,
  GripVertical,
  Clock,
  MapPin,
  ChevronDown,
  ChevronUp,
  Eye,
  Edit2,
  Check,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Activity type colors and labels
const ACTIVITY_TYPES = {
  PICKLEBALL: { label: 'Pickleball', color: 'bg-green-100 text-green-700 border-green-200' },
  MEDICAL: { label: 'Medical', color: 'bg-red-100 text-red-700 border-red-200' },
  WELLNESS: { label: 'Wellness', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  CULTURAL: { label: 'Cultural', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  MEAL: { label: 'Meal', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  FREE_TIME: { label: 'Free Time', color: 'bg-blue-100 text-blue-700 border-blue-200' },
} as const;

type ActivityType = keyof typeof ACTIVITY_TYPES;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ItineraryEditorPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const isNew = resolvedParams.id === 'new';
  const router = useRouter();
  const utils = trpc.useUtils();

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(7);
  const [packageId, setPackageId] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(true);

  // UI state
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const [editingDayId, setEditingDayId] = useState<string | null>(null);
  const [editingDayTitle, setEditingDayTitle] = useState('');
  const [activityDialog, setActivityDialog] = useState<{
    open: boolean;
    dayId: string | null;
    activity: {
      id?: string;
      time?: string;
      title: string;
      description?: string;
      location?: string;
      type: ActivityType;
    } | null;
  }>({ open: false, dayId: null, activity: null });
  const [deleteActivityId, setDeleteActivityId] = useState<string | null>(null);
  const [draggedActivity, setDraggedActivity] = useState<string | null>(null);

  // Fetch template if editing
  const { data: template, isLoading } = trpc.itinerary.getTemplateById.useQuery(
    { id: resolvedParams.id },
    { enabled: !isNew }
  );

  // Fetch packages for select
  const { data: packages } = trpc.itinerary.getPackagesForSelect.useQuery();

  // Mutations
  const createMutation = trpc.itinerary.createTemplate.useMutation({
    onSuccess: (data) => {
      toast.success('Template created successfully');
      router.push(`/dashboard/admin/cms/itineraries/${data.id}`);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create template');
    },
  });

  const updateMutation = trpc.itinerary.updateTemplate.useMutation({
    onSuccess: () => {
      toast.success('Template updated successfully');
      utils.itinerary.getTemplateById.invalidate({ id: resolvedParams.id });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update template');
    },
  });

  const updateDayMutation = trpc.itinerary.updateDay.useMutation({
    onSuccess: () => {
      utils.itinerary.getTemplateById.invalidate({ id: resolvedParams.id });
      setEditingDayId(null);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update day');
    },
  });

  const createActivityMutation = trpc.itinerary.createActivity.useMutation({
    onSuccess: () => {
      toast.success('Activity created');
      utils.itinerary.getTemplateById.invalidate({ id: resolvedParams.id });
      setActivityDialog({ open: false, dayId: null, activity: null });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create activity');
    },
  });

  const updateActivityMutation = trpc.itinerary.updateActivity.useMutation({
    onSuccess: () => {
      toast.success('Activity updated');
      utils.itinerary.getTemplateById.invalidate({ id: resolvedParams.id });
      setActivityDialog({ open: false, dayId: null, activity: null });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update activity');
    },
  });

  const deleteActivityMutation = trpc.itinerary.deleteActivity.useMutation({
    onSuccess: () => {
      toast.success('Activity deleted');
      utils.itinerary.getTemplateById.invalidate({ id: resolvedParams.id });
      setDeleteActivityId(null);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete activity');
    },
  });

  const reorderActivitiesMutation = trpc.itinerary.reorderActivities.useMutation({
    onSuccess: () => {
      utils.itinerary.getTemplateById.invalidate({ id: resolvedParams.id });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to reorder activities');
    },
  });

  // Initialize form from template
  useEffect(() => {
    if (template) {
      setName(template.name);
      setDescription(template.description || '');
      setDuration(template.duration);
      setPackageId(template.packageId);
      setIsActive(template.isActive);
      // Expand all days by default
      setExpandedDays(new Set(template.days.map((d) => d.id)));
    }
  }, [template]);

  const handleSave = () => {
    if (!name.trim()) {
      toast.error('Template name is required');
      return;
    }

    if (isNew) {
      createMutation.mutate({
        name: name.trim(),
        description: description.trim() || undefined,
        duration,
        packageId: packageId || undefined,
        isActive,
      });
    } else {
      updateMutation.mutate({
        id: resolvedParams.id,
        name: name.trim(),
        description: description.trim() || null,
        duration,
        packageId: packageId || null,
        isActive,
      });
    }
  };

  const handleSaveDayTitle = (dayId: string) => {
    if (editingDayTitle.trim()) {
      updateDayMutation.mutate({
        id: dayId,
        title: editingDayTitle.trim(),
      });
    } else {
      setEditingDayId(null);
    }
  };

  const handleSaveActivity = () => {
    const { dayId, activity } = activityDialog;
    if (!dayId || !activity || !activity.title.trim()) {
      toast.error('Activity title is required');
      return;
    }

    if (activity.id) {
      // Update existing
      updateActivityMutation.mutate({
        id: activity.id,
        time: activity.time || null,
        title: activity.title.trim(),
        description: activity.description || null,
        location: activity.location || null,
        type: activity.type,
      });
    } else {
      // Create new
      createActivityMutation.mutate({
        dayId,
        time: activity.time || undefined,
        title: activity.title.trim(),
        description: activity.description || undefined,
        location: activity.location || undefined,
        type: activity.type,
      });
    }
  };

  const toggleDay = (dayId: string) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(dayId)) {
      newExpanded.delete(dayId);
    } else {
      newExpanded.add(dayId);
    }
    setExpandedDays(newExpanded);
  };

  // Simple drag and drop handlers
  const handleDragStart = (activityId: string) => {
    setDraggedActivity(activityId);
  };

  const handleDragOver = (e: React.DragEvent, targetActivityId: string, dayId: string) => {
    e.preventDefault();
    if (!draggedActivity || draggedActivity === targetActivityId) return;

    const day = template?.days.find((d) => d.id === dayId);
    if (!day) return;

    const activities = day.itineraryActivities;
    const draggedIndex = activities.findIndex((a) => a.id === draggedActivity);
    const targetIndex = activities.findIndex((a) => a.id === targetActivityId);

    if (draggedIndex === -1) return;

    // Reorder activities
    const newOrder = [...activities];
    const [removed] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, removed);

    reorderActivitiesMutation.mutate({
      dayId,
      activityIds: newOrder.map((a) => a.id),
    });
  };

  const handleDragEnd = () => {
    setDraggedActivity(null);
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  if (isLoading && !isNew) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/admin/cms/itineraries">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {isNew ? 'Create Itinerary Template' : 'Edit Itinerary Template'}
              </h1>
              {!isNew && template && (
                <p className="text-sm text-slate-500">Last updated {new Date(template.updatedAt).toLocaleDateString()}</p>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            {!isNew && (
              <Link href={`/dashboard/admin/cms/itineraries/${resolvedParams.id}/preview`}>
                <Button variant="outline" className="gap-2">
                  <Eye className="h-4 w-4" />
                  Preview
                </Button>
              </Link>
            )}
            <Button onClick={handleSave} disabled={isSaving} className="gap-2">
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isNew ? 'Create Template' : 'Save Changes'}
            </Button>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Template Settings Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              <div className="rounded-lg border border-slate-200 bg-white p-6">
                <h2 className="mb-4 text-lg font-semibold text-slate-900">Template Settings</h2>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Template Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., 7-Day Pure Play Itinerary"
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Brief description of this itinerary..."
                      rows={3}
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="duration">Duration (Days)</Label>
                    <Input
                      id="duration"
                      type="number"
                      min={1}
                      max={30}
                      value={duration}
                      onChange={(e) => setDuration(parseInt(e.target.value) || 1)}
                      className="mt-1.5"
                    />
                    {!isNew && template && duration !== template.duration && (
                      <p className="mt-1 text-xs text-amber-600">
                        Changing duration will {duration > template.duration ? 'add' : 'remove'} days
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="package">Link to Package</Label>
                    <Select
                      value={packageId || 'none'}
                      onValueChange={(v) => setPackageId(v === 'none' ? null : v)}
                    >
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select a package" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Package</SelectItem>
                        {packages?.map((pkg) => (
                          <SelectItem key={pkg.id} value={pkg.id}>
                            {pkg.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <Label htmlFor="active">Active</Label>
                      <p className="text-xs text-slate-500">Show on package pages</p>
                    </div>
                    <Switch
                      id="active"
                      checked={isActive}
                      onCheckedChange={setIsActive}
                    />
                  </div>
                </div>
              </div>

              {/* Activity Types Legend */}
              <div className="rounded-lg border border-slate-200 bg-white p-6">
                <h3 className="mb-3 text-sm font-medium text-slate-900">Activity Types</h3>
                <div className="space-y-2">
                  {Object.entries(ACTIVITY_TYPES).map(([type, config]) => (
                    <div key={type} className="flex items-center gap-2">
                      <span className={cn('rounded px-2 py-0.5 text-xs font-medium', config.color)}>
                        {config.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Day-by-Day Editor */}
          <div className="lg:col-span-2">
            {isNew ? (
              <div className="rounded-lg border border-slate-200 bg-white p-12 text-center">
                <p className="text-slate-500">
                  Save the template first to start adding days and activities
                </p>
              </div>
            ) : template?.days && template.days.length > 0 ? (
              <div className="space-y-4">
                {template.days.map((day) => (
                  <div
                    key={day.id}
                    className="rounded-lg border border-slate-200 bg-white overflow-hidden"
                  >
                    {/* Day Header */}
                    <div
                      className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3 cursor-pointer"
                      onClick={() => toggleDay(day.id)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                          {day.dayNumber}
                        </span>
                        {editingDayId === day.id ? (
                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <Input
                              value={editingDayTitle}
                              onChange={(e) => setEditingDayTitle(e.target.value)}
                              className="h-8 w-48"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveDayTitle(day.id);
                                if (e.key === 'Escape') setEditingDayId(null);
                              }}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSaveDayTitle(day.id)}
                            >
                              <Check className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingDayId(null)}
                            >
                              <X className="h-4 w-4 text-slate-400" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-900">{day.title}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingDayId(day.id);
                                setEditingDayTitle(day.title);
                              }}
                            >
                              <Edit2 className="h-3.5 w-3.5 text-slate-400" />
                            </Button>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-500">
                          {day.itineraryActivities.length} activities
                        </span>
                        {expandedDays.has(day.id) ? (
                          <ChevronUp className="h-5 w-5 text-slate-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-slate-400" />
                        )}
                      </div>
                    </div>

                    {/* Activities */}
                    {expandedDays.has(day.id) && (
                      <div className="p-4">
                        {day.itineraryActivities.length > 0 ? (
                          <div className="space-y-2">
                            {day.itineraryActivities.map((activity) => (
                              <div
                                key={activity.id}
                                draggable
                                onDragStart={() => handleDragStart(activity.id)}
                                onDragOver={(e) => handleDragOver(e, activity.id, day.id)}
                                onDragEnd={handleDragEnd}
                                className={cn(
                                  'group flex items-start gap-3 rounded-lg border p-3 transition-colors',
                                  draggedActivity === activity.id
                                    ? 'border-blue-300 bg-blue-50'
                                    : 'border-slate-200 bg-white hover:border-slate-300'
                                )}
                              >
                                <div className="cursor-move text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <GripVertical className="h-5 w-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={cn(
                                        'rounded px-2 py-0.5 text-xs font-medium border',
                                        ACTIVITY_TYPES[activity.type as ActivityType]?.color
                                      )}
                                    >
                                      {ACTIVITY_TYPES[activity.type as ActivityType]?.label}
                                    </span>
                                    <span className="font-medium text-slate-900 truncate">
                                      {activity.title}
                                    </span>
                                  </div>
                                  <div className="mt-1 flex items-center gap-4 text-sm text-slate-500">
                                    {activity.time && (
                                      <span className="flex items-center gap-1">
                                        <Clock className="h-3.5 w-3.5" />
                                        {activity.time}
                                      </span>
                                    )}
                                    {activity.location && (
                                      <span className="flex items-center gap-1">
                                        <MapPin className="h-3.5 w-3.5" />
                                        {activity.location}
                                      </span>
                                    )}
                                  </div>
                                  {activity.description && (
                                    <p className="mt-1 text-sm text-slate-600 line-clamp-2">
                                      {activity.description}
                                    </p>
                                  )}
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      setActivityDialog({
                                        open: true,
                                        dayId: day.id,
                                        activity: {
                                          id: activity.id,
                                          time: activity.time || undefined,
                                          title: activity.title,
                                          description: activity.description || undefined,
                                          location: activity.location || undefined,
                                          type: activity.type as ActivityType,
                                        },
                                      })
                                    }
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setDeleteActivityId(activity.id)}
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="py-4 text-center text-sm text-slate-500">
                            No activities yet
                          </p>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-3 w-full gap-1"
                          onClick={() =>
                            setActivityDialog({
                              open: true,
                              dayId: day.id,
                              activity: {
                                title: '',
                                type: 'PICKLEBALL',
                              },
                            })
                          }
                        >
                          <Plus className="h-4 w-4" />
                          Add Activity
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-slate-200 bg-white p-12 text-center">
                <p className="text-slate-500">No days configured for this template</p>
              </div>
            )}
          </div>
        </div>

        {/* Activity Dialog */}
        <Dialog
          open={activityDialog.open}
          onOpenChange={(open) => {
            if (!open) setActivityDialog({ open: false, dayId: null, activity: null });
          }}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {activityDialog.activity?.id ? 'Edit Activity' : 'Add Activity'}
              </DialogTitle>
              <DialogDescription>
                Configure the activity details
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="activityTitle">Title</Label>
                <Input
                  id="activityTitle"
                  value={activityDialog.activity?.title || ''}
                  onChange={(e) =>
                    setActivityDialog((prev) => ({
                      ...prev,
                      activity: prev.activity
                        ? { ...prev.activity, title: e.target.value }
                        : null,
                    }))
                  }
                  placeholder="e.g., Morning Pickleball Session"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="activityType">Type</Label>
                <Select
                  value={activityDialog.activity?.type || 'PICKLEBALL'}
                  onValueChange={(v) =>
                    setActivityDialog((prev) => ({
                      ...prev,
                      activity: prev.activity
                        ? { ...prev.activity, type: v as ActivityType }
                        : null,
                    }))
                  }
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ACTIVITY_TYPES).map(([type, config]) => (
                      <SelectItem key={type} value={type}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="activityTime">Time</Label>
                  <Input
                    id="activityTime"
                    value={activityDialog.activity?.time || ''}
                    onChange={(e) =>
                      setActivityDialog((prev) => ({
                        ...prev,
                        activity: prev.activity
                          ? { ...prev.activity, time: e.target.value }
                          : null,
                      }))
                    }
                    placeholder="e.g., 09:00"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="activityLocation">Location</Label>
                  <Input
                    id="activityLocation"
                    value={activityDialog.activity?.location || ''}
                    onChange={(e) =>
                      setActivityDialog((prev) => ({
                        ...prev,
                        activity: prev.activity
                          ? { ...prev.activity, location: e.target.value }
                          : null,
                      }))
                    }
                    placeholder="e.g., Main Courts"
                    className="mt-1.5"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="activityDescription">Description</Label>
                <Textarea
                  id="activityDescription"
                  value={activityDialog.activity?.description || ''}
                  onChange={(e) =>
                    setActivityDialog((prev) => ({
                      ...prev,
                      activity: prev.activity
                        ? { ...prev.activity, description: e.target.value }
                        : null,
                    }))
                  }
                  placeholder="Optional description..."
                  rows={3}
                  className="mt-1.5"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setActivityDialog({ open: false, dayId: null, activity: null })}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveActivity}
                disabled={createActivityMutation.isPending || updateActivityMutation.isPending}
              >
                {(createActivityMutation.isPending || updateActivityMutation.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {activityDialog.activity?.id ? 'Save Changes' : 'Add Activity'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Activity Dialog */}
        <Dialog open={!!deleteActivityId} onOpenChange={() => setDeleteActivityId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Activity</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this activity? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteActivityId(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (deleteActivityId) {
                    deleteActivityMutation.mutate({ id: deleteActivityId });
                  }
                }}
                disabled={deleteActivityMutation.isPending}
              >
                {deleteActivityMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
