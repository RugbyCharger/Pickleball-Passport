'use client';

/**
 * Support & Help Center
 * E5-S8: Support & Help Center (3 pts)
 * US-002: Guest Support Form in Dashboard
 *
 * Features:
 * - Contact form with category, priority, validation
 * - Ticket auto-links to guest's latest booking
 * - Confirmation toast with reference number
 * - Ticket history list with status badges
 * - Ticket detail view with replies
 * - FAQ section (static content)
 */

import { useState } from 'react';
import type { ComponentType } from 'react';
import { trpc } from '@/lib/trpc/client';
import { toast } from 'sonner';
import {
  MessageSquare,
  Mail,
  Phone,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Loader2,
  ArrowLeft,
  Copy,
  Tag,
} from 'lucide-react';

type TicketPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
type TicketCategory =
  | 'GENERAL_INQUIRY'
  | 'BOOKING_QUESTION'
  | 'MEDICAL_WELLNESS_QUESTION'
  | 'PAYMENT_ISSUE'
  | 'PARTNERSHIP_INQUIRY'
  | 'OTHER';

const PRIORITY_CONFIG: Record<
  TicketPriority,
  { label: string; color: string }
> = {
  LOW: { label: 'Low', color: 'text-gray-600 bg-gray-50' },
  NORMAL: { label: 'Normal', color: 'text-blue-600 bg-blue-50' },
  HIGH: { label: 'High', color: 'text-orange-600 bg-orange-50' },
  URGENT: { label: 'Urgent', color: 'text-red-600 bg-red-50' },
};

const STATUS_CONFIG: Record<
  TicketStatus,
  { label: string; icon: ComponentType<{ className?: string }>; color: string }
> = {
  OPEN: {
    label: 'Open',
    icon: AlertCircle,
    color: 'text-yellow-600 bg-yellow-50',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    icon: Clock,
    color: 'text-blue-600 bg-blue-50',
  },
  RESOLVED: {
    label: 'Resolved',
    icon: CheckCircle,
    color: 'text-green-600 bg-green-50',
  },
  CLOSED: {
    label: 'Closed',
    icon: CheckCircle,
    color: 'text-gray-600 bg-gray-50',
  },
};

const CATEGORY_OPTIONS: { value: TicketCategory; label: string }[] = [
  { value: 'GENERAL_INQUIRY', label: 'General Inquiry' },
  { value: 'BOOKING_QUESTION', label: 'Booking Question' },
  { value: 'MEDICAL_WELLNESS_QUESTION', label: 'Medical/Wellness Question' },
  { value: 'PAYMENT_ISSUE', label: 'Payment Issue' },
  { value: 'PARTNERSHIP_INQUIRY', label: 'Partnership Inquiry' },
  { value: 'OTHER', label: 'Other' },
];

const FAQ_ITEMS = [
  {
    question: 'What documents do I need for my trip?',
    answer:
      'You will need a valid passport (valid for at least 6 months from your travel date), a completed medical history form, and proof of travel insurance. Depending on your nationality, you may also need a visa for Thailand. We recommend checking the latest visa requirements for your country.',
  },
  {
    question: 'How do I make a payment for my booking?',
    answer:
      'You can make payments directly through your dashboard using a credit card or debit card. We use Stripe for secure payment processing. You can choose to pay in full or set up an installment plan with flexible payment options.',
  },
  {
    question: 'Can I modify my booking after confirmation?',
    answer:
      'Yes, you can modify your booking up to 60 days before your scheduled departure date. Please contact our support team to make changes. Note that some modifications may be subject to additional fees depending on the nature of the change.',
  },
  {
    question: 'What is included in my package?',
    answer:
      'Each package includes accommodation, pickleball activities, medical consultations (if applicable), ground transportation in Thailand, and most meals. Specific inclusions vary by package tier (Luxury, Ultra-Luxury, or Villa). International flights and personal expenses are not included.',
  },
  {
    question: 'How do I prepare for medical procedures?',
    answer:
      'Once your booking is confirmed, our medical team will contact you with specific pre-procedure instructions. This typically includes completing a medical questionnaire, providing recent lab results if needed, and following specific dietary or medication guidelines before your arrival.',
  },
  {
    question: 'What happens if I need to cancel my trip?',
    answer:
      'Cancellation policies vary depending on how far in advance you cancel. Cancellations more than 90 days before departure receive a full refund minus a processing fee. Cancellations between 60-90 days receive 50% refund. Cancellations within 60 days are non-refundable. We strongly recommend purchasing travel insurance.',
  },
];

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState<'contact' | 'tickets'>('contact');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    message: '',
    priority: 'NORMAL' as TicketPriority,
    category: 'GENERAL_INQUIRY' as TicketCategory,
  });
  const [formErrors, setFormErrors] = useState<{
    message?: string;
  }>({});

  // tRPC queries
  const { data: tickets = [], refetch } = trpc.support.list.useQuery();
  const { data: counts } = trpc.support.getCounts.useQuery();
  const { data: selectedTicket, isLoading: isLoadingTicket } =
    trpc.support.getById.useQuery(
      { id: selectedTicketId! },
      { enabled: !!selectedTicketId }
    );

  // tRPC mutations
  const createTicket = trpc.support.create.useMutation({
    onSuccess: (data) => {
      refetch();
      setFormData({ message: '', priority: 'NORMAL', category: 'GENERAL_INQUIRY' });
      setActiveTab('tickets');
      toast.success(
        <div>
          <p className="font-medium">Support ticket submitted!</p>
          <p className="text-sm mt-1">
            Reference: <code className="font-mono font-bold">{data.referenceNumber}</code>
          </p>
          <p className="text-xs mt-1 text-gray-500">We&apos;ll respond within 24 hours.</p>
        </div>,
        {
          duration: 8000,
        }
      );
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to submit ticket. Please try again.');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    const errors: typeof formErrors = {};
    if (formData.message.length < 20) {
      errors.message = 'Message must be at least 20 characters';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});

    try {
      await createTicket.mutateAsync(formData);
    } catch (error) {
      console.error('Failed to submit ticket:', error);
    }
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const copyReferenceNumber = (refNumber: string) => {
    navigator.clipboard.writeText(refNumber);
    toast.success('Reference number copied!');
  };

  // Ticket Detail View
  if (selectedTicketId && selectedTicket) {
    const StatusIcon = STATUS_CONFIG[selectedTicket.status].icon;
    return (
      <div className="space-y-6">
        {/* Back Button */}
        <button
          onClick={() => setSelectedTicketId(null)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to tickets
        </button>

        {/* Ticket Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  {selectedTicket.subject}
                </h1>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <button
                  onClick={() => copyReferenceNumber(selectedTicket.referenceNumber)}
                  className="flex items-center gap-1 hover:text-gray-700"
                  title="Copy reference number"
                >
                  <Tag className="h-4 w-4" />
                  <code className="font-mono">{selectedTicket.referenceNumber}</code>
                  <Copy className="h-3 w-3" />
                </button>
                <span>•</span>
                <span>{formatDate(selectedTicket.createdAt)}</span>
              </div>
            </div>
            <div className="flex flex-col gap-2 items-end">
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${STATUS_CONFIG[selectedTicket.status].color}`}
              >
                <StatusIcon className="h-4 w-4" />
                {STATUS_CONFIG[selectedTicket.status].label}
              </div>
              <div
                className={`px-3 py-1.5 rounded-full text-sm font-medium ${PRIORITY_CONFIG[selectedTicket.priority].color}`}
              >
                {PRIORITY_CONFIG[selectedTicket.priority].label} Priority
              </div>
            </div>
          </div>
        </div>

        {/* Original Message */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Your Message</h2>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-700 whitespace-pre-wrap">{selectedTicket.message}</p>
          </div>
          {selectedTicket.booking && (
            <div className="mt-4 text-sm text-gray-500">
              <span className="font-medium">Linked Booking:</span> Created{' '}
              {formatDate(selectedTicket.booking.createdAt)} (
              {selectedTicket.booking.status})
            </div>
          )}
        </div>

        {/* Replies */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="font-semibold text-gray-900 mb-4">
            Conversation ({selectedTicket.replies?.length || 0})
          </h2>
          {selectedTicket.replies && selectedTicket.replies.length > 0 ? (
            <div className="space-y-4">
              {selectedTicket.replies.map((reply) => (
                <div
                  key={reply.id}
                  className={`p-4 rounded-lg ${
                    reply.isAdminReply
                      ? 'bg-blue-50 border border-blue-100'
                      : 'bg-gray-50 border border-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">
                      {reply.isAdminReply
                        ? 'Support Team'
                        : reply.user
                          ? `${reply.user.firstName || ''} ${reply.user.lastName || ''}`.trim() || 'You'
                          : 'You'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(reply.createdAt)}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm whitespace-pre-wrap">
                    {reply.message}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="h-10 w-10 mx-auto text-gray-300 mb-3" />
              <p>No replies yet</p>
              <p className="text-sm">
                Our support team will respond within 24 hours.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Loading state for ticket detail
  if (selectedTicketId && isLoadingTicket) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Support & Help</h1>
        <p className="mt-2 text-gray-600">
          Get help with your booking or contact our support team
        </p>
      </div>

      {/* Stats */}
      {counts && counts.total > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Total Tickets</div>
            <div className="text-2xl font-bold text-gray-900">{counts.total}</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg shadow">
            <div className="text-sm text-yellow-800">Open</div>
            <div className="text-2xl font-bold text-yellow-900">{counts.open}</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg shadow">
            <div className="text-sm text-blue-800">In Progress</div>
            <div className="text-2xl font-bold text-blue-900">
              {counts.inProgress}
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg shadow">
            <div className="text-sm text-green-800">Resolved</div>
            <div className="text-2xl font-bold text-green-900">
              {counts.resolved}
            </div>
          </div>
        </div>
      )}

      {/* Contact Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Email Us</h3>
          <p className="text-sm text-gray-600 mb-3">
            hello@pickleballpassport.com
          </p>
          <p className="text-xs text-gray-500">Response within 24 hours</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow text-center">
          <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Phone className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Call Us</h3>
          <p className="text-sm text-gray-600 mb-3">+1 (555) 123-4567</p>
          <p className="text-xs text-gray-500">Mon-Fri, 9am-5pm EST</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow text-center">
          <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Live Chat</h3>
          <p className="text-sm text-gray-600 mb-3">Coming Soon</p>
          <p className="text-xs text-gray-500">Real-time assistance</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b">
          <div className="flex gap-4 p-6">
            <button
              onClick={() => setActiveTab('contact')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'contact'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Contact Support
            </button>
            <button
              onClick={() => setActiveTab('tickets')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'tickets'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              My Tickets ({tickets.length})
            </button>
          </div>
        </div>

        {/* Contact Form */}
        {activeTab === 'contact' && (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Category */}
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Category <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category: e.target.value as TicketCategory,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                aria-required="true"
              >
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label
                htmlFor="priority"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Priority
              </label>
              <select
                id="priority"
                value={formData.priority}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    priority: e.target.value as TicketPriority,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="NORMAL">Normal - Standard support</option>
                <option value="URGENT">Urgent - Critical issue</option>
              </select>
              <p className="mt-1 text-sm text-gray-500">
                Select Urgent only for time-sensitive issues
              </p>
            </div>

            {/* Message */}
            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                id="message"
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                rows={6}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  formErrors.message ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Please provide details about your question or issue..."
                aria-required="true"
                aria-invalid={formErrors.message ? 'true' : 'false'}
                aria-describedby={formErrors.message ? 'message-error' : undefined}
              />
              {formErrors.message && (
                <p id="message-error" className="mt-1 text-sm text-red-600" role="alert">
                  {formErrors.message}
                </p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Minimum 20 characters ({formData.message.length}/20)
              </p>
            </div>

            {/* Auto-link note */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Your ticket will automatically be linked to your
                most recent booking (if any) to help our team assist you faster.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={createTicket.isPending}
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createTicket.isPending ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  Submit Ticket
                </>
              )}
            </button>
          </form>
        )}

        {/* Ticket History */}
        {activeTab === 'tickets' && (
          <div className="p-6">
            {tickets.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600">No support tickets yet</p>
                <p className="text-sm text-gray-500 mt-1">
                  Submit a ticket to get help from our support team
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {tickets.map((ticket) => {
                  const StatusIcon = STATUS_CONFIG[ticket.status].icon;
                  return (
                    <button
                      key={ticket.id}
                      onClick={() => setSelectedTicketId(ticket.id)}
                      className="w-full text-left border rounded-lg p-4 hover:bg-gray-50 hover:border-blue-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-gray-900 truncate">
                              {ticket.subject}
                            </h3>
                            <code className="text-xs text-gray-500 font-mono">
                              {ticket.referenceNumber}
                            </code>
                          </div>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {ticket.message}
                          </p>
                          <div className="flex items-center gap-3 mt-3 text-sm text-gray-500">
                            <span>{formatDate(ticket.createdAt)}</span>
                            <span className="text-blue-600 text-xs">
                              Click to view details →
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 items-end flex-shrink-0">
                          <div
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_CONFIG[ticket.status].color}`}
                          >
                            <StatusIcon className="h-3.5 w-3.5" />
                            {STATUS_CONFIG[ticket.status].label}
                          </div>
                          <div
                            className={`px-2.5 py-1 rounded-full text-xs font-medium ${PRIORITY_CONFIG[ticket.priority].color}`}
                          >
                            {PRIORITY_CONFIG[ticket.priority].label}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* FAQ Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-3 mb-6">
          <HelpCircle className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item, index) => (
            <div key={index} className="border rounded-lg">
              <button
                onClick={() =>
                  setExpandedFaq(expandedFaq === index ? null : index)
                }
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-gray-900">{item.question}</span>
                {expandedFaq === index ? (
                  <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
                )}
              </button>
              {expandedFaq === index && (
                <div className="px-4 pb-4 text-sm text-gray-600">
                  {item.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
