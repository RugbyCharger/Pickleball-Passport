'use client'

/**
 * Partner Notification Bell Component
 * E11-S9: Partner Notification System
 *
 * Displays notification bell icon with unread count badge for partners
 * Clicking navigates to partner notifications page
 */

import { Bell } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function PartnerNotificationBell() {
  const router = useRouter()
  const { data: counts, refetch } = trpc.notification.getCounts.useQuery(undefined, {
    refetchInterval: 30000, // Poll every 30 seconds for new notifications
  })

  const unreadCount = counts?.unread ?? 0
  const hasUnread = unreadCount > 0

  const handleClick = () => {
    router.push('/partners/notifications')
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative"
      onClick={handleClick}
      aria-label={`Partner notifications${hasUnread ? ` (${unreadCount} unread)` : ''}`}
    >
      <Bell className={cn('h-5 w-5', hasUnread && 'text-primary')} />
      {hasUnread && (
        <span
          className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white"
          aria-label={`${unreadCount} unread notifications`}
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Button>
  )
}
