/**
 * Admin Itinerary Templates Page
 * Story 12-7: Itinerary Templates
 *
 * Management page for itinerary templates featuring:
 * - List of all templates with filtering
 * - Quick stats overview
 * - Create, edit, duplicate, delete actions
 * - Link templates to packages
 */

'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import {
  Plus,
  Loader2,
  Search,
  Calendar,
  Package,
  Copy,
  Trash2,
  Edit,
  Eye,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  CalendarDays,
  Activity,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function ItinerariesPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const utils = trpc.useUtils();

  // Fetch templates
  const { data, isLoading } = trpc.itinerary.getTemplates.useQuery({
    search: search || undefined,
    isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
  });

  // Fetch stats
  const { data: stats } = trpc.itinerary.getStats.useQuery();

  // Delete mutation
  const deleteMutation = trpc.itinerary.deleteTemplate.useMutation({
    onSuccess: () => {
      toast.success('Template deleted successfully');
      utils.itinerary.getTemplates.invalidate();
      utils.itinerary.getStats.invalidate();
      setDeleteId(null);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete template');
    },
  });

  // Duplicate mutation
  const duplicateMutation = trpc.itinerary.duplicateTemplate.useMutation({
    onSuccess: () => {
      toast.success('Template duplicated successfully');
      utils.itinerary.getTemplates.invalidate();
      utils.itinerary.getStats.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to duplicate template');
    },
  });

  const handleDelete = () => {
    if (deleteId) {
      deleteMutation.mutate({ id: deleteId });
    }
  };

  const handleDuplicate = (id: string) => {
    duplicateMutation.mutate({ id });
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Itinerary Templates</h1>
              <p className="mt-2 text-slate-600">
                Create and manage day-by-day schedules for packages
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/dashboard/admin/cms">
                <Button variant="outline">Back to CMS</Button>
              </Link>
              <Link href="/dashboard/admin/cms/itineraries/new">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Template
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-blue-100 p-2.5">
                <CalendarDays className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Total Templates</p>
                <p className="text-2xl font-bold text-slate-900">{stats?.totalTemplates || 0}</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-emerald-100 p-2.5">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Active</p>
                <p className="text-2xl font-bold text-slate-900">{stats?.activeTemplates || 0}</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-purple-100 p-2.5">
                <Package className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Linked to Packages</p>
                <p className="text-2xl font-bold text-slate-900">{stats?.linkedToPackages || 0}</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-amber-100 p-2.5">
                <Activity className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Total Activities</p>
                <p className="text-2xl font-bold text-slate-900">{stats?.totalActivities || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Templates</SelectItem>
              <SelectItem value="active">Active Only</SelectItem>
              <SelectItem value="inactive">Inactive Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Templates List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : data?.templates && data.templates.length > 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white">
            <div className="divide-y divide-slate-200">
              {data.templates.map((template) => (
                <div
                  key={template.id}
                  className="flex items-center justify-between px-6 py-4 hover:bg-slate-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-slate-900">{template.name}</span>
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                          template.isActive
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-600'
                        )}
                      >
                        {template.isActive ? (
                          <>
                            <CheckCircle className="h-3 w-3" />
                            Active
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3" />
                            Inactive
                          </>
                        )}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {template.duration} days
                      </span>
                      <span className="flex items-center gap-1">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {template._count.days} days configured
                      </span>
                      {template.package && (
                        <span className="flex items-center gap-1">
                          <Package className="h-3.5 w-3.5" />
                          {template.package.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/dashboard/admin/cms/itineraries/${template.id}/preview`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/dashboard/admin/cms/itineraries/${template.id}`}>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleDuplicate(template.id)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setDeleteId(template.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-slate-200 bg-white px-6 py-12 text-center">
            <CalendarDays className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-4 text-lg font-medium text-slate-900">No itinerary templates</h3>
            <p className="mt-2 text-slate-500">
              Get started by creating your first itinerary template
            </p>
            <Link href="/dashboard/admin/cms/itineraries/new">
              <Button className="mt-4 gap-2">
                <Plus className="h-4 w-4" />
                Create Template
              </Button>
            </Link>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Template</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this itinerary template? This will also delete all
                days and activities. This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteId(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
