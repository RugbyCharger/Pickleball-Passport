'use client'

/**
 * Gift State Timeline Component (GS-007)
 *
 * Displays the state transition history of a gift booking.
 * Shows timeline with state, timestamp, and reason for each transition.
 * Includes expiration countdown for SENT gifts.
 */

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Clock,
  Gift,
  CheckCircle,
  XCircle,
  Send,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { GiftState } from '@prisma/client'
import { formatDistanceToNow, format, differenceInDays } from 'date-fns'

interface StateTransition {
  fromState: GiftState
  toState: GiftState
  reason: string
  createdAt: string
}

interface GiftStateTimelineProps {
  currentState: GiftState | string
  expiresAt?: string | null
  stateHistory: StateTransition[]
  showFullHistory?: boolean
  isAdmin?: boolean
}

/**
 * Get icon for a gift state
 */
function getStateIcon(state: GiftState | string) {
  switch (state) {
    case 'PENDING':
      return <Clock className="h-4 w-4" />
    case 'SENT':
      return <Send className="h-4 w-4" />
    case 'ACCEPTED':
      return <CheckCircle className="h-4 w-4" />
    case 'DECLINED':
      return <XCircle className="h-4 w-4" />
    case 'EXPIRED':
      return <AlertTriangle className="h-4 w-4" />
    default:
      return <Gift className="h-4 w-4" />
  }
}

/**
 * Get color classes for a gift state
 */
function getStateColor(state: GiftState | string): string {
  switch (state) {
    case 'PENDING':
      return 'text-gray-600 bg-gray-100 border-gray-300'
    case 'SENT':
      return 'text-blue-600 bg-blue-100 border-blue-300'
    case 'ACCEPTED':
      return 'text-green-600 bg-green-100 border-green-300'
    case 'DECLINED':
      return 'text-red-600 bg-red-100 border-red-300'
    case 'EXPIRED':
      return 'text-amber-600 bg-amber-100 border-amber-300'
    default:
      return 'text-gray-600 bg-gray-100 border-gray-300'
  }
}

/**
 * Get human-readable state label
 */
function getStateLabel(state: GiftState | string): string {
  switch (state) {
    case 'PENDING':
      return 'Pending'
    case 'SENT':
      return 'Sent to Recipient'
    case 'ACCEPTED':
      return 'Accepted'
    case 'DECLINED':
      return 'Declined'
    case 'EXPIRED':
      return 'Expired'
    default:
      return state
  }
}

/**
 * Calculate days until expiration
 */
function getDaysUntilExpiration(expiresAt: string): {
  days: number
  isExpired: boolean
  urgency: 'normal' | 'warning' | 'critical'
} {
  const expirationDate = new Date(expiresAt)
  const now = new Date()
  const days = differenceInDays(expirationDate, now)

  return {
    days,
    isExpired: days < 0,
    urgency: days <= 3 ? 'critical' : days <= 7 ? 'warning' : 'normal',
  }
}

export function GiftStateTimeline({
  currentState,
  expiresAt,
  stateHistory,
  showFullHistory = false,
  isAdmin = false,
}: GiftStateTimelineProps) {
  const [expanded, setExpanded] = useState(showFullHistory || isAdmin)

  // Calculate expiration info if applicable
  const expirationInfo =
    currentState === 'SENT' && expiresAt ? getDaysUntilExpiration(expiresAt) : null

  // Limit visible history for non-admin users
  const visibleHistory = expanded ? stateHistory : stateHistory.slice(0, 3)

  return (
    <Card className="border-purple-200 bg-purple-50/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Gift className="h-5 w-5 text-purple-600" />
            Gift Status
          </CardTitle>
          <Badge className={`${getStateColor(currentState)} font-medium`}>
            {getStateIcon(currentState)}
            <span className="ml-1">{getStateLabel(currentState)}</span>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Expiration Countdown (for SENT gifts) */}
        {expirationInfo && !expirationInfo.isExpired && (
          <div
            className={`rounded-lg p-3 flex items-center gap-3 ${
              expirationInfo.urgency === 'critical'
                ? 'bg-red-100 text-red-800 border border-red-200'
                : expirationInfo.urgency === 'warning'
                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                  : 'bg-blue-50 text-blue-800 border border-blue-200'
            }`}
          >
            <Clock className="h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-medium">
                {expirationInfo.days === 0
                  ? 'Expires today!'
                  : expirationInfo.days === 1
                    ? 'Expires tomorrow'
                    : `Expires in ${expirationInfo.days} days`}
              </p>
              <p className="text-sm opacity-80">
                Gift must be accepted by {format(new Date(expiresAt!), 'MMMM d, yyyy')}
              </p>
            </div>
          </div>
        )}

        {/* State History Timeline */}
        {stateHistory.length > 0 ? (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Activity Timeline</h4>
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-3 top-3 bottom-3 w-0.5 bg-gray-200" />

              {/* Timeline items */}
              <div className="space-y-4">
                {visibleHistory.map((transition, index) => (
                  <div key={index} className="relative flex items-start gap-3 pl-8">
                    {/* Timeline dot */}
                    <div
                      className={`absolute left-0 w-6 h-6 rounded-full flex items-center justify-center border-2 ${getStateColor(transition.toState)}`}
                    >
                      {getStateIcon(transition.toState)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-gray-900">
                          {getStateLabel(transition.toState)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(transition.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-0.5">{transition.reason}</p>
                      {isAdmin && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {format(new Date(transition.createdAt), 'MMM d, yyyy h:mm a')}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Show more/less button */}
            {stateHistory.length > 3 && !isAdmin && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpanded(!expanded)}
                className="w-full text-purple-600 hover:text-purple-800"
              >
                {expanded ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-1" />
                    Show less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-1" />
                    Show all {stateHistory.length} updates
                  </>
                )}
              </Button>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-2">No activity recorded yet</p>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Simple inline gift status badge with expiration
 * For use in lists/tables
 */
export function GiftStatusBadge({
  currentState,
  expiresAt,
}: {
  currentState: GiftState | string
  expiresAt?: string | null
}) {
  const expirationInfo =
    currentState === 'SENT' && expiresAt ? getDaysUntilExpiration(expiresAt) : null

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Badge className={`${getStateColor(currentState)}`}>
        {getStateIcon(currentState)}
        <span className="ml-1">{getStateLabel(currentState)}</span>
      </Badge>

      {expirationInfo && !expirationInfo.isExpired && (
        <span
          className={`text-xs font-medium ${
            expirationInfo.urgency === 'critical'
              ? 'text-red-600'
              : expirationInfo.urgency === 'warning'
                ? 'text-amber-600'
                : 'text-gray-500'
          }`}
        >
          {expirationInfo.days === 0
            ? 'Expires today!'
            : `${expirationInfo.days}d left`}
        </span>
      )}
    </div>
  )
}
