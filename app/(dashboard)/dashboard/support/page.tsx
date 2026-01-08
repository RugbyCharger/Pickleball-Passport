'use client';

/**
 * Support & Help Center
 * E5-S8: Support & Help Center (3 pts)
 *
 * Features:
 * - Contact form with validation
 * - Email integration via SendGrid (placeholder)
 * - FAQ section (static content)
 * - Chat widget placeholder
 * - Support ticket history
 * - Response tracking
 */

import { useState } from 'react';
import type { ComponentType } from 'react';
import { trpc } from '@/lib/trpc/client';
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
} from 'lucide-react';

type TicketPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

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
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    priority: 'NORMAL' as TicketPriority,
  });
  const [formErrors, setFormErrors] = useState<{
    subject?: string;
    message?: string;
  }>({});

  // tRPC queries
  const { data: tickets = [], refetch } = trpc.support.list.useQuery();
  const { data: counts } = trpc.support.getCounts.useQuery();

  // tRPC mutations
  const createTicket = trpc.support.create.useMutation({
    onSuccess: () => {
      refetch();
      setFormData({ subject: '', message: '', priority: 'NORMAL' });
      setActiveTab('tickets');
      alert('Support ticket submitted successfully! We\'ll respond within 24 hours.');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    const errors: typeof formErrors = {};
    if (formData.subject.length < 5) {
      errors.subject = 'Subject must be at least 5 characters';
    }
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
      alert('Failed to submit ticket. Please try again.');
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
            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  formErrors.subject ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Brief description of your issue"
              />
              {formErrors.subject && (
                <p className="mt-1 text-sm text-red-600">{formErrors.subject}</p>
              )}
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    priority: e.target.value as TicketPriority,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="LOW">Low - General inquiry</option>
                <option value="NORMAL">Normal - Standard support</option>
                <option value="HIGH">High - Important issue</option>
                <option value="URGENT">Urgent - Critical issue</option>
              </select>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                rows={6}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  formErrors.message ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Please provide details about your question or issue..."
              />
              {formErrors.message && (
                <p className="mt-1 text-sm text-red-600">{formErrors.message}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Minimum 20 characters ({formData.message.length}/20)
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={createTicket.isPending}
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {createTicket.isPending ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
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
                    <div
                      key={ticket.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">
                            {ticket.subject}
                          </h3>
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                            {ticket.message}
                          </p>
                          <div className="flex items-center gap-3 mt-3 text-sm text-gray-500">
                            <span>{formatDate(ticket.createdAt)}</span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 items-end">
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
                    </div>
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
