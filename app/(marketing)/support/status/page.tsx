'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { trpc } from '@/lib/trpc/client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Search,
  Loader2,
  Copy,
  CheckCircle,
  Clock,
  AlertCircle,
  MessageSquare,
  ArrowLeft,
  Calendar,
  Tag,
} from 'lucide-react'
import { toast } from 'sonner'

/**
 * Validation schema for ticket lookup form
 */
const ticketLookupSchema = z.object({
  referenceNumber: z
    .string()
    .min(1, 'Reference number is required')
    .regex(
      /^TKT-[A-Za-z0-9]{8}$/,
      'Reference number must be in format TKT-XXXXXXXX'
    ),
  email: z.string().email('Please enter a valid email address'),
})

type TicketLookupInput = z.infer<typeof ticketLookupSchema>

/**
 * Status badge component
 */
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    OPEN: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Open' },
    IN_PROGRESS: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      label: 'In Progress',
    },
    RESOLVED: { bg: 'bg-green-100', text: 'text-green-800', label: 'Resolved' },
    CLOSED: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Closed' },
  }

  const { bg, text, label } = config[status] || config.OPEN

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bg} ${text}`}
    >
      {label}
    </span>
  )
}

/**
 * Format date for display
 */
function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Format category for display
 */
function formatCategory(category: string): string {
  return category
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase())
}

export default function TicketStatusPage() {
  const [hasSearched, setHasSearched] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<TicketLookupInput>({
    resolver: zodResolver(ticketLookupSchema),
    defaultValues: {
      referenceNumber: '',
      email: '',
    },
  })

  const referenceNumber = watch('referenceNumber')
  const email = watch('email')

  const ticketQuery = trpc.support.getPublicTicketStatus.useQuery(
    { referenceNumber, email },
    {
      enabled: false,
      retry: false,
    }
  )

  const onSubmit = async () => {
    setHasSearched(true)
    await ticketQuery.refetch()
  }

  const copyReferenceNumber = () => {
    if (ticketQuery.data?.referenceNumber) {
      navigator.clipboard.writeText(ticketQuery.data.referenceNumber)
      toast.success('Reference number copied!')
    }
  }

  const isLoading = ticketQuery.isFetching
  const ticket = ticketQuery.data
  const error = ticketQuery.error

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#1D2D44] to-[#005A82] text-white py-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Check Ticket Status
          </h1>
          <p className="text-lg text-blue-100">
            Enter your reference number and email to view your support ticket
            status.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Lookup Form Card */}
          <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 mb-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Reference Number Field */}
              <div>
                <Label
                  htmlFor="referenceNumber"
                  className="text-gray-700 font-medium"
                >
                  Reference Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="referenceNumber"
                  type="text"
                  placeholder="TKT-XXXXXXXX"
                  aria-required="true"
                  aria-invalid={errors.referenceNumber ? 'true' : 'false'}
                  aria-describedby={
                    errors.referenceNumber ? 'referenceNumber-error' : undefined
                  }
                  {...register('referenceNumber')}
                  className={`mt-1.5 font-mono uppercase ${errors.referenceNumber ? 'border-red-500' : ''}`}
                  disabled={isLoading}
                />
                {errors.referenceNumber && (
                  <p
                    id="referenceNumber-error"
                    className="text-red-500 text-sm mt-1"
                    role="alert"
                  >
                    {errors.referenceNumber.message}
                  </p>
                )}
                <p className="text-gray-500 text-xs mt-1">
                  Your reference number was provided when you submitted your
                  ticket.
                </p>
              </div>

              {/* Email Field */}
              <div>
                <Label htmlFor="email" className="text-gray-700 font-medium">
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  aria-required="true"
                  aria-invalid={errors.email ? 'true' : 'false'}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  {...register('email')}
                  className={`mt-1.5 ${errors.email ? 'border-red-500' : ''}`}
                  disabled={isLoading}
                />
                {errors.email && (
                  <p
                    id="email-error"
                    className="text-red-500 text-sm mt-1"
                    role="alert"
                  >
                    {errors.email.message}
                  </p>
                )}
                <p className="text-gray-500 text-xs mt-1">
                  Enter the email address you used when submitting the ticket.
                </p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#1D2D44] hover:bg-[#002B42] text-white font-semibold py-3 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2
                      className="h-5 w-5 animate-spin"
                      aria-hidden="true"
                    />
                    Looking up ticket...
                  </>
                ) : (
                  <>
                    <Search className="h-5 w-5" aria-hidden="true" />
                    Check Status
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Error State */}
          {hasSearched && error && (
            <div
              className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8"
              role="alert"
            >
              <div className="flex items-start gap-3">
                <AlertCircle
                  className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-red-800 font-medium">Ticket Not Found</p>
                  <p className="text-red-700 text-sm mt-1">{error.message}</p>
                  <p className="text-red-600 text-sm mt-3">
                    Need help?{' '}
                    <Link
                      href="/contact"
                      className="underline hover:text-red-800"
                    >
                      Submit a new support request
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Ticket Details */}
          {ticket && (
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* Ticket Header */}
              <div className="bg-gradient-to-r from-[#1D2D44] to-[#005A82] text-white p-6">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <code className="text-lg font-mono font-bold">
                        {ticket.referenceNumber}
                      </code>
                      <button
                        type="button"
                        onClick={copyReferenceNumber}
                        className="text-blue-200 hover:text-white p-1"
                        aria-label="Copy reference number"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                    <h2 className="text-xl font-semibold">{ticket.subject}</h2>
                  </div>
                  <StatusBadge status={ticket.status} />
                </div>
              </div>

              {/* Ticket Body */}
              <div className="p-6">
                {/* Meta Info */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6 pb-6 border-b">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" aria-hidden="true" />
                    <span>Submitted: {formatDate(ticket.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Tag className="h-4 w-4" aria-hidden="true" />
                    <span>{formatCategory(ticket.category)}</span>
                  </div>
                  {ticket.resolvedAt && (
                    <div className="flex items-center gap-1.5 text-green-600">
                      <CheckCircle className="h-4 w-4" aria-hidden="true" />
                      <span>Resolved: {formatDate(ticket.resolvedAt)}</span>
                    </div>
                  )}
                </div>

                {/* Original Message */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    Your Message
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {ticket.message}
                    </p>
                  </div>
                </div>

                {/* Replies Section */}
                {ticket.replies.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" aria-hidden="true" />
                      Responses ({ticket.replies.length})
                    </h3>
                    <div className="space-y-4">
                      {ticket.replies.map((reply, index) => (
                        <div
                          key={index}
                          className="bg-blue-50 border-l-4 border-[#1D2D44] rounded-r-lg p-4"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium text-[#1D2D44]">
                              The Pickleball Passport Support
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDate(reply.createdAt)}
                            </span>
                          </div>
                          <p className="text-gray-700 whitespace-pre-wrap">
                            {reply.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Status Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  {ticket.status === 'OPEN' && (
                    <div className="flex items-start gap-3">
                      <Clock
                        className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0"
                        aria-hidden="true"
                      />
                      <div>
                        <p className="text-gray-700 font-medium">
                          Awaiting Response
                        </p>
                        <p className="text-gray-600 text-sm mt-1">
                          Our team is reviewing your ticket. We typically respond
                          within 24 hours.
                        </p>
                      </div>
                    </div>
                  )}
                  {ticket.status === 'IN_PROGRESS' && (
                    <div className="flex items-start gap-3">
                      <Loader2
                        className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0 animate-spin"
                        aria-hidden="true"
                      />
                      <div>
                        <p className="text-gray-700 font-medium">In Progress</p>
                        <p className="text-gray-600 text-sm mt-1">
                          Our team is actively working on your request.
                        </p>
                      </div>
                    </div>
                  )}
                  {(ticket.status === 'RESOLVED' ||
                    ticket.status === 'CLOSED') && (
                    <div className="flex items-start gap-3">
                      <CheckCircle
                        className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0"
                        aria-hidden="true"
                      />
                      <div>
                        <p className="text-gray-700 font-medium">
                          Ticket {ticket.status === 'RESOLVED' ? 'Resolved' : 'Closed'}
                        </p>
                        <p className="text-gray-600 text-sm mt-1">
                          This ticket has been{' '}
                          {ticket.status === 'RESOLVED' ? 'resolved' : 'closed'}.
                          Need more help?{' '}
                          <Link
                            href="/contact"
                            className="text-[#1D2D44] underline hover:text-[#002B42]"
                          >
                            Contact us again
                          </Link>
                          .
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Back to Contact Link */}
          <div className="mt-8 text-center">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 text-[#1D2D44] hover:text-[#002B42] font-medium"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to Contact Page
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
