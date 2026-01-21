'use client'

/**
 * Admin CMS Email Templates Page
 * Story 12-8: Email Template Editor
 *
 * Displays all email templates with visual editor support
 * Located at /admin/cms/emails for CMS integration
 */

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  Mail,
  Copy,
  Archive,
  Search,
  BarChart3,
  CheckCircle,
  Clock,
  XCircle,
  Palette,
  Code,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type EmailTemplateCategory = 'TRANSACTIONAL' | 'MARKETING' | 'NOTIFICATIONS' | 'SYSTEM'
type EmailTemplateStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED'

const CATEGORY_LABELS: Record<EmailTemplateCategory, string> = {
  TRANSACTIONAL: 'Transactional',
  MARKETING: 'Marketing',
  NOTIFICATIONS: 'Notifications',
  SYSTEM: 'System',
}

const CATEGORY_COLORS: Record<EmailTemplateCategory, string> = {
  TRANSACTIONAL: 'bg-blue-100 text-blue-700',
  MARKETING: 'bg-purple-100 text-purple-700',
  NOTIFICATIONS: 'bg-amber-100 text-amber-700',
  SYSTEM: 'bg-slate-100 text-slate-700',
}

const STATUS_LABELS: Record<EmailTemplateStatus, string> = {
  DRAFT: 'Draft',
  ACTIVE: 'Active',
  ARCHIVED: 'Archived',
}

const STATUS_ICONS: Record<EmailTemplateStatus, React.ReactNode> = {
  DRAFT: <Clock className="h-3 w-3" />,
  ACTIVE: <CheckCircle className="h-3 w-3" />,
  ARCHIVED: <XCircle className="h-3 w-3" />,
}

const STATUS_COLORS: Record<EmailTemplateStatus, string> = {
  DRAFT: 'bg-amber-100 text-amber-700',
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  ARCHIVED: 'bg-slate-100 text-slate-600',
}

export default function CmsEmailTemplatesPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<EmailTemplateCategory | 'ALL'>('ALL')
  const [statusFilter, setStatusFilter] = useState<EmailTemplateStatus | 'ALL'>('ALL')

  // Fetch all templates
  const {
    data: templates,
    isLoading,
    refetch,
  } = trpc.emailTemplate.getAll.useQuery({
    category: categoryFilter === 'ALL' ? undefined : categoryFilter,
    status: statusFilter === 'ALL' ? undefined : statusFilter,
    search: searchQuery || undefined,
  })

  // Fetch category counts
  const { data: categoryCounts } = trpc.emailTemplate.getCategoryCounts.useQuery()

  // Mutations
  const duplicateMutation = trpc.emailTemplate.duplicate.useMutation({
    onSuccess: (newTemplate) => {
      router.push(`/dashboard/admin/cms/emails/${newTemplate.id}`)
    },
    onError: (error) => {
      alert(error.message || 'Failed to duplicate template')
    },
  })

  const archiveMutation = trpc.emailTemplate.archive.useMutation({
    onSuccess: () => {
      refetch()
    },
    onError: (error) => {
      alert(error.message || 'Failed to archive template')
    },
  })

  const deleteMutation = trpc.emailTemplate.delete.useMutation({
    onSuccess: () => {
      refetch()
    },
    onError: (error) => {
      alert(error.message || 'Failed to delete template')
    },
  })

  const handleDuplicate = async (id: string) => {
    if (confirm('Create a copy of this template?')) {
      await duplicateMutation.mutateAsync({ id })
    }
  }

  const handleArchive = async (id: string, name: string) => {
    if (confirm(`Archive "${name}"? It will no longer be available for sending.`)) {
      await archiveMutation.mutateAsync({ id })
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (
      confirm(
        `Permanently delete "${name}"? This action cannot be undone and will remove all versions and analytics.`
      )
    ) {
      await deleteMutation.mutateAsync({ id })
    }
  }

  const totalTemplates = templates?.length || 0
  const activeTemplates = templates?.filter((t) => t.status === 'ACTIVE').length || 0
  const draftTemplates = templates?.filter((t) => t.status === 'DRAFT').length || 0
  const visualTemplates = templates?.filter((t) => (t as { useVisualEditor?: boolean }).useVisualEditor).length || 0

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Email Templates</h1>
              <p className="mt-2 text-slate-600">
                Manage email templates with visual drag-and-drop editor
              </p>
            </div>
            <Link href="/dashboard/admin/cms/emails/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Template
              </Button>
            </Link>
          </div>

          {/* Search & Filters */}
          <div className="mt-6 flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as EmailTemplateCategory | 'ALL')}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="ALL">All Categories</option>
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}{' '}
                  {categoryCounts?.[key] ? `(${categoryCounts[key as EmailTemplateCategory]})` : ''}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as EmailTemplateStatus | 'ALL')}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="ALL">All Statuses</option>
              {Object.entries(STATUS_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-6 sm:grid-cols-4">
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-blue-100 p-3">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Total Templates</p>
                <p className="text-2xl font-bold text-slate-900">{totalTemplates}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-emerald-100 p-3">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Active</p>
                <p className="text-2xl font-bold text-slate-900">{activeTemplates}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-amber-100 p-3">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Drafts</p>
                <p className="text-2xl font-bold text-slate-900">{draftTemplates}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-purple-100 p-3">
                <Palette className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Visual Editor</p>
                <p className="text-2xl font-bold text-slate-900">{visualTemplates}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Template List */}
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900">
              {categoryFilter === 'ALL' ? 'All Templates' : CATEGORY_LABELS[categoryFilter]}
              {statusFilter !== 'ALL' && ` - ${STATUS_LABELS[statusFilter]}`}
            </h2>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : templates && templates.length > 0 ? (
            <div className="divide-y divide-slate-200">
              {templates.map((template) => {
                const useVisualEditor = (template as { useVisualEditor?: boolean }).useVisualEditor
                return (
                  <div
                    key={template.id}
                    className="px-6 py-4 transition-colors hover:bg-slate-50"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-lg font-semibold text-slate-900">
                            {template.name}
                          </h3>
                          <span
                            className={cn(
                              'inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium',
                              CATEGORY_COLORS[template.category as EmailTemplateCategory]
                            )}
                          >
                            {CATEGORY_LABELS[template.category as EmailTemplateCategory]}
                          </span>
                          <span
                            className={cn(
                              'inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium',
                              STATUS_COLORS[template.status as EmailTemplateStatus]
                            )}
                          >
                            {STATUS_ICONS[template.status as EmailTemplateStatus]}
                            {STATUS_LABELS[template.status as EmailTemplateStatus]}
                          </span>
                          {useVisualEditor ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700">
                              <Palette className="h-3 w-3" />
                              Visual
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                              <Code className="h-3 w-3" />
                              Code
                            </span>
                          )}
                        </div>

                        <p className="mt-1 text-sm text-slate-500 font-mono">{template.slug}</p>

                        {template.description && (
                          <p className="mt-1 text-sm text-slate-600">{template.description}</p>
                        )}

                        <div className="mt-2 flex flex-wrap gap-4 text-sm">
                          <div className="flex items-center gap-1 text-slate-600">
                            <Mail className="h-4 w-4" />
                            Subject: {template.subjectLine.substring(0, 50)}
                            {template.subjectLine.length > 50 && '...'}
                          </div>
                          {template.analytics && (
                            <div className="flex items-center gap-1 text-slate-500">
                              <BarChart3 className="h-4 w-4" />
                              {template.analytics.sentCount} sent
                              {template.analytics.openRate !== null &&
                                ` | ${Math.round(template.analytics.openRate * 100)}% open rate`}
                            </div>
                          )}
                        </div>

                        <p className="mt-2 text-xs text-slate-400">
                          Updated {new Date(template.updatedAt).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            router.push(`/dashboard/admin/cms/emails/${template.id}`)
                          }
                          title="Edit template"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDuplicate(template.id)}
                          disabled={duplicateMutation.isPending}
                          title="Duplicate template"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>

                        {template.status !== 'ARCHIVED' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleArchive(template.id, template.name)}
                            disabled={archiveMutation.isPending}
                            title="Archive template"
                          >
                            <Archive className="h-4 w-4" />
                          </Button>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(template.id, template.name)}
                          disabled={deleteMutation.isPending}
                          title="Delete template"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="py-12 text-center">
              <Mail className="mx-auto h-12 w-12 text-slate-400" />
              <h3 className="mt-4 text-lg font-medium text-slate-900">No templates found</h3>
              <p className="mt-2 text-sm text-slate-600">
                {searchQuery || categoryFilter !== 'ALL' || statusFilter !== 'ALL'
                  ? 'Try adjusting your filters'
                  : 'Get started by creating your first email template'}
              </p>
              {!searchQuery && categoryFilter === 'ALL' && statusFilter === 'ALL' && (
                <Link href="/dashboard/admin/cms/emails/new">
                  <Button className="mt-4 gap-2">
                    <Plus className="h-4 w-4" />
                    Create Template
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Link to Legacy Templates */}
        <div className="mt-6 rounded-lg border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Legacy Email Templates</h3>
              <p className="mt-1 text-sm text-slate-600">
                View and manage the original code-based email templates
              </p>
            </div>
            <Link href="/dashboard/admin/emails/templates">
              <Button variant="outline">View Legacy Templates</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
