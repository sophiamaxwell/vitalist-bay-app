'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface AuthGuardProps {
  children: React.ReactNode
  requiredRoles?: Array<'ADMIN' | 'ORGANIZER' | 'SPEAKER' | 'EXHIBITOR' | 'ATTENDEE'>
  fallback?: React.ReactNode
}

/**
 * Client-side auth guard for protecting components
 * For page-level protection, use middleware or requireAuth() in Server Components
 */
export function AuthGuard({ 
  children, 
  requiredRoles,
  fallback,
}: AuthGuardProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (!session?.user) {
      router.push('/login')
      return
    }

    if (requiredRoles && !requiredRoles.includes(session.user.role)) {
      router.push('/dashboard')
    }
  }, [session, status, requiredRoles, router])

  // Loading state
  if (status === 'loading') {
    return fallback ?? (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
      </div>
    )
  }

  // Not authenticated
  if (!session?.user) {
    return fallback ?? null
  }

  // Role check failed
  if (requiredRoles && !requiredRoles.includes(session.user.role)) {
    return fallback ?? null
  }

  return <>{children}</>
}
