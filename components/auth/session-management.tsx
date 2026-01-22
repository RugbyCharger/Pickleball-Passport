/**
 * Session Management Component
 *
 * Story 2-8: Session Management
 *
 * Features:
 * - Display active sessions across devices
 * - Sign out from all devices option
 * - Session expiry information
 * - Clerk handles secure cookie-based sessions automatically
 */

'use client'

import { useState } from 'react'
import { useClerk, useSession, useSessionList } from '@clerk/nextjs'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  Monitor,
  Clock,
  LogOut,
  Shield,
  Loader2,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react'

export function SessionManagement() {
  const { signOut } = useClerk()
  const { session: currentSession } = useSession()
  const { sessions, isLoaded } = useSessionList()
  const [showSignOutAllDialog, setShowSignOutAllDialog] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [signingOutSessionId, setSigningOutSessionId] = useState<string | null>(null)

  const handleSignOutAll = async () => {
    setIsSigningOut(true)
    try {
      // Sign out from current session (which signs out everywhere)
      await signOut()
      toast.success('Signed out from all devices')
      // User will be redirected to sign-in page
    } catch (error) {
      toast.error('Failed to sign out from all devices')
      setIsSigningOut(false)
    }
  }

  const handleRevokeSession = async (sessionId: string) => {
    setSigningOutSessionId(sessionId)
    try {
      // Use signOut with sessionId to revoke a specific session
      await signOut({ sessionId })
      toast.success('Session revoked successfully')
    } catch (error) {
      toast.error('Failed to revoke session')
    } finally {
      setSigningOutSessionId(null)
    }
  }

  if (!isLoaded) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Active Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const activeSessions = sessions?.filter(s => s.status === 'active') || []

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Active Sessions
            </CardTitle>
            <CardDescription>
              Manage your active sessions across devices
            </CardDescription>
          </div>
          {activeSessions.length > 1 && (
            <Dialog open={showSignOutAllDialog} onOpenChange={setShowSignOutAllDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out All Devices
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Sign Out from All Devices</DialogTitle>
                  <DialogDescription>
                    This will sign you out from all devices and sessions, including this one.
                    You will need to sign in again to access your account.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowSignOutAllDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleSignOutAll}
                    disabled={isSigningOut}
                  >
                    {isSigningOut ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Signing Out...
                      </>
                    ) : (
                      'Sign Out All Devices'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Session Info */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Shield className="h-4 w-4 text-green-600" />
            <span className="font-medium">Session Security</span>
          </div>
          <ul className="text-sm text-muted-foreground space-y-1 ml-6">
            <li>Sessions are stored securely using HTTP-only cookies</li>
            <li>Sessions expire after 7 days of inactivity</li>
            <li>Extended sessions (Remember me) last up to 30 days</li>
            <li>Multiple concurrent sessions are supported</li>
          </ul>
        </div>

        {/* Active Sessions List */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Your Active Sessions ({activeSessions.length})</h4>

          {activeSessions.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No active sessions found
            </div>
          ) : (
            <div className="space-y-2">
              {activeSessions.map((session) => {
                const isCurrentSession = session.id === currentSession?.id

                return (
                  <div
                    key={session.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      isCurrentSession ? 'border-primary bg-primary/5' : 'bg-background'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isCurrentSession ? 'bg-primary/10' : 'bg-muted'}`}>
                        <Monitor className={`h-5 w-5 ${isCurrentSession ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            Session
                          </span>
                          {isCurrentSession && (
                            <Badge variant="default" className="text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Current
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>
                            Last active: {session.lastActiveAt ? new Date(session.lastActiveAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            }) : 'Unknown'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {!isCurrentSession && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRevokeSession(session.id)}
                        disabled={signingOutSessionId === session.id}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        {signingOutSessionId === session.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <LogOut className="h-4 w-4 mr-1" />
                            Revoke
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Security Tip */}
        <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-amber-800 dark:text-amber-200">Security Tip</p>
            <p className="text-amber-700 dark:text-amber-300">
              If you notice any unfamiliar sessions, revoke them immediately and consider changing your password.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
