'use client'

/**
 * Admin CMS Email Template Editor
 * Story 12-8: Email Template Editor
 *
 * Features:
 * - Visual drag-and-drop email builder
 * - Code editor fallback
 * - Live preview with sample data
 * - Mobile preview toggle
 * - Send test email functionality
 * - Template versioning
 */

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import {
  Save,
  X,
  Loader2,
  ArrowLeft,
  Mail,
  Eye,
  Code,
  Send,
  Variable,
  RefreshCw,
  Palette,
  Smartphone,
  Monitor,
  History,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import Link from 'next/link'
import { VisualEmailEditor } from '@/components/email-editor'
import type { EmailVisualContent } from '@/lib/email/visual-editor/types'
import { createDefaultVisualContent } from '@/lib/email/visual-editor/block-renderer'

type EmailTemplateCategory = 'TRANSACTIONAL' | 'MARKETING' | 'NOTIFICATIONS' | 'SYSTEM'
type EmailTemplateStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED'

const CATEGORY_LABELS: Record<EmailTemplateCategory, string> = {
  TRANSACTIONAL: 'Transactional',
  MARKETING: 'Marketing',
  NOTIFICATIONS: 'Notifications',
  SYSTEM: 'System',
}

const STATUS_LABELS: Record<EmailTemplateStatus, string> = {
  DRAFT: 'Draft',
  ACTIVE: 'Active',
  ARCHIVED: 'Archived',
}

type FormData = {
  name: string
  slug: string
  description: string
  category: EmailTemplateCategory
  status: EmailTemplateStatus
  subjectLine: string
  preheaderText: string
  htmlContent: string
  textContent: string
  useVisualEditor: boolean
  visualBlocks: EmailVisualContent | null
}

const DEFAULT_HTML_TEMPLATE = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{subject}}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background-color: #059669; padding: 24px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">The Pickleball Passport</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              <h2 style="color: #333333; margin: 0 0 16px 0;">Hello {{guestName}},</h2>
              <p style="color: #666666; line-height: 1.6; margin: 0 0 16px 0;">
                Your content goes here. Use Handlebars variables like {{variableName}} for dynamic content.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px; text-align: center;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                &copy; 2026 The Pickleball Passport. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

export default function CmsEmailTemplateEditorPage() {
  const params = useParams()
  const router = useRouter()
  const isNew = params.id === 'new'
  const templateId = isNew ? null : (params.id as string)

  const [formData, setFormData] = useState<FormData>({
    name: '',
    slug: '',
    description: '',
    category: 'TRANSACTIONAL',
    status: 'DRAFT',
    subjectLine: '',
    preheaderText: '',
    htmlContent: DEFAULT_HTML_TEMPLATE,
    textContent: '',
    useVisualEditor: true,
    visualBlocks: createDefaultVisualContent(),
  })

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [previewMode, setPreviewMode] = useState<'html' | 'text'>('html')
  const [devicePreview, setDevicePreview] = useState<'desktop' | 'mobile'>('desktop')
  const [previewHtml, setPreviewHtml] = useState('')
  const [previewText, setPreviewText] = useState('')
  const [previewSubject, setPreviewSubject] = useState('')
  const [testEmail, setTestEmail] = useState('')
  const [showTestEmailModal, setShowTestEmailModal] = useState(false)
  const [showVersionHistory, setShowVersionHistory] = useState(false)

  // Fetch template if editing
  const { data: templateData, isLoading: isLoadingTemplate } = trpc.emailTemplate.getById.useQuery(
    { id: templateId! },
    {
      enabled: !isNew && !!templateId,
    }
  )

  // Populate form when template data is loaded
  useEffect(() => {
    if (templateData && !isNew) {
      const visualBlocks = templateData.visualBlocks
        ? (templateData.visualBlocks as unknown as EmailVisualContent)
        : null
      const useVisualEditor = (templateData as { useVisualEditor?: boolean }).useVisualEditor ?? false

      setFormData({
        name: templateData.name,
        slug: templateData.slug,
        description: templateData.description || '',
        category: templateData.category as EmailTemplateCategory,
        status: templateData.status as EmailTemplateStatus,
        subjectLine: templateData.subjectLine,
        preheaderText: templateData.preheaderText || '',
        htmlContent: templateData.htmlContent,
        textContent: templateData.textContent,
        useVisualEditor,
        visualBlocks,
      })
    }
  }, [templateData, isNew])

  // Fetch available variables for category
  const { data: availableVariables } = trpc.emailTemplate.getVariablesForCategory.useQuery({
    category: formData.category,
  })

  // Preview mutation
  const previewMutation = trpc.emailTemplate.preview.useMutation({
    onSuccess: (data) => {
      setPreviewHtml(data.html)
      setPreviewText(data.text)
      setPreviewSubject(data.subject)
    },
    onError: (error) => {
      console.error('Preview error:', error.message)
    },
  })

  // Create mutation
  const createMutation = trpc.emailTemplate.create.useMutation({
    onSuccess: (data) => {
      router.push(`/dashboard/admin/cms/emails/${data.id}`)
    },
    onError: (error) => {
      if (error.message.includes('slug already exists')) {
        setErrors((prev) => ({ ...prev, slug: 'This slug is already in use' }))
      } else {
        alert(error.message || 'Failed to create template')
      }
    },
  })

  // Update mutation
  const updateMutation = trpc.emailTemplate.update.useMutation({
    onSuccess: () => {
      alert('Template saved successfully!')
    },
    onError: (error) => {
      alert(error.message || 'Failed to update template')
    },
  })

  // Send test email mutation
  const sendTestMutation = trpc.emailTemplate.sendTestEmail.useMutation({
    onSuccess: () => {
      alert('Test email sent successfully!')
      setShowTestEmailModal(false)
      setTestEmail('')
    },
    onError: (error) => {
      alert(error.message || 'Failed to send test email')
    },
  })

  // Restore version mutation
  const restoreVersionMutation = trpc.emailTemplate.restoreVersion.useMutation({
    onSuccess: () => {
      alert('Version restored successfully!')
      setShowVersionHistory(false)
      // Refetch template data
      window.location.reload()
    },
    onError: (error) => {
      alert(error.message || 'Failed to restore version')
    },
  })

  // Generate preview when content changes
  const generatePreview = useCallback(() => {
    if (formData.htmlContent && formData.subjectLine) {
      previewMutation.mutate({
        htmlContent: formData.htmlContent,
        textContent: formData.textContent || undefined,
        subjectLine: formData.subjectLine,
        category: formData.category,
      })
    }
  }, [formData.htmlContent, formData.textContent, formData.subjectLine, formData.category])

  // Auto-generate preview on mount and when relevant fields change
  useEffect(() => {
    const timer = setTimeout(() => {
      generatePreview()
    }, 500)
    return () => clearTimeout(timer)
  }, [formData.htmlContent, formData.subjectLine, formData.category])

  // Auto-generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      ...(isNew && { slug: generateSlug(name) }),
    }))
    if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }))
  }

  const handleChange = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  // Handle visual editor content changes
  const handleVisualContentChange = useCallback((content: EmailVisualContent) => {
    setFormData((prev) => ({ ...prev, visualBlocks: content }))
  }, [])

  // Handle HTML generated from visual editor
  const handleHtmlGenerated = useCallback((html: string, plainText: string) => {
    setFormData((prev) => ({ ...prev, htmlContent: html, textContent: plainText }))
  }, [])

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {}

    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required'
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'Slug must be lowercase letters, numbers, and hyphens only'
    }
    if (!formData.subjectLine.trim()) newErrors.subjectLine = 'Subject line is required'
    if (!formData.htmlContent.trim()) newErrors.htmlContent = 'HTML content is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    const payload = {
      name: formData.name.trim(),
      slug: formData.slug.trim(),
      description: formData.description.trim() || undefined,
      category: formData.category,
      status: formData.status,
      subjectLine: formData.subjectLine.trim(),
      preheaderText: formData.preheaderText.trim() || undefined,
      htmlContent: formData.htmlContent,
      textContent: formData.textContent || undefined,
    }

    if (isNew) {
      await createMutation.mutateAsync(payload)
    } else {
      await updateMutation.mutateAsync({ id: templateId!, ...payload })
    }
  }

  const handleSendTestEmail = async () => {
    if (!testEmail.trim()) {
      alert('Please enter an email address')
      return
    }

    if (isNew) {
      await sendTestMutation.mutateAsync({
        htmlContent: formData.htmlContent,
        textContent: formData.textContent || undefined,
        subjectLine: formData.subjectLine,
        category: formData.category,
        recipientEmail: testEmail.trim(),
      })
    } else {
      await sendTestMutation.mutateAsync({
        templateId: templateId!,
        recipientEmail: testEmail.trim(),
      })
    }
  }

  const handleRestoreVersion = async (versionNumber: number) => {
    if (confirm(`Restore version ${versionNumber}? This will replace the current content.`)) {
      await restoreVersionMutation.mutateAsync({
        templateId: templateId!,
        versionNumber,
      })
    }
  }

  const insertVariable = (varName: string) => {
    const textarea = document.getElementById('htmlContent') as HTMLTextAreaElement
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const text = formData.htmlContent
      const newText = text.substring(0, start) + `{{${varName}}}` + text.substring(end)
      handleChange('htmlContent', newText)
      setTimeout(() => {
        textarea.focus()
        textarea.selectionStart = textarea.selectionEnd = start + varName.length + 4
      }, 0)
    }
  }

  if (isLoadingTemplate) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-[1800px] px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/dashboard/admin/cms/emails"
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Email Templates
          </Link>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-emerald-100 p-3">
                <Mail className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {isNew ? 'Create Email Template' : 'Edit Template'}
                </h1>
                <p className="text-sm text-slate-600">
                  {isNew
                    ? 'Create a new email template with the visual editor'
                    : formData.name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {!isNew && templateData?.versions && templateData.versions.length > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setShowVersionHistory(true)}
                >
                  <History className="h-4 w-4 mr-2" />
                  Versions ({templateData.versions.length})
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => setShowTestEmailModal(true)}
                disabled={!formData.htmlContent || !formData.subjectLine}
              >
                <Send className="h-4 w-4 mr-2" />
                Send Test
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {isNew ? 'Create' : 'Save'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Template Details */}
        <div className="mb-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left Column */}
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Booking Confirmation"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Slug <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.slug}
                    onChange={(e) => handleChange('slug', e.target.value)}
                    placeholder="booking-confirmation"
                    className={`font-mono ${errors.slug ? 'border-red-500' : ''}`}
                  />
                  {errors.slug && <p className="mt-1 text-sm text-red-600">{errors.slug}</p>}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    {Object.entries(STATUS_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Subject Line <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.subjectLine}
                  onChange={(e) => handleChange('subjectLine', e.target.value)}
                  placeholder="Your Booking is Confirmed! - {{bookingReference}}"
                  className={errors.subjectLine ? 'border-red-500' : ''}
                />
                <p className="mt-1 text-xs text-slate-500">
                  Use {'{{variableName}}'} for dynamic content
                </p>
                {errors.subjectLine && (
                  <p className="mt-1 text-sm text-red-600">{errors.subjectLine}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Preheader Text (optional)
                </label>
                <Input
                  value={formData.preheaderText}
                  onChange={(e) => handleChange('preheaderText', e.target.value)}
                  placeholder="Preview text shown in inbox..."
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Description (optional)
                </label>
                <Input
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Brief description of when this template is used"
                />
              </div>
            </div>
          </div>

          {/* Editor Mode Toggle */}
          <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-6">
            <div className="flex items-center gap-3">
              <Switch
                checked={formData.useVisualEditor}
                onCheckedChange={(checked) => handleChange('useVisualEditor', checked)}
              />
              <div className="flex items-center gap-2">
                {formData.useVisualEditor ? (
                  <>
                    <Palette className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium text-slate-700">Visual Editor</span>
                  </>
                ) : (
                  <>
                    <Code className="h-4 w-4 text-slate-600" />
                    <span className="text-sm font-medium text-slate-700">Code Editor</span>
                  </>
                )}
              </div>
            </div>
            <p className="text-xs text-slate-500">
              {formData.useVisualEditor
                ? 'Build your email with drag-and-drop blocks'
                : 'Edit HTML directly for full control'}
            </p>
          </div>
        </div>

        {/* Editor Section */}
        {formData.useVisualEditor ? (
          <VisualEmailEditor
            initialContent={formData.visualBlocks || undefined}
            onContentChange={handleVisualContentChange}
            onHtmlGenerated={handleHtmlGenerated}
            previewHtml={previewHtml}
            isGeneratingPreview={previewMutation.isPending}
          />
        ) : (
          /* Code Editor Mode */
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Editor Panel */}
            <div className="space-y-6">
              {/* Variable Reference */}
              <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  <Variable className="h-4 w-4 text-emerald-600" />
                  <h3 className="text-sm font-semibold text-slate-900">Available Variables</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableVariables?.map((variable) => (
                    <button
                      key={variable.name}
                      type="button"
                      onClick={() => insertVariable(variable.name)}
                      className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-xs font-mono text-slate-700 hover:bg-slate-200 transition-colors"
                      title={variable.description}
                    >
                      {`{{${variable.name}}}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* HTML Content */}
              <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900">HTML Content</h3>
                  <Button variant="outline" size="sm" onClick={generatePreview}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Preview
                  </Button>
                </div>
                <textarea
                  id="htmlContent"
                  value={formData.htmlContent}
                  onChange={(e) => handleChange('htmlContent', e.target.value)}
                  rows={25}
                  className={`w-full rounded-md border px-3 py-2 font-mono text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                    errors.htmlContent ? 'border-red-500' : 'border-slate-300'
                  }`}
                  placeholder="Enter HTML email content..."
                />
                {errors.htmlContent && (
                  <p className="mt-1 text-sm text-red-600">{errors.htmlContent}</p>
                )}
              </div>

              {/* Plain Text Content */}
              <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900">Plain Text (Optional)</h3>
                  <p className="text-xs text-slate-500">Auto-generated if left empty</p>
                </div>
                <textarea
                  value={formData.textContent}
                  onChange={(e) => handleChange('textContent', e.target.value)}
                  rows={8}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="Plain text version (auto-generated from HTML if empty)"
                />
              </div>
            </div>

            {/* Preview Panel */}
            <div className="space-y-4">
              <div className="sticky top-6">
                {/* Preview Controls */}
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-slate-500" />
                    <span className="text-sm font-medium text-slate-700">Live Preview</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
                      <button
                        type="button"
                        onClick={() => setDevicePreview('desktop')}
                        className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                          devicePreview === 'desktop'
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Monitor className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDevicePreview('mobile')}
                        className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                          devicePreview === 'mobile'
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Smartphone className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
                      <button
                        type="button"
                        onClick={() => setPreviewMode('html')}
                        className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                          previewMode === 'html'
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        HTML
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewMode('text')}
                        className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                          previewMode === 'text'
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Text
                      </button>
                    </div>
                  </div>
                </div>

                {/* Subject Preview */}
                {previewSubject && (
                  <div className="mb-3 rounded-lg bg-slate-100 px-4 py-3">
                    <p className="text-xs text-slate-500">Subject:</p>
                    <p className="font-medium text-slate-900">{previewSubject}</p>
                  </div>
                )}

                {/* Preview Frame */}
                <div
                  className={`overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-all ${
                    devicePreview === 'mobile' ? 'mx-auto w-[375px]' : 'w-full'
                  }`}
                >
                  {previewMutation.isPending ? (
                    <div className="flex h-[600px] items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                    </div>
                  ) : previewMode === 'html' ? (
                    previewHtml ? (
                      <iframe
                        srcDoc={previewHtml}
                        className="h-[600px] w-full"
                        title="Email Preview"
                      />
                    ) : (
                      <div className="flex h-[600px] items-center justify-center">
                        <p className="text-sm text-slate-400">Enter content to see preview</p>
                      </div>
                    )
                  ) : (
                    <pre className="whitespace-pre-wrap font-mono text-sm text-slate-800 bg-slate-50 p-4 h-[600px] overflow-auto">
                      {previewText || 'No plain text content'}
                    </pre>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Test Email Modal */}
        {showTestEmailModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Send Test Email</h3>
                <button
                  type="button"
                  onClick={() => setShowTestEmailModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Recipient Email
                </label>
                <Input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="test@example.com"
                />
                <p className="mt-1 text-xs text-slate-500">
                  A test email will be sent with sample data for the selected category
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowTestEmailModal(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSendTestEmail}
                  disabled={sendTestMutation.isPending || !testEmail.trim()}
                >
                  {sendTestMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Test
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Version History Modal */}
        {showVersionHistory && templateData?.versions && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Version History</h3>
                <button
                  type="button"
                  onClick={() => setShowVersionHistory(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="max-h-[400px] overflow-y-auto">
                {templateData.versions.length > 0 ? (
                  <div className="space-y-3">
                    {templateData.versions.map((version) => (
                      <div
                        key={version.id}
                        className="flex items-center justify-between rounded-lg border border-slate-200 p-4"
                      >
                        <div>
                          <p className="font-medium text-slate-900">
                            Version {version.versionNumber}
                          </p>
                          <p className="text-sm text-slate-500">
                            {new Date(version.createdAt).toLocaleString()}
                          </p>
                          {version.changesSummary && (
                            <p className="text-sm text-slate-600 mt-1">
                              {version.changesSummary}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRestoreVersion(version.versionNumber)}
                          disabled={restoreVersionMutation.isPending}
                        >
                          Restore
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-slate-500 py-8">No versions available</p>
                )}
              </div>

              <div className="mt-4 flex justify-end">
                <Button variant="outline" onClick={() => setShowVersionHistory(false)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
